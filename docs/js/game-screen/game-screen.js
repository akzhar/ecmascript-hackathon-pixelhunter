var gameScreen = (function () {
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

  class GameModel {
    constructor() {
      this._playerName = ``;
      this._lives = config.LIVES_COUNT;
      this._games = [];
      this._answers = [];
      this._isGameOver = false;
    }

    set playerName(name) {
      this._playerName = name;
    }

    get lives() {
      return this._lives;
    }

    get answers() {
      return this._answers;
    }

    get games() {
      return this._games;
    }

    get isGameOver() {
      return this._isGameOver;
    }

    reset() {
      this._lives = config.LIVES_COUNT;
      this._answers = [];
      this._isGameOver = false;
    }

    addAnswer(answer) {
      this._answers.push(answer);
    }

    minusLive() {
      if (this._lives === 0) {
        this._isGameOver = true;
      }
      if (this._lives) {
        this._lives--;
      }
    }

    static getCorrectAnswer(game) {
      const question = game.question;
      const isPainting = /\sрисунок\s/.test(question);
      const isPhoto = /\sфото\s/.test(question);
      if (isPainting) return `painting`;
      if (isPhoto) return `photo`
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
                <p class="game__task">${this.game.question}</p>
                ${GameScreenView.getGameContent(this.game.type)}
                <ul class="stats"></ul>
              </section>
            </div>`;
    }

    static getGameContent(gameType) {
      let content = ``;
      if (gameType === config.QuestionType.TINDER_LIKE) {
        content = `<form class="game__content  game__content--wide">
                  <div class="game__option">
                    <!-- PLACE FOR IMAGE -->
                    <!-- PLACE FOR ANSWER PHOTO BUTTON -->
                    <!-- PLACE FOR ANSWER PAINT BUTTON -->
                 </div>
               </form>`;
      } else if (gameType === config.QuestionType.TWO_OF_TWO) {
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
      } else if (gameType === config.QuestionType.ONE_OF_THREE) {
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
          timerElement.style = `color: ${config.COLOR_RED};`;
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

  const STYLE = `style="box-shadow: 0px 0px 10px 12px rgba(19,173,24,1);"`;

  function isPhoto(answer) {
    return ( answer === `photo`) ? STYLE : ``;
  }

  function isPaint(answer) {
    return ( answer === `painting`) ? STYLE : ``;
  }

  function isCorrect(isCorrect) {
    return ( isCorrect) ? STYLE : ``;
  }

  var debug = {isPhoto, isPaint, isCorrect};

  class AnswerPhotoButtonView extends AbstractView {

    constructor(answerIndex, game) {
      super();
      this.game = game;
      this.answerIndex = answerIndex;
      this.answerType = game.answers[answerIndex].type;
    }

    get template() {
      return `<label class="game__answer game__answer--photo">
              <input class="visually-hidden" value="photo" name="question ${this.answerIndex}" type="radio" data-answerindex="${this.answerIndex}">
              <span ${debug.isPhoto(this.answerType)}>Фото</span>
            </label>`;
    }

    render() {
      const parentElement = document.querySelectorAll('div.game__option')[this.answerIndex];
      parentElement.appendChild(this.element);
    }

    bind(cb) {
      const parentElement = document.querySelectorAll('div.game__option')[this.answerIndex];
      const answerElement = parentElement.querySelector(`.game__answer--photo > input`);
      answerElement.checked = false;
      answerElement.addEventListener(`click`, cb);
    }
  }

  class AnswerPaintButtonView extends AbstractView {

    constructor(answerIndex, game) {
      super();
      this.game = game;
      this.answerIndex = answerIndex;
      this.answerType = game.answers[answerIndex].type;
    }

    get template() {
      return `<label class="game__answer game__answer--paint">
              <input class="visually-hidden" value="painting" name="question ${this.answerIndex}" type="radio" data-answerindex="${this.answerIndex}">
              <span ${debug.isPaint(this.answerType)}>Рисунок</span>
            </label>`;
    }

    render() {
      const parentElement = document.querySelectorAll('div.game__option')[this.answerIndex];
      parentElement.appendChild(this.element);
    }

    bind(cb) {
      const parentElement = document.querySelectorAll('div.game__option')[this.answerIndex];
      const answerElement = parentElement.querySelector(`.game__answer--paint > input`);
      answerElement.checked = false;
      answerElement.addEventListener(`click`, cb);
    }
  }

  class AnswerPaintOptionView extends AbstractView {

    constructor(answerIndex, game) {
      super();
      this.game = game;
      this.answerIndex = answerIndex;
      this.answerType = game.answers[answerIndex].type;
    }

    get template() {
      const correctAnswer = GameModel.getCorrectAnswer(this.game);
      return `<div class="game__option" data-answer="${this.answerType}" data-answerindex="${this.answerIndex}" ${debug.isCorrect(this.answerType === correctAnswer)}>
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
  // @param  {object} given описывает ширину и высоту изображения, которое нужно подогнать под рамку
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
      this.gameType = game.type;
      this.image = game.answers[questionNumber].image;
    }

    get template() {
      const frameSize = config.QuestionTypeToFrameSize[this.gameType];
      const imageSize = {width: this.image.width, height: this.image.height};
      const resizedImageSize = resize(frameSize, imageSize);
      return `<img src="${this.image.url}" alt="Option ${this.questionNumber + 1}" width="${resizedImageSize.width}" height="${resizedImageSize.height}">`;
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

    constructor(gameModel, game, index) {
      super();
      this.gameModel = gameModel;
      this.game = game;
      this.gameIndex = index;
      this.view = new GameScreenView(game);
    }

    _onScreenShow() {
      const game = this.game;
      const livesBlock = new LivesBlockView(this.gameModel.lives);
      const statsBlock = new StatsBlockView(this.gameModel.answers);

      livesBlock.render();
      statsBlock.render();

      this.timer = new TimerBlockView();
      this.timer.render();
      this._timerOn();

      const onEveryAnswer = this._onEveryAnswer.bind(this);
      if (game.type === config.QuestionType.TINDER_LIKE) {
        const answer1PhotoButton = new AnswerPhotoButtonView(0, game);
        const answer1PaintButton = new AnswerPaintButtonView(0, game);
        const image = new ImageView(0, game);
        answer1PhotoButton.render();
        answer1PaintButton.render();
        image.render();
        answer1PhotoButton.bind(onEveryAnswer);
        answer1PaintButton.bind(onEveryAnswer);
      } else if (game.type === config.QuestionType.TWO_OF_TWO) {
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
      } else if (game.type === config.QuestionType.ONE_OF_THREE) {
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
      if (this.game.type === config.QuestionType.ONE_OF_THREE) {
        const input = evt.currentTarget;
        const answerIndex = GameScreen.getAnswerIndex(input);
        const actualAnswer = this._getAnswerType(this.gameIndex, answerIndex);
        const correctAnswer = GameModel.getCorrectAnswer(this.game);
        const isOK = actualAnswer === correctAnswer;
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
          const answerIndex = GameScreen.getAnswerIndex(input);
          const actualAnswer = this._getAnswerType(this.gameIndex, answerIndex);
          return input.checked && input.value === actualAnswer;
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

    _getAnswerType(gameIndex, answerIndex) {
      return this.gameModel.games[gameIndex].answers[answerIndex].type;
    }

    _saveAnswer(isOK) {
      const time = (config.TIME_TO_ANSWER - this.timer.time) / 1000;
      this.timer.stop();
      this.gameModel.addAnswer({isOK, time});
    }

    static getAnswerIndex(input) {
      return input.dataset.answerindex;
    }

  }

  return GameScreen;

}());

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZS1zY3JlZW4vZ2FtZS1zY3JlZW4uanMiLCJzb3VyY2VzIjpbInNyYy9qcy9jb25maWcuanMiLCJzcmMvanMvYWJzdHJhY3Qtdmlldy5qcyIsInNyYy9qcy91dGlsLXZpZXdzL2NvbmZpcm0tbW9kYWwtdmlldy5qcyIsInNyYy9qcy9hYnN0cmFjdC1zY3JlZW4uanMiLCJzcmMvanMvZ2FtZS1tb2RlbC9nYW1lLW1vZGVsLmpzIiwic3JjL2pzL2dhbWUtc2NyZWVuL2dhbWUtc2NyZWVuLXZpZXcuanMiLCJzcmMvanMvZ2FtZS1zY3JlZW4vdGltZXItYmxvY2stdmlldy5qcyIsInNyYy9qcy9nYW1lLXNjcmVlbi9saXZlcy1ibG9jay12aWV3LmpzIiwic3JjL2pzL3V0aWwtdmlld3Mvc3RhdHMtYmxvY2stdmlldy5qcyIsInNyYy9qcy9kZWJ1Zy5qcyIsInNyYy9qcy9nYW1lLXNjcmVlbi9hbnN3ZXItcGhvdG8tYnV0dG9uLXZpZXcuanMiLCJzcmMvanMvZ2FtZS1zY3JlZW4vYW5zd2VyLXBhaW50LWJ1dHRvbi12aWV3LmpzIiwic3JjL2pzL2dhbWUtc2NyZWVuL2Fuc3dlci1wYWludC1vcHRpb24tdmlldy5qcyIsInNyYy9qcy9yZXNpemUuanMiLCJzcmMvanMvZ2FtZS1zY3JlZW4vaW1hZ2Utdmlldy5qcyIsInNyYy9qcy91dGlsLXZpZXdzL2JhY2stYXJyb3ctdmlldy5qcyIsInNyYy9qcy9nYW1lLXNjcmVlbi9nYW1lLXNjcmVlbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBjb25maWcgPSB7XG4gIEdFVF9EQVRBX1VSTDogYGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9ha3poYXIvcGl4ZWxodW50ZXIvbWFzdGVyL3NyYy9qcy9nYW1lLW1vZGVsL2RhdGEuanNvbmAsXG4gIFBPU1RfREFUQV9VUkw6IGBodHRwczovL2VjaG8uaHRtbGFjYWRlbXkucnUvYCxcbiAgR0FNRVNfQ09VTlQ6IDEwLFxuICBMSVZFU19DT1VOVDogMyxcbiAgVElNRV9UT19BTlNXRVI6IDMwMDAwLCAvLyAzMCBzZWNcbiAgQ09MT1JfUkVEOiBgI2Q3NDA0MGAsXG4gIEFuc3dlclR5cGU6IHtcbiAgICBQQUlOVElORzogYHBhaW50aW5nYCxcbiAgICBQSE9UTzogYHBob3RvYFxuICB9LFxuICBRdWVzdGlvblR5cGU6IHtcbiAgICBUV09fT0ZfVFdPOiBgdHdvLW9mLXR3b2AsXG4gICAgVElOREVSX0xJS0U6IGB0aW5kZXItbGlrZWAsXG4gICAgT05FX09GX1RIUkVFOiBgb25lLW9mLXRocmVlYFxuICB9LFxuICBRdWVzdGlvblR5cGVUb0ZyYW1lU2l6ZToge1xuICAgICd0d28tb2YtdHdvJzoge3dpZHRoOiA0NjgsIGhlaWdodDogNDU4fSxcbiAgICAndGluZGVyLWxpa2UnOiB7d2lkdGg6IDcwNSwgaGVpZ2h0OiA0NTV9LFxuICAgICdvbmUtb2YtdGhyZWUnOiB7d2lkdGg6IDMwNCwgaGVpZ2h0OiA0NTV9XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNvbmZpZztcbiIsImNvbnN0IGVsZW1lbnRzID0ge307XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIC8vINCy0L7Qt9Cy0YDQsNGJ0LDQtdGCINGB0YLRgNC+0LrRgywg0YHQvtC00LXRgNC20LDRidGD0Y4g0YDQsNC30LzQtdGC0LrRg1xuICBnZXQgdGVtcGxhdGUoKSB7fVxuXG4gIC8vINGB0L7Qt9C00LDQtdGCINC4INCy0L7Qt9Cy0YDQsNGJ0LDQtdGCIERPTS3RjdC70LXQvNC10L3RgiDQvdCwINC+0YHQvdC+0LLQtSDRiNCw0LHQu9C+0L3QsFxuICAvLyDQtNC+0LvQttC10L0g0YHQvtC30LTQsNCy0LDRgtGMIERPTS3RjdC70LXQvNC10L3RgiDRgSDQv9C+0LzQvtGJ0YzRjiDQvNC10YLQvtC00LAgcmVuZGVyLCDQtNC+0LHQsNCy0LvRj9GC0Ywg0LXQvNGDINC+0LHRgNCw0LHQvtGC0YfQuNC60LgsINGBINC/0L7QvNC+0YnRjNGOINC80LXRgtC+0LTQsCBiaW5kINC4INCy0L7Qt9Cy0YDQsNGJ0LDRgtGMINGB0L7Qt9C00LDQvdC90YvQuSDRjdC70LXQvNC10L3RglxuICAvLyDQnNC10YLQvtC0INC00L7Qu9C20LXQvSDQuNGB0L/QvtC70YzQt9C+0LLQsNGC0Ywg0LvQtdC90LjQstGL0LUg0LLRi9GH0LjRgdC70LXQvdC40Y8g4oCUINGN0LvQtdC80LXQvdGCINC00L7Qu9C20LXQvSDRgdC+0LfQtNCw0LLQsNGC0YzRgdGPINC/0YDQuCDQv9C10YDQstC+0Lwg0L7QsdGA0LDRidC10L3QuNC4INC6INCz0LXRgtGC0LXRgCDRgSDQv9C+0LzQvtGJ0YzRjiDQvNC10YLQvtC00LAgcmVuZGVyLCDQtNC+0LvQttC90Ysg0LTQvtCx0LDQstC70Y/RgtGM0YHRjyDQvtCx0YDQsNCx0L7RgtGH0LjQutC4ICjQvNC10YLQvtC0IGJpbmQpLlxuICAvLyDQn9GA0Lgg0L/QvtGB0LvQtdC00YPRjtGJ0LjRhSDQvtCx0YDQsNGJ0LXQvdC40Y/RhSDQtNC+0LvQttC10L0g0LjRgdC/0L7Qu9GM0LfQvtCy0LDRgtGM0YHRjyDRjdC70LXQvNC10L3Rgiwg0YHQvtC30LTQsNC90L3Ri9C5INC/0YDQuCDQv9C10YDQstC+0Lwg0LLRi9C30L7QstC1INCz0LXRgtGC0LXRgNCwLlxuICBnZXQgZWxlbWVudCgpIHtcbiAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMudGVtcGxhdGU7XG4gICAgLy8gaWYgKCFlbGVtZW50cy5oYXNPd25Qcm9wZXJ0eSh0ZW1wbGF0ZSkpIHtcbiAgICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoYGRpdmApO1xuICAgICAgZGl2LmlubmVySFRNTCA9IHRlbXBsYXRlO1xuICAgICAgY29uc3QgZWxlbSA9IGRpdi5maXJzdENoaWxkO1xuICAgICAgZWxlbWVudHNbdGVtcGxhdGVdID0gZWxlbTtcbiAgICAgIHJldHVybiBlbGVtO1xuICAgIC8vIH0gZWxzZSB7XG4gICAgICAvLyByZXR1cm4gZWxlbWVudHNbdGVtcGxhdGVdO1xuICAgIC8vIH1cbiAgfVxuXG4gIC8vINC+0YLRgNC40YHQvtCy0YvQstCw0LXRgiBET00t0Y3Qu9C10LzQtdC90YIsINC00L7QsdCw0LLQu9GP0LXRgiDQvdC10L7QsdGF0L7QtNC40LzRi9C1INC+0LHRgNCw0LHQvtGC0YfQuNC60LhcbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBtYWluLmNlbnRyYWxgKTtcbiAgICBjb25zdCBvbGRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI21haW5gKTtcbiAgICBwYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKG9sZEVsZW1lbnQpO1xuICAgIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIC8vINC00L7QsdCw0LLQu9GP0LXRgiDQvtCx0YDQsNCx0L7RgtGH0LjQutC4INGB0L7QsdGL0YLQuNC5XG4gIC8vINCc0LXRgtC+0LQg0L/QviDRg9C80L7Qu9GH0LDQvdC40Y4g0L3QuNGH0LXQs9C+INC90LUg0LTQtdC70LDQtdGCXG4gIC8vINCV0YHQu9C4INC90YPQttC90L4g0L7QsdGA0LDQsdC+0YLQsNGC0Ywg0LrQsNC60L7QtS3RgtC+INGB0L7QsdGL0YLQuNC1LCDRgtC+INGN0YLQvtGCINC80LXRgtC+0LQg0LTQvtC70LbQtdC9INCx0YvRgtGMINC/0LXRgNC10L7Qv9GA0LXQtNC10LvRkdC9INCyINC90LDRgdC70LXQtNC90LjQutC1INGBINC90LXQvtCx0YXQvtC00LjQvNC+0Lkg0LvQvtCz0LjQutC+0LlcbiAgYmluZCgpIHt9XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbmZpcm1Nb2RhbFZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuIGA8c2VjdGlvbiBjbGFzcz1cIm1vZGFsXCI+XG4gICAgICAgICAgICAgIDxmb3JtIGNsYXNzPVwibW9kYWxfX2lubmVyXCI+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cIm1vZGFsX19jbG9zZVwiIHR5cGU9XCJidXR0b25cIj5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidmlzdWFsbHktaGlkZGVuXCI+0JfQsNC60YDRi9GC0Yw8L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPGgyIGNsYXNzPVwibW9kYWxfX3RpdGxlXCI+0J/QvtC00YLQstC10YDQttC00LXQvdC40LU8L2gyPlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwibW9kYWxfX3RleHRcIj7QktGLINGD0LLQtdGA0LXQvdGLINGH0YLQviDRhdC+0YLQuNGC0LUg0L3QsNGH0LDRgtGMINC40LPRgNGDINC30LDQvdC+0LLQvj88L3A+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsX19idXR0b24td3JhcHBlclwiPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cIm1vZGFsX19idG4gbW9kYWxfX2J0bi0tb2tcIj7QntC6PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwibW9kYWxfX2J0biBtb2RhbF9fYnRuLS1jYW5jZWxcIj7QntGC0LzQtdC90LA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgPC9zZWN0aW9uPmA7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCNtYWluYCk7XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgYmluZChjYikge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjbWFpbmApO1xuICAgIGNvbnN0IG1vZGFsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLm1vZGFsYCk7XG4gICAgY29uc3QgY2xvc2VCdG4gPSBtb2RhbC5xdWVyeVNlbGVjdG9yKGAubW9kYWxfX2Nsb3NlYCk7XG4gICAgY29uc3QgY2FuY2VsQnRuID0gbW9kYWwucXVlcnlTZWxlY3RvcihgLm1vZGFsX19idG4tLWNhbmNlbGApO1xuICAgIGNvbnN0IG9rQnRuID0gbW9kYWwucXVlcnlTZWxlY3RvcihgLm1vZGFsX19idG4tLW9rYCk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihga2V5ZG93bmAsIChldnQpID0+IHtcbiAgICAgIGlmIChldnQua2V5Q29kZSA9PT0gMjcpIHtcbiAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQobW9kYWwpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGNsb3NlQnRuLmFkZEV2ZW50TGlzdGVuZXIoYGNsaWNrYCwgKGV2dCkgPT4ge1xuICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBwYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKG1vZGFsKTtcbiAgICB9KTtcbiAgICBjYW5jZWxCdG4uYWRkRXZlbnRMaXN0ZW5lcihgY2xpY2tgLCAoZXZ0KSA9PiB7XG4gICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQobW9kYWwpO1xuICAgIH0pO1xuICAgIG9rQnRuLmFkZEV2ZW50TGlzdGVuZXIoYGNsaWNrYCwgKGV2dCkgPT4ge1xuICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBjYigpO1xuICAgIH0pO1xuICB9XG59XG4iLCJpbXBvcnQgQ29uZmlybU1vZGFsVmlldyBmcm9tICcuL3V0aWwtdmlld3MvY29uZmlybS1tb2RhbC12aWV3LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWJzdHJhY3RTY3JlZW4ge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZ2FtZU1vZGVsID0gbnVsbDtcbiAgICB0aGlzLmdhbWUgPSBudWxsO1xuICAgIHRoaXMudmlldyA9IG51bGw7XG4gICAgdGhpcy50aW1lciA9IG51bGw7XG4gICAgdGhpcy5zdGFydFNjcmVlbiA9IG51bGw7XG4gICAgdGhpcy5uZXh0U2NyZWVuID0gbnVsbDtcbiAgICB0aGlzLmVuZFNjcmVlbiA9IG51bGw7XG4gIH1cblxuICAvLyDQvNC10YLQvtC0INC/0L7QutCw0LfQsCDRjdC60YDQsNC90LAg0L7RgtGA0LjRgdC+0LLRi9Cy0LDQtdGCINGN0LrRgNCw0L0g0Lgg0LfQsNC/0YPRgdC60LDQtdGCINC80LXRgtC+0LQgX29uU2NyZWVuU2hvd1xuICBzaG93KCkge1xuICAgIHRoaXMudmlldy5yZW5kZXIoKTtcbiAgICB0aGlzLl9vblNjcmVlblNob3coKTtcbiAgfVxuXG4gIC8vINC80LXRgtC+0LQg0YDQtdCw0LvQuNC30YPQtdGCINCx0LjQt9C90LXRgSDQu9C+0LPQuNC60YMg0Y3QutGA0LDQvdCwXG4gIF9vblNjcmVlblNob3coKSB7fVxuXG4gIC8vINC80LXRgtC+0LQg0L/QtdGA0LXQt9Cw0L/Rg9GB0LrQsNC10YIg0LjQs9GA0YNcbiAgX3Jlc3RhcnRHYW1lKCkge1xuICAgIGNvbnN0IGNvbmZpcm1Nb2RhbCA9IG5ldyBDb25maXJtTW9kYWxWaWV3KCk7XG4gICAgY29uZmlybU1vZGFsLnJlbmRlcigpO1xuICAgIGNvbmZpcm1Nb2RhbC5iaW5kKCgpID0+IHtcbiAgICAgIHRoaXMuZ2FtZU1vZGVsLnJlc2V0KCk7XG4gICAgICB0aGlzLnN0YXJ0U2NyZWVuLnNob3coKTtcbiAgICAgIGlmICh0aGlzLnRpbWVyKSB7XG4gICAgICAgIHRoaXMudGltZXIuc3RvcCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG4iLCJpbXBvcnQgY29uZmlnIGZyb20gJy4uL2NvbmZpZy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdhbWVNb2RlbCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3BsYXllck5hbWUgPSBgYDtcbiAgICB0aGlzLl9saXZlcyA9IGNvbmZpZy5MSVZFU19DT1VOVDtcbiAgICB0aGlzLl9nYW1lcyA9IFtdO1xuICAgIHRoaXMuX2Fuc3dlcnMgPSBbXTtcbiAgICB0aGlzLl9pc0dhbWVPdmVyID0gZmFsc2U7XG4gIH1cblxuICBzZXQgcGxheWVyTmFtZShuYW1lKSB7XG4gICAgdGhpcy5fcGxheWVyTmFtZSA9IG5hbWU7XG4gIH1cblxuICBnZXQgbGl2ZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xpdmVzO1xuICB9XG5cbiAgZ2V0IGFuc3dlcnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2Fuc3dlcnM7XG4gIH1cblxuICBnZXQgZ2FtZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dhbWVzO1xuICB9XG5cbiAgZ2V0IGlzR2FtZU92ZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzR2FtZU92ZXI7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB0aGlzLl9saXZlcyA9IGNvbmZpZy5MSVZFU19DT1VOVDtcbiAgICB0aGlzLl9hbnN3ZXJzID0gW107XG4gICAgdGhpcy5faXNHYW1lT3ZlciA9IGZhbHNlO1xuICB9XG5cbiAgYWRkQW5zd2VyKGFuc3dlcikge1xuICAgIHRoaXMuX2Fuc3dlcnMucHVzaChhbnN3ZXIpO1xuICB9XG5cbiAgbWludXNMaXZlKCkge1xuICAgIGlmICh0aGlzLl9saXZlcyA9PT0gMCkge1xuICAgICAgdGhpcy5faXNHYW1lT3ZlciA9IHRydWU7XG4gICAgfVxuICAgIGlmICh0aGlzLl9saXZlcykge1xuICAgICAgdGhpcy5fbGl2ZXMtLTtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgZ2V0Q29ycmVjdEFuc3dlcihnYW1lKSB7XG4gICAgY29uc3QgcXVlc3Rpb24gPSBnYW1lLnF1ZXN0aW9uO1xuICAgIGNvbnN0IGlzUGFpbnRpbmcgPSAvXFxz0YDQuNGB0YPQvdC+0LpcXHMvLnRlc3QocXVlc3Rpb24pO1xuICAgIGNvbnN0IGlzUGhvdG8gPSAvXFxz0YTQvtGC0L5cXHMvLnRlc3QocXVlc3Rpb24pO1xuICAgIGlmIChpc1BhaW50aW5nKSByZXR1cm4gYHBhaW50aW5nYDtcbiAgICBpZiAoaXNQaG90bykgcmV0dXJuIGBwaG90b2BcbiAgfVxuXG59XG4iLCJpbXBvcnQgY29uZmlnIGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdhbWVTY3JlZW5WaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcihnYW1lKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPGRpdiBpZD1cIm1haW5cIiBjbGFzcz1cImNlbnRyYWxfX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgPGhlYWRlciBjbGFzcz1cImhlYWRlclwiPlxuICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgVE8gQkFDSyBBUlJPVyAtLT5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ2FtZV9fdGltZXJcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ2FtZV9fbGl2ZXNcIj48L2Rpdj5cbiAgICAgICAgICAgICAgPC9oZWFkZXI+XG4gICAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzPVwiZ2FtZVwiPlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwiZ2FtZV9fdGFza1wiPiR7dGhpcy5nYW1lLnF1ZXN0aW9ufTwvcD5cbiAgICAgICAgICAgICAgICAke0dhbWVTY3JlZW5WaWV3LmdldEdhbWVDb250ZW50KHRoaXMuZ2FtZS50eXBlKX1cbiAgICAgICAgICAgICAgICA8dWwgY2xhc3M9XCJzdGF0c1wiPjwvdWw+XG4gICAgICAgICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgICAgIDwvZGl2PmA7XG4gIH1cblxuICBzdGF0aWMgZ2V0R2FtZUNvbnRlbnQoZ2FtZVR5cGUpIHtcbiAgICBsZXQgY29udGVudCA9IGBgO1xuICAgIGlmIChnYW1lVHlwZSA9PT0gY29uZmlnLlF1ZXN0aW9uVHlwZS5USU5ERVJfTElLRSkge1xuICAgICAgY29udGVudCA9IGA8Zm9ybSBjbGFzcz1cImdhbWVfX2NvbnRlbnQgIGdhbWVfX2NvbnRlbnQtLXdpZGVcIj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJnYW1lX19vcHRpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgSU1BR0UgLS0+XG4gICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIEFOU1dFUiBQSE9UTyBCVVRUT04gLS0+XG4gICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIEFOU1dFUiBQQUlOVCBCVVRUT04gLS0+XG4gICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgPC9mb3JtPmA7XG4gICAgfSBlbHNlIGlmIChnYW1lVHlwZSA9PT0gY29uZmlnLlF1ZXN0aW9uVHlwZS5UV09fT0ZfVFdPKSB7XG4gICAgICBjb250ZW50ID0gYDxmb3JtIGNsYXNzPVwiZ2FtZV9fY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJnYW1lX19vcHRpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIElNQUdFIC0tPlxuICAgICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgQU5TV0VSIFBIT1RPIEJVVFRPTiAtLT5cbiAgICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIEFOU1dFUiBQQUlOVCBCVVRUT04gLS0+XG4gICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdhbWVfX29wdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgSU1BR0UgLS0+XG4gICAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBBTlNXRVIgUEhPVE8gQlVUVE9OIC0tPlxuICAgICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgQU5TV0VSIFBBSU5UIEJVVFRPTiAtLT5cbiAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgPC9mb3JtPmA7XG4gICAgfSBlbHNlIGlmIChnYW1lVHlwZSA9PT0gY29uZmlnLlF1ZXN0aW9uVHlwZS5PTkVfT0ZfVEhSRUUpIHtcbiAgICAgIGNvbnRlbnQgPSBgPGZvcm0gY2xhc3M9XCJnYW1lX19jb250ZW50ICBnYW1lX19jb250ZW50LS10cmlwbGVcIj5cbiAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBBTlNXRVIgUEFJTlQgT1BUSU9OIC0tPlxuICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIEFOU1dFUiBQQUlOVCBPUFRJT04gLS0+XG4gICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgQU5TV0VSIFBBSU5UIE9QVElPTiAtLT5cbiAgICAgICAgICAgICAgICAgPC9mb3JtPmA7XG4gICAgfVxuICAgIHJldHVybiBjb250ZW50O1xuICB9XG5cbn1cbiIsImltcG9ydCBjb25maWcgZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGltZXJCbG9ja1ZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5faXNBY3RpdmUgPSB0cnVlO1xuICAgIHRoaXMuX3RpbWUgPSBjb25maWcuVElNRV9UT19BTlNXRVI7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgY29uc3QgdGltZSA9IFRpbWVyQmxvY2tWaWV3LmdldFRpbWVGb3JtYXR0ZWQodGhpcy50aW1lKTtcbiAgICByZXR1cm4gYDxkaXYgY2xhc3M9XCJnYW1lX190aW1lclwiPiR7dGltZX08L2Rpdj5gO1xuICB9XG5cbiAgZ2V0IHRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3RpbWU7XG4gIH1cblxuICBzZXQgdGltZShuZXdUaW1lKSB7XG4gICAgdGhpcy5fdGltZSA9IG5ld1RpbWU7XG4gIH1cblxuICBnZXQgaXNBY3RpdmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzQWN0aXZlO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBoZWFkZXIuaGVhZGVyYCk7XG4gICAgcGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUodGhpcy5lbGVtZW50LCBwYXJlbnRFbGVtZW50LmZpcnN0Q2hpbGQpO1xuICB9XG5cbiAgdXBkYXRlKCkge1xuICAgIGlmICh0aGlzLl9pc0FjdGl2ZSAmJiB0aGlzLnRpbWUgPiAwKSB7XG4gICAgICB0aGlzLnRpbWUgPSB0aGlzLnRpbWUgLSAxMDAwO1xuICAgICAgY29uc3QgdGltZSA9IFRpbWVyQmxvY2tWaWV3LmdldFRpbWVGb3JtYXR0ZWQodGhpcy50aW1lKTtcbiAgICAgIGNvbnN0IHRpbWVyRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYGRpdi5nYW1lX190aW1lcmApO1xuICAgICAgdGltZXJFbGVtZW50LnRleHRDb250ZW50ID0gdGltZTtcbiAgICAgIGlmICh0aGlzLnRpbWUgPT09IDUwMDAgfHwgdGhpcy50aW1lID09PSAzMDAwIHx8IHRoaXMudGltZSA9PT0gMTAwMCkge1xuICAgICAgICB0aW1lckVsZW1lbnQuc3R5bGUgPSBgY29sb3I6ICR7Y29uZmlnLkNPTE9SX1JFRH07YDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRpbWVyRWxlbWVudC5zdHlsZSA9IGBjb2xvcjogYmxhY2s7YDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzdG9wKCkge1xuICAgIHRoaXMuX2lzQWN0aXZlID0gZmFsc2U7XG4gIH1cblxuICBzdGF0aWMgZ2V0VGltZUZvcm1hdHRlZCh0aW1lKSB7XG4gICAgY29uc3QgUkVHRVggPSAvXlxcZCQvO1xuICAgIGxldCBtaW4gPSBgYCArIE1hdGguZmxvb3IodGltZSAvIDEwMDAgLyA2MCk7XG4gICAgbGV0IHNlYyA9IGBgICsgTWF0aC5mbG9vcigodGltZSAtIChtaW4gKiAxMDAwICogNjApKSAvIDEwMDApO1xuICAgIGlmIChSRUdFWC50ZXN0KHNlYykpIHtcbiAgICAgIHNlYyA9IGAwJHtzZWN9YDtcbiAgICB9XG4gICAgaWYgKFJFR0VYLnRlc3QobWluKSkge1xuICAgICAgbWluID0gYDAke21pbn1gO1xuICAgIH1cbiAgICByZXR1cm4gYCR7bWlufToke3NlY31gO1xuICB9XG59XG4iLCJpbXBvcnQgY29uZmlnIGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExpdmVzQmxvY2tWaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcihsaXZlcykge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5saXZlcyA9IGxpdmVzO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIGxldCByZXN1bHQgPSBgYDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbmZpZy5MSVZFU19DT1VOVDsgaSsrKSB7XG4gICAgICByZXN1bHQgKz0gYDxpbWcgc3JjPVwiaW1nL2hlYXJ0X18keyh0aGlzLmxpdmVzID4gMCkgPyBgZnVsbGAgOiBgZW1wdHlgfS5zdmdcIiBjbGFzcz1cImdhbWVfX2hlYXJ0XCIgYWx0PVwiTGlmZVwiIHdpZHRoPVwiMzFcIiBoZWlnaHQ9XCIyN1wiPmA7XG4gICAgICB0aGlzLmxpdmVzLS07XG4gICAgfVxuICAgIHJldHVybiBgPGRpdiBjbGFzcz1cImdhbWVfX2xpdmVzXCI+JHtyZXN1bHR9PC9kaXY+YDtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgaGVhZGVyLmhlYWRlcmApO1xuICAgIGNvbnN0IG9sZEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBkaXYuZ2FtZV9fbGl2ZXNgKTtcbiAgICBwYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKG9sZEVsZW1lbnQpO1xuICAgIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxufVxuIiwiaW1wb3J0IGNvbmZpZyBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGF0c0Jsb2NrVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoYW5zd2Vycykge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5hbnN3ZXJzID0gYW5zd2VycztcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICBsZXQgcmVzdWx0ID0gYGA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb25maWcuR0FNRVNfQ09VTlQ7IGkrKykge1xuICAgICAgY29uc3QgYW5zd2VyID0gdGhpcy5hbnN3ZXJzW2ldO1xuICAgICAgbGV0IG1vZGlmaWVyID0gYGA7XG4gICAgICBpZiAoYW5zd2VyKSB7XG4gICAgICAgIGlmIChhbnN3ZXIuaXNPSykge1xuICAgICAgICAgIG1vZGlmaWVyID0gYGNvcnJlY3RgO1xuICAgICAgICAgIGlmIChhbnN3ZXIudGltZSA8IDEwKSB7XG4gICAgICAgICAgICBtb2RpZmllciA9IGBmYXN0YDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGFuc3dlci50aW1lID4gMjApIHtcbiAgICAgICAgICAgIG1vZGlmaWVyID0gYHNsb3dgO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtb2RpZmllciA9IGB3cm9uZ2A7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1vZGlmaWVyID0gYHVua25vd25gO1xuICAgICAgfVxuICAgICAgcmVzdWx0ICs9IGA8bGkgY2xhc3M9XCJzdGF0c19fcmVzdWx0IHN0YXRzX19yZXN1bHQtLSR7bW9kaWZpZXJ9XCI+PC9saT5gO1xuICAgIH1cbiAgICByZXR1cm4gYDx1bCBjbGFzcz1cInN0YXRzXCI+JHtyZXN1bHR9PC91bD5gO1xufVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihgc2VjdGlvbi5nYW1lYCk7XG4gICAgY29uc3Qgb2xkRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYHVsLnN0YXRzYCk7XG4gICAgcGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChvbGRFbGVtZW50KTtcbiAgICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XG4gIH1cbn1cbiIsImNvbnN0IERFQlVHX09OID0gdHJ1ZTtcbmNvbnN0IFNUWUxFID0gYHN0eWxlPVwiYm94LXNoYWRvdzogMHB4IDBweCAxMHB4IDEycHggcmdiYSgxOSwxNzMsMjQsMSk7XCJgO1xuXG5mdW5jdGlvbiBpc1Bob3RvKGFuc3dlcikge1xuICByZXR1cm4gKERFQlVHX09OICYmIGFuc3dlciA9PT0gYHBob3RvYCkgPyBTVFlMRSA6IGBgO1xufVxuXG5mdW5jdGlvbiBpc1BhaW50KGFuc3dlcikge1xuICByZXR1cm4gKERFQlVHX09OICYmIGFuc3dlciA9PT0gYHBhaW50aW5nYCkgPyBTVFlMRSA6IGBgO1xufVxuXG5mdW5jdGlvbiBpc0NvcnJlY3QoaXNDb3JyZWN0KSB7XG4gIHJldHVybiAoREVCVUdfT04gJiYgaXNDb3JyZWN0KSA/IFNUWUxFIDogYGA7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtpc1Bob3RvLCBpc1BhaW50LCBpc0NvcnJlY3R9O1xuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuaW1wb3J0IGRlYnVnIGZyb20gJy4uL2RlYnVnLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQW5zd2VyUGhvdG9CdXR0b25WaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcihhbnN3ZXJJbmRleCwgZ2FtZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5nYW1lID0gZ2FtZTtcbiAgICB0aGlzLmFuc3dlckluZGV4ID0gYW5zd2VySW5kZXg7XG4gICAgdGhpcy5hbnN3ZXJUeXBlID0gZ2FtZS5hbnN3ZXJzW2Fuc3dlckluZGV4XS50eXBlO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPGxhYmVsIGNsYXNzPVwiZ2FtZV9fYW5zd2VyIGdhbWVfX2Fuc3dlci0tcGhvdG9cIj5cbiAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwidmlzdWFsbHktaGlkZGVuXCIgdmFsdWU9XCJwaG90b1wiIG5hbWU9XCJxdWVzdGlvbiAke3RoaXMuYW5zd2VySW5kZXh9XCIgdHlwZT1cInJhZGlvXCIgZGF0YS1hbnN3ZXJpbmRleD1cIiR7dGhpcy5hbnN3ZXJJbmRleH1cIj5cbiAgICAgICAgICAgICAgPHNwYW4gJHtkZWJ1Zy5pc1Bob3RvKHRoaXMuYW5zd2VyVHlwZSl9PtCk0L7RgtC+PC9zcGFuPlxuICAgICAgICAgICAgPC9sYWJlbD5gO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdkaXYuZ2FtZV9fb3B0aW9uJylbdGhpcy5hbnN3ZXJJbmRleF07XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgYmluZChjYikge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdkaXYuZ2FtZV9fb3B0aW9uJylbdGhpcy5hbnN3ZXJJbmRleF07XG4gICAgY29uc3QgYW5zd2VyRWxlbWVudCA9IHBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcihgLmdhbWVfX2Fuc3dlci0tcGhvdG8gPiBpbnB1dGApO1xuICAgIGFuc3dlckVsZW1lbnQuY2hlY2tlZCA9IGZhbHNlO1xuICAgIGFuc3dlckVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihgY2xpY2tgLCBjYik7XG4gIH1cbn1cbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcbmltcG9ydCBkZWJ1ZyBmcm9tICcuLi9kZWJ1Zy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFuc3dlclBhaW50QnV0dG9uVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoYW5zd2VySW5kZXgsIGdhbWUpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XG4gICAgdGhpcy5hbnN3ZXJJbmRleCA9IGFuc3dlckluZGV4O1xuICAgIHRoaXMuYW5zd2VyVHlwZSA9IGdhbWUuYW5zd2Vyc1thbnN3ZXJJbmRleF0udHlwZTtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gYDxsYWJlbCBjbGFzcz1cImdhbWVfX2Fuc3dlciBnYW1lX19hbnN3ZXItLXBhaW50XCI+XG4gICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInZpc3VhbGx5LWhpZGRlblwiIHZhbHVlPVwicGFpbnRpbmdcIiBuYW1lPVwicXVlc3Rpb24gJHt0aGlzLmFuc3dlckluZGV4fVwiIHR5cGU9XCJyYWRpb1wiIGRhdGEtYW5zd2VyaW5kZXg9XCIke3RoaXMuYW5zd2VySW5kZXh9XCI+XG4gICAgICAgICAgICAgIDxzcGFuICR7ZGVidWcuaXNQYWludCh0aGlzLmFuc3dlclR5cGUpfT7QoNC40YHRg9C90L7Qujwvc3Bhbj5cbiAgICAgICAgICAgIDwvbGFiZWw+YDtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnZGl2LmdhbWVfX29wdGlvbicpW3RoaXMuYW5zd2VySW5kZXhdO1xuICAgIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIGJpbmQoY2IpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnZGl2LmdhbWVfX29wdGlvbicpW3RoaXMuYW5zd2VySW5kZXhdO1xuICAgIGNvbnN0IGFuc3dlckVsZW1lbnQgPSBwYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoYC5nYW1lX19hbnN3ZXItLXBhaW50ID4gaW5wdXRgKTtcbiAgICBhbnN3ZXJFbGVtZW50LmNoZWNrZWQgPSBmYWxzZTtcbiAgICBhbnN3ZXJFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoYGNsaWNrYCwgY2IpO1xuICB9XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5pbXBvcnQgZGVidWcgZnJvbSAnLi4vZGVidWcuanMnO1xuaW1wb3J0IEdhbWVNb2RlbCBmcm9tICcuLi9nYW1lLW1vZGVsL2dhbWUtbW9kZWwuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBbnN3ZXJQYWludE9wdGlvblZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKGFuc3dlckluZGV4LCBnYW1lKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xuICAgIHRoaXMuYW5zd2VySW5kZXggPSBhbnN3ZXJJbmRleDtcbiAgICB0aGlzLmFuc3dlclR5cGUgPSBnYW1lLmFuc3dlcnNbYW5zd2VySW5kZXhdLnR5cGU7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgY29uc3QgY29ycmVjdEFuc3dlciA9IEdhbWVNb2RlbC5nZXRDb3JyZWN0QW5zd2VyKHRoaXMuZ2FtZSk7XG4gICAgcmV0dXJuIGA8ZGl2IGNsYXNzPVwiZ2FtZV9fb3B0aW9uXCIgZGF0YS1hbnN3ZXI9XCIke3RoaXMuYW5zd2VyVHlwZX1cIiBkYXRhLWFuc3dlcmluZGV4PVwiJHt0aGlzLmFuc3dlckluZGV4fVwiICR7ZGVidWcuaXNDb3JyZWN0KHRoaXMuYW5zd2VyVHlwZSA9PT0gY29ycmVjdEFuc3dlcil9PlxuICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBJTUFHRSAtLT5cbiAgICAgICAgICAgIDwvZGl2PmA7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Zvcm0uZ2FtZV9fY29udGVudC0tdHJpcGxlJyk7XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgYmluZChjYikge1xuICAgIGNvbnN0IGFuc3dlckVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGAuZ2FtZV9fb3B0aW9uYClbdGhpcy5hbnN3ZXJJbmRleF07XG4gICAgYW5zd2VyRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGBjbGlja2AsIGNiKTtcbiAgfVxufVxuIiwiLy8gTWFuYWdpbmcgc2l6ZVxuLy8gQHBhcmFtICB7b2JqZWN0fSBmcmFtZSDQvtC/0LjRgdGL0LLQsNC10YIg0YDQsNC30LzQtdGA0Ysg0YDQsNC80LrQuCwg0LIg0LrQvtGC0L7RgNGL0LUg0LTQvtC70LbQvdC+INCx0YvRgtGMINCy0L/QuNGB0LDQvdC+INC40LfQvtCx0YDQsNC20LXQvdC40LVcbi8vIEBwYXJhbSAge29iamVjdH0gZ2l2ZW4g0L7Qv9C40YHRi9Cy0LDQtdGCINGI0LjRgNC40L3RgyDQuCDQstGL0YHQvtGC0YMg0LjQt9C+0LHRgNCw0LbQtdC90LjRjywg0LrQvtGC0L7RgNC+0LUg0L3Rg9C20L3QviDQv9C+0LTQvtCz0L3QsNGC0Ywg0L/QvtC0INGA0LDQvNC60YNcbi8vIEByZXR1cm4ge29iamVjdH0g0L3QvtCy0YvQuSDQvtCx0YrQtdC60YIsINC60L7RgtC+0YDRi9C5INCx0YPQtNC10YIg0YHQvtC00LXRgNC20LDRgtGMINC40LfQvNC10L3RkdC90L3Ri9C1INGA0LDQt9C80LXRgNGLINC40LfQvtCx0YDQsNC20LXQvdC40Y9cbmV4cG9ydCBkZWZhdWx0ICBmdW5jdGlvbiByZXNpemUoZnJhbWUsIGdpdmVuKSB7XG4gIGxldCB3aWR0aCA9IGdpdmVuLndpZHRoO1xuICBsZXQgaGVpZ2h0ID0gZ2l2ZW4uaGVpZ2h0O1xuICBpZiAod2lkdGggPiBmcmFtZS53aWR0aCkge1xuICAgIGNvbnN0IG11bHRpcGxpZXIgPSB3aWR0aCAvIGZyYW1lLndpZHRoO1xuICAgIHdpZHRoID0gZnJhbWUud2lkdGg7XG4gICAgaGVpZ2h0ID0gTWF0aC5mbG9vcihoZWlnaHQgLyBtdWx0aXBsaWVyKTtcbiAgfVxuICBpZiAoaGVpZ2h0ID4gZnJhbWUuaGVpZ2h0KSB7XG4gICAgY29uc3QgbXVsdGlwbGllciA9IGhlaWdodCAvIGZyYW1lLmhlaWdodDtcbiAgICBoZWlnaHQgPSBmcmFtZS5oZWlnaHQ7XG4gICAgd2lkdGggPSBNYXRoLmZsb29yKHdpZHRoIC8gbXVsdGlwbGllcik7XG4gIH1cbiAgcmV0dXJuIHt3aWR0aCwgaGVpZ2h0fTtcbn1cbiIsImltcG9ydCBjb25maWcgZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcbmltcG9ydCByZXNpemUgZnJvbSBcIi4uL3Jlc2l6ZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbWFnZVZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKHF1ZXN0aW9uTnVtYmVyLCBnYW1lKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnF1ZXN0aW9uTnVtYmVyID0gcXVlc3Rpb25OdW1iZXI7XG4gICAgdGhpcy5nYW1lVHlwZSA9IGdhbWUudHlwZTtcbiAgICB0aGlzLmltYWdlID0gZ2FtZS5hbnN3ZXJzW3F1ZXN0aW9uTnVtYmVyXS5pbWFnZTtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICBjb25zdCBmcmFtZVNpemUgPSBjb25maWcuUXVlc3Rpb25UeXBlVG9GcmFtZVNpemVbdGhpcy5nYW1lVHlwZV07XG4gICAgY29uc3QgaW1hZ2VTaXplID0ge3dpZHRoOiB0aGlzLmltYWdlLndpZHRoLCBoZWlnaHQ6IHRoaXMuaW1hZ2UuaGVpZ2h0fTtcbiAgICBjb25zdCByZXNpemVkSW1hZ2VTaXplID0gcmVzaXplKGZyYW1lU2l6ZSwgaW1hZ2VTaXplKTtcbiAgICByZXR1cm4gYDxpbWcgc3JjPVwiJHt0aGlzLmltYWdlLnVybH1cIiBhbHQ9XCJPcHRpb24gJHt0aGlzLnF1ZXN0aW9uTnVtYmVyICsgMX1cIiB3aWR0aD1cIiR7cmVzaXplZEltYWdlU2l6ZS53aWR0aH1cIiBoZWlnaHQ9XCIke3Jlc2l6ZWRJbWFnZVNpemUuaGVpZ2h0fVwiPmA7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2Rpdi5nYW1lX19vcHRpb24nKVt0aGlzLnF1ZXN0aW9uTnVtYmVyXTtcbiAgICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XG4gIH1cbn1cbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFja0Fycm93VmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gYDxidXR0b24gY2xhc3M9XCJiYWNrXCI+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidmlzdWFsbHktaGlkZGVuXCI+0JLQtdGA0L3Rg9GC0YzRgdGPINC6INC90LDRh9Cw0LvRgzwvc3Bhbj5cbiAgICAgICAgICAgICAgPHN2ZyBjbGFzcz1cImljb25cIiB3aWR0aD1cIjQ1XCIgaGVpZ2h0PVwiNDVcIiB2aWV3Qm94PVwiMCAwIDQ1IDQ1XCIgZmlsbD1cIiMwMDAwMDBcIj5cbiAgICAgICAgICAgICAgICA8dXNlIHhsaW5rOmhyZWY9XCJpbWcvc3ByaXRlLnN2ZyNhcnJvdy1sZWZ0XCI+PC91c2U+XG4gICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgICA8c3ZnIGNsYXNzPVwiaWNvblwiIHdpZHRoPVwiMTAxXCIgaGVpZ2h0PVwiNDRcIiB2aWV3Qm94PVwiMCAwIDEwMSA0NFwiIGZpbGw9XCIjMDAwMDAwXCI+XG4gICAgICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPVwiaW1nL3Nwcml0ZS5zdmcjbG9nby1zbWFsbFwiPjwvdXNlPlxuICAgICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgIDwvYnV0dG9uPmA7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYGhlYWRlci5oZWFkZXJgKTtcbiAgICBwYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZSh0aGlzLmVsZW1lbnQsIHBhcmVudEVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gIH1cblxuICBiaW5kKGNiKSB7XG4gICAgY29uc3QgYmFja0Fycm93ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmJhY2tgKTtcbiAgICBiYWNrQXJyb3cuYWRkRXZlbnRMaXN0ZW5lcihgY2xpY2tgLCBjYik7XG4gIH1cbn1cbiIsImltcG9ydCBjb25maWcgZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCBBYnN0cmFjdFNjcmVlbiBmcm9tICcuLi9hYnN0cmFjdC1zY3JlZW4uanMnO1xuaW1wb3J0IEdhbWVNb2RlbCBmcm9tICcuLi9nYW1lLW1vZGVsL2dhbWUtbW9kZWwuanMnO1xuXG5pbXBvcnQgR2FtZVNjcmVlblZpZXcgZnJvbSAnLi9nYW1lLXNjcmVlbi12aWV3LmpzJztcbmltcG9ydCBUaW1lckJsb2NrVmlldyBmcm9tICcuL3RpbWVyLWJsb2NrLXZpZXcuanMnO1xuaW1wb3J0IExpdmVzQmxvY2tWaWV3IGZyb20gJy4vbGl2ZXMtYmxvY2stdmlldy5qcyc7XG5pbXBvcnQgU3RhdHNCbG9ja1ZpZXcgZnJvbSAnLi4vdXRpbC12aWV3cy9zdGF0cy1ibG9jay12aWV3LmpzJztcbmltcG9ydCBBbnN3ZXJQaG90b0J1dHRvblZpZXcgZnJvbSAnLi9hbnN3ZXItcGhvdG8tYnV0dG9uLXZpZXcuanMnO1xuaW1wb3J0IEFuc3dlclBhaW50QnV0dG9uVmlldyBmcm9tICcuL2Fuc3dlci1wYWludC1idXR0b24tdmlldy5qcyc7XG5pbXBvcnQgQW5zd2VyUGFpbnRPcHRpb25WaWV3IGZyb20gJy4vYW5zd2VyLXBhaW50LW9wdGlvbi12aWV3LmpzJztcbmltcG9ydCBJbWFnZVZpZXcgZnJvbSAnLi9pbWFnZS12aWV3LmpzJztcbmltcG9ydCBCYWNrQXJyb3dWaWV3IGZyb20gJy4uL3V0aWwtdmlld3MvYmFjay1hcnJvdy12aWV3LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FtZVNjcmVlbiBleHRlbmRzIEFic3RyYWN0U2NyZWVuIHtcblxuICBjb25zdHJ1Y3RvcihnYW1lTW9kZWwsIGdhbWUsIGluZGV4KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmdhbWVNb2RlbCA9IGdhbWVNb2RlbDtcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xuICAgIHRoaXMuZ2FtZUluZGV4ID0gaW5kZXg7XG4gICAgdGhpcy52aWV3ID0gbmV3IEdhbWVTY3JlZW5WaWV3KGdhbWUpO1xuICB9XG5cbiAgX29uU2NyZWVuU2hvdygpIHtcbiAgICBjb25zdCBnYW1lID0gdGhpcy5nYW1lO1xuICAgIGNvbnN0IGxpdmVzQmxvY2sgPSBuZXcgTGl2ZXNCbG9ja1ZpZXcodGhpcy5nYW1lTW9kZWwubGl2ZXMpO1xuICAgIGNvbnN0IHN0YXRzQmxvY2sgPSBuZXcgU3RhdHNCbG9ja1ZpZXcodGhpcy5nYW1lTW9kZWwuYW5zd2Vycyk7XG5cbiAgICBsaXZlc0Jsb2NrLnJlbmRlcigpO1xuICAgIHN0YXRzQmxvY2sucmVuZGVyKCk7XG5cbiAgICB0aGlzLnRpbWVyID0gbmV3IFRpbWVyQmxvY2tWaWV3KCk7XG4gICAgdGhpcy50aW1lci5yZW5kZXIoKTtcbiAgICB0aGlzLl90aW1lck9uKCk7XG5cbiAgICBjb25zdCBvbkV2ZXJ5QW5zd2VyID0gdGhpcy5fb25FdmVyeUFuc3dlci5iaW5kKHRoaXMpO1xuICAgIGlmIChnYW1lLnR5cGUgPT09IGNvbmZpZy5RdWVzdGlvblR5cGUuVElOREVSX0xJS0UpIHtcbiAgICAgIGNvbnN0IGFuc3dlcjFQaG90b0J1dHRvbiA9IG5ldyBBbnN3ZXJQaG90b0J1dHRvblZpZXcoMCwgZ2FtZSk7XG4gICAgICBjb25zdCBhbnN3ZXIxUGFpbnRCdXR0b24gPSBuZXcgQW5zd2VyUGFpbnRCdXR0b25WaWV3KDAsIGdhbWUpO1xuICAgICAgY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2VWaWV3KDAsIGdhbWUpO1xuICAgICAgYW5zd2VyMVBob3RvQnV0dG9uLnJlbmRlcigpO1xuICAgICAgYW5zd2VyMVBhaW50QnV0dG9uLnJlbmRlcigpO1xuICAgICAgaW1hZ2UucmVuZGVyKCk7XG4gICAgICBhbnN3ZXIxUGhvdG9CdXR0b24uYmluZChvbkV2ZXJ5QW5zd2VyKTtcbiAgICAgIGFuc3dlcjFQYWludEJ1dHRvbi5iaW5kKG9uRXZlcnlBbnN3ZXIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS50eXBlID09PSBjb25maWcuUXVlc3Rpb25UeXBlLlRXT19PRl9UV08pIHtcbiAgICAgIGNvbnN0IGFuc3dlcjFQaG90b0J1dHRvbiA9IG5ldyBBbnN3ZXJQaG90b0J1dHRvblZpZXcoMCwgZ2FtZSk7XG4gICAgICBjb25zdCBhbnN3ZXIxUGFpbnRCdXR0b24gPSBuZXcgQW5zd2VyUGFpbnRCdXR0b25WaWV3KDAsIGdhbWUpO1xuICAgICAgY29uc3QgaW1hZ2UxID0gbmV3IEltYWdlVmlldygwLCBnYW1lKTtcbiAgICAgIGNvbnN0IGFuc3dlcjJQaG90b0J1dHRvbiA9IG5ldyBBbnN3ZXJQaG90b0J1dHRvblZpZXcoMSwgZ2FtZSk7XG4gICAgICBjb25zdCBhbnN3ZXIyUGFpbnRCdXR0b24gPSBuZXcgQW5zd2VyUGFpbnRCdXR0b25WaWV3KDEsIGdhbWUpO1xuICAgICAgY29uc3QgaW1hZ2UyID0gbmV3IEltYWdlVmlldygxLCBnYW1lKTtcbiAgICAgIGFuc3dlcjFQaG90b0J1dHRvbi5yZW5kZXIoKTtcbiAgICAgIGFuc3dlcjFQYWludEJ1dHRvbi5yZW5kZXIoKTtcbiAgICAgIGltYWdlMS5yZW5kZXIoKTtcbiAgICAgIGFuc3dlcjFQaG90b0J1dHRvbi5iaW5kKG9uRXZlcnlBbnN3ZXIpO1xuICAgICAgYW5zd2VyMVBhaW50QnV0dG9uLmJpbmQob25FdmVyeUFuc3dlcik7XG4gICAgICBhbnN3ZXIyUGhvdG9CdXR0b24ucmVuZGVyKCk7XG4gICAgICBhbnN3ZXIyUGFpbnRCdXR0b24ucmVuZGVyKCk7XG4gICAgICBpbWFnZTIucmVuZGVyKCk7XG4gICAgICBhbnN3ZXIyUGhvdG9CdXR0b24uYmluZChvbkV2ZXJ5QW5zd2VyKTtcbiAgICAgIGFuc3dlcjJQYWludEJ1dHRvbi5iaW5kKG9uRXZlcnlBbnN3ZXIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS50eXBlID09PSBjb25maWcuUXVlc3Rpb25UeXBlLk9ORV9PRl9USFJFRSkge1xuICAgICAgY29uc3QgYW5zd2VyMVBhaW50T3B0aW9uVmlldyA9IG5ldyBBbnN3ZXJQYWludE9wdGlvblZpZXcoMCwgZ2FtZSk7XG4gICAgICBjb25zdCBpbWFnZTEgPSBuZXcgSW1hZ2VWaWV3KDAsIGdhbWUpO1xuICAgICAgY29uc3QgYW5zd2VyMlBhaW50T3B0aW9uVmlldyA9IG5ldyBBbnN3ZXJQYWludE9wdGlvblZpZXcoMSwgZ2FtZSk7XG4gICAgICBjb25zdCBpbWFnZTIgPSBuZXcgSW1hZ2VWaWV3KDEsIGdhbWUpO1xuICAgICAgY29uc3QgYW5zd2VyM1BhaW50T3B0aW9uVmlldyA9IG5ldyBBbnN3ZXJQYWludE9wdGlvblZpZXcoMiwgZ2FtZSk7XG4gICAgICBjb25zdCBpbWFnZTMgPSBuZXcgSW1hZ2VWaWV3KDIsIGdhbWUpO1xuICAgICAgYW5zd2VyMVBhaW50T3B0aW9uVmlldy5yZW5kZXIoKTtcbiAgICAgIGltYWdlMS5yZW5kZXIoKTtcbiAgICAgIGFuc3dlcjJQYWludE9wdGlvblZpZXcucmVuZGVyKCk7XG4gICAgICBpbWFnZTIucmVuZGVyKCk7XG4gICAgICBhbnN3ZXIzUGFpbnRPcHRpb25WaWV3LnJlbmRlcigpO1xuICAgICAgaW1hZ2UzLnJlbmRlcigpO1xuICAgICAgYW5zd2VyMVBhaW50T3B0aW9uVmlldy5iaW5kKG9uRXZlcnlBbnN3ZXIpO1xuICAgICAgYW5zd2VyMlBhaW50T3B0aW9uVmlldy5iaW5kKG9uRXZlcnlBbnN3ZXIpO1xuICAgICAgYW5zd2VyM1BhaW50T3B0aW9uVmlldy5iaW5kKG9uRXZlcnlBbnN3ZXIpO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3RhcnRHYW1lID0gdGhpcy5fcmVzdGFydEdhbWUuYmluZCh0aGlzKTtcblxuICAgIGNvbnN0IGJhY2tBcnJvdyA9IG5ldyBCYWNrQXJyb3dWaWV3KCk7XG4gICAgYmFja0Fycm93LnJlbmRlcigpO1xuICAgIGJhY2tBcnJvdy5iaW5kKHJlc3RhcnRHYW1lKTtcbiAgfVxuXG4gIF90aW1lck9uKCkge1xuICAgIGlmICh0aGlzLnRpbWVyLmlzQWN0aXZlICYmIHRoaXMudGltZXIudGltZSA+IDApIHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLnRpbWVyLnVwZGF0ZSgpO1xuICAgICAgICB0aGlzLl90aW1lck9uKCk7XG4gICAgICB9LCAxMDAwKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGltZXIudGltZSA9PT0gMCkge1xuICAgICAgdGhpcy5fb25WYWxpZEFuc3dlcihmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgX29uRXZlcnlBbnN3ZXIoZXZ0KSB7XG4gICAgaWYgKHRoaXMuZ2FtZS50eXBlID09PSBjb25maWcuUXVlc3Rpb25UeXBlLk9ORV9PRl9USFJFRSkge1xuICAgICAgY29uc3QgaW5wdXQgPSBldnQuY3VycmVudFRhcmdldDtcbiAgICAgIGNvbnN0IGFuc3dlckluZGV4ID0gR2FtZVNjcmVlbi5nZXRBbnN3ZXJJbmRleChpbnB1dCk7XG4gICAgICBjb25zdCBhY3R1YWxBbnN3ZXIgPSB0aGlzLl9nZXRBbnN3ZXJUeXBlKHRoaXMuZ2FtZUluZGV4LCBhbnN3ZXJJbmRleCk7XG4gICAgICBjb25zdCBjb3JyZWN0QW5zd2VyID0gR2FtZU1vZGVsLmdldENvcnJlY3RBbnN3ZXIodGhpcy5nYW1lKTtcbiAgICAgIGNvbnN0IGlzT0sgPSBhY3R1YWxBbnN3ZXIgPT09IGNvcnJlY3RBbnN3ZXI7XG4gICAgICB0aGlzLl9vblZhbGlkQW5zd2VyKGlzT0spO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBpc0FsbCA9IHRoaXMuX2lzQWxsQW5zd2Vyc0dpdmVuKCk7XG4gICAgICBpZiAoaXNBbGwpIHtcbiAgICAgICAgY29uc3QgaXNPSyA9IHRoaXMuX2lzQWxsQW5zd2Vyc0dpdmVuQ29ycmVjdCgpO1xuICAgICAgICB0aGlzLl9vblZhbGlkQW5zd2VyKGlzT0spO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9pc0FsbEFuc3dlcnNHaXZlbigpIHtcbiAgICBjb25zdCBvcHRpb25zID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGAuZ2FtZV9fb3B0aW9uYCkpO1xuICAgIHJldHVybiBvcHRpb25zLmV2ZXJ5KChvcHRpb24pID0+IHtcbiAgICAgIGNvbnN0IGFuc3dlcnMgPSBBcnJheS5mcm9tKG9wdGlvbi5xdWVyeVNlbGVjdG9yQWxsKGAuZ2FtZV9fYW5zd2VyYCkpO1xuICAgICAgcmV0dXJuIGFuc3dlcnMuc29tZSgoYW5zd2VyKSA9PiB7XG4gICAgICAgIGNvbnN0IGlucHV0ID0gYW5zd2VyLnF1ZXJ5U2VsZWN0b3IoYGlucHV0YCk7XG4gICAgICAgIHJldHVybiBpbnB1dC5jaGVja2VkO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBfaXNBbGxBbnN3ZXJzR2l2ZW5Db3JyZWN0KCkge1xuICAgIGNvbnN0IG9wdGlvbnMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYC5nYW1lX19vcHRpb25gKSk7XG4gICAgcmV0dXJuIG9wdGlvbnMuZXZlcnkoKG9wdGlvbikgPT4ge1xuICAgICAgY29uc3QgYW5zd2VycyA9IEFycmF5LmZyb20ob3B0aW9uLnF1ZXJ5U2VsZWN0b3JBbGwoYC5nYW1lX19hbnN3ZXJgKSk7XG4gICAgICByZXR1cm4gYW5zd2Vycy5zb21lKChhbnN3ZXIpID0+IHtcbiAgICAgICAgY29uc3QgaW5wdXQgPSBhbnN3ZXIucXVlcnlTZWxlY3RvcihgaW5wdXRgKTtcbiAgICAgICAgY29uc3QgYW5zd2VySW5kZXggPSBHYW1lU2NyZWVuLmdldEFuc3dlckluZGV4KGlucHV0KTtcbiAgICAgICAgY29uc3QgYWN0dWFsQW5zd2VyID0gdGhpcy5fZ2V0QW5zd2VyVHlwZSh0aGlzLmdhbWVJbmRleCwgYW5zd2VySW5kZXgpO1xuICAgICAgICByZXR1cm4gaW5wdXQuY2hlY2tlZCAmJiBpbnB1dC52YWx1ZSA9PT0gYWN0dWFsQW5zd2VyO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBfb25WYWxpZEFuc3dlcihpc09LKSB7XG4gICAgdGhpcy5fc2F2ZUFuc3dlcihpc09LKTtcbiAgICBpZiAoIWlzT0spIHtcbiAgICAgIHRoaXMuZ2FtZU1vZGVsLm1pbnVzTGl2ZSgpO1xuICAgIH1cbiAgICBpZiAodGhpcy5nYW1lTW9kZWwuaXNHYW1lT3Zlcikge1xuICAgICAgdGhpcy5lbmRTY3JlZW4uc2hvdygpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm5leHRTY3JlZW4uc2hvdygpO1xuICAgIH1cbiAgfVxuXG4gIF9nZXRBbnN3ZXJUeXBlKGdhbWVJbmRleCwgYW5zd2VySW5kZXgpIHtcbiAgICByZXR1cm4gdGhpcy5nYW1lTW9kZWwuZ2FtZXNbZ2FtZUluZGV4XS5hbnN3ZXJzW2Fuc3dlckluZGV4XS50eXBlO1xuICB9XG5cbiAgX3NhdmVBbnN3ZXIoaXNPSykge1xuICAgIGNvbnN0IHRpbWUgPSAoY29uZmlnLlRJTUVfVE9fQU5TV0VSIC0gdGhpcy50aW1lci50aW1lKSAvIDEwMDA7XG4gICAgdGhpcy50aW1lci5zdG9wKCk7XG4gICAgdGhpcy5nYW1lTW9kZWwuYWRkQW5zd2VyKHtpc09LLCB0aW1lfSk7XG4gIH1cblxuICBzdGF0aWMgZ2V0QW5zd2VySW5kZXgoaW5wdXQpIHtcbiAgICByZXR1cm4gaW5wdXQuZGF0YXNldC5hbnN3ZXJpbmRleDtcbiAgfVxuXG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0VBQUEsTUFBTSxNQUFNLEdBQUc7RUFDZixFQUFFLFlBQVksRUFBRSxDQUFDLHVGQUF1RixDQUFDO0VBQ3pHLEVBQUUsYUFBYSxFQUFFLENBQUMsNEJBQTRCLENBQUM7RUFDL0MsRUFBRSxXQUFXLEVBQUUsRUFBRTtFQUNqQixFQUFFLFdBQVcsRUFBRSxDQUFDO0VBQ2hCLEVBQUUsY0FBYyxFQUFFLEtBQUs7RUFDdkIsRUFBRSxTQUFTLEVBQUUsQ0FBQyxPQUFPLENBQUM7RUFDdEIsRUFBRSxVQUFVLEVBQUU7RUFDZCxJQUFJLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQztFQUN4QixJQUFJLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztFQUNsQixHQUFHO0VBQ0gsRUFBRSxZQUFZLEVBQUU7RUFD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
