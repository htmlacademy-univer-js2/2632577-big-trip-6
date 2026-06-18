import AbstractView from '../framework/view/abstract-view.js';

const createFilterTemplate = (filters) => filters.map((filter) => `
  <div class="trip-filters__filter">
    <input
      id="filter-${filter.type}"
      class="trip-filters__filter-input visually-hidden"
      type="radio"
      name="trip-filter"
      value="${filter.type}"
      ${filter.isActive ? 'checked' : ''}
      ${filter.isDisabled ? 'disabled' : ''}
    >
    <label class="trip-filters__filter-label" for="filter-${filter.type}">${filter.name}</label>
  </div>
`).join('');

export default class FiltersView extends AbstractView {
  constructor(filters, onFilterChange) {
    super();
    this._filters = filters;
    this._onFilterChange = onFilterChange;
    this._handleFilterChange = this._handleFilterChange.bind(this);
  }

  get template() {
    return `
      <form class="trip-filters" action="#" method="get">
        ${createFilterTemplate(this._filters)}
        <button class="visually-hidden" type="submit">Accept filter</button>
      </form>
    `;
  }

  _handleFilterChange(evt) {
    const filterInput = evt.target.closest('.trip-filters__filter-input');
    if (filterInput && filterInput.value && !filterInput.disabled) {
      this._onFilterChange(filterInput.value);
    }
  }

  setEventListeners() {
    const filterElements = this.element.querySelectorAll('.trip-filters__filter-input');
    filterElements.forEach((filter) => {
      filter.addEventListener('change', this._handleFilterChange);
    });
  }
}
