import AbstractView from "../abstract-view.js";

export default class AsteriskView extends AbstractView {

  constructor() {
    super();
  }

  get template() {
    return `<button class="intro__asterisk asterisk" type="button"><span class="visually-hidden">Продолжить</span>*</button>`;
  }

  render() {
    const parentElement = document.querySelector(`#intro`);
    parentElement.insertBefore(this.element, parentElement.firstChild);
  }

  bind(cb) {
    const asterisk = document.querySelector(`.intro__asterisk`);
    asterisk.addEventListener(`click`, cb);
  }
}
