import switchScreen from './screen.js';
import data from './data/data.js';

import intro from './screens/intro.js';
import greeting from './screens/greeting.js';
import rules from './screens/rules.js';
import game from './screens/game.js';
import stats from './screens/stats/stats.js';

const screens =
[
  {screen: intro},
  {screen: greeting},
  {screen: rules},
  {screen: game.getScreen(data, 2), questions: 2},
  {screen: game.getScreen(data, 1), questions: 1},
  {screen: game.getScreen(data, 3), questions: 3},
  {screen: stats}
];

let current = 0;

restartGame();

function restartGame() {
  current = 0;
  switchScreen(screens[current].screen);
  onScreenChange();
}

function nextScreen() {
  current++;
  switchScreen(screens[current].screen);
  onScreenChange();
}

function onScreenChange() {
  const screen = screens[current].screen;
  const questions = screens[current].questions;
  if (screen === intro) {
    const asterisk = document.querySelector(`.intro__asterisk`);
    asterisk.addEventListener(`click`, nextScreen);
  }
  if (screen === greeting) {
    const startArrow = document.querySelector(`.greeting__continue`);
    startArrow.addEventListener(`click`, nextScreen);
  }
  if (screen !== intro && screen !== greeting) {
    const backArrow = document.querySelector(`.back`);
    backArrow.addEventListener(`click`, restartGame);
  }
  if (screen === rules) {
    const nameInput = document.querySelector(`.rules__input`);
    const submitBtn = document.querySelector(`.rules__button`);
    nameInput.addEventListener(`input`, () => {
      submitBtn.disabled = (nameInput.value === ``) ? true : false;
    });
    submitBtn.addEventListener(`click`, nextScreen);
  }
  if (questions) {
    const selector = (questions === 3) ? `.game__option` : `.game__answer > input`;
    const answers = document.querySelectorAll(selector);
    answers.forEach((answer) => answer.addEventListener(`click`, onAnswer));
  }
}

function onAnswer() {
  // запись ответов если это вопрос
  if (screens[current].questions !== 3) {
    // console.log(current - 2 + `: you think this is a ` + this.value);
    if (isAllAnswersGiven()) {
      nextScreen();
    }
  } else {
    // console.log(current - 2 + `: you think this is a paint`);
    nextScreen();
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
