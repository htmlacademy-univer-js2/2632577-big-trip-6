import TripModel from './model/trip-model.js';
import TripPresenter from './presenter/trip-presenter.js';
import FiltersPresenter from './presenter/filters-presenter.js';
import TripInfoPresenter from './presenter/trip-info-presenter.js';
import Api from './api.js';

const tripEventsSection = document.querySelector('.trip-events');
const filtersContainer = document.querySelector('.trip-controls__filters');
const tripInfoContainer = document.querySelector('.trip-main__trip-info');

const api = new Api();
const tripModel = new TripModel(api);

const filtersPresenter = new FiltersPresenter(filtersContainer, tripModel);
const tripPresenter = new TripPresenter(tripEventsSection, tripModel);
const tripInfoPresenter = new TripInfoPresenter(tripInfoContainer, tripModel);

tripModel.init().then(() => {
  filtersPresenter.init();
  tripPresenter.init();
  tripInfoPresenter.init();
}).catch(() => {});
