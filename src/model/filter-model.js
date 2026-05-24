export default class FilterModel {
  #activeFilter = 'everything';
  #observers = [];

  addObserver(observer) { this.#observers.push(observer); }
  removeObserver(observer) { this.#observers = this.#observers.filter(o => o !== observer); }
  #notify() { this.#observers.forEach(o => o()); }

  setFilter(filter) {
    if (this.#activeFilter === filter) return;
    this.#activeFilter = filter;
    this.#notify();
  }
  getFilter() { return this.#activeFilter; }
}
