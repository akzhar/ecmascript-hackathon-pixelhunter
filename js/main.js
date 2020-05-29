import screens from './screens.js';
import data from './data.js';

import AsteriskView from './view/asterisk-view.js';
import StartArrowView from './view/start-arrow-view.js';
import BackArrowView from './view/back-arrow-view.js';
import StartButtonView from './view/start-button-view.js';
import NameInputView from './view/name-input-view.js';
import LivesBlockView from './view/lives-block-view.js';
import StatsBlockView from './view/stats-block-view.js';
import StatsSingleView from './view/stats-single-view.js';
import AnswerPhotoButtonView from './view/answer-photo-button-view.js';
import AnswerPaintButtonView from './view/answer-paint-button-view.js';
import AnswerPaintOptionView from './view/answer-paint-option-view.js';
import ImageView from './view/image-view.js';

let current = 0;

restartGame();

function restartGame() {
  current = 0;
  resetGameData();
  changeScreen();
}

function continueGame() {
  current++;
  changeScreen();
}

function endGame() {
  current = screens.length - 1;
  changeScreen();
}

function changeScreen() {
  const screen = screens[current].screen;
  screen.render();
  onScreenChange();
}

function resetGameData() {
  data.user = ``;
  data.lives = 3;
  data.answers = [];
}

function onStartBtnClick() {
  const nameInput = document.querySelector(`.rules__input`);
  data.user = nameInput.value.trim();
  continueGame();
}

function onScreenChange() {
  const screenName = screens[current].name;
  if (screenName === `intro`) {
    const asterisk = new AsteriskView();
    asterisk.render();
    asterisk.bind(continueGame);
  }
  if (screenName === `greeting`) {
    const startArrow = new StartArrowView();
    startArrow.render();
    startArrow.bind(continueGame);
  }
  if (screenName !== `intro` && screenName !== `greeting`) {
    const backArrow = new BackArrowView();
    backArrow.render();
    backArrow.bind(restartGame);
  }
  if (screenName === `rules`) {
    const nameInput = new NameInputView();
    const startBtn = new StartButtonView();
    nameInput.render();
    startBtn.render();
    startBtn.bind(onStartBtnClick);
    nameInput.bind();
  }
  if (screenName === `game`) {
    const game = screens[current].screen.game;
    const gameType = game.gameType;
    const livesBlock = new LivesBlockView(data.lives);
    const statsBlock = new StatsBlockView(data.answers);
    livesBlock.render();
    statsBlock.render();
    if (gameType === 1) {
      const answer1PhotoButton = new AnswerPhotoButtonView(0, game);
      const answer1PaintButton = new AnswerPaintButtonView(0, game);
      const image = new ImageView(0, game);
      answer1PhotoButton.render();
      answer1PaintButton.render();
      image.render();
      answer1PhotoButton.bind(onAnswerBtnClick);
      answer1PaintButton.bind(onAnswerBtnClick);
    } else if (gameType === 2) {
      const answer1PhotoButton = new AnswerPhotoButtonView(0, game);
      const answer1PaintButton = new AnswerPaintButtonView(0, game);
      const image1 = new ImageView(0, game);
      const answer2PhotoButton = new AnswerPhotoButtonView(1, game);
      const answer2PaintButton = new AnswerPaintButtonView(1, game);
      const image2 = new ImageView(1, game);
      answer1PhotoButton.render();
      answer1PaintButton.render();
      image1.render();
      answer1PhotoButton.bind(onAnswerBtnClick);
      answer1PaintButton.bind(onAnswerBtnClick);
      answer2PhotoButton.render();
      answer2PaintButton.render();
      image2.render();
      answer2PhotoButton.bind(onAnswerBtnClick);
      answer2PaintButton.bind(onAnswerBtnClick);
    } else if (gameType === 3) {
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
      answer1PaintOptionView.bind(onAnswerBtnClick);
      answer2PaintOptionView.bind(onAnswerBtnClick);
      answer3PaintOptionView.bind(onAnswerBtnClick);
    }
  }
  if (screenName === `stats`) {
    const statsSingleBlock = new StatsSingleView(data.answers, data.lives);
    statsSingleBlock.render();
  }
}

function onAnswerBtnClick(evt) {
  const game = screens[current].screen.game;
  if (game.gameType === 3) {
    const input = evt.currentTarget;
    const gameIndex = getGameIndex(input);
    const questionIndex = 0;
    const correctAnswer = getCorrectAnswer(gameIndex, questionIndex);
    const isOK = +input.dataset.answer === correctAnswer;
    onValidAnswer(isOK);
  } else {
    const isAll = isAllAnswersGiven();
    if (isAll) {
      const isOK = isAllAnswersGivenCorrect();
      onValidAnswer(isOK);
    }
  }
}

function isAllAnswersGiven() {
  const options = Array.from(document.querySelectorAll(`.game__option`));
  return options.every((option) => {
    const answers = Array.from(option.querySelectorAll(`.game__answer`));
    return answers.some((answer) => {
      const input = answer.querySelector(`input`);
      return input.checked;
    });
  });
}

function onValidAnswer(isOK) {
  saveAnswer(isOK);
  if (!isOK) {
    data.lives--;
  }
  const next = (data.lives >= 0) ? continueGame : endGame;
  next();
}

function saveAnswer(isOK) {
  data.answers.push({isOK: isOK, time: 15});
}

function isAllAnswersGivenCorrect() {
  const options = Array.from(document.querySelectorAll(`.game__option`));
  return options.every((option) => {
    const answers = Array.from(option.querySelectorAll(`.game__answer`));
    return answers.some((answer) => {
      const input = answer.querySelector(`input`);
      const gameIndex = getGameIndex(input);
      const questionIndex = getQuestionIndex(input);
      const correctAnswer = getCorrectAnswer(gameIndex, questionIndex);
      return input.checked && input.value === correctAnswer;
    });
  });
}

function getGameIndex(input) {
  // тест - всегда должно возвражать индекс игры от 0 до 9
  return input.dataset.gameindex;
}

function getQuestionIndex(input) {
  // тест - всегда должно возвражать индекс вопроса от 0 до 1
  return input.dataset.questionindex;
}

function getCorrectAnswer(gameIndex, questionIndex) {
  // тест - всегда должно возвражать корректный ответ ...
  return data.games[gameIndex].questions[questionIndex].correctAnswer;
}
