import AbstractView from "../abstract-view.js";
import debug from '../debug.js';
import GameModel from '../game-model/game-model.js';

export default class AnswerPaintOptionView extends AbstractView {

  constructor(answerIndex, game) {
    super();
    this.game = game;
    this.answerIndex = answerIndex;
    this.answerType = game.answers[answerIndex].type;
  }

  get template() {
    const correctAnswer = GameModel.getCorrectAnswer(this.game);
    return `<div class="game__option" data-answer="${this.answerType}" data-answerindex="${this.answerIndex}" ${debug.isCorrect(this.answerType === correctAnswer)}>
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
