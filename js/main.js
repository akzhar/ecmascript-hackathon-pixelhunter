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

function onScreenChange() {
  const screenName = screens[current].name;
  const screen = screens[current].screen;

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
    const livesBlock = new LivesBlockView(data.lives);
    const statsBlock = new StatsBlockView(data.answers);
    livesBlock.render();
    statsBlock.render();
    // создать отдельные view для кнопок ответов
    screen.bind(onEachAnswer);
  }
  if (screenName === `stats`) {
    const statsSingleBlock = new StatsSingleView(data.answers, data.lives);
    statsSingleBlock.render();
  }
}

function onStartBtnClick() {
  const nameInput = document.querySelector(`.rules__input`);
  data.user = nameInput.value.trim();
  continueGame();
}

function onEachAnswer(evt) {
  if (screens[current].gameType === 3) {
    const div = evt.currentTarget;
    const gameIndex = div.dataset.gameindex;
    const correctAnswer = getCorrectAnswer(gameIndex, 0);
    const isCorrect = +div.dataset.value === correctAnswer;
    onValidAnswer(isCorrect);
  } else if (isAllAnswersGiven()) {
    const isCorrect = isAllAnswersGivenCorrect();
    onValidAnswer(isCorrect);
  }
}

function onValidAnswer(isCorrect) {
  saveAnswer(isCorrect);
  if (!isCorrect) {
    data.lives--;
  }
  const nextAction = (data.lives >= 0) ? continueGame : endGame;
  nextAction();
}

function saveAnswer(isCorrect) {
  data.answers.push({isOK: isCorrect, time: 15});
}

function isAllAnswersGivenCorrect() {
  const options = Array.from(document.querySelectorAll(`.game__option`));
  return options.every((option) => {
    const answers = Array.from(option.querySelectorAll(`.game__answer`));
    return answers.some((answer) => {
      const input = answer.querySelector(`input`);
      const gameIndex = input.dataset.gameindex;
      const questionIndex = getQuestionIndex(input);
      const correctAnswer = getCorrectAnswer(gameIndex, questionIndex);
      return input.checked && input.value === correctAnswer;
    });
  });
}

function getQuestionIndex(input) {
  // тест - всегда должно возвражать число 1, 2, 3 ...
  return +input.name[input.name.length - 1] - 1;
}

function getCorrectAnswer(gameIndex, questionIndex) {
  // тест - всегда должно возвражать корректный ответ ...
  return data.games[gameIndex].questions[questionIndex].answer;
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
