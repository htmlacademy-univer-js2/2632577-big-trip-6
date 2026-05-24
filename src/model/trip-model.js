import {
  generateDestinations,
  generateOffers,
  generatePoints
} from '../mock/trip-mock.js';

export default class TripModel {
  #destinations = null;
  #offers = null;
  #points = null;

  #observers = [];

  constructor() {
    this.#destinations = generateDestinations();
    this.#offers = generateOffers();
    this.#points = generatePoints(this.#destinations, this.#offers);
  }

  addObserver(observer) {
    this.#observers.push(observer);
  }

  removeObserver(observer) {
    this.#observers = this.#observers.filter(item => item !== observer);
  }

  #notifyObservers() {
    this.#observers.forEach(observer => observer());
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

  getDestinationByName(name) {
    return this.#destinations.find(dest => dest.name === name);
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
      this.#notifyObservers();
    }
  }

  addPoint(newPoint) {
    this.#points.push(newPoint);
    this.#notifyObservers();
  }

  deletePoint(pointId) {
    const index = this.#points.findIndex(p => p.id === pointId);
    if (index !== -1) {
      this.#points.splice(index, 1);
      this.#notifyObservers();
    }
  }

  getPointsSortedBy(sortType, points = this.#points) {
    const pointsCopy = [...points];
    switch (sortType) {
      case 'time':
        return pointsCopy.sort((a, b) => {
          const durationA = new Date(a.endDateTime) - new Date(a.startDateTime);
          const durationB = new Date(b.endDateTime) - new Date(b.startDateTime);
          return durationA - durationB;
        });
      case 'price':
        return pointsCopy.sort((a, b) => b.basePrice - a.basePrice);
      default:
        return pointsCopy.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
    }
  }

  getPointsFilteredBy(filterType, points = this.#points) {
    const now = new Date();
    switch (filterType) {
      case 'future':
        return points.filter(p => new Date(p.startDateTime) > now);
      case 'present':
        return points.filter(p => {
          const start = new Date(p.startDateTime);
          const end = new Date(p.endDateTime);
          return start <= now && now <= end;
        });
      case 'past':
        return points.filter(p => new Date(p.endDateTime) < now);
      default:
        return [...points];
    }
  }

  getFilters(points = this.#points) {
    const now = new Date();
    return [
      { name: 'everything', title: 'Everything', isChecked: true, isDisabled: false },
      { name: 'future', title: 'Future', isChecked: false, isDisabled: !points.some(p => new Date(p.startDateTime) > now) },
      { name: 'present', title: 'Present', isChecked: false, isDisabled: !points.some(p => {
        const start = new Date(p.startDateTime);
        const end = new Date(p.endDateTime);
        return start <= now && now <= end;
      }) },
      { name: 'past', title: 'Past', isChecked: false, isDisabled: !points.some(p => new Date(p.endDateTime) < now) }
    ];
  }
}
