import AbstractView from '../framework/view/abstract-view.js';

export default class SortView extends AbstractView {
  constructor(currentSortType, onSortChange) {
    super();
    this._currentSortType = currentSortType;
    this._onSortChange = onSortChange;
    this._handleSortChange = this._handleSortChange.bind(this);
  }

  get template() {
    return `
      <form class="trip-events__trip-sort trip-sort" action="#" method="get">
        <div class="trip-sort__item trip-sort__item--day">
          <input
            id="sort-day"
            class="trip-sort__input visually-hidden"
            type="radio"
            name="trip-sort"
            value="day"
            data-sort-type="day"
            ${this._currentSortType === 'day' ? 'checked' : ''}
          >
          <label class="trip-sort__btn" for="sort-day">Day</label>
        </div>
        <div class="trip-sort__item trip-sort__item--event">
          <input
            id="sort-event"
            class="trip-sort__input visually-hidden"
            type="radio"
            name="trip-sort"
            value="event"
            data-sort-type="event"
            disabled
          >
          <label class="trip-sort__btn" for="sort-event">Event</label>
        </div>
        <div class="trip-sort__item trip-sort__item--time">
          <input
            id="sort-time"
            class="trip-sort__input visually-hidden"
            type="radio"
            name="trip-sort"
            value="time"
            data-sort-type="time"
            disabled
          >
          <label class="trip-sort__btn" for="sort-time">Time</label>
        </div>
        <div class="trip-sort__item trip-sort__item--price">
          <input
            id="sort-price"
            class="trip-sort__input visually-hidden"
            type="radio"
            name="trip-sort"
            value="price"
            data-sort-type="price"
            ${this._currentSortType === 'price' ? 'checked' : ''}
          >
          <label class="trip-sort__btn" for="sort-price">Price</label>
        </div>
        <div class="trip-sort__item trip-sort__item--offers">
          <input
            id="sort-offers"
            class="trip-sort__input visually-hidden"
            type="radio"
            name="trip-sort"
            value="offers"
            data-sort-type="offers"
            disabled
          >
          <label class="trip-sort__btn" for="sort-offers">Offers</label>
        </div>
      </form>
    `;
  }

  _handleSortChange(evt) {
    if (evt.target.classList.contains('trip-sort__input')) {
      const sortType = evt.target.dataset.sortType;
      if (sortType && this._currentSortType !== sortType) {
        this._onSortChange(sortType);
      }
    }
  }

  setSortChangeHandler() {
    this.element.addEventListener('change', this._handleSortChange);
  }
}
