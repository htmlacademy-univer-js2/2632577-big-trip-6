import SortView from '../view/sort-view.js';
import PointFormView from '../view/point-form-view.js';
import EmptyListView from '../view/empty-list-view.js';
import LoadingView from '../view/loading-view.js';
import ErrorLoadView from '../view/error-load-view.js';
import PointPresenter from './point-presenter.js';
import { render } from '../framework/render.js';

export default class TripPresenter {
  #tripModel = null;
  #filterModel = null;
  #filtersContainer = null;
  #tripEventsContainer = null;
  #tripMain = null;
  #newEventButton = null;
  #listContainer = null;
  #sortComponent = null;
  #pointPresenters = new Map();
  #activePointPresenter = null;
  #createFormComponent = null;
  #isCreateFormShown = false;
  #currentSortType = 'day';
  #isLoading = true;
  #isError = false;

  constructor(tripModel, filterModel) {
    this.#tripModel = tripModel;
    this.#filterModel = filterModel;
    this.#filtersContainer = document.querySelector('.trip-controls__filters');
    this.#tripEventsContainer = document.querySelector('.trip-events');
    this.#tripMain = document.querySelector('.trip-main');
    this.#newEventButton = this.#tripMain?.querySelector('.trip-main__event-add-btn');

    this.#tripModel.addObserver(() => this.#renderPoints());
    this.#filterModel.addObserver(() => this.#handleFilterChange());
  }

  async init() {
    this.#renderLoading();
    try {
      await this.#tripModel.init();
      this.#isLoading = false;
      this.#isError = false;
    } catch {
      this.#isLoading = false;
      this.#isError = true;
      this.#renderError();
      return;
    }
    this.#renderSort();
    this.#listContainer = document.createElement('ul');
    this.#listContainer.className = 'trip-events__list';
    this.#tripEventsContainer.appendChild(this.#listContainer);
    this.#renderPoints();
    this.#renderCreateForm();
  }

  #renderLoading() {
    const loading = new LoadingView();
    render(loading, this.#tripEventsContainer);
  }

  #renderError() {
    const error = new ErrorLoadView();
    render(error, this.#tripEventsContainer);
  }

  #renderSort() {
    if (this.#sortComponent) this.#sortComponent.element.remove();
    this.#sortComponent = new SortView(this.#handleSortTypeChange.bind(this));
    this.#tripEventsContainer.prepend(this.#sortComponent.element);
  }

  #handleSortTypeChange(sortType) {
    if (this.#currentSortType === sortType) return;
    this.#currentSortType = sortType;
    this.#renderPoints();
  }

  #handleFilterChange() {
    this.#currentSortType = 'day';
    this.#renderSort();
    this.#renderPoints();
  }

  #renderPoints() {
    const all = this.#tripModel.getPoints();
    const filtered = this.#tripModel.getPointsFilteredBy(this.#filterModel.getFilter(), all);
    const sorted = this.#tripModel.getPointsSortedBy(this.#currentSortType, filtered);
    this.#clearPointsList();
    if (sorted.length === 0) {
      const empty = new EmptyListView(this.#filterModel.getFilter());
      render(empty, this.#listContainer);
      return;
    }
    sorted.forEach(point => {
      const dest = this.#tripModel.getDestinationById(point.destination);
      const offers = this.#tripModel.getOffersByIds(point.offers);
      const allOffersByType = this.#tripModel.getOffersByType(point.type);
      const presenter = new PointPresenter(
        this.#listContainer,
        this.#handlePointDataChange.bind(this),
        this.#handleModeChange.bind(this),
        this.#tripModel.getOffersByType.bind(this.#tripModel),
        this.#tripModel.getDestinationByName.bind(this.#tripModel),
        this.#handlePointDelete.bind(this)
      );
      presenter.init(point, dest, offers, allOffersByType);
      this.#pointPresenters.set(point.id, presenter);
    });
  }

  #clearPointsList() {
    this.#pointPresenters.forEach(p => p.destroy());
    this.#pointPresenters.clear();
    this.#activePointPresenter = null;
    while (this.#listContainer.firstChild) this.#listContainer.removeChild(this.#listContainer.firstChild);
  }

  #handlePointDataChange = async (updated) => {
    await this.#tripModel.updatePoint(updated);
  };

  #handlePointDelete = async (id) => {
    await this.#tripModel.deletePoint(id);
  };

  #handleModeChange = (active) => {
    this.#pointPresenters.forEach(p => { if (p !== active) p.resetView(); });
    this.#activePointPresenter = active;
  };

  #renderCreateForm() {
    this.#createFormComponent = new PointFormView(
      this.#tripModel.getDestinations(),
      this.#tripModel.getOffers()
    );
    if (this.#newEventButton) {
      this.#newEventButton.insertAdjacentElement('afterend', this.#createFormComponent.element);
      this.#createFormComponent.element.style.display = 'none';
    } else {
      render(this.#createFormComponent, this.#tripMain);
      this.#createFormComponent.element.style.display = 'none';
    }
    this.#newEventButton?.addEventListener('click', () => this.#showCreateForm());
  }

  #showCreateForm() {
    if (this.#isCreateFormShown) return;
    if (this.#activePointPresenter) this.#activePointPresenter.resetView();
    this.#filterModel.setFilter('everything');
    this.#currentSortType = 'day';
    this.#renderSort();
    this.#createFormComponent.element.style.display = '';
    this.#isCreateFormShown = true;
    this.#createFormComponent.setSubmitHandler(async (newPoint) => {
      await this.#tripModel.addPoint(newPoint);
      this.#hideCreateForm();
    });
    this.#createFormComponent.setCloseHandler(() => this.#hideCreateForm());
    this.#createFormComponent.setEscKeydownHandler(() => this.#hideCreateForm());
  }

  #hideCreateForm() {
    this.#createFormComponent.element.style.display = 'none';
    this.#isCreateFormShown = false;
  }
}
