import AbstractView from '../framework/abstract-view.js';

export default class FilterView extends AbstractView {
  #filters = [];
  #onChange = null;

  constructor(filters) {
    super();
    this.#filters = filters;
  }

  get template() {
    return `
      <form class="trip-filters" action="#" method="get">
        ${this.#filters.map(f => `
          <div class="trip-filters__filter">
            <input id="filter-${f.name}" class="trip-filters__filter-input visually-hidden" type="radio" name="trip-filter" value="${f.name}" ${f.isChecked ? 'checked' : ''} ${f.isDisabled ? 'disabled' : ''}>
            <label class="trip-filters__filter-label" for="filter-${f.name}">${f.title}</label>
          </div>
        `).join('')}
        <button class="visually-hidden" type="submit">Accept filter</button>
      </form>
    `;
  }

  setFilterChangeHandler(callback) {
    this.#onChange = callback;
    this.element.querySelectorAll('.trip-filters__filter-input').forEach(input => {
      if (!input.disabled) input.addEventListener('change', this.#changeHandler);
    });
  }

  #changeHandler = (evt) => {
    this.#onChange?.(evt.target.value);
  };
}
