import AbstractView from "../abstract-view.js";
import debug from '../debug.js';

export default class AnswerPhotoButtonView extends AbstractView {

  constructor(answerIndex, game) {
    super();
    this.game = game;
    this.answerIndex = answerIndex;
    this.answerType = game.answers[answerIndex].type;
  }

  get template() {
    return `<label class="game__answer game__answer--photo">
              <input class="visually-hidden" value="photo" name="question ${this.answerIndex}" type="radio" data-answerindex="${this.answerIndex}">
              <span ${debug.isPhoto(this.answerType)}>Фото</span>
            </label>`;
  }

  render() {
    const parentElement = document.querySelectorAll(`div.game__option`)[this.answerIndex];
    parentElement.appendChild(this.element);
  }

  bind(cb) {
    const parentElement = document.querySelectorAll(`div.game__option`)[this.answerIndex];
    const answerElement = parentElement.querySelector(`.game__answer--photo > input`);
    answerElement.checked = false;
    answerElement.addEventListener(`click`, cb);
  }
}
