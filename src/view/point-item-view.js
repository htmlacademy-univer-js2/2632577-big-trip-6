import AbstractView from '../framework/abstract-view.js';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration.js';
dayjs.extend(duration);

export default class PointItemView extends AbstractView {
  #point = null;
  #destination = null;
  #offers = [];

  constructor(point, destination, offers) {
    super();
    this.#point = point;
    this.#destination = destination;
    this.#offers = offers;
  }

  get template() {
    const { type, dateFrom, dateTo, basePrice, isFavorite } = this.#point;
    const start = dayjs(dateFrom);
    const end = dayjs(dateTo);
    const formattedDate = start.format('MMM D').toUpperCase();
    const startTime = start.format('HH:mm');
    const endTime = end.format('HH:mm');
    const diff = dayjs.duration(end.diff(start));
    const days = diff.days();
    const hours = diff.hours();
    const minutes = diff.minutes();
    let durationStr = '';
    if (days) durationStr += `${days}D `;
    if (hours || days) durationStr += `${hours}H `;
    durationStr += `${minutes}M`;
    const favClass = isFavorite ? 'event__favorite-btn--active' : '';

    return `
      <div class="event">
        <time class="event__date" datetime="${start.format('YYYY-MM-DD')}">${formattedDate}</time>
        <div class="event__type">
          <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
        </div>
        <h3 class="event__title">${type} ${this.#destination?.name || ''}</h3>
        <div class="event__schedule">
          <p class="event__time">
            <time class="event__start-time" datetime="${dateFrom}">${startTime}</time>
            &mdash;
            <time class="event__end-time" datetime="${dateTo}">${endTime}</time>
          </p>
          <p class="event__duration">${durationStr}</p>
        </div>
        <p class="event__price">&euro;&nbsp;<span class="event__price-value">${basePrice}</span></p>
        <h4 class="visually-hidden">Offers:</h4>
        <ul class="event__selected-offers">
          ${this.#offers.map(o => `<li class="event__offer"><span class="event__offer-title">${o.title}</span>&plus;&euro;&nbsp;<span class="event__offer-price">${o.price}</span></li>`).join('')}
        </ul>
        <button class="event__favorite-btn ${favClass}" type="button">...</button>
        <button class="event__rollup-btn" type="button">...</button>
      </div>
    `;
  }

  setEditClickHandler(cb) {
    this._callback.edit = cb;
    this.element.querySelector('.event__rollup-btn').addEventListener('click', (evt) => {
      evt.preventDefault();
      cb();
    });
  }
  setFavoriteClickHandler(cb) {
    this._callback.fav = cb;
    this.element.querySelector('.event__favorite-btn').addEventListener('click', (evt) => {
      evt.preventDefault();
      cb();
    });
  }
}
