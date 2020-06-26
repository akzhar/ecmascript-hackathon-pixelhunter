import AbstractView from "../abstract-view.js";

export default class ErrorModalView extends AbstractView {

  constructor() {
    super();
  }

  get template() {
    return `<section class="modal">
              <div class="modal__inner">
                <h2 class="modal__title">Произошла ошибка!</h2>
                <p class="modal__text modal__text--error">Статус: 404. Пожалуйста, перезагрузите страницу.</p>
              </div>
            </section>`;
  }

  render() {
    const parentElement = document.querySelector(`#main`);
    parentElement.appendChild(this.element);
  }
}
