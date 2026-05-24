import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import PointFormView from '../view/point-form-view.js';
import EditFormView from '../view/edit-form-view.js';
import PointItemView from '../view/point-item-view.js';
import { render } from '../framework/render.js';

export default class TripPresenter {
  #model = null;
  #filtersContainer = null;
  #tripEventsContainer = null;
  #tripMain = null;
  #listContainer = null;
  #newEventButton = null;

  #pointComponents = new Map();
  #activeEditForm = null;

  constructor(model) {
    this.#model = model;
    this.#filtersContainer = document.querySelector('.trip-controls__filters');
    this.#tripEventsContainer = document.querySelector('.trip-events');
    this.#tripMain = document.querySelector('.trip-main');
    this.#newEventButton = this.#tripMain?.querySelector('.trip-main__event-add-btn');
  }

  init() {
    const filterView = new FilterView();
    render(filterView, this.#filtersContainer);

    const sortView = new SortView();
    this.#tripEventsContainer.prepend(sortView.element);

    this.#listContainer = document.createElement('ul');
    this.#listContainer.className = 'trip-events__list';
    this.#tripEventsContainer.appendChild(this.#listContainer);

    this.#renderAllPoints();

    const pointFormView = new PointFormView();
    if (this.#newEventButton) {
      this.#newEventButton.insertAdjacentElement('afterend', pointFormView.element);
      pointFormView.element.style.display = 'none'; 
    } else {
      render(pointFormView, this.#tripMain);
      pointFormView.element.style.display = 'none';
    }

    this.#newEventButton?.addEventListener('click', () => {
      if (this.#activeEditForm) {
        this.#closeEditForm(this.#activeEditForm);
      }
      pointFormView.element.style.display = '';
      pointFormView.setSubmitHandler(() => this.#onCreateFormSubmit(pointFormView));
      pointFormView.setCloseHandler(() => this.#onCreateFormClose(pointFormView));
      pointFormView.setEscKeydownHandler(() => this.#onCreateFormClose(pointFormView));
    });
  }

  #renderAllPoints() {
    const points = this.#model.getPoints();
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

  #openEditForm(pointView, point, destination, offers) {
    if (this.#activeEditForm) {
      this.#closeEditForm(this.#activeEditForm);
    }

    const allOffersByType = this.#model.getOffersByType(point.type);
    const editForm = new EditFormView(point, destination, offers, allOffersByType);

    editForm.setSubmitHandler(() => {
      this.#onEditFormSubmit(editForm, point, pointView);
    });
    editForm.setCloseHandler(() => {
      this.#closeEditForm(editForm);
    });
    editForm.setEscKeydownHandler(() => {
      this.#closeEditForm(editForm);
    });

    pointView.element.replaceWith(editForm.element);
    this.#activeEditForm = editForm;
  }

  #onEditFormSubmit(editForm, oldPoint, oldPointView) {
    this.#closeEditForm(editForm);
    this.#replaceFormWithPoint(editForm, oldPointView);
  }

  #closeEditForm(editForm) {
    if (!editForm) return;
    let relatedPointView = null;
    let relatedPoint = null;
    for (const [id, { pointView, point }] of this.#pointComponents.entries()) {
      if (point.id === editForm._point?.id) { 
        relatedPointView = pointView;
        relatedPoint = point;
        break;
      }
    }
    if (relatedPointView) {
      this.#replaceFormWithPoint(editForm, relatedPointView);
    } else {
      editForm.element.remove();
      editForm.removeElement();
    }
    this.#activeEditForm = null;
  }

  #replaceFormWithPoint(editForm, pointView) {
    editForm.element.replaceWith(pointView.element);
    editForm.removeElement(); 
  }

  #onCreateFormSubmit(formView) {
    this.#onCreateFormClose(formView);
  }

  #onCreateFormClose(formView) {
    formView.element.style.display = 'none';
  }
}
