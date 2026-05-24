import FilterView from '../view/filter-view.js';
import { render } from '../framework/render.js';

export default class FilterPresenter {
  #filterModel = null;
  #tripModel = null;
  #filterComponent = null;
  #container = null;

  constructor(container, filterModel, tripModel) {
    this.#container = container;
    this.#filterModel = filterModel;
    this.#tripModel = tripModel;
  }

  init() {
    const filters = this.#tripModel.getFilters();
    this.#filterComponent = new FilterView(filters);
    this.#filterComponent.setFilterChangeHandler(this.#handleFilterChange.bind(this));
    render(this.#filterComponent, this.#container);
  }

  #handleFilterChange(filterType) {
    this.#filterModel.setFilter(filterType);
  }
}
