import config from '../config.js';
import AbstractView from "../abstract-view.js";
import StatsBlockView from '../util-views/stats-block-view.js';
import {getTotalScore, getRightAnswersCount, getSpeedBonusCount, getSlowPenaltyCount} from '../score.js';

export default class StatsSingleView extends AbstractView {

  constructor(answers, lives) {
    super();
    this.answers = answers;
    this.lives = lives;
  }

  get template() {
    const isAll = this.answers.length === config.GAMES_COUNT;
    const score = getTotalScore(this.answers, this.lives);
    const rightAnswersCount = getRightAnswersCount(this.answers);
    const speedBonusCount = getSpeedBonusCount(this.answers);
    const slowPenaltyCount = getSlowPenaltyCount(this.answers);
    const statsBlock = new StatsBlockView(this.answers);
    return `<section class="result">
      <h2 class="result__title result__title--single">${(isAll) ? score + ` очков. Неплохо!` : `Поражение!` }</h2>
      <table class="result__table result__table--single">
        <tr>
          <td colspan="2">
            ${statsBlock.template}
          </td>
          <td class="result__points">× 100</td>
          <td class="result__total">${(isAll) ? rightAnswersCount * 100 : `Fail` }</td>
        </tr>
        ${(speedBonusCount) ? StatsSingleView.getSpeedBonusContent(speedBonusCount) : ``}
        ${(this.lives) ? StatsSingleView.getLivesBonusContent(this.lives) : ``}
        ${(slowPenaltyCount) ? StatsSingleView.getSlowPenaltyContent(slowPenaltyCount) : ``}
      </table>
    </section>`;
  }

  render() {
    const parentElement = document.querySelector(`#main`);
    const oldElement = document.querySelector(`section.result`);
    parentElement.removeChild(oldElement);
    parentElement.appendChild(this.element);
  }

  static getSpeedBonusContent(speedBonusCount) {
    return `<tr>
      <td></td>
      <td class="result__extra">Бонус за скорость:</td>
      <td class="result__extra">${speedBonusCount} <span class="stats__result stats__result--fast"></span></td>
      <td class="result__points">× 50</td>
      <td class="result__total">${speedBonusCount * 50}</td>
    </tr>`;
  }

  static getLivesBonusContent(lives) {
    return `<tr>
      <td></td>
      <td class="result__extra">Бонус за жизни:</td>
      <td class="result__extra">${lives} <span class="stats__result stats__result--alive"></span></td>
      <td class="result__points">× 50</td>
      <td class="result__total">${lives * 50}</td>
    </tr>`;
  }

  static getSlowPenaltyContent(slowPenaltyCount) {
    return `<tr>
      <td></td>
      <td class="result__extra">Штраф за медлительность:</td>
      <td class="result__extra">${slowPenaltyCount} <span class="stats__result stats__result--slow"></span></td>
      <td class="result__points">× 50</td>
      <td class="result__total">-${slowPenaltyCount * 50}</td>
    </tr>`;
  }

}
