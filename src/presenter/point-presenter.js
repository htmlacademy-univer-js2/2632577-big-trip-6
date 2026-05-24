import PointItemView from '../view/point-item-view.js';
import EditFormView from '../view/edit-form-view.js';
import { render, replace } from '../framework/render.js';

export default class PointPresenter {
  #point = null;
  #destination = null;
  #offers = [];
  #allOffersByType = [];
  #pointComponent = null;
  #editFormComponent = null;
  #parentContainer = null;

  #onDataChange = null;
  #onModeChange = null;

  #isEditMode = false;

  constructor(container, onDataChange, onModeChange) {
    this.#parentContainer = container;
    this.#onDataChange = onDataChange;
    this.#onModeChange = onModeChange;
  }

  init(point, destination, offers, allOffersByType) {
    this.#point = point;
    this.#destination = destination;
    this.#offers = offers;
    this.#allOffersByType = allOffersByType;

    const prevPointComponent = this.#pointComponent;
    const prevEditFormComponent = this.#editFormComponent;

    this.#pointComponent = new PointItemView(this.#point, this.#destination, this.#offers);
    this.#editFormComponent = new EditFormView(
      this.#point,
      this.#destination,
      this.#offers,
      this.#allOffersByType
    );

    this.#pointComponent.setEditClickHandler(() => this.#replacePointToForm());
    this.#pointComponent.setFavoriteClickHandler(() => this.#handleFavoriteClick());

    this.#editFormComponent.setSubmitHandler(() => this.#replaceFormToPoint());
    this.#editFormComponent.setCloseHandler(() => this.#replaceFormToPoint());
    this.#editFormComponent.setEscKeydownHandler(() => this.#replaceFormToPoint());

    if (prevPointComponent === null || prevEditFormComponent === null) {
      render(this.#pointComponent, this.#parentContainer);
      return;
    }

    if (this.#isEditMode) {
      replace(this.#editFormComponent, prevEditFormComponent);
    } else {
      replace(this.#pointComponent, prevPointComponent);
    }

    prevPointComponent.removeElement();
    prevEditFormComponent.removeElement();
  }

  #replacePointToForm() {
    if (this.#isEditMode) return;
    this.#onModeChange(this);
    replace(this.#editFormComponent, this.#pointComponent);
    this.#isEditMode = true;
  }

  #replaceFormToPoint() {
    if (!this.#isEditMode) return;
    replace(this.#pointComponent, this.#editFormComponent);
    this.#isEditMode = false;
  }

  #handleFavoriteClick() {
    const updatedPoint = {
      ...this.#point,
      isFavorite: !this.#point.isFavorite
    };
    this.#onDataChange(updatedPoint);
  }

  resetView() {
    if (this.#isEditMode) {
      this.#replaceFormToPoint();
    }
  }

  destroy() {
    if (this.#pointComponent) {
      this.#pointComponent.removeElement();
    }
    if (this.#editFormComponent) {
      this.#editFormComponent.removeElement();
    }
  }
}
