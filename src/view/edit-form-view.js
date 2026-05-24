
export default class EditFormView {
  constructor(point = null, destination = null, selectedOffers = [], allOffersByType = []) {
    this._point = point;
    this._destination = destination;
    this._selectedOffers = selectedOffers;
    this._allOffersByType = allOffersByType;
    this._element = null;
  }

  getTemplate() {
    const point = this._point || {};
    const destination = this._destination || {};
    const selectedOffers = this._selectedOffers || [];
    const allOffers = this._allOffersByType || [];

    const {
      id = '',
      type = 'flight',
      startDateTime = '',
      endDateTime = '',
      basePrice = 0,
      isFavorite = false,
      destinationId = '',
      offersIds = []
    } = point;

    const destinationName = destination.name || '';
    const destinationDescription = destination.description || '';
    const destinationPictures = destination.pictures || [];

    const formatDateForInput = (isoString) => {
      if (!isoString) return '';
      return isoString.slice(0, 16);
    };

    const startDateValue = formatDateForInput(startDateTime);
    const endDateValue = formatDateForInput(endDateTime);

    const eventTypes = [
      'taxi', 'bus', 'train', 'ship', 'drive', 'flight',
      'check-in', 'sightseeing', 'restaurant'
    ];

    const typesRadios = eventTypes.map(t => `
      <div class="event__type-item">
        <input id="event-type-${t}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${t}" ${t === type ? 'checked' : ''}>
        <label class="event__type-label  event__type-label--${t}" for="event-type-${t}-1">${t}</label>
      </div>
    `).join('');

    const offersCheckboxes = allOffers.map(offer => {
      const isChecked = selectedOffers.some(selected => selected.id === offer.id);
      return `
        <div class="event__offer-selector">
          <input class="event__offer-checkbox  visually-hidden" id="offer-${offer.id}" type="checkbox" name="offer" value="${offer.id}" ${isChecked ? 'checked' : ''}>
          <label class="event__offer-label" for="offer-${offer.id}">
            <span class="event__offer-title">${offer.title}</span>
            &plus;&euro;&nbsp;
            <span class="event__offer-price">${offer.price}</span>
          </label>
        </div>
      `;
    }).join('');

    const picturesHtml = destinationPictures.map((pic, idx) => `
      <img class="event__photo" src="${pic.src}" alt="${pic.description}">
    `).join('');

    return `
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">
            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${typesRadios}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination-1">${type}</label>
            <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destinationName}" list="destination-list-1">
            <datalist id="destination-list-1">
              <!-- Здесь можно динамически подставить список городов -->
            </datalist>
          </div>

          <div class="event__field-group  event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input  event__input--time" id="event-start-time-1" type="datetime-local" name="event-start-time" value="${startDateValue}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input  event__input--time" id="event-end-time-1" type="datetime-local" name="event-end-time" value="${endDateValue}">
          </div>

          <div class="event__field-group  event__field-group--price">
            <label class="visually-hidden" for="event-price-1">Price</label>
            <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${basePrice}">
          </div>

          <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">Delete</button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Close event</span>
          </button>
        </header>

        <section class="event__details">
          <section class="event__section  event__section--offers">
            <h3 class="event__section-title  event__section-title--offers">Offers</h3>
            <div class="event__available-offers">
              ${offersCheckboxes || '<p>No offers available</p>'}
            </div>
          </section>

          <section class="event__section  event__section--destination">
            <h3 class="event__section-title  event__section-title--destination">Destination</h3>
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

  getElement() {
    if (!this._element) {
      this._element = document.createElement('li');
      this._element.className = 'trip-events__item';
      this._element.innerHTML = this.getTemplate();
    }
    return this._element;
  }

  removeElement() {
    this._element = null;
  }
}
