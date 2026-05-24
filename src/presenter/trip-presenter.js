import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import PointFormView from '../view/point-form-view.js';
import EmptyListView from '../view/empty-list-view.js';
import PointPresenter from './point-presenter.js';
import { render } from '../framework/render.js';

export default class TripPresenter {
  #model = null;
  #filtersContainer = null;
  #tripEventsContainer = null;
  #tripMain = null;
  #newEventButton = null;
  #listContainer = null;

  #filterComponent = null;
  #sortComponent = null;
  #emptyListComponent = null;
  #pointPresenters = new Map();
  #activePointPresenter = null;

  #createFormComponent = null;
  #isCreateFormShown = false;

  #currentSortType = 'day';

  constructor(model) {
    this.#model = model;
    this.#filtersContainer = document.querySelector('.trip-controls__filters');
    this.#tripEventsContainer = document.querySelector('.trip-events');
    this.#tripMain = document.querySelector('.trip-main');
    this.#newEventButton = this.#tripMain?.querySelector('.trip-main__event-add-btn');
  }

  init() {
    this.#renderFilters();
    this.#renderSort();
    this.#listContainer = document.createElement('ul');
    this.#listContainer.className = 'trip-events__list';
    this.#tripEventsContainer.appendChild(this.#listContainer);
    this.#renderPoints();
    this.#renderCreateForm();
  }

  #renderFilters() {
    const points = this.#model.getPoints();
    const filters = this.#model.getFilters(points);
    this.#filterComponent = new FilterView(filters);
    render(this.#filterComponent, this.#filtersContainer);
  }

  #renderSort() {
    this.#sortComponent = new SortView(this.#handleSortTypeChange.bind(this));
    this.#tripEventsContainer.prepend(this.#sortComponent.element);
  }

  #handleSortTypeChange(sortType) {
    if (this.#currentSortType === sortType) return;
    this.#currentSortType = sortType;
    this.#renderPoints();
  }

  #renderPoints() {
    const points = this.#model.getPoints();
    const sortedPoints = this.#model.getPointsSortedBy(this.#currentSortType, points);
    this.#clearPointsList();

    if (sortedPoints.length === 0) {
      this.#emptyListComponent = new EmptyListView(this.#getCurrentFilter());
      render(this.#emptyListComponent, this.#listContainer);
      return;
    }

    sortedPoints.forEach(point => {
      const destination = this.#model.getDestinationById(point.destinationId);
      const offers = this.#model.getOffersByIds(point.offersIds);
      const allOffersByType = this.#model.getOffersByType(point.type);
      const pointPresenter = new PointPresenter(
        this.#listContainer,
        this.#handlePointDataChange.bind(this),
        this.#handleModeChange.bind(this)
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
    if (this.#emptyListComponent) {
      this.#emptyListComponent.removeElement();
      this.#emptyListComponent = null;
    }
  }

  #handlePointDataChange(updatedPoint) {
    this.#model.updatePoint(updatedPoint);
    const pointPresenter = this.#pointPresenters.get(updatedPoint.id);
    const destination = this.#model.getDestinationById(updatedPoint.destinationId);
    const offers = this.#model.getOffersByIds(updatedPoint.offersIds);
    const allOffersByType = this.#model.getOffersByType(updatedPoint.type);
    pointPresenter.init(updatedPoint, destination, offers, allOffersByType);
  }

  #handleModeChange(activePresenter) {
    this.#pointPresenters.forEach(presenter => {
      if (presenter !== activePresenter) {
        presenter.resetView();
      }
    });
    this.#activePointPresenter = activePresenter;
  }

  #renderCreateForm() {
    this.#createFormComponent = new PointFormView();
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
    if (this.#activePointPresenter) {
      this.#activePointPresenter.resetView();
    }
    this.#createFormComponent.element.style.display = '';
    this.#isCreateFormShown = true;
    this.#createFormComponent.setSubmitHandler(() => this.#onCreateFormSubmit());
    this.#createFormComponent.setCloseHandler(() => this.#hideCreateForm());
    this.#createFormComponent.setEscKeydownHandler(() => this.#hideCreateForm());
  }

  #hideCreateForm() {
    this.#createFormComponent.element.style.display = 'none';
    this.#isCreateFormShown = false;
  }

  #onCreateFormSubmit() {
    this.#hideCreateForm();
    this.#renderPoints();
  }

  #getCurrentFilter() {
    return 'everything';
  }
}
