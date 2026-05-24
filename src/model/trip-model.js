import {
  generateDestinations,
  generateOffers,
  generatePoints
} from '../mock/trip-mock.js';

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
    return this.#destinations.find(dest => dest.id === id);
  }

  getOffersByIds(ids) {
    return this.#offers.filter(offer => ids.includes(offer.id));
  }

  getOffersByType(type) {
    return this.#offers.filter(offer => offer.type === type);
  }

  updatePoint(updatedPoint) {
    const index = this.#points.findIndex(p => p.id === updatedPoint.id);
    if (index !== -1) {
      this.#points[index] = { ...this.#points[index], ...updatedPoint };
    }
  }

  getFilters(points) {
    const now = new Date();
    const filters = [
      { name: 'everything', title: 'Everything', isChecked: true, isDisabled: false },
      { name: 'future', title: 'Future', isChecked: false, isDisabled: true },
      { name: 'present', title: 'Present', isChecked: false, isDisabled: true },
      { name: 'past', title: 'Past', isChecked: false, isDisabled: true }
    ];

    filters.forEach(filter => {
      if (filter.name === 'future') {
        filter.isDisabled = !points.some(p => new Date(p.startDateTime) > now);
      } else if (filter.name === 'present') {
        filter.isDisabled = !points.some(p => {
          const start = new Date(p.startDateTime);
          const end = new Date(p.endDateTime);
          return start <= now && now <= end;
        });
      } else if (filter.name === 'past') {
        filter.isDisabled = !points.some(p => new Date(p.endDateTime) < now);
      }
    });
    return filters;
  }
}
