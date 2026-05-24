export default class PointItemView {
  constructor(point, destination, offers) {
    this._point = point;
    this._destination = destination;
    this._offers = offers; 
    this._element = null;
  }

  getTemplate() {
    const { type, startDateTime, endDateTime, basePrice, isFavorite } = this._point;
    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);
    const formattedDate = startDate.toLocaleString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
    const startTime = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const duration = Math.round((endDate - startDate) / (1000 * 60)); // minutes
    const durationStr = duration >= 60 ? `${Math.floor(duration/60)}H ${duration%60}M` : `${duration}M`;

    const favoriteClass = isFavorite ? 'event__favorite-btn--active' : '';

    return `
      <div class="event">
        <time class="event__date" datetime="${startDate.toISOString().slice(0,10)}">${formattedDate}</time>
        <div class="event__type">
          <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
        </div>
        <h3 class="event__title">${type} ${this._destination.name}</h3>
        <div class="event__schedule">
          <p class="event__time">
            <time class="event__start-time" datetime="${startDateTime}">${startTime}</time>
            &mdash;
            <time class="event__end-time" datetime="${endDateTime}">${endTime}</time>
          </p>
          <p class="event__duration">${durationStr}</p>
        </div>
        <p class="event__price">&euro;&nbsp;<span class="event__price-value">${basePrice}</span></p>
        <h4 class="visually-hidden">Offers:</h4>
        <ul class="event__selected-offers">
          ${this._offers.map(offer => `
            <li class="event__offer">
              <span class="event__offer-title">${offer.title}</span>
              &plus;&euro;&nbsp;
              <span class="event__offer-price">${offer.price}</span>
            </li>
          `).join('')}
        </ul>
        <button class="event__favorite-btn ${favoriteClass}" type="button">
          <span class="visually-hidden">Add to favorite</span>
          <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
            <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
          </svg>
        </button>
        <button class="event__rollup-btn" type="button">
          <span class="visually-hidden">Open event</span>
        </button>
      </div>
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
