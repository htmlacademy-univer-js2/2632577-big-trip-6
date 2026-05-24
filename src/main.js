import TripPresenter from './src/presenter/trip-presenter.js';
import TripModel from './src/model/trip-model.js';

const model = new TripModel();
const presenter = new TripPresenter(model);
presenter.init();
