import AbstractView from "./abstract-view.js";
import {isPhoto, isPaint, isRight} from '../debug.js';
import {resize} from '../resize.js';

const gameTypeToFrameSize = {
  '1': {width: 705, height: 455},
  '2': {width: 468, height: 458},
  '3': {width: 304, height: 455}
};

export default class GameScreenView extends AbstractView {

  constructor(game, gameIndex) {
    super();
    this.game = game;
    this.gameIndex = gameIndex;
  }

  get template() {
    return `<div id="main" class="central__content">
              <header class="header">
                <!-- PLACE TO BACK ARROW -->
                <div class="game__timer">3:00</div>
                <div class="game__lives"></div>
              </header>
              <section class="game">
                <p class="game__task">${this.game.task}</p>
                ${GameScreenView.getGameContent(this.game, this.game.gameType, this.gameIndex)}
                <ul class="stats"></ul>
              </section>
            </div>`;
  }

  bind(cb) {
    // создать отдельные view для кнопок ответов
    const gameType = this.game.gameType;
    const selector = (gameType === 3) ? `.game__option` : `.game__answer > input`;
    const answersElement = document.querySelectorAll(selector);
    answersElement.forEach((answer) => answer.addEventListener(`click`, cb));
  }

  static getGameContent(game, gameType, gameIndex) {
    let content = ``;
    if (gameType === 2) {
      const img1Size = resize(gameTypeToFrameSize[gameType], game.questions[0].img[0].size);
      const img2Size = resize(gameTypeToFrameSize[gameType], game.questions[1].img[0].size);
      content = `<form class="game__content">
        <div class="game__option">
          <img src="${game.questions[0].img[0].src}" alt="Option 1" width="${img1Size.width}" height="${img1Size.height}">
          <label class="game__answer game__answer--photo">
            <input class="visually-hidden" name="question1" type="radio" value="photo" data-gameindex="${gameIndex}">
            <span ${isPhoto(game.questions[0].answer)}>Фото</span>
          </label>
          <label class="game__answer game__answer--paint">
            <input class="visually-hidden" name="question1" type="radio" value="paint" data-gameindex="${gameIndex}">
            <span ${isPaint(game.questions[0].answer)}>Рисунок</span>
          </label>
        </div>
        <div class="game__option">
          <img src="${game.questions[1].img[0].src}" alt="Option 2" width="${img2Size.width}" height="${img2Size.height}">
          <label class="game__answer  game__answer--photo">
            <input class="visually-hidden" name="question2" type="radio" value="photo" data-gameindex="${gameIndex}">
            <span ${isPhoto(game.questions[1].answer)}>Фото</span>
          </label>
          <label class="game__answer  game__answer--paint">
            <input class="visually-hidden" name="question2" type="radio" value="paint" data-gameindex="${gameIndex}">
            <span ${isPaint(game.questions[1].answer)}>Рисунок</span>
          </label>
        </div>
      </form>`;
    } else if (gameType === 1) {
      const img1Size = resize(gameTypeToFrameSize[gameType], game.questions[0].img[0].size);
      content = `<form class="game__content  game__content--wide">
        <div class="game__option">
          <img src="${game.questions[0].img[0].src}" alt="Option 1" width="${img1Size.width}" height="${img1Size.height}">
          <label class="game__answer  game__answer--photo">
            <input class="visually-hidden" name="question1" type="radio" value="photo" data-gameindex="${gameIndex}">
            <span ${isPhoto(game.questions[0].answer)}>Фото</span>
          </label>
          <label class="game__answer  game__answer--paint">
            <input class="visually-hidden" name="question1" type="radio" value="paint" data-gameindex="${gameIndex}">
            <span ${isPaint(game.questions[0].answer)}>Рисунок</span>
          </label>
        </div>
      </form>`;
    } else if (gameType === 3) {
      const img1Size = resize(gameTypeToFrameSize[gameType], game.questions[0].img[0].size);
      const img2Size = resize(gameTypeToFrameSize[gameType], game.questions[0].img[1].size);
      const img3Size = resize(gameTypeToFrameSize[gameType], game.questions[0].img[2].size);
      content = `<form class="game__content  game__content--triple">
        <div class="game__option" data-value="0" data-gameindex="${gameIndex}" ${isRight(game.questions[0].answer === 0)}>
          <img src="${game.questions[0].img[0].src}" alt="Option 1" width="${img1Size.width}" height="${img1Size.height}">
        </div>
        <div class="game__option" data-value="1" data-gameindex="${gameIndex}" ${isRight(game.questions[0].answer === 1)}>
          <img src="${game.questions[0].img[1].src}" alt="Option 2" width="${img2Size.width}" height="${img2Size.height}">
        </div>
        <div class="game__option" data-value="2" data-gameindex="${gameIndex}" ${isRight(game.questions[0].answer === 2)}>
          <img src="${game.questions[0].img[2].src}" alt="Option 3" width="${img3Size.width}" height="${img3Size.height}">
        </div>
      </form>`;
    }
    return content;
  }

}
