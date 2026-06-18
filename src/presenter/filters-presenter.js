import FiltersView from '../view/filters-view.js';

export default class FiltersPresenter {
  constructor(container, tripModel) {
    this._container = container;
    this._tripModel = tripModel;
    this._filtersView = null;
    this._isInitialized = false;

    this._handleFilterChange = this._handleFilterChange.bind(this);
    this._handleModelChange = this._handleModelChange.bind(this);
  }

  init() {
    if (this._isInitialized) {
      return;
    }

    this._tripModel.addObserver(this._handleModelChange);
    this._renderFilters();
    this._isInitialized = true;
  }

  _handleModelChange() {
    if (this._isInitialized) {
      this._renderFilters();
    }
  }

  _handleFilterChange(filterType) {
    this._tripModel.setFilter(filterType);
  }

  _renderFilters() {
    const filters = this._tripModel.getFilters();

    if (this._filtersView) {
      this._filtersView.removeElement();
    }

    this._filtersView = new FiltersView(filters, this._handleFilterChange);
    this._filtersView.setEventListeners();

    this._container.innerHTML = '';
    this._container.appendChild(this._filtersView.element);
  }
}
