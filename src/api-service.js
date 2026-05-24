const AUTHORIZATION = 'Basic bigtrip2025superkey';
const END_POINT = 'https://21.objects.pages.academy/big-trip';

export default class ApiService {
  #endPoint = null;
  #authorization = null;

  constructor(endPoint, authorization) {
    this.#endPoint = endPoint;
    this.#authorization = authorization;
  }

  #adaptToClient(point) {
    const adaptedPoint = {
      id: point.id,
      basePrice: point.base_price,
      dateFrom: point.date_from,
      dateTo: point.date_to,
      destination: point.destination,
      isFavorite: point.is_favorite,
      offers: point.offers,
      type: point.type,
    };
    return adaptedPoint;
  }

  #adaptToServer(point) {
    const adaptedPoint = {
      'base_price': point.basePrice,
      'date_from': point.dateFrom,
      'date_to': point.dateTo,
      'destination': point.destination,
      'is_favorite': point.isFavorite,
      'offers': point.offers,
      'type': point.type,
    };
    if (point.id) adaptedPoint.id = point.id;
    return adaptedPoint;
  }

  async #load({ url, method = 'GET', body = null, headers = {} }) {
    const response = await fetch(`${this.#endPoint}${url}`, {
      method,
      headers: {
        'Authorization': this.#authorization,
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : null,
    });
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return response;
  }

  async getPoints() {
    const response = await this.#load({ url: '/points' });
    const points = await response.json();
    return points.map(this.#adaptToClient);
  }

  async getDestinations() {
    const response = await this.#load({ url: '/destinations' });
    return response.json();
  }

  async getOffers() {
    const response = await this.#load({ url: '/offers' });
    const offers = await response.json();
    return offers;
  }

  async updatePoint(point) {
    const serverPoint = this.#adaptToServer(point);
    const response = await this.#load({
      url: `/points/${point.id}`,
      method: 'PUT',
      body: serverPoint,
    });
    const updatedPoint = await response.json();
    return this.#adaptToClient(updatedPoint);
  }

  async addPoint(point) {
    const serverPoint = this.#adaptToServer(point);
    const response = await this.#load({
      url: '/points',
      method: 'POST',
      body: serverPoint,
    });
    const newPoint = await response.json();
    return this.#adaptToClient(newPoint);
  }

  async deletePoint(pointId) {
    await this.#load({ url: `/points/${pointId}`, method: 'DELETE' });
  }
}
