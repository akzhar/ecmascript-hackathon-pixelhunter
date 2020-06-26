var statsScreen = (function () {
  'use strict';

  const config = {
    GET_DATA_URL: `https://raw.githubusercontent.com/akzhar/pixelhunter/master/src/js/game-model/data.json`,
    POST_DATA_URL: `https://echo.htmlacademy.ru/`,
    GAMES_COUNT: 10,
    LIVES_COUNT: 3,
    TIME_TO_ANSWER: 30000, // 30 sec
    COLOR_RED: `#d74040`,
    AnswerType: {
      PAINTING: `painting`,
      PHOTO: `photo`
    },
    QuestionType: {
      TWO_OF_TWO: `two-of-two`,
      TINDER_LIKE: `tinder-like`,
      ONE_OF_THREE: `one-of-three`
    },
    QuestionTypeToFrameSize: {
      'two-of-two': {width: 468, height: 458},
      'tinder-like': {width: 705, height: 455},
      'one-of-three': {width: 304, height: 455}
    }
  };

  async function postData(data = {}) {
    const response = await fetch(config.POST_DATA_URL, {
      method: `POST`,
      headers: {
        'Content-Type': `application/json`
      },
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return await response.json();
  }

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

  class ConfirmModalView extends AbstractView {

    constructor() {
      super();
    }

    get template() {
      return `<section class="modal">
              <form class="modal__inner">
                <button class="modal__close" type="button">
                  <span class="visually-hidden">Закрыть</span>
                </button>
                <h2 class="modal__title">Подтверждение</h2>
                <p class="modal__text">Вы уверены что хотите начать игру заново?</p>
                <div class="modal__button-wrapper">
                  <button class="modal__btn modal__btn--ok">Ок</button>
                  <button class="modal__btn modal__btn--cancel">Отмена</button>
                </div>
              </form>
            </section>`;
    }

    render() {
      const parentElement = document.querySelector(`#main`);
      parentElement.appendChild(this.element);
    }

    bind(cb) {
      const parentElement = document.querySelector(`#main`);
      const modal = document.querySelector(`.modal`);
      const closeBtn = modal.querySelector(`.modal__close`);
      const cancelBtn = modal.querySelector(`.modal__btn--cancel`);
      const okBtn = modal.querySelector(`.modal__btn--ok`);
      document.addEventListener(`keydown`, (evt) => {
        if (evt.keyCode === 27) {
          evt.preventDefault();
          parentElement.removeChild(modal);
        }
      });
      closeBtn.addEventListener(`click`, (evt) => {
        evt.preventDefault();
        parentElement.removeChild(modal);
      });
      cancelBtn.addEventListener(`click`, (evt) => {
        evt.preventDefault();
        parentElement.removeChild(modal);
      });
      okBtn.addEventListener(`click`, (evt) => {
        evt.preventDefault();
        cb();
      });
    }
  }

  class AbstractScreen {

    constructor() {
      this.gameModel = null;
      this.game = null;
      this.view = null;
      this.timer = null;
      this.startScreen = null;
      this.nextScreen = null;
      this.endScreen = null;
    }

    // метод показа экрана отрисовывает экран и запускает метод _onScreenShow
    show() {
      this.view.render();
      this._onScreenShow();
    }

    // метод реализует бизнес логику экрана
    _onScreenShow() {}

    // метод перезапускает игру
    _restartGame() {
      const confirmModal = new ConfirmModalView();
      confirmModal.render();
      confirmModal.bind(() => {
        this.gameModel.reset();
        this.startScreen.show();
        if (this.timer) {
          this.timer.stop();
        }
      });
    }
  }

  class StatsScreenView extends AbstractView {

    constructor() {
      super();
    }

    get template() {
      return `<div id="main" class="central__content">
              <header class="header">
                <!-- PLACE TO BACK ARROW -->
              </header>
              <section class="result"></section>
            </div>`;
    }

  }

  class StatsBlockView extends AbstractView {

    constructor(answers) {
      super();
      this.answers = answers;
    }

    get template() {
      let result = ``;
      for (let i = 0; i < config.GAMES_COUNT; i++) {
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
    if (answers.length < config.GAMES_COUNT) {
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

  class BackArrowView extends AbstractView {

    constructor() {
      super();
    }

    get template() {
      return `<button class="back">
              <span class="visually-hidden">Вернуться к началу</span>
              <svg class="icon" width="45" height="45" viewBox="0 0 45 45" fill="#000000">
                <use xlink:href="img/sprite.svg#arrow-left"></use>
              </svg>
              <svg class="icon" width="101" height="44" viewBox="0 0 101 44" fill="#000000">
                <use xlink:href="img/sprite.svg#logo-small"></use>
              </svg>
            </button>`;
    }

    render() {
      const parentElement = document.querySelector(`header.header`);
      parentElement.insertBefore(this.element, parentElement.firstChild);
    }

    bind(cb) {
      const backArrow = document.querySelector(`.back`);
      backArrow.addEventListener(`click`, cb);
    }
  }

  class StatsScreen extends AbstractScreen {

    constructor(gameModel) {
      super();
      this.gameModel = gameModel;
      this.view = new StatsScreenView();
    }

    _onScreenShow() {
      const statsSingleBlock = new StatsSingleView(this.gameModel.answers, this.gameModel.lives);
      const backArrow = new BackArrowView();
      const restartGame = this._restartGame.bind(this);

      statsSingleBlock.render();
      backArrow.render();

      backArrow.bind(restartGame);

      postData({answers: this.gameModel.answers, lives: this.gameModel.lives})
      .catch(() => {
        throw new Error(`Error during POST games data...`);
      });
    }
  }

  return StatsScreen;

}());

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdHMtc2NyZWVuL3N0YXRzLXNjcmVlbi5qcyIsInNvdXJjZXMiOlsic3JjL2pzL2NvbmZpZy5qcyIsInNyYy9qcy9iYWNrZW5kLmpzIiwic3JjL2pzL2Fic3RyYWN0LXZpZXcuanMiLCJzcmMvanMvdXRpbC12aWV3cy9jb25maXJtLW1vZGFsLXZpZXcuanMiLCJzcmMvanMvYWJzdHJhY3Qtc2NyZWVuLmpzIiwic3JjL2pzL3N0YXRzLXNjcmVlbi9zdGF0cy1zY3JlZW4tdmlldy5qcyIsInNyYy9qcy91dGlsLXZpZXdzL3N0YXRzLWJsb2NrLXZpZXcuanMiLCJzcmMvanMvc2NvcmUuanMiLCJzcmMvanMvc3RhdHMtc2NyZWVuL3N0YXRzLXNpbmdsZS12aWV3LmpzIiwic3JjL2pzL3V0aWwtdmlld3MvYmFjay1hcnJvdy12aWV3LmpzIiwic3JjL2pzL3N0YXRzLXNjcmVlbi9zdGF0cy1zY3JlZW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgY29uZmlnID0ge1xuICBHRVRfREFUQV9VUkw6IGBodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vYWt6aGFyL3BpeGVsaHVudGVyL21hc3Rlci9zcmMvanMvZ2FtZS1tb2RlbC9kYXRhLmpzb25gLFxuICBQT1NUX0RBVEFfVVJMOiBgaHR0cHM6Ly9lY2hvLmh0bWxhY2FkZW15LnJ1L2AsXG4gIEdBTUVTX0NPVU5UOiAxMCxcbiAgTElWRVNfQ09VTlQ6IDMsXG4gIFRJTUVfVE9fQU5TV0VSOiAzMDAwMCwgLy8gMzAgc2VjXG4gIENPTE9SX1JFRDogYCNkNzQwNDBgLFxuICBBbnN3ZXJUeXBlOiB7XG4gICAgUEFJTlRJTkc6IGBwYWludGluZ2AsXG4gICAgUEhPVE86IGBwaG90b2BcbiAgfSxcbiAgUXVlc3Rpb25UeXBlOiB7XG4gICAgVFdPX09GX1RXTzogYHR3by1vZi10d29gLFxuICAgIFRJTkRFUl9MSUtFOiBgdGluZGVyLWxpa2VgLFxuICAgIE9ORV9PRl9USFJFRTogYG9uZS1vZi10aHJlZWBcbiAgfSxcbiAgUXVlc3Rpb25UeXBlVG9GcmFtZVNpemU6IHtcbiAgICAndHdvLW9mLXR3byc6IHt3aWR0aDogNDY4LCBoZWlnaHQ6IDQ1OH0sXG4gICAgJ3RpbmRlci1saWtlJzoge3dpZHRoOiA3MDUsIGhlaWdodDogNDU1fSxcbiAgICAnb25lLW9mLXRocmVlJzoge3dpZHRoOiAzMDQsIGhlaWdodDogNDU1fVxuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjb25maWc7XG4iLCJpbXBvcnQgY29uZmlnIGZyb20gJy4vY29uZmlnLmpzJztcblxuYXN5bmMgZnVuY3Rpb24gbG9hZEdhbWVzKCkge1xuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGNvbmZpZy5HRVRfREFUQV9VUkwpO1xuICBjb25zdCBnYW1lc1Byb21pc2UgPSBhd2FpdCByZXNwb25zZS5qc29uKClcbiAgcmV0dXJuIGdhbWVzUHJvbWlzZTtcbn07XG5cbmFzeW5jIGZ1bmN0aW9uIHBvc3REYXRhKGRhdGEgPSB7fSkge1xuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGNvbmZpZy5QT1NUX0RBVEFfVVJMLCB7XG4gICAgbWV0aG9kOiBgUE9TVGAsXG4gICAgaGVhZGVyczoge1xuICAgICAgJ0NvbnRlbnQtVHlwZSc6IGBhcHBsaWNhdGlvbi9qc29uYFxuICAgIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoZGF0YSkgLy8gYm9keSBkYXRhIHR5cGUgbXVzdCBtYXRjaCBcIkNvbnRlbnQtVHlwZVwiIGhlYWRlclxuICB9KTtcbiAgcmV0dXJuIGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbn07XG5cbmV4cG9ydCB7bG9hZEdhbWVzLCBwb3N0RGF0YX07XG4iLCJjb25zdCBlbGVtZW50cyA9IHt9O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKCkge31cblxuICAvLyDQstC+0LfQstGA0LDRidCw0LXRgiDRgdGC0YDQvtC60YMsINGB0L7QtNC10YDQttCw0YnRg9GOINGA0LDQt9C80LXRgtC60YNcbiAgZ2V0IHRlbXBsYXRlKCkge31cblxuICAvLyDRgdC+0LfQtNCw0LXRgiDQuCDQstC+0LfQstGA0LDRidCw0LXRgiBET00t0Y3Qu9C10LzQtdC90YIg0L3QsCDQvtGB0L3QvtCy0LUg0YjQsNCx0LvQvtC90LBcbiAgLy8g0LTQvtC70LbQtdC9INGB0L7Qt9C00LDQstCw0YLRjCBET00t0Y3Qu9C10LzQtdC90YIg0YEg0L/QvtC80L7RidGM0Y4g0LzQtdGC0L7QtNCwIHJlbmRlciwg0LTQvtCx0LDQstC70Y/RgtGMINC10LzRgyDQvtCx0YDQsNCx0L7RgtGH0LjQutC4LCDRgSDQv9C+0LzQvtGJ0YzRjiDQvNC10YLQvtC00LAgYmluZCDQuCDQstC+0LfQstGA0LDRidCw0YLRjCDRgdC+0LfQtNCw0L3QvdGL0Lkg0Y3Qu9C10LzQtdC90YJcbiAgLy8g0JzQtdGC0L7QtCDQtNC+0LvQttC10L0g0LjRgdC/0L7Qu9GM0LfQvtCy0LDRgtGMINC70LXQvdC40LLRi9C1INCy0YvRh9C40YHQu9C10L3QuNGPIOKAlCDRjdC70LXQvNC10L3RgiDQtNC+0LvQttC10L0g0YHQvtC30LTQsNCy0LDRgtGM0YHRjyDQv9GA0Lgg0L/QtdGA0LLQvtC8INC+0LHRgNCw0YnQtdC90LjQuCDQuiDQs9C10YLRgtC10YAg0YEg0L/QvtC80L7RidGM0Y4g0LzQtdGC0L7QtNCwIHJlbmRlciwg0LTQvtC70LbQvdGLINC00L7QsdCw0LLQu9GP0YLRjNGB0Y8g0L7QsdGA0LDQsdC+0YLRh9C40LrQuCAo0LzQtdGC0L7QtCBiaW5kKS5cbiAgLy8g0J/RgNC4INC/0L7RgdC70LXQtNGD0Y7RidC40YUg0L7QsdGA0LDRidC10L3QuNGP0YUg0LTQvtC70LbQtdC9INC40YHQv9C+0LvRjNC30L7QstCw0YLRjNGB0Y8g0Y3Qu9C10LzQtdC90YIsINGB0L7Qt9C00LDQvdC90YvQuSDQv9GA0Lgg0L/QtdGA0LLQvtC8INCy0YvQt9C+0LLQtSDQs9C10YLRgtC10YDQsC5cbiAgZ2V0IGVsZW1lbnQoKSB7XG4gICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlO1xuICAgIC8vIGlmICghZWxlbWVudHMuaGFzT3duUHJvcGVydHkodGVtcGxhdGUpKSB7XG4gICAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGBkaXZgKTtcbiAgICAgIGRpdi5pbm5lckhUTUwgPSB0ZW1wbGF0ZTtcbiAgICAgIGNvbnN0IGVsZW0gPSBkaXYuZmlyc3RDaGlsZDtcbiAgICAgIGVsZW1lbnRzW3RlbXBsYXRlXSA9IGVsZW07XG4gICAgICByZXR1cm4gZWxlbTtcbiAgICAvLyB9IGVsc2Uge1xuICAgICAgLy8gcmV0dXJuIGVsZW1lbnRzW3RlbXBsYXRlXTtcbiAgICAvLyB9XG4gIH1cblxuICAvLyDQvtGC0YDQuNGB0L7QstGL0LLQsNC10YIgRE9NLdGN0LvQtdC80LXQvdGCLCDQtNC+0LHQsNCy0LvRj9C10YIg0L3QtdC+0LHRhdC+0LTQuNC80YvQtSDQvtCx0YDQsNCx0L7RgtGH0LjQutC4XG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgbWFpbi5jZW50cmFsYCk7XG4gICAgY29uc3Qgb2xkRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCNtYWluYCk7XG4gICAgcGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChvbGRFbGVtZW50KTtcbiAgICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XG4gIH1cblxuICAvLyDQtNC+0LHQsNCy0LvRj9C10YIg0L7QsdGA0LDQsdC+0YLRh9C40LrQuCDRgdC+0LHRi9GC0LjQuVxuICAvLyDQnNC10YLQvtC0INC/0L4g0YPQvNC+0LvRh9Cw0L3QuNGOINC90LjRh9C10LPQviDQvdC1INC00LXQu9Cw0LXRglxuICAvLyDQldGB0LvQuCDQvdGD0LbQvdC+INC+0LHRgNCw0LHQvtGC0LDRgtGMINC60LDQutC+0LUt0YLQviDRgdC+0LHRi9GC0LjQtSwg0YLQviDRjdGC0L7RgiDQvNC10YLQvtC0INC00L7Qu9C20LXQvSDQsdGL0YLRjCDQv9C10YDQtdC+0L/RgNC10LTQtdC70ZHQvSDQsiDQvdCw0YHQu9C10LTQvdC40LrQtSDRgSDQvdC10L7QsdGF0L7QtNC40LzQvtC5INC70L7Qs9C40LrQvtC5XG4gIGJpbmQoKSB7fVxufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25maXJtTW9kYWxWaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPHNlY3Rpb24gY2xhc3M9XCJtb2RhbFwiPlxuICAgICAgICAgICAgICA8Zm9ybSBjbGFzcz1cIm1vZGFsX19pbm5lclwiPlxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJtb2RhbF9fY2xvc2VcIiB0eXBlPVwiYnV0dG9uXCI+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInZpc3VhbGx5LWhpZGRlblwiPtCX0LDQutGA0YvRgtGMPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDxoMiBjbGFzcz1cIm1vZGFsX190aXRsZVwiPtCf0L7QtNGC0LLQtdGA0LbQtNC10L3QuNC1PC9oMj5cbiAgICAgICAgICAgICAgICA8cCBjbGFzcz1cIm1vZGFsX190ZXh0XCI+0JLRiyDRg9Cy0LXRgNC10L3RiyDRh9GC0L4g0YXQvtGC0LjRgtC1INC90LDRh9Cw0YLRjCDQuNCz0YDRgyDQt9Cw0L3QvtCy0L4/PC9wPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbF9fYnV0dG9uLXdyYXBwZXJcIj5cbiAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJtb2RhbF9fYnRuIG1vZGFsX19idG4tLW9rXCI+0J7QujwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cIm1vZGFsX19idG4gbW9kYWxfX2J0bi0tY2FuY2VsXCI+0J7RgtC80LXQvdCwPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgIDwvc2VjdGlvbj5gO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjbWFpbmApO1xuICAgIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIGJpbmQoY2IpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI21haW5gKTtcbiAgICBjb25zdCBtb2RhbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5tb2RhbGApO1xuICAgIGNvbnN0IGNsb3NlQnRuID0gbW9kYWwucXVlcnlTZWxlY3RvcihgLm1vZGFsX19jbG9zZWApO1xuICAgIGNvbnN0IGNhbmNlbEJ0biA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoYC5tb2RhbF9fYnRuLS1jYW5jZWxgKTtcbiAgICBjb25zdCBva0J0biA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoYC5tb2RhbF9fYnRuLS1va2ApO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoYGtleWRvd25gLCAoZXZ0KSA9PiB7XG4gICAgICBpZiAoZXZ0LmtleUNvZGUgPT09IDI3KSB7XG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBwYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKG1vZGFsKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBjbG9zZUJ0bi5hZGRFdmVudExpc3RlbmVyKGBjbGlja2AsIChldnQpID0+IHtcbiAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgcGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChtb2RhbCk7XG4gICAgfSk7XG4gICAgY2FuY2VsQnRuLmFkZEV2ZW50TGlzdGVuZXIoYGNsaWNrYCwgKGV2dCkgPT4ge1xuICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBwYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKG1vZGFsKTtcbiAgICB9KTtcbiAgICBva0J0bi5hZGRFdmVudExpc3RlbmVyKGBjbGlja2AsIChldnQpID0+IHtcbiAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgY2IoKTtcbiAgICB9KTtcbiAgfVxufVxuIiwiaW1wb3J0IENvbmZpcm1Nb2RhbFZpZXcgZnJvbSAnLi91dGlsLXZpZXdzL2NvbmZpcm0tbW9kYWwtdmlldy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFic3RyYWN0U2NyZWVuIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmdhbWVNb2RlbCA9IG51bGw7XG4gICAgdGhpcy5nYW1lID0gbnVsbDtcbiAgICB0aGlzLnZpZXcgPSBudWxsO1xuICAgIHRoaXMudGltZXIgPSBudWxsO1xuICAgIHRoaXMuc3RhcnRTY3JlZW4gPSBudWxsO1xuICAgIHRoaXMubmV4dFNjcmVlbiA9IG51bGw7XG4gICAgdGhpcy5lbmRTY3JlZW4gPSBudWxsO1xuICB9XG5cbiAgLy8g0LzQtdGC0L7QtCDQv9C+0LrQsNC30LAg0Y3QutGA0LDQvdCwINC+0YLRgNC40YHQvtCy0YvQstCw0LXRgiDRjdC60YDQsNC9INC4INC30LDQv9GD0YHQutCw0LXRgiDQvNC10YLQvtC0IF9vblNjcmVlblNob3dcbiAgc2hvdygpIHtcbiAgICB0aGlzLnZpZXcucmVuZGVyKCk7XG4gICAgdGhpcy5fb25TY3JlZW5TaG93KCk7XG4gIH1cblxuICAvLyDQvNC10YLQvtC0INGA0LXQsNC70LjQt9GD0LXRgiDQsdC40LfQvdC10YEg0LvQvtCz0LjQutGDINGN0LrRgNCw0L3QsFxuICBfb25TY3JlZW5TaG93KCkge31cblxuICAvLyDQvNC10YLQvtC0INC/0LXRgNC10LfQsNC/0YPRgdC60LDQtdGCINC40LPRgNGDXG4gIF9yZXN0YXJ0R2FtZSgpIHtcbiAgICBjb25zdCBjb25maXJtTW9kYWwgPSBuZXcgQ29uZmlybU1vZGFsVmlldygpO1xuICAgIGNvbmZpcm1Nb2RhbC5yZW5kZXIoKTtcbiAgICBjb25maXJtTW9kYWwuYmluZCgoKSA9PiB7XG4gICAgICB0aGlzLmdhbWVNb2RlbC5yZXNldCgpO1xuICAgICAgdGhpcy5zdGFydFNjcmVlbi5zaG93KCk7XG4gICAgICBpZiAodGhpcy50aW1lcikge1xuICAgICAgICB0aGlzLnRpbWVyLnN0b3AoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGF0c1NjcmVlblZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuIGA8ZGl2IGlkPVwibWFpblwiIGNsYXNzPVwiY2VudHJhbF9fY29udGVudFwiPlxuICAgICAgICAgICAgICA8aGVhZGVyIGNsYXNzPVwiaGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBUTyBCQUNLIEFSUk9XIC0tPlxuICAgICAgICAgICAgICA8L2hlYWRlcj5cbiAgICAgICAgICAgICAgPHNlY3Rpb24gY2xhc3M9XCJyZXN1bHRcIj48L3NlY3Rpb24+XG4gICAgICAgICAgICA8L2Rpdj5gO1xuICB9XG5cbn1cbiIsImltcG9ydCBjb25maWcgZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhdHNCbG9ja1ZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKGFuc3dlcnMpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuYW5zd2VycyA9IGFuc3dlcnM7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgbGV0IHJlc3VsdCA9IGBgO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29uZmlnLkdBTUVTX0NPVU5UOyBpKyspIHtcbiAgICAgIGNvbnN0IGFuc3dlciA9IHRoaXMuYW5zd2Vyc1tpXTtcbiAgICAgIGxldCBtb2RpZmllciA9IGBgO1xuICAgICAgaWYgKGFuc3dlcikge1xuICAgICAgICBpZiAoYW5zd2VyLmlzT0spIHtcbiAgICAgICAgICBtb2RpZmllciA9IGBjb3JyZWN0YDtcbiAgICAgICAgICBpZiAoYW5zd2VyLnRpbWUgPCAxMCkge1xuICAgICAgICAgICAgbW9kaWZpZXIgPSBgZmFzdGA7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChhbnN3ZXIudGltZSA+IDIwKSB7XG4gICAgICAgICAgICBtb2RpZmllciA9IGBzbG93YDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbW9kaWZpZXIgPSBgd3JvbmdgO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtb2RpZmllciA9IGB1bmtub3duYDtcbiAgICAgIH1cbiAgICAgIHJlc3VsdCArPSBgPGxpIGNsYXNzPVwic3RhdHNfX3Jlc3VsdCBzdGF0c19fcmVzdWx0LS0ke21vZGlmaWVyfVwiPjwvbGk+YDtcbiAgICB9XG4gICAgcmV0dXJuIGA8dWwgY2xhc3M9XCJzdGF0c1wiPiR7cmVzdWx0fTwvdWw+YDtcbn1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYHNlY3Rpb24uZ2FtZWApO1xuICAgIGNvbnN0IG9sZEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGB1bC5zdGF0c2ApO1xuICAgIHBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQob2xkRWxlbWVudCk7XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG59XG4iLCJpbXBvcnQgY29uZmlnIGZyb20gJy4vY29uZmlnLmpzJztcblxuLy8gU2NvcmluZyBhdCB0aGUgZW5kIG9mIHRoZSBnYW1lXG4vLyBAcGFyYW0gIHthcnJheX0gYW5zd2VycyDQvNCw0YHRgdC40LIg0L7RgtCy0LXRgtC+0LIg0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GPXG4vLyBAcGFyYW0gIHtpbnRlZ2VyfSBsaXZlcyDQutC+0Lst0LLQviDQvtGB0YLQsNCy0YjQuNGF0YHRjyDQttC40LfQvdC10Llcbi8vIEByZXR1cm4ge2ludGVnZXJ9INC60L7Quy3QstC+INC90LDQsdGA0LDQvdC90YvRhSDQvtGH0LrQvtCyXG5mdW5jdGlvbiBnZXRUb3RhbFNjb3JlKGFuc3dlcnMsIGxpdmVzKSB7XG4gIGlmIChhbnN3ZXJzLmxlbmd0aCA8IGNvbmZpZy5HQU1FU19DT1VOVCkge1xuICAgIHJldHVybiAtMTtcbiAgfVxuICBjb25zdCBzY29yZSA9IGFuc3dlcnMucmVkdWNlKChhY2MsIGFuc3dlcikgPT4ge1xuICAgIGlmIChhbnN3ZXIuaXNPSykge1xuICAgICAgYWNjICs9IDEwMDtcbiAgICB9XG4gICAgaWYgKGFuc3dlci50aW1lIDwgMTApIHtcbiAgICAgIGFjYyArPSA1MDtcbiAgICB9XG4gICAgaWYgKGFuc3dlci50aW1lID4gMjApIHtcbiAgICAgIGFjYyAtPSA1MDtcbiAgICB9XG4gICAgcmV0dXJuIGFjYztcbiAgfSwgMCk7XG4gIHJldHVybiBzY29yZSArIGxpdmVzICogNTA7XG59XG5cbmZ1bmN0aW9uIGdldFJpZ2h0QW5zd2Vyc0NvdW50KGFuc3dlcnMpIHtcbiAgcmV0dXJuIGFuc3dlcnMuZmlsdGVyKChhbnN3ZXIpID0+IGFuc3dlci5pc09LKS5sZW5ndGg7XG59XG5cbmZ1bmN0aW9uIGdldFNwZWVkQm9udXNDb3VudChhbnN3ZXJzKSB7XG4gIHJldHVybiBhbnN3ZXJzLmZpbHRlcigoYW5zd2VyKSA9PiBhbnN3ZXIudGltZSA8IDEwKS5sZW5ndGg7XG59XG5cbmZ1bmN0aW9uIGdldFNsb3dQZW5hbHR5Q291bnQoYW5zd2Vycykge1xuICByZXR1cm4gYW5zd2Vycy5maWx0ZXIoKGFuc3dlcikgPT4gYW5zd2VyLnRpbWUgPiAyMCkubGVuZ3RoO1xufVxuXG5leHBvcnQge2dldFRvdGFsU2NvcmUsIGdldFJpZ2h0QW5zd2Vyc0NvdW50LCBnZXRTcGVlZEJvbnVzQ291bnQsIGdldFNsb3dQZW5hbHR5Q291bnR9O1xuIiwiaW1wb3J0IGNvbmZpZyBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuaW1wb3J0IFN0YXRzQmxvY2tWaWV3IGZyb20gJy4uL3V0aWwtdmlld3Mvc3RhdHMtYmxvY2stdmlldy5qcyc7XG5pbXBvcnQge2dldFRvdGFsU2NvcmUsIGdldFJpZ2h0QW5zd2Vyc0NvdW50LCBnZXRTcGVlZEJvbnVzQ291bnQsIGdldFNsb3dQZW5hbHR5Q291bnR9IGZyb20gJy4uL3Njb3JlLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhdHNTaW5nbGVWaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcihhbnN3ZXJzLCBsaXZlcykge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5hbnN3ZXJzID0gYW5zd2VycztcbiAgICB0aGlzLmxpdmVzID0gbGl2ZXM7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgY29uc3QgaXNBbGwgPSB0aGlzLmFuc3dlcnMubGVuZ3RoID09PSBjb25maWcuR0FNRVNfQ09VTlQ7XG4gICAgY29uc3Qgc2NvcmUgPSBnZXRUb3RhbFNjb3JlKHRoaXMuYW5zd2VycywgdGhpcy5saXZlcyk7XG4gICAgY29uc3QgcmlnaHRBbnN3ZXJzQ291bnQgPSBnZXRSaWdodEFuc3dlcnNDb3VudCh0aGlzLmFuc3dlcnMpO1xuICAgIGNvbnN0IHNwZWVkQm9udXNDb3VudCA9IGdldFNwZWVkQm9udXNDb3VudCh0aGlzLmFuc3dlcnMpO1xuICAgIGNvbnN0IHNsb3dQZW5hbHR5Q291bnQgPSBnZXRTbG93UGVuYWx0eUNvdW50KHRoaXMuYW5zd2Vycyk7XG4gICAgY29uc3Qgc3RhdHNCbG9jayA9IG5ldyBTdGF0c0Jsb2NrVmlldyh0aGlzLmFuc3dlcnMpO1xuICAgIHJldHVybiBgPHNlY3Rpb24gY2xhc3M9XCJyZXN1bHRcIj5cbiAgICAgIDxoMiBjbGFzcz1cInJlc3VsdF9fdGl0bGUgcmVzdWx0X190aXRsZS0tc2luZ2xlXCI+JHsoaXNBbGwpID8gc2NvcmUgKyBgINC+0YfQutC+0LIuINCd0LXQv9C70L7RhdC+IWAgOiBg0J/QvtGA0LDQttC10L3QuNC1IWAgfTwvaDI+XG4gICAgICA8dGFibGUgY2xhc3M9XCJyZXN1bHRfX3RhYmxlIHJlc3VsdF9fdGFibGUtLXNpbmdsZVwiPlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRkIGNvbHNwYW49XCIyXCI+XG4gICAgICAgICAgICAke3N0YXRzQmxvY2sudGVtcGxhdGV9XG4gICAgICAgICAgPC90ZD5cbiAgICAgICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX3BvaW50c1wiPsOXIDEwMDwvdGQ+XG4gICAgICAgICAgPHRkIGNsYXNzPVwicmVzdWx0X190b3RhbFwiPiR7KGlzQWxsKSA/IHJpZ2h0QW5zd2Vyc0NvdW50ICogMTAwIDogYEZhaWxgIH08L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgICAkeyhzcGVlZEJvbnVzQ291bnQpID8gU3RhdHNTaW5nbGVWaWV3LmdldFNwZWVkQm9udXNDb250ZW50KHNwZWVkQm9udXNDb3VudCkgOiBgYH1cbiAgICAgICAgJHsodGhpcy5saXZlcykgPyBTdGF0c1NpbmdsZVZpZXcuZ2V0TGl2ZXNCb251c0NvbnRlbnQodGhpcy5saXZlcykgOiBgYH1cbiAgICAgICAgJHsoc2xvd1BlbmFsdHlDb3VudCkgPyBTdGF0c1NpbmdsZVZpZXcuZ2V0U2xvd1BlbmFsdHlDb250ZW50KHNsb3dQZW5hbHR5Q291bnQpIDogYGB9XG4gICAgICA8L3RhYmxlPlxuICAgIDwvc2VjdGlvbj5gO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjbWFpbmApO1xuICAgIGNvbnN0IG9sZEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBzZWN0aW9uLnJlc3VsdGApO1xuICAgIHBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQob2xkRWxlbWVudCk7XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgc3RhdGljIGdldFNwZWVkQm9udXNDb250ZW50KHNwZWVkQm9udXNDb3VudCkge1xuICAgIHJldHVybiBgPHRyPlxuICAgICAgPHRkPjwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX2V4dHJhXCI+0JHQvtC90YPRgSDQt9CwINGB0LrQvtGA0L7RgdGC0Yw6PC90ZD5cbiAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fZXh0cmFcIj4ke3NwZWVkQm9udXNDb3VudH0gPHNwYW4gY2xhc3M9XCJzdGF0c19fcmVzdWx0IHN0YXRzX19yZXN1bHQtLWZhc3RcIj48L3NwYW4+PC90ZD5cbiAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fcG9pbnRzXCI+w5cgNTA8L3RkPlxuICAgICAgPHRkIGNsYXNzPVwicmVzdWx0X190b3RhbFwiPiR7c3BlZWRCb251c0NvdW50ICogNTB9PC90ZD5cbiAgICA8L3RyPmA7XG4gIH1cblxuICBzdGF0aWMgZ2V0TGl2ZXNCb251c0NvbnRlbnQobGl2ZXMpIHtcbiAgICByZXR1cm4gYDx0cj5cbiAgICAgIDx0ZD48L3RkPlxuICAgICAgPHRkIGNsYXNzPVwicmVzdWx0X19leHRyYVwiPtCR0L7QvdGD0YEg0LfQsCDQttC40LfQvdC4OjwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX2V4dHJhXCI+JHtsaXZlc30gPHNwYW4gY2xhc3M9XCJzdGF0c19fcmVzdWx0IHN0YXRzX19yZXN1bHQtLWFsaXZlXCI+PC9zcGFuPjwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX3BvaW50c1wiPsOXIDUwPC90ZD5cbiAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fdG90YWxcIj4ke2xpdmVzICogNTB9PC90ZD5cbiAgICA8L3RyPmA7XG4gIH1cblxuICBzdGF0aWMgZ2V0U2xvd1BlbmFsdHlDb250ZW50KHNsb3dQZW5hbHR5Q291bnQpIHtcbiAgICByZXR1cm4gYDx0cj5cbiAgICAgIDx0ZD48L3RkPlxuICAgICAgPHRkIGNsYXNzPVwicmVzdWx0X19leHRyYVwiPtCo0YLRgNCw0YQg0LfQsCDQvNC10LTQu9C40YLQtdC70YzQvdC+0YHRgtGMOjwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX2V4dHJhXCI+JHtzbG93UGVuYWx0eUNvdW50fSA8c3BhbiBjbGFzcz1cInN0YXRzX19yZXN1bHQgc3RhdHNfX3Jlc3VsdC0tc2xvd1wiPjwvc3Bhbj48L3RkPlxuICAgICAgPHRkIGNsYXNzPVwicmVzdWx0X19wb2ludHNcIj7DlyA1MDwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX3RvdGFsXCI+LSR7c2xvd1BlbmFsdHlDb3VudCAqIDUwfTwvdGQ+XG4gICAgPC90cj5gO1xuICB9XG5cbn1cbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFja0Fycm93VmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gYDxidXR0b24gY2xhc3M9XCJiYWNrXCI+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidmlzdWFsbHktaGlkZGVuXCI+0JLQtdGA0L3Rg9GC0YzRgdGPINC6INC90LDRh9Cw0LvRgzwvc3Bhbj5cbiAgICAgICAgICAgICAgPHN2ZyBjbGFzcz1cImljb25cIiB3aWR0aD1cIjQ1XCIgaGVpZ2h0PVwiNDVcIiB2aWV3Qm94PVwiMCAwIDQ1IDQ1XCIgZmlsbD1cIiMwMDAwMDBcIj5cbiAgICAgICAgICAgICAgICA8dXNlIHhsaW5rOmhyZWY9XCJpbWcvc3ByaXRlLnN2ZyNhcnJvdy1sZWZ0XCI+PC91c2U+XG4gICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgICA8c3ZnIGNsYXNzPVwiaWNvblwiIHdpZHRoPVwiMTAxXCIgaGVpZ2h0PVwiNDRcIiB2aWV3Qm94PVwiMCAwIDEwMSA0NFwiIGZpbGw9XCIjMDAwMDAwXCI+XG4gICAgICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPVwiaW1nL3Nwcml0ZS5zdmcjbG9nby1zbWFsbFwiPjwvdXNlPlxuICAgICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgIDwvYnV0dG9uPmA7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYGhlYWRlci5oZWFkZXJgKTtcbiAgICBwYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZSh0aGlzLmVsZW1lbnQsIHBhcmVudEVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gIH1cblxuICBiaW5kKGNiKSB7XG4gICAgY29uc3QgYmFja0Fycm93ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmJhY2tgKTtcbiAgICBiYWNrQXJyb3cuYWRkRXZlbnRMaXN0ZW5lcihgY2xpY2tgLCBjYik7XG4gIH1cbn1cbiIsImltcG9ydCB7cG9zdERhdGF9IGZyb20gJy4uL2JhY2tlbmQuanMnO1xuaW1wb3J0IEFic3RyYWN0U2NyZWVuIGZyb20gJy4uL2Fic3RyYWN0LXNjcmVlbi5qcyc7XG5cbmltcG9ydCBTdGF0c1NjcmVlblZpZXcgZnJvbSAnLi9zdGF0cy1zY3JlZW4tdmlldy5qcyc7XG5pbXBvcnQgU3RhdHNTaW5nbGVWaWV3IGZyb20gJy4vc3RhdHMtc2luZ2xlLXZpZXcuanMnO1xuaW1wb3J0IEJhY2tBcnJvd1ZpZXcgZnJvbSAnLi4vdXRpbC12aWV3cy9iYWNrLWFycm93LXZpZXcuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGF0c1NjcmVlbiBleHRlbmRzIEFic3RyYWN0U2NyZWVuIHtcblxuICBjb25zdHJ1Y3RvcihnYW1lTW9kZWwpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZ2FtZU1vZGVsID0gZ2FtZU1vZGVsO1xuICAgIHRoaXMudmlldyA9IG5ldyBTdGF0c1NjcmVlblZpZXcoKTtcbiAgfVxuXG4gIF9vblNjcmVlblNob3coKSB7XG4gICAgY29uc3Qgc3RhdHNTaW5nbGVCbG9jayA9IG5ldyBTdGF0c1NpbmdsZVZpZXcodGhpcy5nYW1lTW9kZWwuYW5zd2VycywgdGhpcy5nYW1lTW9kZWwubGl2ZXMpO1xuICAgIGNvbnN0IGJhY2tBcnJvdyA9IG5ldyBCYWNrQXJyb3dWaWV3KCk7XG4gICAgY29uc3QgcmVzdGFydEdhbWUgPSB0aGlzLl9yZXN0YXJ0R2FtZS5iaW5kKHRoaXMpO1xuXG4gICAgc3RhdHNTaW5nbGVCbG9jay5yZW5kZXIoKTtcbiAgICBiYWNrQXJyb3cucmVuZGVyKCk7XG5cbiAgICBiYWNrQXJyb3cuYmluZChyZXN0YXJ0R2FtZSk7XG5cbiAgICBwb3N0RGF0YSh7YW5zd2VyczogdGhpcy5nYW1lTW9kZWwuYW5zd2VycywgbGl2ZXM6IHRoaXMuZ2FtZU1vZGVsLmxpdmVzfSlcbiAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFcnJvciBkdXJpbmcgUE9TVCBnYW1lcyBkYXRhLi4uYCk7XG4gICAgfSk7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7RUFBQSxNQUFNLE1BQU0sR0FBRztFQUNmLEVBQUUsWUFBWSxFQUFFLENBQUMsdUZBQXVGLENBQUM7RUFDekcsRUFBRSxhQUFhLEVBQUUsQ0FB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
