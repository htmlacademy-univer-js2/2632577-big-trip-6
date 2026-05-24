import AbstractStatefulView from '../framework/abstract-stateful-view.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration.js';

dayjs.extend(duration);

export default class EditFormView extends AbstractStatefulView {
  #callbacks = { submit: null, close: null, esc: null, delete: null };
  #datepickerStart = null;
  #datepickerEnd = null;
  #onGetOffersByType = null;
  #onGetDestinationByName = null;
  #isSaving = false;
  #isDeleting = false;

  constructor(point, destination, selectedOffers, allOffersByType, onGetDestinationByName, onGetOffersByType) {
    super();
    this.#onGetDestinationByName = onGetDestinationByName;
    this.#onGetOffersByType = onGetOffersByType;
    this._setState(EditFormView.parseStateToRaw(point, destination, selectedOffers, allOffersByType));
    this._restoreHandlers();
  }

  static parseStateToRaw(point, destination, selectedOffers, allOffersByType) {
    return {
      point: point || {
        id: null,
        type: 'flight',
        startDateTime: '',
        endDateTime: '',
        basePrice: 0,
        isFavorite: false,
        destinationId: null,
        offersIds: []
      },
      destination: destination || { id: null, name: '', description: '', pictures: [] },
      selectedOffers: selectedOffers || [],
      allOffersByType: allOffersByType || []
    };
  }

  get template() {
    const { point, destination, selectedOffers, allOffersByType } = this._state;
    const { type, startDateTime, endDateTime, basePrice } = point;
    const destinationName = destination.name || '';
    const destinationDescription = destination.description || '';
    const destinationPictures = destination.pictures || [];

    const formatDateForInput = (isoString) => isoString ? dayjs(isoString).format('YYYY-MM-DDTHH:mm') : '';
    const startDateValue = formatDateForInput(startDateTime);
    const endDateValue = formatDateForInput(endDateTime);

    const eventTypes = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];
    const typesRadios = eventTypes.map(t => `
      <div class="event__type-item">
        <input id="event-type-${t}-1" class="event__type-input visually-hidden" type="radio" name="event-type" value="${t}" ${t === type ? 'checked' : ''}>
        <label class="event__type-label event__type-label--${t}" for="event-type-${t}-1">${t}</label>
      </div>
    `).join('');

    const offersCheckboxes = allOffersByType.map(offer => {
      const isChecked = selectedOffers.some(selected => selected.id === offer.id);
      return `
        <div class="event__offer-selector">
          <input class="event__offer-checkbox visually-hidden" id="offer-${offer.id}" type="checkbox" name="offer" value="${offer.id}" ${isChecked ? 'checked' : ''}>
          <label class="event__offer-label" for="offer-${offer.id}">
            <span class="event__offer-title">${offer.title}</span>
            &plus;&euro;&nbsp;
            <span class="event__offer-price">${offer.price}</span>
          </label>
        </div>
      `;
    }).join('');

    const picturesHtml = destinationPictures.map(pic => `<img class="event__photo" src="${pic.src}" alt="${pic.description}">`).join('');
    const saveBtnText = this.#isSaving ? 'Saving...' : 'Save';
    const deleteBtnText = this.#isDeleting ? 'Deleting...' : 'Delete';

    return `
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">...</div>
          <div class="event__field-group event__field-group--destination">...</div>
          <div class="event__field-group event__field-group--time">...</div>
          <div class="event__field-group event__field-group--price">...</div>
          <button class="event__save-btn btn btn--blue" type="submit" ${this.#isSaving ? 'disabled' : ''}>${saveBtnText}</button>
          <button class="event__reset-btn" type="reset" ${this.#isDeleting ? 'disabled' : ''}>${deleteBtnText}</button>
          <button class="event__rollup-btn" type="button">...</button>
        </header>
        <section class="event__details">...</section>
      </form>
    `;
  }

  setSubmitHandler(callback) { this.#callbacks.submit = callback; }
  setCloseHandler(callback) { this.#callbacks.close = callback; }
  setEscKeydownHandler(callback) { this.#callbacks.esc = callback; }
  setDeleteHandler(callback) { this.#callbacks.delete = callback; }
  getState() { return this._state; }

  setSavingState(isSaving) {
    this.#isSaving = isSaving;
    this.updateElement({});
  }

  setDeletingState(isDeleting) {
    this.#isDeleting = isDeleting;
    this.updateElement({});
  }

  #submitHandler = (evt) => {
    evt.preventDefault();
    this.#callbacks.submit?.();
  };
  #closeClickHandler = (evt) => {
    evt.preventDefault();
    this.#callbacks.close?.();
  };
  #deleteClickHandler = (evt) => {
    evt.preventDefault();
    this.#callbacks.delete?.();
  };
  #escKeydownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.#callbacks.esc?.();
    }
  };

  #handleTypeChange = (evt) => {
    const newType = evt.target.value;
    if (newType === this._state.point.type) return;
    const newAllOffers = this.#onGetOffersByType(newType);
    this.updateElement({
      point: { ...this._state.point, type: newType, offersIds: [] },
      selectedOffers: [],
      allOffersByType: newAllOffers
    });
  };
  #handleDestinationChange = (evt) => {
    const newDest = this.#onGetDestinationByName(evt.target.value);
    if (newDest) this.updateElement({ destination: newDest });
  };
  #handleOfferChange = (evt) => {
    const id = evt.target.value;
    const checked = evt.target.checked;
    let newSelected = [...this._state.selectedOffers];
    if (checked) {
      const offer = this._state.allOffersByType.find(o => o.id === id);
      if (offer) newSelected.push(offer);
    } else {
      newSelected = newSelected.filter(o => o.id !== id);
    }
    this.updateElement({ selectedOffers: newSelected });
  };
  #handlePriceChange = (evt) => {
    const price = parseInt(evt.target.value, 10);
    if (!isNaN(price)) this.updateElement({ point: { ...this._state.point, basePrice: price } });
  };

  #initDatepickers() {
    const startInput = this.element.querySelector('#event-start-time-1');
    const endInput = this.element.querySelector('#event-end-time-1');
    if (this.#datepickerStart) this.#datepickerStart.destroy();
    if (this.#datepickerEnd) this.#datepickerEnd.destroy();
    this.#datepickerStart = flatpickr(startInput, {
      enableTime: true,
      dateFormat: 'Y-m-d\\TH:i',
      onChange: ([date]) => { if (date) this.updateElement({ point: { ...this._state.point, startDateTime: date.toISOString() } }); }
    });
    this.#datepickerEnd = flatpickr(endInput, {
      enableTime: true,
      dateFormat: 'Y-m-d\\TH:i',
      onChange: ([date]) => { if (date) this.updateElement({ point: { ...this._state.point, endDateTime: date.toISOString() } }); }
    });
  }

  _restoreHandlers() {
    this.element.querySelector('form').addEventListener('submit', this.#submitHandler);
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#closeClickHandler);
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#deleteClickHandler);
    document.addEventListener('keydown', this.#escKeydownHandler);

    this.element.querySelectorAll('.event__type-input').forEach(radio => radio.addEventListener('change', this.#handleTypeChange));
    const destInput = this.element.querySelector('.event__input--destination');
    if (destInput) destInput.addEventListener('change', this.#handleDestinationChange);
    this.element.querySelectorAll('.event__offer-checkbox').forEach(cb => cb.addEventListener('change', this.#handleOfferChange));
    const priceInput = this.element.querySelector('.event__input--price');
    if (priceInput) priceInput.addEventListener('change', this.#handlePriceChange);
    this.#initDatepickers();
  }

  removeElement() {
    if (this.#datepickerStart) this.#datepickerStart.destroy();
    if (this.#datepickerEnd) this.#datepickerEnd.destroy();
    document.removeEventListener('keydown', this.#escKeydownHandler);
    super.removeElement();
  }
}
