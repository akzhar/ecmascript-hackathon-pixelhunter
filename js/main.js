import {renderScreen, renderLives, renderStats, renderResults} from './render.js';
import screens from './screens/screens.js';
import data from './data/data.js';

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
  renderScreen(screens[current].html);
  onScreenChange();
}

function resetGameData() {
  data.user = ``;
  data.lives = 3;
  data.answers = [];
}

function onScreenChange() {
  const screenName = screens[current].name;

  if (screenName === `intro`) {
    const asterisk = document.querySelector(`.intro__asterisk`);
    asterisk.addEventListener(`click`, continueGame);
  }
  if (screenName === `greeting`) {
    const startArrow = document.querySelector(`.greeting__continue`);
    startArrow.addEventListener(`click`, continueGame);
  }
  if (screenName !== `intro` && screenName !== `greeting`) {
    const backArrow = document.querySelector(`.back`);
    backArrow.addEventListener(`click`, restartGame);
  }
  if (screenName === `rules`) {
    const nameInput = document.querySelector(`.rules__input`);
    const startBtn = document.querySelector(`.rules__button`);
    nameInput.addEventListener(`input`, () => {
      startBtn.disabled = (nameInput.value === ``) ? true : false;
    });
    startBtn.addEventListener(`click`, onStartBtnClick);
  }
  if (screenName === `game`) {
    const gameType = screens[current].gameType;
    renderLives(data.lives);
    renderStats(data.answers);
    const selector = (gameType === 3) ? `.game__option` : `.game__answer > input`;
    const answersElem = document.querySelectorAll(selector);
    answersElem.forEach((answer) => answer.addEventListener(`click`, onEachAnswer));
  }
  if (screenName === `stats`) {
    renderResults(data.answers, data.lives);
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
