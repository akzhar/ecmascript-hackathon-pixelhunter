import AbstractView from "./abstract-view.js";

export default class StartButtonView extends AbstractView {

  constructor() {
    super();
  }

  get template() {
    return `<button class="rules__button  continue" type="submit" disabled>Go!</button>`;
  }

  render() {
    const parentElement = document.querySelector(`form.rules__form`);
    parentElement.appendChild(this.element);
  }

  bind(cb) {
    const startBtn = document.querySelector(`.rules__button`);
    startBtn.addEventListener(`click`, cb);
  }
}
