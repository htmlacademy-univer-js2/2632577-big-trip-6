import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import PointFormView from '../view/point-form-view.js';
import EditFormView from '../view/edit-form-view.js';
import PointItemView from '../view/point-item-view.js';
import { render } from '../utils/render.js'; 

export default class TripPresenter {
  constructor() {
    this.filtersContainer = document.querySelector('.trip-controls__filters');
    this.tripEventsContainer = document.querySelector('.trip-events');
    this.tripMain = document.querySelector('.trip-main');
  }

  init() {
    const filterView = new FilterView();
    render(filterView, this.filtersContainer);

    const sortView = new SortView();
    this.tripEventsContainer.prepend(sortView.getElement());

    const listContainer = document.createElement('ul');
    listContainer.className = 'trip-events__list';
    this.tripEventsContainer.appendChild(listContainer);

    const editFormView = new EditFormView();
    render(editFormView, listContainer);

    for (let i = 0; i < 3; i++) {
      const pointItemView = new PointItemView();
      render(pointItemView, listContainer);
    }

    const pointFormView = new PointFormView();
    const newEventBtn = this.tripMain.querySelector('.trip-main__event-add-btn');
    if (newEventBtn) {
      newEventBtn.insertAdjacentElement('afterend', pointFormView.getElement());
    } else {
      render(pointFormView, this.tripMain);
    }
  }
}
