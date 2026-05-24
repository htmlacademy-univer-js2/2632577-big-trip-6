import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import PointFormView from '../view/point-form-view.js';
import EditFormView from '../view/edit-form-view.js';
import PointItemView from '../view/point-item-view.js';
import EmptyListView from '../view/empty-list-view.js';
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

  #pointComponents = new Map(); 
  #activeEditForm = null; 
  #activeEditFormPointId = null;

  #createFormComponent = null;
  #isCreateFormShown = false;

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

    this.#renderPointsList();

    this.#createFormComponent = new PointFormView();
    if (this.#newEventButton) {
      this.#newEventButton.insertAdjacentElement('afterend', this.#createFormComponent.element);
      this.#createFormComponent.element.style.display = 'none';
    } else {
      render(this.#createFormComponent, this.#tripMain);
      this.#createFormComponent.element.style.display = 'none';
    }

    this.#newEventButton?.addEventListener('click', () => {
      this.#showCreateForm();
    });
  }

  #renderFilters() {
    const points = this.#model.getPoints();
    const filters = this.#model.getFilters(points);
    this.#filterComponent = new FilterView(filters);
    render(this.#filterComponent, this.#filtersContainer);
  }

  #renderSort() {
    this.#sortComponent = new SortView();
    this.#tripEventsContainer.prepend(this.#sortComponent.element);
  }

  #renderPointsList() {
    const points = this.#model.getPoints();
    this.#clearPointsList();

    if (points.length === 0) {
      const currentFilter = this.#getCurrentFilter();
      this.#emptyListComponent = new EmptyListView(currentFilter);
      render(this.#emptyListComponent, this.#listContainer);
      return;
    }

    points.forEach(point => {
      this.#renderPoint(point);
    });
  }

  #renderPoint(point) {
    const destination = this.#model.getDestinationById(point.destinationId);
    const offers = this.#model.getOffersByIds(point.offersIds);
    const pointView = new PointItemView(point, destination, offers);

    pointView.setEditClickHandler(() => {
      this.#openEditForm(pointView, point, destination, offers);
    });

    render(pointView, this.#listContainer);
    this.#pointComponents.set(point.id, {
      pointView,
      point,
      destination,
      offers
    });
  }

  #clearPointsList() {
    while (this.#listContainer.firstChild) {
      this.#listContainer.removeChild(this.#listContainer.firstChild);
    }
    this.#pointComponents.clear();
    if (this.#emptyListComponent) {
      this.#emptyListComponent.removeElement();
      this.#emptyListComponent = null;
    }
  }

  #openEditForm(pointView, point, destination, offers) {
    if (this.#activeEditForm) {
      this.#closeEditForm(false);
    }

    const allOffersByType = this.#model.getOffersByType(point.type);
    const editForm = new EditFormView(point, destination, offers, allOffersByType);

    editForm.setSubmitHandler(() => {
      this.#onEditFormSubmit(editForm, point, pointView);
    });
    editForm.setCloseHandler(() => {
      this.#closeEditForm(false);
    });
    editForm.setEscKeydownHandler(() => {
      this.#closeEditForm(false);
    });

    pointView.element.replaceWith(editForm.element);
    this.#activeEditForm = editForm;
    this.#activeEditFormPointId = point.id;
  }

  #onEditFormSubmit(editForm, oldPoint, oldPointView) {
    this.#closeEditForm(false);
  }

  #closeEditForm(saveChanges = false) {
    if (!this.#activeEditForm) return;

    const pointId = this.#activeEditFormPointId;
    const entry = this.#pointComponents.get(pointId);
    if (entry) {
      const { pointView } = entry;
      this.#activeEditForm.element.replaceWith(pointView.element);
    }
    this.#activeEditForm.removeElement();
    this.#activeEditForm = null;
    this.#activeEditFormPointId = null;
  }

  #showCreateForm() {
    if (this.#activeEditForm) {
      this.#closeEditForm(false);
    }
    this.#createFormComponent.element.style.display = '';
    this.#isCreateFormShown = true;

    this.#createFormComponent.setSubmitHandler(() => {
      this.#onCreateFormSubmit();
    });
    this.#createFormComponent.setCloseHandler(() => {
      this.#hideCreateForm();
    });
    this.#createFormComponent.setEscKeydownHandler(() => {
      this.#hideCreateForm();
    });
  }

  #hideCreateForm() {
    this.#createFormComponent.element.style.display = 'none';
    this.#isCreateFormShown = false;
  }

  #onCreateFormSubmit() {
    this.#hideCreateForm();
    this.#renderPointsList();
  }

  #getCurrentFilter() {
    return 'everything';
  }
}
