import AbstractView from "../abstract-view.js";
import debug from '../debug.js';

export default class AnswerPaintButtonView extends AbstractView {

  constructor(answerIndex, game) {
    super();
    this.game = game;
    this.answerIndex = answerIndex;
    this.answerType = game.answers[answerIndex].type;
  }

  get template() {
    return `<label class="game__answer game__answer--paint">
              <input class="visually-hidden" value="painting" name="question ${this.answerIndex}" type="radio" data-answerindex="${this.answerIndex}">
              <span ${debug.isPaint(this.answerType)}>Рисунок</span>
            </label>`;
  }

  render() {
    const parentElement = document.querySelectorAll('div.game__option')[this.answerIndex];
    parentElement.appendChild(this.element);
  }

  bind(cb) {
    const parentElement = document.querySelectorAll('div.game__option')[this.answerIndex];
    const answerElement = parentElement.querySelector(`.game__answer--paint > input`);
    answerElement.checked = false;
    answerElement.addEventListener(`click`, cb);
  }
}
