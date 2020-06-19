var gameScreen = (function () {
  'use strict';

  const config = {
    GAMES_COUNT: 10,
    LIVES_COUNT: 3,
    TIME_TO_ANSWER: 30000, // 30 sec
    GAME_TYPE: {
      one: 1,
      two: 2,
      three: 3
    }
  };

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
      });
    }
  }

  class GameScreenView extends AbstractView {

    constructor(game) {
      super();
      this.game = game;
    }

    get template() {
      return `<div id="main" class="central__content">
              <header class="header">
                <!-- PLACE TO BACK ARROW -->
                <div class="game__timer"></div>
                <div class="game__lives"></div>
              </header>
              <section class="game">
                <p class="game__task">${this.game.task}</p>
                ${GameScreenView.getGameContent(this.game.gameType)}
                <ul class="stats"></ul>
              </section>
            </div>`;
    }

    static getGameContent(gameType) {
      let content = ``;
      if (gameType === 1) {
        content = `<form class="game__content  game__content--wide">
                  <div class="game__option">
                    <!-- PLACE FOR IMAGE -->
                    <!-- PLACE FOR ANSWER PHOTO BUTTON -->
                    <!-- PLACE FOR ANSWER PAINT BUTTON -->
                 </div>
               </form>`;
      } else if (gameType === 2) {
        content = `<form class="game__content">
                   <div class="game__option">
                     <!-- PLACE FOR IMAGE -->
                     <!-- PLACE FOR ANSWER PHOTO BUTTON -->
                     <!-- PLACE FOR ANSWER PAINT BUTTON -->
                   </div>
                   <div class="game__option">
                     <!-- PLACE FOR IMAGE -->
                     <!-- PLACE FOR ANSWER PHOTO BUTTON -->
                     <!-- PLACE FOR ANSWER PAINT BUTTON -->
                   </div>
                 </form>`;
      } else if (gameType === 3) {
        content = `<form class="game__content  game__content--triple">
                   <!-- PLACE FOR ANSWER PAINT OPTION -->
                   <!-- PLACE FOR ANSWER PAINT OPTION -->
                   <!-- PLACE FOR ANSWER PAINT OPTION -->
                 </form>`;
      }
      return content;
    }

  }

  class TimerBlockView extends AbstractView {

    constructor() {
      super();
      this._isActive = true;
      this._time = config.TIME_TO_ANSWER;
    }

    get template() {
      const time = TimerBlockView.getTimeFormatted(this.time);
      return `<div class="game__timer">${time}</div>`;
    }

    get time() {
      return this._time;
    }

    set time(newTime) {
      this._time = newTime;
    }

    get isActive() {
      return this._isActive;
    }

    render() {
      const parentElement = document.querySelector(`header.header`);
      parentElement.insertBefore(this.element, parentElement.firstChild);
    }

    update() {
      if (this._isActive && this.time > 0) {
        this.time = this.time - 1000;
        const time = TimerBlockView.getTimeFormatted(this.time);
        const timerElement = document.querySelector(`div.game__timer`);
        timerElement.textContent = time;
        if (this.time === 5000 || this.time === 3000 || this.time === 1000) {
          timerElement.style = `color: #d74040;`;
        } else {
          timerElement.style = `color: black;`;
        }
      }
    }

    stop() {
      this._isActive = false;
    }

    static getTimeFormatted(time) {
      const REGEX = /^\d$/;
      let min = `` + Math.floor(time / 1000 / 60);
      let sec = `` + Math.floor((time - (min * 1000 * 60)) / 1000);
      if (REGEX.test(sec)) {
        sec = `0${sec}`;
      }
      if (REGEX.test(min)) {
        min = `0${min}`;
      }
      return `${min}:${sec}`;
    }
  }

  class LivesBlockView extends AbstractView {

    constructor(lives) {
      super();
      this.lives = lives;
    }

    get template() {
      let result = ``;
      for (let i = 0; i < config.LIVES_COUNT; i++) {
        result += `<img src="img/heart__${(this.lives > 0) ? `full` : `empty`}.svg" class="game__heart" alt="Life" width="31" height="27">`;
        this.lives--;
      }
      return `<div class="game__lives">${result}</div>`;
    }

    render() {
      const parentElement = document.querySelector(`header.header`);
      const oldElement = document.querySelector(`div.game__lives`);
      parentElement.removeChild(oldElement);
      parentElement.appendChild(this.element);
    }
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

  const STYLE = `style="box-shadow: 0px 0px 10px 12px rgba(19,173,24,1);"`;

  function isPhoto(answer) {
    return ( answer === `photo`) ? STYLE : ``;
  }

  function isPaint(answer) {
    return ( answer === `paint`) ? STYLE : ``;
  }

  function isCorrect(isCorrect) {
    return ( isCorrect) ? STYLE : ``;
  }

  var debug = {isPhoto, isPaint, isCorrect};

  class AnswerPhotoButtonView extends AbstractView {

    constructor(questionIndex, game) {
      super();
      this.questionIndex = questionIndex;
      this.correctAnswer = game.questions[this.questionIndex].correctAnswer;
      this.gameIndex = game.gameIndex;
    }

    get template() {
      return `<label class="game__answer game__answer--photo">
              <input class="visually-hidden" name="question ${this.questionIndex}" type="radio" value="photo" data-gameindex="${this.gameIndex}" data-questionindex="${this.questionIndex}">
              <span ${debug.isPhoto(this.correctAnswer)}>Фото</span>
            </label>`;
    }

    render() {
      const parentElement = document.querySelectorAll('div.game__option')[this.questionIndex];
      parentElement.appendChild(this.element);
    }

    bind(cb) {
      const parentElement = document.querySelectorAll('div.game__option')[this.questionIndex];
      const answerElement = parentElement.querySelector(`.game__answer--photo > input`);
      answerElement.checked = false;
      answerElement.addEventListener(`click`, cb);
    }
  }

  class AnswerPaintButtonView extends AbstractView {

    constructor(questionIndex, game) {
      super();
      this.questionIndex = questionIndex;
      this.correctAnswer = game.questions[this.questionIndex].correctAnswer;
      this.gameIndex = game.gameIndex;
    }

    get template() {
      return `<label class="game__answer game__answer--paint">
              <input class="visually-hidden" name="question ${this.questionIndex}" type="radio" value="paint" data-gameindex="${this.gameIndex}" data-questionindex="${this.questionIndex}">
              <span ${debug.isPaint(this.correctAnswer)}>Рисунок</span>
            </label>`;
    }

    render() {
      const parentElement = document.querySelectorAll('div.game__option')[this.questionIndex];
      parentElement.appendChild(this.element);
    }

    bind(cb) {
      const parentElement = document.querySelectorAll('div.game__option')[this.questionIndex];
      const answerElement = parentElement.querySelector(`.game__answer--paint > input`);
      answerElement.checked = false;
      answerElement.addEventListener(`click`, cb);
    }
  }

  class AnswerPaintOptionView extends AbstractView {

    constructor(answerIndex, game) {
      super();
      this.answerIndex = answerIndex;
      this.game = game;
      this.correctAnswer = game.questions[0].correctAnswer;
    }

    get template() {
      return `<div class="game__option" data-answer="${this.answerIndex}" data-gameindex="${this.game.gameIndex}" ${debug.isCorrect(this.correctAnswer === this.answerIndex)}>
              <!-- PLACE FOR IMAGE -->
            </div>`;
    }

    render() {
      const parentElement = document.querySelector('form.game__content--triple');
      parentElement.appendChild(this.element);
    }

    bind(cb) {
      const answerElement = document.querySelectorAll(`.game__option`)[this.answerIndex];
      answerElement.addEventListener(`click`, cb);
    }
  }

  // Managing size
  // @param  {object} frame описывает размеры рамки, в которые должно быть вписано изображение
  // @param  {object} given описывает размеры изображения, которые нужно подогнать под рамку
  // @return {object} новый объект, который будет содержать изменённые размеры изображения
  function resize(frame, given) {
    let width = given.width;
    let height = given.height;
    if (width > frame.width) {
      const multiplier = width / frame.width;
      width = frame.width;
      height = Math.floor(height / multiplier);
    }
    if (height > frame.height) {
      const multiplier = height / frame.height;
      height = frame.height;
      width = Math.floor(width / multiplier);
    }
    return {width, height};
  }

  class ImageView extends AbstractView {

    constructor(questionNumber, game) {
      super();
      this.questionNumber = questionNumber;
      this.game = game;
      if (game.gameType === 3) {
        this.img = game.questions[0].img[this.questionNumber];
      } else {
        this.img = game.questions[this.questionNumber].img[0];
      }
    }

    get template() {
      const imgSize = resize(this.game.frameSize, this.img.size);
      return `<img src="${this.img.src}" alt="Option ${this.questionNumber + 1}" width="${imgSize.width}" height="${imgSize.height}">`;
    }

    render() {
      const parentElement = document.querySelectorAll('div.game__option')[this.questionNumber];
      parentElement.appendChild(this.element);
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

  class GameScreen extends AbstractScreen {

    constructor(gameModel, game) {
      super();
      this.gameModel = gameModel;
      this.game = game;
      this.view = new GameScreenView(game);
    }

    _onScreenShow() {
      const game = this.game;
      const gameType = game.gameType;
      const livesBlock = new LivesBlockView(this.gameModel.lives);
      const statsBlock = new StatsBlockView(this.gameModel.answers);

      livesBlock.render();
      statsBlock.render();

      this.timer = new TimerBlockView();
      this.timer.render();
      this._timerOn();

      const onEveryAnswer = this._onEveryAnswer.bind(this);

      if (gameType === config.GAME_TYPE.one) {
        const answer1PhotoButton = new AnswerPhotoButtonView(0, game);
        const answer1PaintButton = new AnswerPaintButtonView(0, game);
        const image = new ImageView(0, game);
        answer1PhotoButton.render();
        answer1PaintButton.render();
        image.render();
        answer1PhotoButton.bind(onEveryAnswer);
        answer1PaintButton.bind(onEveryAnswer);
      } else if (gameType === config.GAME_TYPE.two) {
        const answer1PhotoButton = new AnswerPhotoButtonView(0, game);
        const answer1PaintButton = new AnswerPaintButtonView(0, game);
        const image1 = new ImageView(0, game);
        const answer2PhotoButton = new AnswerPhotoButtonView(1, game);
        const answer2PaintButton = new AnswerPaintButtonView(1, game);
        const image2 = new ImageView(1, game);
        answer1PhotoButton.render();
        answer1PaintButton.render();
        image1.render();
        answer1PhotoButton.bind(onEveryAnswer);
        answer1PaintButton.bind(onEveryAnswer);
        answer2PhotoButton.render();
        answer2PaintButton.render();
        image2.render();
        answer2PhotoButton.bind(onEveryAnswer);
        answer2PaintButton.bind(onEveryAnswer);
      } else if (gameType === config.GAME_TYPE.three) {
        const answer1PaintOptionView = new AnswerPaintOptionView(0, game);
        const image1 = new ImageView(0, game);
        const answer2PaintOptionView = new AnswerPaintOptionView(1, game);
        const image2 = new ImageView(1, game);
        const answer3PaintOptionView = new AnswerPaintOptionView(2, game);
        const image3 = new ImageView(2, game);
        answer1PaintOptionView.render();
        image1.render();
        answer2PaintOptionView.render();
        image2.render();
        answer3PaintOptionView.render();
        image3.render();
        answer1PaintOptionView.bind(onEveryAnswer);
        answer2PaintOptionView.bind(onEveryAnswer);
        answer3PaintOptionView.bind(onEveryAnswer);
      }

      const restartGame = this._restartGame.bind(this);

      const backArrow = new BackArrowView();
      backArrow.render();
      backArrow.bind(restartGame);
    }

    _timerOn() {
      if (this.timer.isActive && this.timer.time > 0) {
        setTimeout(() => {
          this.timer.update();
          this._timerOn();
        }, 1000);
      }
      if (this.timer.time === 0) {
        this._onValidAnswer(false);
      }
    }

    _onEveryAnswer(evt) {
      const game = this.game;
      if (game.gameType === config.GAME_TYPE.three) {
        const input = evt.currentTarget;
        const gameIndex = GameScreen.getGameIndex(input);
        const questionIndex = 0;
        const correctAnswer = this._getCorrectAnswer(gameIndex, questionIndex);
        const isOK = +input.dataset.answer === correctAnswer;
        this._onValidAnswer(isOK);
      } else {
        const isAll = this._isAllAnswersGiven();
        if (isAll) {
          const isOK = this._isAllAnswersGivenCorrect();
          this._onValidAnswer(isOK);
        }
      }
    }

    _isAllAnswersGiven() {
      const options = Array.from(document.querySelectorAll(`.game__option`));
      return options.every((option) => {
        const answers = Array.from(option.querySelectorAll(`.game__answer`));
        return answers.some((answer) => {
          const input = answer.querySelector(`input`);
          return input.checked;
        });
      });
    }

    _isAllAnswersGivenCorrect() {
      const options = Array.from(document.querySelectorAll(`.game__option`));
      return options.every((option) => {
        const answers = Array.from(option.querySelectorAll(`.game__answer`));
        return answers.some((answer) => {
          const input = answer.querySelector(`input`);
          const gameIndex = GameScreen.getGameIndex(input);
          const questionIndex = GameScreen.getQuestionIndex(input);
          const correctAnswer = this._getCorrectAnswer(gameIndex, questionIndex);
          return input.checked && input.value === correctAnswer;
        });
      });
    }

    _onValidAnswer(isOK) {
      this._saveAnswer(isOK);
      if (!isOK) {
        this.gameModel.minusLive();
      }
      if (this.gameModel.isGameOver) {
        this.endScreen.show();
      } else {
        this.nextScreen.show();
      }
    }

    _getCorrectAnswer(gameIndex, questionIndex) {
      return this.gameModel.games[gameIndex].questions[questionIndex].correctAnswer;
    }

    _saveAnswer(isOK) {
      const time = (config.TIME_TO_ANSWER - this.timer.time) / 1000;
      this.timer.stop();
      this.gameModel.addAnswer({isOK, time});
    }

    static getGameIndex(input) {
      return input.dataset.gameindex;
    }

    static getQuestionIndex(input) {
      return input.dataset.questionindex;
    }

  }

  return GameScreen;

}());

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZS1zY3JlZW4vZ2FtZS1zY3JlZW4uanMiLCJzb3VyY2VzIjpbImpzL2NvbmZpZy5qcyIsImpzL2Fic3RyYWN0LXZpZXcuanMiLCJqcy91dGlsLXZpZXdzL2NvbmZpcm0tbW9kYWwtdmlldy5qcyIsImpzL2Fic3RyYWN0LXNjcmVlbi5qcyIsImpzL2dhbWUtc2NyZWVuL2dhbWUtc2NyZWVuLXZpZXcuanMiLCJqcy9nYW1lLXNjcmVlbi90aW1lci1ibG9jay12aWV3LmpzIiwianMvZ2FtZS1zY3JlZW4vbGl2ZXMtYmxvY2stdmlldy5qcyIsImpzL3V0aWwtdmlld3Mvc3RhdHMtYmxvY2stdmlldy5qcyIsImpzL2RlYnVnLmpzIiwianMvZ2FtZS1zY3JlZW4vYW5zd2VyLXBob3RvLWJ1dHRvbi12aWV3LmpzIiwianMvZ2FtZS1zY3JlZW4vYW5zd2VyLXBhaW50LWJ1dHRvbi12aWV3LmpzIiwianMvZ2FtZS1zY3JlZW4vYW5zd2VyLXBhaW50LW9wdGlvbi12aWV3LmpzIiwianMvcmVzaXplLmpzIiwianMvZ2FtZS1zY3JlZW4vaW1hZ2Utdmlldy5qcyIsImpzL3V0aWwtdmlld3MvYmFjay1hcnJvdy12aWV3LmpzIiwianMvZ2FtZS1zY3JlZW4vZ2FtZS1zY3JlZW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgY29uZmlnID0ge1xuICBHQU1FU19DT1VOVDogMTAsXG4gIExJVkVTX0NPVU5UOiAzLFxuICBUSU1FX1RPX0FOU1dFUjogMzAwMDAsIC8vIDMwIHNlY1xuICBHQU1FX1RZUEU6IHtcbiAgICBvbmU6IDEsXG4gICAgdHdvOiAyLFxuICAgIHRocmVlOiAzXG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNvbmZpZztcbiIsImNvbnN0IGVsZW1lbnRzID0ge307XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIC8vINCy0L7Qt9Cy0YDQsNGJ0LDQtdGCINGB0YLRgNC+0LrRgywg0YHQvtC00LXRgNC20LDRidGD0Y4g0YDQsNC30LzQtdGC0LrRg1xuICBnZXQgdGVtcGxhdGUoKSB7fVxuXG4gIC8vINGB0L7Qt9C00LDQtdGCINC4INCy0L7Qt9Cy0YDQsNGJ0LDQtdGCIERPTS3RjdC70LXQvNC10L3RgiDQvdCwINC+0YHQvdC+0LLQtSDRiNCw0LHQu9C+0L3QsFxuICAvLyDQtNC+0LvQttC10L0g0YHQvtC30LTQsNCy0LDRgtGMIERPTS3RjdC70LXQvNC10L3RgiDRgSDQv9C+0LzQvtGJ0YzRjiDQvNC10YLQvtC00LAgcmVuZGVyLCDQtNC+0LHQsNCy0LvRj9GC0Ywg0LXQvNGDINC+0LHRgNCw0LHQvtGC0YfQuNC60LgsINGBINC/0L7QvNC+0YnRjNGOINC80LXRgtC+0LTQsCBiaW5kINC4INCy0L7Qt9Cy0YDQsNGJ0LDRgtGMINGB0L7Qt9C00LDQvdC90YvQuSDRjdC70LXQvNC10L3RglxuICAvLyDQnNC10YLQvtC0INC00L7Qu9C20LXQvSDQuNGB0L/QvtC70YzQt9C+0LLQsNGC0Ywg0LvQtdC90LjQstGL0LUg0LLRi9GH0LjRgdC70LXQvdC40Y8g4oCUINGN0LvQtdC80LXQvdGCINC00L7Qu9C20LXQvSDRgdC+0LfQtNCw0LLQsNGC0YzRgdGPINC/0YDQuCDQv9C10YDQstC+0Lwg0L7QsdGA0LDRidC10L3QuNC4INC6INCz0LXRgtGC0LXRgCDRgSDQv9C+0LzQvtGJ0YzRjiDQvNC10YLQvtC00LAgcmVuZGVyLCDQtNC+0LvQttC90Ysg0LTQvtCx0LDQstC70Y/RgtGM0YHRjyDQvtCx0YDQsNCx0L7RgtGH0LjQutC4ICjQvNC10YLQvtC0IGJpbmQpLlxuICAvLyDQn9GA0Lgg0L/QvtGB0LvQtdC00YPRjtGJ0LjRhSDQvtCx0YDQsNGJ0LXQvdC40Y/RhSDQtNC+0LvQttC10L0g0LjRgdC/0L7Qu9GM0LfQvtCy0LDRgtGM0YHRjyDRjdC70LXQvNC10L3Rgiwg0YHQvtC30LTQsNC90L3Ri9C5INC/0YDQuCDQv9C10YDQstC+0Lwg0LLRi9C30L7QstC1INCz0LXRgtGC0LXRgNCwLlxuICBnZXQgZWxlbWVudCgpIHtcbiAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMudGVtcGxhdGU7XG4gICAgLy8gaWYgKCFlbGVtZW50cy5oYXNPd25Qcm9wZXJ0eSh0ZW1wbGF0ZSkpIHtcbiAgICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoYGRpdmApO1xuICAgICAgZGl2LmlubmVySFRNTCA9IHRlbXBsYXRlO1xuICAgICAgY29uc3QgZWxlbSA9IGRpdi5maXJzdENoaWxkO1xuICAgICAgZWxlbWVudHNbdGVtcGxhdGVdID0gZWxlbTtcbiAgICAgIHJldHVybiBlbGVtO1xuICAgIC8vIH0gZWxzZSB7XG4gICAgICAvLyByZXR1cm4gZWxlbWVudHNbdGVtcGxhdGVdO1xuICAgIC8vIH1cbiAgfVxuXG4gIC8vINC+0YLRgNC40YHQvtCy0YvQstCw0LXRgiBET00t0Y3Qu9C10LzQtdC90YIsINC00L7QsdCw0LLQu9GP0LXRgiDQvdC10L7QsdGF0L7QtNC40LzRi9C1INC+0LHRgNCw0LHQvtGC0YfQuNC60LhcbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBtYWluLmNlbnRyYWxgKTtcbiAgICBjb25zdCBvbGRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI21haW5gKTtcbiAgICBwYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKG9sZEVsZW1lbnQpO1xuICAgIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIC8vINC00L7QsdCw0LLQu9GP0LXRgiDQvtCx0YDQsNCx0L7RgtGH0LjQutC4INGB0L7QsdGL0YLQuNC5XG4gIC8vINCc0LXRgtC+0LQg0L/QviDRg9C80L7Qu9GH0LDQvdC40Y4g0L3QuNGH0LXQs9C+INC90LUg0LTQtdC70LDQtdGCXG4gIC8vINCV0YHQu9C4INC90YPQttC90L4g0L7QsdGA0LDQsdC+0YLQsNGC0Ywg0LrQsNC60L7QtS3RgtC+INGB0L7QsdGL0YLQuNC1LCDRgtC+INGN0YLQvtGCINC80LXRgtC+0LQg0LTQvtC70LbQtdC9INCx0YvRgtGMINC/0LXRgNC10L7Qv9GA0LXQtNC10LvRkdC9INCyINC90LDRgdC70LXQtNC90LjQutC1INGBINC90LXQvtCx0YXQvtC00LjQvNC+0Lkg0LvQvtCz0LjQutC+0LlcbiAgYmluZCgpIHt9XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbmZpcm1Nb2RhbFZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuIGA8c2VjdGlvbiBjbGFzcz1cIm1vZGFsXCI+XG4gICAgICAgICAgICAgIDxmb3JtIGNsYXNzPVwibW9kYWxfX2lubmVyXCI+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cIm1vZGFsX19jbG9zZVwiIHR5cGU9XCJidXR0b25cIj5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidmlzdWFsbHktaGlkZGVuXCI+0JfQsNC60YDRi9GC0Yw8L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPGgyIGNsYXNzPVwibW9kYWxfX3RpdGxlXCI+0J/QvtC00YLQstC10YDQttC00LXQvdC40LU8L2gyPlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwibW9kYWxfX3RleHRcIj7QktGLINGD0LLQtdGA0LXQvdGLINGH0YLQviDRhdC+0YLQuNGC0LUg0L3QsNGH0LDRgtGMINC40LPRgNGDINC30LDQvdC+0LLQvj88L3A+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsX19idXR0b24td3JhcHBlclwiPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cIm1vZGFsX19idG4gbW9kYWxfX2J0bi0tb2tcIj7QntC6PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwibW9kYWxfX2J0biBtb2RhbF9fYnRuLS1jYW5jZWxcIj7QntGC0LzQtdC90LA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgPC9zZWN0aW9uPmA7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCNtYWluYCk7XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgYmluZChjYikge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjbWFpbmApO1xuICAgIGNvbnN0IG1vZGFsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLm1vZGFsYCk7XG4gICAgY29uc3QgY2xvc2VCdG4gPSBtb2RhbC5xdWVyeVNlbGVjdG9yKGAubW9kYWxfX2Nsb3NlYCk7XG4gICAgY29uc3QgY2FuY2VsQnRuID0gbW9kYWwucXVlcnlTZWxlY3RvcihgLm1vZGFsX19idG4tLWNhbmNlbGApO1xuICAgIGNvbnN0IG9rQnRuID0gbW9kYWwucXVlcnlTZWxlY3RvcihgLm1vZGFsX19idG4tLW9rYCk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihga2V5ZG93bmAsIChldnQpID0+IHtcbiAgICAgIGlmIChldnQua2V5Q29kZSA9PT0gMjcpIHtcbiAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQobW9kYWwpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGNsb3NlQnRuLmFkZEV2ZW50TGlzdGVuZXIoYGNsaWNrYCwgKGV2dCkgPT4ge1xuICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBwYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKG1vZGFsKTtcbiAgICB9KTtcbiAgICBjYW5jZWxCdG4uYWRkRXZlbnRMaXN0ZW5lcihgY2xpY2tgLCAoZXZ0KSA9PiB7XG4gICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQobW9kYWwpO1xuICAgIH0pO1xuICAgIG9rQnRuLmFkZEV2ZW50TGlzdGVuZXIoYGNsaWNrYCwgKGV2dCkgPT4ge1xuICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBjYigpO1xuICAgIH0pO1xuICB9XG59XG4iLCJpbXBvcnQgQ29uZmlybU1vZGFsVmlldyBmcm9tICcuL3V0aWwtdmlld3MvY29uZmlybS1tb2RhbC12aWV3LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWJzdHJhY3RTY3JlZW4ge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZ2FtZU1vZGVsID0gbnVsbDtcbiAgICB0aGlzLmdhbWUgPSBudWxsO1xuICAgIHRoaXMudmlldyA9IG51bGw7XG4gICAgdGhpcy50aW1lciA9IG51bGw7XG4gICAgdGhpcy5zdGFydFNjcmVlbiA9IG51bGw7XG4gICAgdGhpcy5uZXh0U2NyZWVuID0gbnVsbDtcbiAgICB0aGlzLmVuZFNjcmVlbiA9IG51bGw7XG4gIH1cblxuICAvLyDQvNC10YLQvtC0INC/0L7QutCw0LfQsCDRjdC60YDQsNC90LAg0L7RgtGA0LjRgdC+0LLRi9Cy0LDQtdGCINGN0LrRgNCw0L0g0Lgg0LfQsNC/0YPRgdC60LDQtdGCINC80LXRgtC+0LQgX29uU2NyZWVuU2hvd1xuICBzaG93KCkge1xuICAgIHRoaXMudmlldy5yZW5kZXIoKTtcbiAgICB0aGlzLl9vblNjcmVlblNob3coKTtcbiAgfVxuXG4gIC8vINC80LXRgtC+0LQg0YDQtdCw0LvQuNC30YPQtdGCINCx0LjQt9C90LXRgSDQu9C+0LPQuNC60YMg0Y3QutGA0LDQvdCwXG4gIF9vblNjcmVlblNob3coKSB7fVxuXG4gIC8vINC80LXRgtC+0LQg0L/QtdGA0LXQt9Cw0L/Rg9GB0LrQsNC10YIg0LjQs9GA0YNcbiAgX3Jlc3RhcnRHYW1lKCkge1xuICAgIGNvbnN0IGNvbmZpcm1Nb2RhbCA9IG5ldyBDb25maXJtTW9kYWxWaWV3KCk7XG4gICAgY29uZmlybU1vZGFsLnJlbmRlcigpO1xuICAgIGNvbmZpcm1Nb2RhbC5iaW5kKCgpID0+IHtcbiAgICAgIHRoaXMuZ2FtZU1vZGVsLnJlc2V0KCk7XG4gICAgICB0aGlzLnN0YXJ0U2NyZWVuLnNob3coKTtcbiAgICB9KTtcbiAgfVxufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHYW1lU2NyZWVuVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoZ2FtZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5nYW1lID0gZ2FtZTtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gYDxkaXYgaWQ9XCJtYWluXCIgY2xhc3M9XCJjZW50cmFsX19jb250ZW50XCI+XG4gICAgICAgICAgICAgIDxoZWFkZXIgY2xhc3M9XCJoZWFkZXJcIj5cbiAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIFRPIEJBQ0sgQVJST1cgLS0+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdhbWVfX3RpbWVyXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdhbWVfX2xpdmVzXCI+PC9kaXY+XG4gICAgICAgICAgICAgIDwvaGVhZGVyPlxuICAgICAgICAgICAgICA8c2VjdGlvbiBjbGFzcz1cImdhbWVcIj5cbiAgICAgICAgICAgICAgICA8cCBjbGFzcz1cImdhbWVfX3Rhc2tcIj4ke3RoaXMuZ2FtZS50YXNrfTwvcD5cbiAgICAgICAgICAgICAgICAke0dhbWVTY3JlZW5WaWV3LmdldEdhbWVDb250ZW50KHRoaXMuZ2FtZS5nYW1lVHlwZSl9XG4gICAgICAgICAgICAgICAgPHVsIGNsYXNzPVwic3RhdHNcIj48L3VsPlxuICAgICAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgICAgICA8L2Rpdj5gO1xuICB9XG5cbiAgc3RhdGljIGdldEdhbWVDb250ZW50KGdhbWVUeXBlKSB7XG4gICAgbGV0IGNvbnRlbnQgPSBgYDtcbiAgICBpZiAoZ2FtZVR5cGUgPT09IDEpIHtcbiAgICAgIGNvbnRlbnQgPSBgPGZvcm0gY2xhc3M9XCJnYW1lX19jb250ZW50ICBnYW1lX19jb250ZW50LS13aWRlXCI+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ2FtZV9fb3B0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIElNQUdFIC0tPlxuICAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBBTlNXRVIgUEhPVE8gQlVUVE9OIC0tPlxuICAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBBTlNXRVIgUEFJTlQgQlVUVE9OIC0tPlxuICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgIDwvZm9ybT5gO1xuICAgIH0gZWxzZSBpZiAoZ2FtZVR5cGUgPT09IDIpIHtcbiAgICAgIGNvbnRlbnQgPSBgPGZvcm0gY2xhc3M9XCJnYW1lX19jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdhbWVfX29wdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgSU1BR0UgLS0+XG4gICAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBBTlNXRVIgUEhPVE8gQlVUVE9OIC0tPlxuICAgICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgQU5TV0VSIFBBSU5UIEJVVFRPTiAtLT5cbiAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ2FtZV9fb3B0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBJTUFHRSAtLT5cbiAgICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIEFOU1dFUiBQSE9UTyBCVVRUT04gLS0+XG4gICAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBBTlNXRVIgUEFJTlQgQlVUVE9OIC0tPlxuICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICA8L2Zvcm0+YDtcbiAgICB9IGVsc2UgaWYgKGdhbWVUeXBlID09PSAzKSB7XG4gICAgICBjb250ZW50ID0gYDxmb3JtIGNsYXNzPVwiZ2FtZV9fY29udGVudCAgZ2FtZV9fY29udGVudC0tdHJpcGxlXCI+XG4gICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgQU5TV0VSIFBBSU5UIE9QVElPTiAtLT5cbiAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBBTlNXRVIgUEFJTlQgT1BUSU9OIC0tPlxuICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIEFOU1dFUiBQQUlOVCBPUFRJT04gLS0+XG4gICAgICAgICAgICAgICAgIDwvZm9ybT5gO1xuICAgIH1cbiAgICByZXR1cm4gY29udGVudDtcbiAgfVxuXG59XG4iLCJpbXBvcnQgY29uZmlnIGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRpbWVyQmxvY2tWaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX2lzQWN0aXZlID0gdHJ1ZTtcbiAgICB0aGlzLl90aW1lID0gY29uZmlnLlRJTUVfVE9fQU5TV0VSO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIGNvbnN0IHRpbWUgPSBUaW1lckJsb2NrVmlldy5nZXRUaW1lRm9ybWF0dGVkKHRoaXMudGltZSk7XG4gICAgcmV0dXJuIGA8ZGl2IGNsYXNzPVwiZ2FtZV9fdGltZXJcIj4ke3RpbWV9PC9kaXY+YDtcbiAgfVxuXG4gIGdldCB0aW1lKCkge1xuICAgIHJldHVybiB0aGlzLl90aW1lO1xuICB9XG5cbiAgc2V0IHRpbWUobmV3VGltZSkge1xuICAgIHRoaXMuX3RpbWUgPSBuZXdUaW1lO1xuICB9XG5cbiAgZ2V0IGlzQWN0aXZlKCkge1xuICAgIHJldHVybiB0aGlzLl9pc0FjdGl2ZTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgaGVhZGVyLmhlYWRlcmApO1xuICAgIHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKHRoaXMuZWxlbWVudCwgcGFyZW50RWxlbWVudC5maXJzdENoaWxkKTtcbiAgfVxuXG4gIHVwZGF0ZSgpIHtcbiAgICBpZiAodGhpcy5faXNBY3RpdmUgJiYgdGhpcy50aW1lID4gMCkge1xuICAgICAgdGhpcy50aW1lID0gdGhpcy50aW1lIC0gMTAwMDtcbiAgICAgIGNvbnN0IHRpbWUgPSBUaW1lckJsb2NrVmlldy5nZXRUaW1lRm9ybWF0dGVkKHRoaXMudGltZSk7XG4gICAgICBjb25zdCB0aW1lckVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBkaXYuZ2FtZV9fdGltZXJgKTtcbiAgICAgIHRpbWVyRWxlbWVudC50ZXh0Q29udGVudCA9IHRpbWU7XG4gICAgICBpZiAodGhpcy50aW1lID09PSA1MDAwIHx8IHRoaXMudGltZSA9PT0gMzAwMCB8fCB0aGlzLnRpbWUgPT09IDEwMDApIHtcbiAgICAgICAgdGltZXJFbGVtZW50LnN0eWxlID0gYGNvbG9yOiAjZDc0MDQwO2A7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aW1lckVsZW1lbnQuc3R5bGUgPSBgY29sb3I6IGJsYWNrO2A7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc3RvcCgpIHtcbiAgICB0aGlzLl9pc0FjdGl2ZSA9IGZhbHNlO1xuICB9XG5cbiAgc3RhdGljIGdldFRpbWVGb3JtYXR0ZWQodGltZSkge1xuICAgIGNvbnN0IFJFR0VYID0gL15cXGQkLztcbiAgICBsZXQgbWluID0gYGAgKyBNYXRoLmZsb29yKHRpbWUgLyAxMDAwIC8gNjApO1xuICAgIGxldCBzZWMgPSBgYCArIE1hdGguZmxvb3IoKHRpbWUgLSAobWluICogMTAwMCAqIDYwKSkgLyAxMDAwKTtcbiAgICBpZiAoUkVHRVgudGVzdChzZWMpKSB7XG4gICAgICBzZWMgPSBgMCR7c2VjfWA7XG4gICAgfVxuICAgIGlmIChSRUdFWC50ZXN0KG1pbikpIHtcbiAgICAgIG1pbiA9IGAwJHttaW59YDtcbiAgICB9XG4gICAgcmV0dXJuIGAke21pbn06JHtzZWN9YDtcbiAgfVxufVxuIiwiaW1wb3J0IGNvbmZpZyBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMaXZlc0Jsb2NrVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IobGl2ZXMpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMubGl2ZXMgPSBsaXZlcztcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICBsZXQgcmVzdWx0ID0gYGA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb25maWcuTElWRVNfQ09VTlQ7IGkrKykge1xuICAgICAgcmVzdWx0ICs9IGA8aW1nIHNyYz1cImltZy9oZWFydF9fJHsodGhpcy5saXZlcyA+IDApID8gYGZ1bGxgIDogYGVtcHR5YH0uc3ZnXCIgY2xhc3M9XCJnYW1lX19oZWFydFwiIGFsdD1cIkxpZmVcIiB3aWR0aD1cIjMxXCIgaGVpZ2h0PVwiMjdcIj5gO1xuICAgICAgdGhpcy5saXZlcy0tO1xuICAgIH1cbiAgICByZXR1cm4gYDxkaXYgY2xhc3M9XCJnYW1lX19saXZlc1wiPiR7cmVzdWx0fTwvZGl2PmA7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYGhlYWRlci5oZWFkZXJgKTtcbiAgICBjb25zdCBvbGRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgZGl2LmdhbWVfX2xpdmVzYCk7XG4gICAgcGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChvbGRFbGVtZW50KTtcbiAgICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XG4gIH1cbn1cbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhdHNCbG9ja1ZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKGFuc3dlcnMpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuYW5zd2VycyA9IGFuc3dlcnM7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgbGV0IHJlc3VsdCA9IGBgO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTA7IGkrKykge1xuICAgICAgY29uc3QgYW5zd2VyID0gdGhpcy5hbnN3ZXJzW2ldO1xuICAgICAgbGV0IG1vZGlmaWVyID0gYGA7XG4gICAgICBpZiAoYW5zd2VyKSB7XG4gICAgICAgIGlmIChhbnN3ZXIuaXNPSykge1xuICAgICAgICAgIG1vZGlmaWVyID0gYGNvcnJlY3RgO1xuICAgICAgICAgIGlmIChhbnN3ZXIudGltZSA8IDEwKSB7XG4gICAgICAgICAgICBtb2RpZmllciA9IGBmYXN0YDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGFuc3dlci50aW1lID4gMjApIHtcbiAgICAgICAgICAgIG1vZGlmaWVyID0gYHNsb3dgO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtb2RpZmllciA9IGB3cm9uZ2A7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1vZGlmaWVyID0gYHVua25vd25gO1xuICAgICAgfVxuICAgICAgcmVzdWx0ICs9IGA8bGkgY2xhc3M9XCJzdGF0c19fcmVzdWx0IHN0YXRzX19yZXN1bHQtLSR7bW9kaWZpZXJ9XCI+PC9saT5gO1xuICAgIH1cbiAgICByZXR1cm4gYDx1bCBjbGFzcz1cInN0YXRzXCI+JHtyZXN1bHR9PC91bD5gO1xufVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihgc2VjdGlvbi5nYW1lYCk7XG4gICAgY29uc3Qgb2xkRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYHVsLnN0YXRzYCk7XG4gICAgcGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChvbGRFbGVtZW50KTtcbiAgICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XG4gIH1cbn1cbiIsImNvbnN0IERFQlVHX09OID0gdHJ1ZTtcbmNvbnN0IFNUWUxFID0gYHN0eWxlPVwiYm94LXNoYWRvdzogMHB4IDBweCAxMHB4IDEycHggcmdiYSgxOSwxNzMsMjQsMSk7XCJgO1xuXG5mdW5jdGlvbiBpc1Bob3RvKGFuc3dlcikge1xuICByZXR1cm4gKERFQlVHX09OICYmIGFuc3dlciA9PT0gYHBob3RvYCkgPyBTVFlMRSA6IGBgO1xufVxuXG5mdW5jdGlvbiBpc1BhaW50KGFuc3dlcikge1xuICByZXR1cm4gKERFQlVHX09OICYmIGFuc3dlciA9PT0gYHBhaW50YCkgPyBTVFlMRSA6IGBgO1xufVxuXG5mdW5jdGlvbiBpc0NvcnJlY3QoaXNDb3JyZWN0KSB7XG4gIHJldHVybiAoREVCVUdfT04gJiYgaXNDb3JyZWN0KSA/IFNUWUxFIDogYGA7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtpc1Bob3RvLCBpc1BhaW50LCBpc0NvcnJlY3R9O1xuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuaW1wb3J0IGRlYnVnIGZyb20gJy4uL2RlYnVnLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQW5zd2VyUGhvdG9CdXR0b25WaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcihxdWVzdGlvbkluZGV4LCBnYW1lKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnF1ZXN0aW9uSW5kZXggPSBxdWVzdGlvbkluZGV4O1xuICAgIHRoaXMuY29ycmVjdEFuc3dlciA9IGdhbWUucXVlc3Rpb25zW3RoaXMucXVlc3Rpb25JbmRleF0uY29ycmVjdEFuc3dlcjtcbiAgICB0aGlzLmdhbWVJbmRleCA9IGdhbWUuZ2FtZUluZGV4O1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPGxhYmVsIGNsYXNzPVwiZ2FtZV9fYW5zd2VyIGdhbWVfX2Fuc3dlci0tcGhvdG9cIj5cbiAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwidmlzdWFsbHktaGlkZGVuXCIgbmFtZT1cInF1ZXN0aW9uICR7dGhpcy5xdWVzdGlvbkluZGV4fVwiIHR5cGU9XCJyYWRpb1wiIHZhbHVlPVwicGhvdG9cIiBkYXRhLWdhbWVpbmRleD1cIiR7dGhpcy5nYW1lSW5kZXh9XCIgZGF0YS1xdWVzdGlvbmluZGV4PVwiJHt0aGlzLnF1ZXN0aW9uSW5kZXh9XCI+XG4gICAgICAgICAgICAgIDxzcGFuICR7ZGVidWcuaXNQaG90byh0aGlzLmNvcnJlY3RBbnN3ZXIpfT7QpNC+0YLQvjwvc3Bhbj5cbiAgICAgICAgICAgIDwvbGFiZWw+YDtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnZGl2LmdhbWVfX29wdGlvbicpW3RoaXMucXVlc3Rpb25JbmRleF07XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgYmluZChjYikge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdkaXYuZ2FtZV9fb3B0aW9uJylbdGhpcy5xdWVzdGlvbkluZGV4XTtcbiAgICBjb25zdCBhbnN3ZXJFbGVtZW50ID0gcGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKGAuZ2FtZV9fYW5zd2VyLS1waG90byA+IGlucHV0YCk7XG4gICAgYW5zd2VyRWxlbWVudC5jaGVja2VkID0gZmFsc2U7XG4gICAgYW5zd2VyRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGBjbGlja2AsIGNiKTtcbiAgfVxufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuaW1wb3J0IGRlYnVnIGZyb20gJy4uL2RlYnVnLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQW5zd2VyUGFpbnRCdXR0b25WaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcihxdWVzdGlvbkluZGV4LCBnYW1lKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnF1ZXN0aW9uSW5kZXggPSBxdWVzdGlvbkluZGV4O1xuICAgIHRoaXMuY29ycmVjdEFuc3dlciA9IGdhbWUucXVlc3Rpb25zW3RoaXMucXVlc3Rpb25JbmRleF0uY29ycmVjdEFuc3dlcjtcbiAgICB0aGlzLmdhbWVJbmRleCA9IGdhbWUuZ2FtZUluZGV4O1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPGxhYmVsIGNsYXNzPVwiZ2FtZV9fYW5zd2VyIGdhbWVfX2Fuc3dlci0tcGFpbnRcIj5cbiAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwidmlzdWFsbHktaGlkZGVuXCIgbmFtZT1cInF1ZXN0aW9uICR7dGhpcy5xdWVzdGlvbkluZGV4fVwiIHR5cGU9XCJyYWRpb1wiIHZhbHVlPVwicGFpbnRcIiBkYXRhLWdhbWVpbmRleD1cIiR7dGhpcy5nYW1lSW5kZXh9XCIgZGF0YS1xdWVzdGlvbmluZGV4PVwiJHt0aGlzLnF1ZXN0aW9uSW5kZXh9XCI+XG4gICAgICAgICAgICAgIDxzcGFuICR7ZGVidWcuaXNQYWludCh0aGlzLmNvcnJlY3RBbnN3ZXIpfT7QoNC40YHRg9C90L7Qujwvc3Bhbj5cbiAgICAgICAgICAgIDwvbGFiZWw+YDtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnZGl2LmdhbWVfX29wdGlvbicpW3RoaXMucXVlc3Rpb25JbmRleF07XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgYmluZChjYikge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdkaXYuZ2FtZV9fb3B0aW9uJylbdGhpcy5xdWVzdGlvbkluZGV4XTtcbiAgICBjb25zdCBhbnN3ZXJFbGVtZW50ID0gcGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKGAuZ2FtZV9fYW5zd2VyLS1wYWludCA+IGlucHV0YCk7XG4gICAgYW5zd2VyRWxlbWVudC5jaGVja2VkID0gZmFsc2U7XG4gICAgYW5zd2VyRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGBjbGlja2AsIGNiKTtcbiAgfVxufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuaW1wb3J0IGRlYnVnIGZyb20gJy4uL2RlYnVnLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQW5zd2VyUGFpbnRPcHRpb25WaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcihhbnN3ZXJJbmRleCwgZ2FtZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5hbnN3ZXJJbmRleCA9IGFuc3dlckluZGV4O1xuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XG4gICAgdGhpcy5jb3JyZWN0QW5zd2VyID0gZ2FtZS5xdWVzdGlvbnNbMF0uY29ycmVjdEFuc3dlcjtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gYDxkaXYgY2xhc3M9XCJnYW1lX19vcHRpb25cIiBkYXRhLWFuc3dlcj1cIiR7dGhpcy5hbnN3ZXJJbmRleH1cIiBkYXRhLWdhbWVpbmRleD1cIiR7dGhpcy5nYW1lLmdhbWVJbmRleH1cIiAke2RlYnVnLmlzQ29ycmVjdCh0aGlzLmNvcnJlY3RBbnN3ZXIgPT09IHRoaXMuYW5zd2VySW5kZXgpfT5cbiAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgSU1BR0UgLS0+XG4gICAgICAgICAgICA8L2Rpdj5gO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdmb3JtLmdhbWVfX2NvbnRlbnQtLXRyaXBsZScpO1xuICAgIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIGJpbmQoY2IpIHtcbiAgICBjb25zdCBhbnN3ZXJFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgLmdhbWVfX29wdGlvbmApW3RoaXMuYW5zd2VySW5kZXhdO1xuICAgIGFuc3dlckVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihgY2xpY2tgLCBjYik7XG4gIH1cbn1cbiIsIi8vIE1hbmFnaW5nIHNpemVcbi8vIEBwYXJhbSAge29iamVjdH0gZnJhbWUg0L7Qv9C40YHRi9Cy0LDQtdGCINGA0LDQt9C80LXRgNGLINGA0LDQvNC60LgsINCyINC60L7RgtC+0YDRi9C1INC00L7Qu9C20L3QviDQsdGL0YLRjCDQstC/0LjRgdCw0L3QviDQuNC30L7QsdGA0LDQttC10L3QuNC1XG4vLyBAcGFyYW0gIHtvYmplY3R9IGdpdmVuINC+0L/QuNGB0YvQstCw0LXRgiDRgNCw0LfQvNC10YDRiyDQuNC30L7QsdGA0LDQttC10L3QuNGPLCDQutC+0YLQvtGA0YvQtSDQvdGD0LbQvdC+INC/0L7QtNC+0LPQvdCw0YLRjCDQv9C+0LQg0YDQsNC80LrRg1xuLy8gQHJldHVybiB7b2JqZWN0fSDQvdC+0LLRi9C5INC+0LHRitC10LrRgiwg0LrQvtGC0L7RgNGL0Lkg0LHRg9C00LXRgiDRgdC+0LTQtdGA0LbQsNGC0Ywg0LjQt9C80LXQvdGR0L3QvdGL0LUg0YDQsNC30LzQtdGA0Ysg0LjQt9C+0LHRgNCw0LbQtdC90LjRj1xuZXhwb3J0IGRlZmF1bHQgIGZ1bmN0aW9uIHJlc2l6ZShmcmFtZSwgZ2l2ZW4pIHtcbiAgbGV0IHdpZHRoID0gZ2l2ZW4ud2lkdGg7XG4gIGxldCBoZWlnaHQgPSBnaXZlbi5oZWlnaHQ7XG4gIGlmICh3aWR0aCA+IGZyYW1lLndpZHRoKSB7XG4gICAgY29uc3QgbXVsdGlwbGllciA9IHdpZHRoIC8gZnJhbWUud2lkdGg7XG4gICAgd2lkdGggPSBmcmFtZS53aWR0aDtcbiAgICBoZWlnaHQgPSBNYXRoLmZsb29yKGhlaWdodCAvIG11bHRpcGxpZXIpO1xuICB9XG4gIGlmIChoZWlnaHQgPiBmcmFtZS5oZWlnaHQpIHtcbiAgICBjb25zdCBtdWx0aXBsaWVyID0gaGVpZ2h0IC8gZnJhbWUuaGVpZ2h0O1xuICAgIGhlaWdodCA9IGZyYW1lLmhlaWdodDtcbiAgICB3aWR0aCA9IE1hdGguZmxvb3Iod2lkdGggLyBtdWx0aXBsaWVyKTtcbiAgfVxuICByZXR1cm4ge3dpZHRoLCBoZWlnaHR9O1xufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuaW1wb3J0IHJlc2l6ZSBmcm9tIFwiLi4vcmVzaXplLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEltYWdlVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IocXVlc3Rpb25OdW1iZXIsIGdhbWUpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMucXVlc3Rpb25OdW1iZXIgPSBxdWVzdGlvbk51bWJlcjtcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xuICAgIGlmIChnYW1lLmdhbWVUeXBlID09PSAzKSB7XG4gICAgICB0aGlzLmltZyA9IGdhbWUucXVlc3Rpb25zWzBdLmltZ1t0aGlzLnF1ZXN0aW9uTnVtYmVyXTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5pbWcgPSBnYW1lLnF1ZXN0aW9uc1t0aGlzLnF1ZXN0aW9uTnVtYmVyXS5pbWdbMF07XG4gICAgfVxuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIGNvbnN0IGltZ1NpemUgPSByZXNpemUodGhpcy5nYW1lLmZyYW1lU2l6ZSwgdGhpcy5pbWcuc2l6ZSk7XG4gICAgcmV0dXJuIGA8aW1nIHNyYz1cIiR7dGhpcy5pbWcuc3JjfVwiIGFsdD1cIk9wdGlvbiAke3RoaXMucXVlc3Rpb25OdW1iZXIgKyAxfVwiIHdpZHRoPVwiJHtpbWdTaXplLndpZHRofVwiIGhlaWdodD1cIiR7aW1nU2l6ZS5oZWlnaHR9XCI+YDtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnZGl2LmdhbWVfX29wdGlvbicpW3RoaXMucXVlc3Rpb25OdW1iZXJdO1xuICAgIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYWNrQXJyb3dWaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPGJ1dHRvbiBjbGFzcz1cImJhY2tcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ2aXN1YWxseS1oaWRkZW5cIj7QktC10YDQvdGD0YLRjNGB0Y8g0Log0L3QsNGH0LDQu9GDPC9zcGFuPlxuICAgICAgICAgICAgICA8c3ZnIGNsYXNzPVwiaWNvblwiIHdpZHRoPVwiNDVcIiBoZWlnaHQ9XCI0NVwiIHZpZXdCb3g9XCIwIDAgNDUgNDVcIiBmaWxsPVwiIzAwMDAwMFwiPlxuICAgICAgICAgICAgICAgIDx1c2UgeGxpbms6aHJlZj1cImltZy9zcHJpdGUuc3ZnI2Fycm93LWxlZnRcIj48L3VzZT5cbiAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICAgIDxzdmcgY2xhc3M9XCJpY29uXCIgd2lkdGg9XCIxMDFcIiBoZWlnaHQ9XCI0NFwiIHZpZXdCb3g9XCIwIDAgMTAxIDQ0XCIgZmlsbD1cIiMwMDAwMDBcIj5cbiAgICAgICAgICAgICAgICA8dXNlIHhsaW5rOmhyZWY9XCJpbWcvc3ByaXRlLnN2ZyNsb2dvLXNtYWxsXCI+PC91c2U+XG4gICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgPC9idXR0b24+YDtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgaGVhZGVyLmhlYWRlcmApO1xuICAgIHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKHRoaXMuZWxlbWVudCwgcGFyZW50RWxlbWVudC5maXJzdENoaWxkKTtcbiAgfVxuXG4gIGJpbmQoY2IpIHtcbiAgICBjb25zdCBiYWNrQXJyb3cgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuYmFja2ApO1xuICAgIGJhY2tBcnJvdy5hZGRFdmVudExpc3RlbmVyKGBjbGlja2AsIGNiKTtcbiAgfVxufVxuIiwiaW1wb3J0IGNvbmZpZyBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IEFic3RyYWN0U2NyZWVuIGZyb20gJy4uL2Fic3RyYWN0LXNjcmVlbi5qcyc7XG5cbmltcG9ydCBHYW1lU2NyZWVuVmlldyBmcm9tICcuL2dhbWUtc2NyZWVuLXZpZXcuanMnO1xuaW1wb3J0IFRpbWVyQmxvY2tWaWV3IGZyb20gJy4vdGltZXItYmxvY2stdmlldy5qcyc7XG5pbXBvcnQgTGl2ZXNCbG9ja1ZpZXcgZnJvbSAnLi9saXZlcy1ibG9jay12aWV3LmpzJztcbmltcG9ydCBTdGF0c0Jsb2NrVmlldyBmcm9tICcuLi91dGlsLXZpZXdzL3N0YXRzLWJsb2NrLXZpZXcuanMnO1xuaW1wb3J0IEFuc3dlclBob3RvQnV0dG9uVmlldyBmcm9tICcuL2Fuc3dlci1waG90by1idXR0b24tdmlldy5qcyc7XG5pbXBvcnQgQW5zd2VyUGFpbnRCdXR0b25WaWV3IGZyb20gJy4vYW5zd2VyLXBhaW50LWJ1dHRvbi12aWV3LmpzJztcbmltcG9ydCBBbnN3ZXJQYWludE9wdGlvblZpZXcgZnJvbSAnLi9hbnN3ZXItcGFpbnQtb3B0aW9uLXZpZXcuanMnO1xuaW1wb3J0IEltYWdlVmlldyBmcm9tICcuL2ltYWdlLXZpZXcuanMnO1xuaW1wb3J0IEJhY2tBcnJvd1ZpZXcgZnJvbSAnLi4vdXRpbC12aWV3cy9iYWNrLWFycm93LXZpZXcuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHYW1lU2NyZWVuIGV4dGVuZHMgQWJzdHJhY3RTY3JlZW4ge1xuXG4gIGNvbnN0cnVjdG9yKGdhbWVNb2RlbCwgZ2FtZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5nYW1lTW9kZWwgPSBnYW1lTW9kZWw7XG4gICAgdGhpcy5nYW1lID0gZ2FtZTtcbiAgICB0aGlzLnZpZXcgPSBuZXcgR2FtZVNjcmVlblZpZXcoZ2FtZSk7XG4gIH1cblxuICBfb25TY3JlZW5TaG93KCkge1xuICAgIGNvbnN0IGdhbWUgPSB0aGlzLmdhbWU7XG4gICAgY29uc3QgZ2FtZVR5cGUgPSBnYW1lLmdhbWVUeXBlO1xuICAgIGNvbnN0IGxpdmVzQmxvY2sgPSBuZXcgTGl2ZXNCbG9ja1ZpZXcodGhpcy5nYW1lTW9kZWwubGl2ZXMpO1xuICAgIGNvbnN0IHN0YXRzQmxvY2sgPSBuZXcgU3RhdHNCbG9ja1ZpZXcodGhpcy5nYW1lTW9kZWwuYW5zd2Vycyk7XG5cbiAgICBsaXZlc0Jsb2NrLnJlbmRlcigpO1xuICAgIHN0YXRzQmxvY2sucmVuZGVyKCk7XG5cbiAgICB0aGlzLnRpbWVyID0gbmV3IFRpbWVyQmxvY2tWaWV3KCk7XG4gICAgdGhpcy50aW1lci5yZW5kZXIoKTtcbiAgICB0aGlzLl90aW1lck9uKCk7XG5cbiAgICBjb25zdCBvbkV2ZXJ5QW5zd2VyID0gdGhpcy5fb25FdmVyeUFuc3dlci5iaW5kKHRoaXMpO1xuXG4gICAgaWYgKGdhbWVUeXBlID09PSBjb25maWcuR0FNRV9UWVBFLm9uZSkge1xuICAgICAgY29uc3QgYW5zd2VyMVBob3RvQnV0dG9uID0gbmV3IEFuc3dlclBob3RvQnV0dG9uVmlldygwLCBnYW1lKTtcbiAgICAgIGNvbnN0IGFuc3dlcjFQYWludEJ1dHRvbiA9IG5ldyBBbnN3ZXJQYWludEJ1dHRvblZpZXcoMCwgZ2FtZSk7XG4gICAgICBjb25zdCBpbWFnZSA9IG5ldyBJbWFnZVZpZXcoMCwgZ2FtZSk7XG4gICAgICBhbnN3ZXIxUGhvdG9CdXR0b24ucmVuZGVyKCk7XG4gICAgICBhbnN3ZXIxUGFpbnRCdXR0b24ucmVuZGVyKCk7XG4gICAgICBpbWFnZS5yZW5kZXIoKTtcbiAgICAgIGFuc3dlcjFQaG90b0J1dHRvbi5iaW5kKG9uRXZlcnlBbnN3ZXIpO1xuICAgICAgYW5zd2VyMVBhaW50QnV0dG9uLmJpbmQob25FdmVyeUFuc3dlcik7XG4gICAgfSBlbHNlIGlmIChnYW1lVHlwZSA9PT0gY29uZmlnLkdBTUVfVFlQRS50d28pIHtcbiAgICAgIGNvbnN0IGFuc3dlcjFQaG90b0J1dHRvbiA9IG5ldyBBbnN3ZXJQaG90b0J1dHRvblZpZXcoMCwgZ2FtZSk7XG4gICAgICBjb25zdCBhbnN3ZXIxUGFpbnRCdXR0b24gPSBuZXcgQW5zd2VyUGFpbnRCdXR0b25WaWV3KDAsIGdhbWUpO1xuICAgICAgY29uc3QgaW1hZ2UxID0gbmV3IEltYWdlVmlldygwLCBnYW1lKTtcbiAgICAgIGNvbnN0IGFuc3dlcjJQaG90b0J1dHRvbiA9IG5ldyBBbnN3ZXJQaG90b0J1dHRvblZpZXcoMSwgZ2FtZSk7XG4gICAgICBjb25zdCBhbnN3ZXIyUGFpbnRCdXR0b24gPSBuZXcgQW5zd2VyUGFpbnRCdXR0b25WaWV3KDEsIGdhbWUpO1xuICAgICAgY29uc3QgaW1hZ2UyID0gbmV3IEltYWdlVmlldygxLCBnYW1lKTtcbiAgICAgIGFuc3dlcjFQaG90b0J1dHRvbi5yZW5kZXIoKTtcbiAgICAgIGFuc3dlcjFQYWludEJ1dHRvbi5yZW5kZXIoKTtcbiAgICAgIGltYWdlMS5yZW5kZXIoKTtcbiAgICAgIGFuc3dlcjFQaG90b0J1dHRvbi5iaW5kKG9uRXZlcnlBbnN3ZXIpO1xuICAgICAgYW5zd2VyMVBhaW50QnV0dG9uLmJpbmQob25FdmVyeUFuc3dlcik7XG4gICAgICBhbnN3ZXIyUGhvdG9CdXR0b24ucmVuZGVyKCk7XG4gICAgICBhbnN3ZXIyUGFpbnRCdXR0b24ucmVuZGVyKCk7XG4gICAgICBpbWFnZTIucmVuZGVyKCk7XG4gICAgICBhbnN3ZXIyUGhvdG9CdXR0b24uYmluZChvbkV2ZXJ5QW5zd2VyKTtcbiAgICAgIGFuc3dlcjJQYWludEJ1dHRvbi5iaW5kKG9uRXZlcnlBbnN3ZXIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZVR5cGUgPT09IGNvbmZpZy5HQU1FX1RZUEUudGhyZWUpIHtcbiAgICAgIGNvbnN0IGFuc3dlcjFQYWludE9wdGlvblZpZXcgPSBuZXcgQW5zd2VyUGFpbnRPcHRpb25WaWV3KDAsIGdhbWUpO1xuICAgICAgY29uc3QgaW1hZ2UxID0gbmV3IEltYWdlVmlldygwLCBnYW1lKTtcbiAgICAgIGNvbnN0IGFuc3dlcjJQYWludE9wdGlvblZpZXcgPSBuZXcgQW5zd2VyUGFpbnRPcHRpb25WaWV3KDEsIGdhbWUpO1xuICAgICAgY29uc3QgaW1hZ2UyID0gbmV3IEltYWdlVmlldygxLCBnYW1lKTtcbiAgICAgIGNvbnN0IGFuc3dlcjNQYWludE9wdGlvblZpZXcgPSBuZXcgQW5zd2VyUGFpbnRPcHRpb25WaWV3KDIsIGdhbWUpO1xuICAgICAgY29uc3QgaW1hZ2UzID0gbmV3IEltYWdlVmlldygyLCBnYW1lKTtcbiAgICAgIGFuc3dlcjFQYWludE9wdGlvblZpZXcucmVuZGVyKCk7XG4gICAgICBpbWFnZTEucmVuZGVyKCk7XG4gICAgICBhbnN3ZXIyUGFpbnRPcHRpb25WaWV3LnJlbmRlcigpO1xuICAgICAgaW1hZ2UyLnJlbmRlcigpO1xuICAgICAgYW5zd2VyM1BhaW50T3B0aW9uVmlldy5yZW5kZXIoKTtcbiAgICAgIGltYWdlMy5yZW5kZXIoKTtcbiAgICAgIGFuc3dlcjFQYWludE9wdGlvblZpZXcuYmluZChvbkV2ZXJ5QW5zd2VyKTtcbiAgICAgIGFuc3dlcjJQYWludE9wdGlvblZpZXcuYmluZChvbkV2ZXJ5QW5zd2VyKTtcbiAgICAgIGFuc3dlcjNQYWludE9wdGlvblZpZXcuYmluZChvbkV2ZXJ5QW5zd2VyKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXN0YXJ0R2FtZSA9IHRoaXMuX3Jlc3RhcnRHYW1lLmJpbmQodGhpcyk7XG5cbiAgICBjb25zdCBiYWNrQXJyb3cgPSBuZXcgQmFja0Fycm93VmlldygpO1xuICAgIGJhY2tBcnJvdy5yZW5kZXIoKTtcbiAgICBiYWNrQXJyb3cuYmluZChyZXN0YXJ0R2FtZSk7XG4gIH1cblxuICBfdGltZXJPbigpIHtcbiAgICBpZiAodGhpcy50aW1lci5pc0FjdGl2ZSAmJiB0aGlzLnRpbWVyLnRpbWUgPiAwKSB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy50aW1lci51cGRhdGUoKTtcbiAgICAgICAgdGhpcy5fdGltZXJPbigpO1xuICAgICAgfSwgMTAwMCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRpbWVyLnRpbWUgPT09IDApIHtcbiAgICAgIHRoaXMuX29uVmFsaWRBbnN3ZXIoZmFsc2UpO1xuICAgIH1cbiAgfVxuXG4gIF9vbkV2ZXJ5QW5zd2VyKGV2dCkge1xuICAgIGNvbnN0IGdhbWUgPSB0aGlzLmdhbWU7XG4gICAgaWYgKGdhbWUuZ2FtZVR5cGUgPT09IGNvbmZpZy5HQU1FX1RZUEUudGhyZWUpIHtcbiAgICAgIGNvbnN0IGlucHV0ID0gZXZ0LmN1cnJlbnRUYXJnZXQ7XG4gICAgICBjb25zdCBnYW1lSW5kZXggPSBHYW1lU2NyZWVuLmdldEdhbWVJbmRleChpbnB1dCk7XG4gICAgICBjb25zdCBxdWVzdGlvbkluZGV4ID0gMDtcbiAgICAgIGNvbnN0IGNvcnJlY3RBbnN3ZXIgPSB0aGlzLl9nZXRDb3JyZWN0QW5zd2VyKGdhbWVJbmRleCwgcXVlc3Rpb25JbmRleCk7XG4gICAgICBjb25zdCBpc09LID0gK2lucHV0LmRhdGFzZXQuYW5zd2VyID09PSBjb3JyZWN0QW5zd2VyO1xuICAgICAgdGhpcy5fb25WYWxpZEFuc3dlcihpc09LKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgaXNBbGwgPSB0aGlzLl9pc0FsbEFuc3dlcnNHaXZlbigpO1xuICAgICAgaWYgKGlzQWxsKSB7XG4gICAgICAgIGNvbnN0IGlzT0sgPSB0aGlzLl9pc0FsbEFuc3dlcnNHaXZlbkNvcnJlY3QoKTtcbiAgICAgICAgdGhpcy5fb25WYWxpZEFuc3dlcihpc09LKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfaXNBbGxBbnN3ZXJzR2l2ZW4oKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgLmdhbWVfX29wdGlvbmApKTtcbiAgICByZXR1cm4gb3B0aW9ucy5ldmVyeSgob3B0aW9uKSA9PiB7XG4gICAgICBjb25zdCBhbnN3ZXJzID0gQXJyYXkuZnJvbShvcHRpb24ucXVlcnlTZWxlY3RvckFsbChgLmdhbWVfX2Fuc3dlcmApKTtcbiAgICAgIHJldHVybiBhbnN3ZXJzLnNvbWUoKGFuc3dlcikgPT4ge1xuICAgICAgICBjb25zdCBpbnB1dCA9IGFuc3dlci5xdWVyeVNlbGVjdG9yKGBpbnB1dGApO1xuICAgICAgICByZXR1cm4gaW5wdXQuY2hlY2tlZDtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgX2lzQWxsQW5zd2Vyc0dpdmVuQ29ycmVjdCgpIHtcbiAgICBjb25zdCBvcHRpb25zID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGAuZ2FtZV9fb3B0aW9uYCkpO1xuICAgIHJldHVybiBvcHRpb25zLmV2ZXJ5KChvcHRpb24pID0+IHtcbiAgICAgIGNvbnN0IGFuc3dlcnMgPSBBcnJheS5mcm9tKG9wdGlvbi5xdWVyeVNlbGVjdG9yQWxsKGAuZ2FtZV9fYW5zd2VyYCkpO1xuICAgICAgcmV0dXJuIGFuc3dlcnMuc29tZSgoYW5zd2VyKSA9PiB7XG4gICAgICAgIGNvbnN0IGlucHV0ID0gYW5zd2VyLnF1ZXJ5U2VsZWN0b3IoYGlucHV0YCk7XG4gICAgICAgIGNvbnN0IGdhbWVJbmRleCA9IEdhbWVTY3JlZW4uZ2V0R2FtZUluZGV4KGlucHV0KTtcbiAgICAgICAgY29uc3QgcXVlc3Rpb25JbmRleCA9IEdhbWVTY3JlZW4uZ2V0UXVlc3Rpb25JbmRleChpbnB1dCk7XG4gICAgICAgIGNvbnN0IGNvcnJlY3RBbnN3ZXIgPSB0aGlzLl9nZXRDb3JyZWN0QW5zd2VyKGdhbWVJbmRleCwgcXVlc3Rpb25JbmRleCk7XG4gICAgICAgIHJldHVybiBpbnB1dC5jaGVja2VkICYmIGlucHV0LnZhbHVlID09PSBjb3JyZWN0QW5zd2VyO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBfb25WYWxpZEFuc3dlcihpc09LKSB7XG4gICAgdGhpcy5fc2F2ZUFuc3dlcihpc09LKTtcbiAgICBpZiAoIWlzT0spIHtcbiAgICAgIHRoaXMuZ2FtZU1vZGVsLm1pbnVzTGl2ZSgpO1xuICAgIH1cbiAgICBpZiAodGhpcy5nYW1lTW9kZWwuaXNHYW1lT3Zlcikge1xuICAgICAgdGhpcy5lbmRTY3JlZW4uc2hvdygpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm5leHRTY3JlZW4uc2hvdygpO1xuICAgIH1cbiAgfVxuXG4gIF9nZXRDb3JyZWN0QW5zd2VyKGdhbWVJbmRleCwgcXVlc3Rpb25JbmRleCkge1xuICAgIHJldHVybiB0aGlzLmdhbWVNb2RlbC5nYW1lc1tnYW1lSW5kZXhdLnF1ZXN0aW9uc1txdWVzdGlvbkluZGV4XS5jb3JyZWN0QW5zd2VyO1xuICB9XG5cbiAgX3NhdmVBbnN3ZXIoaXNPSykge1xuICAgIGNvbnN0IHRpbWUgPSAoY29uZmlnLlRJTUVfVE9fQU5TV0VSIC0gdGhpcy50aW1lci50aW1lKSAvIDEwMDA7XG4gICAgdGhpcy50aW1lci5zdG9wKCk7XG4gICAgdGhpcy5nYW1lTW9kZWwuYWRkQW5zd2VyKHtpc09LLCB0aW1lfSk7XG4gIH1cblxuICBzdGF0aWMgZ2V0R2FtZUluZGV4KGlucHV0KSB7XG4gICAgcmV0dXJuIGlucHV0LmRhdGFzZXQuZ2FtZWluZGV4O1xuICB9XG5cbiAgc3RhdGljIGdldFF1ZXN0aW9uSW5kZXgoaW5wdXQpIHtcbiAgICByZXR1cm4gaW5wdXQuZGF0YXNldC5xdWVzdGlvbmluZGV4O1xuICB9XG5cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7RUFBQSxNQUFNLE1BQU0sR0FBRztFQUNmLEVBQUUsV0FBVyxFQUFFLEVBQUU7RUFDakIsRUFBRSxXQUFXLEVBQUUsQ0FBQztFQUNoQixFQUFFLGNBQWMsRUFBRSxLQUFLO0VBQ3ZCLEVBQUUsU0FBUyxFQUFFO0VBQ2IsSUFBSSxHQUFHLEVBQUUsQ0FBQztFQUNWLElBQUksR0FBRyxFQUFFLENBQUM7RUFDVixJQUFJLEtBQUssRUFBRSxDQUFDO0VBQ1osR0FBRztFQUNILENBQUM7O0VDUGMsTUFBTSxZQUFZLENBQUM7QUFDbEM7RUFDQSxFQUFFLFdBQVcsR0FBRyxFQUFFO0FBQ2xCO0VBQ0E7RUFDQSxFQUFFLElBQUksUUFBUSxHQUFHLEVBQUU7QUFDbkI7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBLEVBQUUsSUFBSSxPQUFPLEdBQUc7RUFDaEIsSUFBSSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0VBQ25DO0VBQ0EsTUFBTSxNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFD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SUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLGFBQWEsQ0FBQztFQUM5RCxPQUFPLENBQUMsQ0FBQztFQUNULEtBQUssQ0FBQyxDQUFDO0VBQ1AsR0FBRztBQUNIO0VBQ0EsRUFBRSxjQUFjLENBQUMsSUFBSSxFQUFFO0VBQ3ZCLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUMzQixJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7RUFDZixNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUM7RUFDakMsS0FBSztFQUNMLElBQUksSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRTtFQUNuQyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7RUFDNUIsS0FBSyxNQUFNO0VBQ1gsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO0VBQzdCLEtBQUs7RUFDTCxHQUFHO0FBQ0g7RUFDQSxFQUFFLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxhQUFhLEVBQUU7RUFDOUMsSUFBSSxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxhQUFhLENBQUM7RUFDbEYsR0FBRztBQUNIO0VBQ0EsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFO0VBQ3BCLElBQUksTUFBTSxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQztFQUNsRSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7RUFDdEIsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0VBQzNDLEdBQUc7QUFDSDtFQUNBLEVBQUUsT0FBTyxZQUFZLENBQUMsS0FBSyxFQUFFO0VBQzdCLElBQUksT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztFQUNuQyxHQUFHO0FBQ0g7RUFDQSxFQUFFLE9BQU8sZ0JBQWdCLENBQUMsS0FBSyxFQUFFO0VBQ2pDLElBQUksT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQztFQUN2QyxHQUFHO0FBQ0g7RUFDQTs7Ozs7Ozs7Iiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
