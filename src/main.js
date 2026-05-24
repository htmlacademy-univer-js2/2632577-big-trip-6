import ApiService from './src/api-service.js';
import TripModel from './src/model/trip-model.js';
import FilterModel from './src/model/filter-model.js';
import TripPresenter from './src/presenter/trip-presenter.js';
import FilterPresenter from './src/presenter/filter-presenter.js';

const api = new ApiService('https://21.objects.pages.academy/big-trip', 'Basic yourRandomSecretKey');
const tripModel = new TripModel(api);
const filterModel = new FilterModel();

const filtersContainer = document.querySelector('.trip-controls__filters');
const filterPresenter = new FilterPresenter(filtersContainer, filterModel, tripModel);
filterPresenter.init();

const tripPresenter = new TripPresenter(tripModel, filterModel);
tripPresenter.init();
