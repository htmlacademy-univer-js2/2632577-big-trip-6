export default class TripModel {
  #api = null;
  #destinations = [];
  #offers = [];
  #points = [];
  #observers = [];

  constructor(api) {
    this.#api = api;
  }

  async init() {
    try {
      const [destinations, offers, points] = await Promise.all([
        this.#api.getDestinations(),
        this.#api.getOffers(),
        this.#api.getPoints(),
      ]);
      this.#destinations = destinations;
      this.#offers = offers;
      this.#points = points;
    } catch (err) {
      this.#destinations = [];
      this.#offers = [];
      this.#points = [];
      throw err;
    }
    this.#notifyObservers();
  }

  getDestinations() { return this.#destinations; }
  getOffers() { return this.#offers; }
  getPoints() { return this.#points; }

  getDestinationById(id) {
    return this.#destinations.find(d => d.id === id);
  }

  getDestinationByName(name) {
    return this.#destinations.find(d => d.name === name);
  }

  getOffersByIds(ids) {
    const allOffers = this.#offers.flatMap(group => group.offers);
    return allOffers.filter(offer => ids.includes(offer.id));
  }

  getOffersByType(type) {
    const group = this.#offers.find(g => g.type === type);
    return group ? group.offers : [];
  }

  async updatePoint(updatedPoint) {
    const index = this.#points.findIndex(p => p.id === updatedPoint.id);
    if (index === -1) return;
    try {
      const newPoint = await this.#api.updatePoint(updatedPoint);
      this.#points[index] = newPoint;
      this.#notifyObservers();
    } catch (err) {
      console.error('Update failed', err);
      throw err;
    }
  }

  async addPoint(newPoint) {
    try {
      const point = await this.#api.addPoint(newPoint);
      this.#points.push(point);
      this.#notifyObservers();
    } catch (err) {
      console.error('Add failed', err);
      throw err;
    }
  }

  async deletePoint(pointId) {
    const index = this.#points.findIndex(p => p.id === pointId);
    if (index === -1) return;
    try {
      await this.#api.deletePoint(pointId);
      this.#points.splice(index, 1);
      this.#notifyObservers();
    } catch (err) {
      console.error('Delete failed', err);
      throw err;
    }
  }

  getPointsSortedBy(sortType, points = this.#points) {
    const copy = [...points];
    switch (sortType) {
      case 'time':
        return copy.sort((a, b) => {
          const durA = new Date(a.dateTo) - new Date(a.dateFrom);
          const durB = new Date(b.dateTo) - new Date(b.dateFrom);
          return durA - durB;
        });
      case 'price':
        return copy.sort((a, b) => b.basePrice - a.basePrice);
      default:
        return copy.sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
    }
  }

  getPointsFilteredBy(filterType, points = this.#points) {
    const now = new Date();
    switch (filterType) {
      case 'future':
        return points.filter(p => new Date(p.dateFrom) > now);
      case 'present':
        return points.filter(p => new Date(p.dateFrom) <= now && now <= new Date(p.dateTo));
      case 'past':
        return points.filter(p => new Date(p.dateTo) < now);
      default:
        return [...points];
    }
  }

  getFilters(points = this.#points) {
    const now = new Date();
    return [
      { name: 'everything', title: 'Everything', isChecked: true, isDisabled: false },
      { name: 'future', title: 'Future', isChecked: false, isDisabled: !points.some(p => new Date(p.dateFrom) > now) },
      { name: 'present', title: 'Present', isChecked: false, isDisabled: !points.some(p => new Date(p.dateFrom) <= now && now <= new Date(p.dateTo)) },
      { name: 'past', title: 'Past', isChecked: false, isDisabled: !points.some(p => new Date(p.dateTo) < now) }
    ];
  }

  addObserver(observer) { this.#observers.push(observer); }
  removeObserver(observer) { this.#observers = this.#observers.filter(o => o !== observer); }
  #notifyObservers() { this.#observers.forEach(o => o()); }
}
