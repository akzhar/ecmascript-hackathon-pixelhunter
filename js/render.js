// модуль отвечает за отрисовку экранов и обновление частей экранов

import {getLivesHTMLString, getStatsHTMLString, getResultHTMLString} from './html.js';

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
