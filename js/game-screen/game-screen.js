import config from '../config.js';
import AbstractScreen from '../abstract-screen.js';

import GameScreenView from './game-screen-view.js';
import TimerBlockView from './timer-block-view.js';
import LivesBlockView from './lives-block-view.js';
import StatsBlockView from '../util-views/stats-block-view.js';
import AnswerPhotoButtonView from './answer-photo-button-view.js';
import AnswerPaintButtonView from './answer-paint-button-view.js';
import AnswerPaintOptionView from './answer-paint-option-view.js';
import ImageView from './image-view.js';
import BackArrowView from '../util-views/back-arrow-view.js';

export default class GameScreen extends AbstractScreen {

  constructor(gameModel, game) {
    super();
    this.gameModel = gameModel;
    this.game = game;
    this.view = new GameScreenView(game);
  }

  _onScreenShow() {
    const game = this.game;
    const gameType = game.gameType;
    const livesBlock = new LivesBlockView(this.gameModel.lives);
    const statsBlock = new StatsBlockView(this.gameModel.answers);

    livesBlock.render();
    statsBlock.render();

    this.timer = new TimerBlockView();
    this.timer.render();
    this._timerOn();

    const onEveryAnswer = this._onEveryAnswer.bind(this);

    if (gameType === config.GAME_TYPE.one) {
      const answer1PhotoButton = new AnswerPhotoButtonView(0, game);
      const answer1PaintButton = new AnswerPaintButtonView(0, game);
      const image = new ImageView(0, game);
      answer1PhotoButton.render();
      answer1PaintButton.render();
      image.render();
      answer1PhotoButton.bind(onEveryAnswer);
      answer1PaintButton.bind(onEveryAnswer);
    } else if (gameType === config.GAME_TYPE.two) {
      const answer1PhotoButton = new AnswerPhotoButtonView(0, game);
      const answer1PaintButton = new AnswerPaintButtonView(0, game);
      const image1 = new ImageView(0, game);
      const answer2PhotoButton = new AnswerPhotoButtonView(1, game);
      const answer2PaintButton = new AnswerPaintButtonView(1, game);
      const image2 = new ImageView(1, game);
      answer1PhotoButton.render();
      answer1PaintButton.render();
      image1.render();
      answer1PhotoButton.bind(onEveryAnswer);
      answer1PaintButton.bind(onEveryAnswer);
      answer2PhotoButton.render();
      answer2PaintButton.render();
      image2.render();
      answer2PhotoButton.bind(onEveryAnswer);
      answer2PaintButton.bind(onEveryAnswer);
    } else if (gameType === config.GAME_TYPE.three) {
      const answer1PaintOptionView = new AnswerPaintOptionView(0, game);
      const image1 = new ImageView(0, game);
      const answer2PaintOptionView = new AnswerPaintOptionView(1, game);
      const image2 = new ImageView(1, game);
      const answer3PaintOptionView = new AnswerPaintOptionView(2, game);
      const image3 = new ImageView(2, game);
      answer1PaintOptionView.render();
      image1.render();
      answer2PaintOptionView.render();
      image2.render();
      answer3PaintOptionView.render();
      image3.render();
      answer1PaintOptionView.bind(onEveryAnswer);
      answer2PaintOptionView.bind(onEveryAnswer);
      answer3PaintOptionView.bind(onEveryAnswer);
    }

    const restartGame = this._restartGame.bind(this);

    const backArrow = new BackArrowView();
    backArrow.render();
    backArrow.bind(restartGame);
  }

  _timerOn() {
    if (this.timer.isActive && this.timer.time > 0) {
      setTimeout(() => {
        this.timer.update();
        this._timerOn();
      }, 1000);
    }
    if (this.timer.time === 0) {
      this._onValidAnswer(false);
    }
  }

  _onEveryAnswer(evt) {
    const game = this.game;
    if (game.gameType === config.GAME_TYPE.three) {
      const input = evt.currentTarget;
      const gameIndex = GameScreen.getGameIndex(input);
      const questionIndex = 0;
      const correctAnswer = this._getCorrectAnswer(gameIndex, questionIndex);
      const isOK = +input.dataset.answer === correctAnswer;
      this._onValidAnswer(isOK);
    } else {
      const isAll = this._isAllAnswersGiven();
      if (isAll) {
        const isOK = this._isAllAnswersGivenCorrect();
        this._onValidAnswer(isOK);
      }
    }
  }

  _isAllAnswersGiven() {
    const options = Array.from(document.querySelectorAll(`.game__option`));
    return options.every((option) => {
      const answers = Array.from(option.querySelectorAll(`.game__answer`));
      return answers.some((answer) => {
        const input = answer.querySelector(`input`);
        return input.checked;
      });
    });
  }

  _isAllAnswersGivenCorrect() {
    const options = Array.from(document.querySelectorAll(`.game__option`));
    return options.every((option) => {
      const answers = Array.from(option.querySelectorAll(`.game__answer`));
      return answers.some((answer) => {
        const input = answer.querySelector(`input`);
        const gameIndex = GameScreen.getGameIndex(input);
        const questionIndex = GameScreen.getQuestionIndex(input);
        const correctAnswer = this._getCorrectAnswer(gameIndex, questionIndex);
        return input.checked && input.value === correctAnswer;
      });
    });
  }

  _onValidAnswer(isOK) {
    this._saveAnswer(isOK);
    if (!isOK) {
      this.gameModel.minusLive();
    }
    if (this.gameModel.isGameOver) {
      this.endScreen.show();
    } else {
      this.nextScreen.show();
    }
  }

  _getCorrectAnswer(gameIndex, questionIndex) {
    return this.gameModel.games[gameIndex].questions[questionIndex].correctAnswer;
  }

  _saveAnswer(isOK) {
    const time = (config.TIME_TO_ANSWER - this.timer.time) / 1000;
    this.timer.stop();
    this.gameModel.addAnswer({isOK, time});
  }

  static getGameIndex(input) {
    return input.dataset.gameindex;
  }

  static getQuestionIndex(input) {
    return input.dataset.questionindex;
  }

}
