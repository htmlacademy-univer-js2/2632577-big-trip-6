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
    } catch (err) {
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
    const loadingView = new LoadingView();
    render(loadingView, this.#tripEventsContainer);
  }

  #renderError() {
    const errorView = new ErrorLoadView();
    render(errorView, this.#tripEventsContainer);
  }

  #renderSort() {
    if (this.#sortComponent) {
      this.#sortComponent.element.remove();
    }
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
    const allPoints = this.#tripModel.getPoints();
    const activeFilter = this.#filterModel.getFilter();
    let filteredPoints = this.#tripModel.getPointsFilteredBy(activeFilter, allPoints);
    const sortedPoints = this.#tripModel.getPointsSortedBy(this.#currentSortType, filteredPoints);
    this.#clearPointsList();

    if (sortedPoints.length === 0) {
      const emptyView = new EmptyListView(activeFilter);
      render(emptyView, this.#listContainer);
      return;
    }

    sortedPoints.forEach(point => {
      const destination = this.#tripModel.getDestinationById(point.destination);
      const offers = this.#tripModel.getOffersByIds(point.offers);
      const allOffersByType = this.#tripModel.getOffersByType(point.type);
      const pointPresenter = new PointPresenter(
        this.#listContainer,
        this.#handlePointDataChange.bind(this),
        this.#handleModeChange.bind(this),
        this.#tripModel.getOffersByType.bind(this.#tripModel),
        this.#tripModel.getDestinationByName.bind(this.#tripModel),
        this.#handlePointDelete.bind(this)
      );
      pointPresenter.init(point, destination, offers, allOffersByType);
      this.#pointPresenters.set(point.id, pointPresenter);
    });
  }

  #clearPointsList() {
    this.#pointPresenters.forEach(presenter => presenter.destroy());
    this.#pointPresenters.clear();
    this.#activePointPresenter = null;
    while (this.#listContainer.firstChild) {
      this.#listContainer.removeChild(this.#listContainer.firstChild);
    }
  }

  #handlePointDataChange = async (updatedPoint) => {
    await this.#tripModel.updatePoint(updatedPoint);
  };

  #handlePointDelete = async (pointId) => {
    await this.#tripModel.deletePoint(pointId);
  };

  #handleModeChange = (activePresenter) => {
    this.#pointPresenters.forEach(presenter => {
      if (presenter !== activePresenter) {
        presenter.resetView();
      }
    });
    this.#activePointPresenter = activePresenter;
  };

  #renderCreateForm() {
    const destinations = this.#tripModel.getDestinations();
    const allOffers = this.#tripModel.getOffers();
    this.#createFormComponent = new PointFormView(destinations, allOffers);
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
    if (this.#activePointPresenter) {
      this.#activePointPresenter.resetView();
    }
    this.#filterModel.setFilter('everything');
    this.#currentSortType = 'day';
    this.#renderSort();

    this.#createFormComponent.element.style.display = '';
    this.#isCreateFormShown = true;

    this.#createFormComponent.setSubmitHandler(async (newPoint) => {
      this.#createFormComponent.setSavingState(true);
      try {
        await this.#tripModel.addPoint(newPoint);
        this.#hideCreateForm();
      } catch (error) {
        this.#createFormComponent.shake();
      } finally {
        this.#createFormComponent.setSavingState(false);
      }
    });
    this.#createFormComponent.setCloseHandler(() => this.#hideCreateForm());
    this.#createFormComponent.setEscKeydownHandler(() => this.#hideCreateForm());
  }

  #hideCreateForm() {
    this.#createFormComponent.element.style.display = 'none';
    this.#isCreateFormShown = false;
  }
}
