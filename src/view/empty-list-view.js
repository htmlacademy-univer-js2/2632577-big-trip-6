import AbstractView from '../framework/abstract-view.js';

export default class EmptyListView extends AbstractView {
  #filter = 'everything';

  constructor(filter) {
    super();
    this.#filter = filter;
  }

  get template() {
    const messages = {
      everything: 'Click New Event to create your first point',
      past: 'There are no past events now',
      present: 'There are no present events now',
      future: 'There are no future events now',
    };
    return `<p class="trip-events__msg">${messages[this.#filter]}</p>`;
  }
}
