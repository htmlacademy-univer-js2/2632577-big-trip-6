import AbstractView from '../framework/abstract-view.js';

export default class EmptyListView extends AbstractView {
  #filterType = 'everything';

  constructor(filterType) {
    super();
    this.#filterType = filterType;
  }

  get template() {
    const message = this.#getMessageByFilter();
    return `<p class="trip-events__msg">${message}</p>`;
  }

  #getMessageByFilter() {
    switch (this.#filterType) {
      case 'everything':
        return 'Click New Event to create your first point';
      case 'past':
        return 'There are no past events now';
      case 'present':
        return 'There are no present events now';
      case 'future':
        return 'There are no future events now';
      default:
        return 'Click New Event to create your first point';
    }
  }
}
