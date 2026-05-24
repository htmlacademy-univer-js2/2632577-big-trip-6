import AbstractStatefulView from '../framework/abstract-stateful-view.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import dayjs from 'dayjs';

export default class PointFormView extends AbstractStatefulView {
  #allDestinations = [];
  #allOffers = [];
  #callbacks = { submit: null, close: null };
  #datepickerStart = null;
  #datepickerEnd = null;
  #isSaving = false;

  constructor(allDestinations, allOffers) {
    super();
    this.#allDestinations = allDestinations;
    this.#allOffers = allOffers;
    this._setState(this.#getEmptyState());
    this._restoreHandlers();
  }

  #getEmptyState() {
    const defaultType = 'flight';
    return {
      type: defaultType,
      destination: null,
      startDateTime: '',
      endDateTime: '',
      basePrice: 0,
      selectedOffers: [],
      allOffersByType: this.#allOffers.flatMap(group => group.offers).filter(o => o.type === defaultType)
    };
  }

  get template() {
    const { type, destination, startDateTime, endDateTime, basePrice, selectedOffers, allOffersByType } = this._state;
    const destName = destination?.name || '';
    const destDesc = destination?.description || '';
    const destPics = destination?.pictures || [];
    const startVal = startDateTime ? dayjs(startDateTime).format('YYYY-MM-DDTHH:mm') : '';
    const endVal = endDateTime ? dayjs(endDateTime).format('YYYY-MM-DDTHH:mm') : '';
    const eventTypes = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];
    const typesRadios = eventTypes.map(t => `<div class="event__type-item"><input id="event-type-${t}-1" class="event__type-input visually-hidden" type="radio" name="event-type" value="${t}" ${t === type ? 'checked' : ''}><label class="event__type-label event__type-label--${t}" for="event-type-${t}-1">${t}</label></div>`).join('');
    const offersCheckboxes = allOffersByType.map(offer => {
      const checked = selectedOffers.some(s => s.id === offer.id);
      return `<div class="event__offer-selector"><input class="event__offer-checkbox visually-hidden" id="offer-${offer.id}" type="checkbox" name="offer" value="${offer.id}" ${checked ? 'checked' : ''}><label class="event__offer-label" for="offer-${offer.id}"><span class="event__offer-title">${offer.title}</span>&plus;&euro;&nbsp;<span class="event__offer-price">${offer.price}</span></label></div>`;
    }).join('');
    const photosHtml = destPics.map(pic => `<img class="event__photo" src="${pic.src}" alt="${pic.description}">`).join('');
    const destOptions = this.#allDestinations.map(d => `<option value="${d.name}"></option>`).join('');
    const saveBtnText = this.#isSaving ? 'Saving...' : 'Save';

    return `
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">...</div>
          <div class="event__field-group event__field-group--destination">
            <label class="event__label event__type-output" for="event-destination-1">${type}</label>
            <input class="event__input event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destName}" list="destination-list-1" autocomplete="off">
            <datalist id="destination-list-1">${destOptions}</datalist>
          </div>
          <div class="event__field-group event__field-group--time">
            <input class="event__input event__input--time" id="event-start-time-1" type="text" value="${startVal}" readonly>
            &mdash;
            <input class="event__input event__input--time" id="event-end-time-1" type="text" value="${endVal}" readonly>
          </div>
          <div class="event__field-group event__field-group--price">
            <input class="event__input event__input--price" id="event-price-1" type="number" name="event-price" value="${basePrice}" min="0" step="1">
          </div>
          <button class="event__save-btn btn btn--blue" type="submit" ${this.#isSaving ? 'disabled' : ''}>${saveBtnText}</button>
          <button class="event__reset-btn" type="reset">Cancel</button>
          <button class="event__rollup-btn" type="button">Close</button>
        </header>
        <section class="event__details">
          <section class="event__section event__section--offers"><h3 class="event__section-title event__section-title--offers">Offers</h3><div class="event__available-offers">${offersCheckboxes || '<p>No offers</p>'}</div></section>
          <section class="event__section event__section--destination"><h3 class="event__section-title event__section-title--destination">Destination</h3><p class="event__destination-description">${destDesc}</p><div class="event__photos-container"><div class="event__photos-tape">${photosHtml || '<p>No photos</p>'}</div></div></section>
        </section>
      </form>
    `;
  }

  setSubmitHandler(cb) { this.#callbacks.submit = cb; }
  setCloseHandler(cb) { this.#callbacks.close = cb; }
  setEscKeydownHandler(cb) { this.#callbacks.esc = cb; }
  setSavingState(isSaving) { this.#isSaving = isSaving; this.updateElement({}); }

  #submitHandler = async (evt) => {
    evt.preventDefault();
    await this.#callbacks.submit?.(this.#createPointFromState());
  };
  #closeClickHandler = (evt) => {
    evt.preventDefault();
    this.#callbacks.close?.();
  };
  #escKeydownHandler = (evt) => {
    if (evt.key === 'Escape') this.#callbacks.esc?.();
  };

  #createPointFromState() {
    const s = this._state;
    return {
      id: Date.now(),
      type: s.type,
      dateFrom: s.startDateTime,
      dateTo: s.endDateTime,
      basePrice: s.basePrice,
      isFavorite: false,
      destination: s.destination?.id || null,
      offers: s.selectedOffers.map(o => o.id)
    };
  }

  #handleTypeChange = (evt) => {
    const newType = evt.target.value;
    if (newType === this._state.type) return;
    const newAllOffers = this.#allOffers.find(g => g.type === newType)?.offers || [];
    this.updateElement({ type: newType, selectedOffers: [], allOffersByType: newAllOffers, destination: null });
  };
  #handleDestinationChange = (evt) => {
    const newDest = this.#allDestinations.find(d => d.name === evt.target.value);
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
    if (!isNaN(price)) this.updateElement({ basePrice: price });
  };

  #initDatepickers() {
    const startInput = this.element.querySelector('#event-start-time-1');
    const endInput = this.element.querySelector('#event-end-time-1');
    if (this.#datepickerStart) this.#datepickerStart.destroy();
    if (this.#datepickerEnd) this.#datepickerEnd.destroy();
    this.#datepickerStart = flatpickr(startInput, {
      enableTime: true,
      dateFormat: 'Y-m-d\\TH:i',
      onChange: ([date]) => { if (date) this.updateElement({ startDateTime: date.toISOString() }); }
    });
    this.#datepickerEnd = flatpickr(endInput, {
      enableTime: true,
      dateFormat: 'Y-m-d\\TH:i',
      onChange: ([date]) => { if (date) this.updateElement({ endDateTime: date.toISOString() }); }
    });
  }

  _restoreHandlers() {
    this.element.querySelector('form').addEventListener('submit', this.#submitHandler);
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#closeClickHandler);
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#closeClickHandler);
    document.addEventListener('keydown', this.#escKeydownHandler);
    this.element.querySelectorAll('.event__type-input').forEach(r => r.addEventListener('change', this.#handleTypeChange));
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
