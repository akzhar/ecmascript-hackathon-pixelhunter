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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZS1zY3JlZW4vZ2FtZS1zY3JlZW4uanMiLCJzb3VyY2VzIjpbInNyYy9qcy9jb25maWcuanMiLCJzcmMvanMvYWJzdHJhY3Qtdmlldy5qcyIsInNyYy9qcy91dGlsLXZpZXdzL2NvbmZpcm0tbW9kYWwtdmlldy5qcyIsInNyYy9qcy9hYnN0cmFjdC1zY3JlZW4uanMiLCJzcmMvanMvZ2FtZS1zY3JlZW4vZ2FtZS1zY3JlZW4tdmlldy5qcyIsInNyYy9qcy9nYW1lLXNjcmVlbi90aW1lci1ibG9jay12aWV3LmpzIiwic3JjL2pzL2dhbWUtc2NyZWVuL2xpdmVzLWJsb2NrLXZpZXcuanMiLCJzcmMvanMvdXRpbC12aWV3cy9zdGF0cy1ibG9jay12aWV3LmpzIiwic3JjL2pzL2RlYnVnLmpzIiwic3JjL2pzL2dhbWUtc2NyZWVuL2Fuc3dlci1waG90by1idXR0b24tdmlldy5qcyIsInNyYy9qcy9nYW1lLXNjcmVlbi9hbnN3ZXItcGFpbnQtYnV0dG9uLXZpZXcuanMiLCJzcmMvanMvZ2FtZS1zY3JlZW4vYW5zd2VyLXBhaW50LW9wdGlvbi12aWV3LmpzIiwic3JjL2pzL3Jlc2l6ZS5qcyIsInNyYy9qcy9nYW1lLXNjcmVlbi9pbWFnZS12aWV3LmpzIiwic3JjL2pzL3V0aWwtdmlld3MvYmFjay1hcnJvdy12aWV3LmpzIiwic3JjL2pzL2dhbWUtc2NyZWVuL2dhbWUtc2NyZWVuLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGNvbmZpZyA9IHtcbiAgR0FNRVNfQ09VTlQ6IDEwLFxuICBMSVZFU19DT1VOVDogMyxcbiAgVElNRV9UT19BTlNXRVI6IDMwMDAwLCAvLyAzMCBzZWNcbiAgR0FNRV9UWVBFOiB7XG4gICAgb25lOiAxLFxuICAgIHR3bzogMixcbiAgICB0aHJlZTogM1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjb25maWc7XG4iLCJjb25zdCBlbGVtZW50cyA9IHt9O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKCkge31cblxuICAvLyDQstC+0LfQstGA0LDRidCw0LXRgiDRgdGC0YDQvtC60YMsINGB0L7QtNC10YDQttCw0YnRg9GOINGA0LDQt9C80LXRgtC60YNcbiAgZ2V0IHRlbXBsYXRlKCkge31cblxuICAvLyDRgdC+0LfQtNCw0LXRgiDQuCDQstC+0LfQstGA0LDRidCw0LXRgiBET00t0Y3Qu9C10LzQtdC90YIg0L3QsCDQvtGB0L3QvtCy0LUg0YjQsNCx0LvQvtC90LBcbiAgLy8g0LTQvtC70LbQtdC9INGB0L7Qt9C00LDQstCw0YLRjCBET00t0Y3Qu9C10LzQtdC90YIg0YEg0L/QvtC80L7RidGM0Y4g0LzQtdGC0L7QtNCwIHJlbmRlciwg0LTQvtCx0LDQstC70Y/RgtGMINC10LzRgyDQvtCx0YDQsNCx0L7RgtGH0LjQutC4LCDRgSDQv9C+0LzQvtGJ0YzRjiDQvNC10YLQvtC00LAgYmluZCDQuCDQstC+0LfQstGA0LDRidCw0YLRjCDRgdC+0LfQtNCw0L3QvdGL0Lkg0Y3Qu9C10LzQtdC90YJcbiAgLy8g0JzQtdGC0L7QtCDQtNC+0LvQttC10L0g0LjRgdC/0L7Qu9GM0LfQvtCy0LDRgtGMINC70LXQvdC40LLRi9C1INCy0YvRh9C40YHQu9C10L3QuNGPIOKAlCDRjdC70LXQvNC10L3RgiDQtNC+0LvQttC10L0g0YHQvtC30LTQsNCy0LDRgtGM0YHRjyDQv9GA0Lgg0L/QtdGA0LLQvtC8INC+0LHRgNCw0YnQtdC90LjQuCDQuiDQs9C10YLRgtC10YAg0YEg0L/QvtC80L7RidGM0Y4g0LzQtdGC0L7QtNCwIHJlbmRlciwg0LTQvtC70LbQvdGLINC00L7QsdCw0LLQu9GP0YLRjNGB0Y8g0L7QsdGA0LDQsdC+0YLRh9C40LrQuCAo0LzQtdGC0L7QtCBiaW5kKS5cbiAgLy8g0J/RgNC4INC/0L7RgdC70LXQtNGD0Y7RidC40YUg0L7QsdGA0LDRidC10L3QuNGP0YUg0LTQvtC70LbQtdC9INC40YHQv9C+0LvRjNC30L7QstCw0YLRjNGB0Y8g0Y3Qu9C10LzQtdC90YIsINGB0L7Qt9C00LDQvdC90YvQuSDQv9GA0Lgg0L/QtdGA0LLQvtC8INCy0YvQt9C+0LLQtSDQs9C10YLRgtC10YDQsC5cbiAgZ2V0IGVsZW1lbnQoKSB7XG4gICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlO1xuICAgIC8vIGlmICghZWxlbWVudHMuaGFzT3duUHJvcGVydHkodGVtcGxhdGUpKSB7XG4gICAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGBkaXZgKTtcbiAgICAgIGRpdi5pbm5lckhUTUwgPSB0ZW1wbGF0ZTtcbiAgICAgIGNvbnN0IGVsZW0gPSBkaXYuZmlyc3RDaGlsZDtcbiAgICAgIGVsZW1lbnRzW3RlbXBsYXRlXSA9IGVsZW07XG4gICAgICByZXR1cm4gZWxlbTtcbiAgICAvLyB9IGVsc2Uge1xuICAgICAgLy8gcmV0dXJuIGVsZW1lbnRzW3RlbXBsYXRlXTtcbiAgICAvLyB9XG4gIH1cblxuICAvLyDQvtGC0YDQuNGB0L7QstGL0LLQsNC10YIgRE9NLdGN0LvQtdC80LXQvdGCLCDQtNC+0LHQsNCy0LvRj9C10YIg0L3QtdC+0LHRhdC+0LTQuNC80YvQtSDQvtCx0YDQsNCx0L7RgtGH0LjQutC4XG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgbWFpbi5jZW50cmFsYCk7XG4gICAgY29uc3Qgb2xkRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCNtYWluYCk7XG4gICAgcGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChvbGRFbGVtZW50KTtcbiAgICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XG4gIH1cblxuICAvLyDQtNC+0LHQsNCy0LvRj9C10YIg0L7QsdGA0LDQsdC+0YLRh9C40LrQuCDRgdC+0LHRi9GC0LjQuVxuICAvLyDQnNC10YLQvtC0INC/0L4g0YPQvNC+0LvRh9Cw0L3QuNGOINC90LjRh9C10LPQviDQvdC1INC00LXQu9Cw0LXRglxuICAvLyDQldGB0LvQuCDQvdGD0LbQvdC+INC+0LHRgNCw0LHQvtGC0LDRgtGMINC60LDQutC+0LUt0YLQviDRgdC+0LHRi9GC0LjQtSwg0YLQviDRjdGC0L7RgiDQvNC10YLQvtC0INC00L7Qu9C20LXQvSDQsdGL0YLRjCDQv9C10YDQtdC+0L/RgNC10LTQtdC70ZHQvSDQsiDQvdCw0YHQu9C10LTQvdC40LrQtSDRgSDQvdC10L7QsdGF0L7QtNC40LzQvtC5INC70L7Qs9C40LrQvtC5XG4gIGJpbmQoKSB7fVxufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25maXJtTW9kYWxWaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPHNlY3Rpb24gY2xhc3M9XCJtb2RhbFwiPlxuICAgICAgICAgICAgICA8Zm9ybSBjbGFzcz1cIm1vZGFsX19pbm5lclwiPlxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJtb2RhbF9fY2xvc2VcIiB0eXBlPVwiYnV0dG9uXCI+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInZpc3VhbGx5LWhpZGRlblwiPtCX0LDQutGA0YvRgtGMPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDxoMiBjbGFzcz1cIm1vZGFsX190aXRsZVwiPtCf0L7QtNGC0LLQtdGA0LbQtNC10L3QuNC1PC9oMj5cbiAgICAgICAgICAgICAgICA8cCBjbGFzcz1cIm1vZGFsX190ZXh0XCI+0JLRiyDRg9Cy0LXRgNC10L3RiyDRh9GC0L4g0YXQvtGC0LjRgtC1INC90LDRh9Cw0YLRjCDQuNCz0YDRgyDQt9Cw0L3QvtCy0L4/PC9wPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbF9fYnV0dG9uLXdyYXBwZXJcIj5cbiAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJtb2RhbF9fYnRuIG1vZGFsX19idG4tLW9rXCI+0J7QujwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cIm1vZGFsX19idG4gbW9kYWxfX2J0bi0tY2FuY2VsXCI+0J7RgtC80LXQvdCwPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgIDwvc2VjdGlvbj5gO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjbWFpbmApO1xuICAgIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIGJpbmQoY2IpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI21haW5gKTtcbiAgICBjb25zdCBtb2RhbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5tb2RhbGApO1xuICAgIGNvbnN0IGNsb3NlQnRuID0gbW9kYWwucXVlcnlTZWxlY3RvcihgLm1vZGFsX19jbG9zZWApO1xuICAgIGNvbnN0IGNhbmNlbEJ0biA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoYC5tb2RhbF9fYnRuLS1jYW5jZWxgKTtcbiAgICBjb25zdCBva0J0biA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoYC5tb2RhbF9fYnRuLS1va2ApO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoYGtleWRvd25gLCAoZXZ0KSA9PiB7XG4gICAgICBpZiAoZXZ0LmtleUNvZGUgPT09IDI3KSB7XG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBwYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKG1vZGFsKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBjbG9zZUJ0bi5hZGRFdmVudExpc3RlbmVyKGBjbGlja2AsIChldnQpID0+IHtcbiAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgcGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChtb2RhbCk7XG4gICAgfSk7XG4gICAgY2FuY2VsQnRuLmFkZEV2ZW50TGlzdGVuZXIoYGNsaWNrYCwgKGV2dCkgPT4ge1xuICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBwYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKG1vZGFsKTtcbiAgICB9KTtcbiAgICBva0J0bi5hZGRFdmVudExpc3RlbmVyKGBjbGlja2AsIChldnQpID0+IHtcbiAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgY2IoKTtcbiAgICB9KTtcbiAgfVxufVxuIiwiaW1wb3J0IENvbmZpcm1Nb2RhbFZpZXcgZnJvbSAnLi91dGlsLXZpZXdzL2NvbmZpcm0tbW9kYWwtdmlldy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFic3RyYWN0U2NyZWVuIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmdhbWVNb2RlbCA9IG51bGw7XG4gICAgdGhpcy5nYW1lID0gbnVsbDtcbiAgICB0aGlzLnZpZXcgPSBudWxsO1xuICAgIHRoaXMudGltZXIgPSBudWxsO1xuICAgIHRoaXMuc3RhcnRTY3JlZW4gPSBudWxsO1xuICAgIHRoaXMubmV4dFNjcmVlbiA9IG51bGw7XG4gICAgdGhpcy5lbmRTY3JlZW4gPSBudWxsO1xuICB9XG5cbiAgLy8g0LzQtdGC0L7QtCDQv9C+0LrQsNC30LAg0Y3QutGA0LDQvdCwINC+0YLRgNC40YHQvtCy0YvQstCw0LXRgiDRjdC60YDQsNC9INC4INC30LDQv9GD0YHQutCw0LXRgiDQvNC10YLQvtC0IF9vblNjcmVlblNob3dcbiAgc2hvdygpIHtcbiAgICB0aGlzLnZpZXcucmVuZGVyKCk7XG4gICAgdGhpcy5fb25TY3JlZW5TaG93KCk7XG4gIH1cblxuICAvLyDQvNC10YLQvtC0INGA0LXQsNC70LjQt9GD0LXRgiDQsdC40LfQvdC10YEg0LvQvtCz0LjQutGDINGN0LrRgNCw0L3QsFxuICBfb25TY3JlZW5TaG93KCkge31cblxuICAvLyDQvNC10YLQvtC0INC/0LXRgNC10LfQsNC/0YPRgdC60LDQtdGCINC40LPRgNGDXG4gIF9yZXN0YXJ0R2FtZSgpIHtcbiAgICBjb25zdCBjb25maXJtTW9kYWwgPSBuZXcgQ29uZmlybU1vZGFsVmlldygpO1xuICAgIGNvbmZpcm1Nb2RhbC5yZW5kZXIoKTtcbiAgICBjb25maXJtTW9kYWwuYmluZCgoKSA9PiB7XG4gICAgICB0aGlzLmdhbWVNb2RlbC5yZXNldCgpO1xuICAgICAgdGhpcy5zdGFydFNjcmVlbi5zaG93KCk7XG4gICAgfSk7XG4gIH1cbn1cbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FtZVNjcmVlblZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKGdhbWUpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuIGA8ZGl2IGlkPVwibWFpblwiIGNsYXNzPVwiY2VudHJhbF9fY29udGVudFwiPlxuICAgICAgICAgICAgICA8aGVhZGVyIGNsYXNzPVwiaGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBUTyBCQUNLIEFSUk9XIC0tPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJnYW1lX190aW1lclwiPjwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJnYW1lX19saXZlc1wiPjwvZGl2PlxuICAgICAgICAgICAgICA8L2hlYWRlcj5cbiAgICAgICAgICAgICAgPHNlY3Rpb24gY2xhc3M9XCJnYW1lXCI+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJnYW1lX190YXNrXCI+JHt0aGlzLmdhbWUudGFza308L3A+XG4gICAgICAgICAgICAgICAgJHtHYW1lU2NyZWVuVmlldy5nZXRHYW1lQ29udGVudCh0aGlzLmdhbWUuZ2FtZVR5cGUpfVxuICAgICAgICAgICAgICAgIDx1bCBjbGFzcz1cInN0YXRzXCI+PC91bD5cbiAgICAgICAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICAgICAgPC9kaXY+YDtcbiAgfVxuXG4gIHN0YXRpYyBnZXRHYW1lQ29udGVudChnYW1lVHlwZSkge1xuICAgIGxldCBjb250ZW50ID0gYGA7XG4gICAgaWYgKGdhbWVUeXBlID09PSAxKSB7XG4gICAgICBjb250ZW50ID0gYDxmb3JtIGNsYXNzPVwiZ2FtZV9fY29udGVudCAgZ2FtZV9fY29udGVudC0td2lkZVwiPlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdhbWVfX29wdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBJTUFHRSAtLT5cbiAgICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgQU5TV0VSIFBIT1RPIEJVVFRPTiAtLT5cbiAgICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgQU5TV0VSIFBBSU5UIEJVVFRPTiAtLT5cbiAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICA8L2Zvcm0+YDtcbiAgICB9IGVsc2UgaWYgKGdhbWVUeXBlID09PSAyKSB7XG4gICAgICBjb250ZW50ID0gYDxmb3JtIGNsYXNzPVwiZ2FtZV9fY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJnYW1lX19vcHRpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIElNQUdFIC0tPlxuICAgICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgQU5TV0VSIFBIT1RPIEJVVFRPTiAtLT5cbiAgICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIEFOU1dFUiBQQUlOVCBCVVRUT04gLS0+XG4gICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdhbWVfX29wdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgSU1BR0UgLS0+XG4gICAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBBTlNXRVIgUEhPVE8gQlVUVE9OIC0tPlxuICAgICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgQU5TV0VSIFBBSU5UIEJVVFRPTiAtLT5cbiAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgPC9mb3JtPmA7XG4gICAgfSBlbHNlIGlmIChnYW1lVHlwZSA9PT0gMykge1xuICAgICAgY29udGVudCA9IGA8Zm9ybSBjbGFzcz1cImdhbWVfX2NvbnRlbnQgIGdhbWVfX2NvbnRlbnQtLXRyaXBsZVwiPlxuICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIEFOU1dFUiBQQUlOVCBPUFRJT04gLS0+XG4gICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgQU5TV0VSIFBBSU5UIE9QVElPTiAtLT5cbiAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBBTlNXRVIgUEFJTlQgT1BUSU9OIC0tPlxuICAgICAgICAgICAgICAgICA8L2Zvcm0+YDtcbiAgICB9XG4gICAgcmV0dXJuIGNvbnRlbnQ7XG4gIH1cblxufVxuIiwiaW1wb3J0IGNvbmZpZyBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUaW1lckJsb2NrVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9pc0FjdGl2ZSA9IHRydWU7XG4gICAgdGhpcy5fdGltZSA9IGNvbmZpZy5USU1FX1RPX0FOU1dFUjtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICBjb25zdCB0aW1lID0gVGltZXJCbG9ja1ZpZXcuZ2V0VGltZUZvcm1hdHRlZCh0aGlzLnRpbWUpO1xuICAgIHJldHVybiBgPGRpdiBjbGFzcz1cImdhbWVfX3RpbWVyXCI+JHt0aW1lfTwvZGl2PmA7XG4gIH1cblxuICBnZXQgdGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fdGltZTtcbiAgfVxuXG4gIHNldCB0aW1lKG5ld1RpbWUpIHtcbiAgICB0aGlzLl90aW1lID0gbmV3VGltZTtcbiAgfVxuXG4gIGdldCBpc0FjdGl2ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5faXNBY3RpdmU7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYGhlYWRlci5oZWFkZXJgKTtcbiAgICBwYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZSh0aGlzLmVsZW1lbnQsIHBhcmVudEVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gIH1cblxuICB1cGRhdGUoKSB7XG4gICAgaWYgKHRoaXMuX2lzQWN0aXZlICYmIHRoaXMudGltZSA+IDApIHtcbiAgICAgIHRoaXMudGltZSA9IHRoaXMudGltZSAtIDEwMDA7XG4gICAgICBjb25zdCB0aW1lID0gVGltZXJCbG9ja1ZpZXcuZ2V0VGltZUZvcm1hdHRlZCh0aGlzLnRpbWUpO1xuICAgICAgY29uc3QgdGltZXJFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgZGl2LmdhbWVfX3RpbWVyYCk7XG4gICAgICB0aW1lckVsZW1lbnQudGV4dENvbnRlbnQgPSB0aW1lO1xuICAgICAgaWYgKHRoaXMudGltZSA9PT0gNTAwMCB8fCB0aGlzLnRpbWUgPT09IDMwMDAgfHwgdGhpcy50aW1lID09PSAxMDAwKSB7XG4gICAgICAgIHRpbWVyRWxlbWVudC5zdHlsZSA9IGBjb2xvcjogI2Q3NDA0MDtgO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGltZXJFbGVtZW50LnN0eWxlID0gYGNvbG9yOiBibGFjaztgO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHN0b3AoKSB7XG4gICAgdGhpcy5faXNBY3RpdmUgPSBmYWxzZTtcbiAgfVxuXG4gIHN0YXRpYyBnZXRUaW1lRm9ybWF0dGVkKHRpbWUpIHtcbiAgICBjb25zdCBSRUdFWCA9IC9eXFxkJC87XG4gICAgbGV0IG1pbiA9IGBgICsgTWF0aC5mbG9vcih0aW1lIC8gMTAwMCAvIDYwKTtcbiAgICBsZXQgc2VjID0gYGAgKyBNYXRoLmZsb29yKCh0aW1lIC0gKG1pbiAqIDEwMDAgKiA2MCkpIC8gMTAwMCk7XG4gICAgaWYgKFJFR0VYLnRlc3Qoc2VjKSkge1xuICAgICAgc2VjID0gYDAke3NlY31gO1xuICAgIH1cbiAgICBpZiAoUkVHRVgudGVzdChtaW4pKSB7XG4gICAgICBtaW4gPSBgMCR7bWlufWA7XG4gICAgfVxuICAgIHJldHVybiBgJHttaW59OiR7c2VjfWA7XG4gIH1cbn1cbiIsImltcG9ydCBjb25maWcgZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGl2ZXNCbG9ja1ZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKGxpdmVzKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmxpdmVzID0gbGl2ZXM7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgbGV0IHJlc3VsdCA9IGBgO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29uZmlnLkxJVkVTX0NPVU5UOyBpKyspIHtcbiAgICAgIHJlc3VsdCArPSBgPGltZyBzcmM9XCJpbWcvaGVhcnRfXyR7KHRoaXMubGl2ZXMgPiAwKSA/IGBmdWxsYCA6IGBlbXB0eWB9LnN2Z1wiIGNsYXNzPVwiZ2FtZV9faGVhcnRcIiBhbHQ9XCJMaWZlXCIgd2lkdGg9XCIzMVwiIGhlaWdodD1cIjI3XCI+YDtcbiAgICAgIHRoaXMubGl2ZXMtLTtcbiAgICB9XG4gICAgcmV0dXJuIGA8ZGl2IGNsYXNzPVwiZ2FtZV9fbGl2ZXNcIj4ke3Jlc3VsdH08L2Rpdj5gO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBoZWFkZXIuaGVhZGVyYCk7XG4gICAgY29uc3Qgb2xkRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYGRpdi5nYW1lX19saXZlc2ApO1xuICAgIHBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQob2xkRWxlbWVudCk7XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YXRzQmxvY2tWaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcihhbnN3ZXJzKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmFuc3dlcnMgPSBhbnN3ZXJzO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIGxldCByZXN1bHQgPSBgYDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICAgIGNvbnN0IGFuc3dlciA9IHRoaXMuYW5zd2Vyc1tpXTtcbiAgICAgIGxldCBtb2RpZmllciA9IGBgO1xuICAgICAgaWYgKGFuc3dlcikge1xuICAgICAgICBpZiAoYW5zd2VyLmlzT0spIHtcbiAgICAgICAgICBtb2RpZmllciA9IGBjb3JyZWN0YDtcbiAgICAgICAgICBpZiAoYW5zd2VyLnRpbWUgPCAxMCkge1xuICAgICAgICAgICAgbW9kaWZpZXIgPSBgZmFzdGA7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChhbnN3ZXIudGltZSA+IDIwKSB7XG4gICAgICAgICAgICBtb2RpZmllciA9IGBzbG93YDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbW9kaWZpZXIgPSBgd3JvbmdgO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtb2RpZmllciA9IGB1bmtub3duYDtcbiAgICAgIH1cbiAgICAgIHJlc3VsdCArPSBgPGxpIGNsYXNzPVwic3RhdHNfX3Jlc3VsdCBzdGF0c19fcmVzdWx0LS0ke21vZGlmaWVyfVwiPjwvbGk+YDtcbiAgICB9XG4gICAgcmV0dXJuIGA8dWwgY2xhc3M9XCJzdGF0c1wiPiR7cmVzdWx0fTwvdWw+YDtcbn1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYHNlY3Rpb24uZ2FtZWApO1xuICAgIGNvbnN0IG9sZEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGB1bC5zdGF0c2ApO1xuICAgIHBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQob2xkRWxlbWVudCk7XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG59XG4iLCJjb25zdCBERUJVR19PTiA9IHRydWU7XG5jb25zdCBTVFlMRSA9IGBzdHlsZT1cImJveC1zaGFkb3c6IDBweCAwcHggMTBweCAxMnB4IHJnYmEoMTksMTczLDI0LDEpO1wiYDtcblxuZnVuY3Rpb24gaXNQaG90byhhbnN3ZXIpIHtcbiAgcmV0dXJuIChERUJVR19PTiAmJiBhbnN3ZXIgPT09IGBwaG90b2ApID8gU1RZTEUgOiBgYDtcbn1cblxuZnVuY3Rpb24gaXNQYWludChhbnN3ZXIpIHtcbiAgcmV0dXJuIChERUJVR19PTiAmJiBhbnN3ZXIgPT09IGBwYWludGApID8gU1RZTEUgOiBgYDtcbn1cblxuZnVuY3Rpb24gaXNDb3JyZWN0KGlzQ29ycmVjdCkge1xuICByZXR1cm4gKERFQlVHX09OICYmIGlzQ29ycmVjdCkgPyBTVFlMRSA6IGBgO1xufVxuXG5leHBvcnQgZGVmYXVsdCB7aXNQaG90bywgaXNQYWludCwgaXNDb3JyZWN0fTtcbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcbmltcG9ydCBkZWJ1ZyBmcm9tICcuLi9kZWJ1Zy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFuc3dlclBob3RvQnV0dG9uVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IocXVlc3Rpb25JbmRleCwgZ2FtZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5xdWVzdGlvbkluZGV4ID0gcXVlc3Rpb25JbmRleDtcbiAgICB0aGlzLmNvcnJlY3RBbnN3ZXIgPSBnYW1lLnF1ZXN0aW9uc1t0aGlzLnF1ZXN0aW9uSW5kZXhdLmNvcnJlY3RBbnN3ZXI7XG4gICAgdGhpcy5nYW1lSW5kZXggPSBnYW1lLmdhbWVJbmRleDtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gYDxsYWJlbCBjbGFzcz1cImdhbWVfX2Fuc3dlciBnYW1lX19hbnN3ZXItLXBob3RvXCI+XG4gICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInZpc3VhbGx5LWhpZGRlblwiIG5hbWU9XCJxdWVzdGlvbiAke3RoaXMucXVlc3Rpb25JbmRleH1cIiB0eXBlPVwicmFkaW9cIiB2YWx1ZT1cInBob3RvXCIgZGF0YS1nYW1laW5kZXg9XCIke3RoaXMuZ2FtZUluZGV4fVwiIGRhdGEtcXVlc3Rpb25pbmRleD1cIiR7dGhpcy5xdWVzdGlvbkluZGV4fVwiPlxuICAgICAgICAgICAgICA8c3BhbiAke2RlYnVnLmlzUGhvdG8odGhpcy5jb3JyZWN0QW5zd2VyKX0+0KTQvtGC0L48L3NwYW4+XG4gICAgICAgICAgICA8L2xhYmVsPmA7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2Rpdi5nYW1lX19vcHRpb24nKVt0aGlzLnF1ZXN0aW9uSW5kZXhdO1xuICAgIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIGJpbmQoY2IpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnZGl2LmdhbWVfX29wdGlvbicpW3RoaXMucXVlc3Rpb25JbmRleF07XG4gICAgY29uc3QgYW5zd2VyRWxlbWVudCA9IHBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcihgLmdhbWVfX2Fuc3dlci0tcGhvdG8gPiBpbnB1dGApO1xuICAgIGFuc3dlckVsZW1lbnQuY2hlY2tlZCA9IGZhbHNlO1xuICAgIGFuc3dlckVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihgY2xpY2tgLCBjYik7XG4gIH1cbn1cbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcbmltcG9ydCBkZWJ1ZyBmcm9tICcuLi9kZWJ1Zy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFuc3dlclBhaW50QnV0dG9uVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IocXVlc3Rpb25JbmRleCwgZ2FtZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5xdWVzdGlvbkluZGV4ID0gcXVlc3Rpb25JbmRleDtcbiAgICB0aGlzLmNvcnJlY3RBbnN3ZXIgPSBnYW1lLnF1ZXN0aW9uc1t0aGlzLnF1ZXN0aW9uSW5kZXhdLmNvcnJlY3RBbnN3ZXI7XG4gICAgdGhpcy5nYW1lSW5kZXggPSBnYW1lLmdhbWVJbmRleDtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gYDxsYWJlbCBjbGFzcz1cImdhbWVfX2Fuc3dlciBnYW1lX19hbnN3ZXItLXBhaW50XCI+XG4gICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInZpc3VhbGx5LWhpZGRlblwiIG5hbWU9XCJxdWVzdGlvbiAke3RoaXMucXVlc3Rpb25JbmRleH1cIiB0eXBlPVwicmFkaW9cIiB2YWx1ZT1cInBhaW50XCIgZGF0YS1nYW1laW5kZXg9XCIke3RoaXMuZ2FtZUluZGV4fVwiIGRhdGEtcXVlc3Rpb25pbmRleD1cIiR7dGhpcy5xdWVzdGlvbkluZGV4fVwiPlxuICAgICAgICAgICAgICA8c3BhbiAke2RlYnVnLmlzUGFpbnQodGhpcy5jb3JyZWN0QW5zd2VyKX0+0KDQuNGB0YPQvdC+0Lo8L3NwYW4+XG4gICAgICAgICAgICA8L2xhYmVsPmA7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2Rpdi5nYW1lX19vcHRpb24nKVt0aGlzLnF1ZXN0aW9uSW5kZXhdO1xuICAgIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIGJpbmQoY2IpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnZGl2LmdhbWVfX29wdGlvbicpW3RoaXMucXVlc3Rpb25JbmRleF07XG4gICAgY29uc3QgYW5zd2VyRWxlbWVudCA9IHBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcihgLmdhbWVfX2Fuc3dlci0tcGFpbnQgPiBpbnB1dGApO1xuICAgIGFuc3dlckVsZW1lbnQuY2hlY2tlZCA9IGZhbHNlO1xuICAgIGFuc3dlckVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihgY2xpY2tgLCBjYik7XG4gIH1cbn1cbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcbmltcG9ydCBkZWJ1ZyBmcm9tICcuLi9kZWJ1Zy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFuc3dlclBhaW50T3B0aW9uVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoYW5zd2VySW5kZXgsIGdhbWUpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuYW5zd2VySW5kZXggPSBhbnN3ZXJJbmRleDtcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xuICAgIHRoaXMuY29ycmVjdEFuc3dlciA9IGdhbWUucXVlc3Rpb25zWzBdLmNvcnJlY3RBbnN3ZXI7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuIGA8ZGl2IGNsYXNzPVwiZ2FtZV9fb3B0aW9uXCIgZGF0YS1hbnN3ZXI9XCIke3RoaXMuYW5zd2VySW5kZXh9XCIgZGF0YS1nYW1laW5kZXg9XCIke3RoaXMuZ2FtZS5nYW1lSW5kZXh9XCIgJHtkZWJ1Zy5pc0NvcnJlY3QodGhpcy5jb3JyZWN0QW5zd2VyID09PSB0aGlzLmFuc3dlckluZGV4KX0+XG4gICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIElNQUdFIC0tPlxuICAgICAgICAgICAgPC9kaXY+YDtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignZm9ybS5nYW1lX19jb250ZW50LS10cmlwbGUnKTtcbiAgICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XG4gIH1cblxuICBiaW5kKGNiKSB7XG4gICAgY29uc3QgYW5zd2VyRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYC5nYW1lX19vcHRpb25gKVt0aGlzLmFuc3dlckluZGV4XTtcbiAgICBhbnN3ZXJFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoYGNsaWNrYCwgY2IpO1xuICB9XG59XG4iLCIvLyBNYW5hZ2luZyBzaXplXG4vLyBAcGFyYW0gIHtvYmplY3R9IGZyYW1lINC+0L/QuNGB0YvQstCw0LXRgiDRgNCw0LfQvNC10YDRiyDRgNCw0LzQutC4LCDQsiDQutC+0YLQvtGA0YvQtSDQtNC+0LvQttC90L4g0LHRi9GC0Ywg0LLQv9C40YHQsNC90L4g0LjQt9C+0LHRgNCw0LbQtdC90LjQtVxuLy8gQHBhcmFtICB7b2JqZWN0fSBnaXZlbiDQvtC/0LjRgdGL0LLQsNC10YIg0YDQsNC30LzQtdGA0Ysg0LjQt9C+0LHRgNCw0LbQtdC90LjRjywg0LrQvtGC0L7RgNGL0LUg0L3Rg9C20L3QviDQv9C+0LTQvtCz0L3QsNGC0Ywg0L/QvtC0INGA0LDQvNC60YNcbi8vIEByZXR1cm4ge29iamVjdH0g0L3QvtCy0YvQuSDQvtCx0YrQtdC60YIsINC60L7RgtC+0YDRi9C5INCx0YPQtNC10YIg0YHQvtC00LXRgNC20LDRgtGMINC40LfQvNC10L3RkdC90L3Ri9C1INGA0LDQt9C80LXRgNGLINC40LfQvtCx0YDQsNC20LXQvdC40Y9cbmV4cG9ydCBkZWZhdWx0ICBmdW5jdGlvbiByZXNpemUoZnJhbWUsIGdpdmVuKSB7XG4gIGxldCB3aWR0aCA9IGdpdmVuLndpZHRoO1xuICBsZXQgaGVpZ2h0ID0gZ2l2ZW4uaGVpZ2h0O1xuICBpZiAod2lkdGggPiBmcmFtZS53aWR0aCkge1xuICAgIGNvbnN0IG11bHRpcGxpZXIgPSB3aWR0aCAvIGZyYW1lLndpZHRoO1xuICAgIHdpZHRoID0gZnJhbWUud2lkdGg7XG4gICAgaGVpZ2h0ID0gTWF0aC5mbG9vcihoZWlnaHQgLyBtdWx0aXBsaWVyKTtcbiAgfVxuICBpZiAoaGVpZ2h0ID4gZnJhbWUuaGVpZ2h0KSB7XG4gICAgY29uc3QgbXVsdGlwbGllciA9IGhlaWdodCAvIGZyYW1lLmhlaWdodDtcbiAgICBoZWlnaHQgPSBmcmFtZS5oZWlnaHQ7XG4gICAgd2lkdGggPSBNYXRoLmZsb29yKHdpZHRoIC8gbXVsdGlwbGllcik7XG4gIH1cbiAgcmV0dXJuIHt3aWR0aCwgaGVpZ2h0fTtcbn1cbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcbmltcG9ydCByZXNpemUgZnJvbSBcIi4uL3Jlc2l6ZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbWFnZVZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKHF1ZXN0aW9uTnVtYmVyLCBnYW1lKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnF1ZXN0aW9uTnVtYmVyID0gcXVlc3Rpb25OdW1iZXI7XG4gICAgdGhpcy5nYW1lID0gZ2FtZTtcbiAgICBpZiAoZ2FtZS5nYW1lVHlwZSA9PT0gMykge1xuICAgICAgdGhpcy5pbWcgPSBnYW1lLnF1ZXN0aW9uc1swXS5pbWdbdGhpcy5xdWVzdGlvbk51bWJlcl07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaW1nID0gZ2FtZS5xdWVzdGlvbnNbdGhpcy5xdWVzdGlvbk51bWJlcl0uaW1nWzBdO1xuICAgIH1cbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICBjb25zdCBpbWdTaXplID0gcmVzaXplKHRoaXMuZ2FtZS5mcmFtZVNpemUsIHRoaXMuaW1nLnNpemUpO1xuICAgIHJldHVybiBgPGltZyBzcmM9XCIke3RoaXMuaW1nLnNyY31cIiBhbHQ9XCJPcHRpb24gJHt0aGlzLnF1ZXN0aW9uTnVtYmVyICsgMX1cIiB3aWR0aD1cIiR7aW1nU2l6ZS53aWR0aH1cIiBoZWlnaHQ9XCIke2ltZ1NpemUuaGVpZ2h0fVwiPmA7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2Rpdi5nYW1lX19vcHRpb24nKVt0aGlzLnF1ZXN0aW9uTnVtYmVyXTtcbiAgICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XG4gIH1cbn1cbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFja0Fycm93VmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gYDxidXR0b24gY2xhc3M9XCJiYWNrXCI+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidmlzdWFsbHktaGlkZGVuXCI+0JLQtdGA0L3Rg9GC0YzRgdGPINC6INC90LDRh9Cw0LvRgzwvc3Bhbj5cbiAgICAgICAgICAgICAgPHN2ZyBjbGFzcz1cImljb25cIiB3aWR0aD1cIjQ1XCIgaGVpZ2h0PVwiNDVcIiB2aWV3Qm94PVwiMCAwIDQ1IDQ1XCIgZmlsbD1cIiMwMDAwMDBcIj5cbiAgICAgICAgICAgICAgICA8dXNlIHhsaW5rOmhyZWY9XCJpbWcvc3ByaXRlLnN2ZyNhcnJvdy1sZWZ0XCI+PC91c2U+XG4gICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgICA8c3ZnIGNsYXNzPVwiaWNvblwiIHdpZHRoPVwiMTAxXCIgaGVpZ2h0PVwiNDRcIiB2aWV3Qm94PVwiMCAwIDEwMSA0NFwiIGZpbGw9XCIjMDAwMDAwXCI+XG4gICAgICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPVwiaW1nL3Nwcml0ZS5zdmcjbG9nby1zbWFsbFwiPjwvdXNlPlxuICAgICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgIDwvYnV0dG9uPmA7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYGhlYWRlci5oZWFkZXJgKTtcbiAgICBwYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZSh0aGlzLmVsZW1lbnQsIHBhcmVudEVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gIH1cblxuICBiaW5kKGNiKSB7XG4gICAgY29uc3QgYmFja0Fycm93ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmJhY2tgKTtcbiAgICBiYWNrQXJyb3cuYWRkRXZlbnRMaXN0ZW5lcihgY2xpY2tgLCBjYik7XG4gIH1cbn1cbiIsImltcG9ydCBjb25maWcgZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCBBYnN0cmFjdFNjcmVlbiBmcm9tICcuLi9hYnN0cmFjdC1zY3JlZW4uanMnO1xuXG5pbXBvcnQgR2FtZVNjcmVlblZpZXcgZnJvbSAnLi9nYW1lLXNjcmVlbi12aWV3LmpzJztcbmltcG9ydCBUaW1lckJsb2NrVmlldyBmcm9tICcuL3RpbWVyLWJsb2NrLXZpZXcuanMnO1xuaW1wb3J0IExpdmVzQmxvY2tWaWV3IGZyb20gJy4vbGl2ZXMtYmxvY2stdmlldy5qcyc7XG5pbXBvcnQgU3RhdHNCbG9ja1ZpZXcgZnJvbSAnLi4vdXRpbC12aWV3cy9zdGF0cy1ibG9jay12aWV3LmpzJztcbmltcG9ydCBBbnN3ZXJQaG90b0J1dHRvblZpZXcgZnJvbSAnLi9hbnN3ZXItcGhvdG8tYnV0dG9uLXZpZXcuanMnO1xuaW1wb3J0IEFuc3dlclBhaW50QnV0dG9uVmlldyBmcm9tICcuL2Fuc3dlci1wYWludC1idXR0b24tdmlldy5qcyc7XG5pbXBvcnQgQW5zd2VyUGFpbnRPcHRpb25WaWV3IGZyb20gJy4vYW5zd2VyLXBhaW50LW9wdGlvbi12aWV3LmpzJztcbmltcG9ydCBJbWFnZVZpZXcgZnJvbSAnLi9pbWFnZS12aWV3LmpzJztcbmltcG9ydCBCYWNrQXJyb3dWaWV3IGZyb20gJy4uL3V0aWwtdmlld3MvYmFjay1hcnJvdy12aWV3LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FtZVNjcmVlbiBleHRlbmRzIEFic3RyYWN0U2NyZWVuIHtcblxuICBjb25zdHJ1Y3RvcihnYW1lTW9kZWwsIGdhbWUpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZ2FtZU1vZGVsID0gZ2FtZU1vZGVsO1xuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XG4gICAgdGhpcy52aWV3ID0gbmV3IEdhbWVTY3JlZW5WaWV3KGdhbWUpO1xuICB9XG5cbiAgX29uU2NyZWVuU2hvdygpIHtcbiAgICBjb25zdCBnYW1lID0gdGhpcy5nYW1lO1xuICAgIGNvbnN0IGdhbWVUeXBlID0gZ2FtZS5nYW1lVHlwZTtcbiAgICBjb25zdCBsaXZlc0Jsb2NrID0gbmV3IExpdmVzQmxvY2tWaWV3KHRoaXMuZ2FtZU1vZGVsLmxpdmVzKTtcbiAgICBjb25zdCBzdGF0c0Jsb2NrID0gbmV3IFN0YXRzQmxvY2tWaWV3KHRoaXMuZ2FtZU1vZGVsLmFuc3dlcnMpO1xuXG4gICAgbGl2ZXNCbG9jay5yZW5kZXIoKTtcbiAgICBzdGF0c0Jsb2NrLnJlbmRlcigpO1xuXG4gICAgdGhpcy50aW1lciA9IG5ldyBUaW1lckJsb2NrVmlldygpO1xuICAgIHRoaXMudGltZXIucmVuZGVyKCk7XG4gICAgdGhpcy5fdGltZXJPbigpO1xuXG4gICAgY29uc3Qgb25FdmVyeUFuc3dlciA9IHRoaXMuX29uRXZlcnlBbnN3ZXIuYmluZCh0aGlzKTtcblxuICAgIGlmIChnYW1lVHlwZSA9PT0gY29uZmlnLkdBTUVfVFlQRS5vbmUpIHtcbiAgICAgIGNvbnN0IGFuc3dlcjFQaG90b0J1dHRvbiA9IG5ldyBBbnN3ZXJQaG90b0J1dHRvblZpZXcoMCwgZ2FtZSk7XG4gICAgICBjb25zdCBhbnN3ZXIxUGFpbnRCdXR0b24gPSBuZXcgQW5zd2VyUGFpbnRCdXR0b25WaWV3KDAsIGdhbWUpO1xuICAgICAgY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2VWaWV3KDAsIGdhbWUpO1xuICAgICAgYW5zd2VyMVBob3RvQnV0dG9uLnJlbmRlcigpO1xuICAgICAgYW5zd2VyMVBhaW50QnV0dG9uLnJlbmRlcigpO1xuICAgICAgaW1hZ2UucmVuZGVyKCk7XG4gICAgICBhbnN3ZXIxUGhvdG9CdXR0b24uYmluZChvbkV2ZXJ5QW5zd2VyKTtcbiAgICAgIGFuc3dlcjFQYWludEJ1dHRvbi5iaW5kKG9uRXZlcnlBbnN3ZXIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZVR5cGUgPT09IGNvbmZpZy5HQU1FX1RZUEUudHdvKSB7XG4gICAgICBjb25zdCBhbnN3ZXIxUGhvdG9CdXR0b24gPSBuZXcgQW5zd2VyUGhvdG9CdXR0b25WaWV3KDAsIGdhbWUpO1xuICAgICAgY29uc3QgYW5zd2VyMVBhaW50QnV0dG9uID0gbmV3IEFuc3dlclBhaW50QnV0dG9uVmlldygwLCBnYW1lKTtcbiAgICAgIGNvbnN0IGltYWdlMSA9IG5ldyBJbWFnZVZpZXcoMCwgZ2FtZSk7XG4gICAgICBjb25zdCBhbnN3ZXIyUGhvdG9CdXR0b24gPSBuZXcgQW5zd2VyUGhvdG9CdXR0b25WaWV3KDEsIGdhbWUpO1xuICAgICAgY29uc3QgYW5zd2VyMlBhaW50QnV0dG9uID0gbmV3IEFuc3dlclBhaW50QnV0dG9uVmlldygxLCBnYW1lKTtcbiAgICAgIGNvbnN0IGltYWdlMiA9IG5ldyBJbWFnZVZpZXcoMSwgZ2FtZSk7XG4gICAgICBhbnN3ZXIxUGhvdG9CdXR0b24ucmVuZGVyKCk7XG4gICAgICBhbnN3ZXIxUGFpbnRCdXR0b24ucmVuZGVyKCk7XG4gICAgICBpbWFnZTEucmVuZGVyKCk7XG4gICAgICBhbnN3ZXIxUGhvdG9CdXR0b24uYmluZChvbkV2ZXJ5QW5zd2VyKTtcbiAgICAgIGFuc3dlcjFQYWludEJ1dHRvbi5iaW5kKG9uRXZlcnlBbnN3ZXIpO1xuICAgICAgYW5zd2VyMlBob3RvQnV0dG9uLnJlbmRlcigpO1xuICAgICAgYW5zd2VyMlBhaW50QnV0dG9uLnJlbmRlcigpO1xuICAgICAgaW1hZ2UyLnJlbmRlcigpO1xuICAgICAgYW5zd2VyMlBob3RvQnV0dG9uLmJpbmQob25FdmVyeUFuc3dlcik7XG4gICAgICBhbnN3ZXIyUGFpbnRCdXR0b24uYmluZChvbkV2ZXJ5QW5zd2VyKTtcbiAgICB9IGVsc2UgaWYgKGdhbWVUeXBlID09PSBjb25maWcuR0FNRV9UWVBFLnRocmVlKSB7XG4gICAgICBjb25zdCBhbnN3ZXIxUGFpbnRPcHRpb25WaWV3ID0gbmV3IEFuc3dlclBhaW50T3B0aW9uVmlldygwLCBnYW1lKTtcbiAgICAgIGNvbnN0IGltYWdlMSA9IG5ldyBJbWFnZVZpZXcoMCwgZ2FtZSk7XG4gICAgICBjb25zdCBhbnN3ZXIyUGFpbnRPcHRpb25WaWV3ID0gbmV3IEFuc3dlclBhaW50T3B0aW9uVmlldygxLCBnYW1lKTtcbiAgICAgIGNvbnN0IGltYWdlMiA9IG5ldyBJbWFnZVZpZXcoMSwgZ2FtZSk7XG4gICAgICBjb25zdCBhbnN3ZXIzUGFpbnRPcHRpb25WaWV3ID0gbmV3IEFuc3dlclBhaW50T3B0aW9uVmlldygyLCBnYW1lKTtcbiAgICAgIGNvbnN0IGltYWdlMyA9IG5ldyBJbWFnZVZpZXcoMiwgZ2FtZSk7XG4gICAgICBhbnN3ZXIxUGFpbnRPcHRpb25WaWV3LnJlbmRlcigpO1xuICAgICAgaW1hZ2UxLnJlbmRlcigpO1xuICAgICAgYW5zd2VyMlBhaW50T3B0aW9uVmlldy5yZW5kZXIoKTtcbiAgICAgIGltYWdlMi5yZW5kZXIoKTtcbiAgICAgIGFuc3dlcjNQYWludE9wdGlvblZpZXcucmVuZGVyKCk7XG4gICAgICBpbWFnZTMucmVuZGVyKCk7XG4gICAgICBhbnN3ZXIxUGFpbnRPcHRpb25WaWV3LmJpbmQob25FdmVyeUFuc3dlcik7XG4gICAgICBhbnN3ZXIyUGFpbnRPcHRpb25WaWV3LmJpbmQob25FdmVyeUFuc3dlcik7XG4gICAgICBhbnN3ZXIzUGFpbnRPcHRpb25WaWV3LmJpbmQob25FdmVyeUFuc3dlcik7XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdGFydEdhbWUgPSB0aGlzLl9yZXN0YXJ0R2FtZS5iaW5kKHRoaXMpO1xuXG4gICAgY29uc3QgYmFja0Fycm93ID0gbmV3IEJhY2tBcnJvd1ZpZXcoKTtcbiAgICBiYWNrQXJyb3cucmVuZGVyKCk7XG4gICAgYmFja0Fycm93LmJpbmQocmVzdGFydEdhbWUpO1xuICB9XG5cbiAgX3RpbWVyT24oKSB7XG4gICAgaWYgKHRoaXMudGltZXIuaXNBY3RpdmUgJiYgdGhpcy50aW1lci50aW1lID4gMCkge1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMudGltZXIudXBkYXRlKCk7XG4gICAgICAgIHRoaXMuX3RpbWVyT24oKTtcbiAgICAgIH0sIDEwMDApO1xuICAgIH1cbiAgICBpZiAodGhpcy50aW1lci50aW1lID09PSAwKSB7XG4gICAgICB0aGlzLl9vblZhbGlkQW5zd2VyKGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICBfb25FdmVyeUFuc3dlcihldnQpIHtcbiAgICBjb25zdCBnYW1lID0gdGhpcy5nYW1lO1xuICAgIGlmIChnYW1lLmdhbWVUeXBlID09PSBjb25maWcuR0FNRV9UWVBFLnRocmVlKSB7XG4gICAgICBjb25zdCBpbnB1dCA9IGV2dC5jdXJyZW50VGFyZ2V0O1xuICAgICAgY29uc3QgZ2FtZUluZGV4ID0gR2FtZVNjcmVlbi5nZXRHYW1lSW5kZXgoaW5wdXQpO1xuICAgICAgY29uc3QgcXVlc3Rpb25JbmRleCA9IDA7XG4gICAgICBjb25zdCBjb3JyZWN0QW5zd2VyID0gdGhpcy5fZ2V0Q29ycmVjdEFuc3dlcihnYW1lSW5kZXgsIHF1ZXN0aW9uSW5kZXgpO1xuICAgICAgY29uc3QgaXNPSyA9ICtpbnB1dC5kYXRhc2V0LmFuc3dlciA9PT0gY29ycmVjdEFuc3dlcjtcbiAgICAgIHRoaXMuX29uVmFsaWRBbnN3ZXIoaXNPSyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGlzQWxsID0gdGhpcy5faXNBbGxBbnN3ZXJzR2l2ZW4oKTtcbiAgICAgIGlmIChpc0FsbCkge1xuICAgICAgICBjb25zdCBpc09LID0gdGhpcy5faXNBbGxBbnN3ZXJzR2l2ZW5Db3JyZWN0KCk7XG4gICAgICAgIHRoaXMuX29uVmFsaWRBbnN3ZXIoaXNPSyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2lzQWxsQW5zd2Vyc0dpdmVuKCkge1xuICAgIGNvbnN0IG9wdGlvbnMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYC5nYW1lX19vcHRpb25gKSk7XG4gICAgcmV0dXJuIG9wdGlvbnMuZXZlcnkoKG9wdGlvbikgPT4ge1xuICAgICAgY29uc3QgYW5zd2VycyA9IEFycmF5LmZyb20ob3B0aW9uLnF1ZXJ5U2VsZWN0b3JBbGwoYC5nYW1lX19hbnN3ZXJgKSk7XG4gICAgICByZXR1cm4gYW5zd2Vycy5zb21lKChhbnN3ZXIpID0+IHtcbiAgICAgICAgY29uc3QgaW5wdXQgPSBhbnN3ZXIucXVlcnlTZWxlY3RvcihgaW5wdXRgKTtcbiAgICAgICAgcmV0dXJuIGlucHV0LmNoZWNrZWQ7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIF9pc0FsbEFuc3dlcnNHaXZlbkNvcnJlY3QoKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgLmdhbWVfX29wdGlvbmApKTtcbiAgICByZXR1cm4gb3B0aW9ucy5ldmVyeSgob3B0aW9uKSA9PiB7XG4gICAgICBjb25zdCBhbnN3ZXJzID0gQXJyYXkuZnJvbShvcHRpb24ucXVlcnlTZWxlY3RvckFsbChgLmdhbWVfX2Fuc3dlcmApKTtcbiAgICAgIHJldHVybiBhbnN3ZXJzLnNvbWUoKGFuc3dlcikgPT4ge1xuICAgICAgICBjb25zdCBpbnB1dCA9IGFuc3dlci5xdWVyeVNlbGVjdG9yKGBpbnB1dGApO1xuICAgICAgICBjb25zdCBnYW1lSW5kZXggPSBHYW1lU2NyZWVuLmdldEdhbWVJbmRleChpbnB1dCk7XG4gICAgICAgIGNvbnN0IHF1ZXN0aW9uSW5kZXggPSBHYW1lU2NyZWVuLmdldFF1ZXN0aW9uSW5kZXgoaW5wdXQpO1xuICAgICAgICBjb25zdCBjb3JyZWN0QW5zd2VyID0gdGhpcy5fZ2V0Q29ycmVjdEFuc3dlcihnYW1lSW5kZXgsIHF1ZXN0aW9uSW5kZXgpO1xuICAgICAgICByZXR1cm4gaW5wdXQuY2hlY2tlZCAmJiBpbnB1dC52YWx1ZSA9PT0gY29ycmVjdEFuc3dlcjtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgX29uVmFsaWRBbnN3ZXIoaXNPSykge1xuICAgIHRoaXMuX3NhdmVBbnN3ZXIoaXNPSyk7XG4gICAgaWYgKCFpc09LKSB7XG4gICAgICB0aGlzLmdhbWVNb2RlbC5taW51c0xpdmUoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuZ2FtZU1vZGVsLmlzR2FtZU92ZXIpIHtcbiAgICAgIHRoaXMuZW5kU2NyZWVuLnNob3coKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5uZXh0U2NyZWVuLnNob3coKTtcbiAgICB9XG4gIH1cblxuICBfZ2V0Q29ycmVjdEFuc3dlcihnYW1lSW5kZXgsIHF1ZXN0aW9uSW5kZXgpIHtcbiAgICByZXR1cm4gdGhpcy5nYW1lTW9kZWwuZ2FtZXNbZ2FtZUluZGV4XS5xdWVzdGlvbnNbcXVlc3Rpb25JbmRleF0uY29ycmVjdEFuc3dlcjtcbiAgfVxuXG4gIF9zYXZlQW5zd2VyKGlzT0spIHtcbiAgICBjb25zdCB0aW1lID0gKGNvbmZpZy5USU1FX1RPX0FOU1dFUiAtIHRoaXMudGltZXIudGltZSkgLyAxMDAwO1xuICAgIHRoaXMudGltZXIuc3RvcCgpO1xuICAgIHRoaXMuZ2FtZU1vZGVsLmFkZEFuc3dlcih7aXNPSywgdGltZX0pO1xuICB9XG5cbiAgc3RhdGljIGdldEdhbWVJbmRleChpbnB1dCkge1xuICAgIHJldHVybiBpbnB1dC5kYXRhc2V0LmdhbWVpbmRleDtcbiAgfVxuXG4gIHN0YXRpYyBnZXRRdWVzdGlvbkluZGV4KGlucHV0KSB7XG4gICAgcmV0dXJuIGlucHV0LmRhdGFzZXQucXVlc3Rpb25pbmRleDtcbiAgfVxuXG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0VBQUEsTUFBTSxNQUFNLEdBQUc7RUFDZixFQUFFLFdBQVcsRUFBRSxFQUFFO0VBQ2pCLEVBQUUsV0FBVyxFQUFFLENBQUM7RUFDaEIsRUFBRSxjQUFjLEVBQUUsS0FBSztFQUN2QixFQUFFLFNBQVMsRUFBRTtFQUNiLElBQUksR0FBRyxFQUFFLENBQUM7RUFDVixJQUFJLEdBQUcsRUFBRSxDQUFDO0VBQ1YsSUFBSSxLQUFLLEVBQUUsQ0FBQztFQUNaLEdBQUc7RUFDSCxDQUFDOztFQ1BjLE1BQU0sWUFBWSxDQUFDO0FBQ2xDO0VBQ0EsRUFBRSxXQUFXLEdBQUcsRUFBRTtBQUNsQjtFQUNBO0VBQ0EsRUFBRSxJQUFJLFFBQVEsR0FBRyxFQUFFO0FBQ25CO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQSxFQUFFLElBQUksT0FBTyxHQUFHO0VBQ2hCLElBQUksTUFBTSxRQUFRLEdBQUcsSUFBSSxD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QUFFO0VBQzNDLE1BQU0sTUFBTSxrQkFBa0IsR0FBRyxJQUFJLHFCQUFxQixDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztFQUNwRSxNQUFNLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7RUFDcEUsTUFBTSxNQUFNLEtBQUssR0FBRyxJQUFJLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7RUFDM0MsTUFBTSxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUNsQyxNQUFNLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ2xDLE1BQU0sS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ3JCLE1BQU0sa0JBQWtCLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0VBQzdDLE1BQU0sa0JBQWtCLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0VBQzdDLEtBQUssTUFBTSxJQUFJLFFBQVEsS0FBSyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTtFQUNsRCxNQUFNLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7RUFDcEUsTUFBTSxNQUFNLGtCQUFrQixHQUFHLElBQUkscUJBQXFCLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0VBQ3BFLE1BQU0sTUFBTSxNQUFNLEdBQUcsSUFBSSxTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0VBQzVDLE1BQU0sTUFBTSxrQkFBa0IsR0FBRyxJQUFJLHFCQUFxQixDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztFQUNwRSxNQUFNLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7RUFDcEUsTUFBTSxNQUFNLE1BQU0sR0FBRyxJQUFJLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7RUFDNUMsTUFB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aUIsQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUM7RUFDL0UsUUFBUSxPQUFPLEtBQUssQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxhQUFhLENBQUM7RUFDOUQsT0FBTyxDQUFDLENBQUM7RUFDVCxLQUFLLENBQUMsQ0FBQztFQUNQLEdBQUc7QUFDSDtFQUNBLEVBQUUsY0FBYyxDQUFDLElBQUksRUFBRTtFQUN2QixJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDM0IsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO0VBQ2YsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDO0VBQ2pDLEtBQUs7RUFDTCxJQUFJLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUU7RUFDbkMsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO0VBQzVCLEtBQUssTUFBTTtFQUNYLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztFQUM3QixLQUFLO0VBQ0wsR0FBRztBQUNIO0VBQ0EsRUFBRSxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsYUFBYSxFQUFFO0VBQzlDLElBQUksT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsYUFBYSxDQUFDO0VBQ2xGLEdBQUc7QUFDSDtFQUNBLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRTtFQUNwQixJQUFJLE1BQU0sSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUM7RUFDbEUsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0VBQ3RCLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztFQUMzQyxHQUFHO0FBQ0g7RUFDQSxFQUFFLE9BQU8sWUFBWSxDQUFDLEtBQUssRUFBRTtFQUM3QixJQUFJLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7RUFDbkMsR0FBRztBQUNIO0VBQ0EsRUFBRSxPQUFPLGdCQUFnQixDQUFDLEtBQUssRUFBRTtFQUNqQyxJQUFJLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUM7RUFDdkMsR0FBRztBQUNIO0VBQ0E7Ozs7Ozs7OyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
