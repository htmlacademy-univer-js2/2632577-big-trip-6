import AbstractStatefulView from '../framework/abstract-stateful-view.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import dayjs from 'dayjs';

export default class EditFormView extends AbstractStatefulView {
  #callbacks = {
    submit: null,
    close: null,
    esc: null,
    destinationChange: null,
  };
  #datepickerStart = null;
  #datepickerEnd = null;

  constructor(point, destination, selectedOffers, allOffersByType, onDestinationChange) {
    super();
    this.#callbacks.destinationChange = onDestinationChange;
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
      destination: destination || {
        id: null,
        name: '',
        description: '',
        pictures: []
      },
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

    const eventTypes = [
      'taxi', 'bus', 'train', 'ship', 'drive', 'flight',
      'check-in', 'sightseeing', 'restaurant'
    ];

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

    const picturesHtml = destinationPictures.map(pic => `
      <img class="event__photo" src="${pic.src}" alt="${pic.description}">
    `).join('');

    return `
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle visually-hidden" id="event-type-toggle-1" type="checkbox">
            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${typesRadios}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group event__field-group--destination">
            <label class="event__label event__type-output" for="event-destination-1">${type}</label>
            <input class="event__input event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destinationName}" list="destination-list-1" autocomplete="off">
            <datalist id="destination-list-1">
              <!-- города можно подставить из модели, но для простоты оставляем -->
            </datalist>
          </div>

          <div class="event__field-group event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${startDateValue}" readonly>
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${endDateValue}" readonly>
          </div>

          <div class="event__field-group event__field-group--price">
            <label class="visually-hidden" for="event-price-1">Price</label>
            <input class="event__input event__input--price" id="event-price-1" type="number" name="event-price" value="${basePrice}">
          </div>

          <button class="event__save-btn btn btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">Delete</button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Close event</span>
          </button>
        </header>

        <section class="event__details">
          <section class="event__section event__section--offers">
            <h3 class="event__section-title event__section-title--offers">Offers</h3>
            <div class="event__available-offers">
              ${offersCheckboxes || '<p>No offers available</p>'}
            </div>
          </section>

          <section class="event__section event__section--destination">
            <h3 class="event__section-title event__section-title--destination">Destination</h3>
            <p class="event__destination-description">${destinationDescription}</p>
            <div class="event__photos-container">
              <div class="event__photos-tape">
                ${picturesHtml || '<p>No photos</p>'}
              </div>
            </div>
          </section>
        </section>
      </form>
    `;
  }

  setSubmitHandler(callback) {
    this.#callbacks.submit = callback;
    this.element.querySelector('form').addEventListener('submit', this.#submitHandler);
  }

  setCloseHandler(callback) {
    this.#callbacks.close = callback;
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#closeClickHandler);
  }

  setEscKeydownHandler(callback) {
    this.#callbacks.esc = callback;
    document.addEventListener('keydown', this.#escKeydownHandler);
  }

  #submitHandler = (evt) => {
    evt.preventDefault();
    this.#callbacks.submit?.();
  };

  #closeClickHandler = (evt) => {
    evt.preventDefault();
    this.#callbacks.close?.();
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
    this.updateElement({
      point: { ...this._state.point, type: newType, offersIds: [] },
      selectedOffers: [],
      allOffersByType: this.#callbacks.getOffersByType?.(newType) || []
    });
  };

  #handleDestinationChange = (evt) => {
    const newDestinationName = evt.target.value;
    this.#callbacks.destinationChange?.(newDestinationName);
  };

  #handleOfferChange = (evt) => {
    const offerId = evt.target.value;
    const isChecked = evt.target.checked;
    let newSelectedOffers = [...this._state.selectedOffers];
    if (isChecked) {
      const offer = this._state.allOffersByType.find(o => o.id === offerId);
      if (offer) newSelectedOffers.push(offer);
    } else {
      newSelectedOffers = newSelectedOffers.filter(o => o.id !== offerId);
    }
    this.updateElement({ selectedOffers: newSelectedOffers });
  };

  #initDatepickers() {
    const startInput = this.element.querySelector('#event-start-time-1');
    const endInput = this.element.querySelector('#event-end-time-1');

    if (this.#datepickerStart) this.#datepickerStart.destroy();
    if (this.#datepickerEnd) this.#datepickerEnd.destroy();

    this.#datepickerStart = flatpickr(startInput, {
      enableTime: true,
      dateFormat: 'Y-m-d\\TH:i',
      onChange: ([date]) => {
        if (date) {
          this.updateElement({
            point: { ...this._state.point, startDateTime: date.toISOString() }
          });
        }
      }
    });

    this.#datepickerEnd = flatpickr(endInput, {
      enableTime: true,
      dateFormat: 'Y-m-d\\TH:i',
      onChange: ([date]) => {
        if (date) {
          this.updateElement({
            point: { ...this._state.point, endDateTime: date.toISOString() }
          });
        }
      }
    });
  }

  _restoreHandlers() {
    this.element.querySelector('form').addEventListener('submit', this.#submitHandler);
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#closeClickHandler);
    document.addEventListener('keydown', this.#escKeydownHandler);

    const typeRadios = this.element.querySelectorAll('.event__type-input');
    typeRadios.forEach(radio => {
      radio.addEventListener('change', this.#handleTypeChange);
    });
    const destinationInput = this.element.querySelector('.event__input--destination');
    if (destinationInput) {
      destinationInput.addEventListener('change', this.#handleDestinationChange);
    }
    const offerCheckboxes = this.element.querySelectorAll('.event__offer-checkbox');
    offerCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', this.#handleOfferChange);
    });

    this.#initDatepickers();
  }

  removeElement() {
    if (this.#datepickerStart) this.#datepickerStart.destroy();
    if (this.#datepickerEnd) this.#datepickerEnd.destroy();
    document.removeEventListener('keydown', this.#escKeydownHandler);
    super.removeElement();
  }
}
