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

    const prevPoint = this.#pointComponent;
    const prevForm = this.#editFormComponent;

    this.#pointComponent = new PointItemView(this.#point, this.#destination, this.#offers);
    this.#editFormComponent = new EditFormView(
      this.#point, this.#destination, this.#offers, this.#allOffersByType,
      this.#onGetDestinationByName,
      this.#onGetOffersByType
    );

    this.#pointComponent.setEditClickHandler(() => this.#replacePointToForm());
    this.#pointComponent.setFavoriteClickHandler(() => this.#handleFavoriteClick());
    this.#editFormComponent.setSubmitHandler(() => this.#replaceFormToPointAndSave());
    this.#editFormComponent.setCloseHandler(() => this.#replaceFormToPoint());
    this.#editFormComponent.setEscKeydownHandler(() => this.#replaceFormToPoint());
    this.#editFormComponent.setDeleteHandler(() => this.#handleDeleteClick());

    if (!prevPoint || !prevForm) {
      render(this.#pointComponent, this.#parentContainer);
      return;
    }
    if (this.#isEditMode) replace(this.#editFormComponent, prevForm);
    else replace(this.#pointComponent, prevPoint);
    prevPoint.removeElement();
    prevForm.removeElement();
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

  #replaceFormToPointAndSave = async () => {
    if (!this.#isEditMode) return;
    const state = this.#editFormComponent.getState();
    const updated = {
      ...state.point,
      destination: state.destination.id,
      offers: state.selectedOffers.map(o => o.id),
    };
    this.#editFormComponent.setSavingState(true);
    try {
      await this.#onDataChange(updated);
      this.#replaceFormToPoint();
    } catch {
      this.#editFormComponent.shake();
    } finally {
      this.#editFormComponent.setSavingState(false);
    }
  };

  #handleFavoriteClick = async () => {
    const updated = { ...this.#point, isFavorite: !this.#point.isFavorite };
    try {
      await this.#onDataChange(updated);
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

  #handleDestinationChange(name) {
    const newDest = this.#onGetDestinationByName(name);
    if (newDest) {
      this.#editFormComponent.updateElement({ destination: newDest });
      this.#destination = newDest;
    }
  }

  resetView() { if (this.#isEditMode) this.#replaceFormToPoint(); }
  destroy() {
    this.#pointComponent?.removeElement();
    this.#editFormComponent?.removeElement();
  }
}
