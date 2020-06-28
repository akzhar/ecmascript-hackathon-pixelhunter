import config from '../config.js';

export default class GameModel {
  constructor() {
    this._playerName = ``;
    this._lives = config.LIVES_COUNT;
    this._games = [];
    this._answers = [];
    this._isGameOver = false;
  }

  set playerName(name) {
    this._playerName = name;
  }

  get lives() {
    return this._lives;
  }

  get answers() {
    return this._answers;
  }

  get games() {
    return this._games;
  }

  get isGameOver() {
    return this._isGameOver;
  }

  reset() {
    this._lives = config.LIVES_COUNT;
    this._answers = [];
    this._isGameOver = false;
  }

  addAnswer(answer) {
    this._answers.push(answer);
  }

  minusLive() {
    if (this._lives === 0) {
      this._isGameOver = true;
    }
    if (this._lives) {
      this._lives--;
    }
  }

  static getCorrectAnswer(game) {
    const question = game.question;
    const isPainting = /\sрисунок\s/.test(question);
    const isPhoto = /\sфото\s/.test(question);
    const result = ``;
    if (isPainting) {
      result = `painting`;
    }
    if (isPhoto) {
      result = `photo`;
    }
    return result;
  }

}
