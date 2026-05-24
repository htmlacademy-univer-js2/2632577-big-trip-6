import AbstractView from '../framework/abstract-view.js';

export default class ErrorLoadView extends AbstractView {
  get template() {
    return '<p class="trip-events__msg">Failed to load latest route information</p>';
  }
}
