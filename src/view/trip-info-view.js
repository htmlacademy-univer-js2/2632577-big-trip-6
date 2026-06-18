import AbstractView from '../framework/view/abstract-view.js';

const createTripInfoTemplate = (destinations, startDate, endDate, totalPrice, totalCitiesCount) => {
  let routeText = '';

  if (destinations.length === 0 || totalCitiesCount === 0) {
    routeText = '';
  } else if (totalCitiesCount === 1) {
    routeText = destinations[0];
  } else if (totalCitiesCount === 2) {
    routeText = `${destinations[0]} &mdash; ${destinations[1]}`;
  } else {
    routeText = `${destinations[0]} &mdash; ... &mdash; ${destinations[1]}`;
  }

  const formatDate = (date) => {
    if (!date) {
      return '';
    }
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const startDateFormatted = startDate ? formatDate(startDate) : '';
  const endDateFormatted = endDate ? formatDate(endDate) : '';
  const dateText = startDate && endDate ? `${startDateFormatted}&nbsp;&nbsp;&mdash;&nbsp;&nbsp;${endDateFormatted}` : '';

  return `
    <div class="trip-info">
      <div class="trip-info__main">
        <h1 class="trip-info__title">${routeText}</h1>
        <p class="trip-info__dates">${dateText}</p>
      </div>
      <p class="trip-info__cost">
        Total: &euro;&nbsp;<span class="trip-info__cost-value">${totalPrice}</span>
      </p>
    </div>
  `;
};

export default class TripInfoView extends AbstractView {
  constructor(destinations, startDate, endDate, totalPrice, totalCitiesCount) {
    super();
    this._destinations = destinations;
    this._startDate = startDate;
    this._endDate = endDate;
    this._totalPrice = totalPrice;
    this._totalCitiesCount = totalCitiesCount;
  }

  get template() {
    return createTripInfoTemplate(
      this._destinations,
      this._startDate,
      this._endDate,
      this._totalPrice,
      this._totalCitiesCount,
    );
  }
}
