(function () {
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

  Application.init();

}());

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsic3JjL2pzL2NvbmZpZy5qcyIsInNyYy9qcy91dGlscy5qcyIsInNyYy9qcy9iYWNrZW5kLmpzIiwic3JjL2pzL2dhbWUtbW9kZWwvZ2FtZS1tb2RlbC5qcyIsInNyYy9qcy9hYnN0cmFjdC12aWV3LmpzIiwic3JjL2pzL3V0aWwtdmlld3MvY29uZmlybS1tb2RhbC12aWV3LmpzIiwic3JjL2pzL2Fic3RyYWN0LXNjcmVlbi5qcyIsInNyYy9qcy93ZWxjb21lLXNjcmVlbi93ZWxjb21lLXNjcmVlbi12aWV3LmpzIiwic3JjL2pzL3dlbGNvbWUtc2NyZWVuL2FzdGVyaXNrLXZpZXcuanMiLCJzcmMvanMvd2VsY29tZS1zY3JlZW4vd2VsY29tZS1zY3JlZW4uanMiLCJzcmMvanMvZ3JlZXRpbmctc2NyZWVuL2dyZWV0aW5nLXNjcmVlbi12aWV3LmpzIiwic3JjL2pzL2dyZWV0aW5nLXNjcmVlbi9zdGFydC1hcnJvdy12aWV3LmpzIiwic3JjL2pzL2dyZWV0aW5nLXNjcmVlbi9ncmVldGluZy1zY3JlZW4uanMiLCJzcmMvanMvcnVsZXMtc2NyZWVuL3J1bGVzLXNjcmVlbi12aWV3LmpzIiwic3JjL2pzL3J1bGVzLXNjcmVlbi9uYW1lLWlucHV0LXZpZXcuanMiLCJzcmMvanMvcnVsZXMtc2NyZWVuL3N0YXJ0LWJ1dHRvbi12aWV3LmpzIiwic3JjL2pzL3V0aWwtdmlld3MvYmFjay1hcnJvdy12aWV3LmpzIiwic3JjL2pzL3J1bGVzLXNjcmVlbi9ydWxlcy1zY3JlZW4uanMiLCJzcmMvanMvZ2FtZS1zY3JlZW4vZ2FtZS1zY3JlZW4tdmlldy5qcyIsInNyYy9qcy9nYW1lLXNjcmVlbi90aW1lci1ibG9jay12aWV3LmpzIiwic3JjL2pzL2dhbWUtc2NyZWVuL2xpdmVzLWJsb2NrLXZpZXcuanMiLCJzcmMvanMvdXRpbC12aWV3cy9zdGF0cy1ibG9jay12aWV3LmpzIiwic3JjL2pzL2RlYnVnLmpzIiwic3JjL2pzL2dhbWUtc2NyZWVuL2Fuc3dlci1waG90by1idXR0b24tdmlldy5qcyIsInNyYy9qcy9nYW1lLXNjcmVlbi9hbnN3ZXItcGFpbnQtYnV0dG9uLXZpZXcuanMiLCJzcmMvanMvZ2FtZS1zY3JlZW4vYW5zd2VyLXBhaW50LW9wdGlvbi12aWV3LmpzIiwic3JjL2pzL3Jlc2l6ZS5qcyIsInNyYy9qcy9nYW1lLXNjcmVlbi9pbWFnZS12aWV3LmpzIiwic3JjL2pzL2dhbWUtc2NyZWVuL2dhbWUtc2NyZWVuLmpzIiwic3JjL2pzL3N0YXRzLXNjcmVlbi9zdGF0cy1zY3JlZW4tdmlldy5qcyIsInNyYy9qcy9zY29yZS5qcyIsInNyYy9qcy9zdGF0cy1zY3JlZW4vc3RhdHMtc2luZ2xlLXZpZXcuanMiLCJzcmMvanMvc3RhdHMtc2NyZWVuL3N0YXRzLXNjcmVlbi5qcyIsInNyYy9qcy91dGlsLXZpZXdzL2Vycm9yLW1vZGFsLXZpZXcuanMiLCJzcmMvanMvYXBwbGljYXRpb24uanMiLCJzcmMvanMvbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBjb25maWcgPSB7XG4gIEdFVF9EQVRBX1VSTDogYGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9ha3poYXIvcGl4ZWxodW50ZXIvbWFzdGVyL3NyYy9qcy9nYW1lLW1vZGVsL2RhdGEuanNvbmAsXG4gIFBPU1RfREFUQV9VUkw6IGBodHRwczovL2VjaG8uaHRtbGFjYWRlbXkucnUvYCxcbiAgR0FNRVNfQ09VTlQ6IDEwLFxuICBMSVZFU19DT1VOVDogMyxcbiAgVElNRV9UT19BTlNXRVI6IDMwMDAwLCAvLyAzMCBzZWNcbiAgQ09MT1JfUkVEOiBgI2Q3NDA0MGAsXG4gIEFuc3dlclR5cGU6IHtcbiAgICBQQUlOVElORzogYHBhaW50aW5nYCxcbiAgICBQSE9UTzogYHBob3RvYFxuICB9LFxuICBRdWVzdGlvblR5cGU6IHtcbiAgICBUV09fT0ZfVFdPOiBgdHdvLW9mLXR3b2AsXG4gICAgVElOREVSX0xJS0U6IGB0aW5kZXItbGlrZWAsXG4gICAgT05FX09GX1RIUkVFOiBgb25lLW9mLXRocmVlYFxuICB9LFxuICBRdWVzdGlvblR5cGVUb0ZyYW1lU2l6ZToge1xuICAgICd0d28tb2YtdHdvJzoge3dpZHRoOiA0NjgsIGhlaWdodDogNDU4fSxcbiAgICAndGluZGVyLWxpa2UnOiB7d2lkdGg6IDcwNSwgaGVpZ2h0OiA0NTV9LFxuICAgICdvbmUtb2YtdGhyZWUnOiB7d2lkdGg6IDMwNCwgaGVpZ2h0OiA0NTV9XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNvbmZpZztcbiIsImZ1bmN0aW9uIGdldFJhbmRvbShhcnIsIG4pIHtcbiAgY29uc3QgcmVzdWx0ID0gbmV3IEFycmF5KG4pO1xuICBsZXQgbGVuID0gYXJyLmxlbmd0aDtcbiAgY29uc3QgdGFrZW4gPSBuZXcgQXJyYXkobGVuKTtcbiAgaWYgKG4gPiBsZW4pIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcImdldFJhbmRvbTogbW9yZSBlbGVtZW50cyB0YWtlbiB0aGFuIGF2YWlsYWJsZVwiKTtcbiAgfVxuICB3aGlsZSAobi0tKSB7XG4gICAgY29uc3QgeCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGxlbik7XG4gICAgcmVzdWx0W25dID0gYXJyW3ggaW4gdGFrZW4gPyB0YWtlblt4XSA6IHhdO1xuICAgIHRha2VuW3hdID0gLS1sZW4gaW4gdGFrZW4gPyB0YWtlbltsZW5dIDogbGVuO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5leHBvcnQge2dldFJhbmRvbX07XG4iLCJpbXBvcnQgY29uZmlnIGZyb20gJy4vY29uZmlnLmpzJztcblxuYXN5bmMgZnVuY3Rpb24gbG9hZEdhbWVzKCkge1xuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGNvbmZpZy5HRVRfREFUQV9VUkwpO1xuICBjb25zdCBnYW1lc1Byb21pc2UgPSBhd2FpdCByZXNwb25zZS5qc29uKClcbiAgcmV0dXJuIGdhbWVzUHJvbWlzZTtcbn07XG5cbmFzeW5jIGZ1bmN0aW9uIHBvc3REYXRhKGRhdGEgPSB7fSkge1xuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGNvbmZpZy5QT1NUX0RBVEFfVVJMLCB7XG4gICAgbWV0aG9kOiBgUE9TVGAsXG4gICAgaGVhZGVyczoge1xuICAgICAgJ0NvbnRlbnQtVHlwZSc6IGBhcHBsaWNhdGlvbi9qc29uYFxuICAgIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoZGF0YSkgLy8gYm9keSBkYXRhIHR5cGUgbXVzdCBtYXRjaCBcIkNvbnRlbnQtVHlwZVwiIGhlYWRlclxuICB9KTtcbiAgcmV0dXJuIGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbn07XG5cbmV4cG9ydCB7bG9hZEdhbWVzLCBwb3N0RGF0YX07XG4iLCJpbXBvcnQgY29uZmlnIGZyb20gJy4uL2NvbmZpZy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdhbWVNb2RlbCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3BsYXllck5hbWUgPSBgYDtcbiAgICB0aGlzLl9saXZlcyA9IGNvbmZpZy5MSVZFU19DT1VOVDtcbiAgICB0aGlzLl9nYW1lcyA9IFtdO1xuICAgIHRoaXMuX2Fuc3dlcnMgPSBbXTtcbiAgICB0aGlzLl9pc0dhbWVPdmVyID0gZmFsc2U7XG4gIH1cblxuICBzZXQgcGxheWVyTmFtZShuYW1lKSB7XG4gICAgdGhpcy5fcGxheWVyTmFtZSA9IG5hbWU7XG4gIH1cblxuICBnZXQgbGl2ZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xpdmVzO1xuICB9XG5cbiAgZ2V0IGFuc3dlcnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2Fuc3dlcnM7XG4gIH1cblxuICBnZXQgZ2FtZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dhbWVzO1xuICB9XG5cbiAgZ2V0IGlzR2FtZU92ZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzR2FtZU92ZXI7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB0aGlzLl9saXZlcyA9IGNvbmZpZy5MSVZFU19DT1VOVDtcbiAgICB0aGlzLl9hbnN3ZXJzID0gW107XG4gICAgdGhpcy5faXNHYW1lT3ZlciA9IGZhbHNlO1xuICB9XG5cbiAgYWRkQW5zd2VyKGFuc3dlcikge1xuICAgIHRoaXMuX2Fuc3dlcnMucHVzaChhbnN3ZXIpO1xuICB9XG5cbiAgbWludXNMaXZlKCkge1xuICAgIGlmICh0aGlzLl9saXZlcyA9PT0gMCkge1xuICAgICAgdGhpcy5faXNHYW1lT3ZlciA9IHRydWU7XG4gICAgfVxuICAgIGlmICh0aGlzLl9saXZlcykge1xuICAgICAgdGhpcy5fbGl2ZXMtLTtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgZ2V0Q29ycmVjdEFuc3dlcihnYW1lKSB7XG4gICAgY29uc3QgcXVlc3Rpb24gPSBnYW1lLnF1ZXN0aW9uO1xuICAgIGNvbnN0IGlzUGFpbnRpbmcgPSAvXFxz0YDQuNGB0YPQvdC+0LpcXHMvLnRlc3QocXVlc3Rpb24pO1xuICAgIGNvbnN0IGlzUGhvdG8gPSAvXFxz0YTQvtGC0L5cXHMvLnRlc3QocXVlc3Rpb24pO1xuICAgIGlmIChpc1BhaW50aW5nKSByZXR1cm4gYHBhaW50aW5nYDtcbiAgICBpZiAoaXNQaG90bykgcmV0dXJuIGBwaG90b2BcbiAgfVxuXG59XG4iLCJjb25zdCBlbGVtZW50cyA9IHt9O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKCkge31cblxuICAvLyDQstC+0LfQstGA0LDRidCw0LXRgiDRgdGC0YDQvtC60YMsINGB0L7QtNC10YDQttCw0YnRg9GOINGA0LDQt9C80LXRgtC60YNcbiAgZ2V0IHRlbXBsYXRlKCkge31cblxuICAvLyDRgdC+0LfQtNCw0LXRgiDQuCDQstC+0LfQstGA0LDRidCw0LXRgiBET00t0Y3Qu9C10LzQtdC90YIg0L3QsCDQvtGB0L3QvtCy0LUg0YjQsNCx0LvQvtC90LBcbiAgLy8g0LTQvtC70LbQtdC9INGB0L7Qt9C00LDQstCw0YLRjCBET00t0Y3Qu9C10LzQtdC90YIg0YEg0L/QvtC80L7RidGM0Y4g0LzQtdGC0L7QtNCwIHJlbmRlciwg0LTQvtCx0LDQstC70Y/RgtGMINC10LzRgyDQvtCx0YDQsNCx0L7RgtGH0LjQutC4LCDRgSDQv9C+0LzQvtGJ0YzRjiDQvNC10YLQvtC00LAgYmluZCDQuCDQstC+0LfQstGA0LDRidCw0YLRjCDRgdC+0LfQtNCw0L3QvdGL0Lkg0Y3Qu9C10LzQtdC90YJcbiAgLy8g0JzQtdGC0L7QtCDQtNC+0LvQttC10L0g0LjRgdC/0L7Qu9GM0LfQvtCy0LDRgtGMINC70LXQvdC40LLRi9C1INCy0YvRh9C40YHQu9C10L3QuNGPIOKAlCDRjdC70LXQvNC10L3RgiDQtNC+0LvQttC10L0g0YHQvtC30LTQsNCy0LDRgtGM0YHRjyDQv9GA0Lgg0L/QtdGA0LLQvtC8INC+0LHRgNCw0YnQtdC90LjQuCDQuiDQs9C10YLRgtC10YAg0YEg0L/QvtC80L7RidGM0Y4g0LzQtdGC0L7QtNCwIHJlbmRlciwg0LTQvtC70LbQvdGLINC00L7QsdCw0LLQu9GP0YLRjNGB0Y8g0L7QsdGA0LDQsdC+0YLRh9C40LrQuCAo0LzQtdGC0L7QtCBiaW5kKS5cbiAgLy8g0J/RgNC4INC/0L7RgdC70LXQtNGD0Y7RidC40YUg0L7QsdGA0LDRidC10L3QuNGP0YUg0LTQvtC70LbQtdC9INC40YHQv9C+0LvRjNC30L7QstCw0YLRjNGB0Y8g0Y3Qu9C10LzQtdC90YIsINGB0L7Qt9C00LDQvdC90YvQuSDQv9GA0Lgg0L/QtdGA0LLQvtC8INCy0YvQt9C+0LLQtSDQs9C10YLRgtC10YDQsC5cbiAgZ2V0IGVsZW1lbnQoKSB7XG4gICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlO1xuICAgIC8vIGlmICghZWxlbWVudHMuaGFzT3duUHJvcGVydHkodGVtcGxhdGUpKSB7XG4gICAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGBkaXZgKTtcbiAgICAgIGRpdi5pbm5lckhUTUwgPSB0ZW1wbGF0ZTtcbiAgICAgIGNvbnN0IGVsZW0gPSBkaXYuZmlyc3RDaGlsZDtcbiAgICAgIGVsZW1lbnRzW3RlbXBsYXRlXSA9IGVsZW07XG4gICAgICByZXR1cm4gZWxlbTtcbiAgICAvLyB9IGVsc2Uge1xuICAgICAgLy8gcmV0dXJuIGVsZW1lbnRzW3RlbXBsYXRlXTtcbiAgICAvLyB9XG4gIH1cblxuICAvLyDQvtGC0YDQuNGB0L7QstGL0LLQsNC10YIgRE9NLdGN0LvQtdC80LXQvdGCLCDQtNC+0LHQsNCy0LvRj9C10YIg0L3QtdC+0LHRhdC+0LTQuNC80YvQtSDQvtCx0YDQsNCx0L7RgtGH0LjQutC4XG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgbWFpbi5jZW50cmFsYCk7XG4gICAgY29uc3Qgb2xkRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCNtYWluYCk7XG4gICAgcGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChvbGRFbGVtZW50KTtcbiAgICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XG4gIH1cblxuICAvLyDQtNC+0LHQsNCy0LvRj9C10YIg0L7QsdGA0LDQsdC+0YLRh9C40LrQuCDRgdC+0LHRi9GC0LjQuVxuICAvLyDQnNC10YLQvtC0INC/0L4g0YPQvNC+0LvRh9Cw0L3QuNGOINC90LjRh9C10LPQviDQvdC1INC00LXQu9Cw0LXRglxuICAvLyDQldGB0LvQuCDQvdGD0LbQvdC+INC+0LHRgNCw0LHQvtGC0LDRgtGMINC60LDQutC+0LUt0YLQviDRgdC+0LHRi9GC0LjQtSwg0YLQviDRjdGC0L7RgiDQvNC10YLQvtC0INC00L7Qu9C20LXQvSDQsdGL0YLRjCDQv9C10YDQtdC+0L/RgNC10LTQtdC70ZHQvSDQsiDQvdCw0YHQu9C10LTQvdC40LrQtSDRgSDQvdC10L7QsdGF0L7QtNC40LzQvtC5INC70L7Qs9C40LrQvtC5XG4gIGJpbmQoKSB7fVxufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25maXJtTW9kYWxWaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPHNlY3Rpb24gY2xhc3M9XCJtb2RhbFwiPlxuICAgICAgICAgICAgICA8Zm9ybSBjbGFzcz1cIm1vZGFsX19pbm5lclwiPlxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJtb2RhbF9fY2xvc2VcIiB0eXBlPVwiYnV0dG9uXCI+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInZpc3VhbGx5LWhpZGRlblwiPtCX0LDQutGA0YvRgtGMPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDxoMiBjbGFzcz1cIm1vZGFsX190aXRsZVwiPtCf0L7QtNGC0LLQtdGA0LbQtNC10L3QuNC1PC9oMj5cbiAgICAgICAgICAgICAgICA8cCBjbGFzcz1cIm1vZGFsX190ZXh0XCI+0JLRiyDRg9Cy0LXRgNC10L3RiyDRh9GC0L4g0YXQvtGC0LjRgtC1INC90LDRh9Cw0YLRjCDQuNCz0YDRgyDQt9Cw0L3QvtCy0L4/PC9wPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbF9fYnV0dG9uLXdyYXBwZXJcIj5cbiAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJtb2RhbF9fYnRuIG1vZGFsX19idG4tLW9rXCI+0J7QujwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cIm1vZGFsX19idG4gbW9kYWxfX2J0bi0tY2FuY2VsXCI+0J7RgtC80LXQvdCwPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgIDwvc2VjdGlvbj5gO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjbWFpbmApO1xuICAgIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIGJpbmQoY2IpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI21haW5gKTtcbiAgICBjb25zdCBtb2RhbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5tb2RhbGApO1xuICAgIGNvbnN0IGNsb3NlQnRuID0gbW9kYWwucXVlcnlTZWxlY3RvcihgLm1vZGFsX19jbG9zZWApO1xuICAgIGNvbnN0IGNhbmNlbEJ0biA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoYC5tb2RhbF9fYnRuLS1jYW5jZWxgKTtcbiAgICBjb25zdCBva0J0biA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoYC5tb2RhbF9fYnRuLS1va2ApO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoYGtleWRvd25gLCAoZXZ0KSA9PiB7XG4gICAgICBpZiAoZXZ0LmtleUNvZGUgPT09IDI3KSB7XG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBwYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKG1vZGFsKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBjbG9zZUJ0bi5hZGRFdmVudExpc3RlbmVyKGBjbGlja2AsIChldnQpID0+IHtcbiAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgcGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChtb2RhbCk7XG4gICAgfSk7XG4gICAgY2FuY2VsQnRuLmFkZEV2ZW50TGlzdGVuZXIoYGNsaWNrYCwgKGV2dCkgPT4ge1xuICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBwYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKG1vZGFsKTtcbiAgICB9KTtcbiAgICBva0J0bi5hZGRFdmVudExpc3RlbmVyKGBjbGlja2AsIChldnQpID0+IHtcbiAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgY2IoKTtcbiAgICB9KTtcbiAgfVxufVxuIiwiaW1wb3J0IENvbmZpcm1Nb2RhbFZpZXcgZnJvbSAnLi91dGlsLXZpZXdzL2NvbmZpcm0tbW9kYWwtdmlldy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFic3RyYWN0U2NyZWVuIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmdhbWVNb2RlbCA9IG51bGw7XG4gICAgdGhpcy5nYW1lID0gbnVsbDtcbiAgICB0aGlzLnZpZXcgPSBudWxsO1xuICAgIHRoaXMudGltZXIgPSBudWxsO1xuICAgIHRoaXMuc3RhcnRTY3JlZW4gPSBudWxsO1xuICAgIHRoaXMubmV4dFNjcmVlbiA9IG51bGw7XG4gICAgdGhpcy5lbmRTY3JlZW4gPSBudWxsO1xuICB9XG5cbiAgLy8g0LzQtdGC0L7QtCDQv9C+0LrQsNC30LAg0Y3QutGA0LDQvdCwINC+0YLRgNC40YHQvtCy0YvQstCw0LXRgiDRjdC60YDQsNC9INC4INC30LDQv9GD0YHQutCw0LXRgiDQvNC10YLQvtC0IF9vblNjcmVlblNob3dcbiAgc2hvdygpIHtcbiAgICB0aGlzLnZpZXcucmVuZGVyKCk7XG4gICAgdGhpcy5fb25TY3JlZW5TaG93KCk7XG4gIH1cblxuICAvLyDQvNC10YLQvtC0INGA0LXQsNC70LjQt9GD0LXRgiDQsdC40LfQvdC10YEg0LvQvtCz0LjQutGDINGN0LrRgNCw0L3QsFxuICBfb25TY3JlZW5TaG93KCkge31cblxuICAvLyDQvNC10YLQvtC0INC/0LXRgNC10LfQsNC/0YPRgdC60LDQtdGCINC40LPRgNGDXG4gIF9yZXN0YXJ0R2FtZSgpIHtcbiAgICBjb25zdCBjb25maXJtTW9kYWwgPSBuZXcgQ29uZmlybU1vZGFsVmlldygpO1xuICAgIGNvbmZpcm1Nb2RhbC5yZW5kZXIoKTtcbiAgICBjb25maXJtTW9kYWwuYmluZCgoKSA9PiB7XG4gICAgICB0aGlzLmdhbWVNb2RlbC5yZXNldCgpO1xuICAgICAgdGhpcy5zdGFydFNjcmVlbi5zaG93KCk7XG4gICAgICBpZiAodGhpcy50aW1lcikge1xuICAgICAgICB0aGlzLnRpbWVyLnN0b3AoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXZWxjb21lU2NyZWVuVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gYDxkaXYgaWQ9XCJtYWluXCIgY2xhc3M9XCJjZW50cmFsX19jb250ZW50XCI+XG4gICAgICAgICAgICAgIDxzZWN0aW9uIGlkPVwiaW50cm9cIiBjbGFzcz1cImludHJvXCI+XG4gICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBUTyBBU1RFUklTSyAtLT5cbiAgICAgICAgICAgICAgICA8cCBjbGFzcz1cImludHJvX19tb3R0b1wiPjxzdXA+Kjwvc3VwPiDQrdGC0L4g0L3QtSDRhNC+0YLQvi4g0K3RgtC+INGA0LjRgdGD0L3QvtC6INC80LDRgdC70L7QvCDQvdC40LTQtdGA0LvQsNC90LTRgdC60L7Qs9C+INGF0YPQtNC+0LbQvdC40LrQsC3RhNC+0YLQvtGA0LXQsNC70LjRgdGC0LAgVGphbGYgU3Bhcm5hYXkuPC9wPlxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJpbnRyb19fdG9wIHRvcFwiIHR5cGU9XCJidXR0b25cIj5cbiAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPVwiaW1nL2ljb24tdG9wLnN2Z1wiIHdpZHRoPVwiNzFcIiBoZWlnaHQ9XCI3OVwiIGFsdD1cItCi0L7QvyDQuNCz0YDQvtC60L7QslwiPlxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgICAgICA8L2Rpdj5gO1xuICB9XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFzdGVyaXNrVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gYDxidXR0b24gY2xhc3M9XCJpbnRyb19fYXN0ZXJpc2sgYXN0ZXJpc2tcIiB0eXBlPVwiYnV0dG9uXCI+PHNwYW4gY2xhc3M9XCJ2aXN1YWxseS1oaWRkZW5cIj7Qn9GA0L7QtNC+0LvQttC40YLRjDwvc3Bhbj4qPC9idXR0b24+YDtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ludHJvJyk7XG4gICAgcGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUodGhpcy5lbGVtZW50LCBwYXJlbnRFbGVtZW50LmZpcnN0Q2hpbGQpO1xuICB9XG5cbiAgYmluZChjYikge1xuICAgIGNvbnN0IGFzdGVyaXNrID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmludHJvX19hc3Rlcmlza2ApO1xuICAgIGFzdGVyaXNrLmFkZEV2ZW50TGlzdGVuZXIoYGNsaWNrYCwgY2IpO1xuICB9XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RTY3JlZW4gZnJvbSAnLi4vYWJzdHJhY3Qtc2NyZWVuLmpzJztcblxuaW1wb3J0IEludHJvU2NyZWVuVmlldyBmcm9tICcuL3dlbGNvbWUtc2NyZWVuLXZpZXcuanMnO1xuaW1wb3J0IEFzdGVyaXNrVmlldyBmcm9tICcuL2FzdGVyaXNrLXZpZXcuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXZWxjb21lU2NyZWVuIGV4dGVuZHMgQWJzdHJhY3RTY3JlZW4ge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy52aWV3ID0gbmV3IEludHJvU2NyZWVuVmlldygpO1xuICB9XG5cbiAgX29uU2NyZWVuU2hvdygpIHtcbiAgICBjb25zdCBhc3RlcmlzayA9IG5ldyBBc3Rlcmlza1ZpZXcoKTtcbiAgICBhc3Rlcmlzay5yZW5kZXIoKTtcbiAgICBhc3Rlcmlzay5iaW5kKHRoaXMubmV4dFNjcmVlbi5zaG93LmJpbmQodGhpcy5uZXh0U2NyZWVuKSk7XG4gIH1cbn1cbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR3JlZXRpbmdTY3JlZW5WaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPGRpdiBpZD1cIm1haW5cIiBjbGFzcz1cImNlbnRyYWxfX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgPHNlY3Rpb24gY2xhc3M9XCJncmVldGluZyBjZW50cmFsLS1ibHVyXCI+XG4gICAgICAgICAgICAgICAgPGltZyBjbGFzcz1cImdyZWV0aW5nX19sb2dvXCIgc3JjPVwiaW1nL2xvZ29fcGgtYmlnLnN2Z1wiIHdpZHRoPVwiMjAxXCIgaGVpZ2h0PVwiODlcIiBhbHQ9XCJQaXhlbCBIdW50ZXJcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JlZXRpbmdfX2FzdGVyaXNrIGFzdGVyaXNrXCI+PHNwYW4gY2xhc3M9XCJ2aXN1YWxseS1oaWRkZW5cIj7QryDQv9GA0L7RgdGC0L4g0LrRgNCw0YHQuNCy0LDRjyDQt9Cy0ZHQt9C00L7Rh9C60LA8L3NwYW4+KjwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJncmVldGluZ19fY2hhbGxlbmdlXCI+XG4gICAgICAgICAgICAgICAgICA8aDMgY2xhc3M9XCJncmVldGluZ19fY2hhbGxlbmdlLXRpdGxlXCI+0JvRg9GH0YjQuNC1INGF0YPQtNC+0LbQvdC40LrQuC3RhNC+0YLQvtGA0LXQsNC70LjRgdGC0Ysg0LHRgNC+0YHQsNGO0YIg0YLQtdCx0LUg0LLRi9C30L7QsiE8L2gzPlxuICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJncmVldGluZ19fY2hhbGxlbmdlLXRleHRcIj7Qn9GA0LDQstC40LvQsCDQuNCz0YDRiyDQv9GA0L7RgdGC0Ys6PC9wPlxuICAgICAgICAgICAgICAgICAgPHVsIGNsYXNzPVwiZ3JlZXRpbmdfX2NoYWxsZW5nZS1saXN0XCI+XG4gICAgICAgICAgICAgICAgICAgIDxsaT7QndGD0LbQvdC+INC+0YLQu9C40YfQuNGC0Ywg0YDQuNGB0YPQvdC+0Log0L7RgiDRhNC+0YLQvtCz0YDQsNGE0LjQuCDQuCDRgdC00LXQu9Cw0YLRjCDQstGL0LHQvtGALjwvbGk+XG4gICAgICAgICAgICAgICAgICAgIDxsaT7Ql9Cw0LTQsNGH0LAg0LrQsNC20LXRgtGB0Y8g0YLRgNC40LLQuNCw0LvRjNC90L7QuSwg0L3QviDQvdC1INC00YPQvNCw0LksINGH0YLQviDQstGB0LUg0YLQsNC6INC/0YDQvtGB0YLQvi48L2xpPlxuICAgICAgICAgICAgICAgICAgICA8bGk+0KTQvtGC0L7RgNC10LDQu9C40LfQvCDQvtCx0LzQsNC90YfQuNCyINC4INC60L7QstCw0YDQtdC9LjwvbGk+XG4gICAgICAgICAgICAgICAgICAgIDxsaT7Qn9C+0LzQvdC4LCDQs9C70LDQstC90L7QtSDigJQg0YHQvNC+0YLRgNC10YLRjCDQvtGH0LXQvdGMINCy0L3QuNC80LDRgtC10LvRjNC90L4uPC9saT5cbiAgICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBUTyBTVEFSVCBBUlJPVyAtLT5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZ3JlZXRpbmdfX3RvcCB0b3BcIiB0eXBlPVwiYnV0dG9uXCI+XG4gICAgICAgICAgICAgICAgICA8aW1nIHNyYz1cImltZy9pY29uLXRvcC5zdmdcIiB3aWR0aD1cIjcxXCIgaGVpZ2h0PVwiNzlcIiBhbHQ9XCLQotC+0L8g0LjQs9GA0L7QutC+0LJcIj5cbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICAgICAgPC9kaXY+YDtcbiAgfVxufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGFydEFycm93VmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gYDxidXR0b24gY2xhc3M9XCJncmVldGluZ19fY29udGludWVcIiB0eXBlPVwiYnV0dG9uXCI+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidmlzdWFsbHktaGlkZGVuXCI+0J/RgNC+0LTQvtC70LbQuNGC0Yw8L3NwYW4+XG4gICAgICAgICAgICAgIDxzdmcgY2xhc3M9XCJpY29uXCIgd2lkdGg9XCI2NFwiIGhlaWdodD1cIjY0XCIgdmlld0JveD1cIjAgMCA2NCA2NFwiIGZpbGw9XCIjMDAwMDAwXCI+XG4gICAgICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPVwiaW1nL3Nwcml0ZS5zdmcjYXJyb3ctcmlnaHRcIj48L3VzZT5cbiAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICA8L2J1dHRvbj5gO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBzZWN0aW9uLmdyZWV0aW5nYCk7XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgYmluZChjYikge1xuICAgIGNvbnN0IHN0YXJ0QXJyb3cgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuZ3JlZXRpbmdfX2NvbnRpbnVlYCk7XG4gICAgc3RhcnRBcnJvdy5hZGRFdmVudExpc3RlbmVyKGBjbGlja2AsIGNiKTtcbiAgfVxufVxuIiwiaW1wb3J0IEFic3RyYWN0U2NyZWVuIGZyb20gJy4uL2Fic3RyYWN0LXNjcmVlbi5qcyc7XG5cbmltcG9ydCBHcmVldGluZ1NjcmVlblZpZXcgZnJvbSAnLi9ncmVldGluZy1zY3JlZW4tdmlldy5qcyc7XG5pbXBvcnQgU3RhcnRBcnJvd1ZpZXcgZnJvbSAnLi9zdGFydC1hcnJvdy12aWV3LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR3JlZXRpbmdTY3JlZW4gZXh0ZW5kcyBBYnN0cmFjdFNjcmVlbiB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnZpZXcgPSBuZXcgR3JlZXRpbmdTY3JlZW5WaWV3KCk7XG4gIH1cblxuICBfb25TY3JlZW5TaG93KCkge1xuICAgIGNvbnN0IHN0YXJ0QXJyb3cgPSBuZXcgU3RhcnRBcnJvd1ZpZXcoKTtcbiAgICBzdGFydEFycm93LnJlbmRlcigpO1xuICAgIHN0YXJ0QXJyb3cuYmluZCh0aGlzLm5leHRTY3JlZW4uc2hvdy5iaW5kKHRoaXMubmV4dFNjcmVlbikpO1xuICB9XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJ1bGVzU2NyZWVuVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gYDxkaXYgaWQ9XCJtYWluXCIgY2xhc3M9XCJjZW50cmFsX19jb250ZW50XCI+XG4gICAgICAgICAgICAgIDxoZWFkZXIgY2xhc3M9XCJoZWFkZXJcIj5cbiAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIFRPIEJBQ0sgQVJST1cgLS0+XG4gICAgICAgICAgICAgIDwvaGVhZGVyPlxuICAgICAgICAgICAgICA8c2VjdGlvbiBjbGFzcz1cInJ1bGVzXCI+XG4gICAgICAgICAgICAgICAgPGgyIGNsYXNzPVwicnVsZXNfX3RpdGxlXCI+0J/RgNCw0LLQuNC70LA8L2gyPlxuICAgICAgICAgICAgICAgIDx1bCBjbGFzcz1cInJ1bGVzX19kZXNjcmlwdGlvblwiPlxuICAgICAgICAgICAgICAgICAgPGxpPtCj0LPQsNC00LDQuSAxMCDRgNCw0Lcg0LTQu9GPINC60LDQttC00L7Qs9C+INC40LfQvtCx0YDQsNC20LXQvdC40Y8g0YTQvtGC0L5cbiAgICAgICAgICAgICAgICAgICAgPGltZyBjbGFzcz1cInJ1bGVzX19pY29uXCIgc3JjPVwiaW1nL2ljb24tcGhvdG8ucG5nXCIgd2lkdGg9XCIzMlwiIGhlaWdodD1cIjMxXCIgYWx0PVwi0KTQvtGC0L5cIj4g0LjQu9C4INGA0LjRgdGD0L3QvtC6XG4gICAgICAgICAgICAgICAgICAgIDxpbWcgY2xhc3M9XCJydWxlc19faWNvblwiIHNyYz1cImltZy9pY29uLXBhaW50LnBuZ1wiIHdpZHRoPVwiMzJcIiBoZWlnaHQ9XCIzMVwiIGFsdD1cItCg0LjRgdGD0L3QvtC6XCI+PC9saT5cbiAgICAgICAgICAgICAgICAgIDxsaT7QpNC+0YLQvtCz0YDQsNGE0LjRj9C80Lgg0LjQu9C4INGA0LjRgdGD0L3QutCw0LzQuCDQvNC+0LPRg9GCINCx0YvRgtGMINC+0LHQsCDQuNC30L7QsdGA0LDQttC10L3QuNGPLjwvbGk+XG4gICAgICAgICAgICAgICAgICA8bGk+0J3QsCDQutCw0LbQtNGD0Y4g0L/QvtC/0YvRgtC60YMg0L7RgtCy0L7QtNC40YLRgdGPIDMwINGB0LXQutGD0L3QtC48L2xpPlxuICAgICAgICAgICAgICAgICAgPGxpPtCe0YjQuNCx0LjRgtGM0YHRjyDQvNC+0LbQvdC+INC90LUg0LHQvtC70LXQtSAzINGA0LDQty48L2xpPlxuICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJydWxlc19fcmVhZHlcIj7Qk9C+0YLQvtCy0Ys/PC9wPlxuICAgICAgICAgICAgICAgIDxmb3JtIGNsYXNzPVwicnVsZXNfX2Zvcm1cIj5cbiAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgVE8gTkFNRSBJTlBVVCAtLT5cbiAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgVE8gU1RBUlQgQlVUVE9OIC0tPlxuICAgICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICAgICAgPC9kaXY+YDtcbiAgfVxufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOYW1lSW5wdXRWaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPGlucHV0IGNsYXNzPVwicnVsZXNfX2lucHV0XCIgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cItCS0LDRiNC1INCY0LzRj1wiPmA7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYGZvcm0ucnVsZXNfX2Zvcm1gKTtcbiAgICB0aGlzLmVsZW1lbnQudmFsdWUgPSBgYDtcbiAgICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XG4gIH1cblxuICBiaW5kKCkge1xuICAgIGNvbnN0IG5hbWVJbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5ydWxlc19faW5wdXRgKTtcbiAgICBjb25zdCBzdGFydEJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5ydWxlc19fYnV0dG9uYCk7XG4gICAgbmFtZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoYGlucHV0YCwgKCkgPT4ge1xuICAgICAgc3RhcnRCdG4uZGlzYWJsZWQgPSAobmFtZUlucHV0LnZhbHVlID09PSBgYCkgPyB0cnVlIDogZmFsc2U7XG4gICAgfSk7XG4gIH1cbn1cbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhcnRCdXR0b25WaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPGJ1dHRvbiBjbGFzcz1cInJ1bGVzX19idXR0b24gIGNvbnRpbnVlXCIgdHlwZT1cInN1Ym1pdFwiIGRpc2FibGVkPkdvITwvYnV0dG9uPmA7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYGZvcm0ucnVsZXNfX2Zvcm1gKTtcbiAgICB0aGlzLmVsZW1lbnQuZGlzYWJsZWQgPSB0cnVlO1xuICAgIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIGJpbmQoY2IpIHtcbiAgICBjb25zdCBzdGFydEJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5ydWxlc19fYnV0dG9uYCk7XG4gICAgc3RhcnRCdG4uYWRkRXZlbnRMaXN0ZW5lcihgY2xpY2tgLCBjYik7XG4gIH1cbn1cbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFja0Fycm93VmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gYDxidXR0b24gY2xhc3M9XCJiYWNrXCI+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidmlzdWFsbHktaGlkZGVuXCI+0JLQtdGA0L3Rg9GC0YzRgdGPINC6INC90LDRh9Cw0LvRgzwvc3Bhbj5cbiAgICAgICAgICAgICAgPHN2ZyBjbGFzcz1cImljb25cIiB3aWR0aD1cIjQ1XCIgaGVpZ2h0PVwiNDVcIiB2aWV3Qm94PVwiMCAwIDQ1IDQ1XCIgZmlsbD1cIiMwMDAwMDBcIj5cbiAgICAgICAgICAgICAgICA8dXNlIHhsaW5rOmhyZWY9XCJpbWcvc3ByaXRlLnN2ZyNhcnJvdy1sZWZ0XCI+PC91c2U+XG4gICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgICA8c3ZnIGNsYXNzPVwiaWNvblwiIHdpZHRoPVwiMTAxXCIgaGVpZ2h0PVwiNDRcIiB2aWV3Qm94PVwiMCAwIDEwMSA0NFwiIGZpbGw9XCIjMDAwMDAwXCI+XG4gICAgICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPVwiaW1nL3Nwcml0ZS5zdmcjbG9nby1zbWFsbFwiPjwvdXNlPlxuICAgICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgIDwvYnV0dG9uPmA7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYGhlYWRlci5oZWFkZXJgKTtcbiAgICBwYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZSh0aGlzLmVsZW1lbnQsIHBhcmVudEVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gIH1cblxuICBiaW5kKGNiKSB7XG4gICAgY29uc3QgYmFja0Fycm93ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmJhY2tgKTtcbiAgICBiYWNrQXJyb3cuYWRkRXZlbnRMaXN0ZW5lcihgY2xpY2tgLCBjYik7XG4gIH1cbn1cbiIsImltcG9ydCBBYnN0cmFjdFNjcmVlbiBmcm9tICcuLi9hYnN0cmFjdC1zY3JlZW4uanMnO1xuXG5pbXBvcnQgUnVsZXNTY3JlZW5WaWV3IGZyb20gJy4vcnVsZXMtc2NyZWVuLXZpZXcuanMnO1xuaW1wb3J0IE5hbWVJbnB1dFZpZXcgZnJvbSAnLi9uYW1lLWlucHV0LXZpZXcuanMnO1xuaW1wb3J0IFN0YXJ0QnV0dG9uVmlldyBmcm9tICcuL3N0YXJ0LWJ1dHRvbi12aWV3LmpzJztcbmltcG9ydCBCYWNrQXJyb3dWaWV3IGZyb20gJy4uL3V0aWwtdmlld3MvYmFjay1hcnJvdy12aWV3LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUnVsZXNTY3JlZW4gZXh0ZW5kcyBBYnN0cmFjdFNjcmVlbiB7XG5cbiAgY29uc3RydWN0b3IoZ2FtZU1vZGVsKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmdhbWVNb2RlbCA9IGdhbWVNb2RlbDtcbiAgICB0aGlzLnZpZXcgPSBuZXcgUnVsZXNTY3JlZW5WaWV3KCk7XG4gIH1cblxuICBfb25TY3JlZW5TaG93KCkge1xuICAgIGNvbnN0IG5hbWVJbnB1dCA9IG5ldyBOYW1lSW5wdXRWaWV3KCk7XG4gICAgY29uc3Qgc3RhcnRCdG4gPSBuZXcgU3RhcnRCdXR0b25WaWV3KCk7XG4gICAgY29uc3QgYmFja0Fycm93ID0gbmV3IEJhY2tBcnJvd1ZpZXcoKTtcbiAgICBjb25zdCBvblN0YXJ0QnRuQ2xpY2sgPSB0aGlzLl9vblN0YXJ0QnRuQ2xpY2suYmluZCh0aGlzKTtcbiAgICBjb25zdCByZXN0YXJ0R2FtZSA9IHRoaXMuX3Jlc3RhcnRHYW1lLmJpbmQodGhpcyk7XG5cbiAgICBuYW1lSW5wdXQucmVuZGVyKCk7XG4gICAgc3RhcnRCdG4ucmVuZGVyKCk7XG4gICAgYmFja0Fycm93LnJlbmRlcigpO1xuXG4gICAgc3RhcnRCdG4uYmluZChvblN0YXJ0QnRuQ2xpY2spO1xuICAgIG5hbWVJbnB1dC5iaW5kKCk7XG4gICAgYmFja0Fycm93LmJpbmQocmVzdGFydEdhbWUpO1xuICB9XG5cbiAgX29uU3RhcnRCdG5DbGljaygpIHtcbiAgICBjb25zdCBuYW1lSW5wdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAucnVsZXNfX2lucHV0YCk7XG4gICAgdGhpcy5nYW1lTW9kZWwucGxheWVyTmFtZSA9IG5hbWVJbnB1dC52YWx1ZS50cmltKCk7XG4gICAgdGhpcy5uZXh0U2NyZWVuLnNob3coKTtcbiAgfVxufVxuIiwiaW1wb3J0IGNvbmZpZyBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHYW1lU2NyZWVuVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoZ2FtZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5nYW1lID0gZ2FtZTtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gYDxkaXYgaWQ9XCJtYWluXCIgY2xhc3M9XCJjZW50cmFsX19jb250ZW50XCI+XG4gICAgICAgICAgICAgIDxoZWFkZXIgY2xhc3M9XCJoZWFkZXJcIj5cbiAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIFRPIEJBQ0sgQVJST1cgLS0+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdhbWVfX3RpbWVyXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdhbWVfX2xpdmVzXCI+PC9kaXY+XG4gICAgICAgICAgICAgIDwvaGVhZGVyPlxuICAgICAgICAgICAgICA8c2VjdGlvbiBjbGFzcz1cImdhbWVcIj5cbiAgICAgICAgICAgICAgICA8cCBjbGFzcz1cImdhbWVfX3Rhc2tcIj4ke3RoaXMuZ2FtZS5xdWVzdGlvbn08L3A+XG4gICAgICAgICAgICAgICAgJHtHYW1lU2NyZWVuVmlldy5nZXRHYW1lQ29udGVudCh0aGlzLmdhbWUudHlwZSl9XG4gICAgICAgICAgICAgICAgPHVsIGNsYXNzPVwic3RhdHNcIj48L3VsPlxuICAgICAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgICAgICA8L2Rpdj5gO1xuICB9XG5cbiAgc3RhdGljIGdldEdhbWVDb250ZW50KGdhbWVUeXBlKSB7XG4gICAgbGV0IGNvbnRlbnQgPSBgYDtcbiAgICBpZiAoZ2FtZVR5cGUgPT09IGNvbmZpZy5RdWVzdGlvblR5cGUuVElOREVSX0xJS0UpIHtcbiAgICAgIGNvbnRlbnQgPSBgPGZvcm0gY2xhc3M9XCJnYW1lX19jb250ZW50ICBnYW1lX19jb250ZW50LS13aWRlXCI+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ2FtZV9fb3B0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIElNQUdFIC0tPlxuICAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBBTlNXRVIgUEhPVE8gQlVUVE9OIC0tPlxuICAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBBTlNXRVIgUEFJTlQgQlVUVE9OIC0tPlxuICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgIDwvZm9ybT5gO1xuICAgIH0gZWxzZSBpZiAoZ2FtZVR5cGUgPT09IGNvbmZpZy5RdWVzdGlvblR5cGUuVFdPX09GX1RXTykge1xuICAgICAgY29udGVudCA9IGA8Zm9ybSBjbGFzcz1cImdhbWVfX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ2FtZV9fb3B0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBJTUFHRSAtLT5cbiAgICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIEFOU1dFUiBQSE9UTyBCVVRUT04gLS0+XG4gICAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBBTlNXRVIgUEFJTlQgQlVUVE9OIC0tPlxuICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJnYW1lX19vcHRpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIElNQUdFIC0tPlxuICAgICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgQU5TV0VSIFBIT1RPIEJVVFRPTiAtLT5cbiAgICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIEFOU1dFUiBQQUlOVCBCVVRUT04gLS0+XG4gICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgIDwvZm9ybT5gO1xuICAgIH0gZWxzZSBpZiAoZ2FtZVR5cGUgPT09IGNvbmZpZy5RdWVzdGlvblR5cGUuT05FX09GX1RIUkVFKSB7XG4gICAgICBjb250ZW50ID0gYDxmb3JtIGNsYXNzPVwiZ2FtZV9fY29udGVudCAgZ2FtZV9fY29udGVudC0tdHJpcGxlXCI+XG4gICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgQU5TV0VSIFBBSU5UIE9QVElPTiAtLT5cbiAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBBTlNXRVIgUEFJTlQgT1BUSU9OIC0tPlxuICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIEFOU1dFUiBQQUlOVCBPUFRJT04gLS0+XG4gICAgICAgICAgICAgICAgIDwvZm9ybT5gO1xuICAgIH1cbiAgICByZXR1cm4gY29udGVudDtcbiAgfVxuXG59XG4iLCJpbXBvcnQgY29uZmlnIGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRpbWVyQmxvY2tWaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX2lzQWN0aXZlID0gdHJ1ZTtcbiAgICB0aGlzLl90aW1lID0gY29uZmlnLlRJTUVfVE9fQU5TV0VSO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIGNvbnN0IHRpbWUgPSBUaW1lckJsb2NrVmlldy5nZXRUaW1lRm9ybWF0dGVkKHRoaXMudGltZSk7XG4gICAgcmV0dXJuIGA8ZGl2IGNsYXNzPVwiZ2FtZV9fdGltZXJcIj4ke3RpbWV9PC9kaXY+YDtcbiAgfVxuXG4gIGdldCB0aW1lKCkge1xuICAgIHJldHVybiB0aGlzLl90aW1lO1xuICB9XG5cbiAgc2V0IHRpbWUobmV3VGltZSkge1xuICAgIHRoaXMuX3RpbWUgPSBuZXdUaW1lO1xuICB9XG5cbiAgZ2V0IGlzQWN0aXZlKCkge1xuICAgIHJldHVybiB0aGlzLl9pc0FjdGl2ZTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgaGVhZGVyLmhlYWRlcmApO1xuICAgIHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKHRoaXMuZWxlbWVudCwgcGFyZW50RWxlbWVudC5maXJzdENoaWxkKTtcbiAgfVxuXG4gIHVwZGF0ZSgpIHtcbiAgICBpZiAodGhpcy5faXNBY3RpdmUgJiYgdGhpcy50aW1lID4gMCkge1xuICAgICAgdGhpcy50aW1lID0gdGhpcy50aW1lIC0gMTAwMDtcbiAgICAgIGNvbnN0IHRpbWUgPSBUaW1lckJsb2NrVmlldy5nZXRUaW1lRm9ybWF0dGVkKHRoaXMudGltZSk7XG4gICAgICBjb25zdCB0aW1lckVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBkaXYuZ2FtZV9fdGltZXJgKTtcbiAgICAgIHRpbWVyRWxlbWVudC50ZXh0Q29udGVudCA9IHRpbWU7XG4gICAgICBpZiAodGhpcy50aW1lID09PSA1MDAwIHx8IHRoaXMudGltZSA9PT0gMzAwMCB8fCB0aGlzLnRpbWUgPT09IDEwMDApIHtcbiAgICAgICAgdGltZXJFbGVtZW50LnN0eWxlID0gYGNvbG9yOiAke2NvbmZpZy5DT0xPUl9SRUR9O2A7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aW1lckVsZW1lbnQuc3R5bGUgPSBgY29sb3I6IGJsYWNrO2A7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc3RvcCgpIHtcbiAgICB0aGlzLl9pc0FjdGl2ZSA9IGZhbHNlO1xuICB9XG5cbiAgc3RhdGljIGdldFRpbWVGb3JtYXR0ZWQodGltZSkge1xuICAgIGNvbnN0IFJFR0VYID0gL15cXGQkLztcbiAgICBsZXQgbWluID0gYGAgKyBNYXRoLmZsb29yKHRpbWUgLyAxMDAwIC8gNjApO1xuICAgIGxldCBzZWMgPSBgYCArIE1hdGguZmxvb3IoKHRpbWUgLSAobWluICogMTAwMCAqIDYwKSkgLyAxMDAwKTtcbiAgICBpZiAoUkVHRVgudGVzdChzZWMpKSB7XG4gICAgICBzZWMgPSBgMCR7c2VjfWA7XG4gICAgfVxuICAgIGlmIChSRUdFWC50ZXN0KG1pbikpIHtcbiAgICAgIG1pbiA9IGAwJHttaW59YDtcbiAgICB9XG4gICAgcmV0dXJuIGAke21pbn06JHtzZWN9YDtcbiAgfVxufVxuIiwiaW1wb3J0IGNvbmZpZyBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMaXZlc0Jsb2NrVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IobGl2ZXMpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMubGl2ZXMgPSBsaXZlcztcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICBsZXQgcmVzdWx0ID0gYGA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb25maWcuTElWRVNfQ09VTlQ7IGkrKykge1xuICAgICAgcmVzdWx0ICs9IGA8aW1nIHNyYz1cImltZy9oZWFydF9fJHsodGhpcy5saXZlcyA+IDApID8gYGZ1bGxgIDogYGVtcHR5YH0uc3ZnXCIgY2xhc3M9XCJnYW1lX19oZWFydFwiIGFsdD1cIkxpZmVcIiB3aWR0aD1cIjMxXCIgaGVpZ2h0PVwiMjdcIj5gO1xuICAgICAgdGhpcy5saXZlcy0tO1xuICAgIH1cbiAgICByZXR1cm4gYDxkaXYgY2xhc3M9XCJnYW1lX19saXZlc1wiPiR7cmVzdWx0fTwvZGl2PmA7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYGhlYWRlci5oZWFkZXJgKTtcbiAgICBjb25zdCBvbGRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgZGl2LmdhbWVfX2xpdmVzYCk7XG4gICAgcGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChvbGRFbGVtZW50KTtcbiAgICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XG4gIH1cbn1cbiIsImltcG9ydCBjb25maWcgZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhdHNCbG9ja1ZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKGFuc3dlcnMpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuYW5zd2VycyA9IGFuc3dlcnM7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgbGV0IHJlc3VsdCA9IGBgO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29uZmlnLkdBTUVTX0NPVU5UOyBpKyspIHtcbiAgICAgIGNvbnN0IGFuc3dlciA9IHRoaXMuYW5zd2Vyc1tpXTtcbiAgICAgIGxldCBtb2RpZmllciA9IGBgO1xuICAgICAgaWYgKGFuc3dlcikge1xuICAgICAgICBpZiAoYW5zd2VyLmlzT0spIHtcbiAgICAgICAgICBtb2RpZmllciA9IGBjb3JyZWN0YDtcbiAgICAgICAgICBpZiAoYW5zd2VyLnRpbWUgPCAxMCkge1xuICAgICAgICAgICAgbW9kaWZpZXIgPSBgZmFzdGA7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChhbnN3ZXIudGltZSA+IDIwKSB7XG4gICAgICAgICAgICBtb2RpZmllciA9IGBzbG93YDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbW9kaWZpZXIgPSBgd3JvbmdgO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtb2RpZmllciA9IGB1bmtub3duYDtcbiAgICAgIH1cbiAgICAgIHJlc3VsdCArPSBgPGxpIGNsYXNzPVwic3RhdHNfX3Jlc3VsdCBzdGF0c19fcmVzdWx0LS0ke21vZGlmaWVyfVwiPjwvbGk+YDtcbiAgICB9XG4gICAgcmV0dXJuIGA8dWwgY2xhc3M9XCJzdGF0c1wiPiR7cmVzdWx0fTwvdWw+YDtcbn1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYHNlY3Rpb24uZ2FtZWApO1xuICAgIGNvbnN0IG9sZEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGB1bC5zdGF0c2ApO1xuICAgIHBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQob2xkRWxlbWVudCk7XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG59XG4iLCJjb25zdCBERUJVR19PTiA9IHRydWU7XG5jb25zdCBTVFlMRSA9IGBzdHlsZT1cImJveC1zaGFkb3c6IDBweCAwcHggMTBweCAxMnB4IHJnYmEoMTksMTczLDI0LDEpO1wiYDtcblxuZnVuY3Rpb24gaXNQaG90byhhbnN3ZXIpIHtcbiAgcmV0dXJuIChERUJVR19PTiAmJiBhbnN3ZXIgPT09IGBwaG90b2ApID8gU1RZTEUgOiBgYDtcbn1cblxuZnVuY3Rpb24gaXNQYWludChhbnN3ZXIpIHtcbiAgcmV0dXJuIChERUJVR19PTiAmJiBhbnN3ZXIgPT09IGBwYWludGluZ2ApID8gU1RZTEUgOiBgYDtcbn1cblxuZnVuY3Rpb24gaXNDb3JyZWN0KGlzQ29ycmVjdCkge1xuICByZXR1cm4gKERFQlVHX09OICYmIGlzQ29ycmVjdCkgPyBTVFlMRSA6IGBgO1xufVxuXG5leHBvcnQgZGVmYXVsdCB7aXNQaG90bywgaXNQYWludCwgaXNDb3JyZWN0fTtcbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcbmltcG9ydCBkZWJ1ZyBmcm9tICcuLi9kZWJ1Zy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFuc3dlclBob3RvQnV0dG9uVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoYW5zd2VySW5kZXgsIGdhbWUpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XG4gICAgdGhpcy5hbnN3ZXJJbmRleCA9IGFuc3dlckluZGV4O1xuICAgIHRoaXMuYW5zd2VyVHlwZSA9IGdhbWUuYW5zd2Vyc1thbnN3ZXJJbmRleF0udHlwZTtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gYDxsYWJlbCBjbGFzcz1cImdhbWVfX2Fuc3dlciBnYW1lX19hbnN3ZXItLXBob3RvXCI+XG4gICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInZpc3VhbGx5LWhpZGRlblwiIHZhbHVlPVwicGhvdG9cIiBuYW1lPVwicXVlc3Rpb24gJHt0aGlzLmFuc3dlckluZGV4fVwiIHR5cGU9XCJyYWRpb1wiIGRhdGEtYW5zd2VyaW5kZXg9XCIke3RoaXMuYW5zd2VySW5kZXh9XCI+XG4gICAgICAgICAgICAgIDxzcGFuICR7ZGVidWcuaXNQaG90byh0aGlzLmFuc3dlclR5cGUpfT7QpNC+0YLQvjwvc3Bhbj5cbiAgICAgICAgICAgIDwvbGFiZWw+YDtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnZGl2LmdhbWVfX29wdGlvbicpW3RoaXMuYW5zd2VySW5kZXhdO1xuICAgIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIGJpbmQoY2IpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnZGl2LmdhbWVfX29wdGlvbicpW3RoaXMuYW5zd2VySW5kZXhdO1xuICAgIGNvbnN0IGFuc3dlckVsZW1lbnQgPSBwYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoYC5nYW1lX19hbnN3ZXItLXBob3RvID4gaW5wdXRgKTtcbiAgICBhbnN3ZXJFbGVtZW50LmNoZWNrZWQgPSBmYWxzZTtcbiAgICBhbnN3ZXJFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoYGNsaWNrYCwgY2IpO1xuICB9XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5pbXBvcnQgZGVidWcgZnJvbSAnLi4vZGVidWcuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBbnN3ZXJQYWludEJ1dHRvblZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKGFuc3dlckluZGV4LCBnYW1lKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xuICAgIHRoaXMuYW5zd2VySW5kZXggPSBhbnN3ZXJJbmRleDtcbiAgICB0aGlzLmFuc3dlclR5cGUgPSBnYW1lLmFuc3dlcnNbYW5zd2VySW5kZXhdLnR5cGU7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuIGA8bGFiZWwgY2xhc3M9XCJnYW1lX19hbnN3ZXIgZ2FtZV9fYW5zd2VyLS1wYWludFwiPlxuICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJ2aXN1YWxseS1oaWRkZW5cIiB2YWx1ZT1cInBhaW50aW5nXCIgbmFtZT1cInF1ZXN0aW9uICR7dGhpcy5hbnN3ZXJJbmRleH1cIiB0eXBlPVwicmFkaW9cIiBkYXRhLWFuc3dlcmluZGV4PVwiJHt0aGlzLmFuc3dlckluZGV4fVwiPlxuICAgICAgICAgICAgICA8c3BhbiAke2RlYnVnLmlzUGFpbnQodGhpcy5hbnN3ZXJUeXBlKX0+0KDQuNGB0YPQvdC+0Lo8L3NwYW4+XG4gICAgICAgICAgICA8L2xhYmVsPmA7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2Rpdi5nYW1lX19vcHRpb24nKVt0aGlzLmFuc3dlckluZGV4XTtcbiAgICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XG4gIH1cblxuICBiaW5kKGNiKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2Rpdi5nYW1lX19vcHRpb24nKVt0aGlzLmFuc3dlckluZGV4XTtcbiAgICBjb25zdCBhbnN3ZXJFbGVtZW50ID0gcGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKGAuZ2FtZV9fYW5zd2VyLS1wYWludCA+IGlucHV0YCk7XG4gICAgYW5zd2VyRWxlbWVudC5jaGVja2VkID0gZmFsc2U7XG4gICAgYW5zd2VyRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGBjbGlja2AsIGNiKTtcbiAgfVxufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuaW1wb3J0IGRlYnVnIGZyb20gJy4uL2RlYnVnLmpzJztcbmltcG9ydCBHYW1lTW9kZWwgZnJvbSAnLi4vZ2FtZS1tb2RlbC9nYW1lLW1vZGVsLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQW5zd2VyUGFpbnRPcHRpb25WaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcihhbnN3ZXJJbmRleCwgZ2FtZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5nYW1lID0gZ2FtZTtcbiAgICB0aGlzLmFuc3dlckluZGV4ID0gYW5zd2VySW5kZXg7XG4gICAgdGhpcy5hbnN3ZXJUeXBlID0gZ2FtZS5hbnN3ZXJzW2Fuc3dlckluZGV4XS50eXBlO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIGNvbnN0IGNvcnJlY3RBbnN3ZXIgPSBHYW1lTW9kZWwuZ2V0Q29ycmVjdEFuc3dlcih0aGlzLmdhbWUpO1xuICAgIHJldHVybiBgPGRpdiBjbGFzcz1cImdhbWVfX29wdGlvblwiIGRhdGEtYW5zd2VyPVwiJHt0aGlzLmFuc3dlclR5cGV9XCIgZGF0YS1hbnN3ZXJpbmRleD1cIiR7dGhpcy5hbnN3ZXJJbmRleH1cIiAke2RlYnVnLmlzQ29ycmVjdCh0aGlzLmFuc3dlclR5cGUgPT09IGNvcnJlY3RBbnN3ZXIpfT5cbiAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgSU1BR0UgLS0+XG4gICAgICAgICAgICA8L2Rpdj5gO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdmb3JtLmdhbWVfX2NvbnRlbnQtLXRyaXBsZScpO1xuICAgIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIGJpbmQoY2IpIHtcbiAgICBjb25zdCBhbnN3ZXJFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgLmdhbWVfX29wdGlvbmApW3RoaXMuYW5zd2VySW5kZXhdO1xuICAgIGFuc3dlckVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihgY2xpY2tgLCBjYik7XG4gIH1cbn1cbiIsIi8vIE1hbmFnaW5nIHNpemVcbi8vIEBwYXJhbSAge29iamVjdH0gZnJhbWUg0L7Qv9C40YHRi9Cy0LDQtdGCINGA0LDQt9C80LXRgNGLINGA0LDQvNC60LgsINCyINC60L7RgtC+0YDRi9C1INC00L7Qu9C20L3QviDQsdGL0YLRjCDQstC/0LjRgdCw0L3QviDQuNC30L7QsdGA0LDQttC10L3QuNC1XG4vLyBAcGFyYW0gIHtvYmplY3R9IGdpdmVuINC+0L/QuNGB0YvQstCw0LXRgiDRiNC40YDQuNC90YMg0Lgg0LLRi9GB0L7RgtGDINC40LfQvtCx0YDQsNC20LXQvdC40Y8sINC60L7RgtC+0YDQvtC1INC90YPQttC90L4g0L/QvtC00L7Qs9C90LDRgtGMINC/0L7QtCDRgNCw0LzQutGDXG4vLyBAcmV0dXJuIHtvYmplY3R9INC90L7QstGL0Lkg0L7QsdGK0LXQutGCLCDQutC+0YLQvtGA0YvQuSDQsdGD0LTQtdGCINGB0L7QtNC10YDQttCw0YLRjCDQuNC30LzQtdC90ZHQvdC90YvQtSDRgNCw0LfQvNC10YDRiyDQuNC30L7QsdGA0LDQttC10L3QuNGPXG5leHBvcnQgZGVmYXVsdCAgZnVuY3Rpb24gcmVzaXplKGZyYW1lLCBnaXZlbikge1xuICBsZXQgd2lkdGggPSBnaXZlbi53aWR0aDtcbiAgbGV0IGhlaWdodCA9IGdpdmVuLmhlaWdodDtcbiAgaWYgKHdpZHRoID4gZnJhbWUud2lkdGgpIHtcbiAgICBjb25zdCBtdWx0aXBsaWVyID0gd2lkdGggLyBmcmFtZS53aWR0aDtcbiAgICB3aWR0aCA9IGZyYW1lLndpZHRoO1xuICAgIGhlaWdodCA9IE1hdGguZmxvb3IoaGVpZ2h0IC8gbXVsdGlwbGllcik7XG4gIH1cbiAgaWYgKGhlaWdodCA+IGZyYW1lLmhlaWdodCkge1xuICAgIGNvbnN0IG11bHRpcGxpZXIgPSBoZWlnaHQgLyBmcmFtZS5oZWlnaHQ7XG4gICAgaGVpZ2h0ID0gZnJhbWUuaGVpZ2h0O1xuICAgIHdpZHRoID0gTWF0aC5mbG9vcih3aWR0aCAvIG11bHRpcGxpZXIpO1xuICB9XG4gIHJldHVybiB7d2lkdGgsIGhlaWdodH07XG59XG4iLCJpbXBvcnQgY29uZmlnIGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5pbXBvcnQgcmVzaXplIGZyb20gXCIuLi9yZXNpemUuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW1hZ2VWaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcihxdWVzdGlvbk51bWJlciwgZ2FtZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5xdWVzdGlvbk51bWJlciA9IHF1ZXN0aW9uTnVtYmVyO1xuICAgIHRoaXMuZ2FtZVR5cGUgPSBnYW1lLnR5cGU7XG4gICAgdGhpcy5pbWFnZSA9IGdhbWUuYW5zd2Vyc1txdWVzdGlvbk51bWJlcl0uaW1hZ2U7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgY29uc3QgZnJhbWVTaXplID0gY29uZmlnLlF1ZXN0aW9uVHlwZVRvRnJhbWVTaXplW3RoaXMuZ2FtZVR5cGVdO1xuICAgIGNvbnN0IGltYWdlU2l6ZSA9IHt3aWR0aDogdGhpcy5pbWFnZS53aWR0aCwgaGVpZ2h0OiB0aGlzLmltYWdlLmhlaWdodH07XG4gICAgY29uc3QgcmVzaXplZEltYWdlU2l6ZSA9IHJlc2l6ZShmcmFtZVNpemUsIGltYWdlU2l6ZSk7XG4gICAgcmV0dXJuIGA8aW1nIHNyYz1cIiR7dGhpcy5pbWFnZS51cmx9XCIgYWx0PVwiT3B0aW9uICR7dGhpcy5xdWVzdGlvbk51bWJlciArIDF9XCIgd2lkdGg9XCIke3Jlc2l6ZWRJbWFnZVNpemUud2lkdGh9XCIgaGVpZ2h0PVwiJHtyZXNpemVkSW1hZ2VTaXplLmhlaWdodH1cIj5gO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdkaXYuZ2FtZV9fb3B0aW9uJylbdGhpcy5xdWVzdGlvbk51bWJlcl07XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG59XG4iLCJpbXBvcnQgY29uZmlnIGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgQWJzdHJhY3RTY3JlZW4gZnJvbSAnLi4vYWJzdHJhY3Qtc2NyZWVuLmpzJztcbmltcG9ydCBHYW1lTW9kZWwgZnJvbSAnLi4vZ2FtZS1tb2RlbC9nYW1lLW1vZGVsLmpzJztcblxuaW1wb3J0IEdhbWVTY3JlZW5WaWV3IGZyb20gJy4vZ2FtZS1zY3JlZW4tdmlldy5qcyc7XG5pbXBvcnQgVGltZXJCbG9ja1ZpZXcgZnJvbSAnLi90aW1lci1ibG9jay12aWV3LmpzJztcbmltcG9ydCBMaXZlc0Jsb2NrVmlldyBmcm9tICcuL2xpdmVzLWJsb2NrLXZpZXcuanMnO1xuaW1wb3J0IFN0YXRzQmxvY2tWaWV3IGZyb20gJy4uL3V0aWwtdmlld3Mvc3RhdHMtYmxvY2stdmlldy5qcyc7XG5pbXBvcnQgQW5zd2VyUGhvdG9CdXR0b25WaWV3IGZyb20gJy4vYW5zd2VyLXBob3RvLWJ1dHRvbi12aWV3LmpzJztcbmltcG9ydCBBbnN3ZXJQYWludEJ1dHRvblZpZXcgZnJvbSAnLi9hbnN3ZXItcGFpbnQtYnV0dG9uLXZpZXcuanMnO1xuaW1wb3J0IEFuc3dlclBhaW50T3B0aW9uVmlldyBmcm9tICcuL2Fuc3dlci1wYWludC1vcHRpb24tdmlldy5qcyc7XG5pbXBvcnQgSW1hZ2VWaWV3IGZyb20gJy4vaW1hZ2Utdmlldy5qcyc7XG5pbXBvcnQgQmFja0Fycm93VmlldyBmcm9tICcuLi91dGlsLXZpZXdzL2JhY2stYXJyb3ctdmlldy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdhbWVTY3JlZW4gZXh0ZW5kcyBBYnN0cmFjdFNjcmVlbiB7XG5cbiAgY29uc3RydWN0b3IoZ2FtZU1vZGVsLCBnYW1lLCBpbmRleCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5nYW1lTW9kZWwgPSBnYW1lTW9kZWw7XG4gICAgdGhpcy5nYW1lID0gZ2FtZTtcbiAgICB0aGlzLmdhbWVJbmRleCA9IGluZGV4O1xuICAgIHRoaXMudmlldyA9IG5ldyBHYW1lU2NyZWVuVmlldyhnYW1lKTtcbiAgfVxuXG4gIF9vblNjcmVlblNob3coKSB7XG4gICAgY29uc3QgZ2FtZSA9IHRoaXMuZ2FtZTtcbiAgICBjb25zdCBsaXZlc0Jsb2NrID0gbmV3IExpdmVzQmxvY2tWaWV3KHRoaXMuZ2FtZU1vZGVsLmxpdmVzKTtcbiAgICBjb25zdCBzdGF0c0Jsb2NrID0gbmV3IFN0YXRzQmxvY2tWaWV3KHRoaXMuZ2FtZU1vZGVsLmFuc3dlcnMpO1xuXG4gICAgbGl2ZXNCbG9jay5yZW5kZXIoKTtcbiAgICBzdGF0c0Jsb2NrLnJlbmRlcigpO1xuXG4gICAgdGhpcy50aW1lciA9IG5ldyBUaW1lckJsb2NrVmlldygpO1xuICAgIHRoaXMudGltZXIucmVuZGVyKCk7XG4gICAgdGhpcy5fdGltZXJPbigpO1xuXG4gICAgY29uc3Qgb25FdmVyeUFuc3dlciA9IHRoaXMuX29uRXZlcnlBbnN3ZXIuYmluZCh0aGlzKTtcbiAgICBpZiAoZ2FtZS50eXBlID09PSBjb25maWcuUXVlc3Rpb25UeXBlLlRJTkRFUl9MSUtFKSB7XG4gICAgICBjb25zdCBhbnN3ZXIxUGhvdG9CdXR0b24gPSBuZXcgQW5zd2VyUGhvdG9CdXR0b25WaWV3KDAsIGdhbWUpO1xuICAgICAgY29uc3QgYW5zd2VyMVBhaW50QnV0dG9uID0gbmV3IEFuc3dlclBhaW50QnV0dG9uVmlldygwLCBnYW1lKTtcbiAgICAgIGNvbnN0IGltYWdlID0gbmV3IEltYWdlVmlldygwLCBnYW1lKTtcbiAgICAgIGFuc3dlcjFQaG90b0J1dHRvbi5yZW5kZXIoKTtcbiAgICAgIGFuc3dlcjFQYWludEJ1dHRvbi5yZW5kZXIoKTtcbiAgICAgIGltYWdlLnJlbmRlcigpO1xuICAgICAgYW5zd2VyMVBob3RvQnV0dG9uLmJpbmQob25FdmVyeUFuc3dlcik7XG4gICAgICBhbnN3ZXIxUGFpbnRCdXR0b24uYmluZChvbkV2ZXJ5QW5zd2VyKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUudHlwZSA9PT0gY29uZmlnLlF1ZXN0aW9uVHlwZS5UV09fT0ZfVFdPKSB7XG4gICAgICBjb25zdCBhbnN3ZXIxUGhvdG9CdXR0b24gPSBuZXcgQW5zd2VyUGhvdG9CdXR0b25WaWV3KDAsIGdhbWUpO1xuICAgICAgY29uc3QgYW5zd2VyMVBhaW50QnV0dG9uID0gbmV3IEFuc3dlclBhaW50QnV0dG9uVmlldygwLCBnYW1lKTtcbiAgICAgIGNvbnN0IGltYWdlMSA9IG5ldyBJbWFnZVZpZXcoMCwgZ2FtZSk7XG4gICAgICBjb25zdCBhbnN3ZXIyUGhvdG9CdXR0b24gPSBuZXcgQW5zd2VyUGhvdG9CdXR0b25WaWV3KDEsIGdhbWUpO1xuICAgICAgY29uc3QgYW5zd2VyMlBhaW50QnV0dG9uID0gbmV3IEFuc3dlclBhaW50QnV0dG9uVmlldygxLCBnYW1lKTtcbiAgICAgIGNvbnN0IGltYWdlMiA9IG5ldyBJbWFnZVZpZXcoMSwgZ2FtZSk7XG4gICAgICBhbnN3ZXIxUGhvdG9CdXR0b24ucmVuZGVyKCk7XG4gICAgICBhbnN3ZXIxUGFpbnRCdXR0b24ucmVuZGVyKCk7XG4gICAgICBpbWFnZTEucmVuZGVyKCk7XG4gICAgICBhbnN3ZXIxUGhvdG9CdXR0b24uYmluZChvbkV2ZXJ5QW5zd2VyKTtcbiAgICAgIGFuc3dlcjFQYWludEJ1dHRvbi5iaW5kKG9uRXZlcnlBbnN3ZXIpO1xuICAgICAgYW5zd2VyMlBob3RvQnV0dG9uLnJlbmRlcigpO1xuICAgICAgYW5zd2VyMlBhaW50QnV0dG9uLnJlbmRlcigpO1xuICAgICAgaW1hZ2UyLnJlbmRlcigpO1xuICAgICAgYW5zd2VyMlBob3RvQnV0dG9uLmJpbmQob25FdmVyeUFuc3dlcik7XG4gICAgICBhbnN3ZXIyUGFpbnRCdXR0b24uYmluZChvbkV2ZXJ5QW5zd2VyKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUudHlwZSA9PT0gY29uZmlnLlF1ZXN0aW9uVHlwZS5PTkVfT0ZfVEhSRUUpIHtcbiAgICAgIGNvbnN0IGFuc3dlcjFQYWludE9wdGlvblZpZXcgPSBuZXcgQW5zd2VyUGFpbnRPcHRpb25WaWV3KDAsIGdhbWUpO1xuICAgICAgY29uc3QgaW1hZ2UxID0gbmV3IEltYWdlVmlldygwLCBnYW1lKTtcbiAgICAgIGNvbnN0IGFuc3dlcjJQYWludE9wdGlvblZpZXcgPSBuZXcgQW5zd2VyUGFpbnRPcHRpb25WaWV3KDEsIGdhbWUpO1xuICAgICAgY29uc3QgaW1hZ2UyID0gbmV3IEltYWdlVmlldygxLCBnYW1lKTtcbiAgICAgIGNvbnN0IGFuc3dlcjNQYWludE9wdGlvblZpZXcgPSBuZXcgQW5zd2VyUGFpbnRPcHRpb25WaWV3KDIsIGdhbWUpO1xuICAgICAgY29uc3QgaW1hZ2UzID0gbmV3IEltYWdlVmlldygyLCBnYW1lKTtcbiAgICAgIGFuc3dlcjFQYWludE9wdGlvblZpZXcucmVuZGVyKCk7XG4gICAgICBpbWFnZTEucmVuZGVyKCk7XG4gICAgICBhbnN3ZXIyUGFpbnRPcHRpb25WaWV3LnJlbmRlcigpO1xuICAgICAgaW1hZ2UyLnJlbmRlcigpO1xuICAgICAgYW5zd2VyM1BhaW50T3B0aW9uVmlldy5yZW5kZXIoKTtcbiAgICAgIGltYWdlMy5yZW5kZXIoKTtcbiAgICAgIGFuc3dlcjFQYWludE9wdGlvblZpZXcuYmluZChvbkV2ZXJ5QW5zd2VyKTtcbiAgICAgIGFuc3dlcjJQYWludE9wdGlvblZpZXcuYmluZChvbkV2ZXJ5QW5zd2VyKTtcbiAgICAgIGFuc3dlcjNQYWludE9wdGlvblZpZXcuYmluZChvbkV2ZXJ5QW5zd2VyKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXN0YXJ0R2FtZSA9IHRoaXMuX3Jlc3RhcnRHYW1lLmJpbmQodGhpcyk7XG5cbiAgICBjb25zdCBiYWNrQXJyb3cgPSBuZXcgQmFja0Fycm93VmlldygpO1xuICAgIGJhY2tBcnJvdy5yZW5kZXIoKTtcbiAgICBiYWNrQXJyb3cuYmluZChyZXN0YXJ0R2FtZSk7XG4gIH1cblxuICBfdGltZXJPbigpIHtcbiAgICBpZiAodGhpcy50aW1lci5pc0FjdGl2ZSAmJiB0aGlzLnRpbWVyLnRpbWUgPiAwKSB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy50aW1lci51cGRhdGUoKTtcbiAgICAgICAgdGhpcy5fdGltZXJPbigpO1xuICAgICAgfSwgMTAwMCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRpbWVyLnRpbWUgPT09IDApIHtcbiAgICAgIHRoaXMuX29uVmFsaWRBbnN3ZXIoZmFsc2UpO1xuICAgIH1cbiAgfVxuXG4gIF9vbkV2ZXJ5QW5zd2VyKGV2dCkge1xuICAgIGlmICh0aGlzLmdhbWUudHlwZSA9PT0gY29uZmlnLlF1ZXN0aW9uVHlwZS5PTkVfT0ZfVEhSRUUpIHtcbiAgICAgIGNvbnN0IGlucHV0ID0gZXZ0LmN1cnJlbnRUYXJnZXQ7XG4gICAgICBjb25zdCBhbnN3ZXJJbmRleCA9IEdhbWVTY3JlZW4uZ2V0QW5zd2VySW5kZXgoaW5wdXQpO1xuICAgICAgY29uc3QgYWN0dWFsQW5zd2VyID0gdGhpcy5fZ2V0QW5zd2VyVHlwZSh0aGlzLmdhbWVJbmRleCwgYW5zd2VySW5kZXgpO1xuICAgICAgY29uc3QgY29ycmVjdEFuc3dlciA9IEdhbWVNb2RlbC5nZXRDb3JyZWN0QW5zd2VyKHRoaXMuZ2FtZSk7XG4gICAgICBjb25zdCBpc09LID0gYWN0dWFsQW5zd2VyID09PSBjb3JyZWN0QW5zd2VyO1xuICAgICAgdGhpcy5fb25WYWxpZEFuc3dlcihpc09LKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgaXNBbGwgPSB0aGlzLl9pc0FsbEFuc3dlcnNHaXZlbigpO1xuICAgICAgaWYgKGlzQWxsKSB7XG4gICAgICAgIGNvbnN0IGlzT0sgPSB0aGlzLl9pc0FsbEFuc3dlcnNHaXZlbkNvcnJlY3QoKTtcbiAgICAgICAgdGhpcy5fb25WYWxpZEFuc3dlcihpc09LKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfaXNBbGxBbnN3ZXJzR2l2ZW4oKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgLmdhbWVfX29wdGlvbmApKTtcbiAgICByZXR1cm4gb3B0aW9ucy5ldmVyeSgob3B0aW9uKSA9PiB7XG4gICAgICBjb25zdCBhbnN3ZXJzID0gQXJyYXkuZnJvbShvcHRpb24ucXVlcnlTZWxlY3RvckFsbChgLmdhbWVfX2Fuc3dlcmApKTtcbiAgICAgIHJldHVybiBhbnN3ZXJzLnNvbWUoKGFuc3dlcikgPT4ge1xuICAgICAgICBjb25zdCBpbnB1dCA9IGFuc3dlci5xdWVyeVNlbGVjdG9yKGBpbnB1dGApO1xuICAgICAgICByZXR1cm4gaW5wdXQuY2hlY2tlZDtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgX2lzQWxsQW5zd2Vyc0dpdmVuQ29ycmVjdCgpIHtcbiAgICBjb25zdCBvcHRpb25zID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGAuZ2FtZV9fb3B0aW9uYCkpO1xuICAgIHJldHVybiBvcHRpb25zLmV2ZXJ5KChvcHRpb24pID0+IHtcbiAgICAgIGNvbnN0IGFuc3dlcnMgPSBBcnJheS5mcm9tKG9wdGlvbi5xdWVyeVNlbGVjdG9yQWxsKGAuZ2FtZV9fYW5zd2VyYCkpO1xuICAgICAgcmV0dXJuIGFuc3dlcnMuc29tZSgoYW5zd2VyKSA9PiB7XG4gICAgICAgIGNvbnN0IGlucHV0ID0gYW5zd2VyLnF1ZXJ5U2VsZWN0b3IoYGlucHV0YCk7XG4gICAgICAgIGNvbnN0IGFuc3dlckluZGV4ID0gR2FtZVNjcmVlbi5nZXRBbnN3ZXJJbmRleChpbnB1dCk7XG4gICAgICAgIGNvbnN0IGFjdHVhbEFuc3dlciA9IHRoaXMuX2dldEFuc3dlclR5cGUodGhpcy5nYW1lSW5kZXgsIGFuc3dlckluZGV4KTtcbiAgICAgICAgcmV0dXJuIGlucHV0LmNoZWNrZWQgJiYgaW5wdXQudmFsdWUgPT09IGFjdHVhbEFuc3dlcjtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgX29uVmFsaWRBbnN3ZXIoaXNPSykge1xuICAgIHRoaXMuX3NhdmVBbnN3ZXIoaXNPSyk7XG4gICAgaWYgKCFpc09LKSB7XG4gICAgICB0aGlzLmdhbWVNb2RlbC5taW51c0xpdmUoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuZ2FtZU1vZGVsLmlzR2FtZU92ZXIpIHtcbiAgICAgIHRoaXMuZW5kU2NyZWVuLnNob3coKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5uZXh0U2NyZWVuLnNob3coKTtcbiAgICB9XG4gIH1cblxuICBfZ2V0QW5zd2VyVHlwZShnYW1lSW5kZXgsIGFuc3dlckluZGV4KSB7XG4gICAgcmV0dXJuIHRoaXMuZ2FtZU1vZGVsLmdhbWVzW2dhbWVJbmRleF0uYW5zd2Vyc1thbnN3ZXJJbmRleF0udHlwZTtcbiAgfVxuXG4gIF9zYXZlQW5zd2VyKGlzT0spIHtcbiAgICBjb25zdCB0aW1lID0gKGNvbmZpZy5USU1FX1RPX0FOU1dFUiAtIHRoaXMudGltZXIudGltZSkgLyAxMDAwO1xuICAgIHRoaXMudGltZXIuc3RvcCgpO1xuICAgIHRoaXMuZ2FtZU1vZGVsLmFkZEFuc3dlcih7aXNPSywgdGltZX0pO1xuICB9XG5cbiAgc3RhdGljIGdldEFuc3dlckluZGV4KGlucHV0KSB7XG4gICAgcmV0dXJuIGlucHV0LmRhdGFzZXQuYW5zd2VyaW5kZXg7XG4gIH1cblxufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGF0c1NjcmVlblZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuIGA8ZGl2IGlkPVwibWFpblwiIGNsYXNzPVwiY2VudHJhbF9fY29udGVudFwiPlxuICAgICAgICAgICAgICA8aGVhZGVyIGNsYXNzPVwiaGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBUTyBCQUNLIEFSUk9XIC0tPlxuICAgICAgICAgICAgICA8L2hlYWRlcj5cbiAgICAgICAgICAgICAgPHNlY3Rpb24gY2xhc3M9XCJyZXN1bHRcIj48L3NlY3Rpb24+XG4gICAgICAgICAgICA8L2Rpdj5gO1xuICB9XG5cbn1cbiIsImltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcuanMnO1xuXG4vLyBTY29yaW5nIGF0IHRoZSBlbmQgb2YgdGhlIGdhbWVcbi8vIEBwYXJhbSAge2FycmF5fSBhbnN3ZXJzINC80LDRgdGB0LjQsiDQvtGC0LLQtdGC0L7QsiDQv9C+0LvRjNC30L7QstCw0YLQtdC70Y9cbi8vIEBwYXJhbSAge2ludGVnZXJ9IGxpdmVzINC60L7Quy3QstC+INC+0YHRgtCw0LLRiNC40YXRgdGPINC20LjQt9C90LXQuVxuLy8gQHJldHVybiB7aW50ZWdlcn0g0LrQvtC7LdCy0L4g0L3QsNCx0YDQsNC90L3Ri9GFINC+0YfQutC+0LJcbmZ1bmN0aW9uIGdldFRvdGFsU2NvcmUoYW5zd2VycywgbGl2ZXMpIHtcbiAgaWYgKGFuc3dlcnMubGVuZ3RoIDwgY29uZmlnLkdBTUVTX0NPVU5UKSB7XG4gICAgcmV0dXJuIC0xO1xuICB9XG4gIGNvbnN0IHNjb3JlID0gYW5zd2Vycy5yZWR1Y2UoKGFjYywgYW5zd2VyKSA9PiB7XG4gICAgaWYgKGFuc3dlci5pc09LKSB7XG4gICAgICBhY2MgKz0gMTAwO1xuICAgIH1cbiAgICBpZiAoYW5zd2VyLnRpbWUgPCAxMCkge1xuICAgICAgYWNjICs9IDUwO1xuICAgIH1cbiAgICBpZiAoYW5zd2VyLnRpbWUgPiAyMCkge1xuICAgICAgYWNjIC09IDUwO1xuICAgIH1cbiAgICByZXR1cm4gYWNjO1xuICB9LCAwKTtcbiAgcmV0dXJuIHNjb3JlICsgbGl2ZXMgKiA1MDtcbn1cblxuZnVuY3Rpb24gZ2V0UmlnaHRBbnN3ZXJzQ291bnQoYW5zd2Vycykge1xuICByZXR1cm4gYW5zd2Vycy5maWx0ZXIoKGFuc3dlcikgPT4gYW5zd2VyLmlzT0spLmxlbmd0aDtcbn1cblxuZnVuY3Rpb24gZ2V0U3BlZWRCb251c0NvdW50KGFuc3dlcnMpIHtcbiAgcmV0dXJuIGFuc3dlcnMuZmlsdGVyKChhbnN3ZXIpID0+IGFuc3dlci50aW1lIDwgMTApLmxlbmd0aDtcbn1cblxuZnVuY3Rpb24gZ2V0U2xvd1BlbmFsdHlDb3VudChhbnN3ZXJzKSB7XG4gIHJldHVybiBhbnN3ZXJzLmZpbHRlcigoYW5zd2VyKSA9PiBhbnN3ZXIudGltZSA+IDIwKS5sZW5ndGg7XG59XG5cbmV4cG9ydCB7Z2V0VG90YWxTY29yZSwgZ2V0UmlnaHRBbnN3ZXJzQ291bnQsIGdldFNwZWVkQm9udXNDb3VudCwgZ2V0U2xvd1BlbmFsdHlDb3VudH07XG4iLCJpbXBvcnQgY29uZmlnIGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5pbXBvcnQgU3RhdHNCbG9ja1ZpZXcgZnJvbSAnLi4vdXRpbC12aWV3cy9zdGF0cy1ibG9jay12aWV3LmpzJztcbmltcG9ydCB7Z2V0VG90YWxTY29yZSwgZ2V0UmlnaHRBbnN3ZXJzQ291bnQsIGdldFNwZWVkQm9udXNDb3VudCwgZ2V0U2xvd1BlbmFsdHlDb3VudH0gZnJvbSAnLi4vc2NvcmUuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGF0c1NpbmdsZVZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKGFuc3dlcnMsIGxpdmVzKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmFuc3dlcnMgPSBhbnN3ZXJzO1xuICAgIHRoaXMubGl2ZXMgPSBsaXZlcztcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICBjb25zdCBpc0FsbCA9IHRoaXMuYW5zd2Vycy5sZW5ndGggPT09IGNvbmZpZy5HQU1FU19DT1VOVDtcbiAgICBjb25zdCBzY29yZSA9IGdldFRvdGFsU2NvcmUodGhpcy5hbnN3ZXJzLCB0aGlzLmxpdmVzKTtcbiAgICBjb25zdCByaWdodEFuc3dlcnNDb3VudCA9IGdldFJpZ2h0QW5zd2Vyc0NvdW50KHRoaXMuYW5zd2Vycyk7XG4gICAgY29uc3Qgc3BlZWRCb251c0NvdW50ID0gZ2V0U3BlZWRCb251c0NvdW50KHRoaXMuYW5zd2Vycyk7XG4gICAgY29uc3Qgc2xvd1BlbmFsdHlDb3VudCA9IGdldFNsb3dQZW5hbHR5Q291bnQodGhpcy5hbnN3ZXJzKTtcbiAgICBjb25zdCBzdGF0c0Jsb2NrID0gbmV3IFN0YXRzQmxvY2tWaWV3KHRoaXMuYW5zd2Vycyk7XG4gICAgcmV0dXJuIGA8c2VjdGlvbiBjbGFzcz1cInJlc3VsdFwiPlxuICAgICAgPGgyIGNsYXNzPVwicmVzdWx0X190aXRsZSByZXN1bHRfX3RpdGxlLS1zaW5nbGVcIj4keyhpc0FsbCkgPyBzY29yZSArIGAg0L7Rh9C60L7Qsi4g0J3QtdC/0LvQvtGF0L4hYCA6IGDQn9C+0YDQsNC20LXQvdC40LUhYCB9PC9oMj5cbiAgICAgIDx0YWJsZSBjbGFzcz1cInJlc3VsdF9fdGFibGUgcmVzdWx0X190YWJsZS0tc2luZ2xlXCI+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGQgY29sc3Bhbj1cIjJcIj5cbiAgICAgICAgICAgICR7c3RhdHNCbG9jay50ZW1wbGF0ZX1cbiAgICAgICAgICA8L3RkPlxuICAgICAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fcG9pbnRzXCI+w5cgMTAwPC90ZD5cbiAgICAgICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX3RvdGFsXCI+JHsoaXNBbGwpID8gcmlnaHRBbnN3ZXJzQ291bnQgKiAxMDAgOiBgRmFpbGAgfTwvdGQ+XG4gICAgICAgIDwvdHI+XG4gICAgICAgICR7KHNwZWVkQm9udXNDb3VudCkgPyBTdGF0c1NpbmdsZVZpZXcuZ2V0U3BlZWRCb251c0NvbnRlbnQoc3BlZWRCb251c0NvdW50KSA6IGBgfVxuICAgICAgICAkeyh0aGlzLmxpdmVzKSA/IFN0YXRzU2luZ2xlVmlldy5nZXRMaXZlc0JvbnVzQ29udGVudCh0aGlzLmxpdmVzKSA6IGBgfVxuICAgICAgICAkeyhzbG93UGVuYWx0eUNvdW50KSA/IFN0YXRzU2luZ2xlVmlldy5nZXRTbG93UGVuYWx0eUNvbnRlbnQoc2xvd1BlbmFsdHlDb3VudCkgOiBgYH1cbiAgICAgIDwvdGFibGU+XG4gICAgPC9zZWN0aW9uPmA7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCNtYWluYCk7XG4gICAgY29uc3Qgb2xkRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYHNlY3Rpb24ucmVzdWx0YCk7XG4gICAgcGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChvbGRFbGVtZW50KTtcbiAgICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XG4gIH1cblxuICBzdGF0aWMgZ2V0U3BlZWRCb251c0NvbnRlbnQoc3BlZWRCb251c0NvdW50KSB7XG4gICAgcmV0dXJuIGA8dHI+XG4gICAgICA8dGQ+PC90ZD5cbiAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fZXh0cmFcIj7QkdC+0L3Rg9GBINC30LAg0YHQutC+0YDQvtGB0YLRjDo8L3RkPlxuICAgICAgPHRkIGNsYXNzPVwicmVzdWx0X19leHRyYVwiPiR7c3BlZWRCb251c0NvdW50fSA8c3BhbiBjbGFzcz1cInN0YXRzX19yZXN1bHQgc3RhdHNfX3Jlc3VsdC0tZmFzdFwiPjwvc3Bhbj48L3RkPlxuICAgICAgPHRkIGNsYXNzPVwicmVzdWx0X19wb2ludHNcIj7DlyA1MDwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX3RvdGFsXCI+JHtzcGVlZEJvbnVzQ291bnQgKiA1MH08L3RkPlxuICAgIDwvdHI+YDtcbiAgfVxuXG4gIHN0YXRpYyBnZXRMaXZlc0JvbnVzQ29udGVudChsaXZlcykge1xuICAgIHJldHVybiBgPHRyPlxuICAgICAgPHRkPjwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX2V4dHJhXCI+0JHQvtC90YPRgSDQt9CwINC20LjQt9C90Lg6PC90ZD5cbiAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fZXh0cmFcIj4ke2xpdmVzfSA8c3BhbiBjbGFzcz1cInN0YXRzX19yZXN1bHQgc3RhdHNfX3Jlc3VsdC0tYWxpdmVcIj48L3NwYW4+PC90ZD5cbiAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fcG9pbnRzXCI+w5cgNTA8L3RkPlxuICAgICAgPHRkIGNsYXNzPVwicmVzdWx0X190b3RhbFwiPiR7bGl2ZXMgKiA1MH08L3RkPlxuICAgIDwvdHI+YDtcbiAgfVxuXG4gIHN0YXRpYyBnZXRTbG93UGVuYWx0eUNvbnRlbnQoc2xvd1BlbmFsdHlDb3VudCkge1xuICAgIHJldHVybiBgPHRyPlxuICAgICAgPHRkPjwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX2V4dHJhXCI+0KjRgtGA0LDRhCDQt9CwINC80LXQtNC70LjRgtC10LvRjNC90L7RgdGC0Yw6PC90ZD5cbiAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fZXh0cmFcIj4ke3Nsb3dQZW5hbHR5Q291bnR9IDxzcGFuIGNsYXNzPVwic3RhdHNfX3Jlc3VsdCBzdGF0c19fcmVzdWx0LS1zbG93XCI+PC9zcGFuPjwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX3BvaW50c1wiPsOXIDUwPC90ZD5cbiAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fdG90YWxcIj4tJHtzbG93UGVuYWx0eUNvdW50ICogNTB9PC90ZD5cbiAgICA8L3RyPmA7XG4gIH1cblxufVxuIiwiaW1wb3J0IHtwb3N0RGF0YX0gZnJvbSAnLi4vYmFja2VuZC5qcyc7XG5pbXBvcnQgQWJzdHJhY3RTY3JlZW4gZnJvbSAnLi4vYWJzdHJhY3Qtc2NyZWVuLmpzJztcblxuaW1wb3J0IFN0YXRzU2NyZWVuVmlldyBmcm9tICcuL3N0YXRzLXNjcmVlbi12aWV3LmpzJztcbmltcG9ydCBTdGF0c1NpbmdsZVZpZXcgZnJvbSAnLi9zdGF0cy1zaW5nbGUtdmlldy5qcyc7XG5pbXBvcnQgQmFja0Fycm93VmlldyBmcm9tICcuLi91dGlsLXZpZXdzL2JhY2stYXJyb3ctdmlldy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YXRzU2NyZWVuIGV4dGVuZHMgQWJzdHJhY3RTY3JlZW4ge1xuXG4gIGNvbnN0cnVjdG9yKGdhbWVNb2RlbCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5nYW1lTW9kZWwgPSBnYW1lTW9kZWw7XG4gICAgdGhpcy52aWV3ID0gbmV3IFN0YXRzU2NyZWVuVmlldygpO1xuICB9XG5cbiAgX29uU2NyZWVuU2hvdygpIHtcbiAgICBjb25zdCBzdGF0c1NpbmdsZUJsb2NrID0gbmV3IFN0YXRzU2luZ2xlVmlldyh0aGlzLmdhbWVNb2RlbC5hbnN3ZXJzLCB0aGlzLmdhbWVNb2RlbC5saXZlcyk7XG4gICAgY29uc3QgYmFja0Fycm93ID0gbmV3IEJhY2tBcnJvd1ZpZXcoKTtcbiAgICBjb25zdCByZXN0YXJ0R2FtZSA9IHRoaXMuX3Jlc3RhcnRHYW1lLmJpbmQodGhpcyk7XG5cbiAgICBzdGF0c1NpbmdsZUJsb2NrLnJlbmRlcigpO1xuICAgIGJhY2tBcnJvdy5yZW5kZXIoKTtcblxuICAgIGJhY2tBcnJvdy5iaW5kKHJlc3RhcnRHYW1lKTtcblxuICAgIHBvc3REYXRhKHthbnN3ZXJzOiB0aGlzLmdhbWVNb2RlbC5hbnN3ZXJzLCBsaXZlczogdGhpcy5nYW1lTW9kZWwubGl2ZXN9KVxuICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yIGR1cmluZyBQT1NUIGdhbWVzIGRhdGEuLi5gKTtcbiAgICB9KTtcbiAgfVxufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFcnJvck1vZGFsVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gYDxzZWN0aW9uIGNsYXNzPVwibW9kYWxcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsX19pbm5lclwiPlxuICAgICAgICAgICAgICAgIDxoMiBjbGFzcz1cIm1vZGFsX190aXRsZVwiPtCf0YDQvtC40LfQvtGI0LvQsCDQvtGI0LjQsdC60LAhPC9oMj5cbiAgICAgICAgICAgICAgICA8cCBjbGFzcz1cIm1vZGFsX190ZXh0IG1vZGFsX190ZXh0LS1lcnJvclwiPtCh0YLQsNGC0YPRgTogNDA0LiDQn9C+0LbQsNC70YPQudGB0YLQsCwg0L/QtdGA0LXQt9Cw0LPRgNGD0LfQuNGC0LUg0YHRgtGA0LDQvdC40YbRgy48L3A+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9zZWN0aW9uPmA7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCNtYWluYCk7XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG59XG4iLCJpbXBvcnQgY29uZmlnIGZyb20gJy4vY29uZmlnLmpzJztcbmltcG9ydCB7Z2V0UmFuZG9tfSBmcm9tICcuL3V0aWxzLmpzJztcbmltcG9ydCB7bG9hZEdhbWVzfSBmcm9tICcuL2JhY2tlbmQuanMnO1xuXG5pbXBvcnQgR2FtZU1vZGVsIGZyb20gJy4vZ2FtZS1tb2RlbC9nYW1lLW1vZGVsLmpzJztcblxuaW1wb3J0IFdlbGNvbWVTY3JlZW4gZnJvbSAnLi93ZWxjb21lLXNjcmVlbi93ZWxjb21lLXNjcmVlbi5qcyc7XG5pbXBvcnQgR3JlZXRpbmdTY3JlZW4gZnJvbSAnLi9ncmVldGluZy1zY3JlZW4vZ3JlZXRpbmctc2NyZWVuLmpzJztcbmltcG9ydCBSdWxlc1NjcmVlbiBmcm9tICcuL3J1bGVzLXNjcmVlbi9ydWxlcy1zY3JlZW4uanMnO1xuaW1wb3J0IEdhbWVTY3JlZW4gZnJvbSAnLi9nYW1lLXNjcmVlbi9nYW1lLXNjcmVlbi5qcyc7XG5pbXBvcnQgU3RhdHNTY3JlZW4gZnJvbSAnLi9zdGF0cy1zY3JlZW4vc3RhdHMtc2NyZWVuLmpzJztcbmltcG9ydCBFcnJvck1vZGFsVmlldyBmcm9tICcuL3V0aWwtdmlld3MvZXJyb3ItbW9kYWwtdmlldy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFwcGxpY2F0aW9uIHtcblxuICBzdGF0aWMgaW5pdCgpIHtcbiAgICBjb25zdCBnYW1lTW9kZWwgPSBuZXcgR2FtZU1vZGVsKCk7XG4gICAgY29uc3Qgd2VsY29tZVNjcmVlbiA9IG5ldyBXZWxjb21lU2NyZWVuKCk7XG4gICAgY29uc3QgZ3JlZXRpbmdTY3JlZW4gPSBuZXcgR3JlZXRpbmdTY3JlZW4oKTtcbiAgICBjb25zdCBydWxlc1NjcmVlbiA9IG5ldyBSdWxlc1NjcmVlbihnYW1lTW9kZWwpO1xuICAgIGNvbnN0IHN0YXRzU2NyZWVuID0gbmV3IFN0YXRzU2NyZWVuKGdhbWVNb2RlbCk7XG5cbiAgICBjb25zdCBnYW1lU2NyZWVucyA9IFtdO1xuXG4gICAgbG9hZEdhbWVzKClcbiAgICAudGhlbigoZ2FtZXNBcnIpID0+IHtcbiAgICAgIGNvbnN0IGdhbWVzID0gZ2V0UmFuZG9tKGdhbWVzQXJyLCBjb25maWcuR0FNRVNfQ09VTlQpO1xuICAgICAgZ2FtZU1vZGVsLl9nYW1lcyA9IGdhbWVzO1xuICAgICAgZ2FtZXMuZm9yRWFjaCgoZ2FtZSwgaW5kZXgpID0+IHtcbiAgICAgICAgZ2FtZVNjcmVlbnMucHVzaChuZXcgR2FtZVNjcmVlbihnYW1lTW9kZWwsIGdhbWUsIGluZGV4KSk7XG4gICAgICB9KTtcbiAgICAgIGdhbWVTY3JlZW5zLmZvckVhY2goKGdhbWVTY3JlZW4sIGluZGV4KSA9PiB7XG4gICAgICAgIGdhbWVTY3JlZW4ubmV4dFNjcmVlbiA9IGdhbWVTY3JlZW5zW2luZGV4ICsgMV07XG4gICAgICAgIGdhbWVTY3JlZW4uc3RhcnRTY3JlZW4gPSB3ZWxjb21lU2NyZWVuO1xuICAgICAgICBnYW1lU2NyZWVuLmVuZFNjcmVlbiA9IHN0YXRzU2NyZWVuO1xuICAgICAgfSk7XG4gICAgICBnYW1lU2NyZWVuc1tnYW1lU2NyZWVucy5sZW5ndGggLSAxXS5uZXh0U2NyZWVuID0gc3RhdHNTY3JlZW47XG4gICAgfSlcbiAgICAuZmluYWxseSgoKSA9PiB7XG4gICAgICBncmVldGluZ1NjcmVlbi5uZXh0U2NyZWVuID0gcnVsZXNTY3JlZW47XG4gICAgICBydWxlc1NjcmVlbi5uZXh0U2NyZWVuID0gZ2FtZVNjcmVlbnNbMF07XG4gICAgICBydWxlc1NjcmVlbi5zdGFydFNjcmVlbiA9IHdlbGNvbWVTY3JlZW47XG4gICAgICBzdGF0c1NjcmVlbi5zdGFydFNjcmVlbiA9IHdlbGNvbWVTY3JlZW47XG4gICAgICBncmVldGluZ1NjcmVlbi5zaG93KCk7XG4gICAgfSlcbiAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgY29uc3QgZXJyb3JNb2RhbCA9IG5ldyBFcnJvck1vZGFsVmlldygpO1xuICAgICAgZXJyb3JNb2RhbC5yZW5kZXIoKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRXJyb3IgZHVyaW5nIEdFVCBnYW1lcyBkYXRhLi4uYCk7XG4gICAgfSk7XG5cbiAgICB3ZWxjb21lU2NyZWVuLm5leHRTY3JlZW4gPSBncmVldGluZ1NjcmVlbjtcbiAgICB3ZWxjb21lU2NyZWVuLnNob3coKTtcbiAgfVxufVxuIiwiaW1wb3J0IEFwcGxpY2F0aW9uIGZyb20gJy4vYXBwbGljYXRpb24uanMnO1xuXG5BcHBsaWNhdGlvbi5pbml0KCk7XG4iXSwibmFtZXMiOlsiSW50cm9TY3JlZW5WaWV3Il0sIm1hcHBpbmdzIjoiOzs7RUFBQSxNQUFNLE1BQU0sR0FBRztFQUNmLEVBQUUsWUFBWSxFQUFFLENBQUMsdUZBQXVGLENBQUM7RUFDekcsRUFBRSxhQUFhLEVBQUUsQ0FBQyw0QkFBNEIsQ0FBQztFQUMvQyxFQUFFLFdBQVcsRUFBRSxFQUFFO0VBQ2pCLEVBQUUsV0FBVyxFQUFFLENBQUM7RUFDaEIsRUFBRSxjQUFjLEVBQUUsS0FBSztFQUN2QixFQUFFLFNBQVMsRUFBRSxDQUFDLE9BQU8sQ0FBQztFQUN0QixFQUFFLFVBQVUsRUFBRTtFQUNkLElBQUksUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDO0VBQ3hCLElBQUksS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDO0VBQ2xCLEdBQUc7RUFDSCxFQUFFLFlBQVksRUFBRTtFQUNoQixJQUFJLFVBQVUsRUFBRSxDQUFDLFVBQVUsQ0FBQztFQUM1QixJQUFJLFdBQVcsRUFBRSxDQUFDLFdBQVcsQ0FBQztFQUM5QixJQUFJLFlBQVksRUFBRSxDQUFDLFlBQVksQ0FBQztFQUNoQyxHQUFHO0VBQ0gsRUFBRSx1QkFBdUIsRUFBRTtF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
