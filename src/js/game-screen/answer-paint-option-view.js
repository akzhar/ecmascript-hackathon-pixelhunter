import AbstractView from "../abstract-view.js";
import debug from '../debug.js';

export default class AnswerPaintOptionView extends AbstractView {

  constructor(answerIndex, game) {
    super();
    this.answerIndex = answerIndex;
    this.game = game;
    this.correctAnswer = game.questions[0].correctAnswer;
  }

  get template() {
    return `<div class="game__option" data-answer="${this.answerIndex}" data-gameindex="${this.game.gameIndex}" ${debug.isCorrect(this.correctAnswer === this.answerIndex)}>
              <!-- PLACE FOR IMAGE -->
            </div>`;
  }

  render() {
    const parentElement = document.querySelector('form.game__content--triple');
    parentElement.appendChild(this.element);
  }

  bind(cb) {
    const answerElement = document.querySelectorAll(`.game__option`)[this.answerIndex];
    answerElement.addEventListener(`click`, cb);
  }
}
