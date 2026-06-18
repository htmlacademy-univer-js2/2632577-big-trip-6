import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import dayjs from 'dayjs';

const MAX_PRICE = 100000;
const MIN_PRICE = 1;

const addShakeAnimation = () => {
  if (!document.querySelector('#shake-animation')) {
    const style = document.createElement('style');
    style.id = 'shake-animation';
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
        20%, 40%, 60%, 80% { transform: translateX(10px); }
      }
      .shake {
        animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both !important;
      }
    `;
    document.head.appendChild(style);
  }
};

export default class EditFormView extends AbstractStatefulView {
  constructor(waypoint, destination, allOffers, onFormSubmit, onCancelClick, onDeleteClick, allDestinations) {
    super();
    this._waypoint = waypoint;
    this._destination = destination || { name: '', description: '', pictures: [] };
    this._allOffers = allOffers || [];
    this._allDestinations = allDestinations || [];
    this._onFormSubmit = onFormSubmit;
    this._onCancelClick = onCancelClick;
    this._onDeleteClick = onDeleteClick;
    this._datepickerFrom = null;
    this._datepickerTo = null;

    addShakeAnimation();

    this._setState({
      type: waypoint.type || 'flight',
      destinationId: waypoint.destinationId || '',
      dateFrom: waypoint.dateFrom || '',
      dateTo: waypoint.dateTo || '',
      basePrice: waypoint.basePrice || 0,
      selectedOfferIds: [...(waypoint.optionsIds || [])],
      isFavorite: waypoint.isFavorite || false
    });

    this._handleFormSubmit = this._handleFormSubmit.bind(this);
    this._handleCancelClick = this._handleCancelClick.bind(this);
    this._handleDeleteClick = this._handleDeleteClick.bind(this);
    this._handleTypeChange = this._handleTypeChange.bind(this);
    this._handlePriceChange = this._handlePriceChange.bind(this);
    this._handleDestinationChange = this._handleDestinationChange.bind(this);
    this._handleDateFromChange = this._handleDateFromChange.bind(this);
    this._handleDateToChange = this._handleDateToChange.bind(this);
    this._handleOfferChange = this._handleOfferChange.bind(this);
  }

  get template() {
    const { type, dateFrom, dateTo, basePrice, selectedOfferIds, destinationId } = this._state;
    const destination = this._allDestinations.find((dest) => dest.id === destinationId) || this._destination;
    const destinationName = destination?.name || '';
    const description = destination?.description || '';
    const pictures = destination?.pictures || [];

    const formatDateTimeLocal = (dateString) => {
      if (!dateString) {
        return '';
      }
      return dayjs(dateString).format('YYYY-MM-DDTHH:mm');
    };

    const startDate = formatDateTimeLocal(dateFrom);
    const endDate = formatDateTimeLocal(dateTo);

    const filteredOffers = this._allOffers.filter((offer) => offer.type === type);

    const offersHtml = filteredOffers.map((offer) => `
      <div class="event__offer-selector">
        <input class="event__offer-checkbox visually-hidden"
               id="offer-${offer.id}"
               type="checkbox"
               name="offer"
               value="${offer.id}"
               ${selectedOfferIds.includes(offer.id) ? 'checked' : ''}>
        <label class="event__offer-label" for="offer-${offer.id}">
          <span class="event__offer-title">${offer.title}</span>
          +€${offer.price}
        </label>
      </div>
    `).join('');

    const photosHtml = pictures?.map((picture) => `
      <img class="event__photo" src="${picture.src}" alt="${picture.description || ''}">
    `).join('') || '';

    const citiesHtml = this._allDestinations.map((dest) => `
      <option value="${dest.id}" ${destinationId === dest.id ? 'selected' : ''}>${dest.name}</option>
    `).join('');

    return `
      <li class="trip-events__item">
        <form class="event event--edit" action="#" method="post">
          <header class="event__header" style="display: flex; align-items: center; gap: 8px; padding: 15px 20px;">
            <div class="event__type-wrapper">
              <select class="event__type-select" data-type-select style="padding: 6px 8px; border-radius: 4px; border: 2px solid #0d8ae4; background: white; font-size: 14px; cursor: pointer; width: 90px;">
                <option value="taxi" ${type === 'taxi' ? 'selected' : ''}>Taxi</option>
                <option value="bus" ${type === 'bus' ? 'selected' : ''}>Bus</option>
                <option value="train" ${type === 'train' ? 'selected' : ''}>Train</option>
                <option value="ship" ${type === 'ship' ? 'selected' : ''}>Ship</option>
                <option value="drive" ${type === 'drive' ? 'selected' : ''}>Drive</option>
                <option value="flight" ${type === 'flight' ? 'selected' : ''}>Flight</option>
                <option value="check-in" ${type === 'check-in' ? 'selected' : ''}>Check-in</option>
                <option value="sightseeing" ${type === 'sightseeing' ? 'selected' : ''}>Sightseeing</option>
                <option value="restaurant" ${type === 'restaurant' ? 'selected' : ''}>Restaurant</option>
              </select>
            </div>

            <div class="event__field-group event__field-group--destination">
              <select class="event__input event__input--destination" data-destination-select style="padding: 6px 8px; border-radius: 4px; border: 2px solid #0d8ae4; background: white; width: 130px; font-size: 14px;">
                <option value="">-- Select --</option>
                ${citiesHtml}
              </select>
            </div>

            <div class="event__field-group">
              <input
                class="event__input event__input--time"
                type="datetime-local"
                name="event-start-time"
                value="${startDate}"
                data-start-date
                style="padding: 6px 8px; border: 2px solid #0d8ae4; border-radius: 4px; width: 140px; font-size: 12px;"
              >
            </div>

            <div class="event__field-group">
              <input
                class="event__input event__input--time"
                type="datetime-local"
                name="event-end-time"
                value="${endDate}"
                data-end-date
                style="padding: 6px 8px; border: 2px solid #0d8ae4; border-radius: 4px; width: 140px; font-size: 12px;"
              >
            </div>

            <div class="event__field-group">
              <input
                class="event__input event__input--price"
                type="number"
                name="event-price"
                value="${basePrice}"
                data-price-input
                min="1"
                step="1"
                style="padding: 6px 8px; width: 70px; border: 2px solid #0d8ae4; border-radius: 4px; font-size: 14px; text-align: right;"
              >
              <label class="event__label" style="margin-left: 3px;">€</label>
            </div>

            <button class="event__save-btn btn btn--blue" type="submit" style="padding: 6px 10px; font-size: 14px; background: #0d8ae4; color: white; border: none; border-radius: 4px; cursor: pointer;">Save</button>
            <button class="event__reset-btn" type="reset" style="padding: 6px 10px; font-size: 14px; background: none; border: none; cursor: pointer; color: #666;">Cancel</button>
            <button class="event__delete-btn" type="button" style="padding: 6px 10px; font-size: 14px; background: none; border: none; cursor: pointer; color: #ff0000;">Delete</button>
          </header>

          <section class="event__details">
            <div class="event__section event__section--offers">
              <h3 class="event__section-title event__section-title--offers">Offers</h3>
              <div class="event__available-offers" data-offers-container>
                ${offersHtml || '<p>No offers available</p>'}
              </div>
            </div>

            ${destinationName ? `
            <div class="event__section event__section--destination">
              <h3 class="event__section-title event__section-title--destination">Destination</h3>
              <p class="event__destination-description">${description}</p>
              <div class="event__photos-container">
                <div class="event__photos-tape">${photosHtml}</div>
              </div>
            </div>
            ` : ''}
          </section>
        </form>
      </li>
    `;
  }

  _getFormData() {
    const typeSelect = this.element.querySelector('[data-type-select]');
    const destinationSelect = this.element.querySelector('[data-destination-select]');
    const priceInput = this.element.querySelector('[data-price-input]');
    const startDateInput = this.element.querySelector('[data-start-date]');
    const endDateInput = this.element.querySelector('[data-end-date]');
    const offerCheckboxes = this.element.querySelectorAll('.event__offer-checkbox:checked');

    const currentType = typeSelect?.value || 'flight';
    const destinationId = destinationSelect?.value || '';

    const price = priceInput ? (parseInt(priceInput.value, 10) || 0) : 0;

    let dateFrom = '';
    let dateTo = '';

    if (startDateInput && startDateInput.value) {
      dateFrom = new Date(startDateInput.value).toISOString();
    } else if (this._state.dateFrom) {
      dateFrom = this._state.dateFrom;
    }

    if (endDateInput && endDateInput.value) {
      dateTo = new Date(endDateInput.value).toISOString();
    } else if (this._state.dateTo) {
      dateTo = this._state.dateTo;
    }

    const selectedOfferIds = Array.from(offerCheckboxes).map((cb) => cb.value);

    return {
      type: currentType,
      destinationId: destinationId,
      dateFrom: dateFrom,
      dateTo: dateTo,
      basePrice: price,
      selectedOfferIds: selectedOfferIds,
      isFavorite: this._state.isFavorite
    };
  }

  _handleFormSubmit(evt) {
    evt.preventDefault();
    const formData = this._getFormData();

    let hasError = false;

    if (!formData.destinationId || formData.destinationId === '') {
      hasError = true;
    }

    if (!formData.dateFrom || !formData.dateTo) {
      hasError = true;
    }

    if (formData.basePrice < MIN_PRICE || formData.basePrice > MAX_PRICE) {
      hasError = true;
    }

    if (hasError) {
      this._shakeForm();
      return;
    }

    this._onFormSubmit(formData);
  }

  _shakeForm() {
    const form = this.element.querySelector('form');
    if (!form) {
      return;
    }

    form.classList.add('shake');
    setTimeout(() => {
      form.classList.remove('shake');
    }, 500);
  }

  _handleCancelClick(evt) {
    evt.preventDefault();
    this._onCancelClick();
  }

  _handleDeleteClick(evt) {
    evt.preventDefault();
    if (this._onDeleteClick) {
      this._onDeleteClick();
    }
  }

  _handleTypeChange(evt) {
    const newType = evt.target.value;

    if (newType === this._state.type) {
      return;
    }

    this.updateElement({ type: newType, selectedOfferIds: [] });
  }

  _handleDestinationChange(evt) {
    const destinationId = evt.target.value;
    if (destinationId) {
      this._state.destinationId = destinationId;
    }
  }

  _handlePriceChange(evt) {
    let value = parseInt(evt.target.value, 10);
    if (isNaN(value)) {
      value = MIN_PRICE;
    }

    if (value > MAX_PRICE) {
      this._shakeForm();
      value = MAX_PRICE;
    }
    if (value < MIN_PRICE) {
      value = MIN_PRICE;
    }

    this._state.basePrice = value;
  }

  _handleDateFromChange(evt) {
    const date = new Date(evt.target.value);
    if (!isNaN(date.getTime())) {
      this._state.dateFrom = date.toISOString();
    }
  }

  _handleDateToChange(evt) {
    const date = new Date(evt.target.value);
    if (!isNaN(date.getTime())) {
      this._state.dateTo = date.toISOString();
    }
  }

  _handleOfferChange(evt) {
    const offerId = evt.target.value;
    let selectedOfferIds = [...this._state.selectedOfferIds];
    if (evt.target.checked) {
      if (!selectedOfferIds.includes(offerId)) {
        selectedOfferIds.push(offerId);
      }
    } else {
      selectedOfferIds = selectedOfferIds.filter((id) => id !== offerId);
    }
    this._state.selectedOfferIds = selectedOfferIds;
  }

  _initDatepickers() {
    const startInput = this.element.querySelector('[data-start-date]');
    const endInput = this.element.querySelector('[data-end-date]');

    if (startInput && !this._datepickerFrom) {
      this._datepickerFrom = flatpickr(startInput, {
        enableTime: true,
        dateFormat: 'd.m.Y H:i',
        onChange: (dates) => {
          if (dates[0]) {
            this._state.dateFrom = dates[0].toISOString();
          }
        }
      });
    }
    if (endInput && !this._datepickerTo) {
      this._datepickerTo = flatpickr(endInput, {
        enableTime: true,
        dateFormat: 'd.m.Y H:i',
        onChange: (dates) => {
          if (dates[0]) {
            this._state.dateTo = dates[0].toISOString();
          }
        }
      });
    }
  }

  _destroyDatepickers() {
    if (this._datepickerFrom) {
      this._datepickerFrom.destroy();
    }
    if (this._datepickerTo) {
      this._datepickerTo.destroy();
    }
    this._datepickerFrom = null;
    this._datepickerTo = null;
  }

  _restoreHandlers() {
    const form = this.element.querySelector('form');
    const cancelBtn = this.element.querySelector('.event__reset-btn');
    const deleteBtn = this.element.querySelector('.event__delete-btn');
    const typeSelect = this.element.querySelector('[data-type-select]');
    const destinationSelect = this.element.querySelector('[data-destination-select]');
    const priceInput = this.element.querySelector('[data-price-input]');
    const startInput = this.element.querySelector('[data-start-date]');
    const endInput = this.element.querySelector('[data-end-date]');

    if (form) {
      form.addEventListener('submit', this._handleFormSubmit);
    }
    if (cancelBtn) {
      cancelBtn.addEventListener('click', this._handleCancelClick);
    }
    if (deleteBtn) {
      deleteBtn.addEventListener('click', this._handleDeleteClick);
    }
    if (typeSelect) {
      typeSelect.removeEventListener('change', this._handleTypeChange);
      typeSelect.addEventListener('change', this._handleTypeChange);
    }
    if (destinationSelect) {
      destinationSelect.addEventListener('change', this._handleDestinationChange);
    }
    if (priceInput) {
      priceInput.addEventListener('change', this._handlePriceChange);
    }
    if (startInput) {
      startInput.addEventListener('change', this._handleDateFromChange);
    }
    if (endInput) {
      endInput.addEventListener('change', this._handleDateToChange);
    }

    this._initDatepickers();
  }

  setFormSubmitHandler() {
    const form = this.element.querySelector('form');
    if (form) {
      form.addEventListener('submit', this._handleFormSubmit);
    }
  }

  setCancelClickHandler() {
    const btn = this.element.querySelector('.event__reset-btn');
    if (btn) {
      btn.addEventListener('click', this._handleCancelClick);
    }
  }

  setDeleteClickHandler() {
    const btn = this.element.querySelector('.event__delete-btn');
    if (btn) {
      btn.addEventListener('click', this._handleDeleteClick);
    }
  }

  updateElement(update) {
    if (update && update.type !== undefined) {
      this._state.type = update.type;
      this._state.selectedOfferIds = update.selectedOfferIds || [];
      const container = this.element.querySelector('[data-offers-container]');
      if (container) {
        const filteredOffers = this._allOffers.filter((offer) => offer.type === update.type);
        if (filteredOffers.length === 0) {
          container.innerHTML = '<p class="event__offer-title">No offers available</p>';
        } else {
          container.innerHTML = filteredOffers.map((offer) => `
            <div class="event__offer-selector">
              <input class="event__offer-checkbox"
                     type="checkbox"
                     id="offer-${offer.id}"
                     value="${offer.id}">
              <label for="offer-${offer.id}">
                ${offer.title} +€${offer.price}
              </label>
            </div>
          `).join('');
        }
      }
    } else {
      super.updateElement(update);
      this._restoreHandlers();
    }
  }

  removeElement() {
    this._destroyDatepickers();
    super.removeElement();
  }
}
