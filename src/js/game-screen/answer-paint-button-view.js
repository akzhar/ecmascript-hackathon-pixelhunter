import AbstractView from "../abstract-view.js";
import debug from '../debug.js';

export default class AnswerPaintButtonView extends AbstractView {

  constructor(questionIndex, game) {
    super();
    this.questionIndex = questionIndex;
    this.correctAnswer = game.questions[this.questionIndex].correctAnswer;
    this.gameIndex = game.gameIndex;
  }

  get template() {
    return `<label class="game__answer game__answer--paint">
              <input class="visually-hidden" name="question ${this.questionIndex}" type="radio" value="paint" data-gameindex="${this.gameIndex}" data-questionindex="${this.questionIndex}">
              <span ${debug.isPaint(this.correctAnswer)}>Рисунок</span>
            </label>`;
  }

  render() {
    const parentElement = document.querySelectorAll('div.game__option')[this.questionIndex];
    parentElement.appendChild(this.element);
  }

  bind(cb) {
    const parentElement = document.querySelectorAll('div.game__option')[this.questionIndex];
    const answerElement = parentElement.querySelector(`.game__answer--paint > input`);
    answerElement.checked = false;
    answerElement.addEventListener(`click`, cb);
  }
}
