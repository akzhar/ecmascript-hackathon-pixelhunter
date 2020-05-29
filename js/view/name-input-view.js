import AbstractView from "./abstract-view.js";

export default class NameInputView extends AbstractView {

  constructor() {
    super();
  }

  get template() {
    return `<input class="rules__input" type="text" placeholder="Ваше Имя">`;
  }

  render() {
    const parentElement = document.querySelector(`form.rules__form`);
    this.element.value = ``;
    parentElement.appendChild(this.element);
  }

  bind() {
    const nameInput = document.querySelector(`.rules__input`);
    const startBtn = document.querySelector(`.rules__button`);
    nameInput.addEventListener(`input`, () => {
      startBtn.disabled = (nameInput.value === ``) ? true : false;
    });
  }
}
