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
  #onGetOffersByType = null;
  #onGetDestinationByName = null;
  #onDelete = null;
  #isEditMode = false;

  constructor(container, onDataChange, onModeChange, onGetOffersByType, onGetDestinationByName, onDelete) {
    this.#parentContainer = container;
    this.#onDataChange = onDataChange;
    this.#onModeChange = onModeChange;
    this.#onGetOffersByType = onGetOffersByType;
    this.#onGetDestinationByName = onGetDestinationByName;
    this.#onDelete = onDelete;
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
      this.#point, this.#destination, this.#offers, this.#allOffersByType,
      (name) => this.#handleDestinationChange(name),
      (type) => this.#onGetOffersByType(type)
    );

    this.#pointComponent.setEditClickHandler(() => this.#replacePointToForm());
    this.#pointComponent.setFavoriteClickHandler(() => this.#handleFavoriteClick());
    this.#editFormComponent.setSubmitHandler(() => this.#replaceFormToPointAndSave());
    this.#editFormComponent.setCloseHandler(() => this.#replaceFormToPoint());
    this.#editFormComponent.setEscKeydownHandler(() => this.#replaceFormToPoint());
    this.#editFormComponent.setDeleteHandler(() => this.#handleDeleteClick());

    if (!prevPointComponent || !prevEditFormComponent) {
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
    if (this.#isEditMode) {
      return;
    }
    this.#onModeChange(this);
    replace(this.#editFormComponent, this.#pointComponent);
    this.#isEditMode = true;
  }

  #replaceFormToPoint() {
    if (!this.#isEditMode) {
      return;
    }
    replace(this.#pointComponent, this.#editFormComponent);
    this.#isEditMode = false;
  }

  #replaceFormToPointAndSave = async () => {
    if (!this.#isEditMode) {
      return;
    }
    const state = this.#editFormComponent.getState();
    const updatedPoint = {
      ...state.point,
      destination: state.destination.id,
      offers: state.selectedOffers.map((offer) => offer.id),
    };
    this.#editFormComponent.setSavingState(true);
    try {
      await this.#onDataChange(updatedPoint);
      this.#replaceFormToPoint();
    } catch {
      this.#editFormComponent.shake();
    } finally {
      this.#editFormComponent.setSavingState(false);
    }
  };

  #handleFavoriteClick = async () => {
    const updatedPoint = { ...this.#point, isFavorite: !this.#point.isFavorite };
    try {
      await this.#onDataChange(updatedPoint);
    } catch {
      this.#pointComponent.shake();
    }
  };

  #handleDeleteClick = async () => {
    this.#editFormComponent.setDeletingState(true);
    try {
      await this.#onDelete(this.#point.id);
    } catch {
      this.#editFormComponent.shake();
      this.#editFormComponent.setDeletingState(false);
    }
  };

  #handleDestinationChange(destinationName) {
    const newDestination = this.#onGetDestinationByName(destinationName);
    if (newDestination) {
      this.#editFormComponent.updateElement({ destination: newDestination });
      this.#destination = newDestination;
    }
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
