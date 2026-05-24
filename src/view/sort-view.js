import AbstractView from '../framework/abstract-view.js';

export default class SortView extends AbstractView {
  #currentSortType = 'day';
  #onSortTypeChange = null;

  constructor(onSortTypeChange) {
    super();
    this.#onSortTypeChange = onSortTypeChange;
  }

  get template() {
    return `
      <form class="trip-events__trip-sort trip-sort" action="#" method="get">
        <div class="trip-sort__item trip-sort__item--day">
          <input id="sort-day" class="trip-sort__input visually-hidden" type="radio" name="trip-sort" value="sort-day" data-sort-type="day" ${this.#currentSortType === 'day' ? 'checked' : ''}>
          <label class="trip-sort__btn" for="sort-day">Day</label>
        </div>
        <div class="trip-sort__item trip-sort__item--event">
          <input id="sort-event" class="trip-sort__input visually-hidden" type="radio" name="trip-sort" value="sort-event" disabled>
          <label class="trip-sort__btn" for="sort-event">Event</label>
        </div>
        <div class="trip-sort__item trip-sort__item--time">
          <input id="sort-time" class="trip-sort__input visually-hidden" type="radio" name="trip-sort" value="sort-time" data-sort-type="time" ${this.#currentSortType === 'time' ? 'checked' : ''}>
          <label class="trip-sort__btn" for="sort-time">Time</label>
        </div>
        <div class="trip-sort__item trip-sort__item--price">
          <input id="sort-price" class="trip-sort__input visually-hidden" type="radio" name="trip-sort" value="sort-price" data-sort-type="price" ${this.#currentSortType === 'price' ? 'checked' : ''}>
          <label class="trip-sort__btn" for="sort-price">Price</label>
        </div>
        <div class="trip-sort__item trip-sort__item--offer">
          <input id="sort-offer" class="trip-sort__input visually-hidden" type="radio" name="trip-sort" value="sort-offer" disabled>
          <label class="trip-sort__btn" for="sort-offer">Offers</label>
        </div>
      </form>
    `;
  }

  setSortTypeChangeHandler(callback) {
    this.#onSortTypeChange = callback;
    this.element.querySelectorAll('.trip-sort__input').forEach(input => {
      if (!input.disabled) {
        input.addEventListener('change', this.#sortTypeChangeHandler);
      }
    });
  }

  #sortTypeChangeHandler = (evt) => {
    const sortType = evt.target.dataset.sortType;
    if (sortType && this.#onSortTypeChange && sortType !== this.#currentSortType) {
      this.#currentSortType = sortType;
      this.#onSortTypeChange(sortType);
    }
  };
}
