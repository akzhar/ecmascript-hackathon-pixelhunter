import switchScreen from './screen.js';

import introElement from './intro.js';
import greetingElement from './greeting.js';
import rulesElement from './rules.js';
import game1Element from './game-1.js';
import game2Element from './game-2.js';
import game3Element from './game-3.js';
import statsElement from './stats.js';

start();

// обнулить все экраны

function start() {
  const introAsterisk = document.querySelector(`.intro__asterisk`);
  introAsterisk.addEventListener(`click`, onIntroAsteriskClick);
}

function onIntroAsteriskClick() {
  switchScreen(greetingElement);
  const greetingArrow = document.querySelector(`.greeting__continue`);
  greetingArrow.addEventListener(`click`, onGreetingArrowClick);
}

function onGreetingArrowClick() {
  switchScreen(rulesElement);
  switchOnBackBtn();
  const rulesInput = document.querySelector(`.rules__input`);
  const rulesBtn = document.querySelector(`.rules__button`);
  rulesBtn.disabled = true;
  rulesInput.addEventListener(`input`, () => {
    rulesBtn.disabled = (rulesInput.value === ``) ? true : false;
  });
  rulesBtn.addEventListener(`click`, onRulesBtnClick);
}

function onBackBtnClick() {
  switchScreen(introElement);
  start();
}

function switchOnBackBtn() {
  const backBtn = document.querySelector(`.back`);
  backBtn.addEventListener(`click`, onBackBtnClick);
}

function onRulesBtnClick() {
  switchScreen(game1Element);
  switchOnBackBtn();
  const questionAnswers = document.querySelectorAll(`.game__answer`);
  const question1Answers = Array.from(document.querySelectorAll(`input[name="question1"]`));
  const question2Answers = Array.from(document.querySelectorAll(`input[name="question2"]`));
  let canContinue = false;
  questionAnswers.forEach((answer) => {
    answer.addEventListener(`click`, () => {
      canContinue = isAllAnswered(question1Answers, question2Answers);
      if (canContinue) {
        onGame1AnswersChecked();
      }
    });
  });
}

function isAllAnswered(...answers) {
  const checked = (arr) => arr.some((element) => element.checked);
  return answers.every(checked);
}

function onGame1AnswersChecked() {
  switchScreen(game2Element);
  switchOnBackBtn();
  const questionAnswers = document.querySelectorAll(`.game__answer`);
  questionAnswers.forEach((answer) => {
    answer.addEventListener(`click`, onGame2AnswersChecked);
  });
}

function onGame2AnswersChecked() {
  switchScreen(game3Element);
  switchOnBackBtn();
  const questionAnswers = document.querySelectorAll(`.game__option`);
  questionAnswers.forEach((answer) => {
    answer.addEventListener(`click`, onGame3AnswersChecked);
  });
}

function onGame3AnswersChecked() {
  switchScreen(statsElement);
  switchOnBackBtn();
}

