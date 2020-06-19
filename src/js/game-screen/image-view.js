import AbstractView from "../abstract-view.js";
import resize from "../resize.js";

export default class ImageView extends AbstractView {

  constructor(questionNumber, game) {
    super();
    this.questionNumber = questionNumber;
    this.game = game;
    if (game.gameType === 3) {
      this.img = game.questions[0].img[this.questionNumber];
    } else {
      this.img = game.questions[this.questionNumber].img[0];
    }
  }

  get template() {
    const imgSize = resize(this.game.frameSize, this.img.size);
    return `<img src="${this.img.src}" alt="Option ${this.questionNumber + 1}" width="${imgSize.width}" height="${imgSize.height}">`;
  }

  render() {
    const parentElement = document.querySelectorAll('div.game__option')[this.questionNumber];
    parentElement.appendChild(this.element);
  }
}
