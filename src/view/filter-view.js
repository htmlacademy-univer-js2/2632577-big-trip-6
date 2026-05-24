import AbstractView from '../framework/abstract-view.js';

export default class FilterView extends AbstractView {
  #filters = [];
  #onFilterChange = null;

  constructor(filters) {
    super();
    this.#filters = filters;
  }

  get template() {
    return `
      <form class="trip-filters" action="#" method="get">
        ${this.#filters.map(filter => `
          <div class="trip-filters__filter">
            <input id="filter-${filter.name}" class="trip-filters__filter-input visually-hidden" type="radio" name="trip-filter" value="${filter.name}" ${filter.isChecked ? 'checked' : ''} ${filter.isDisabled ? 'disabled' : ''}>
            <label class="trip-filters__filter-label" for="filter-${filter.name}">${filter.title}</label>
          </div>
        `).join('')}
        <button class="visually-hidden" type="submit">Accept filter</button>
      </form>
    `;
  }

  setFilterChangeHandler(callback) {
    this.#onFilterChange = callback;
    this.element.querySelectorAll('.trip-filters__filter-input').forEach(input => {
      if (!input.disabled) {
        input.addEventListener('change', this.#filterChangeHandler);
      }
    });
  }

  #filterChangeHandler = (evt) => {
    this.#onFilterChange?.(evt.target.value);
  };
}
