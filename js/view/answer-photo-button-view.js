import AbstractView from "./abstract-view.js";
import debug from '../debug.js';

export default class AnswerPhotoButtonView extends AbstractView {

  constructor(questionIndex, game) {
    super();
    this.questionIndex = questionIndex;
    this.correctAnswer = game.questions[this.questionIndex].correctAnswer;
    this.gameIndex = game.gameIndex;
  }

  get template() {
    return `<label class="game__answer game__answer--photo">
              <input class="visually-hidden" name="question${this.questionIndex}" type="radio" value="photo" data-gameindex="${this.gameIndex}" data-questionindex="${this.questionIndex}">
              <span ${debug.isPhoto(this.correctAnswer)}>Фото</span>
            </label>`;
  }

  render() {
    const parentElement = document.querySelectorAll('div.game__option')[this.questionIndex];
    parentElement.appendChild(this.element);
  }

  bind(cb) {
    const parentElement = document.querySelectorAll('div.game__option')[this.questionIndex];
    const answerElement = parentElement.querySelector(`.game__answer--photo > input`);
    answerElement.checked = false;
    answerElement.addEventListener(`click`, cb);
  }
}
