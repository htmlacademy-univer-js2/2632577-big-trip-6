import TripInfoView from '../view/trip-info-view.js';
import { remove } from '../framework/render.js';

export default class TripInfoPresenter {
  constructor(container, tripModel) {
    this._container = container;
    this._tripModel = tripModel;
    this._tripInfoView = null;

    this._handleModelChange = this._handleModelChange.bind(this);
  }

  init() {
    this._tripModel.addObserver(this._handleModelChange);
    this._renderTripInfo();
  }

  _handleModelChange() {
    this._renderTripInfo();
  }

  _renderTripInfo() {
    if (!this._container) {
      return;
    }

    const waypoints = this._tripModel.getWaypoints();

    if (waypoints.length === 0) {
      if (this._tripInfoView) {
        remove(this._tripInfoView);
        this._tripInfoView = null;
      }
      return;
    }

    const sortedWaypoints = [...waypoints].sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));

    const uniqueCities = [];
    for (const waypoint of sortedWaypoints) {
      const destination = this._tripModel.getDestinationById(waypoint.destinationId);
      if (destination && destination.name && destination.name !== 'Unknown') {
        if (!uniqueCities.includes(destination.name)) {
          uniqueCities.push(destination.name);
        }
      }
    }

    const totalCitiesCount = uniqueCities.length;
    const firstCity = uniqueCities[0] || 'Unknown';
    const lastCity = uniqueCities[uniqueCities.length - 1] || 'Unknown';
    const destinations = [firstCity, lastCity];
    const startDate = sortedWaypoints[0]?.dateFrom;
    const endDate = sortedWaypoints[sortedWaypoints.length - 1]?.dateTo;

    let totalPrice = 0;
    for (const waypoint of waypoints) {
      totalPrice += waypoint.basePrice;
      const offers = this._tripModel.getOffersForWaypoint(waypoint.id);
      for (const offer of offers) {
        totalPrice += offer.price;
      }
    }

    if (this._tripInfoView) {
      remove(this._tripInfoView);
    }

    this._tripInfoView = new TripInfoView(destinations, startDate, endDate, totalPrice, totalCitiesCount);
    this._container.appendChild(this._tripInfoView.element);
  }
}
