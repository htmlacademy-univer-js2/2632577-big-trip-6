import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import PointFormView from '../view/point-form-view.js';
import EditFormView from '../view/edit-form-view.js';
import PointItemView from '../view/point-item-view.js';
import { render } from '../utils/render.js';

export default class TripPresenter {
  #model = null;
  #filtersContainer = null;
  #tripEventsContainer = null;
  #tripMain = null;
  #listContainer = null;

  constructor(model) {
    this.#model = model;
    this.#filtersContainer = document.querySelector('.trip-controls__filters');
    this.#tripEventsContainer = document.querySelector('.trip-events');
    this.#tripMain = document.querySelector('.trip-main');
  }

  init() {
    const filterView = new FilterView();
    render(filterView, this.#filtersContainer);

    const sortView = new SortView();
    this.#tripEventsContainer.prepend(sortView.getElement());

    this.#listContainer = document.createElement('ul');
    this.#listContainer.className = 'trip-events__list';
    this.#tripEventsContainer.appendChild(this.#listContainer);

    const destinations = this.#model.getDestinations();
    const offers = this.#model.getOffers();
    const points = this.#model.getPoints();

    const firstPoint = points[0];
    const firstDest = destinations.find(d => d.id === firstPoint.destinationId);
    const firstOffers = offers.filter(o => firstPoint.offersIds.includes(o.id));
    const editForm = new EditFormView(firstPoint, firstDest, firstOffers);
    render(editForm, this.#listContainer);


    const pointsToShow = points.slice(1, 4);
    pointsToShow.forEach(point => {
      const destination = destinations.find(d => d.id === point.destinationId);
      const pointOffers = offers.filter(o => point.offersIds.includes(o.id));
      const pointView = new PointItemView(point, destination, pointOffers);
      render(pointView, this.#listContainer);
    });

    const createForm = new PointFormView(null);
    const newEventBtn = this.#tripMain.querySelector('.trip-main__event-add-btn');
    if (newEventBtn) {
      newEventBtn.insertAdjacentElement('afterend', createForm.getElement());
    } else {
      render(createForm, this.#tripMain);
    }
  }
}
