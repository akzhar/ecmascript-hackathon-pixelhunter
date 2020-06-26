import config from '../config.js';
import AbstractView from "../abstract-view.js";
import resize from "../resize.js";

export default class ImageView extends AbstractView {

  constructor(questionNumber, game) {
    super();
    this.questionNumber = questionNumber;
    this.gameType = game.type;
    this.image = game.answers[questionNumber].image;
  }

  get template() {
    const frameSize = config.QuestionTypeToFrameSize[this.gameType];
    const imageSize = {width: this.image.width, height: this.image.height};
    const resizedImageSize = resize(frameSize, imageSize);
    return `<img src="${this.image.url}" alt="Option ${this.questionNumber + 1}" width="${resizedImageSize.width}" height="${resizedImageSize.height}">`;
  }

  render() {
    const parentElement = document.querySelectorAll('div.game__option')[this.questionNumber];
    parentElement.appendChild(this.element);
  }
}
