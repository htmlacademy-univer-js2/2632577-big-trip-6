import FilterView from '../view/filter-view.js';
import { render } from '../framework/render.js';

export default class FilterPresenter {
  #container = null;
  #filterModel = null;
  #tripModel = null;
  #view = null;

  constructor(container, filterModel, tripModel) {
    this.#container = container;
    this.#filterModel = filterModel;
    this.#tripModel = tripModel;
  }

  init() {
    const filters = this.#tripModel.getFilters();
    this.#view = new FilterView(filters);
    this.#view.setFilterChangeHandler((filterType) => {
      this.#filterModel.setFilter(filterType);
    });
    render(this.#view, this.#container);
    this.#tripModel.addObserver(() => this.#refresh());
    this.#filterModel.addObserver(() => this.#refresh());
  }

  #refresh() {
    const filters = this.#tripModel.getFilters();
    this.#view.updateElement(filters);
  }
}
