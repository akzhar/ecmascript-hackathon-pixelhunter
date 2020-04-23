// модуль отвечает за генерацию html для экранов и обновляемых частей экранов

import {getTotalScore, getRightAnswersCount, getSpeedBonusCount, getSlowPenaltyCount} from './score.js';
import {isPhoto, isPaint, isRight} from './debug.js';
import {resize} from './resize.js';

const gameTypeToFrameSize = {
  '1': {width: 705, height: 455},
  '2': {width: 468, height: 458},
  '3': {width: 304, height: 455}
};

function getGameContentHTMLString(game, gameType, gameIndex) {
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

// Managing lives
// @param  {[type]} a [description]
// @param  {[type]} b [description]
// @return {[type]} [description]
function getGameHTMLString(game, gameIndex) {
  return `<div id="main" class="central__content">
    <header class="header">
      <button class="back">
        <span class="visually-hidden">Вернуться к началу</span>
        <svg class="icon" width="45" height="45" viewBox="0 0 45 45" fill="#000000">
          <use xlink:href="img/sprite.svg#arrow-left"></use>
        </svg>
        <svg class="icon" width="101" height="44" viewBox="0 0 101 44" fill="#000000">
          <use xlink:href="img/sprite.svg#logo-small"></use>
        </svg>
      </button>
      <div class="game__timer">3:00</div>
      <div class="game__lives"></div>
    </header>
    <section class="game">
      <p class="game__task">${game.task}</p>
      ${getGameContentHTMLString(game, game.gameType, gameIndex)}
      <ul class="stats"></ul>
    </section>
  </div>`;
}

function getLivesHTMLString(lives) {
  let result = ``;
  for (let i = 0; i < 3; i++) {
    result += `<img src="img/heart__${(lives > 0) ? `full` : `empty`}.svg" class="game__heart" alt="Life" width="31" height="27">`;
    lives--;
  }
  return `<div class="game__lives">${result}</div>`;
}

function getStatsHTMLString(answers) {
  let result = ``;
  for (let i = 0; i < 10; i++) {
    const answer = answers[i];
    let modifier = ``;
    if (answer) {
      if (answer.isOK) {
        modifier = `correct`;
        if (answer.time < 10) {
          modifier = `fast`;
        }
        if (answer.time > 20) {
          modifier = `slow`;
        }
      } else {
        modifier = `wrong`;
      }
    } else {
      modifier = `unknown`;
    }
    result += `<li class="stats__result stats__result--${modifier}"></li>`;
  }
  return `<ul class="stats">${result}</ul>`;
}

function getSpeedBonusHTMLString(speedBonusCount) {
  return `<tr>
    <td></td>
    <td class="result__extra">Бонус за скорость:</td>
    <td class="result__extra">${speedBonusCount} <span class="stats__result stats__result--fast"></span></td>
    <td class="result__points">× 50</td>
    <td class="result__total">${speedBonusCount * 50}</td>
  </tr>`;
}

function getLivesBonusHTMLString(lives) {
  return `<tr>
    <td></td>
    <td class="result__extra">Бонус за жизни:</td>
    <td class="result__extra">${lives} <span class="stats__result stats__result--alive"></span></td>
    <td class="result__points">× 50</td>
    <td class="result__total">${lives * 50}</td>
  </tr>`;
}

function getSlowPenaltyHTMLString(slowPenaltyCount) {
  return `<tr>
    <td></td>
    <td class="result__extra">Штраф за медлительность:</td>
    <td class="result__extra">${slowPenaltyCount} <span class="stats__result stats__result--slow"></span></td>
    <td class="result__points">× 50</td>
    <td class="result__total">-${slowPenaltyCount * 50}</td>
  </tr>`;
}

function getResultHTMLString(answers, lives) {
  const isWin = answers.length === 10;
  const score = getTotalScore(answers, lives);
  const rightAnswersCount = getRightAnswersCount(answers);
  const speedBonusCount = getSpeedBonusCount(answers);
  const slowPenaltyCount = getSlowPenaltyCount(answers);
  return `<section class="result">
    <h2 class="result__title result__title--single">${(isWin) ? score + ` очков. Неплохо!` : `Поражение!` }</h2>
    <table class="result__table result__table--single">
      <tr>
        <td colspan="2">
          ${getStatsHTMLString(answers)}
        </td>
        <td class="result__points">× 100</td>
        <td class="result__total">${(isWin) ? rightAnswersCount * 100 : `Fail` }</td>
      </tr>
      ${(speedBonusCount) ? getSpeedBonusHTMLString(speedBonusCount) : ``}
      ${(lives) ? getLivesBonusHTMLString(lives) : ``}
      ${(slowPenaltyCount) ? getSlowPenaltyHTMLString(slowPenaltyCount) : ``}
    </table>
  </section>`;
}

export {getGameHTMLString, getLivesHTMLString, getStatsHTMLString, getResultHTMLString};
