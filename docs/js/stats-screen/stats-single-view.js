var statsSingleView = (function () {
  'use strict';

  class AbstractView {

    constructor() {}

    // возвращает строку, содержащую разметку
    get template() {}

    // создает и возвращает DOM-элемент на основе шаблона
    // должен создавать DOM-элемент с помощью метода render, добавлять ему обработчики, с помощью метода bind и возвращать созданный элемент
    // Метод должен использовать ленивые вычисления — элемент должен создаваться при первом обращении к геттер с помощью метода render, должны добавляться обработчики (метод bind).
    // При последующих обращениях должен использоваться элемент, созданный при первом вызове геттера.
    get element() {
      const template = this.template;
      // if (!elements.hasOwnProperty(template)) {
        const div = document.createElement(`div`);
        div.innerHTML = template;
        const elem = div.firstChild;
        return elem;
      // } else {
        // return elements[template];
      // }
    }

    // отрисовывает DOM-элемент, добавляет необходимые обработчики
    render() {
      const parentElement = document.querySelector(`main.central`);
      const oldElement = document.querySelector(`#main`);
      parentElement.removeChild(oldElement);
      parentElement.appendChild(this.element);
    }

    // добавляет обработчики событий
    // Метод по умолчанию ничего не делает
    // Если нужно обработать какое-то событие, то этот метод должен быть переопределён в наследнике с необходимой логикой
    bind() {}
  }

  class StatsBlockView extends AbstractView {

    constructor(answers) {
      super();
      this.answers = answers;
    }

    get template() {
      let result = ``;
      for (let i = 0; i < 10; i++) {
        const answer = this.answers[i];
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

    render() {
      const parentElement = document.querySelector(`section.game`);
      const oldElement = document.querySelector(`ul.stats`);
      parentElement.removeChild(oldElement);
      parentElement.appendChild(this.element);
    }
  }

  // Scoring at the end of the game
  // @param  {array} answers массив ответов пользователя
  // @param  {integer} lives кол-во оставшихся жизней
  // @return {integer} кол-во набранных очков
  function getTotalScore(answers, lives) {
    if (answers.length < 10) {
      return -1;
    }
    const score = answers.reduce((acc, answer) => {
      if (answer.isOK) {
        acc += 100;
      }
      if (answer.time < 10) {
        acc += 50;
      }
      if (answer.time > 20) {
        acc -= 50;
      }
      return acc;
    }, 0);
    return score + lives * 50;
  }

  function getRightAnswersCount(answers) {
    return answers.filter((answer) => answer.isOK).length;
  }

  function getSpeedBonusCount(answers) {
    return answers.filter((answer) => answer.time < 10).length;
  }

  function getSlowPenaltyCount(answers) {
    return answers.filter((answer) => answer.time > 20).length;
  }

  class StatsSingleView extends AbstractView {

    constructor(answers, lives) {
      super();
      this.answers = answers;
      this.lives = lives;
    }

    get template() {
      const isWin = this.answers.length === 10;
      const score = getTotalScore(this.answers, this.lives);
      const rightAnswersCount = getRightAnswersCount(this.answers);
      const speedBonusCount = getSpeedBonusCount(this.answers);
      const slowPenaltyCount = getSlowPenaltyCount(this.answers);
      const statsBlock = new StatsBlockView(this.answers);
      return `<section class="result">
      <h2 class="result__title result__title--single">${(isWin) ? score + ` очков. Неплохо!` : `Поражение!` }</h2>
      <table class="result__table result__table--single">
        <tr>
          <td colspan="2">
            ${statsBlock.template}
          </td>
          <td class="result__points">× 100</td>
          <td class="result__total">${(isWin) ? rightAnswersCount * 100 : `Fail` }</td>
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

  //  for (let i = 0; i < answers.length; i++) {
  //    result += `<table class="result__table">
  //      <tr>
  //        <td class="result__number">${i + 1}.</td>
  //        <td colspan="2">
  //          ${getStatsHTMLString(answers)}
  //        </td>
  //        <td class="result__points">× 100</td>
  //        <td class="result__total">${(isWin) ? getScore(answers, lives) : `Fail!` }</td>
  //      </tr>
  //      ${getSpeedBonus()}
  //      ${getLivesBonus()}
  //      ${getSlowPenalty()}
  //      <tr>
  //        <td colspan="5" class="result__total  result__total--final">${(isWin) ? getScore(answers, lives) : `Fail!` }</td>
  //      </tr>
  //    </table>`;
  //  }

  return StatsSingleView;

}());

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdHMtc2NyZWVuL3N0YXRzLXNpbmdsZS12aWV3LmpzIiwic291cmNlcyI6WyJzcmMvanMvYWJzdHJhY3Qtdmlldy5qcyIsInNyYy9qcy91dGlsLXZpZXdzL3N0YXRzLWJsb2NrLXZpZXcuanMiLCJzcmMvanMvc2NvcmUuanMiLCJzcmMvanMvc3RhdHMtc2NyZWVuL3N0YXRzLXNpbmdsZS12aWV3LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGVsZW1lbnRzID0ge307XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIC8vINCy0L7Qt9Cy0YDQsNGJ0LDQtdGCINGB0YLRgNC+0LrRgywg0YHQvtC00LXRgNC20LDRidGD0Y4g0YDQsNC30LzQtdGC0LrRg1xuICBnZXQgdGVtcGxhdGUoKSB7fVxuXG4gIC8vINGB0L7Qt9C00LDQtdGCINC4INCy0L7Qt9Cy0YDQsNGJ0LDQtdGCIERPTS3RjdC70LXQvNC10L3RgiDQvdCwINC+0YHQvdC+0LLQtSDRiNCw0LHQu9C+0L3QsFxuICAvLyDQtNC+0LvQttC10L0g0YHQvtC30LTQsNCy0LDRgtGMIERPTS3RjdC70LXQvNC10L3RgiDRgSDQv9C+0LzQvtGJ0YzRjiDQvNC10YLQvtC00LAgcmVuZGVyLCDQtNC+0LHQsNCy0LvRj9GC0Ywg0LXQvNGDINC+0LHRgNCw0LHQvtGC0YfQuNC60LgsINGBINC/0L7QvNC+0YnRjNGOINC80LXRgtC+0LTQsCBiaW5kINC4INCy0L7Qt9Cy0YDQsNGJ0LDRgtGMINGB0L7Qt9C00LDQvdC90YvQuSDRjdC70LXQvNC10L3RglxuICAvLyDQnNC10YLQvtC0INC00L7Qu9C20LXQvSDQuNGB0L/QvtC70YzQt9C+0LLQsNGC0Ywg0LvQtdC90LjQstGL0LUg0LLRi9GH0LjRgdC70LXQvdC40Y8g4oCUINGN0LvQtdC80LXQvdGCINC00L7Qu9C20LXQvSDRgdC+0LfQtNCw0LLQsNGC0YzRgdGPINC/0YDQuCDQv9C10YDQstC+0Lwg0L7QsdGA0LDRidC10L3QuNC4INC6INCz0LXRgtGC0LXRgCDRgSDQv9C+0LzQvtGJ0YzRjiDQvNC10YLQvtC00LAgcmVuZGVyLCDQtNC+0LvQttC90Ysg0LTQvtCx0LDQstC70Y/RgtGM0YHRjyDQvtCx0YDQsNCx0L7RgtGH0LjQutC4ICjQvNC10YLQvtC0IGJpbmQpLlxuICAvLyDQn9GA0Lgg0L/QvtGB0LvQtdC00YPRjtGJ0LjRhSDQvtCx0YDQsNGJ0LXQvdC40Y/RhSDQtNC+0LvQttC10L0g0LjRgdC/0L7Qu9GM0LfQvtCy0LDRgtGM0YHRjyDRjdC70LXQvNC10L3Rgiwg0YHQvtC30LTQsNC90L3Ri9C5INC/0YDQuCDQv9C10YDQstC+0Lwg0LLRi9C30L7QstC1INCz0LXRgtGC0LXRgNCwLlxuICBnZXQgZWxlbWVudCgpIHtcbiAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMudGVtcGxhdGU7XG4gICAgLy8gaWYgKCFlbGVtZW50cy5oYXNPd25Qcm9wZXJ0eSh0ZW1wbGF0ZSkpIHtcbiAgICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoYGRpdmApO1xuICAgICAgZGl2LmlubmVySFRNTCA9IHRlbXBsYXRlO1xuICAgICAgY29uc3QgZWxlbSA9IGRpdi5maXJzdENoaWxkO1xuICAgICAgZWxlbWVudHNbdGVtcGxhdGVdID0gZWxlbTtcbiAgICAgIHJldHVybiBlbGVtO1xuICAgIC8vIH0gZWxzZSB7XG4gICAgICAvLyByZXR1cm4gZWxlbWVudHNbdGVtcGxhdGVdO1xuICAgIC8vIH1cbiAgfVxuXG4gIC8vINC+0YLRgNC40YHQvtCy0YvQstCw0LXRgiBET00t0Y3Qu9C10LzQtdC90YIsINC00L7QsdCw0LLQu9GP0LXRgiDQvdC10L7QsdGF0L7QtNC40LzRi9C1INC+0LHRgNCw0LHQvtGC0YfQuNC60LhcbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBtYWluLmNlbnRyYWxgKTtcbiAgICBjb25zdCBvbGRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI21haW5gKTtcbiAgICBwYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKG9sZEVsZW1lbnQpO1xuICAgIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIC8vINC00L7QsdCw0LLQu9GP0LXRgiDQvtCx0YDQsNCx0L7RgtGH0LjQutC4INGB0L7QsdGL0YLQuNC5XG4gIC8vINCc0LXRgtC+0LQg0L/QviDRg9C80L7Qu9GH0LDQvdC40Y4g0L3QuNGH0LXQs9C+INC90LUg0LTQtdC70LDQtdGCXG4gIC8vINCV0YHQu9C4INC90YPQttC90L4g0L7QsdGA0LDQsdC+0YLQsNGC0Ywg0LrQsNC60L7QtS3RgtC+INGB0L7QsdGL0YLQuNC1LCDRgtC+INGN0YLQvtGCINC80LXRgtC+0LQg0LTQvtC70LbQtdC9INCx0YvRgtGMINC/0LXRgNC10L7Qv9GA0LXQtNC10LvRkdC9INCyINC90LDRgdC70LXQtNC90LjQutC1INGBINC90LXQvtCx0YXQvtC00LjQvNC+0Lkg0LvQvtCz0LjQutC+0LlcbiAgYmluZCgpIHt9XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YXRzQmxvY2tWaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcihhbnN3ZXJzKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmFuc3dlcnMgPSBhbnN3ZXJzO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIGxldCByZXN1bHQgPSBgYDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICAgIGNvbnN0IGFuc3dlciA9IHRoaXMuYW5zd2Vyc1tpXTtcbiAgICAgIGxldCBtb2RpZmllciA9IGBgO1xuICAgICAgaWYgKGFuc3dlcikge1xuICAgICAgICBpZiAoYW5zd2VyLmlzT0spIHtcbiAgICAgICAgICBtb2RpZmllciA9IGBjb3JyZWN0YDtcbiAgICAgICAgICBpZiAoYW5zd2VyLnRpbWUgPCAxMCkge1xuICAgICAgICAgICAgbW9kaWZpZXIgPSBgZmFzdGA7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChhbnN3ZXIudGltZSA+IDIwKSB7XG4gICAgICAgICAgICBtb2RpZmllciA9IGBzbG93YDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbW9kaWZpZXIgPSBgd3JvbmdgO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtb2RpZmllciA9IGB1bmtub3duYDtcbiAgICAgIH1cbiAgICAgIHJlc3VsdCArPSBgPGxpIGNsYXNzPVwic3RhdHNfX3Jlc3VsdCBzdGF0c19fcmVzdWx0LS0ke21vZGlmaWVyfVwiPjwvbGk+YDtcbiAgICB9XG4gICAgcmV0dXJuIGA8dWwgY2xhc3M9XCJzdGF0c1wiPiR7cmVzdWx0fTwvdWw+YDtcbn1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYHNlY3Rpb24uZ2FtZWApO1xuICAgIGNvbnN0IG9sZEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGB1bC5zdGF0c2ApO1xuICAgIHBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQob2xkRWxlbWVudCk7XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG59XG4iLCIvLyBTY29yaW5nIGF0IHRoZSBlbmQgb2YgdGhlIGdhbWVcbi8vIEBwYXJhbSAge2FycmF5fSBhbnN3ZXJzINC80LDRgdGB0LjQsiDQvtGC0LLQtdGC0L7QsiDQv9C+0LvRjNC30L7QstCw0YLQtdC70Y9cbi8vIEBwYXJhbSAge2ludGVnZXJ9IGxpdmVzINC60L7Quy3QstC+INC+0YHRgtCw0LLRiNC40YXRgdGPINC20LjQt9C90LXQuVxuLy8gQHJldHVybiB7aW50ZWdlcn0g0LrQvtC7LdCy0L4g0L3QsNCx0YDQsNC90L3Ri9GFINC+0YfQutC+0LJcbmZ1bmN0aW9uIGdldFRvdGFsU2NvcmUoYW5zd2VycywgbGl2ZXMpIHtcbiAgaWYgKGFuc3dlcnMubGVuZ3RoIDwgMTApIHtcbiAgICByZXR1cm4gLTE7XG4gIH1cbiAgY29uc3Qgc2NvcmUgPSBhbnN3ZXJzLnJlZHVjZSgoYWNjLCBhbnN3ZXIpID0+IHtcbiAgICBpZiAoYW5zd2VyLmlzT0spIHtcbiAgICAgIGFjYyArPSAxMDA7XG4gICAgfVxuICAgIGlmIChhbnN3ZXIudGltZSA8IDEwKSB7XG4gICAgICBhY2MgKz0gNTA7XG4gICAgfVxuICAgIGlmIChhbnN3ZXIudGltZSA+IDIwKSB7XG4gICAgICBhY2MgLT0gNTA7XG4gICAgfVxuICAgIHJldHVybiBhY2M7XG4gIH0sIDApO1xuICByZXR1cm4gc2NvcmUgKyBsaXZlcyAqIDUwO1xufVxuXG5mdW5jdGlvbiBnZXRSaWdodEFuc3dlcnNDb3VudChhbnN3ZXJzKSB7XG4gIHJldHVybiBhbnN3ZXJzLmZpbHRlcigoYW5zd2VyKSA9PiBhbnN3ZXIuaXNPSykubGVuZ3RoO1xufVxuXG5mdW5jdGlvbiBnZXRTcGVlZEJvbnVzQ291bnQoYW5zd2Vycykge1xuICByZXR1cm4gYW5zd2Vycy5maWx0ZXIoKGFuc3dlcikgPT4gYW5zd2VyLnRpbWUgPCAxMCkubGVuZ3RoO1xufVxuXG5mdW5jdGlvbiBnZXRTbG93UGVuYWx0eUNvdW50KGFuc3dlcnMpIHtcbiAgcmV0dXJuIGFuc3dlcnMuZmlsdGVyKChhbnN3ZXIpID0+IGFuc3dlci50aW1lID4gMjApLmxlbmd0aDtcbn1cblxuZXhwb3J0IHtnZXRUb3RhbFNjb3JlLCBnZXRSaWdodEFuc3dlcnNDb3VudCwgZ2V0U3BlZWRCb251c0NvdW50LCBnZXRTbG93UGVuYWx0eUNvdW50fTtcbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcbmltcG9ydCBTdGF0c0Jsb2NrVmlldyBmcm9tICcuLi91dGlsLXZpZXdzL3N0YXRzLWJsb2NrLXZpZXcuanMnO1xuaW1wb3J0IHtnZXRUb3RhbFNjb3JlLCBnZXRSaWdodEFuc3dlcnNDb3VudCwgZ2V0U3BlZWRCb251c0NvdW50LCBnZXRTbG93UGVuYWx0eUNvdW50fSBmcm9tICcuLi9zY29yZS5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YXRzU2luZ2xlVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoYW5zd2VycywgbGl2ZXMpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuYW5zd2VycyA9IGFuc3dlcnM7XG4gICAgdGhpcy5saXZlcyA9IGxpdmVzO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIGNvbnN0IGlzV2luID0gdGhpcy5hbnN3ZXJzLmxlbmd0aCA9PT0gMTA7XG4gICAgY29uc3Qgc2NvcmUgPSBnZXRUb3RhbFNjb3JlKHRoaXMuYW5zd2VycywgdGhpcy5saXZlcyk7XG4gICAgY29uc3QgcmlnaHRBbnN3ZXJzQ291bnQgPSBnZXRSaWdodEFuc3dlcnNDb3VudCh0aGlzLmFuc3dlcnMpO1xuICAgIGNvbnN0IHNwZWVkQm9udXNDb3VudCA9IGdldFNwZWVkQm9udXNDb3VudCh0aGlzLmFuc3dlcnMpO1xuICAgIGNvbnN0IHNsb3dQZW5hbHR5Q291bnQgPSBnZXRTbG93UGVuYWx0eUNvdW50KHRoaXMuYW5zd2Vycyk7XG4gICAgY29uc3Qgc3RhdHNCbG9jayA9IG5ldyBTdGF0c0Jsb2NrVmlldyh0aGlzLmFuc3dlcnMpO1xuICAgIHJldHVybiBgPHNlY3Rpb24gY2xhc3M9XCJyZXN1bHRcIj5cbiAgICAgIDxoMiBjbGFzcz1cInJlc3VsdF9fdGl0bGUgcmVzdWx0X190aXRsZS0tc2luZ2xlXCI+JHsoaXNXaW4pID8gc2NvcmUgKyBgINC+0YfQutC+0LIuINCd0LXQv9C70L7RhdC+IWAgOiBg0J/QvtGA0LDQttC10L3QuNC1IWAgfTwvaDI+XG4gICAgICA8dGFibGUgY2xhc3M9XCJyZXN1bHRfX3RhYmxlIHJlc3VsdF9fdGFibGUtLXNpbmdsZVwiPlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRkIGNvbHNwYW49XCIyXCI+XG4gICAgICAgICAgICAke3N0YXRzQmxvY2sudGVtcGxhdGV9XG4gICAgICAgICAgPC90ZD5cbiAgICAgICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX3BvaW50c1wiPsOXIDEwMDwvdGQ+XG4gICAgICAgICAgPHRkIGNsYXNzPVwicmVzdWx0X190b3RhbFwiPiR7KGlzV2luKSA/IHJpZ2h0QW5zd2Vyc0NvdW50ICogMTAwIDogYEZhaWxgIH08L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgICAkeyhzcGVlZEJvbnVzQ291bnQpID8gU3RhdHNTaW5nbGVWaWV3LmdldFNwZWVkQm9udXNDb250ZW50KHNwZWVkQm9udXNDb3VudCkgOiBgYH1cbiAgICAgICAgJHsodGhpcy5saXZlcykgPyBTdGF0c1NpbmdsZVZpZXcuZ2V0TGl2ZXNCb251c0NvbnRlbnQodGhpcy5saXZlcykgOiBgYH1cbiAgICAgICAgJHsoc2xvd1BlbmFsdHlDb3VudCkgPyBTdGF0c1NpbmdsZVZpZXcuZ2V0U2xvd1BlbmFsdHlDb250ZW50KHNsb3dQZW5hbHR5Q291bnQpIDogYGB9XG4gICAgICA8L3RhYmxlPlxuICAgIDwvc2VjdGlvbj5gO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjbWFpbmApO1xuICAgIGNvbnN0IG9sZEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBzZWN0aW9uLnJlc3VsdGApO1xuICAgIHBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQob2xkRWxlbWVudCk7XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgc3RhdGljIGdldFNwZWVkQm9udXNDb250ZW50KHNwZWVkQm9udXNDb3VudCkge1xuICAgIHJldHVybiBgPHRyPlxuICAgICAgPHRkPjwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX2V4dHJhXCI+0JHQvtC90YPRgSDQt9CwINGB0LrQvtGA0L7RgdGC0Yw6PC90ZD5cbiAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fZXh0cmFcIj4ke3NwZWVkQm9udXNDb3VudH0gPHNwYW4gY2xhc3M9XCJzdGF0c19fcmVzdWx0IHN0YXRzX19yZXN1bHQtLWZhc3RcIj48L3NwYW4+PC90ZD5cbiAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fcG9pbnRzXCI+w5cgNTA8L3RkPlxuICAgICAgPHRkIGNsYXNzPVwicmVzdWx0X190b3RhbFwiPiR7c3BlZWRCb251c0NvdW50ICogNTB9PC90ZD5cbiAgICA8L3RyPmA7XG4gIH1cblxuICBzdGF0aWMgZ2V0TGl2ZXNCb251c0NvbnRlbnQobGl2ZXMpIHtcbiAgICByZXR1cm4gYDx0cj5cbiAgICAgIDx0ZD48L3RkPlxuICAgICAgPHRkIGNsYXNzPVwicmVzdWx0X19leHRyYVwiPtCR0L7QvdGD0YEg0LfQsCDQttC40LfQvdC4OjwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX2V4dHJhXCI+JHtsaXZlc30gPHNwYW4gY2xhc3M9XCJzdGF0c19fcmVzdWx0IHN0YXRzX19yZXN1bHQtLWFsaXZlXCI+PC9zcGFuPjwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX3BvaW50c1wiPsOXIDUwPC90ZD5cbiAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fdG90YWxcIj4ke2xpdmVzICogNTB9PC90ZD5cbiAgICA8L3RyPmA7XG4gIH1cblxuICBzdGF0aWMgZ2V0U2xvd1BlbmFsdHlDb250ZW50KHNsb3dQZW5hbHR5Q291bnQpIHtcbiAgICByZXR1cm4gYDx0cj5cbiAgICAgIDx0ZD48L3RkPlxuICAgICAgPHRkIGNsYXNzPVwicmVzdWx0X19leHRyYVwiPtCo0YLRgNCw0YQg0LfQsCDQvNC10LTQu9C40YLQtdC70YzQvdC+0YHRgtGMOjwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX2V4dHJhXCI+JHtzbG93UGVuYWx0eUNvdW50fSA8c3BhbiBjbGFzcz1cInN0YXRzX19yZXN1bHQgc3RhdHNfX3Jlc3VsdC0tc2xvd1wiPjwvc3Bhbj48L3RkPlxuICAgICAgPHRkIGNsYXNzPVwicmVzdWx0X19wb2ludHNcIj7DlyA1MDwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX3RvdGFsXCI+LSR7c2xvd1BlbmFsdHlDb3VudCAqIDUwfTwvdGQ+XG4gICAgPC90cj5gO1xuICB9XG5cbn1cblxuLy8gIGZvciAobGV0IGkgPSAwOyBpIDwgYW5zd2Vycy5sZW5ndGg7IGkrKykge1xuLy8gICAgcmVzdWx0ICs9IGA8dGFibGUgY2xhc3M9XCJyZXN1bHRfX3RhYmxlXCI+XG4vLyAgICAgIDx0cj5cbi8vICAgICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX251bWJlclwiPiR7aSArIDF9LjwvdGQ+XG4vLyAgICAgICAgPHRkIGNvbHNwYW49XCIyXCI+XG4vLyAgICAgICAgICAke2dldFN0YXRzSFRNTFN0cmluZyhhbnN3ZXJzKX1cbi8vICAgICAgICA8L3RkPlxuLy8gICAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fcG9pbnRzXCI+w5cgMTAwPC90ZD5cbi8vICAgICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX3RvdGFsXCI+JHsoaXNXaW4pID8gZ2V0U2NvcmUoYW5zd2VycywgbGl2ZXMpIDogYEZhaWwhYCB9PC90ZD5cbi8vICAgICAgPC90cj5cbi8vICAgICAgJHtnZXRTcGVlZEJvbnVzKCl9XG4vLyAgICAgICR7Z2V0TGl2ZXNCb251cygpfVxuLy8gICAgICAke2dldFNsb3dQZW5hbHR5KCl9XG4vLyAgICAgIDx0cj5cbi8vICAgICAgICA8dGQgY29sc3Bhbj1cIjVcIiBjbGFzcz1cInJlc3VsdF9fdG90YWwgIHJlc3VsdF9fdG90YWwtLWZpbmFsXCI+JHsoaXNXaW4pID8gZ2V0U2NvcmUoYW5zd2VycywgbGl2ZXMpIDogYEZhaWwhYCB9PC90ZD5cbi8vICAgICAgPC90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
