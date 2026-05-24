import { generateDestinations, generateOffers, generatePoints } from '../mock/trip-mock.js';

export default class TripModel {
  #destinations = null;
  #offers = null;
  #points = null;

  constructor() {
    this.#destinations = generateDestinations();
    this.#offers = generateOffers();
    this.#points = generatePoints(this.#destinations, this.#offers);
  }

  getDestinations() {
    return this.#destinations;
  }

  getOffers() {
    return this.#offers;
  }

  getPoints() {
    return this.#points;
  }

  getDestinationById(id) {
    return this.#destinations.find(d => d.id === id);
  }

  getOffersByType(type) {
    return this.#offers.filter(offer => offer.type === type);
  }

  getOffersByIds(ids) {
    return this.#offers.filter(offer => ids.includes(offer.id));
  }
}
