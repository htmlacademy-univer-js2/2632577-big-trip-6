export default class FilterModel {
  #activeFilter = 'everything';
  #observers = [];

  addObserver(observer) {
    this.#observers.push(observer);
  }

  removeObserver(observer) {
    this.#observers = this.#observers.filter(item => item !== observer);
  }

  #notifyObservers() {
    this.#observers.forEach(observer => observer());
  }

  setFilter(filterType) {
    if (this.#activeFilter !== filterType) {
      this.#activeFilter = filterType;
      this.#notifyObservers();
    }
  }

  getFilter() {
    return this.#activeFilter;
  }
}
