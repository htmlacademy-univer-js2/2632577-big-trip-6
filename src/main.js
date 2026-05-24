import TripModel from './src/model/trip-model.js';
import FilterModel from './src/model/filter-model.js';
import TripPresenter from './src/presenter/trip-presenter.js';
import FilterPresenter from './src/presenter/filter-presenter.js';

const tripModel = new TripModel();
const filterModel = new FilterModel();

const filtersContainer = document.querySelector('.trip-controls__filters');
const filterPresenter = new FilterPresenter(filtersContainer, filterModel, tripModel);
filterPresenter.init();

const tripPresenter = new TripPresenter(tripModel, filterModel);
tripPresenter.init();
