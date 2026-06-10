import ApiService from './api-service.js';
import TripModel from './model/trip-model.js';
import FilterModel from './model/filter-model.js';
import TripPresenter from './presenter/trip-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';

const END_POINT = 'https://21.objects.pages.academy/big-trip';
const AUTHORIZATION = 'Basic bigtrip2025superkey';
const api = new ApiService(END_POINT, AUTHORIZATION);

const tripModel = new TripModel(api);
const filterModel = new FilterModel();

const filtersContainer = document.querySelector('.trip-controls__filters');
const filterPresenter = new FilterPresenter(filtersContainer, filterModel, tripModel);
filterPresenter.init();

const tripPresenter = new TripPresenter(tripModel, filterModel);
tripPresenter.init();
