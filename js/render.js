import {getTotalScore, getRightAnswersCount, getSpeedBonusCount, getSlowPenaltyCount} from './score.js';

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

function getElementFromHTMLString(htmlString) {
  let div = document.createElement(`div`);
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

function changeElement(parentElemSelector, newElemHTMLString, oldElemSelector) {
  const parentElem = document.querySelector(parentElemSelector);
  const newElem = getElementFromHTMLString(newElemHTMLString);
  const oldElem = document.querySelector(oldElemSelector);
  parentElem.removeChild(oldElem);
  parentElem.appendChild(newElem);
}

function renderScreen(screen) {
  changeElement(`main.central`, screen, `#main`);
}

function renderLives(lives) {
  changeElement(`header.header`, getLivesHTMLString(lives), `div.game__lives`);
}

function renderStats(answers) {
  changeElement(`section.game`, getStatsHTMLString(answers), `ul.stats`);
}

function renderResults(answers, lives) {
  changeElement(`#main`, getResultHTMLString(answers, lives), `section.result`);
}

export {renderScreen, renderLives, renderStats, renderResults};
