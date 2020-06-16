import config from '../config.js';

export default class GameModel {
  constructor() {
    this._playerName = ``;
    this._lives = config.LIVES_COUNT;
    this._answers = [];
    this._games = GameModel.getNewGames();
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

  static getNewGames() {
    const games = [];

    for (let i = 0; i < config.GAMES_COUNT; i++) {
      const gameType = GameModel.getRandomGameType();
      switch (gameType) {
        case config.GAME_TYPE.one:
          games.push(GameModel.getGameType1(i));
          break;
        case config.GAME_TYPE.two:
          games.push(GameModel.getGameType2(i));
          break;
        case config.GAME_TYPE.three:
          games.push(GameModel.getGameType3(i));
          break;
      }
    }

    return games;
  }

  static getRandomGameType() {
    return Math.round(Math.random() * (config.GAME_TYPE.three - config.GAME_TYPE.one) + config.GAME_TYPE.one);
  }

  static getGameType1(index) {
    // 1 изображение
    // в этом режиме пользователь должен определить картина это или фотография
    return {
      gameIndex: index,
      gameType: config.GAME_TYPE.one,
      frameSize: {width: 705, height: 455},
      task: `Угадай, фото или рисунок?`,
      questions:
      [
        {
          img:
          [
            {
              src: `https://k42.kn3.net/D2F0370D6.jpg`,
              size: {width: 468, height: 354}
            }
          ],
          correctAnswer: `paint`
        }
      ]
    };
  }

  static getGameType2(index) {
    // 2 изображения
    // для каждого из изображений пользователь должен указать картина это или фотография
    return {
      gameIndex: index,
      gameType: config.GAME_TYPE.two,
      frameSize: {width: 468, height: 458},
      task: `Угадайте для каждого изображения фото или рисунок?`,
      questions:
      [
        {
          img:
          [
            {
              src: `https://k42.kn3.net/CF42609C8.jpg`,
              size: {width: 600, height: 831}
            }
          ],
          correctAnswer: `paint`
        },
        {
          img:
          [
            {
              src: `http://i.imgur.com/1KegWPz.jpg`,
              size: {width: 1080, height: 720}
            }
          ],
          correctAnswer: `photo`
        }
      ]
    };
  }

  static getGameType3(index) {
    // 3 изображения
    // пользователю нужно выбрать одно — либо нужно выбрать единственную фотографию, либо единственную картину
    return {
      gameIndex: index,
      gameType: config.GAME_TYPE.three,
      frameSize: {width: 304, height: 455},
      task: `Найдите рисунок среди изображений`,
      questions: [
        {
          img:
          [
            {
              src: `https://k32.kn3.net/5C7060EC5.jpg`,
              size: {width: 1200, height: 900}
            },
            {
              src: `https://i.imgur.com/DiHM5Zb.jpg`,
              size: {width: 1264, height: 1864}
            },
            {
              src: `http://i.imgur.com/DKR1HtB.jpg`,
              size: {width: 1120, height: 2965}
            }
          ],
          correctAnswer: 0
        }
      ]
    };
  }
}
