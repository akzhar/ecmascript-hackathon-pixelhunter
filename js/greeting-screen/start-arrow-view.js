import AbstractView from "../abstract-view.js";

export default class StartArrowView extends AbstractView {

  constructor() {
    super();
  }

  get template() {
    return `<button class="greeting__continue" type="button">
              <span class="visually-hidden">Продолжить</span>
              <svg class="icon" width="64" height="64" viewBox="0 0 64 64" fill="#000000">
                <use xlink:href="img/sprite.svg#arrow-right"></use>
              </svg>
            </button>`;
  }

  render() {
    const parentElement = document.querySelector(`section.greeting`);
    parentElement.appendChild(this.element);
  }

  bind(cb) {
    const startArrow = document.querySelector(`.greeting__continue`);
    startArrow.addEventListener(`click`, cb);
  }
}
