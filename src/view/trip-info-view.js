import AbstractView from '../framework/view/abstract-view.js';

export default class TripInfoView extends AbstractView {
  #route = '';
  #dates = '';
  #totalPrice = 0;

  constructor(route, dates, totalPrice) {
    super();
    this.#route = route;
    this.#dates = dates;
    this.#totalPrice = totalPrice;
  }

  get template() {
    return `
      <section class="trip-main__trip-info  trip-info">
        <div class="trip-info__main">
          <h1 class="trip-info__title">${this.#route}</h1>
          <p class="trip-info__dates">${this.#dates}</p>
        </div>
        <p class="trip-info__cost">
          Total: &euro;&nbsp;<span class="trip-info__cost-value">${this.#totalPrice}</span>
        </p>
      </section>
    `;
  }
}
