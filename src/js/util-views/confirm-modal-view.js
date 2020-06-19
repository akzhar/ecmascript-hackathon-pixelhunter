import AbstractView from "../abstract-view.js";

export default class ConfirmModalView extends AbstractView {

  constructor() {
    super();
  }

  get template() {
    return `<section class="modal">
              <form class="modal__inner">
                <button class="modal__close" type="button">
                  <span class="visually-hidden">Закрыть</span>
                </button>
                <h2 class="modal__title">Подтверждение</h2>
                <p class="modal__text">Вы уверены что хотите начать игру заново?</p>
                <div class="modal__button-wrapper">
                  <button class="modal__btn modal__btn--ok">Ок</button>
                  <button class="modal__btn modal__btn--cancel">Отмена</button>
                </div>
              </form>
            </section>`;
  }

  render() {
    const parentElement = document.querySelector(`#main`);
    parentElement.appendChild(this.element);
  }

  bind(cb) {
    const parentElement = document.querySelector(`#main`);
    const modal = document.querySelector(`.modal`);
    const closeBtn = modal.querySelector(`.modal__close`);
    const cancelBtn = modal.querySelector(`.modal__btn--cancel`);
    const okBtn = modal.querySelector(`.modal__btn--ok`);
    document.addEventListener(`keydown`, (evt) => {
      if (evt.keyCode === 27) {
        evt.preventDefault();
        parentElement.removeChild(modal);
      }
    });
    closeBtn.addEventListener(`click`, (evt) => {
      evt.preventDefault();
      parentElement.removeChild(modal);
    });
    cancelBtn.addEventListener(`click`, (evt) => {
      evt.preventDefault();
      parentElement.removeChild(modal);
    });
    okBtn.addEventListener(`click`, (evt) => {
      evt.preventDefault();
      cb();
    });
  }
}
