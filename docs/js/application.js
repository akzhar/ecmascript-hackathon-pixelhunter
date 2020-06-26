var application = (function () {
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

  function getRandom(arr, n) {
    const result = new Array(n);
    let len = arr.length;
    const taken = new Array(len);
    if (n > len) {
      throw new RangeError("getRandom: more elements taken than available");
    }
    while (n--) {
      const x = Math.floor(Math.random() * len);
      result[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
  }

  async function loadGames() {
    const response = await fetch(config.GET_DATA_URL);
    const gamesPromise = await response.json();
    return gamesPromise;
  }
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

  class WelcomeScreenView extends AbstractView {

    constructor() {
      super();
    }

    get template() {
      return `<div id="main" class="central__content">
              <section id="intro" class="intro">
                <!-- PLACE TO ASTERISK -->
                <p class="intro__motto"><sup>*</sup> Это не фото. Это рисунок маслом нидерландского художника-фотореалиста Tjalf Sparnaay.</p>
                <button class="intro__top top" type="button">
                  <img src="img/icon-top.svg" width="71" height="79" alt="Топ игроков">
                </button>
              </section>
            </div>`;
    }
  }

  class AsteriskView extends AbstractView {

    constructor() {
      super();
    }

    get template() {
      return `<button class="intro__asterisk asterisk" type="button"><span class="visually-hidden">Продолжить</span>*</button>`;
    }

    render() {
      const parentElement = document.querySelector('#intro');
      parentElement.insertBefore(this.element, parentElement.firstChild);
    }

    bind(cb) {
      const asterisk = document.querySelector(`.intro__asterisk`);
      asterisk.addEventListener(`click`, cb);
    }
  }

  class WelcomeScreen extends AbstractScreen {

    constructor() {
      super();
      this.view = new WelcomeScreenView();
    }

    _onScreenShow() {
      const asterisk = new AsteriskView();
      asterisk.render();
      asterisk.bind(this.nextScreen.show.bind(this.nextScreen));
    }
  }

  class GreetingScreenView extends AbstractView {

    constructor() {
      super();
    }

    get template() {
      return `<div id="main" class="central__content">
              <section class="greeting central--blur">
                <img class="greeting__logo" src="img/logo_ph-big.svg" width="201" height="89" alt="Pixel Hunter">
                <div class="greeting__asterisk asterisk"><span class="visually-hidden">Я просто красивая звёздочка</span>*</div>
                <div class="greeting__challenge">
                  <h3 class="greeting__challenge-title">Лучшие художники-фотореалисты бросают тебе вызов!</h3>
                  <p class="greeting__challenge-text">Правила игры просты:</p>
                  <ul class="greeting__challenge-list">
                    <li>Нужно отличить рисунок от фотографии и сделать выбор.</li>
                    <li>Задача кажется тривиальной, но не думай, что все так просто.</li>
                    <li>Фотореализм обманчив и коварен.</li>
                    <li>Помни, главное — смотреть очень внимательно.</li>
                  </ul>
                </div>
                <!-- PLACE TO START ARROW -->
                <button class="greeting__top top" type="button">
                  <img src="img/icon-top.svg" width="71" height="79" alt="Топ игроков">
                </button>
              </section>
            </div>`;
    }
  }

  class StartArrowView extends AbstractView {

    constructor() {
      super();
    }

    get template() {
      return `<button class="greeting__continue" type="button">
              <span class="visually-hidden">Продолжить</span>
              <svg class="icon" width="64" height="64" viewBox="0 0 64 64" fill="#000000">
                <use xlink:href="img/sprite.svg#arrow-right"></use>
              </svg>
            </button>`;
    }

    render() {
      const parentElement = document.querySelector(`section.greeting`);
      parentElement.appendChild(this.element);
    }

    bind(cb) {
      const startArrow = document.querySelector(`.greeting__continue`);
      startArrow.addEventListener(`click`, cb);
    }
  }

  class GreetingScreen extends AbstractScreen {

    constructor() {
      super();
      this.view = new GreetingScreenView();
    }

    _onScreenShow() {
      const startArrow = new StartArrowView();
      startArrow.render();
      startArrow.bind(this.nextScreen.show.bind(this.nextScreen));
    }
  }

  class RulesScreenView extends AbstractView {

    constructor() {
      super();
    }

    get template() {
      return `<div id="main" class="central__content">
              <header class="header">
                <!-- PLACE TO BACK ARROW -->
              </header>
              <section class="rules">
                <h2 class="rules__title">Правила</h2>
                <ul class="rules__description">
                  <li>Угадай 10 раз для каждого изображения фото
                    <img class="rules__icon" src="img/icon-photo.png" width="32" height="31" alt="Фото"> или рисунок
                    <img class="rules__icon" src="img/icon-paint.png" width="32" height="31" alt="Рисунок"></li>
                  <li>Фотографиями или рисунками могут быть оба изображения.</li>
                  <li>На каждую попытку отводится 30 секунд.</li>
                  <li>Ошибиться можно не более 3 раз.</li>
                </ul>
                <p class="rules__ready">Готовы?</p>
                <form class="rules__form">
                  <!-- PLACE TO NAME INPUT -->
                  <!-- PLACE TO START BUTTON -->
                </form>
              </section>
            </div>`;
    }
  }

  class NameInputView extends AbstractView {

    constructor() {
      super();
    }

    get template() {
      return `<input class="rules__input" type="text" placeholder="Ваше Имя">`;
    }

    render() {
      const parentElement = document.querySelector(`form.rules__form`);
      this.element.value = ``;
      parentElement.appendChild(this.element);
    }

    bind() {
      const nameInput = document.querySelector(`.rules__input`);
      const startBtn = document.querySelector(`.rules__button`);
      nameInput.addEventListener(`input`, () => {
        startBtn.disabled = (nameInput.value === ``) ? true : false;
      });
    }
  }

  class StartButtonView extends AbstractView {

    constructor() {
      super();
    }

    get template() {
      return `<button class="rules__button  continue" type="submit" disabled>Go!</button>`;
    }

    render() {
      const parentElement = document.querySelector(`form.rules__form`);
      this.element.disabled = true;
      parentElement.appendChild(this.element);
    }

    bind(cb) {
      const startBtn = document.querySelector(`.rules__button`);
      startBtn.addEventListener(`click`, cb);
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

  class RulesScreen extends AbstractScreen {

    constructor(gameModel) {
      super();
      this.gameModel = gameModel;
      this.view = new RulesScreenView();
    }

    _onScreenShow() {
      const nameInput = new NameInputView();
      const startBtn = new StartButtonView();
      const backArrow = new BackArrowView();
      const onStartBtnClick = this._onStartBtnClick.bind(this);
      const restartGame = this._restartGame.bind(this);

      nameInput.render();
      startBtn.render();
      backArrow.render();

      startBtn.bind(onStartBtnClick);
      nameInput.bind();
      backArrow.bind(restartGame);
    }

    _onStartBtnClick() {
      const nameInput = document.querySelector(`.rules__input`);
      this.gameModel.playerName = nameInput.value.trim();
      this.nextScreen.show();
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

  class ErrorModalView extends AbstractView {

    constructor() {
      super();
    }

    get template() {
      return `<section class="modal">
              <div class="modal__inner">
                <h2 class="modal__title">Произошла ошибка!</h2>
                <p class="modal__text modal__text--error">Статус: 404. Пожалуйста, перезагрузите страницу.</p>
              </div>
            </section>`;
    }

    render() {
      const parentElement = document.querySelector(`#main`);
      parentElement.appendChild(this.element);
    }
  }

  class Application {

    static init() {
      const gameModel = new GameModel();
      const welcomeScreen = new WelcomeScreen();
      const greetingScreen = new GreetingScreen();
      const rulesScreen = new RulesScreen(gameModel);
      const statsScreen = new StatsScreen(gameModel);

      const gameScreens = [];

      loadGames()
      .then((gamesArr) => {
        const games = getRandom(gamesArr, config.GAMES_COUNT);
        gameModel._games = games;
        games.forEach((game, index) => {
          gameScreens.push(new GameScreen(gameModel, game, index));
        });
        gameScreens.forEach((gameScreen, index) => {
          gameScreen.nextScreen = gameScreens[index + 1];
          gameScreen.startScreen = welcomeScreen;
          gameScreen.endScreen = statsScreen;
        });
        gameScreens[gameScreens.length - 1].nextScreen = statsScreen;
      })
      .finally(() => {
        greetingScreen.nextScreen = rulesScreen;
        rulesScreen.nextScreen = gameScreens[0];
        rulesScreen.startScreen = welcomeScreen;
        statsScreen.startScreen = welcomeScreen;
        greetingScreen.show();
      })
      .catch(() => {
        const errorModal = new ErrorModalView();
        errorModal.render();
        throw new Error(`Error during GET games data...`);
      });

      welcomeScreen.nextScreen = greetingScreen;
      welcomeScreen.show();
    }
  }

  return Application;

}());

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGljYXRpb24uanMiLCJzb3VyY2VzIjpbInNyYy9qcy9jb25maWcuanMiLCJzcmMvanMvdXRpbHMuanMiLCJzcmMvanMvYmFja2VuZC5qcyIsInNyYy9qcy9nYW1lLW1vZGVsL2dhbWUtbW9kZWwuanMiLCJzcmMvanMvYWJzdHJhY3Qtdmlldy5qcyIsInNyYy9qcy91dGlsLXZpZXdzL2NvbmZpcm0tbW9kYWwtdmlldy5qcyIsInNyYy9qcy9hYnN0cmFjdC1zY3JlZW4uanMiLCJzcmMvanMvd2VsY29tZS1zY3JlZW4vd2VsY29tZS1zY3JlZW4tdmlldy5qcyIsInNyYy9qcy93ZWxjb21lLXNjcmVlbi9hc3Rlcmlzay12aWV3LmpzIiwic3JjL2pzL3dlbGNvbWUtc2NyZWVuL3dlbGNvbWUtc2NyZWVuLmpzIiwic3JjL2pzL2dyZWV0aW5nLXNjcmVlbi9ncmVldGluZy1zY3JlZW4tdmlldy5qcyIsInNyYy9qcy9ncmVldGluZy1zY3JlZW4vc3RhcnQtYXJyb3ctdmlldy5qcyIsInNyYy9qcy9ncmVldGluZy1zY3JlZW4vZ3JlZXRpbmctc2NyZWVuLmpzIiwic3JjL2pzL3J1bGVzLXNjcmVlbi9ydWxlcy1zY3JlZW4tdmlldy5qcyIsInNyYy9qcy9ydWxlcy1zY3JlZW4vbmFtZS1pbnB1dC12aWV3LmpzIiwic3JjL2pzL3J1bGVzLXNjcmVlbi9zdGFydC1idXR0b24tdmlldy5qcyIsInNyYy9qcy91dGlsLXZpZXdzL2JhY2stYXJyb3ctdmlldy5qcyIsInNyYy9qcy9ydWxlcy1zY3JlZW4vcnVsZXMtc2NyZWVuLmpzIiwic3JjL2pzL2dhbWUtc2NyZWVuL2dhbWUtc2NyZWVuLXZpZXcuanMiLCJzcmMvanMvZ2FtZS1zY3JlZW4vdGltZXItYmxvY2stdmlldy5qcyIsInNyYy9qcy9nYW1lLXNjcmVlbi9saXZlcy1ibG9jay12aWV3LmpzIiwic3JjL2pzL3V0aWwtdmlld3Mvc3RhdHMtYmxvY2stdmlldy5qcyIsInNyYy9qcy9kZWJ1Zy5qcyIsInNyYy9qcy9nYW1lLXNjcmVlbi9hbnN3ZXItcGhvdG8tYnV0dG9uLXZpZXcuanMiLCJzcmMvanMvZ2FtZS1zY3JlZW4vYW5zd2VyLXBhaW50LWJ1dHRvbi12aWV3LmpzIiwic3JjL2pzL2dhbWUtc2NyZWVuL2Fuc3dlci1wYWludC1vcHRpb24tdmlldy5qcyIsInNyYy9qcy9yZXNpemUuanMiLCJzcmMvanMvZ2FtZS1zY3JlZW4vaW1hZ2Utdmlldy5qcyIsInNyYy9qcy9nYW1lLXNjcmVlbi9nYW1lLXNjcmVlbi5qcyIsInNyYy9qcy9zdGF0cy1zY3JlZW4vc3RhdHMtc2NyZWVuLXZpZXcuanMiLCJzcmMvanMvc2NvcmUuanMiLCJzcmMvanMvc3RhdHMtc2NyZWVuL3N0YXRzLXNpbmdsZS12aWV3LmpzIiwic3JjL2pzL3N0YXRzLXNjcmVlbi9zdGF0cy1zY3JlZW4uanMiLCJzcmMvanMvdXRpbC12aWV3cy9lcnJvci1tb2RhbC12aWV3LmpzIiwic3JjL2pzL2FwcGxpY2F0aW9uLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGNvbmZpZyA9IHtcbiAgR0VUX0RBVEFfVVJMOiBgaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2Fremhhci9waXhlbGh1bnRlci9tYXN0ZXIvc3JjL2pzL2dhbWUtbW9kZWwvZGF0YS5qc29uYCxcbiAgUE9TVF9EQVRBX1VSTDogYGh0dHBzOi8vZWNoby5odG1sYWNhZGVteS5ydS9gLFxuICBHQU1FU19DT1VOVDogMTAsXG4gIExJVkVTX0NPVU5UOiAzLFxuICBUSU1FX1RPX0FOU1dFUjogMzAwMDAsIC8vIDMwIHNlY1xuICBDT0xPUl9SRUQ6IGAjZDc0MDQwYCxcbiAgQW5zd2VyVHlwZToge1xuICAgIFBBSU5USU5HOiBgcGFpbnRpbmdgLFxuICAgIFBIT1RPOiBgcGhvdG9gXG4gIH0sXG4gIFF1ZXN0aW9uVHlwZToge1xuICAgIFRXT19PRl9UV086IGB0d28tb2YtdHdvYCxcbiAgICBUSU5ERVJfTElLRTogYHRpbmRlci1saWtlYCxcbiAgICBPTkVfT0ZfVEhSRUU6IGBvbmUtb2YtdGhyZWVgXG4gIH0sXG4gIFF1ZXN0aW9uVHlwZVRvRnJhbWVTaXplOiB7XG4gICAgJ3R3by1vZi10d28nOiB7d2lkdGg6IDQ2OCwgaGVpZ2h0OiA0NTh9LFxuICAgICd0aW5kZXItbGlrZSc6IHt3aWR0aDogNzA1LCBoZWlnaHQ6IDQ1NX0sXG4gICAgJ29uZS1vZi10aHJlZSc6IHt3aWR0aDogMzA0LCBoZWlnaHQ6IDQ1NX1cbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY29uZmlnO1xuIiwiZnVuY3Rpb24gZ2V0UmFuZG9tKGFyciwgbikge1xuICBjb25zdCByZXN1bHQgPSBuZXcgQXJyYXkobik7XG4gIGxldCBsZW4gPSBhcnIubGVuZ3RoO1xuICBjb25zdCB0YWtlbiA9IG5ldyBBcnJheShsZW4pO1xuICBpZiAobiA+IGxlbikge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKFwiZ2V0UmFuZG9tOiBtb3JlIGVsZW1lbnRzIHRha2VuIHRoYW4gYXZhaWxhYmxlXCIpO1xuICB9XG4gIHdoaWxlIChuLS0pIHtcbiAgICBjb25zdCB4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbGVuKTtcbiAgICByZXN1bHRbbl0gPSBhcnJbeCBpbiB0YWtlbiA/IHRha2VuW3hdIDogeF07XG4gICAgdGFrZW5beF0gPSAtLWxlbiBpbiB0YWtlbiA/IHRha2VuW2xlbl0gOiBsZW47XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbmV4cG9ydCB7Z2V0UmFuZG9tfTtcbiIsImltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcuanMnO1xuXG5hc3luYyBmdW5jdGlvbiBsb2FkR2FtZXMoKSB7XG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goY29uZmlnLkdFVF9EQVRBX1VSTCk7XG4gIGNvbnN0IGdhbWVzUHJvbWlzZSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICByZXR1cm4gZ2FtZXNQcm9taXNlO1xufTtcblxuYXN5bmMgZnVuY3Rpb24gcG9zdERhdGEoZGF0YSA9IHt9KSB7XG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goY29uZmlnLlBPU1RfREFUQV9VUkwsIHtcbiAgICBtZXRob2Q6IGBQT1NUYCxcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnQ29udGVudC1UeXBlJzogYGFwcGxpY2F0aW9uL2pzb25gXG4gICAgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeShkYXRhKSAvLyBib2R5IGRhdGEgdHlwZSBtdXN0IG1hdGNoIFwiQ29udGVudC1UeXBlXCIgaGVhZGVyXG4gIH0pO1xuICByZXR1cm4gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xufTtcblxuZXhwb3J0IHtsb2FkR2FtZXMsIHBvc3REYXRhfTtcbiIsImltcG9ydCBjb25maWcgZnJvbSAnLi4vY29uZmlnLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FtZU1vZGVsIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fcGxheWVyTmFtZSA9IGBgO1xuICAgIHRoaXMuX2xpdmVzID0gY29uZmlnLkxJVkVTX0NPVU5UO1xuICAgIHRoaXMuX2dhbWVzID0gW107XG4gICAgdGhpcy5fYW5zd2VycyA9IFtdO1xuICAgIHRoaXMuX2lzR2FtZU92ZXIgPSBmYWxzZTtcbiAgfVxuXG4gIHNldCBwbGF5ZXJOYW1lKG5hbWUpIHtcbiAgICB0aGlzLl9wbGF5ZXJOYW1lID0gbmFtZTtcbiAgfVxuXG4gIGdldCBsaXZlcygpIHtcbiAgICByZXR1cm4gdGhpcy5fbGl2ZXM7XG4gIH1cblxuICBnZXQgYW5zd2VycygpIHtcbiAgICByZXR1cm4gdGhpcy5fYW5zd2VycztcbiAgfVxuXG4gIGdldCBnYW1lcygpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2FtZXM7XG4gIH1cblxuICBnZXQgaXNHYW1lT3ZlcigpIHtcbiAgICByZXR1cm4gdGhpcy5faXNHYW1lT3ZlcjtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRoaXMuX2xpdmVzID0gY29uZmlnLkxJVkVTX0NPVU5UO1xuICAgIHRoaXMuX2Fuc3dlcnMgPSBbXTtcbiAgICB0aGlzLl9pc0dhbWVPdmVyID0gZmFsc2U7XG4gIH1cblxuICBhZGRBbnN3ZXIoYW5zd2VyKSB7XG4gICAgdGhpcy5fYW5zd2Vycy5wdXNoKGFuc3dlcik7XG4gIH1cblxuICBtaW51c0xpdmUoKSB7XG4gICAgaWYgKHRoaXMuX2xpdmVzID09PSAwKSB7XG4gICAgICB0aGlzLl9pc0dhbWVPdmVyID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2xpdmVzKSB7XG4gICAgICB0aGlzLl9saXZlcy0tO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBnZXRDb3JyZWN0QW5zd2VyKGdhbWUpIHtcbiAgICBjb25zdCBxdWVzdGlvbiA9IGdhbWUucXVlc3Rpb247XG4gICAgY29uc3QgaXNQYWludGluZyA9IC9cXHPRgNC40YHRg9C90L7Qulxccy8udGVzdChxdWVzdGlvbik7XG4gICAgY29uc3QgaXNQaG90byA9IC9cXHPRhNC+0YLQvlxccy8udGVzdChxdWVzdGlvbik7XG4gICAgaWYgKGlzUGFpbnRpbmcpIHJldHVybiBgcGFpbnRpbmdgO1xuICAgIGlmIChpc1Bob3RvKSByZXR1cm4gYHBob3RvYFxuICB9XG5cbn1cbiIsImNvbnN0IGVsZW1lbnRzID0ge307XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIC8vINCy0L7Qt9Cy0YDQsNGJ0LDQtdGCINGB0YLRgNC+0LrRgywg0YHQvtC00LXRgNC20LDRidGD0Y4g0YDQsNC30LzQtdGC0LrRg1xuICBnZXQgdGVtcGxhdGUoKSB7fVxuXG4gIC8vINGB0L7Qt9C00LDQtdGCINC4INCy0L7Qt9Cy0YDQsNGJ0LDQtdGCIERPTS3RjdC70LXQvNC10L3RgiDQvdCwINC+0YHQvdC+0LLQtSDRiNCw0LHQu9C+0L3QsFxuICAvLyDQtNC+0LvQttC10L0g0YHQvtC30LTQsNCy0LDRgtGMIERPTS3RjdC70LXQvNC10L3RgiDRgSDQv9C+0LzQvtGJ0YzRjiDQvNC10YLQvtC00LAgcmVuZGVyLCDQtNC+0LHQsNCy0LvRj9GC0Ywg0LXQvNGDINC+0LHRgNCw0LHQvtGC0YfQuNC60LgsINGBINC/0L7QvNC+0YnRjNGOINC80LXRgtC+0LTQsCBiaW5kINC4INCy0L7Qt9Cy0YDQsNGJ0LDRgtGMINGB0L7Qt9C00LDQvdC90YvQuSDRjdC70LXQvNC10L3RglxuICAvLyDQnNC10YLQvtC0INC00L7Qu9C20LXQvSDQuNGB0L/QvtC70YzQt9C+0LLQsNGC0Ywg0LvQtdC90LjQstGL0LUg0LLRi9GH0LjRgdC70LXQvdC40Y8g4oCUINGN0LvQtdC80LXQvdGCINC00L7Qu9C20LXQvSDRgdC+0LfQtNCw0LLQsNGC0YzRgdGPINC/0YDQuCDQv9C10YDQstC+0Lwg0L7QsdGA0LDRidC10L3QuNC4INC6INCz0LXRgtGC0LXRgCDRgSDQv9C+0LzQvtGJ0YzRjiDQvNC10YLQvtC00LAgcmVuZGVyLCDQtNC+0LvQttC90Ysg0LTQvtCx0LDQstC70Y/RgtGM0YHRjyDQvtCx0YDQsNCx0L7RgtGH0LjQutC4ICjQvNC10YLQvtC0IGJpbmQpLlxuICAvLyDQn9GA0Lgg0L/QvtGB0LvQtdC00YPRjtGJ0LjRhSDQvtCx0YDQsNGJ0LXQvdC40Y/RhSDQtNC+0LvQttC10L0g0LjRgdC/0L7Qu9GM0LfQvtCy0LDRgtGM0YHRjyDRjdC70LXQvNC10L3Rgiwg0YHQvtC30LTQsNC90L3Ri9C5INC/0YDQuCDQv9C10YDQstC+0Lwg0LLRi9C30L7QstC1INCz0LXRgtGC0LXRgNCwLlxuICBnZXQgZWxlbWVudCgpIHtcbiAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMudGVtcGxhdGU7XG4gICAgLy8gaWYgKCFlbGVtZW50cy5oYXNPd25Qcm9wZXJ0eSh0ZW1wbGF0ZSkpIHtcbiAgICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoYGRpdmApO1xuICAgICAgZGl2LmlubmVySFRNTCA9IHRlbXBsYXRlO1xuICAgICAgY29uc3QgZWxlbSA9IGRpdi5maXJzdENoaWxkO1xuICAgICAgZWxlbWVudHNbdGVtcGxhdGVdID0gZWxlbTtcbiAgICAgIHJldHVybiBlbGVtO1xuICAgIC8vIH0gZWxzZSB7XG4gICAgICAvLyByZXR1cm4gZWxlbWVudHNbdGVtcGxhdGVdO1xuICAgIC8vIH1cbiAgfVxuXG4gIC8vINC+0YLRgNC40YHQvtCy0YvQstCw0LXRgiBET00t0Y3Qu9C10LzQtdC90YIsINC00L7QsdCw0LLQu9GP0LXRgiDQvdC10L7QsdGF0L7QtNC40LzRi9C1INC+0LHRgNCw0LHQvtGC0YfQuNC60LhcbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBtYWluLmNlbnRyYWxgKTtcbiAgICBjb25zdCBvbGRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI21haW5gKTtcbiAgICBwYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKG9sZEVsZW1lbnQpO1xuICAgIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIC8vINC00L7QsdCw0LLQu9GP0LXRgiDQvtCx0YDQsNCx0L7RgtGH0LjQutC4INGB0L7QsdGL0YLQuNC5XG4gIC8vINCc0LXRgtC+0LQg0L/QviDRg9C80L7Qu9GH0LDQvdC40Y4g0L3QuNGH0LXQs9C+INC90LUg0LTQtdC70LDQtdGCXG4gIC8vINCV0YHQu9C4INC90YPQttC90L4g0L7QsdGA0LDQsdC+0YLQsNGC0Ywg0LrQsNC60L7QtS3RgtC+INGB0L7QsdGL0YLQuNC1LCDRgtC+INGN0YLQvtGCINC80LXRgtC+0LQg0LTQvtC70LbQtdC9INCx0YvRgtGMINC/0LXRgNC10L7Qv9GA0LXQtNC10LvRkdC9INCyINC90LDRgdC70LXQtNC90LjQutC1INGBINC90LXQvtCx0YXQvtC00LjQvNC+0Lkg0LvQvtCz0LjQutC+0LlcbiAgYmluZCgpIHt9XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbmZpcm1Nb2RhbFZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuIGA8c2VjdGlvbiBjbGFzcz1cIm1vZGFsXCI+XG4gICAgICAgICAgICAgIDxmb3JtIGNsYXNzPVwibW9kYWxfX2lubmVyXCI+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cIm1vZGFsX19jbG9zZVwiIHR5cGU9XCJidXR0b25cIj5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidmlzdWFsbHktaGlkZGVuXCI+0JfQsNC60YDRi9GC0Yw8L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPGgyIGNsYXNzPVwibW9kYWxfX3RpdGxlXCI+0J/QvtC00YLQstC10YDQttC00LXQvdC40LU8L2gyPlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwibW9kYWxfX3RleHRcIj7QktGLINGD0LLQtdGA0LXQvdGLINGH0YLQviDRhdC+0YLQuNGC0LUg0L3QsNGH0LDRgtGMINC40LPRgNGDINC30LDQvdC+0LLQvj88L3A+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsX19idXR0b24td3JhcHBlclwiPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cIm1vZGFsX19idG4gbW9kYWxfX2J0bi0tb2tcIj7QntC6PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwibW9kYWxfX2J0biBtb2RhbF9fYnRuLS1jYW5jZWxcIj7QntGC0LzQtdC90LA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgPC9zZWN0aW9uPmA7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCNtYWluYCk7XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgYmluZChjYikge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjbWFpbmApO1xuICAgIGNvbnN0IG1vZGFsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLm1vZGFsYCk7XG4gICAgY29uc3QgY2xvc2VCdG4gPSBtb2RhbC5xdWVyeVNlbGVjdG9yKGAubW9kYWxfX2Nsb3NlYCk7XG4gICAgY29uc3QgY2FuY2VsQnRuID0gbW9kYWwucXVlcnlTZWxlY3RvcihgLm1vZGFsX19idG4tLWNhbmNlbGApO1xuICAgIGNvbnN0IG9rQnRuID0gbW9kYWwucXVlcnlTZWxlY3RvcihgLm1vZGFsX19idG4tLW9rYCk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihga2V5ZG93bmAsIChldnQpID0+IHtcbiAgICAgIGlmIChldnQua2V5Q29kZSA9PT0gMjcpIHtcbiAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQobW9kYWwpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGNsb3NlQnRuLmFkZEV2ZW50TGlzdGVuZXIoYGNsaWNrYCwgKGV2dCkgPT4ge1xuICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBwYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKG1vZGFsKTtcbiAgICB9KTtcbiAgICBjYW5jZWxCdG4uYWRkRXZlbnRMaXN0ZW5lcihgY2xpY2tgLCAoZXZ0KSA9PiB7XG4gICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQobW9kYWwpO1xuICAgIH0pO1xuICAgIG9rQnRuLmFkZEV2ZW50TGlzdGVuZXIoYGNsaWNrYCwgKGV2dCkgPT4ge1xuICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBjYigpO1xuICAgIH0pO1xuICB9XG59XG4iLCJpbXBvcnQgQ29uZmlybU1vZGFsVmlldyBmcm9tICcuL3V0aWwtdmlld3MvY29uZmlybS1tb2RhbC12aWV3LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWJzdHJhY3RTY3JlZW4ge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZ2FtZU1vZGVsID0gbnVsbDtcbiAgICB0aGlzLmdhbWUgPSBudWxsO1xuICAgIHRoaXMudmlldyA9IG51bGw7XG4gICAgdGhpcy50aW1lciA9IG51bGw7XG4gICAgdGhpcy5zdGFydFNjcmVlbiA9IG51bGw7XG4gICAgdGhpcy5uZXh0U2NyZWVuID0gbnVsbDtcbiAgICB0aGlzLmVuZFNjcmVlbiA9IG51bGw7XG4gIH1cblxuICAvLyDQvNC10YLQvtC0INC/0L7QutCw0LfQsCDRjdC60YDQsNC90LAg0L7RgtGA0LjRgdC+0LLRi9Cy0LDQtdGCINGN0LrRgNCw0L0g0Lgg0LfQsNC/0YPRgdC60LDQtdGCINC80LXRgtC+0LQgX29uU2NyZWVuU2hvd1xuICBzaG93KCkge1xuICAgIHRoaXMudmlldy5yZW5kZXIoKTtcbiAgICB0aGlzLl9vblNjcmVlblNob3coKTtcbiAgfVxuXG4gIC8vINC80LXRgtC+0LQg0YDQtdCw0LvQuNC30YPQtdGCINCx0LjQt9C90LXRgSDQu9C+0LPQuNC60YMg0Y3QutGA0LDQvdCwXG4gIF9vblNjcmVlblNob3coKSB7fVxuXG4gIC8vINC80LXRgtC+0LQg0L/QtdGA0LXQt9Cw0L/Rg9GB0LrQsNC10YIg0LjQs9GA0YNcbiAgX3Jlc3RhcnRHYW1lKCkge1xuICAgIGNvbnN0IGNvbmZpcm1Nb2RhbCA9IG5ldyBDb25maXJtTW9kYWxWaWV3KCk7XG4gICAgY29uZmlybU1vZGFsLnJlbmRlcigpO1xuICAgIGNvbmZpcm1Nb2RhbC5iaW5kKCgpID0+IHtcbiAgICAgIHRoaXMuZ2FtZU1vZGVsLnJlc2V0KCk7XG4gICAgICB0aGlzLnN0YXJ0U2NyZWVuLnNob3coKTtcbiAgICAgIGlmICh0aGlzLnRpbWVyKSB7XG4gICAgICAgIHRoaXMudGltZXIuc3RvcCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdlbGNvbWVTY3JlZW5WaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPGRpdiBpZD1cIm1haW5cIiBjbGFzcz1cImNlbnRyYWxfX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgPHNlY3Rpb24gaWQ9XCJpbnRyb1wiIGNsYXNzPVwiaW50cm9cIj5cbiAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIFRPIEFTVEVSSVNLIC0tPlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwiaW50cm9fX21vdHRvXCI+PHN1cD4qPC9zdXA+INCt0YLQviDQvdC1INGE0L7RgtC+LiDQrdGC0L4g0YDQuNGB0YPQvdC+0Log0LzQsNGB0LvQvtC8INC90LjQtNC10YDQu9Cw0L3QtNGB0LrQvtCz0L4g0YXRg9C00L7QttC90LjQutCwLdGE0L7RgtC+0YDQtdCw0LvQuNGB0YLQsCBUamFsZiBTcGFybmFheS48L3A+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImludHJvX190b3AgdG9wXCIgdHlwZT1cImJ1dHRvblwiPlxuICAgICAgICAgICAgICAgICAgPGltZyBzcmM9XCJpbWcvaWNvbi10b3Auc3ZnXCIgd2lkdGg9XCI3MVwiIGhlaWdodD1cIjc5XCIgYWx0PVwi0KLQvtC/INC40LPRgNC+0LrQvtCyXCI+XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgICAgIDwvZGl2PmA7XG4gIH1cbn1cbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXN0ZXJpc2tWaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPGJ1dHRvbiBjbGFzcz1cImludHJvX19hc3RlcmlzayBhc3Rlcmlza1wiIHR5cGU9XCJidXR0b25cIj48c3BhbiBjbGFzcz1cInZpc3VhbGx5LWhpZGRlblwiPtCf0YDQvtC00L7Qu9C20LjRgtGMPC9zcGFuPio8L2J1dHRvbj5gO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjaW50cm8nKTtcbiAgICBwYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZSh0aGlzLmVsZW1lbnQsIHBhcmVudEVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gIH1cblxuICBiaW5kKGNiKSB7XG4gICAgY29uc3QgYXN0ZXJpc2sgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuaW50cm9fX2FzdGVyaXNrYCk7XG4gICAgYXN0ZXJpc2suYWRkRXZlbnRMaXN0ZW5lcihgY2xpY2tgLCBjYik7XG4gIH1cbn1cbiIsImltcG9ydCBBYnN0cmFjdFNjcmVlbiBmcm9tICcuLi9hYnN0cmFjdC1zY3JlZW4uanMnO1xuXG5pbXBvcnQgSW50cm9TY3JlZW5WaWV3IGZyb20gJy4vd2VsY29tZS1zY3JlZW4tdmlldy5qcyc7XG5pbXBvcnQgQXN0ZXJpc2tWaWV3IGZyb20gJy4vYXN0ZXJpc2stdmlldy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdlbGNvbWVTY3JlZW4gZXh0ZW5kcyBBYnN0cmFjdFNjcmVlbiB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnZpZXcgPSBuZXcgSW50cm9TY3JlZW5WaWV3KCk7XG4gIH1cblxuICBfb25TY3JlZW5TaG93KCkge1xuICAgIGNvbnN0IGFzdGVyaXNrID0gbmV3IEFzdGVyaXNrVmlldygpO1xuICAgIGFzdGVyaXNrLnJlbmRlcigpO1xuICAgIGFzdGVyaXNrLmJpbmQodGhpcy5uZXh0U2NyZWVuLnNob3cuYmluZCh0aGlzLm5leHRTY3JlZW4pKTtcbiAgfVxufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHcmVldGluZ1NjcmVlblZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuIGA8ZGl2IGlkPVwibWFpblwiIGNsYXNzPVwiY2VudHJhbF9fY29udGVudFwiPlxuICAgICAgICAgICAgICA8c2VjdGlvbiBjbGFzcz1cImdyZWV0aW5nIGNlbnRyYWwtLWJsdXJcIj5cbiAgICAgICAgICAgICAgICA8aW1nIGNsYXNzPVwiZ3JlZXRpbmdfX2xvZ29cIiBzcmM9XCJpbWcvbG9nb19waC1iaWcuc3ZnXCIgd2lkdGg9XCIyMDFcIiBoZWlnaHQ9XCI4OVwiIGFsdD1cIlBpeGVsIEh1bnRlclwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJncmVldGluZ19fYXN0ZXJpc2sgYXN0ZXJpc2tcIj48c3BhbiBjbGFzcz1cInZpc3VhbGx5LWhpZGRlblwiPtCvINC/0YDQvtGB0YLQviDQutGA0LDRgdC40LLQsNGPINC30LLRkdC30LTQvtGH0LrQsDwvc3Bhbj4qPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyZWV0aW5nX19jaGFsbGVuZ2VcIj5cbiAgICAgICAgICAgICAgICAgIDxoMyBjbGFzcz1cImdyZWV0aW5nX19jaGFsbGVuZ2UtdGl0bGVcIj7Qm9GD0YfRiNC40LUg0YXRg9C00L7QttC90LjQutC4LdGE0L7RgtC+0YDQtdCw0LvQuNGB0YLRiyDQsdGA0L7RgdCw0Y7RgiDRgtC10LHQtSDQstGL0LfQvtCyITwvaDM+XG4gICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cImdyZWV0aW5nX19jaGFsbGVuZ2UtdGV4dFwiPtCf0YDQsNCy0LjQu9CwINC40LPRgNGLINC/0YDQvtGB0YLRizo8L3A+XG4gICAgICAgICAgICAgICAgICA8dWwgY2xhc3M9XCJncmVldGluZ19fY2hhbGxlbmdlLWxpc3RcIj5cbiAgICAgICAgICAgICAgICAgICAgPGxpPtCd0YPQttC90L4g0L7RgtC70LjRh9C40YLRjCDRgNC40YHRg9C90L7QuiDQvtGCINGE0L7RgtC+0LPRgNCw0YTQuNC4INC4INGB0LTQtdC70LDRgtGMINCy0YvQsdC+0YAuPC9saT5cbiAgICAgICAgICAgICAgICAgICAgPGxpPtCX0LDQtNCw0YfQsCDQutCw0LbQtdGC0YHRjyDRgtGA0LjQstC40LDQu9GM0L3QvtC5LCDQvdC+INC90LUg0LTRg9C80LDQuSwg0YfRgtC+INCy0YHQtSDRgtCw0Log0L/RgNC+0YHRgtC+LjwvbGk+XG4gICAgICAgICAgICAgICAgICAgIDxsaT7QpNC+0YLQvtGA0LXQsNC70LjQt9C8INC+0LHQvNCw0L3Rh9C40LIg0Lgg0LrQvtCy0LDRgNC10L0uPC9saT5cbiAgICAgICAgICAgICAgICAgICAgPGxpPtCf0L7QvNC90LgsINCz0LvQsNCy0L3QvtC1IOKAlCDRgdC80L7RgtGA0LXRgtGMINC+0YfQtdC90Ywg0LLQvdC40LzQsNGC0LXQu9GM0L3Qvi48L2xpPlxuICAgICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIFRPIFNUQVJUIEFSUk9XIC0tPlxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJncmVldGluZ19fdG9wIHRvcFwiIHR5cGU9XCJidXR0b25cIj5cbiAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPVwiaW1nL2ljb24tdG9wLnN2Z1wiIHdpZHRoPVwiNzFcIiBoZWlnaHQ9XCI3OVwiIGFsdD1cItCi0L7QvyDQuNCz0YDQvtC60L7QslwiPlxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgICAgICA8L2Rpdj5gO1xuICB9XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YXJ0QXJyb3dWaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPGJ1dHRvbiBjbGFzcz1cImdyZWV0aW5nX19jb250aW51ZVwiIHR5cGU9XCJidXR0b25cIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ2aXN1YWxseS1oaWRkZW5cIj7Qn9GA0L7QtNC+0LvQttC40YLRjDwvc3Bhbj5cbiAgICAgICAgICAgICAgPHN2ZyBjbGFzcz1cImljb25cIiB3aWR0aD1cIjY0XCIgaGVpZ2h0PVwiNjRcIiB2aWV3Qm94PVwiMCAwIDY0IDY0XCIgZmlsbD1cIiMwMDAwMDBcIj5cbiAgICAgICAgICAgICAgICA8dXNlIHhsaW5rOmhyZWY9XCJpbWcvc3ByaXRlLnN2ZyNhcnJvdy1yaWdodFwiPjwvdXNlPlxuICAgICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgIDwvYnV0dG9uPmA7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYHNlY3Rpb24uZ3JlZXRpbmdgKTtcbiAgICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XG4gIH1cblxuICBiaW5kKGNiKSB7XG4gICAgY29uc3Qgc3RhcnRBcnJvdyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5ncmVldGluZ19fY29udGludWVgKTtcbiAgICBzdGFydEFycm93LmFkZEV2ZW50TGlzdGVuZXIoYGNsaWNrYCwgY2IpO1xuICB9XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RTY3JlZW4gZnJvbSAnLi4vYWJzdHJhY3Qtc2NyZWVuLmpzJztcblxuaW1wb3J0IEdyZWV0aW5nU2NyZWVuVmlldyBmcm9tICcuL2dyZWV0aW5nLXNjcmVlbi12aWV3LmpzJztcbmltcG9ydCBTdGFydEFycm93VmlldyBmcm9tICcuL3N0YXJ0LWFycm93LXZpZXcuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHcmVldGluZ1NjcmVlbiBleHRlbmRzIEFic3RyYWN0U2NyZWVuIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMudmlldyA9IG5ldyBHcmVldGluZ1NjcmVlblZpZXcoKTtcbiAgfVxuXG4gIF9vblNjcmVlblNob3coKSB7XG4gICAgY29uc3Qgc3RhcnRBcnJvdyA9IG5ldyBTdGFydEFycm93VmlldygpO1xuICAgIHN0YXJ0QXJyb3cucmVuZGVyKCk7XG4gICAgc3RhcnRBcnJvdy5iaW5kKHRoaXMubmV4dFNjcmVlbi5zaG93LmJpbmQodGhpcy5uZXh0U2NyZWVuKSk7XG4gIH1cbn1cbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUnVsZXNTY3JlZW5WaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPGRpdiBpZD1cIm1haW5cIiBjbGFzcz1cImNlbnRyYWxfX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgPGhlYWRlciBjbGFzcz1cImhlYWRlclwiPlxuICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgVE8gQkFDSyBBUlJPVyAtLT5cbiAgICAgICAgICAgICAgPC9oZWFkZXI+XG4gICAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzPVwicnVsZXNcIj5cbiAgICAgICAgICAgICAgICA8aDIgY2xhc3M9XCJydWxlc19fdGl0bGVcIj7Qn9GA0LDQstC40LvQsDwvaDI+XG4gICAgICAgICAgICAgICAgPHVsIGNsYXNzPVwicnVsZXNfX2Rlc2NyaXB0aW9uXCI+XG4gICAgICAgICAgICAgICAgICA8bGk+0KPQs9Cw0LTQsNC5IDEwINGA0LDQtyDQtNC70Y8g0LrQsNC20LTQvtCz0L4g0LjQt9C+0LHRgNCw0LbQtdC90LjRjyDRhNC+0YLQvlxuICAgICAgICAgICAgICAgICAgICA8aW1nIGNsYXNzPVwicnVsZXNfX2ljb25cIiBzcmM9XCJpbWcvaWNvbi1waG90by5wbmdcIiB3aWR0aD1cIjMyXCIgaGVpZ2h0PVwiMzFcIiBhbHQ9XCLQpNC+0YLQvlwiPiDQuNC70Lgg0YDQuNGB0YPQvdC+0LpcbiAgICAgICAgICAgICAgICAgICAgPGltZyBjbGFzcz1cInJ1bGVzX19pY29uXCIgc3JjPVwiaW1nL2ljb24tcGFpbnQucG5nXCIgd2lkdGg9XCIzMlwiIGhlaWdodD1cIjMxXCIgYWx0PVwi0KDQuNGB0YPQvdC+0LpcIj48L2xpPlxuICAgICAgICAgICAgICAgICAgPGxpPtCk0L7RgtC+0LPRgNCw0YTQuNGP0LzQuCDQuNC70Lgg0YDQuNGB0YPQvdC60LDQvNC4INC80L7Qs9GD0YIg0LHRi9GC0Ywg0L7QsdCwINC40LfQvtCx0YDQsNC20LXQvdC40Y8uPC9saT5cbiAgICAgICAgICAgICAgICAgIDxsaT7QndCwINC60LDQttC00YPRjiDQv9C+0L/Ri9GC0LrRgyDQvtGC0LLQvtC00LjRgtGB0Y8gMzAg0YHQtdC60YPQvdC0LjwvbGk+XG4gICAgICAgICAgICAgICAgICA8bGk+0J7RiNC40LHQuNGC0YzRgdGPINC80L7QttC90L4g0L3QtSDQsdC+0LvQtdC1IDMg0YDQsNC3LjwvbGk+XG4gICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgICA8cCBjbGFzcz1cInJ1bGVzX19yZWFkeVwiPtCT0L7RgtC+0LLRiz88L3A+XG4gICAgICAgICAgICAgICAgPGZvcm0gY2xhc3M9XCJydWxlc19fZm9ybVwiPlxuICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBUTyBOQU1FIElOUFVUIC0tPlxuICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBUTyBTVEFSVCBCVVRUT04gLS0+XG4gICAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgICAgICA8L2Rpdj5gO1xuICB9XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE5hbWVJbnB1dFZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuIGA8aW5wdXQgY2xhc3M9XCJydWxlc19faW5wdXRcIiB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwi0JLQsNGI0LUg0JjQvNGPXCI+YDtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgZm9ybS5ydWxlc19fZm9ybWApO1xuICAgIHRoaXMuZWxlbWVudC52YWx1ZSA9IGBgO1xuICAgIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIGJpbmQoKSB7XG4gICAgY29uc3QgbmFtZUlucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLnJ1bGVzX19pbnB1dGApO1xuICAgIGNvbnN0IHN0YXJ0QnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLnJ1bGVzX19idXR0b25gKTtcbiAgICBuYW1lSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihgaW5wdXRgLCAoKSA9PiB7XG4gICAgICBzdGFydEJ0bi5kaXNhYmxlZCA9IChuYW1lSW5wdXQudmFsdWUgPT09IGBgKSA/IHRydWUgOiBmYWxzZTtcbiAgICB9KTtcbiAgfVxufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGFydEJ1dHRvblZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuIGA8YnV0dG9uIGNsYXNzPVwicnVsZXNfX2J1dHRvbiAgY29udGludWVcIiB0eXBlPVwic3VibWl0XCIgZGlzYWJsZWQ+R28hPC9idXR0b24+YDtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgZm9ybS5ydWxlc19fZm9ybWApO1xuICAgIHRoaXMuZWxlbWVudC5kaXNhYmxlZCA9IHRydWU7XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgYmluZChjYikge1xuICAgIGNvbnN0IHN0YXJ0QnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLnJ1bGVzX19idXR0b25gKTtcbiAgICBzdGFydEJ0bi5hZGRFdmVudExpc3RlbmVyKGBjbGlja2AsIGNiKTtcbiAgfVxufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYWNrQXJyb3dWaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPGJ1dHRvbiBjbGFzcz1cImJhY2tcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ2aXN1YWxseS1oaWRkZW5cIj7QktC10YDQvdGD0YLRjNGB0Y8g0Log0L3QsNGH0LDQu9GDPC9zcGFuPlxuICAgICAgICAgICAgICA8c3ZnIGNsYXNzPVwiaWNvblwiIHdpZHRoPVwiNDVcIiBoZWlnaHQ9XCI0NVwiIHZpZXdCb3g9XCIwIDAgNDUgNDVcIiBmaWxsPVwiIzAwMDAwMFwiPlxuICAgICAgICAgICAgICAgIDx1c2UgeGxpbms6aHJlZj1cImltZy9zcHJpdGUuc3ZnI2Fycm93LWxlZnRcIj48L3VzZT5cbiAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICAgIDxzdmcgY2xhc3M9XCJpY29uXCIgd2lkdGg9XCIxMDFcIiBoZWlnaHQ9XCI0NFwiIHZpZXdCb3g9XCIwIDAgMTAxIDQ0XCIgZmlsbD1cIiMwMDAwMDBcIj5cbiAgICAgICAgICAgICAgICA8dXNlIHhsaW5rOmhyZWY9XCJpbWcvc3ByaXRlLnN2ZyNsb2dvLXNtYWxsXCI+PC91c2U+XG4gICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgPC9idXR0b24+YDtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgaGVhZGVyLmhlYWRlcmApO1xuICAgIHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKHRoaXMuZWxlbWVudCwgcGFyZW50RWxlbWVudC5maXJzdENoaWxkKTtcbiAgfVxuXG4gIGJpbmQoY2IpIHtcbiAgICBjb25zdCBiYWNrQXJyb3cgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuYmFja2ApO1xuICAgIGJhY2tBcnJvdy5hZGRFdmVudExpc3RlbmVyKGBjbGlja2AsIGNiKTtcbiAgfVxufVxuIiwiaW1wb3J0IEFic3RyYWN0U2NyZWVuIGZyb20gJy4uL2Fic3RyYWN0LXNjcmVlbi5qcyc7XG5cbmltcG9ydCBSdWxlc1NjcmVlblZpZXcgZnJvbSAnLi9ydWxlcy1zY3JlZW4tdmlldy5qcyc7XG5pbXBvcnQgTmFtZUlucHV0VmlldyBmcm9tICcuL25hbWUtaW5wdXQtdmlldy5qcyc7XG5pbXBvcnQgU3RhcnRCdXR0b25WaWV3IGZyb20gJy4vc3RhcnQtYnV0dG9uLXZpZXcuanMnO1xuaW1wb3J0IEJhY2tBcnJvd1ZpZXcgZnJvbSAnLi4vdXRpbC12aWV3cy9iYWNrLWFycm93LXZpZXcuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSdWxlc1NjcmVlbiBleHRlbmRzIEFic3RyYWN0U2NyZWVuIHtcblxuICBjb25zdHJ1Y3RvcihnYW1lTW9kZWwpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZ2FtZU1vZGVsID0gZ2FtZU1vZGVsO1xuICAgIHRoaXMudmlldyA9IG5ldyBSdWxlc1NjcmVlblZpZXcoKTtcbiAgfVxuXG4gIF9vblNjcmVlblNob3coKSB7XG4gICAgY29uc3QgbmFtZUlucHV0ID0gbmV3IE5hbWVJbnB1dFZpZXcoKTtcbiAgICBjb25zdCBzdGFydEJ0biA9IG5ldyBTdGFydEJ1dHRvblZpZXcoKTtcbiAgICBjb25zdCBiYWNrQXJyb3cgPSBuZXcgQmFja0Fycm93VmlldygpO1xuICAgIGNvbnN0IG9uU3RhcnRCdG5DbGljayA9IHRoaXMuX29uU3RhcnRCdG5DbGljay5iaW5kKHRoaXMpO1xuICAgIGNvbnN0IHJlc3RhcnRHYW1lID0gdGhpcy5fcmVzdGFydEdhbWUuYmluZCh0aGlzKTtcblxuICAgIG5hbWVJbnB1dC5yZW5kZXIoKTtcbiAgICBzdGFydEJ0bi5yZW5kZXIoKTtcbiAgICBiYWNrQXJyb3cucmVuZGVyKCk7XG5cbiAgICBzdGFydEJ0bi5iaW5kKG9uU3RhcnRCdG5DbGljayk7XG4gICAgbmFtZUlucHV0LmJpbmQoKTtcbiAgICBiYWNrQXJyb3cuYmluZChyZXN0YXJ0R2FtZSk7XG4gIH1cblxuICBfb25TdGFydEJ0bkNsaWNrKCkge1xuICAgIGNvbnN0IG5hbWVJbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5ydWxlc19faW5wdXRgKTtcbiAgICB0aGlzLmdhbWVNb2RlbC5wbGF5ZXJOYW1lID0gbmFtZUlucHV0LnZhbHVlLnRyaW0oKTtcbiAgICB0aGlzLm5leHRTY3JlZW4uc2hvdygpO1xuICB9XG59XG4iLCJpbXBvcnQgY29uZmlnIGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdhbWVTY3JlZW5WaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcihnYW1lKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPGRpdiBpZD1cIm1haW5cIiBjbGFzcz1cImNlbnRyYWxfX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgPGhlYWRlciBjbGFzcz1cImhlYWRlclwiPlxuICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgVE8gQkFDSyBBUlJPVyAtLT5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ2FtZV9fdGltZXJcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ2FtZV9fbGl2ZXNcIj48L2Rpdj5cbiAgICAgICAgICAgICAgPC9oZWFkZXI+XG4gICAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzPVwiZ2FtZVwiPlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwiZ2FtZV9fdGFza1wiPiR7dGhpcy5nYW1lLnF1ZXN0aW9ufTwvcD5cbiAgICAgICAgICAgICAgICAke0dhbWVTY3JlZW5WaWV3LmdldEdhbWVDb250ZW50KHRoaXMuZ2FtZS50eXBlKX1cbiAgICAgICAgICAgICAgICA8dWwgY2xhc3M9XCJzdGF0c1wiPjwvdWw+XG4gICAgICAgICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgICAgIDwvZGl2PmA7XG4gIH1cblxuICBzdGF0aWMgZ2V0R2FtZUNvbnRlbnQoZ2FtZVR5cGUpIHtcbiAgICBsZXQgY29udGVudCA9IGBgO1xuICAgIGlmIChnYW1lVHlwZSA9PT0gY29uZmlnLlF1ZXN0aW9uVHlwZS5USU5ERVJfTElLRSkge1xuICAgICAgY29udGVudCA9IGA8Zm9ybSBjbGFzcz1cImdhbWVfX2NvbnRlbnQgIGdhbWVfX2NvbnRlbnQtLXdpZGVcIj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJnYW1lX19vcHRpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgSU1BR0UgLS0+XG4gICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIEFOU1dFUiBQSE9UTyBCVVRUT04gLS0+XG4gICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIEFOU1dFUiBQQUlOVCBCVVRUT04gLS0+XG4gICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgPC9mb3JtPmA7XG4gICAgfSBlbHNlIGlmIChnYW1lVHlwZSA9PT0gY29uZmlnLlF1ZXN0aW9uVHlwZS5UV09fT0ZfVFdPKSB7XG4gICAgICBjb250ZW50ID0gYDxmb3JtIGNsYXNzPVwiZ2FtZV9fY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJnYW1lX19vcHRpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIElNQUdFIC0tPlxuICAgICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgQU5TV0VSIFBIT1RPIEJVVFRPTiAtLT5cbiAgICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIEFOU1dFUiBQQUlOVCBCVVRUT04gLS0+XG4gICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdhbWVfX29wdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgSU1BR0UgLS0+XG4gICAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBBTlNXRVIgUEhPVE8gQlVUVE9OIC0tPlxuICAgICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgQU5TV0VSIFBBSU5UIEJVVFRPTiAtLT5cbiAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgPC9mb3JtPmA7XG4gICAgfSBlbHNlIGlmIChnYW1lVHlwZSA9PT0gY29uZmlnLlF1ZXN0aW9uVHlwZS5PTkVfT0ZfVEhSRUUpIHtcbiAgICAgIGNvbnRlbnQgPSBgPGZvcm0gY2xhc3M9XCJnYW1lX19jb250ZW50ICBnYW1lX19jb250ZW50LS10cmlwbGVcIj5cbiAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBBTlNXRVIgUEFJTlQgT1BUSU9OIC0tPlxuICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIEFOU1dFUiBQQUlOVCBPUFRJT04gLS0+XG4gICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgQU5TV0VSIFBBSU5UIE9QVElPTiAtLT5cbiAgICAgICAgICAgICAgICAgPC9mb3JtPmA7XG4gICAgfVxuICAgIHJldHVybiBjb250ZW50O1xuICB9XG5cbn1cbiIsImltcG9ydCBjb25maWcgZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGltZXJCbG9ja1ZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5faXNBY3RpdmUgPSB0cnVlO1xuICAgIHRoaXMuX3RpbWUgPSBjb25maWcuVElNRV9UT19BTlNXRVI7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgY29uc3QgdGltZSA9IFRpbWVyQmxvY2tWaWV3LmdldFRpbWVGb3JtYXR0ZWQodGhpcy50aW1lKTtcbiAgICByZXR1cm4gYDxkaXYgY2xhc3M9XCJnYW1lX190aW1lclwiPiR7dGltZX08L2Rpdj5gO1xuICB9XG5cbiAgZ2V0IHRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3RpbWU7XG4gIH1cblxuICBzZXQgdGltZShuZXdUaW1lKSB7XG4gICAgdGhpcy5fdGltZSA9IG5ld1RpbWU7XG4gIH1cblxuICBnZXQgaXNBY3RpdmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzQWN0aXZlO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBoZWFkZXIuaGVhZGVyYCk7XG4gICAgcGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUodGhpcy5lbGVtZW50LCBwYXJlbnRFbGVtZW50LmZpcnN0Q2hpbGQpO1xuICB9XG5cbiAgdXBkYXRlKCkge1xuICAgIGlmICh0aGlzLl9pc0FjdGl2ZSAmJiB0aGlzLnRpbWUgPiAwKSB7XG4gICAgICB0aGlzLnRpbWUgPSB0aGlzLnRpbWUgLSAxMDAwO1xuICAgICAgY29uc3QgdGltZSA9IFRpbWVyQmxvY2tWaWV3LmdldFRpbWVGb3JtYXR0ZWQodGhpcy50aW1lKTtcbiAgICAgIGNvbnN0IHRpbWVyRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYGRpdi5nYW1lX190aW1lcmApO1xuICAgICAgdGltZXJFbGVtZW50LnRleHRDb250ZW50ID0gdGltZTtcbiAgICAgIGlmICh0aGlzLnRpbWUgPT09IDUwMDAgfHwgdGhpcy50aW1lID09PSAzMDAwIHx8IHRoaXMudGltZSA9PT0gMTAwMCkge1xuICAgICAgICB0aW1lckVsZW1lbnQuc3R5bGUgPSBgY29sb3I6ICR7Y29uZmlnLkNPTE9SX1JFRH07YDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRpbWVyRWxlbWVudC5zdHlsZSA9IGBjb2xvcjogYmxhY2s7YDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzdG9wKCkge1xuICAgIHRoaXMuX2lzQWN0aXZlID0gZmFsc2U7XG4gIH1cblxuICBzdGF0aWMgZ2V0VGltZUZvcm1hdHRlZCh0aW1lKSB7XG4gICAgY29uc3QgUkVHRVggPSAvXlxcZCQvO1xuICAgIGxldCBtaW4gPSBgYCArIE1hdGguZmxvb3IodGltZSAvIDEwMDAgLyA2MCk7XG4gICAgbGV0IHNlYyA9IGBgICsgTWF0aC5mbG9vcigodGltZSAtIChtaW4gKiAxMDAwICogNjApKSAvIDEwMDApO1xuICAgIGlmIChSRUdFWC50ZXN0KHNlYykpIHtcbiAgICAgIHNlYyA9IGAwJHtzZWN9YDtcbiAgICB9XG4gICAgaWYgKFJFR0VYLnRlc3QobWluKSkge1xuICAgICAgbWluID0gYDAke21pbn1gO1xuICAgIH1cbiAgICByZXR1cm4gYCR7bWlufToke3NlY31gO1xuICB9XG59XG4iLCJpbXBvcnQgY29uZmlnIGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExpdmVzQmxvY2tWaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcihsaXZlcykge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5saXZlcyA9IGxpdmVzO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIGxldCByZXN1bHQgPSBgYDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbmZpZy5MSVZFU19DT1VOVDsgaSsrKSB7XG4gICAgICByZXN1bHQgKz0gYDxpbWcgc3JjPVwiaW1nL2hlYXJ0X18keyh0aGlzLmxpdmVzID4gMCkgPyBgZnVsbGAgOiBgZW1wdHlgfS5zdmdcIiBjbGFzcz1cImdhbWVfX2hlYXJ0XCIgYWx0PVwiTGlmZVwiIHdpZHRoPVwiMzFcIiBoZWlnaHQ9XCIyN1wiPmA7XG4gICAgICB0aGlzLmxpdmVzLS07XG4gICAgfVxuICAgIHJldHVybiBgPGRpdiBjbGFzcz1cImdhbWVfX2xpdmVzXCI+JHtyZXN1bHR9PC9kaXY+YDtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgaGVhZGVyLmhlYWRlcmApO1xuICAgIGNvbnN0IG9sZEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBkaXYuZ2FtZV9fbGl2ZXNgKTtcbiAgICBwYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKG9sZEVsZW1lbnQpO1xuICAgIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxufVxuIiwiaW1wb3J0IGNvbmZpZyBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGF0c0Jsb2NrVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoYW5zd2Vycykge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5hbnN3ZXJzID0gYW5zd2VycztcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICBsZXQgcmVzdWx0ID0gYGA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb25maWcuR0FNRVNfQ09VTlQ7IGkrKykge1xuICAgICAgY29uc3QgYW5zd2VyID0gdGhpcy5hbnN3ZXJzW2ldO1xuICAgICAgbGV0IG1vZGlmaWVyID0gYGA7XG4gICAgICBpZiAoYW5zd2VyKSB7XG4gICAgICAgIGlmIChhbnN3ZXIuaXNPSykge1xuICAgICAgICAgIG1vZGlmaWVyID0gYGNvcnJlY3RgO1xuICAgICAgICAgIGlmIChhbnN3ZXIudGltZSA8IDEwKSB7XG4gICAgICAgICAgICBtb2RpZmllciA9IGBmYXN0YDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGFuc3dlci50aW1lID4gMjApIHtcbiAgICAgICAgICAgIG1vZGlmaWVyID0gYHNsb3dgO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtb2RpZmllciA9IGB3cm9uZ2A7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1vZGlmaWVyID0gYHVua25vd25gO1xuICAgICAgfVxuICAgICAgcmVzdWx0ICs9IGA8bGkgY2xhc3M9XCJzdGF0c19fcmVzdWx0IHN0YXRzX19yZXN1bHQtLSR7bW9kaWZpZXJ9XCI+PC9saT5gO1xuICAgIH1cbiAgICByZXR1cm4gYDx1bCBjbGFzcz1cInN0YXRzXCI+JHtyZXN1bHR9PC91bD5gO1xufVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihgc2VjdGlvbi5nYW1lYCk7XG4gICAgY29uc3Qgb2xkRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYHVsLnN0YXRzYCk7XG4gICAgcGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChvbGRFbGVtZW50KTtcbiAgICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XG4gIH1cbn1cbiIsImNvbnN0IERFQlVHX09OID0gdHJ1ZTtcbmNvbnN0IFNUWUxFID0gYHN0eWxlPVwiYm94LXNoYWRvdzogMHB4IDBweCAxMHB4IDEycHggcmdiYSgxOSwxNzMsMjQsMSk7XCJgO1xuXG5mdW5jdGlvbiBpc1Bob3RvKGFuc3dlcikge1xuICByZXR1cm4gKERFQlVHX09OICYmIGFuc3dlciA9PT0gYHBob3RvYCkgPyBTVFlMRSA6IGBgO1xufVxuXG5mdW5jdGlvbiBpc1BhaW50KGFuc3dlcikge1xuICByZXR1cm4gKERFQlVHX09OICYmIGFuc3dlciA9PT0gYHBhaW50aW5nYCkgPyBTVFlMRSA6IGBgO1xufVxuXG5mdW5jdGlvbiBpc0NvcnJlY3QoaXNDb3JyZWN0KSB7XG4gIHJldHVybiAoREVCVUdfT04gJiYgaXNDb3JyZWN0KSA/IFNUWUxFIDogYGA7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtpc1Bob3RvLCBpc1BhaW50LCBpc0NvcnJlY3R9O1xuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuaW1wb3J0IGRlYnVnIGZyb20gJy4uL2RlYnVnLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQW5zd2VyUGhvdG9CdXR0b25WaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcihhbnN3ZXJJbmRleCwgZ2FtZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5nYW1lID0gZ2FtZTtcbiAgICB0aGlzLmFuc3dlckluZGV4ID0gYW5zd2VySW5kZXg7XG4gICAgdGhpcy5hbnN3ZXJUeXBlID0gZ2FtZS5hbnN3ZXJzW2Fuc3dlckluZGV4XS50eXBlO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPGxhYmVsIGNsYXNzPVwiZ2FtZV9fYW5zd2VyIGdhbWVfX2Fuc3dlci0tcGhvdG9cIj5cbiAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwidmlzdWFsbHktaGlkZGVuXCIgdmFsdWU9XCJwaG90b1wiIG5hbWU9XCJxdWVzdGlvbiAke3RoaXMuYW5zd2VySW5kZXh9XCIgdHlwZT1cInJhZGlvXCIgZGF0YS1hbnN3ZXJpbmRleD1cIiR7dGhpcy5hbnN3ZXJJbmRleH1cIj5cbiAgICAgICAgICAgICAgPHNwYW4gJHtkZWJ1Zy5pc1Bob3RvKHRoaXMuYW5zd2VyVHlwZSl9PtCk0L7RgtC+PC9zcGFuPlxuICAgICAgICAgICAgPC9sYWJlbD5gO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdkaXYuZ2FtZV9fb3B0aW9uJylbdGhpcy5hbnN3ZXJJbmRleF07XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgYmluZChjYikge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdkaXYuZ2FtZV9fb3B0aW9uJylbdGhpcy5hbnN3ZXJJbmRleF07XG4gICAgY29uc3QgYW5zd2VyRWxlbWVudCA9IHBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcihgLmdhbWVfX2Fuc3dlci0tcGhvdG8gPiBpbnB1dGApO1xuICAgIGFuc3dlckVsZW1lbnQuY2hlY2tlZCA9IGZhbHNlO1xuICAgIGFuc3dlckVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihgY2xpY2tgLCBjYik7XG4gIH1cbn1cbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcbmltcG9ydCBkZWJ1ZyBmcm9tICcuLi9kZWJ1Zy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFuc3dlclBhaW50QnV0dG9uVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoYW5zd2VySW5kZXgsIGdhbWUpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XG4gICAgdGhpcy5hbnN3ZXJJbmRleCA9IGFuc3dlckluZGV4O1xuICAgIHRoaXMuYW5zd2VyVHlwZSA9IGdhbWUuYW5zd2Vyc1thbnN3ZXJJbmRleF0udHlwZTtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gYDxsYWJlbCBjbGFzcz1cImdhbWVfX2Fuc3dlciBnYW1lX19hbnN3ZXItLXBhaW50XCI+XG4gICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInZpc3VhbGx5LWhpZGRlblwiIHZhbHVlPVwicGFpbnRpbmdcIiBuYW1lPVwicXVlc3Rpb24gJHt0aGlzLmFuc3dlckluZGV4fVwiIHR5cGU9XCJyYWRpb1wiIGRhdGEtYW5zd2VyaW5kZXg9XCIke3RoaXMuYW5zd2VySW5kZXh9XCI+XG4gICAgICAgICAgICAgIDxzcGFuICR7ZGVidWcuaXNQYWludCh0aGlzLmFuc3dlclR5cGUpfT7QoNC40YHRg9C90L7Qujwvc3Bhbj5cbiAgICAgICAgICAgIDwvbGFiZWw+YDtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnZGl2LmdhbWVfX29wdGlvbicpW3RoaXMuYW5zd2VySW5kZXhdO1xuICAgIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIGJpbmQoY2IpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnZGl2LmdhbWVfX29wdGlvbicpW3RoaXMuYW5zd2VySW5kZXhdO1xuICAgIGNvbnN0IGFuc3dlckVsZW1lbnQgPSBwYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoYC5nYW1lX19hbnN3ZXItLXBhaW50ID4gaW5wdXRgKTtcbiAgICBhbnN3ZXJFbGVtZW50LmNoZWNrZWQgPSBmYWxzZTtcbiAgICBhbnN3ZXJFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoYGNsaWNrYCwgY2IpO1xuICB9XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5pbXBvcnQgZGVidWcgZnJvbSAnLi4vZGVidWcuanMnO1xuaW1wb3J0IEdhbWVNb2RlbCBmcm9tICcuLi9nYW1lLW1vZGVsL2dhbWUtbW9kZWwuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBbnN3ZXJQYWludE9wdGlvblZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKGFuc3dlckluZGV4LCBnYW1lKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xuICAgIHRoaXMuYW5zd2VySW5kZXggPSBhbnN3ZXJJbmRleDtcbiAgICB0aGlzLmFuc3dlclR5cGUgPSBnYW1lLmFuc3dlcnNbYW5zd2VySW5kZXhdLnR5cGU7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgY29uc3QgY29ycmVjdEFuc3dlciA9IEdhbWVNb2RlbC5nZXRDb3JyZWN0QW5zd2VyKHRoaXMuZ2FtZSk7XG4gICAgcmV0dXJuIGA8ZGl2IGNsYXNzPVwiZ2FtZV9fb3B0aW9uXCIgZGF0YS1hbnN3ZXI9XCIke3RoaXMuYW5zd2VyVHlwZX1cIiBkYXRhLWFuc3dlcmluZGV4PVwiJHt0aGlzLmFuc3dlckluZGV4fVwiICR7ZGVidWcuaXNDb3JyZWN0KHRoaXMuYW5zd2VyVHlwZSA9PT0gY29ycmVjdEFuc3dlcil9PlxuICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBJTUFHRSAtLT5cbiAgICAgICAgICAgIDwvZGl2PmA7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Zvcm0uZ2FtZV9fY29udGVudC0tdHJpcGxlJyk7XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgYmluZChjYikge1xuICAgIGNvbnN0IGFuc3dlckVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGAuZ2FtZV9fb3B0aW9uYClbdGhpcy5hbnN3ZXJJbmRleF07XG4gICAgYW5zd2VyRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGBjbGlja2AsIGNiKTtcbiAgfVxufVxuIiwiLy8gTWFuYWdpbmcgc2l6ZVxuLy8gQHBhcmFtICB7b2JqZWN0fSBmcmFtZSDQvtC/0LjRgdGL0LLQsNC10YIg0YDQsNC30LzQtdGA0Ysg0YDQsNC80LrQuCwg0LIg0LrQvtGC0L7RgNGL0LUg0LTQvtC70LbQvdC+INCx0YvRgtGMINCy0L/QuNGB0LDQvdC+INC40LfQvtCx0YDQsNC20LXQvdC40LVcbi8vIEBwYXJhbSAge29iamVjdH0gZ2l2ZW4g0L7Qv9C40YHRi9Cy0LDQtdGCINGI0LjRgNC40L3RgyDQuCDQstGL0YHQvtGC0YMg0LjQt9C+0LHRgNCw0LbQtdC90LjRjywg0LrQvtGC0L7RgNC+0LUg0L3Rg9C20L3QviDQv9C+0LTQvtCz0L3QsNGC0Ywg0L/QvtC0INGA0LDQvNC60YNcbi8vIEByZXR1cm4ge29iamVjdH0g0L3QvtCy0YvQuSDQvtCx0YrQtdC60YIsINC60L7RgtC+0YDRi9C5INCx0YPQtNC10YIg0YHQvtC00LXRgNC20LDRgtGMINC40LfQvNC10L3RkdC90L3Ri9C1INGA0LDQt9C80LXRgNGLINC40LfQvtCx0YDQsNC20LXQvdC40Y9cbmV4cG9ydCBkZWZhdWx0ICBmdW5jdGlvbiByZXNpemUoZnJhbWUsIGdpdmVuKSB7XG4gIGxldCB3aWR0aCA9IGdpdmVuLndpZHRoO1xuICBsZXQgaGVpZ2h0ID0gZ2l2ZW4uaGVpZ2h0O1xuICBpZiAod2lkdGggPiBmcmFtZS53aWR0aCkge1xuICAgIGNvbnN0IG11bHRpcGxpZXIgPSB3aWR0aCAvIGZyYW1lLndpZHRoO1xuICAgIHdpZHRoID0gZnJhbWUud2lkdGg7XG4gICAgaGVpZ2h0ID0gTWF0aC5mbG9vcihoZWlnaHQgLyBtdWx0aXBsaWVyKTtcbiAgfVxuICBpZiAoaGVpZ2h0ID4gZnJhbWUuaGVpZ2h0KSB7XG4gICAgY29uc3QgbXVsdGlwbGllciA9IGhlaWdodCAvIGZyYW1lLmhlaWdodDtcbiAgICBoZWlnaHQgPSBmcmFtZS5oZWlnaHQ7XG4gICAgd2lkdGggPSBNYXRoLmZsb29yKHdpZHRoIC8gbXVsdGlwbGllcik7XG4gIH1cbiAgcmV0dXJuIHt3aWR0aCwgaGVpZ2h0fTtcbn1cbiIsImltcG9ydCBjb25maWcgZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcbmltcG9ydCByZXNpemUgZnJvbSBcIi4uL3Jlc2l6ZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbWFnZVZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKHF1ZXN0aW9uTnVtYmVyLCBnYW1lKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnF1ZXN0aW9uTnVtYmVyID0gcXVlc3Rpb25OdW1iZXI7XG4gICAgdGhpcy5nYW1lVHlwZSA9IGdhbWUudHlwZTtcbiAgICB0aGlzLmltYWdlID0gZ2FtZS5hbnN3ZXJzW3F1ZXN0aW9uTnVtYmVyXS5pbWFnZTtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICBjb25zdCBmcmFtZVNpemUgPSBjb25maWcuUXVlc3Rpb25UeXBlVG9GcmFtZVNpemVbdGhpcy5nYW1lVHlwZV07XG4gICAgY29uc3QgaW1hZ2VTaXplID0ge3dpZHRoOiB0aGlzLmltYWdlLndpZHRoLCBoZWlnaHQ6IHRoaXMuaW1hZ2UuaGVpZ2h0fTtcbiAgICBjb25zdCByZXNpemVkSW1hZ2VTaXplID0gcmVzaXplKGZyYW1lU2l6ZSwgaW1hZ2VTaXplKTtcbiAgICByZXR1cm4gYDxpbWcgc3JjPVwiJHt0aGlzLmltYWdlLnVybH1cIiBhbHQ9XCJPcHRpb24gJHt0aGlzLnF1ZXN0aW9uTnVtYmVyICsgMX1cIiB3aWR0aD1cIiR7cmVzaXplZEltYWdlU2l6ZS53aWR0aH1cIiBoZWlnaHQ9XCIke3Jlc2l6ZWRJbWFnZVNpemUuaGVpZ2h0fVwiPmA7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2Rpdi5nYW1lX19vcHRpb24nKVt0aGlzLnF1ZXN0aW9uTnVtYmVyXTtcbiAgICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XG4gIH1cbn1cbiIsImltcG9ydCBjb25maWcgZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCBBYnN0cmFjdFNjcmVlbiBmcm9tICcuLi9hYnN0cmFjdC1zY3JlZW4uanMnO1xuaW1wb3J0IEdhbWVNb2RlbCBmcm9tICcuLi9nYW1lLW1vZGVsL2dhbWUtbW9kZWwuanMnO1xuXG5pbXBvcnQgR2FtZVNjcmVlblZpZXcgZnJvbSAnLi9nYW1lLXNjcmVlbi12aWV3LmpzJztcbmltcG9ydCBUaW1lckJsb2NrVmlldyBmcm9tICcuL3RpbWVyLWJsb2NrLXZpZXcuanMnO1xuaW1wb3J0IExpdmVzQmxvY2tWaWV3IGZyb20gJy4vbGl2ZXMtYmxvY2stdmlldy5qcyc7XG5pbXBvcnQgU3RhdHNCbG9ja1ZpZXcgZnJvbSAnLi4vdXRpbC12aWV3cy9zdGF0cy1ibG9jay12aWV3LmpzJztcbmltcG9ydCBBbnN3ZXJQaG90b0J1dHRvblZpZXcgZnJvbSAnLi9hbnN3ZXItcGhvdG8tYnV0dG9uLXZpZXcuanMnO1xuaW1wb3J0IEFuc3dlclBhaW50QnV0dG9uVmlldyBmcm9tICcuL2Fuc3dlci1wYWludC1idXR0b24tdmlldy5qcyc7XG5pbXBvcnQgQW5zd2VyUGFpbnRPcHRpb25WaWV3IGZyb20gJy4vYW5zd2VyLXBhaW50LW9wdGlvbi12aWV3LmpzJztcbmltcG9ydCBJbWFnZVZpZXcgZnJvbSAnLi9pbWFnZS12aWV3LmpzJztcbmltcG9ydCBCYWNrQXJyb3dWaWV3IGZyb20gJy4uL3V0aWwtdmlld3MvYmFjay1hcnJvdy12aWV3LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FtZVNjcmVlbiBleHRlbmRzIEFic3RyYWN0U2NyZWVuIHtcblxuICBjb25zdHJ1Y3RvcihnYW1lTW9kZWwsIGdhbWUsIGluZGV4KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmdhbWVNb2RlbCA9IGdhbWVNb2RlbDtcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xuICAgIHRoaXMuZ2FtZUluZGV4ID0gaW5kZXg7XG4gICAgdGhpcy52aWV3ID0gbmV3IEdhbWVTY3JlZW5WaWV3KGdhbWUpO1xuICB9XG5cbiAgX29uU2NyZWVuU2hvdygpIHtcbiAgICBjb25zdCBnYW1lID0gdGhpcy5nYW1lO1xuICAgIGNvbnN0IGxpdmVzQmxvY2sgPSBuZXcgTGl2ZXNCbG9ja1ZpZXcodGhpcy5nYW1lTW9kZWwubGl2ZXMpO1xuICAgIGNvbnN0IHN0YXRzQmxvY2sgPSBuZXcgU3RhdHNCbG9ja1ZpZXcodGhpcy5nYW1lTW9kZWwuYW5zd2Vycyk7XG5cbiAgICBsaXZlc0Jsb2NrLnJlbmRlcigpO1xuICAgIHN0YXRzQmxvY2sucmVuZGVyKCk7XG5cbiAgICB0aGlzLnRpbWVyID0gbmV3IFRpbWVyQmxvY2tWaWV3KCk7XG4gICAgdGhpcy50aW1lci5yZW5kZXIoKTtcbiAgICB0aGlzLl90aW1lck9uKCk7XG5cbiAgICBjb25zdCBvbkV2ZXJ5QW5zd2VyID0gdGhpcy5fb25FdmVyeUFuc3dlci5iaW5kKHRoaXMpO1xuICAgIGlmIChnYW1lLnR5cGUgPT09IGNvbmZpZy5RdWVzdGlvblR5cGUuVElOREVSX0xJS0UpIHtcbiAgICAgIGNvbnN0IGFuc3dlcjFQaG90b0J1dHRvbiA9IG5ldyBBbnN3ZXJQaG90b0J1dHRvblZpZXcoMCwgZ2FtZSk7XG4gICAgICBjb25zdCBhbnN3ZXIxUGFpbnRCdXR0b24gPSBuZXcgQW5zd2VyUGFpbnRCdXR0b25WaWV3KDAsIGdhbWUpO1xuICAgICAgY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2VWaWV3KDAsIGdhbWUpO1xuICAgICAgYW5zd2VyMVBob3RvQnV0dG9uLnJlbmRlcigpO1xuICAgICAgYW5zd2VyMVBhaW50QnV0dG9uLnJlbmRlcigpO1xuICAgICAgaW1hZ2UucmVuZGVyKCk7XG4gICAgICBhbnN3ZXIxUGhvdG9CdXR0b24uYmluZChvbkV2ZXJ5QW5zd2VyKTtcbiAgICAgIGFuc3dlcjFQYWludEJ1dHRvbi5iaW5kKG9uRXZlcnlBbnN3ZXIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS50eXBlID09PSBjb25maWcuUXVlc3Rpb25UeXBlLlRXT19PRl9UV08pIHtcbiAgICAgIGNvbnN0IGFuc3dlcjFQaG90b0J1dHRvbiA9IG5ldyBBbnN3ZXJQaG90b0J1dHRvblZpZXcoMCwgZ2FtZSk7XG4gICAgICBjb25zdCBhbnN3ZXIxUGFpbnRCdXR0b24gPSBuZXcgQW5zd2VyUGFpbnRCdXR0b25WaWV3KDAsIGdhbWUpO1xuICAgICAgY29uc3QgaW1hZ2UxID0gbmV3IEltYWdlVmlldygwLCBnYW1lKTtcbiAgICAgIGNvbnN0IGFuc3dlcjJQaG90b0J1dHRvbiA9IG5ldyBBbnN3ZXJQaG90b0J1dHRvblZpZXcoMSwgZ2FtZSk7XG4gICAgICBjb25zdCBhbnN3ZXIyUGFpbnRCdXR0b24gPSBuZXcgQW5zd2VyUGFpbnRCdXR0b25WaWV3KDEsIGdhbWUpO1xuICAgICAgY29uc3QgaW1hZ2UyID0gbmV3IEltYWdlVmlldygxLCBnYW1lKTtcbiAgICAgIGFuc3dlcjFQaG90b0J1dHRvbi5yZW5kZXIoKTtcbiAgICAgIGFuc3dlcjFQYWludEJ1dHRvbi5yZW5kZXIoKTtcbiAgICAgIGltYWdlMS5yZW5kZXIoKTtcbiAgICAgIGFuc3dlcjFQaG90b0J1dHRvbi5iaW5kKG9uRXZlcnlBbnN3ZXIpO1xuICAgICAgYW5zd2VyMVBhaW50QnV0dG9uLmJpbmQob25FdmVyeUFuc3dlcik7XG4gICAgICBhbnN3ZXIyUGhvdG9CdXR0b24ucmVuZGVyKCk7XG4gICAgICBhbnN3ZXIyUGFpbnRCdXR0b24ucmVuZGVyKCk7XG4gICAgICBpbWFnZTIucmVuZGVyKCk7XG4gICAgICBhbnN3ZXIyUGhvdG9CdXR0b24uYmluZChvbkV2ZXJ5QW5zd2VyKTtcbiAgICAgIGFuc3dlcjJQYWludEJ1dHRvbi5iaW5kKG9uRXZlcnlBbnN3ZXIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS50eXBlID09PSBjb25maWcuUXVlc3Rpb25UeXBlLk9ORV9PRl9USFJFRSkge1xuICAgICAgY29uc3QgYW5zd2VyMVBhaW50T3B0aW9uVmlldyA9IG5ldyBBbnN3ZXJQYWludE9wdGlvblZpZXcoMCwgZ2FtZSk7XG4gICAgICBjb25zdCBpbWFnZTEgPSBuZXcgSW1hZ2VWaWV3KDAsIGdhbWUpO1xuICAgICAgY29uc3QgYW5zd2VyMlBhaW50T3B0aW9uVmlldyA9IG5ldyBBbnN3ZXJQYWludE9wdGlvblZpZXcoMSwgZ2FtZSk7XG4gICAgICBjb25zdCBpbWFnZTIgPSBuZXcgSW1hZ2VWaWV3KDEsIGdhbWUpO1xuICAgICAgY29uc3QgYW5zd2VyM1BhaW50T3B0aW9uVmlldyA9IG5ldyBBbnN3ZXJQYWludE9wdGlvblZpZXcoMiwgZ2FtZSk7XG4gICAgICBjb25zdCBpbWFnZTMgPSBuZXcgSW1hZ2VWaWV3KDIsIGdhbWUpO1xuICAgICAgYW5zd2VyMVBhaW50T3B0aW9uVmlldy5yZW5kZXIoKTtcbiAgICAgIGltYWdlMS5yZW5kZXIoKTtcbiAgICAgIGFuc3dlcjJQYWludE9wdGlvblZpZXcucmVuZGVyKCk7XG4gICAgICBpbWFnZTIucmVuZGVyKCk7XG4gICAgICBhbnN3ZXIzUGFpbnRPcHRpb25WaWV3LnJlbmRlcigpO1xuICAgICAgaW1hZ2UzLnJlbmRlcigpO1xuICAgICAgYW5zd2VyMVBhaW50T3B0aW9uVmlldy5iaW5kKG9uRXZlcnlBbnN3ZXIpO1xuICAgICAgYW5zd2VyMlBhaW50T3B0aW9uVmlldy5iaW5kKG9uRXZlcnlBbnN3ZXIpO1xuICAgICAgYW5zd2VyM1BhaW50T3B0aW9uVmlldy5iaW5kKG9uRXZlcnlBbnN3ZXIpO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3RhcnRHYW1lID0gdGhpcy5fcmVzdGFydEdhbWUuYmluZCh0aGlzKTtcblxuICAgIGNvbnN0IGJhY2tBcnJvdyA9IG5ldyBCYWNrQXJyb3dWaWV3KCk7XG4gICAgYmFja0Fycm93LnJlbmRlcigpO1xuICAgIGJhY2tBcnJvdy5iaW5kKHJlc3RhcnRHYW1lKTtcbiAgfVxuXG4gIF90aW1lck9uKCkge1xuICAgIGlmICh0aGlzLnRpbWVyLmlzQWN0aXZlICYmIHRoaXMudGltZXIudGltZSA+IDApIHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLnRpbWVyLnVwZGF0ZSgpO1xuICAgICAgICB0aGlzLl90aW1lck9uKCk7XG4gICAgICB9LCAxMDAwKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGltZXIudGltZSA9PT0gMCkge1xuICAgICAgdGhpcy5fb25WYWxpZEFuc3dlcihmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgX29uRXZlcnlBbnN3ZXIoZXZ0KSB7XG4gICAgaWYgKHRoaXMuZ2FtZS50eXBlID09PSBjb25maWcuUXVlc3Rpb25UeXBlLk9ORV9PRl9USFJFRSkge1xuICAgICAgY29uc3QgaW5wdXQgPSBldnQuY3VycmVudFRhcmdldDtcbiAgICAgIGNvbnN0IGFuc3dlckluZGV4ID0gR2FtZVNjcmVlbi5nZXRBbnN3ZXJJbmRleChpbnB1dCk7XG4gICAgICBjb25zdCBhY3R1YWxBbnN3ZXIgPSB0aGlzLl9nZXRBbnN3ZXJUeXBlKHRoaXMuZ2FtZUluZGV4LCBhbnN3ZXJJbmRleCk7XG4gICAgICBjb25zdCBjb3JyZWN0QW5zd2VyID0gR2FtZU1vZGVsLmdldENvcnJlY3RBbnN3ZXIodGhpcy5nYW1lKTtcbiAgICAgIGNvbnN0IGlzT0sgPSBhY3R1YWxBbnN3ZXIgPT09IGNvcnJlY3RBbnN3ZXI7XG4gICAgICB0aGlzLl9vblZhbGlkQW5zd2VyKGlzT0spO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBpc0FsbCA9IHRoaXMuX2lzQWxsQW5zd2Vyc0dpdmVuKCk7XG4gICAgICBpZiAoaXNBbGwpIHtcbiAgICAgICAgY29uc3QgaXNPSyA9IHRoaXMuX2lzQWxsQW5zd2Vyc0dpdmVuQ29ycmVjdCgpO1xuICAgICAgICB0aGlzLl9vblZhbGlkQW5zd2VyKGlzT0spO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9pc0FsbEFuc3dlcnNHaXZlbigpIHtcbiAgICBjb25zdCBvcHRpb25zID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGAuZ2FtZV9fb3B0aW9uYCkpO1xuICAgIHJldHVybiBvcHRpb25zLmV2ZXJ5KChvcHRpb24pID0+IHtcbiAgICAgIGNvbnN0IGFuc3dlcnMgPSBBcnJheS5mcm9tKG9wdGlvbi5xdWVyeVNlbGVjdG9yQWxsKGAuZ2FtZV9fYW5zd2VyYCkpO1xuICAgICAgcmV0dXJuIGFuc3dlcnMuc29tZSgoYW5zd2VyKSA9PiB7XG4gICAgICAgIGNvbnN0IGlucHV0ID0gYW5zd2VyLnF1ZXJ5U2VsZWN0b3IoYGlucHV0YCk7XG4gICAgICAgIHJldHVybiBpbnB1dC5jaGVja2VkO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBfaXNBbGxBbnN3ZXJzR2l2ZW5Db3JyZWN0KCkge1xuICAgIGNvbnN0IG9wdGlvbnMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYC5nYW1lX19vcHRpb25gKSk7XG4gICAgcmV0dXJuIG9wdGlvbnMuZXZlcnkoKG9wdGlvbikgPT4ge1xuICAgICAgY29uc3QgYW5zd2VycyA9IEFycmF5LmZyb20ob3B0aW9uLnF1ZXJ5U2VsZWN0b3JBbGwoYC5nYW1lX19hbnN3ZXJgKSk7XG4gICAgICByZXR1cm4gYW5zd2Vycy5zb21lKChhbnN3ZXIpID0+IHtcbiAgICAgICAgY29uc3QgaW5wdXQgPSBhbnN3ZXIucXVlcnlTZWxlY3RvcihgaW5wdXRgKTtcbiAgICAgICAgY29uc3QgYW5zd2VySW5kZXggPSBHYW1lU2NyZWVuLmdldEFuc3dlckluZGV4KGlucHV0KTtcbiAgICAgICAgY29uc3QgYWN0dWFsQW5zd2VyID0gdGhpcy5fZ2V0QW5zd2VyVHlwZSh0aGlzLmdhbWVJbmRleCwgYW5zd2VySW5kZXgpO1xuICAgICAgICByZXR1cm4gaW5wdXQuY2hlY2tlZCAmJiBpbnB1dC52YWx1ZSA9PT0gYWN0dWFsQW5zd2VyO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBfb25WYWxpZEFuc3dlcihpc09LKSB7XG4gICAgdGhpcy5fc2F2ZUFuc3dlcihpc09LKTtcbiAgICBpZiAoIWlzT0spIHtcbiAgICAgIHRoaXMuZ2FtZU1vZGVsLm1pbnVzTGl2ZSgpO1xuICAgIH1cbiAgICBpZiAodGhpcy5nYW1lTW9kZWwuaXNHYW1lT3Zlcikge1xuICAgICAgdGhpcy5lbmRTY3JlZW4uc2hvdygpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm5leHRTY3JlZW4uc2hvdygpO1xuICAgIH1cbiAgfVxuXG4gIF9nZXRBbnN3ZXJUeXBlKGdhbWVJbmRleCwgYW5zd2VySW5kZXgpIHtcbiAgICByZXR1cm4gdGhpcy5nYW1lTW9kZWwuZ2FtZXNbZ2FtZUluZGV4XS5hbnN3ZXJzW2Fuc3dlckluZGV4XS50eXBlO1xuICB9XG5cbiAgX3NhdmVBbnN3ZXIoaXNPSykge1xuICAgIGNvbnN0IHRpbWUgPSAoY29uZmlnLlRJTUVfVE9fQU5TV0VSIC0gdGhpcy50aW1lci50aW1lKSAvIDEwMDA7XG4gICAgdGhpcy50aW1lci5zdG9wKCk7XG4gICAgdGhpcy5nYW1lTW9kZWwuYWRkQW5zd2VyKHtpc09LLCB0aW1lfSk7XG4gIH1cblxuICBzdGF0aWMgZ2V0QW5zd2VySW5kZXgoaW5wdXQpIHtcbiAgICByZXR1cm4gaW5wdXQuZGF0YXNldC5hbnN3ZXJpbmRleDtcbiAgfVxuXG59XG4iLCJpbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YXRzU2NyZWVuVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gYDxkaXYgaWQ9XCJtYWluXCIgY2xhc3M9XCJjZW50cmFsX19jb250ZW50XCI+XG4gICAgICAgICAgICAgIDxoZWFkZXIgY2xhc3M9XCJoZWFkZXJcIj5cbiAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIFRPIEJBQ0sgQVJST1cgLS0+XG4gICAgICAgICAgICAgIDwvaGVhZGVyPlxuICAgICAgICAgICAgICA8c2VjdGlvbiBjbGFzcz1cInJlc3VsdFwiPjwvc2VjdGlvbj5cbiAgICAgICAgICAgIDwvZGl2PmA7XG4gIH1cblxufVxuIiwiaW1wb3J0IGNvbmZpZyBmcm9tICcuL2NvbmZpZy5qcyc7XG5cbi8vIFNjb3JpbmcgYXQgdGhlIGVuZCBvZiB0aGUgZ2FtZVxuLy8gQHBhcmFtICB7YXJyYXl9IGFuc3dlcnMg0LzQsNGB0YHQuNCyINC+0YLQstC10YLQvtCyINC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRj1xuLy8gQHBhcmFtICB7aW50ZWdlcn0gbGl2ZXMg0LrQvtC7LdCy0L4g0L7RgdGC0LDQstGI0LjRhdGB0Y8g0LbQuNC30L3QtdC5XG4vLyBAcmV0dXJuIHtpbnRlZ2VyfSDQutC+0Lst0LLQviDQvdCw0LHRgNCw0L3QvdGL0YUg0L7Rh9C60L7QslxuZnVuY3Rpb24gZ2V0VG90YWxTY29yZShhbnN3ZXJzLCBsaXZlcykge1xuICBpZiAoYW5zd2Vycy5sZW5ndGggPCBjb25maWcuR0FNRVNfQ09VTlQpIHtcbiAgICByZXR1cm4gLTE7XG4gIH1cbiAgY29uc3Qgc2NvcmUgPSBhbnN3ZXJzLnJlZHVjZSgoYWNjLCBhbnN3ZXIpID0+IHtcbiAgICBpZiAoYW5zd2VyLmlzT0spIHtcbiAgICAgIGFjYyArPSAxMDA7XG4gICAgfVxuICAgIGlmIChhbnN3ZXIudGltZSA8IDEwKSB7XG4gICAgICBhY2MgKz0gNTA7XG4gICAgfVxuICAgIGlmIChhbnN3ZXIudGltZSA+IDIwKSB7XG4gICAgICBhY2MgLT0gNTA7XG4gICAgfVxuICAgIHJldHVybiBhY2M7XG4gIH0sIDApO1xuICByZXR1cm4gc2NvcmUgKyBsaXZlcyAqIDUwO1xufVxuXG5mdW5jdGlvbiBnZXRSaWdodEFuc3dlcnNDb3VudChhbnN3ZXJzKSB7XG4gIHJldHVybiBhbnN3ZXJzLmZpbHRlcigoYW5zd2VyKSA9PiBhbnN3ZXIuaXNPSykubGVuZ3RoO1xufVxuXG5mdW5jdGlvbiBnZXRTcGVlZEJvbnVzQ291bnQoYW5zd2Vycykge1xuICByZXR1cm4gYW5zd2Vycy5maWx0ZXIoKGFuc3dlcikgPT4gYW5zd2VyLnRpbWUgPCAxMCkubGVuZ3RoO1xufVxuXG5mdW5jdGlvbiBnZXRTbG93UGVuYWx0eUNvdW50KGFuc3dlcnMpIHtcbiAgcmV0dXJuIGFuc3dlcnMuZmlsdGVyKChhbnN3ZXIpID0+IGFuc3dlci50aW1lID4gMjApLmxlbmd0aDtcbn1cblxuZXhwb3J0IHtnZXRUb3RhbFNjb3JlLCBnZXRSaWdodEFuc3dlcnNDb3VudCwgZ2V0U3BlZWRCb251c0NvdW50LCBnZXRTbG93UGVuYWx0eUNvdW50fTtcbiIsImltcG9ydCBjb25maWcgZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcbmltcG9ydCBTdGF0c0Jsb2NrVmlldyBmcm9tICcuLi91dGlsLXZpZXdzL3N0YXRzLWJsb2NrLXZpZXcuanMnO1xuaW1wb3J0IHtnZXRUb3RhbFNjb3JlLCBnZXRSaWdodEFuc3dlcnNDb3VudCwgZ2V0U3BlZWRCb251c0NvdW50LCBnZXRTbG93UGVuYWx0eUNvdW50fSBmcm9tICcuLi9zY29yZS5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YXRzU2luZ2xlVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoYW5zd2VycywgbGl2ZXMpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuYW5zd2VycyA9IGFuc3dlcnM7XG4gICAgdGhpcy5saXZlcyA9IGxpdmVzO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIGNvbnN0IGlzQWxsID0gdGhpcy5hbnN3ZXJzLmxlbmd0aCA9PT0gY29uZmlnLkdBTUVTX0NPVU5UO1xuICAgIGNvbnN0IHNjb3JlID0gZ2V0VG90YWxTY29yZSh0aGlzLmFuc3dlcnMsIHRoaXMubGl2ZXMpO1xuICAgIGNvbnN0IHJpZ2h0QW5zd2Vyc0NvdW50ID0gZ2V0UmlnaHRBbnN3ZXJzQ291bnQodGhpcy5hbnN3ZXJzKTtcbiAgICBjb25zdCBzcGVlZEJvbnVzQ291bnQgPSBnZXRTcGVlZEJvbnVzQ291bnQodGhpcy5hbnN3ZXJzKTtcbiAgICBjb25zdCBzbG93UGVuYWx0eUNvdW50ID0gZ2V0U2xvd1BlbmFsdHlDb3VudCh0aGlzLmFuc3dlcnMpO1xuICAgIGNvbnN0IHN0YXRzQmxvY2sgPSBuZXcgU3RhdHNCbG9ja1ZpZXcodGhpcy5hbnN3ZXJzKTtcbiAgICByZXR1cm4gYDxzZWN0aW9uIGNsYXNzPVwicmVzdWx0XCI+XG4gICAgICA8aDIgY2xhc3M9XCJyZXN1bHRfX3RpdGxlIHJlc3VsdF9fdGl0bGUtLXNpbmdsZVwiPiR7KGlzQWxsKSA/IHNjb3JlICsgYCDQvtGH0LrQvtCyLiDQndC10L/Qu9C+0YXQviFgIDogYNCf0L7RgNCw0LbQtdC90LjQtSFgIH08L2gyPlxuICAgICAgPHRhYmxlIGNsYXNzPVwicmVzdWx0X190YWJsZSByZXN1bHRfX3RhYmxlLS1zaW5nbGVcIj5cbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0ZCBjb2xzcGFuPVwiMlwiPlxuICAgICAgICAgICAgJHtzdGF0c0Jsb2NrLnRlbXBsYXRlfVxuICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgPHRkIGNsYXNzPVwicmVzdWx0X19wb2ludHNcIj7DlyAxMDA8L3RkPlxuICAgICAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fdG90YWxcIj4keyhpc0FsbCkgPyByaWdodEFuc3dlcnNDb3VudCAqIDEwMCA6IGBGYWlsYCB9PC90ZD5cbiAgICAgICAgPC90cj5cbiAgICAgICAgJHsoc3BlZWRCb251c0NvdW50KSA/IFN0YXRzU2luZ2xlVmlldy5nZXRTcGVlZEJvbnVzQ29udGVudChzcGVlZEJvbnVzQ291bnQpIDogYGB9XG4gICAgICAgICR7KHRoaXMubGl2ZXMpID8gU3RhdHNTaW5nbGVWaWV3LmdldExpdmVzQm9udXNDb250ZW50KHRoaXMubGl2ZXMpIDogYGB9XG4gICAgICAgICR7KHNsb3dQZW5hbHR5Q291bnQpID8gU3RhdHNTaW5nbGVWaWV3LmdldFNsb3dQZW5hbHR5Q29udGVudChzbG93UGVuYWx0eUNvdW50KSA6IGBgfVxuICAgICAgPC90YWJsZT5cbiAgICA8L3NlY3Rpb24+YDtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI21haW5gKTtcbiAgICBjb25zdCBvbGRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihgc2VjdGlvbi5yZXN1bHRgKTtcbiAgICBwYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKG9sZEVsZW1lbnQpO1xuICAgIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIHN0YXRpYyBnZXRTcGVlZEJvbnVzQ29udGVudChzcGVlZEJvbnVzQ291bnQpIHtcbiAgICByZXR1cm4gYDx0cj5cbiAgICAgIDx0ZD48L3RkPlxuICAgICAgPHRkIGNsYXNzPVwicmVzdWx0X19leHRyYVwiPtCR0L7QvdGD0YEg0LfQsCDRgdC60L7RgNC+0YHRgtGMOjwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX2V4dHJhXCI+JHtzcGVlZEJvbnVzQ291bnR9IDxzcGFuIGNsYXNzPVwic3RhdHNfX3Jlc3VsdCBzdGF0c19fcmVzdWx0LS1mYXN0XCI+PC9zcGFuPjwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX3BvaW50c1wiPsOXIDUwPC90ZD5cbiAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fdG90YWxcIj4ke3NwZWVkQm9udXNDb3VudCAqIDUwfTwvdGQ+XG4gICAgPC90cj5gO1xuICB9XG5cbiAgc3RhdGljIGdldExpdmVzQm9udXNDb250ZW50KGxpdmVzKSB7XG4gICAgcmV0dXJuIGA8dHI+XG4gICAgICA8dGQ+PC90ZD5cbiAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fZXh0cmFcIj7QkdC+0L3Rg9GBINC30LAg0LbQuNC30L3QuDo8L3RkPlxuICAgICAgPHRkIGNsYXNzPVwicmVzdWx0X19leHRyYVwiPiR7bGl2ZXN9IDxzcGFuIGNsYXNzPVwic3RhdHNfX3Jlc3VsdCBzdGF0c19fcmVzdWx0LS1hbGl2ZVwiPjwvc3Bhbj48L3RkPlxuICAgICAgPHRkIGNsYXNzPVwicmVzdWx0X19wb2ludHNcIj7DlyA1MDwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX3RvdGFsXCI+JHtsaXZlcyAqIDUwfTwvdGQ+XG4gICAgPC90cj5gO1xuICB9XG5cbiAgc3RhdGljIGdldFNsb3dQZW5hbHR5Q29udGVudChzbG93UGVuYWx0eUNvdW50KSB7XG4gICAgcmV0dXJuIGA8dHI+XG4gICAgICA8dGQ+PC90ZD5cbiAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fZXh0cmFcIj7QqNGC0YDQsNGEINC30LAg0LzQtdC00LvQuNGC0LXQu9GM0L3QvtGB0YLRjDo8L3RkPlxuICAgICAgPHRkIGNsYXNzPVwicmVzdWx0X19leHRyYVwiPiR7c2xvd1BlbmFsdHlDb3VudH0gPHNwYW4gY2xhc3M9XCJzdGF0c19fcmVzdWx0IHN0YXRzX19yZXN1bHQtLXNsb3dcIj48L3NwYW4+PC90ZD5cbiAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fcG9pbnRzXCI+w5cgNTA8L3RkPlxuICAgICAgPHRkIGNsYXNzPVwicmVzdWx0X190b3RhbFwiPi0ke3Nsb3dQZW5hbHR5Q291bnQgKiA1MH08L3RkPlxuICAgIDwvdHI+YDtcbiAgfVxuXG59XG4iLCJpbXBvcnQge3Bvc3REYXRhfSBmcm9tICcuLi9iYWNrZW5kLmpzJztcbmltcG9ydCBBYnN0cmFjdFNjcmVlbiBmcm9tICcuLi9hYnN0cmFjdC1zY3JlZW4uanMnO1xuXG5pbXBvcnQgU3RhdHNTY3JlZW5WaWV3IGZyb20gJy4vc3RhdHMtc2NyZWVuLXZpZXcuanMnO1xuaW1wb3J0IFN0YXRzU2luZ2xlVmlldyBmcm9tICcuL3N0YXRzLXNpbmdsZS12aWV3LmpzJztcbmltcG9ydCBCYWNrQXJyb3dWaWV3IGZyb20gJy4uL3V0aWwtdmlld3MvYmFjay1hcnJvdy12aWV3LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhdHNTY3JlZW4gZXh0ZW5kcyBBYnN0cmFjdFNjcmVlbiB7XG5cbiAgY29uc3RydWN0b3IoZ2FtZU1vZGVsKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmdhbWVNb2RlbCA9IGdhbWVNb2RlbDtcbiAgICB0aGlzLnZpZXcgPSBuZXcgU3RhdHNTY3JlZW5WaWV3KCk7XG4gIH1cblxuICBfb25TY3JlZW5TaG93KCkge1xuICAgIGNvbnN0IHN0YXRzU2luZ2xlQmxvY2sgPSBuZXcgU3RhdHNTaW5nbGVWaWV3KHRoaXMuZ2FtZU1vZGVsLmFuc3dlcnMsIHRoaXMuZ2FtZU1vZGVsLmxpdmVzKTtcbiAgICBjb25zdCBiYWNrQXJyb3cgPSBuZXcgQmFja0Fycm93VmlldygpO1xuICAgIGNvbnN0IHJlc3RhcnRHYW1lID0gdGhpcy5fcmVzdGFydEdhbWUuYmluZCh0aGlzKTtcblxuICAgIHN0YXRzU2luZ2xlQmxvY2sucmVuZGVyKCk7XG4gICAgYmFja0Fycm93LnJlbmRlcigpO1xuXG4gICAgYmFja0Fycm93LmJpbmQocmVzdGFydEdhbWUpO1xuXG4gICAgcG9zdERhdGEoe2Fuc3dlcnM6IHRoaXMuZ2FtZU1vZGVsLmFuc3dlcnMsIGxpdmVzOiB0aGlzLmdhbWVNb2RlbC5saXZlc30pXG4gICAgLmNhdGNoKCgpID0+IHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRXJyb3IgZHVyaW5nIFBPU1QgZ2FtZXMgZGF0YS4uLmApO1xuICAgIH0pO1xuICB9XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVycm9yTW9kYWxWaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPHNlY3Rpb24gY2xhc3M9XCJtb2RhbFwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWxfX2lubmVyXCI+XG4gICAgICAgICAgICAgICAgPGgyIGNsYXNzPVwibW9kYWxfX3RpdGxlXCI+0J/RgNC+0LjQt9C+0YjQu9CwINC+0YjQuNCx0LrQsCE8L2gyPlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwibW9kYWxfX3RleHQgbW9kYWxfX3RleHQtLWVycm9yXCI+0KHRgtCw0YLRg9GBOiA0MDQuINCf0L7QttCw0LvRg9C50YHRgtCwLCDQv9C10YDQtdC30LDQs9GA0YPQt9C40YLQtSDRgdGC0YDQsNC90LjRhtGDLjwvcD5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L3NlY3Rpb24+YDtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI21haW5gKTtcbiAgICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XG4gIH1cbn1cbiIsImltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcuanMnO1xuaW1wb3J0IHtnZXRSYW5kb219IGZyb20gJy4vdXRpbHMuanMnO1xuaW1wb3J0IHtsb2FkR2FtZXN9IGZyb20gJy4vYmFja2VuZC5qcyc7XG5cbmltcG9ydCBHYW1lTW9kZWwgZnJvbSAnLi9nYW1lLW1vZGVsL2dhbWUtbW9kZWwuanMnO1xuXG5pbXBvcnQgV2VsY29tZVNjcmVlbiBmcm9tICcuL3dlbGNvbWUtc2NyZWVuL3dlbGNvbWUtc2NyZWVuLmpzJztcbmltcG9ydCBHcmVldGluZ1NjcmVlbiBmcm9tICcuL2dyZWV0aW5nLXNjcmVlbi9ncmVldGluZy1zY3JlZW4uanMnO1xuaW1wb3J0IFJ1bGVzU2NyZWVuIGZyb20gJy4vcnVsZXMtc2NyZWVuL3J1bGVzLXNjcmVlbi5qcyc7XG5pbXBvcnQgR2FtZVNjcmVlbiBmcm9tICcuL2dhbWUtc2NyZWVuL2dhbWUtc2NyZWVuLmpzJztcbmltcG9ydCBTdGF0c1NjcmVlbiBmcm9tICcuL3N0YXRzLXNjcmVlbi9zdGF0cy1zY3JlZW4uanMnO1xuaW1wb3J0IEVycm9yTW9kYWxWaWV3IGZyb20gJy4vdXRpbC12aWV3cy9lcnJvci1tb2RhbC12aWV3LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXBwbGljYXRpb24ge1xuXG4gIHN0YXRpYyBpbml0KCkge1xuICAgIGNvbnN0IGdhbWVNb2RlbCA9IG5ldyBHYW1lTW9kZWwoKTtcbiAgICBjb25zdCB3ZWxjb21lU2NyZWVuID0gbmV3IFdlbGNvbWVTY3JlZW4oKTtcbiAgICBjb25zdCBncmVldGluZ1NjcmVlbiA9IG5ldyBHcmVldGluZ1NjcmVlbigpO1xuICAgIGNvbnN0IHJ1bGVzU2NyZWVuID0gbmV3IFJ1bGVzU2NyZWVuKGdhbWVNb2RlbCk7XG4gICAgY29uc3Qgc3RhdHNTY3JlZW4gPSBuZXcgU3RhdHNTY3JlZW4oZ2FtZU1vZGVsKTtcblxuICAgIGNvbnN0IGdhbWVTY3JlZW5zID0gW107XG5cbiAgICBsb2FkR2FtZXMoKVxuICAgIC50aGVuKChnYW1lc0FycikgPT4ge1xuICAgICAgY29uc3QgZ2FtZXMgPSBnZXRSYW5kb20oZ2FtZXNBcnIsIGNvbmZpZy5HQU1FU19DT1VOVCk7XG4gICAgICBnYW1lTW9kZWwuX2dhbWVzID0gZ2FtZXM7XG4gICAgICBnYW1lcy5mb3JFYWNoKChnYW1lLCBpbmRleCkgPT4ge1xuICAgICAgICBnYW1lU2NyZWVucy5wdXNoKG5ldyBHYW1lU2NyZWVuKGdhbWVNb2RlbCwgZ2FtZSwgaW5kZXgpKTtcbiAgICAgIH0pO1xuICAgICAgZ2FtZVNjcmVlbnMuZm9yRWFjaCgoZ2FtZVNjcmVlbiwgaW5kZXgpID0+IHtcbiAgICAgICAgZ2FtZVNjcmVlbi5uZXh0U2NyZWVuID0gZ2FtZVNjcmVlbnNbaW5kZXggKyAxXTtcbiAgICAgICAgZ2FtZVNjcmVlbi5zdGFydFNjcmVlbiA9IHdlbGNvbWVTY3JlZW47XG4gICAgICAgIGdhbWVTY3JlZW4uZW5kU2NyZWVuID0gc3RhdHNTY3JlZW47XG4gICAgICB9KTtcbiAgICAgIGdhbWVTY3JlZW5zW2dhbWVTY3JlZW5zLmxlbmd0aCAtIDFdLm5leHRTY3JlZW4gPSBzdGF0c1NjcmVlbjtcbiAgICB9KVxuICAgIC5maW5hbGx5KCgpID0+IHtcbiAgICAgIGdyZWV0aW5nU2NyZWVuLm5leHRTY3JlZW4gPSBydWxlc1NjcmVlbjtcbiAgICAgIHJ1bGVzU2NyZWVuLm5leHRTY3JlZW4gPSBnYW1lU2NyZWVuc1swXTtcbiAgICAgIHJ1bGVzU2NyZWVuLnN0YXJ0U2NyZWVuID0gd2VsY29tZVNjcmVlbjtcbiAgICAgIHN0YXRzU2NyZWVuLnN0YXJ0U2NyZWVuID0gd2VsY29tZVNjcmVlbjtcbiAgICAgIGdyZWV0aW5nU2NyZWVuLnNob3coKTtcbiAgICB9KVxuICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICBjb25zdCBlcnJvck1vZGFsID0gbmV3IEVycm9yTW9kYWxWaWV3KCk7XG4gICAgICBlcnJvck1vZGFsLnJlbmRlcigpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFcnJvciBkdXJpbmcgR0VUIGdhbWVzIGRhdGEuLi5gKTtcbiAgICB9KTtcblxuICAgIHdlbGNvbWVTY3JlZW4ubmV4dFNjcmVlbiA9IGdyZWV0aW5nU2NyZWVuO1xuICAgIHdlbGNvbWVTY3JlZW4uc2hvdygpO1xuICB9XG59XG4iXSwibmFtZXMiOlsiSW50cm9TY3JlZW5WaWV3Il0sIm1hcHBpbmdzIjoiOzs7RUFBQSxNQUFNLE1BQU0sR0FBRztFQUNmLEVBQUUsWUFBWSxFQUFFLENBQUMsdUZBQXVGLENBQUM7RUFDekcsRUFBRSxhQUFhLEVBQUUsQ0FBQyw0QkFBNEIsQ0FBQztFQUMvQyxFQUFFLFdBQVcsRUFBRSxFQUFFO0VBQ2pCLEVBQUUsV0FBVyxFQUFFLENBQUM7RUFDaEIsRUFBRSxjQUFjLEVBQUUsS0FBSztFQUN2QixFQUFFLFNBQVMsRUFBRSxDQUFDLE9BQU8sQ0FBQztFQUN0QixFQUFFLFVBQVUsRUFBRTtFQUNkLElBQUksUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDO0VBQ3hCLElBQUksS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDO0VBQ2xCLEdBQUc7RUFDSCxFQUFFLFlBQVksRUFBRTtFQUNoQixJQUFJLFVBQVUsRUFBRSxDQUFDLFVBQVUsQ0FBQztFQUM1QixJQUFJLFdBQVcsRUFBRSxDQUFDLFdBQVcsQ0FBQztFQUM5QixJQUFJLFlBQVksRUFBRSxDQUFDLFlBQVksQ0FBQztFQUNoQyxHQUFHO0VBQ0gsRUFBRSx1QkFBdUIsRUFBRTtFQUMzQixJQUFJLFlBQVksRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQztFQUMzQyxJQUFJLGFBQWEs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
