import AbstractView from '../framework/abstract-view.js';

export default class PointFormView extends AbstractView {
  constructor() {
    super();
  }

  get template() {
    return `
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/flight.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle visually-hidden" id="event-type-toggle-1" type="checkbox">
            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${this.#getTypeRadios()}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group event__field-group--destination">
            <label class="event__label event__type-output" for="event-destination-1">Flight</label>
            <input class="event__input event__input--destination" id="event-destination-1" type="text" name="event-destination" value="" list="destination-list-1">
            <datalist id="destination-list-1"></datalist>
          </div>

          <div class="event__field-group event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input event__input--time" id="event-start-time-1" type="datetime-local" name="event-start-time" value="">
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input event__input--time" id="event-end-time-1" type="datetime-local" name="event-end-time" value="">
          </div>

          <div class="event__field-group event__field-group--price">
            <label class="visually-hidden" for="event-price-1">Price</label>
            <input class="event__input event__input--price" id="event-price-1" type="text" name="event-price" value="">
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
            <div class="event__available-offers"></div>
          </section>
          <section class="event__section event__section--destination">
            <h3 class="event__section-title event__section-title--destination">Destination</h3>
            <p class="event__destination-description"></p>
            <div class="event__photos-container">
              <div class="event__photos-tape"></div>
            </div>
          </section>
        </section>
      </form>
    `;
  }

  #getTypeRadios() {
    const eventTypes = [
      'taxi', 'bus', 'train', 'ship', 'drive', 'flight',
      'check-in', 'sightseeing', 'restaurant'
    ];
    return eventTypes.map(t => `
      <div class="event__type-item">
        <input id="event-type-${t}-1" class="event__type-input visually-hidden" type="radio" name="event-type" value="${t}">
        <label class="event__type-label event__type-label--${t}" for="event-type-${t}-1">${t}</label>
      </div>
    `).join('');
  }

  setSubmitHandler(callback) {
    this._callback.submit = callback;
    this.element.querySelector('form').addEventListener('submit', this.#submitHandler);
  }

  #submitHandler = (evt) => {
    evt.preventDefault();
    this._callback.submit();
  };

  setCloseHandler(callback) {
    this._callback.close = callback;
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#closeClickHandler);
  }

  #closeClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.close();
  };

  setEscKeydownHandler(callback) {
    this._callback.escKeydown = callback;
    document.addEventListener('keydown', this.#escKeydownHandler);
  }

  #escKeydownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this._callback.escKeydown();
    }
  };

  removeElement() {
    document.removeEventListener('keydown', this.#escKeydownHandler);
    super.removeElement();
  }
}
