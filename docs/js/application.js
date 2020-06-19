var application = (function () {
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

  class GameModel {
    constructor() {
      this._playerName = ``;
      this._lives = config.LIVES_COUNT;
      this._answers = [];
      this._games = GameModel.getNewGames();
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

    static getNewGames() {
      const games = [];

      for (let i = 0; i < config.GAMES_COUNT; i++) {
        const gameType = GameModel.getRandomGameType();
        switch (gameType) {
          case config.GAME_TYPE.one:
            games.push(GameModel.getGameType1(i));
            break;
          case config.GAME_TYPE.two:
            games.push(GameModel.getGameType2(i));
            break;
          case config.GAME_TYPE.three:
            games.push(GameModel.getGameType3(i));
            break;
        }
      }

      return games;
    }

    static getRandomGameType() {
      return Math.round(Math.random() * (config.GAME_TYPE.three - config.GAME_TYPE.one) + config.GAME_TYPE.one);
    }

    static getGameType1(index) {
      // 1 изображение
      // в этом режиме пользователь должен определить картина это или фотография
      return {
        gameIndex: index,
        gameType: config.GAME_TYPE.one,
        frameSize: {width: 705, height: 455},
        task: `Угадай, фото или рисунок?`,
        questions:
        [
          {
            img:
            [
              {
                src: `https://k42.kn3.net/D2F0370D6.jpg`,
                size: {width: 468, height: 354}
              }
            ],
            correctAnswer: `paint`
          }
        ]
      };
    }

    static getGameType2(index) {
      // 2 изображения
      // для каждого из изображений пользователь должен указать картина это или фотография
      return {
        gameIndex: index,
        gameType: config.GAME_TYPE.two,
        frameSize: {width: 468, height: 458},
        task: `Угадайте для каждого изображения фото или рисунок?`,
        questions:
        [
          {
            img:
            [
              {
                src: `https://k42.kn3.net/CF42609C8.jpg`,
                size: {width: 600, height: 831}
              }
            ],
            correctAnswer: `paint`
          },
          {
            img:
            [
              {
                src: `http://i.imgur.com/1KegWPz.jpg`,
                size: {width: 1080, height: 720}
              }
            ],
            correctAnswer: `photo`
          }
        ]
      };
    }

    static getGameType3(index) {
      // 3 изображения
      // пользователю нужно выбрать одно — либо нужно выбрать единственную фотографию, либо единственную картину
      return {
        gameIndex: index,
        gameType: config.GAME_TYPE.three,
        frameSize: {width: 304, height: 455},
        task: `Найдите рисунок среди изображений`,
        questions: [
          {
            img:
            [
              {
                src: `https://k32.kn3.net/5C7060EC5.jpg`,
                size: {width: 1200, height: 900}
              },
              {
                src: `https://i.imgur.com/DiHM5Zb.jpg`,
                size: {width: 1264, height: 1864}
              },
              {
                src: `http://i.imgur.com/DKR1HtB.jpg`,
                size: {width: 1120, height: 2965}
              }
            ],
            correctAnswer: 0
          }
        ]
      };
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
    }
  }

  const gameModel = new GameModel();
  const welcomeScreen = new WelcomeScreen();
  const greetingScreen = new GreetingScreen();
  const rulesScreen = new RulesScreen(gameModel);
  const statsScreen = new StatsScreen(gameModel);
  const gameScreens = [];
  gameModel.games.forEach((game) => {
    gameScreens.push(new GameScreen(gameModel, game));
  });

  class Application {

    static init() {
      welcomeScreen.nextScreen = greetingScreen;
      greetingScreen.nextScreen = rulesScreen;
      rulesScreen.nextScreen = gameScreens[0];
      rulesScreen.startScreen = welcomeScreen;

      gameScreens.forEach((gameScreen, index) => {
        gameScreen.nextScreen = gameScreens[index + 1];
        gameScreen.startScreen = welcomeScreen;
        gameScreen.endScreen = statsScreen;
      });

      gameScreens[gameScreens.length - 1].nextScreen = statsScreen;
      statsScreen.startScreen = welcomeScreen;
    }

    static start() {
      welcomeScreen.show();
    }
  }

  return Application;

}());

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGljYXRpb24uanMiLCJzb3VyY2VzIjpbImpzL2NvbmZpZy5qcyIsImpzL2dhbWUtbW9kZWwvZ2FtZS1tb2RlbC5qcyIsImpzL2Fic3RyYWN0LXZpZXcuanMiLCJqcy91dGlsLXZpZXdzL2NvbmZpcm0tbW9kYWwtdmlldy5qcyIsImpzL2Fic3RyYWN0LXNjcmVlbi5qcyIsImpzL3dlbGNvbWUtc2NyZWVuL3dlbGNvbWUtc2NyZWVuLXZpZXcuanMiLCJqcy93ZWxjb21lLXNjcmVlbi9hc3Rlcmlzay12aWV3LmpzIiwianMvd2VsY29tZS1zY3JlZW4vd2VsY29tZS1zY3JlZW4uanMiLCJqcy9ncmVldGluZy1zY3JlZW4vZ3JlZXRpbmctc2NyZWVuLXZpZXcuanMiLCJqcy9ncmVldGluZy1zY3JlZW4vc3RhcnQtYXJyb3ctdmlldy5qcyIsImpzL2dyZWV0aW5nLXNjcmVlbi9ncmVldGluZy1zY3JlZW4uanMiLCJqcy9ydWxlcy1zY3JlZW4vcnVsZXMtc2NyZWVuLXZpZXcuanMiLCJqcy9ydWxlcy1zY3JlZW4vbmFtZS1pbnB1dC12aWV3LmpzIiwianMvcnVsZXMtc2NyZWVuL3N0YXJ0LWJ1dHRvbi12aWV3LmpzIiwianMvdXRpbC12aWV3cy9iYWNrLWFycm93LXZpZXcuanMiLCJqcy9ydWxlcy1zY3JlZW4vcnVsZXMtc2NyZWVuLmpzIiwianMvZ2FtZS1zY3JlZW4vZ2FtZS1zY3JlZW4tdmlldy5qcyIsImpzL2dhbWUtc2NyZWVuL3RpbWVyLWJsb2NrLXZpZXcuanMiLCJqcy9nYW1lLXNjcmVlbi9saXZlcy1ibG9jay12aWV3LmpzIiwianMvdXRpbC12aWV3cy9zdGF0cy1ibG9jay12aWV3LmpzIiwianMvZGVidWcuanMiLCJqcy9nYW1lLXNjcmVlbi9hbnN3ZXItcGhvdG8tYnV0dG9uLXZpZXcuanMiLCJqcy9nYW1lLXNjcmVlbi9hbnN3ZXItcGFpbnQtYnV0dG9uLXZpZXcuanMiLCJqcy9nYW1lLXNjcmVlbi9hbnN3ZXItcGFpbnQtb3B0aW9uLXZpZXcuanMiLCJqcy9yZXNpemUuanMiLCJqcy9nYW1lLXNjcmVlbi9pbWFnZS12aWV3LmpzIiwianMvZ2FtZS1zY3JlZW4vZ2FtZS1zY3JlZW4uanMiLCJqcy9zdGF0cy1zY3JlZW4vc3RhdHMtc2NyZWVuLXZpZXcuanMiLCJqcy9zY29yZS5qcyIsImpzL3N0YXRzLXNjcmVlbi9zdGF0cy1zaW5nbGUtdmlldy5qcyIsImpzL3N0YXRzLXNjcmVlbi9zdGF0cy1zY3JlZW4uanMiLCJqcy9hcHBsaWNhdGlvbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBjb25maWcgPSB7XG4gIEdBTUVTX0NPVU5UOiAxMCxcbiAgTElWRVNfQ09VTlQ6IDMsXG4gIFRJTUVfVE9fQU5TV0VSOiAzMDAwMCwgLy8gMzAgc2VjXG4gIEdBTUVfVFlQRToge1xuICAgIG9uZTogMSxcbiAgICB0d286IDIsXG4gICAgdGhyZWU6IDNcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY29uZmlnO1xuIiwiaW1wb3J0IGNvbmZpZyBmcm9tICcuLi9jb25maWcuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHYW1lTW9kZWwge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9wbGF5ZXJOYW1lID0gYGA7XG4gICAgdGhpcy5fbGl2ZXMgPSBjb25maWcuTElWRVNfQ09VTlQ7XG4gICAgdGhpcy5fYW5zd2VycyA9IFtdO1xuICAgIHRoaXMuX2dhbWVzID0gR2FtZU1vZGVsLmdldE5ld0dhbWVzKCk7XG4gICAgdGhpcy5faXNHYW1lT3ZlciA9IGZhbHNlO1xuICB9XG5cbiAgc2V0IHBsYXllck5hbWUobmFtZSkge1xuICAgIHRoaXMuX3BsYXllck5hbWUgPSBuYW1lO1xuICB9XG5cbiAgZ2V0IGxpdmVzKCkge1xuICAgIHJldHVybiB0aGlzLl9saXZlcztcbiAgfVxuXG4gIGdldCBhbnN3ZXJzKCkge1xuICAgIHJldHVybiB0aGlzLl9hbnN3ZXJzO1xuICB9XG5cbiAgZ2V0IGdhbWVzKCkge1xuICAgIHJldHVybiB0aGlzLl9nYW1lcztcbiAgfVxuXG4gIGdldCBpc0dhbWVPdmVyKCkge1xuICAgIHJldHVybiB0aGlzLl9pc0dhbWVPdmVyO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5fbGl2ZXMgPSBjb25maWcuTElWRVNfQ09VTlQ7XG4gICAgdGhpcy5fYW5zd2VycyA9IFtdO1xuICAgIHRoaXMuX2lzR2FtZU92ZXIgPSBmYWxzZTtcbiAgfVxuXG4gIGFkZEFuc3dlcihhbnN3ZXIpIHtcbiAgICB0aGlzLl9hbnN3ZXJzLnB1c2goYW5zd2VyKTtcbiAgfVxuXG4gIG1pbnVzTGl2ZSgpIHtcbiAgICBpZiAodGhpcy5fbGl2ZXMgPT09IDApIHtcbiAgICAgIHRoaXMuX2lzR2FtZU92ZXIgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAodGhpcy5fbGl2ZXMpIHtcbiAgICAgIHRoaXMuX2xpdmVzLS07XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGdldE5ld0dhbWVzKCkge1xuICAgIGNvbnN0IGdhbWVzID0gW107XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbmZpZy5HQU1FU19DT1VOVDsgaSsrKSB7XG4gICAgICBjb25zdCBnYW1lVHlwZSA9IEdhbWVNb2RlbC5nZXRSYW5kb21HYW1lVHlwZSgpO1xuICAgICAgc3dpdGNoIChnYW1lVHlwZSkge1xuICAgICAgICBjYXNlIGNvbmZpZy5HQU1FX1RZUEUub25lOlxuICAgICAgICAgIGdhbWVzLnB1c2goR2FtZU1vZGVsLmdldEdhbWVUeXBlMShpKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgY29uZmlnLkdBTUVfVFlQRS50d286XG4gICAgICAgICAgZ2FtZXMucHVzaChHYW1lTW9kZWwuZ2V0R2FtZVR5cGUyKGkpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBjb25maWcuR0FNRV9UWVBFLnRocmVlOlxuICAgICAgICAgIGdhbWVzLnB1c2goR2FtZU1vZGVsLmdldEdhbWVUeXBlMyhpKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGdhbWVzO1xuICB9XG5cbiAgc3RhdGljIGdldFJhbmRvbUdhbWVUeXBlKCkge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAoY29uZmlnLkdBTUVfVFlQRS50aHJlZSAtIGNvbmZpZy5HQU1FX1RZUEUub25lKSArIGNvbmZpZy5HQU1FX1RZUEUub25lKTtcbiAgfVxuXG4gIHN0YXRpYyBnZXRHYW1lVHlwZTEoaW5kZXgpIHtcbiAgICAvLyAxINC40LfQvtCx0YDQsNC20LXQvdC40LVcbiAgICAvLyDQsiDRjdGC0L7QvCDRgNC10LbQuNC80LUg0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GMINC00L7Qu9C20LXQvSDQvtC/0YDQtdC00LXQu9C40YLRjCDQutCw0YDRgtC40L3QsCDRjdGC0L4g0LjQu9C4INGE0L7RgtC+0LPRgNCw0YTQuNGPXG4gICAgcmV0dXJuIHtcbiAgICAgIGdhbWVJbmRleDogaW5kZXgsXG4gICAgICBnYW1lVHlwZTogY29uZmlnLkdBTUVfVFlQRS5vbmUsXG4gICAgICBmcmFtZVNpemU6IHt3aWR0aDogNzA1LCBoZWlnaHQ6IDQ1NX0sXG4gICAgICB0YXNrOiBg0KPQs9Cw0LTQsNC5LCDRhNC+0YLQviDQuNC70Lgg0YDQuNGB0YPQvdC+0Lo/YCxcbiAgICAgIHF1ZXN0aW9uczpcbiAgICAgIFtcbiAgICAgICAge1xuICAgICAgICAgIGltZzpcbiAgICAgICAgICBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHNyYzogYGh0dHBzOi8vazQyLmtuMy5uZXQvRDJGMDM3MEQ2LmpwZ2AsXG4gICAgICAgICAgICAgIHNpemU6IHt3aWR0aDogNDY4LCBoZWlnaHQ6IDM1NH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdLFxuICAgICAgICAgIGNvcnJlY3RBbnN3ZXI6IGBwYWludGBcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgZ2V0R2FtZVR5cGUyKGluZGV4KSB7XG4gICAgLy8gMiDQuNC30L7QsdGA0LDQttC10L3QuNGPXG4gICAgLy8g0LTQu9GPINC60LDQttC00L7Qs9C+INC40Lcg0LjQt9C+0LHRgNCw0LbQtdC90LjQuSDQv9C+0LvRjNC30L7QstCw0YLQtdC70Ywg0LTQvtC70LbQtdC9INGD0LrQsNC30LDRgtGMINC60LDRgNGC0LjQvdCwINGN0YLQviDQuNC70Lgg0YTQvtGC0L7Qs9GA0LDRhNC40Y9cbiAgICByZXR1cm4ge1xuICAgICAgZ2FtZUluZGV4OiBpbmRleCxcbiAgICAgIGdhbWVUeXBlOiBjb25maWcuR0FNRV9UWVBFLnR3byxcbiAgICAgIGZyYW1lU2l6ZToge3dpZHRoOiA0NjgsIGhlaWdodDogNDU4fSxcbiAgICAgIHRhc2s6IGDQo9Cz0LDQtNCw0LnRgtC1INC00LvRjyDQutCw0LbQtNC+0LPQviDQuNC30L7QsdGA0LDQttC10L3QuNGPINGE0L7RgtC+INC40LvQuCDRgNC40YHRg9C90L7Quj9gLFxuICAgICAgcXVlc3Rpb25zOlxuICAgICAgW1xuICAgICAgICB7XG4gICAgICAgICAgaW1nOlxuICAgICAgICAgIFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgc3JjOiBgaHR0cHM6Ly9rNDIua24zLm5ldC9DRjQyNjA5QzguanBnYCxcbiAgICAgICAgICAgICAgc2l6ZToge3dpZHRoOiA2MDAsIGhlaWdodDogODMxfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIF0sXG4gICAgICAgICAgY29ycmVjdEFuc3dlcjogYHBhaW50YFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgaW1nOlxuICAgICAgICAgIFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgc3JjOiBgaHR0cDovL2kuaW1ndXIuY29tLzFLZWdXUHouanBnYCxcbiAgICAgICAgICAgICAgc2l6ZToge3dpZHRoOiAxMDgwLCBoZWlnaHQ6IDcyMH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdLFxuICAgICAgICAgIGNvcnJlY3RBbnN3ZXI6IGBwaG90b2BcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgZ2V0R2FtZVR5cGUzKGluZGV4KSB7XG4gICAgLy8gMyDQuNC30L7QsdGA0LDQttC10L3QuNGPXG4gICAgLy8g0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GOINC90YPQttC90L4g0LLRi9Cx0YDQsNGC0Ywg0L7QtNC90L4g4oCUINC70LjQsdC+INC90YPQttC90L4g0LLRi9Cx0YDQsNGC0Ywg0LXQtNC40L3RgdGC0LLQtdC90L3Rg9GOINGE0L7RgtC+0LPRgNCw0YTQuNGOLCDQu9C40LHQviDQtdC00LjQvdGB0YLQstC10L3QvdGD0Y4g0LrQsNGA0YLQuNC90YNcbiAgICByZXR1cm4ge1xuICAgICAgZ2FtZUluZGV4OiBpbmRleCxcbiAgICAgIGdhbWVUeXBlOiBjb25maWcuR0FNRV9UWVBFLnRocmVlLFxuICAgICAgZnJhbWVTaXplOiB7d2lkdGg6IDMwNCwgaGVpZ2h0OiA0NTV9LFxuICAgICAgdGFzazogYNCd0LDQudC00LjRgtC1INGA0LjRgdGD0L3QvtC6INGB0YDQtdC00Lgg0LjQt9C+0LHRgNCw0LbQtdC90LjQuWAsXG4gICAgICBxdWVzdGlvbnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGltZzpcbiAgICAgICAgICBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHNyYzogYGh0dHBzOi8vazMyLmtuMy5uZXQvNUM3MDYwRUM1LmpwZ2AsXG4gICAgICAgICAgICAgIHNpemU6IHt3aWR0aDogMTIwMCwgaGVpZ2h0OiA5MDB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBzcmM6IGBodHRwczovL2kuaW1ndXIuY29tL0RpSE01WmIuanBnYCxcbiAgICAgICAgICAgICAgc2l6ZToge3dpZHRoOiAxMjY0LCBoZWlnaHQ6IDE4NjR9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBzcmM6IGBodHRwOi8vaS5pbWd1ci5jb20vREtSMUh0Qi5qcGdgLFxuICAgICAgICAgICAgICBzaXplOiB7d2lkdGg6IDExMjAsIGhlaWdodDogMjk2NX1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdLFxuICAgICAgICAgIGNvcnJlY3RBbnN3ZXI6IDBcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH07XG4gIH1cbn1cbiIsImNvbnN0IGVsZW1lbnRzID0ge307XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIC8vINCy0L7Qt9Cy0YDQsNGJ0LDQtdGCINGB0YLRgNC+0LrRgywg0YHQvtC00LXRgNC20LDRidGD0Y4g0YDQsNC30LzQtdGC0LrRg1xuICBnZXQgdGVtcGxhdGUoKSB7fVxuXG4gIC8vINGB0L7Qt9C00LDQtdGCINC4INCy0L7Qt9Cy0YDQsNGJ0LDQtdGCIERPTS3RjdC70LXQvNC10L3RgiDQvdCwINC+0YHQvdC+0LLQtSDRiNCw0LHQu9C+0L3QsFxuICAvLyDQtNC+0LvQttC10L0g0YHQvtC30LTQsNCy0LDRgtGMIERPTS3RjdC70LXQvNC10L3RgiDRgSDQv9C+0LzQvtGJ0YzRjiDQvNC10YLQvtC00LAgcmVuZGVyLCDQtNC+0LHQsNCy0LvRj9GC0Ywg0LXQvNGDINC+0LHRgNCw0LHQvtGC0YfQuNC60LgsINGBINC/0L7QvNC+0YnRjNGOINC80LXRgtC+0LTQsCBiaW5kINC4INCy0L7Qt9Cy0YDQsNGJ0LDRgtGMINGB0L7Qt9C00LDQvdC90YvQuSDRjdC70LXQvNC10L3RglxuICAvLyDQnNC10YLQvtC0INC00L7Qu9C20LXQvSDQuNGB0L/QvtC70YzQt9C+0LLQsNGC0Ywg0LvQtdC90LjQstGL0LUg0LLRi9GH0LjRgdC70LXQvdC40Y8g4oCUINGN0LvQtdC80LXQvdGCINC00L7Qu9C20LXQvSDRgdC+0LfQtNCw0LLQsNGC0YzRgdGPINC/0YDQuCDQv9C10YDQstC+0Lwg0L7QsdGA0LDRidC10L3QuNC4INC6INCz0LXRgtGC0LXRgCDRgSDQv9C+0LzQvtGJ0YzRjiDQvNC10YLQvtC00LAgcmVuZGVyLCDQtNC+0LvQttC90Ysg0LTQvtCx0LDQstC70Y/RgtGM0YHRjyDQvtCx0YDQsNCx0L7RgtGH0LjQutC4ICjQvNC10YLQvtC0IGJpbmQpLlxuICAvLyDQn9GA0Lgg0L/QvtGB0LvQtdC00YPRjtGJ0LjRhSDQvtCx0YDQsNGJ0LXQvdC40Y/RhSDQtNC+0LvQttC10L0g0LjRgdC/0L7Qu9GM0LfQvtCy0LDRgtGM0YHRjyDRjdC70LXQvNC10L3Rgiwg0YHQvtC30LTQsNC90L3Ri9C5INC/0YDQuCDQv9C10YDQstC+0Lwg0LLRi9C30L7QstC1INCz0LXRgtGC0LXRgNCwLlxuICBnZXQgZWxlbWVudCgpIHtcbiAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMudGVtcGxhdGU7XG4gICAgLy8gaWYgKCFlbGVtZW50cy5oYXNPd25Qcm9wZXJ0eSh0ZW1wbGF0ZSkpIHtcbiAgICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoYGRpdmApO1xuICAgICAgZGl2LmlubmVySFRNTCA9IHRlbXBsYXRlO1xuICAgICAgY29uc3QgZWxlbSA9IGRpdi5maXJzdENoaWxkO1xuICAgICAgZWxlbWVudHNbdGVtcGxhdGVdID0gZWxlbTtcbiAgICAgIHJldHVybiBlbGVtO1xuICAgIC8vIH0gZWxzZSB7XG4gICAgICAvLyByZXR1cm4gZWxlbWVudHNbdGVtcGxhdGVdO1xuICAgIC8vIH1cbiAgfVxuXG4gIC8vINC+0YLRgNC40YHQvtCy0YvQstCw0LXRgiBET00t0Y3Qu9C10LzQtdC90YIsINC00L7QsdCw0LLQu9GP0LXRgiDQvdC10L7QsdGF0L7QtNC40LzRi9C1INC+0LHRgNCw0LHQvtGC0YfQuNC60LhcbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBtYWluLmNlbnRyYWxgKTtcbiAgICBjb25zdCBvbGRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI21haW5gKTtcbiAgICBwYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKG9sZEVsZW1lbnQpO1xuICAgIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIC8vINC00L7QsdCw0LLQu9GP0LXRgiDQvtCx0YDQsNCx0L7RgtGH0LjQutC4INGB0L7QsdGL0YLQuNC5XG4gIC8vINCc0LXRgtC+0LQg0L/QviDRg9C80L7Qu9GH0LDQvdC40Y4g0L3QuNGH0LXQs9C+INC90LUg0LTQtdC70LDQtdGCXG4gIC8vINCV0YHQu9C4INC90YPQttC90L4g0L7QsdGA0LDQsdC+0YLQsNGC0Ywg0LrQsNC60L7QtS3RgtC+INGB0L7QsdGL0YLQuNC1LCDRgtC+INGN0YLQvtGCINC80LXRgtC+0LQg0LTQvtC70LbQtdC9INCx0YvRgtGMINC/0LXRgNC10L7Qv9GA0LXQtNC10LvRkdC9INCyINC90LDRgdC70LXQtNC90LjQutC1INGBINC90LXQvtCx0YXQvtC00LjQvNC+0Lkg0LvQvtCz0LjQutC+0LlcbiAgYmluZCgpIHt9XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbmZpcm1Nb2RhbFZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuIGA8c2VjdGlvbiBjbGFzcz1cIm1vZGFsXCI+XG4gICAgICAgICAgICAgIDxmb3JtIGNsYXNzPVwibW9kYWxfX2lubmVyXCI+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cIm1vZGFsX19jbG9zZVwiIHR5cGU9XCJidXR0b25cIj5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidmlzdWFsbHktaGlkZGVuXCI+0JfQsNC60YDRi9GC0Yw8L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPGgyIGNsYXNzPVwibW9kYWxfX3RpdGxlXCI+0J/QvtC00YLQstC10YDQttC00LXQvdC40LU8L2gyPlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwibW9kYWxfX3RleHRcIj7QktGLINGD0LLQtdGA0LXQvdGLINGH0YLQviDRhdC+0YLQuNGC0LUg0L3QsNGH0LDRgtGMINC40LPRgNGDINC30LDQvdC+0LLQvj88L3A+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsX19idXR0b24td3JhcHBlclwiPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cIm1vZGFsX19idG4gbW9kYWxfX2J0bi0tb2tcIj7QntC6PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwibW9kYWxfX2J0biBtb2RhbF9fYnRuLS1jYW5jZWxcIj7QntGC0LzQtdC90LA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgPC9zZWN0aW9uPmA7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCNtYWluYCk7XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgYmluZChjYikge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjbWFpbmApO1xuICAgIGNvbnN0IG1vZGFsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLm1vZGFsYCk7XG4gICAgY29uc3QgY2xvc2VCdG4gPSBtb2RhbC5xdWVyeVNlbGVjdG9yKGAubW9kYWxfX2Nsb3NlYCk7XG4gICAgY29uc3QgY2FuY2VsQnRuID0gbW9kYWwucXVlcnlTZWxlY3RvcihgLm1vZGFsX19idG4tLWNhbmNlbGApO1xuICAgIGNvbnN0IG9rQnRuID0gbW9kYWwucXVlcnlTZWxlY3RvcihgLm1vZGFsX19idG4tLW9rYCk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihga2V5ZG93bmAsIChldnQpID0+IHtcbiAgICAgIGlmIChldnQua2V5Q29kZSA9PT0gMjcpIHtcbiAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQobW9kYWwpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGNsb3NlQnRuLmFkZEV2ZW50TGlzdGVuZXIoYGNsaWNrYCwgKGV2dCkgPT4ge1xuICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBwYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKG1vZGFsKTtcbiAgICB9KTtcbiAgICBjYW5jZWxCdG4uYWRkRXZlbnRMaXN0ZW5lcihgY2xpY2tgLCAoZXZ0KSA9PiB7XG4gICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQobW9kYWwpO1xuICAgIH0pO1xuICAgIG9rQnRuLmFkZEV2ZW50TGlzdGVuZXIoYGNsaWNrYCwgKGV2dCkgPT4ge1xuICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBjYigpO1xuICAgIH0pO1xuICB9XG59XG4iLCJpbXBvcnQgQ29uZmlybU1vZGFsVmlldyBmcm9tICcuL3V0aWwtdmlld3MvY29uZmlybS1tb2RhbC12aWV3LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWJzdHJhY3RTY3JlZW4ge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZ2FtZU1vZGVsID0gbnVsbDtcbiAgICB0aGlzLmdhbWUgPSBudWxsO1xuICAgIHRoaXMudmlldyA9IG51bGw7XG4gICAgdGhpcy50aW1lciA9IG51bGw7XG4gICAgdGhpcy5zdGFydFNjcmVlbiA9IG51bGw7XG4gICAgdGhpcy5uZXh0U2NyZWVuID0gbnVsbDtcbiAgICB0aGlzLmVuZFNjcmVlbiA9IG51bGw7XG4gIH1cblxuICAvLyDQvNC10YLQvtC0INC/0L7QutCw0LfQsCDRjdC60YDQsNC90LAg0L7RgtGA0LjRgdC+0LLRi9Cy0LDQtdGCINGN0LrRgNCw0L0g0Lgg0LfQsNC/0YPRgdC60LDQtdGCINC80LXRgtC+0LQgX29uU2NyZWVuU2hvd1xuICBzaG93KCkge1xuICAgIHRoaXMudmlldy5yZW5kZXIoKTtcbiAgICB0aGlzLl9vblNjcmVlblNob3coKTtcbiAgfVxuXG4gIC8vINC80LXRgtC+0LQg0YDQtdCw0LvQuNC30YPQtdGCINCx0LjQt9C90LXRgSDQu9C+0LPQuNC60YMg0Y3QutGA0LDQvdCwXG4gIF9vblNjcmVlblNob3coKSB7fVxuXG4gIC8vINC80LXRgtC+0LQg0L/QtdGA0LXQt9Cw0L/Rg9GB0LrQsNC10YIg0LjQs9GA0YNcbiAgX3Jlc3RhcnRHYW1lKCkge1xuICAgIGNvbnN0IGNvbmZpcm1Nb2RhbCA9IG5ldyBDb25maXJtTW9kYWxWaWV3KCk7XG4gICAgY29uZmlybU1vZGFsLnJlbmRlcigpO1xuICAgIGNvbmZpcm1Nb2RhbC5iaW5kKCgpID0+IHtcbiAgICAgIHRoaXMuZ2FtZU1vZGVsLnJlc2V0KCk7XG4gICAgICB0aGlzLnN0YXJ0U2NyZWVuLnNob3coKTtcbiAgICB9KTtcbiAgfVxufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXZWxjb21lU2NyZWVuVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gYDxkaXYgaWQ9XCJtYWluXCIgY2xhc3M9XCJjZW50cmFsX19jb250ZW50XCI+XG4gICAgICAgICAgICAgIDxzZWN0aW9uIGlkPVwiaW50cm9cIiBjbGFzcz1cImludHJvXCI+XG4gICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBUTyBBU1RFUklTSyAtLT5cbiAgICAgICAgICAgICAgICA8cCBjbGFzcz1cImludHJvX19tb3R0b1wiPjxzdXA+Kjwvc3VwPiDQrdGC0L4g0L3QtSDRhNC+0YLQvi4g0K3RgtC+INGA0LjRgdGD0L3QvtC6INC80LDRgdC70L7QvCDQvdC40LTQtdGA0LvQsNC90LTRgdC60L7Qs9C+INGF0YPQtNC+0LbQvdC40LrQsC3RhNC+0YLQvtGA0LXQsNC70LjRgdGC0LAgVGphbGYgU3Bhcm5hYXkuPC9wPlxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJpbnRyb19fdG9wIHRvcFwiIHR5cGU9XCJidXR0b25cIj5cbiAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPVwiaW1nL2ljb24tdG9wLnN2Z1wiIHdpZHRoPVwiNzFcIiBoZWlnaHQ9XCI3OVwiIGFsdD1cItCi0L7QvyDQuNCz0YDQvtC60L7QslwiPlxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgICAgICA8L2Rpdj5gO1xuICB9XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFzdGVyaXNrVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gYDxidXR0b24gY2xhc3M9XCJpbnRyb19fYXN0ZXJpc2sgYXN0ZXJpc2tcIiB0eXBlPVwiYnV0dG9uXCI+PHNwYW4gY2xhc3M9XCJ2aXN1YWxseS1oaWRkZW5cIj7Qn9GA0L7QtNC+0LvQttC40YLRjDwvc3Bhbj4qPC9idXR0b24+YDtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ludHJvJyk7XG4gICAgcGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUodGhpcy5lbGVtZW50LCBwYXJlbnRFbGVtZW50LmZpcnN0Q2hpbGQpO1xuICB9XG5cbiAgYmluZChjYikge1xuICAgIGNvbnN0IGFzdGVyaXNrID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmludHJvX19hc3Rlcmlza2ApO1xuICAgIGFzdGVyaXNrLmFkZEV2ZW50TGlzdGVuZXIoYGNsaWNrYCwgY2IpO1xuICB9XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RTY3JlZW4gZnJvbSAnLi4vYWJzdHJhY3Qtc2NyZWVuLmpzJztcblxuaW1wb3J0IEludHJvU2NyZWVuVmlldyBmcm9tICcuL3dlbGNvbWUtc2NyZWVuLXZpZXcuanMnO1xuaW1wb3J0IEFzdGVyaXNrVmlldyBmcm9tICcuL2FzdGVyaXNrLXZpZXcuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXZWxjb21lU2NyZWVuIGV4dGVuZHMgQWJzdHJhY3RTY3JlZW4ge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy52aWV3ID0gbmV3IEludHJvU2NyZWVuVmlldygpO1xuICB9XG5cbiAgX29uU2NyZWVuU2hvdygpIHtcbiAgICBjb25zdCBhc3RlcmlzayA9IG5ldyBBc3Rlcmlza1ZpZXcoKTtcbiAgICBhc3Rlcmlzay5yZW5kZXIoKTtcbiAgICBhc3Rlcmlzay5iaW5kKHRoaXMubmV4dFNjcmVlbi5zaG93LmJpbmQodGhpcy5uZXh0U2NyZWVuKSk7XG4gIH1cbn1cbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR3JlZXRpbmdTY3JlZW5WaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPGRpdiBpZD1cIm1haW5cIiBjbGFzcz1cImNlbnRyYWxfX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgPHNlY3Rpb24gY2xhc3M9XCJncmVldGluZyBjZW50cmFsLS1ibHVyXCI+XG4gICAgICAgICAgICAgICAgPGltZyBjbGFzcz1cImdyZWV0aW5nX19sb2dvXCIgc3JjPVwiaW1nL2xvZ29fcGgtYmlnLnN2Z1wiIHdpZHRoPVwiMjAxXCIgaGVpZ2h0PVwiODlcIiBhbHQ9XCJQaXhlbCBIdW50ZXJcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JlZXRpbmdfX2FzdGVyaXNrIGFzdGVyaXNrXCI+PHNwYW4gY2xhc3M9XCJ2aXN1YWxseS1oaWRkZW5cIj7QryDQv9GA0L7RgdGC0L4g0LrRgNCw0YHQuNCy0LDRjyDQt9Cy0ZHQt9C00L7Rh9C60LA8L3NwYW4+KjwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJncmVldGluZ19fY2hhbGxlbmdlXCI+XG4gICAgICAgICAgICAgICAgICA8aDMgY2xhc3M9XCJncmVldGluZ19fY2hhbGxlbmdlLXRpdGxlXCI+0JvRg9GH0YjQuNC1INGF0YPQtNC+0LbQvdC40LrQuC3RhNC+0YLQvtGA0LXQsNC70LjRgdGC0Ysg0LHRgNC+0YHQsNGO0YIg0YLQtdCx0LUg0LLRi9C30L7QsiE8L2gzPlxuICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJncmVldGluZ19fY2hhbGxlbmdlLXRleHRcIj7Qn9GA0LDQstC40LvQsCDQuNCz0YDRiyDQv9GA0L7RgdGC0Ys6PC9wPlxuICAgICAgICAgICAgICAgICAgPHVsIGNsYXNzPVwiZ3JlZXRpbmdfX2NoYWxsZW5nZS1saXN0XCI+XG4gICAgICAgICAgICAgICAgICAgIDxsaT7QndGD0LbQvdC+INC+0YLQu9C40YfQuNGC0Ywg0YDQuNGB0YPQvdC+0Log0L7RgiDRhNC+0YLQvtCz0YDQsNGE0LjQuCDQuCDRgdC00LXQu9Cw0YLRjCDQstGL0LHQvtGALjwvbGk+XG4gICAgICAgICAgICAgICAgICAgIDxsaT7Ql9Cw0LTQsNGH0LAg0LrQsNC20LXRgtGB0Y8g0YLRgNC40LLQuNCw0LvRjNC90L7QuSwg0L3QviDQvdC1INC00YPQvNCw0LksINGH0YLQviDQstGB0LUg0YLQsNC6INC/0YDQvtGB0YLQvi48L2xpPlxuICAgICAgICAgICAgICAgICAgICA8bGk+0KTQvtGC0L7RgNC10LDQu9C40LfQvCDQvtCx0LzQsNC90YfQuNCyINC4INC60L7QstCw0YDQtdC9LjwvbGk+XG4gICAgICAgICAgICAgICAgICAgIDxsaT7Qn9C+0LzQvdC4LCDQs9C70LDQstC90L7QtSDigJQg0YHQvNC+0YLRgNC10YLRjCDQvtGH0LXQvdGMINCy0L3QuNC80LDRgtC10LvRjNC90L4uPC9saT5cbiAgICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBUTyBTVEFSVCBBUlJPVyAtLT5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZ3JlZXRpbmdfX3RvcCB0b3BcIiB0eXBlPVwiYnV0dG9uXCI+XG4gICAgICAgICAgICAgICAgICA8aW1nIHNyYz1cImltZy9pY29uLXRvcC5zdmdcIiB3aWR0aD1cIjcxXCIgaGVpZ2h0PVwiNzlcIiBhbHQ9XCLQotC+0L8g0LjQs9GA0L7QutC+0LJcIj5cbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICAgICAgPC9kaXY+YDtcbiAgfVxufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGFydEFycm93VmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gYDxidXR0b24gY2xhc3M9XCJncmVldGluZ19fY29udGludWVcIiB0eXBlPVwiYnV0dG9uXCI+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidmlzdWFsbHktaGlkZGVuXCI+0J/RgNC+0LTQvtC70LbQuNGC0Yw8L3NwYW4+XG4gICAgICAgICAgICAgIDxzdmcgY2xhc3M9XCJpY29uXCIgd2lkdGg9XCI2NFwiIGhlaWdodD1cIjY0XCIgdmlld0JveD1cIjAgMCA2NCA2NFwiIGZpbGw9XCIjMDAwMDAwXCI+XG4gICAgICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPVwiaW1nL3Nwcml0ZS5zdmcjYXJyb3ctcmlnaHRcIj48L3VzZT5cbiAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICA8L2J1dHRvbj5gO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBzZWN0aW9uLmdyZWV0aW5nYCk7XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgYmluZChjYikge1xuICAgIGNvbnN0IHN0YXJ0QXJyb3cgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuZ3JlZXRpbmdfX2NvbnRpbnVlYCk7XG4gICAgc3RhcnRBcnJvdy5hZGRFdmVudExpc3RlbmVyKGBjbGlja2AsIGNiKTtcbiAgfVxufVxuIiwiaW1wb3J0IEFic3RyYWN0U2NyZWVuIGZyb20gJy4uL2Fic3RyYWN0LXNjcmVlbi5qcyc7XG5cbmltcG9ydCBHcmVldGluZ1NjcmVlblZpZXcgZnJvbSAnLi9ncmVldGluZy1zY3JlZW4tdmlldy5qcyc7XG5pbXBvcnQgU3RhcnRBcnJvd1ZpZXcgZnJvbSAnLi9zdGFydC1hcnJvdy12aWV3LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR3JlZXRpbmdTY3JlZW4gZXh0ZW5kcyBBYnN0cmFjdFNjcmVlbiB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnZpZXcgPSBuZXcgR3JlZXRpbmdTY3JlZW5WaWV3KCk7XG4gIH1cblxuICBfb25TY3JlZW5TaG93KCkge1xuICAgIGNvbnN0IHN0YXJ0QXJyb3cgPSBuZXcgU3RhcnRBcnJvd1ZpZXcoKTtcbiAgICBzdGFydEFycm93LnJlbmRlcigpO1xuICAgIHN0YXJ0QXJyb3cuYmluZCh0aGlzLm5leHRTY3JlZW4uc2hvdy5iaW5kKHRoaXMubmV4dFNjcmVlbikpO1xuICB9XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJ1bGVzU2NyZWVuVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gYDxkaXYgaWQ9XCJtYWluXCIgY2xhc3M9XCJjZW50cmFsX19jb250ZW50XCI+XG4gICAgICAgICAgICAgIDxoZWFkZXIgY2xhc3M9XCJoZWFkZXJcIj5cbiAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIFRPIEJBQ0sgQVJST1cgLS0+XG4gICAgICAgICAgICAgIDwvaGVhZGVyPlxuICAgICAgICAgICAgICA8c2VjdGlvbiBjbGFzcz1cInJ1bGVzXCI+XG4gICAgICAgICAgICAgICAgPGgyIGNsYXNzPVwicnVsZXNfX3RpdGxlXCI+0J/RgNCw0LLQuNC70LA8L2gyPlxuICAgICAgICAgICAgICAgIDx1bCBjbGFzcz1cInJ1bGVzX19kZXNjcmlwdGlvblwiPlxuICAgICAgICAgICAgICAgICAgPGxpPtCj0LPQsNC00LDQuSAxMCDRgNCw0Lcg0LTQu9GPINC60LDQttC00L7Qs9C+INC40LfQvtCx0YDQsNC20LXQvdC40Y8g0YTQvtGC0L5cbiAgICAgICAgICAgICAgICAgICAgPGltZyBjbGFzcz1cInJ1bGVzX19pY29uXCIgc3JjPVwiaW1nL2ljb24tcGhvdG8ucG5nXCIgd2lkdGg9XCIzMlwiIGhlaWdodD1cIjMxXCIgYWx0PVwi0KTQvtGC0L5cIj4g0LjQu9C4INGA0LjRgdGD0L3QvtC6XG4gICAgICAgICAgICAgICAgICAgIDxpbWcgY2xhc3M9XCJydWxlc19faWNvblwiIHNyYz1cImltZy9pY29uLXBhaW50LnBuZ1wiIHdpZHRoPVwiMzJcIiBoZWlnaHQ9XCIzMVwiIGFsdD1cItCg0LjRgdGD0L3QvtC6XCI+PC9saT5cbiAgICAgICAgICAgICAgICAgIDxsaT7QpNC+0YLQvtCz0YDQsNGE0LjRj9C80Lgg0LjQu9C4INGA0LjRgdGD0L3QutCw0LzQuCDQvNC+0LPRg9GCINCx0YvRgtGMINC+0LHQsCDQuNC30L7QsdGA0LDQttC10L3QuNGPLjwvbGk+XG4gICAgICAgICAgICAgICAgICA8bGk+0J3QsCDQutCw0LbQtNGD0Y4g0L/QvtC/0YvRgtC60YMg0L7RgtCy0L7QtNC40YLRgdGPIDMwINGB0LXQutGD0L3QtC48L2xpPlxuICAgICAgICAgICAgICAgICAgPGxpPtCe0YjQuNCx0LjRgtGM0YHRjyDQvNC+0LbQvdC+INC90LUg0LHQvtC70LXQtSAzINGA0LDQty48L2xpPlxuICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJydWxlc19fcmVhZHlcIj7Qk9C+0YLQvtCy0Ys/PC9wPlxuICAgICAgICAgICAgICAgIDxmb3JtIGNsYXNzPVwicnVsZXNfX2Zvcm1cIj5cbiAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgVE8gTkFNRSBJTlBVVCAtLT5cbiAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgVE8gU1RBUlQgQlVUVE9OIC0tPlxuICAgICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICAgICAgPC9kaXY+YDtcbiAgfVxufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOYW1lSW5wdXRWaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPGlucHV0IGNsYXNzPVwicnVsZXNfX2lucHV0XCIgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cItCS0LDRiNC1INCY0LzRj1wiPmA7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYGZvcm0ucnVsZXNfX2Zvcm1gKTtcbiAgICB0aGlzLmVsZW1lbnQudmFsdWUgPSBgYDtcbiAgICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XG4gIH1cblxuICBiaW5kKCkge1xuICAgIGNvbnN0IG5hbWVJbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5ydWxlc19faW5wdXRgKTtcbiAgICBjb25zdCBzdGFydEJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5ydWxlc19fYnV0dG9uYCk7XG4gICAgbmFtZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoYGlucHV0YCwgKCkgPT4ge1xuICAgICAgc3RhcnRCdG4uZGlzYWJsZWQgPSAobmFtZUlucHV0LnZhbHVlID09PSBgYCkgPyB0cnVlIDogZmFsc2U7XG4gICAgfSk7XG4gIH1cbn1cbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhcnRCdXR0b25WaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPGJ1dHRvbiBjbGFzcz1cInJ1bGVzX19idXR0b24gIGNvbnRpbnVlXCIgdHlwZT1cInN1Ym1pdFwiIGRpc2FibGVkPkdvITwvYnV0dG9uPmA7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYGZvcm0ucnVsZXNfX2Zvcm1gKTtcbiAgICB0aGlzLmVsZW1lbnQuZGlzYWJsZWQgPSB0cnVlO1xuICAgIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIGJpbmQoY2IpIHtcbiAgICBjb25zdCBzdGFydEJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5ydWxlc19fYnV0dG9uYCk7XG4gICAgc3RhcnRCdG4uYWRkRXZlbnRMaXN0ZW5lcihgY2xpY2tgLCBjYik7XG4gIH1cbn1cbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFja0Fycm93VmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gYDxidXR0b24gY2xhc3M9XCJiYWNrXCI+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidmlzdWFsbHktaGlkZGVuXCI+0JLQtdGA0L3Rg9GC0YzRgdGPINC6INC90LDRh9Cw0LvRgzwvc3Bhbj5cbiAgICAgICAgICAgICAgPHN2ZyBjbGFzcz1cImljb25cIiB3aWR0aD1cIjQ1XCIgaGVpZ2h0PVwiNDVcIiB2aWV3Qm94PVwiMCAwIDQ1IDQ1XCIgZmlsbD1cIiMwMDAwMDBcIj5cbiAgICAgICAgICAgICAgICA8dXNlIHhsaW5rOmhyZWY9XCJpbWcvc3ByaXRlLnN2ZyNhcnJvdy1sZWZ0XCI+PC91c2U+XG4gICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgICA8c3ZnIGNsYXNzPVwiaWNvblwiIHdpZHRoPVwiMTAxXCIgaGVpZ2h0PVwiNDRcIiB2aWV3Qm94PVwiMCAwIDEwMSA0NFwiIGZpbGw9XCIjMDAwMDAwXCI+XG4gICAgICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPVwiaW1nL3Nwcml0ZS5zdmcjbG9nby1zbWFsbFwiPjwvdXNlPlxuICAgICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgIDwvYnV0dG9uPmA7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYGhlYWRlci5oZWFkZXJgKTtcbiAgICBwYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZSh0aGlzLmVsZW1lbnQsIHBhcmVudEVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gIH1cblxuICBiaW5kKGNiKSB7XG4gICAgY29uc3QgYmFja0Fycm93ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmJhY2tgKTtcbiAgICBiYWNrQXJyb3cuYWRkRXZlbnRMaXN0ZW5lcihgY2xpY2tgLCBjYik7XG4gIH1cbn1cbiIsImltcG9ydCBBYnN0cmFjdFNjcmVlbiBmcm9tICcuLi9hYnN0cmFjdC1zY3JlZW4uanMnO1xuXG5pbXBvcnQgUnVsZXNTY3JlZW5WaWV3IGZyb20gJy4vcnVsZXMtc2NyZWVuLXZpZXcuanMnO1xuaW1wb3J0IE5hbWVJbnB1dFZpZXcgZnJvbSAnLi9uYW1lLWlucHV0LXZpZXcuanMnO1xuaW1wb3J0IFN0YXJ0QnV0dG9uVmlldyBmcm9tICcuL3N0YXJ0LWJ1dHRvbi12aWV3LmpzJztcbmltcG9ydCBCYWNrQXJyb3dWaWV3IGZyb20gJy4uL3V0aWwtdmlld3MvYmFjay1hcnJvdy12aWV3LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUnVsZXNTY3JlZW4gZXh0ZW5kcyBBYnN0cmFjdFNjcmVlbiB7XG5cbiAgY29uc3RydWN0b3IoZ2FtZU1vZGVsKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmdhbWVNb2RlbCA9IGdhbWVNb2RlbDtcbiAgICB0aGlzLnZpZXcgPSBuZXcgUnVsZXNTY3JlZW5WaWV3KCk7XG4gIH1cblxuICBfb25TY3JlZW5TaG93KCkge1xuICAgIGNvbnN0IG5hbWVJbnB1dCA9IG5ldyBOYW1lSW5wdXRWaWV3KCk7XG4gICAgY29uc3Qgc3RhcnRCdG4gPSBuZXcgU3RhcnRCdXR0b25WaWV3KCk7XG4gICAgY29uc3QgYmFja0Fycm93ID0gbmV3IEJhY2tBcnJvd1ZpZXcoKTtcbiAgICBjb25zdCBvblN0YXJ0QnRuQ2xpY2sgPSB0aGlzLl9vblN0YXJ0QnRuQ2xpY2suYmluZCh0aGlzKTtcbiAgICBjb25zdCByZXN0YXJ0R2FtZSA9IHRoaXMuX3Jlc3RhcnRHYW1lLmJpbmQodGhpcyk7XG5cbiAgICBuYW1lSW5wdXQucmVuZGVyKCk7XG4gICAgc3RhcnRCdG4ucmVuZGVyKCk7XG4gICAgYmFja0Fycm93LnJlbmRlcigpO1xuXG4gICAgc3RhcnRCdG4uYmluZChvblN0YXJ0QnRuQ2xpY2spO1xuICAgIG5hbWVJbnB1dC5iaW5kKCk7XG4gICAgYmFja0Fycm93LmJpbmQocmVzdGFydEdhbWUpO1xuICB9XG5cbiAgX29uU3RhcnRCdG5DbGljaygpIHtcbiAgICBjb25zdCBuYW1lSW5wdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAucnVsZXNfX2lucHV0YCk7XG4gICAgdGhpcy5nYW1lTW9kZWwucGxheWVyTmFtZSA9IG5hbWVJbnB1dC52YWx1ZS50cmltKCk7XG4gICAgdGhpcy5uZXh0U2NyZWVuLnNob3coKTtcbiAgfVxufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHYW1lU2NyZWVuVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoZ2FtZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5nYW1lID0gZ2FtZTtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gYDxkaXYgaWQ9XCJtYWluXCIgY2xhc3M9XCJjZW50cmFsX19jb250ZW50XCI+XG4gICAgICAgICAgICAgIDxoZWFkZXIgY2xhc3M9XCJoZWFkZXJcIj5cbiAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIFRPIEJBQ0sgQVJST1cgLS0+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdhbWVfX3RpbWVyXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdhbWVfX2xpdmVzXCI+PC9kaXY+XG4gICAgICAgICAgICAgIDwvaGVhZGVyPlxuICAgICAgICAgICAgICA8c2VjdGlvbiBjbGFzcz1cImdhbWVcIj5cbiAgICAgICAgICAgICAgICA8cCBjbGFzcz1cImdhbWVfX3Rhc2tcIj4ke3RoaXMuZ2FtZS50YXNrfTwvcD5cbiAgICAgICAgICAgICAgICAke0dhbWVTY3JlZW5WaWV3LmdldEdhbWVDb250ZW50KHRoaXMuZ2FtZS5nYW1lVHlwZSl9XG4gICAgICAgICAgICAgICAgPHVsIGNsYXNzPVwic3RhdHNcIj48L3VsPlxuICAgICAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgICAgICA8L2Rpdj5gO1xuICB9XG5cbiAgc3RhdGljIGdldEdhbWVDb250ZW50KGdhbWVUeXBlKSB7XG4gICAgbGV0IGNvbnRlbnQgPSBgYDtcbiAgICBpZiAoZ2FtZVR5cGUgPT09IDEpIHtcbiAgICAgIGNvbnRlbnQgPSBgPGZvcm0gY2xhc3M9XCJnYW1lX19jb250ZW50ICBnYW1lX19jb250ZW50LS13aWRlXCI+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ2FtZV9fb3B0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIElNQUdFIC0tPlxuICAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBBTlNXRVIgUEhPVE8gQlVUVE9OIC0tPlxuICAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBBTlNXRVIgUEFJTlQgQlVUVE9OIC0tPlxuICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgIDwvZm9ybT5gO1xuICAgIH0gZWxzZSBpZiAoZ2FtZVR5cGUgPT09IDIpIHtcbiAgICAgIGNvbnRlbnQgPSBgPGZvcm0gY2xhc3M9XCJnYW1lX19jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdhbWVfX29wdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgSU1BR0UgLS0+XG4gICAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBBTlNXRVIgUEhPVE8gQlVUVE9OIC0tPlxuICAgICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgQU5TV0VSIFBBSU5UIEJVVFRPTiAtLT5cbiAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ2FtZV9fb3B0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBJTUFHRSAtLT5cbiAgICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIEFOU1dFUiBQSE9UTyBCVVRUT04gLS0+XG4gICAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBBTlNXRVIgUEFJTlQgQlVUVE9OIC0tPlxuICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICA8L2Zvcm0+YDtcbiAgICB9IGVsc2UgaWYgKGdhbWVUeXBlID09PSAzKSB7XG4gICAgICBjb250ZW50ID0gYDxmb3JtIGNsYXNzPVwiZ2FtZV9fY29udGVudCAgZ2FtZV9fY29udGVudC0tdHJpcGxlXCI+XG4gICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgQU5TV0VSIFBBSU5UIE9QVElPTiAtLT5cbiAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBBTlNXRVIgUEFJTlQgT1BUSU9OIC0tPlxuICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIEFOU1dFUiBQQUlOVCBPUFRJT04gLS0+XG4gICAgICAgICAgICAgICAgIDwvZm9ybT5gO1xuICAgIH1cbiAgICByZXR1cm4gY29udGVudDtcbiAgfVxuXG59XG4iLCJpbXBvcnQgY29uZmlnIGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRpbWVyQmxvY2tWaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX2lzQWN0aXZlID0gdHJ1ZTtcbiAgICB0aGlzLl90aW1lID0gY29uZmlnLlRJTUVfVE9fQU5TV0VSO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIGNvbnN0IHRpbWUgPSBUaW1lckJsb2NrVmlldy5nZXRUaW1lRm9ybWF0dGVkKHRoaXMudGltZSk7XG4gICAgcmV0dXJuIGA8ZGl2IGNsYXNzPVwiZ2FtZV9fdGltZXJcIj4ke3RpbWV9PC9kaXY+YDtcbiAgfVxuXG4gIGdldCB0aW1lKCkge1xuICAgIHJldHVybiB0aGlzLl90aW1lO1xuICB9XG5cbiAgc2V0IHRpbWUobmV3VGltZSkge1xuICAgIHRoaXMuX3RpbWUgPSBuZXdUaW1lO1xuICB9XG5cbiAgZ2V0IGlzQWN0aXZlKCkge1xuICAgIHJldHVybiB0aGlzLl9pc0FjdGl2ZTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgaGVhZGVyLmhlYWRlcmApO1xuICAgIHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKHRoaXMuZWxlbWVudCwgcGFyZW50RWxlbWVudC5maXJzdENoaWxkKTtcbiAgfVxuXG4gIHVwZGF0ZSgpIHtcbiAgICBpZiAodGhpcy5faXNBY3RpdmUgJiYgdGhpcy50aW1lID4gMCkge1xuICAgICAgdGhpcy50aW1lID0gdGhpcy50aW1lIC0gMTAwMDtcbiAgICAgIGNvbnN0IHRpbWUgPSBUaW1lckJsb2NrVmlldy5nZXRUaW1lRm9ybWF0dGVkKHRoaXMudGltZSk7XG4gICAgICBjb25zdCB0aW1lckVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBkaXYuZ2FtZV9fdGltZXJgKTtcbiAgICAgIHRpbWVyRWxlbWVudC50ZXh0Q29udGVudCA9IHRpbWU7XG4gICAgICBpZiAodGhpcy50aW1lID09PSA1MDAwIHx8IHRoaXMudGltZSA9PT0gMzAwMCB8fCB0aGlzLnRpbWUgPT09IDEwMDApIHtcbiAgICAgICAgdGltZXJFbGVtZW50LnN0eWxlID0gYGNvbG9yOiAjZDc0MDQwO2A7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aW1lckVsZW1lbnQuc3R5bGUgPSBgY29sb3I6IGJsYWNrO2A7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc3RvcCgpIHtcbiAgICB0aGlzLl9pc0FjdGl2ZSA9IGZhbHNlO1xuICB9XG5cbiAgc3RhdGljIGdldFRpbWVGb3JtYXR0ZWQodGltZSkge1xuICAgIGNvbnN0IFJFR0VYID0gL15cXGQkLztcbiAgICBsZXQgbWluID0gYGAgKyBNYXRoLmZsb29yKHRpbWUgLyAxMDAwIC8gNjApO1xuICAgIGxldCBzZWMgPSBgYCArIE1hdGguZmxvb3IoKHRpbWUgLSAobWluICogMTAwMCAqIDYwKSkgLyAxMDAwKTtcbiAgICBpZiAoUkVHRVgudGVzdChzZWMpKSB7XG4gICAgICBzZWMgPSBgMCR7c2VjfWA7XG4gICAgfVxuICAgIGlmIChSRUdFWC50ZXN0KG1pbikpIHtcbiAgICAgIG1pbiA9IGAwJHttaW59YDtcbiAgICB9XG4gICAgcmV0dXJuIGAke21pbn06JHtzZWN9YDtcbiAgfVxufVxuIiwiaW1wb3J0IGNvbmZpZyBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMaXZlc0Jsb2NrVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IobGl2ZXMpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMubGl2ZXMgPSBsaXZlcztcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICBsZXQgcmVzdWx0ID0gYGA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb25maWcuTElWRVNfQ09VTlQ7IGkrKykge1xuICAgICAgcmVzdWx0ICs9IGA8aW1nIHNyYz1cImltZy9oZWFydF9fJHsodGhpcy5saXZlcyA+IDApID8gYGZ1bGxgIDogYGVtcHR5YH0uc3ZnXCIgY2xhc3M9XCJnYW1lX19oZWFydFwiIGFsdD1cIkxpZmVcIiB3aWR0aD1cIjMxXCIgaGVpZ2h0PVwiMjdcIj5gO1xuICAgICAgdGhpcy5saXZlcy0tO1xuICAgIH1cbiAgICByZXR1cm4gYDxkaXYgY2xhc3M9XCJnYW1lX19saXZlc1wiPiR7cmVzdWx0fTwvZGl2PmA7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYGhlYWRlci5oZWFkZXJgKTtcbiAgICBjb25zdCBvbGRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgZGl2LmdhbWVfX2xpdmVzYCk7XG4gICAgcGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChvbGRFbGVtZW50KTtcbiAgICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XG4gIH1cbn1cbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhdHNCbG9ja1ZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKGFuc3dlcnMpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuYW5zd2VycyA9IGFuc3dlcnM7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgbGV0IHJlc3VsdCA9IGBgO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTA7IGkrKykge1xuICAgICAgY29uc3QgYW5zd2VyID0gdGhpcy5hbnN3ZXJzW2ldO1xuICAgICAgbGV0IG1vZGlmaWVyID0gYGA7XG4gICAgICBpZiAoYW5zd2VyKSB7XG4gICAgICAgIGlmIChhbnN3ZXIuaXNPSykge1xuICAgICAgICAgIG1vZGlmaWVyID0gYGNvcnJlY3RgO1xuICAgICAgICAgIGlmIChhbnN3ZXIudGltZSA8IDEwKSB7XG4gICAgICAgICAgICBtb2RpZmllciA9IGBmYXN0YDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGFuc3dlci50aW1lID4gMjApIHtcbiAgICAgICAgICAgIG1vZGlmaWVyID0gYHNsb3dgO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtb2RpZmllciA9IGB3cm9uZ2A7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1vZGlmaWVyID0gYHVua25vd25gO1xuICAgICAgfVxuICAgICAgcmVzdWx0ICs9IGA8bGkgY2xhc3M9XCJzdGF0c19fcmVzdWx0IHN0YXRzX19yZXN1bHQtLSR7bW9kaWZpZXJ9XCI+PC9saT5gO1xuICAgIH1cbiAgICByZXR1cm4gYDx1bCBjbGFzcz1cInN0YXRzXCI+JHtyZXN1bHR9PC91bD5gO1xufVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihgc2VjdGlvbi5nYW1lYCk7XG4gICAgY29uc3Qgb2xkRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYHVsLnN0YXRzYCk7XG4gICAgcGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChvbGRFbGVtZW50KTtcbiAgICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XG4gIH1cbn1cbiIsImNvbnN0IERFQlVHX09OID0gdHJ1ZTtcbmNvbnN0IFNUWUxFID0gYHN0eWxlPVwiYm94LXNoYWRvdzogMHB4IDBweCAxMHB4IDEycHggcmdiYSgxOSwxNzMsMjQsMSk7XCJgO1xuXG5mdW5jdGlvbiBpc1Bob3RvKGFuc3dlcikge1xuICByZXR1cm4gKERFQlVHX09OICYmIGFuc3dlciA9PT0gYHBob3RvYCkgPyBTVFlMRSA6IGBgO1xufVxuXG5mdW5jdGlvbiBpc1BhaW50KGFuc3dlcikge1xuICByZXR1cm4gKERFQlVHX09OICYmIGFuc3dlciA9PT0gYHBhaW50YCkgPyBTVFlMRSA6IGBgO1xufVxuXG5mdW5jdGlvbiBpc0NvcnJlY3QoaXNDb3JyZWN0KSB7XG4gIHJldHVybiAoREVCVUdfT04gJiYgaXNDb3JyZWN0KSA/IFNUWUxFIDogYGA7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtpc1Bob3RvLCBpc1BhaW50LCBpc0NvcnJlY3R9O1xuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuaW1wb3J0IGRlYnVnIGZyb20gJy4uL2RlYnVnLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQW5zd2VyUGhvdG9CdXR0b25WaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcihxdWVzdGlvbkluZGV4LCBnYW1lKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnF1ZXN0aW9uSW5kZXggPSBxdWVzdGlvbkluZGV4O1xuICAgIHRoaXMuY29ycmVjdEFuc3dlciA9IGdhbWUucXVlc3Rpb25zW3RoaXMucXVlc3Rpb25JbmRleF0uY29ycmVjdEFuc3dlcjtcbiAgICB0aGlzLmdhbWVJbmRleCA9IGdhbWUuZ2FtZUluZGV4O1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPGxhYmVsIGNsYXNzPVwiZ2FtZV9fYW5zd2VyIGdhbWVfX2Fuc3dlci0tcGhvdG9cIj5cbiAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwidmlzdWFsbHktaGlkZGVuXCIgbmFtZT1cInF1ZXN0aW9uICR7dGhpcy5xdWVzdGlvbkluZGV4fVwiIHR5cGU9XCJyYWRpb1wiIHZhbHVlPVwicGhvdG9cIiBkYXRhLWdhbWVpbmRleD1cIiR7dGhpcy5nYW1lSW5kZXh9XCIgZGF0YS1xdWVzdGlvbmluZGV4PVwiJHt0aGlzLnF1ZXN0aW9uSW5kZXh9XCI+XG4gICAgICAgICAgICAgIDxzcGFuICR7ZGVidWcuaXNQaG90byh0aGlzLmNvcnJlY3RBbnN3ZXIpfT7QpNC+0YLQvjwvc3Bhbj5cbiAgICAgICAgICAgIDwvbGFiZWw+YDtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnZGl2LmdhbWVfX29wdGlvbicpW3RoaXMucXVlc3Rpb25JbmRleF07XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgYmluZChjYikge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdkaXYuZ2FtZV9fb3B0aW9uJylbdGhpcy5xdWVzdGlvbkluZGV4XTtcbiAgICBjb25zdCBhbnN3ZXJFbGVtZW50ID0gcGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKGAuZ2FtZV9fYW5zd2VyLS1waG90byA+IGlucHV0YCk7XG4gICAgYW5zd2VyRWxlbWVudC5jaGVja2VkID0gZmFsc2U7XG4gICAgYW5zd2VyRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGBjbGlja2AsIGNiKTtcbiAgfVxufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuaW1wb3J0IGRlYnVnIGZyb20gJy4uL2RlYnVnLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQW5zd2VyUGFpbnRCdXR0b25WaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcihxdWVzdGlvbkluZGV4LCBnYW1lKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnF1ZXN0aW9uSW5kZXggPSBxdWVzdGlvbkluZGV4O1xuICAgIHRoaXMuY29ycmVjdEFuc3dlciA9IGdhbWUucXVlc3Rpb25zW3RoaXMucXVlc3Rpb25JbmRleF0uY29ycmVjdEFuc3dlcjtcbiAgICB0aGlzLmdhbWVJbmRleCA9IGdhbWUuZ2FtZUluZGV4O1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPGxhYmVsIGNsYXNzPVwiZ2FtZV9fYW5zd2VyIGdhbWVfX2Fuc3dlci0tcGFpbnRcIj5cbiAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwidmlzdWFsbHktaGlkZGVuXCIgbmFtZT1cInF1ZXN0aW9uICR7dGhpcy5xdWVzdGlvbkluZGV4fVwiIHR5cGU9XCJyYWRpb1wiIHZhbHVlPVwicGFpbnRcIiBkYXRhLWdhbWVpbmRleD1cIiR7dGhpcy5nYW1lSW5kZXh9XCIgZGF0YS1xdWVzdGlvbmluZGV4PVwiJHt0aGlzLnF1ZXN0aW9uSW5kZXh9XCI+XG4gICAgICAgICAgICAgIDxzcGFuICR7ZGVidWcuaXNQYWludCh0aGlzLmNvcnJlY3RBbnN3ZXIpfT7QoNC40YHRg9C90L7Qujwvc3Bhbj5cbiAgICAgICAgICAgIDwvbGFiZWw+YDtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnZGl2LmdhbWVfX29wdGlvbicpW3RoaXMucXVlc3Rpb25JbmRleF07XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgYmluZChjYikge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdkaXYuZ2FtZV9fb3B0aW9uJylbdGhpcy5xdWVzdGlvbkluZGV4XTtcbiAgICBjb25zdCBhbnN3ZXJFbGVtZW50ID0gcGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKGAuZ2FtZV9fYW5zd2VyLS1wYWludCA+IGlucHV0YCk7XG4gICAgYW5zd2VyRWxlbWVudC5jaGVja2VkID0gZmFsc2U7XG4gICAgYW5zd2VyRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGBjbGlja2AsIGNiKTtcbiAgfVxufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuaW1wb3J0IGRlYnVnIGZyb20gJy4uL2RlYnVnLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQW5zd2VyUGFpbnRPcHRpb25WaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcihhbnN3ZXJJbmRleCwgZ2FtZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5hbnN3ZXJJbmRleCA9IGFuc3dlckluZGV4O1xuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XG4gICAgdGhpcy5jb3JyZWN0QW5zd2VyID0gZ2FtZS5xdWVzdGlvbnNbMF0uY29ycmVjdEFuc3dlcjtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gYDxkaXYgY2xhc3M9XCJnYW1lX19vcHRpb25cIiBkYXRhLWFuc3dlcj1cIiR7dGhpcy5hbnN3ZXJJbmRleH1cIiBkYXRhLWdhbWVpbmRleD1cIiR7dGhpcy5nYW1lLmdhbWVJbmRleH1cIiAke2RlYnVnLmlzQ29ycmVjdCh0aGlzLmNvcnJlY3RBbnN3ZXIgPT09IHRoaXMuYW5zd2VySW5kZXgpfT5cbiAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgSU1BR0UgLS0+XG4gICAgICAgICAgICA8L2Rpdj5gO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdmb3JtLmdhbWVfX2NvbnRlbnQtLXRyaXBsZScpO1xuICAgIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIGJpbmQoY2IpIHtcbiAgICBjb25zdCBhbnN3ZXJFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgLmdhbWVfX29wdGlvbmApW3RoaXMuYW5zd2VySW5kZXhdO1xuICAgIGFuc3dlckVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihgY2xpY2tgLCBjYik7XG4gIH1cbn1cbiIsIi8vIE1hbmFnaW5nIHNpemVcbi8vIEBwYXJhbSAge29iamVjdH0gZnJhbWUg0L7Qv9C40YHRi9Cy0LDQtdGCINGA0LDQt9C80LXRgNGLINGA0LDQvNC60LgsINCyINC60L7RgtC+0YDRi9C1INC00L7Qu9C20L3QviDQsdGL0YLRjCDQstC/0LjRgdCw0L3QviDQuNC30L7QsdGA0LDQttC10L3QuNC1XG4vLyBAcGFyYW0gIHtvYmplY3R9IGdpdmVuINC+0L/QuNGB0YvQstCw0LXRgiDRgNCw0LfQvNC10YDRiyDQuNC30L7QsdGA0LDQttC10L3QuNGPLCDQutC+0YLQvtGA0YvQtSDQvdGD0LbQvdC+INC/0L7QtNC+0LPQvdCw0YLRjCDQv9C+0LQg0YDQsNC80LrRg1xuLy8gQHJldHVybiB7b2JqZWN0fSDQvdC+0LLRi9C5INC+0LHRitC10LrRgiwg0LrQvtGC0L7RgNGL0Lkg0LHRg9C00LXRgiDRgdC+0LTQtdGA0LbQsNGC0Ywg0LjQt9C80LXQvdGR0L3QvdGL0LUg0YDQsNC30LzQtdGA0Ysg0LjQt9C+0LHRgNCw0LbQtdC90LjRj1xuZXhwb3J0IGRlZmF1bHQgIGZ1bmN0aW9uIHJlc2l6ZShmcmFtZSwgZ2l2ZW4pIHtcbiAgbGV0IHdpZHRoID0gZ2l2ZW4ud2lkdGg7XG4gIGxldCBoZWlnaHQgPSBnaXZlbi5oZWlnaHQ7XG4gIGlmICh3aWR0aCA+IGZyYW1lLndpZHRoKSB7XG4gICAgY29uc3QgbXVsdGlwbGllciA9IHdpZHRoIC8gZnJhbWUud2lkdGg7XG4gICAgd2lkdGggPSBmcmFtZS53aWR0aDtcbiAgICBoZWlnaHQgPSBNYXRoLmZsb29yKGhlaWdodCAvIG11bHRpcGxpZXIpO1xuICB9XG4gIGlmIChoZWlnaHQgPiBmcmFtZS5oZWlnaHQpIHtcbiAgICBjb25zdCBtdWx0aXBsaWVyID0gaGVpZ2h0IC8gZnJhbWUuaGVpZ2h0O1xuICAgIGhlaWdodCA9IGZyYW1lLmhlaWdodDtcbiAgICB3aWR0aCA9IE1hdGguZmxvb3Iod2lkdGggLyBtdWx0aXBsaWVyKTtcbiAgfVxuICByZXR1cm4ge3dpZHRoLCBoZWlnaHR9O1xufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuaW1wb3J0IHJlc2l6ZSBmcm9tIFwiLi4vcmVzaXplLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEltYWdlVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IocXVlc3Rpb25OdW1iZXIsIGdhbWUpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMucXVlc3Rpb25OdW1iZXIgPSBxdWVzdGlvbk51bWJlcjtcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xuICAgIGlmIChnYW1lLmdhbWVUeXBlID09PSAzKSB7XG4gICAgICB0aGlzLmltZyA9IGdhbWUucXVlc3Rpb25zWzBdLmltZ1t0aGlzLnF1ZXN0aW9uTnVtYmVyXTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5pbWcgPSBnYW1lLnF1ZXN0aW9uc1t0aGlzLnF1ZXN0aW9uTnVtYmVyXS5pbWdbMF07XG4gICAgfVxuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIGNvbnN0IGltZ1NpemUgPSByZXNpemUodGhpcy5nYW1lLmZyYW1lU2l6ZSwgdGhpcy5pbWcuc2l6ZSk7XG4gICAgcmV0dXJuIGA8aW1nIHNyYz1cIiR7dGhpcy5pbWcuc3JjfVwiIGFsdD1cIk9wdGlvbiAke3RoaXMucXVlc3Rpb25OdW1iZXIgKyAxfVwiIHdpZHRoPVwiJHtpbWdTaXplLndpZHRofVwiIGhlaWdodD1cIiR7aW1nU2l6ZS5oZWlnaHR9XCI+YDtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnZGl2LmdhbWVfX29wdGlvbicpW3RoaXMucXVlc3Rpb25OdW1iZXJdO1xuICAgIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxufVxuIiwiaW1wb3J0IGNvbmZpZyBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IEFic3RyYWN0U2NyZWVuIGZyb20gJy4uL2Fic3RyYWN0LXNjcmVlbi5qcyc7XG5cbmltcG9ydCBHYW1lU2NyZWVuVmlldyBmcm9tICcuL2dhbWUtc2NyZWVuLXZpZXcuanMnO1xuaW1wb3J0IFRpbWVyQmxvY2tWaWV3IGZyb20gJy4vdGltZXItYmxvY2stdmlldy5qcyc7XG5pbXBvcnQgTGl2ZXNCbG9ja1ZpZXcgZnJvbSAnLi9saXZlcy1ibG9jay12aWV3LmpzJztcbmltcG9ydCBTdGF0c0Jsb2NrVmlldyBmcm9tICcuLi91dGlsLXZpZXdzL3N0YXRzLWJsb2NrLXZpZXcuanMnO1xuaW1wb3J0IEFuc3dlclBob3RvQnV0dG9uVmlldyBmcm9tICcuL2Fuc3dlci1waG90by1idXR0b24tdmlldy5qcyc7XG5pbXBvcnQgQW5zd2VyUGFpbnRCdXR0b25WaWV3IGZyb20gJy4vYW5zd2VyLXBhaW50LWJ1dHRvbi12aWV3LmpzJztcbmltcG9ydCBBbnN3ZXJQYWludE9wdGlvblZpZXcgZnJvbSAnLi9hbnN3ZXItcGFpbnQtb3B0aW9uLXZpZXcuanMnO1xuaW1wb3J0IEltYWdlVmlldyBmcm9tICcuL2ltYWdlLXZpZXcuanMnO1xuaW1wb3J0IEJhY2tBcnJvd1ZpZXcgZnJvbSAnLi4vdXRpbC12aWV3cy9iYWNrLWFycm93LXZpZXcuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHYW1lU2NyZWVuIGV4dGVuZHMgQWJzdHJhY3RTY3JlZW4ge1xuXG4gIGNvbnN0cnVjdG9yKGdhbWVNb2RlbCwgZ2FtZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5nYW1lTW9kZWwgPSBnYW1lTW9kZWw7XG4gICAgdGhpcy5nYW1lID0gZ2FtZTtcbiAgICB0aGlzLnZpZXcgPSBuZXcgR2FtZVNjcmVlblZpZXcoZ2FtZSk7XG4gIH1cblxuICBfb25TY3JlZW5TaG93KCkge1xuICAgIGNvbnN0IGdhbWUgPSB0aGlzLmdhbWU7XG4gICAgY29uc3QgZ2FtZVR5cGUgPSBnYW1lLmdhbWVUeXBlO1xuICAgIGNvbnN0IGxpdmVzQmxvY2sgPSBuZXcgTGl2ZXNCbG9ja1ZpZXcodGhpcy5nYW1lTW9kZWwubGl2ZXMpO1xuICAgIGNvbnN0IHN0YXRzQmxvY2sgPSBuZXcgU3RhdHNCbG9ja1ZpZXcodGhpcy5nYW1lTW9kZWwuYW5zd2Vycyk7XG5cbiAgICBsaXZlc0Jsb2NrLnJlbmRlcigpO1xuICAgIHN0YXRzQmxvY2sucmVuZGVyKCk7XG5cbiAgICB0aGlzLnRpbWVyID0gbmV3IFRpbWVyQmxvY2tWaWV3KCk7XG4gICAgdGhpcy50aW1lci5yZW5kZXIoKTtcbiAgICB0aGlzLl90aW1lck9uKCk7XG5cbiAgICBjb25zdCBvbkV2ZXJ5QW5zd2VyID0gdGhpcy5fb25FdmVyeUFuc3dlci5iaW5kKHRoaXMpO1xuXG4gICAgaWYgKGdhbWVUeXBlID09PSBjb25maWcuR0FNRV9UWVBFLm9uZSkge1xuICAgICAgY29uc3QgYW5zd2VyMVBob3RvQnV0dG9uID0gbmV3IEFuc3dlclBob3RvQnV0dG9uVmlldygwLCBnYW1lKTtcbiAgICAgIGNvbnN0IGFuc3dlcjFQYWludEJ1dHRvbiA9IG5ldyBBbnN3ZXJQYWludEJ1dHRvblZpZXcoMCwgZ2FtZSk7XG4gICAgICBjb25zdCBpbWFnZSA9IG5ldyBJbWFnZVZpZXcoMCwgZ2FtZSk7XG4gICAgICBhbnN3ZXIxUGhvdG9CdXR0b24ucmVuZGVyKCk7XG4gICAgICBhbnN3ZXIxUGFpbnRCdXR0b24ucmVuZGVyKCk7XG4gICAgICBpbWFnZS5yZW5kZXIoKTtcbiAgICAgIGFuc3dlcjFQaG90b0J1dHRvbi5iaW5kKG9uRXZlcnlBbnN3ZXIpO1xuICAgICAgYW5zd2VyMVBhaW50QnV0dG9uLmJpbmQob25FdmVyeUFuc3dlcik7XG4gICAgfSBlbHNlIGlmIChnYW1lVHlwZSA9PT0gY29uZmlnLkdBTUVfVFlQRS50d28pIHtcbiAgICAgIGNvbnN0IGFuc3dlcjFQaG90b0J1dHRvbiA9IG5ldyBBbnN3ZXJQaG90b0J1dHRvblZpZXcoMCwgZ2FtZSk7XG4gICAgICBjb25zdCBhbnN3ZXIxUGFpbnRCdXR0b24gPSBuZXcgQW5zd2VyUGFpbnRCdXR0b25WaWV3KDAsIGdhbWUpO1xuICAgICAgY29uc3QgaW1hZ2UxID0gbmV3IEltYWdlVmlldygwLCBnYW1lKTtcbiAgICAgIGNvbnN0IGFuc3dlcjJQaG90b0J1dHRvbiA9IG5ldyBBbnN3ZXJQaG90b0J1dHRvblZpZXcoMSwgZ2FtZSk7XG4gICAgICBjb25zdCBhbnN3ZXIyUGFpbnRCdXR0b24gPSBuZXcgQW5zd2VyUGFpbnRCdXR0b25WaWV3KDEsIGdhbWUpO1xuICAgICAgY29uc3QgaW1hZ2UyID0gbmV3IEltYWdlVmlldygxLCBnYW1lKTtcbiAgICAgIGFuc3dlcjFQaG90b0J1dHRvbi5yZW5kZXIoKTtcbiAgICAgIGFuc3dlcjFQYWludEJ1dHRvbi5yZW5kZXIoKTtcbiAgICAgIGltYWdlMS5yZW5kZXIoKTtcbiAgICAgIGFuc3dlcjFQaG90b0J1dHRvbi5iaW5kKG9uRXZlcnlBbnN3ZXIpO1xuICAgICAgYW5zd2VyMVBhaW50QnV0dG9uLmJpbmQob25FdmVyeUFuc3dlcik7XG4gICAgICBhbnN3ZXIyUGhvdG9CdXR0b24ucmVuZGVyKCk7XG4gICAgICBhbnN3ZXIyUGFpbnRCdXR0b24ucmVuZGVyKCk7XG4gICAgICBpbWFnZTIucmVuZGVyKCk7XG4gICAgICBhbnN3ZXIyUGhvdG9CdXR0b24uYmluZChvbkV2ZXJ5QW5zd2VyKTtcbiAgICAgIGFuc3dlcjJQYWludEJ1dHRvbi5iaW5kKG9uRXZlcnlBbnN3ZXIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZVR5cGUgPT09IGNvbmZpZy5HQU1FX1RZUEUudGhyZWUpIHtcbiAgICAgIGNvbnN0IGFuc3dlcjFQYWludE9wdGlvblZpZXcgPSBuZXcgQW5zd2VyUGFpbnRPcHRpb25WaWV3KDAsIGdhbWUpO1xuICAgICAgY29uc3QgaW1hZ2UxID0gbmV3IEltYWdlVmlldygwLCBnYW1lKTtcbiAgICAgIGNvbnN0IGFuc3dlcjJQYWludE9wdGlvblZpZXcgPSBuZXcgQW5zd2VyUGFpbnRPcHRpb25WaWV3KDEsIGdhbWUpO1xuICAgICAgY29uc3QgaW1hZ2UyID0gbmV3IEltYWdlVmlldygxLCBnYW1lKTtcbiAgICAgIGNvbnN0IGFuc3dlcjNQYWludE9wdGlvblZpZXcgPSBuZXcgQW5zd2VyUGFpbnRPcHRpb25WaWV3KDIsIGdhbWUpO1xuICAgICAgY29uc3QgaW1hZ2UzID0gbmV3IEltYWdlVmlldygyLCBnYW1lKTtcbiAgICAgIGFuc3dlcjFQYWludE9wdGlvblZpZXcucmVuZGVyKCk7XG4gICAgICBpbWFnZTEucmVuZGVyKCk7XG4gICAgICBhbnN3ZXIyUGFpbnRPcHRpb25WaWV3LnJlbmRlcigpO1xuICAgICAgaW1hZ2UyLnJlbmRlcigpO1xuICAgICAgYW5zd2VyM1BhaW50T3B0aW9uVmlldy5yZW5kZXIoKTtcbiAgICAgIGltYWdlMy5yZW5kZXIoKTtcbiAgICAgIGFuc3dlcjFQYWludE9wdGlvblZpZXcuYmluZChvbkV2ZXJ5QW5zd2VyKTtcbiAgICAgIGFuc3dlcjJQYWludE9wdGlvblZpZXcuYmluZChvbkV2ZXJ5QW5zd2VyKTtcbiAgICAgIGFuc3dlcjNQYWludE9wdGlvblZpZXcuYmluZChvbkV2ZXJ5QW5zd2VyKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXN0YXJ0R2FtZSA9IHRoaXMuX3Jlc3RhcnRHYW1lLmJpbmQodGhpcyk7XG5cbiAgICBjb25zdCBiYWNrQXJyb3cgPSBuZXcgQmFja0Fycm93VmlldygpO1xuICAgIGJhY2tBcnJvdy5yZW5kZXIoKTtcbiAgICBiYWNrQXJyb3cuYmluZChyZXN0YXJ0R2FtZSk7XG4gIH1cblxuICBfdGltZXJPbigpIHtcbiAgICBpZiAodGhpcy50aW1lci5pc0FjdGl2ZSAmJiB0aGlzLnRpbWVyLnRpbWUgPiAwKSB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy50aW1lci51cGRhdGUoKTtcbiAgICAgICAgdGhpcy5fdGltZXJPbigpO1xuICAgICAgfSwgMTAwMCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRpbWVyLnRpbWUgPT09IDApIHtcbiAgICAgIHRoaXMuX29uVmFsaWRBbnN3ZXIoZmFsc2UpO1xuICAgIH1cbiAgfVxuXG4gIF9vbkV2ZXJ5QW5zd2VyKGV2dCkge1xuICAgIGNvbnN0IGdhbWUgPSB0aGlzLmdhbWU7XG4gICAgaWYgKGdhbWUuZ2FtZVR5cGUgPT09IGNvbmZpZy5HQU1FX1RZUEUudGhyZWUpIHtcbiAgICAgIGNvbnN0IGlucHV0ID0gZXZ0LmN1cnJlbnRUYXJnZXQ7XG4gICAgICBjb25zdCBnYW1lSW5kZXggPSBHYW1lU2NyZWVuLmdldEdhbWVJbmRleChpbnB1dCk7XG4gICAgICBjb25zdCBxdWVzdGlvbkluZGV4ID0gMDtcbiAgICAgIGNvbnN0IGNvcnJlY3RBbnN3ZXIgPSB0aGlzLl9nZXRDb3JyZWN0QW5zd2VyKGdhbWVJbmRleCwgcXVlc3Rpb25JbmRleCk7XG4gICAgICBjb25zdCBpc09LID0gK2lucHV0LmRhdGFzZXQuYW5zd2VyID09PSBjb3JyZWN0QW5zd2VyO1xuICAgICAgdGhpcy5fb25WYWxpZEFuc3dlcihpc09LKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgaXNBbGwgPSB0aGlzLl9pc0FsbEFuc3dlcnNHaXZlbigpO1xuICAgICAgaWYgKGlzQWxsKSB7XG4gICAgICAgIGNvbnN0IGlzT0sgPSB0aGlzLl9pc0FsbEFuc3dlcnNHaXZlbkNvcnJlY3QoKTtcbiAgICAgICAgdGhpcy5fb25WYWxpZEFuc3dlcihpc09LKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfaXNBbGxBbnN3ZXJzR2l2ZW4oKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgLmdhbWVfX29wdGlvbmApKTtcbiAgICByZXR1cm4gb3B0aW9ucy5ldmVyeSgob3B0aW9uKSA9PiB7XG4gICAgICBjb25zdCBhbnN3ZXJzID0gQXJyYXkuZnJvbShvcHRpb24ucXVlcnlTZWxlY3RvckFsbChgLmdhbWVfX2Fuc3dlcmApKTtcbiAgICAgIHJldHVybiBhbnN3ZXJzLnNvbWUoKGFuc3dlcikgPT4ge1xuICAgICAgICBjb25zdCBpbnB1dCA9IGFuc3dlci5xdWVyeVNlbGVjdG9yKGBpbnB1dGApO1xuICAgICAgICByZXR1cm4gaW5wdXQuY2hlY2tlZDtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgX2lzQWxsQW5zd2Vyc0dpdmVuQ29ycmVjdCgpIHtcbiAgICBjb25zdCBvcHRpb25zID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGAuZ2FtZV9fb3B0aW9uYCkpO1xuICAgIHJldHVybiBvcHRpb25zLmV2ZXJ5KChvcHRpb24pID0+IHtcbiAgICAgIGNvbnN0IGFuc3dlcnMgPSBBcnJheS5mcm9tKG9wdGlvbi5xdWVyeVNlbGVjdG9yQWxsKGAuZ2FtZV9fYW5zd2VyYCkpO1xuICAgICAgcmV0dXJuIGFuc3dlcnMuc29tZSgoYW5zd2VyKSA9PiB7XG4gICAgICAgIGNvbnN0IGlucHV0ID0gYW5zd2VyLnF1ZXJ5U2VsZWN0b3IoYGlucHV0YCk7XG4gICAgICAgIGNvbnN0IGdhbWVJbmRleCA9IEdhbWVTY3JlZW4uZ2V0R2FtZUluZGV4KGlucHV0KTtcbiAgICAgICAgY29uc3QgcXVlc3Rpb25JbmRleCA9IEdhbWVTY3JlZW4uZ2V0UXVlc3Rpb25JbmRleChpbnB1dCk7XG4gICAgICAgIGNvbnN0IGNvcnJlY3RBbnN3ZXIgPSB0aGlzLl9nZXRDb3JyZWN0QW5zd2VyKGdhbWVJbmRleCwgcXVlc3Rpb25JbmRleCk7XG4gICAgICAgIHJldHVybiBpbnB1dC5jaGVja2VkICYmIGlucHV0LnZhbHVlID09PSBjb3JyZWN0QW5zd2VyO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBfb25WYWxpZEFuc3dlcihpc09LKSB7XG4gICAgdGhpcy5fc2F2ZUFuc3dlcihpc09LKTtcbiAgICBpZiAoIWlzT0spIHtcbiAgICAgIHRoaXMuZ2FtZU1vZGVsLm1pbnVzTGl2ZSgpO1xuICAgIH1cbiAgICBpZiAodGhpcy5nYW1lTW9kZWwuaXNHYW1lT3Zlcikge1xuICAgICAgdGhpcy5lbmRTY3JlZW4uc2hvdygpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm5leHRTY3JlZW4uc2hvdygpO1xuICAgIH1cbiAgfVxuXG4gIF9nZXRDb3JyZWN0QW5zd2VyKGdhbWVJbmRleCwgcXVlc3Rpb25JbmRleCkge1xuICAgIHJldHVybiB0aGlzLmdhbWVNb2RlbC5nYW1lc1tnYW1lSW5kZXhdLnF1ZXN0aW9uc1txdWVzdGlvbkluZGV4XS5jb3JyZWN0QW5zd2VyO1xuICB9XG5cbiAgX3NhdmVBbnN3ZXIoaXNPSykge1xuICAgIGNvbnN0IHRpbWUgPSAoY29uZmlnLlRJTUVfVE9fQU5TV0VSIC0gdGhpcy50aW1lci50aW1lKSAvIDEwMDA7XG4gICAgdGhpcy50aW1lci5zdG9wKCk7XG4gICAgdGhpcy5nYW1lTW9kZWwuYWRkQW5zd2VyKHtpc09LLCB0aW1lfSk7XG4gIH1cblxuICBzdGF0aWMgZ2V0R2FtZUluZGV4KGlucHV0KSB7XG4gICAgcmV0dXJuIGlucHV0LmRhdGFzZXQuZ2FtZWluZGV4O1xuICB9XG5cbiAgc3RhdGljIGdldFF1ZXN0aW9uSW5kZXgoaW5wdXQpIHtcbiAgICByZXR1cm4gaW5wdXQuZGF0YXNldC5xdWVzdGlvbmluZGV4O1xuICB9XG5cbn1cbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhdHNTY3JlZW5WaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPGRpdiBpZD1cIm1haW5cIiBjbGFzcz1cImNlbnRyYWxfX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgPGhlYWRlciBjbGFzcz1cImhlYWRlclwiPlxuICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgVE8gQkFDSyBBUlJPVyAtLT5cbiAgICAgICAgICAgICAgPC9oZWFkZXI+XG4gICAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzPVwicmVzdWx0XCI+PC9zZWN0aW9uPlxuICAgICAgICAgICAgPC9kaXY+YDtcbiAgfVxuXG59XG4iLCIvLyBTY29yaW5nIGF0IHRoZSBlbmQgb2YgdGhlIGdhbWVcbi8vIEBwYXJhbSAge2FycmF5fSBhbnN3ZXJzINC80LDRgdGB0LjQsiDQvtGC0LLQtdGC0L7QsiDQv9C+0LvRjNC30L7QstCw0YLQtdC70Y9cbi8vIEBwYXJhbSAge2ludGVnZXJ9IGxpdmVzINC60L7Quy3QstC+INC+0YHRgtCw0LLRiNC40YXRgdGPINC20LjQt9C90LXQuVxuLy8gQHJldHVybiB7aW50ZWdlcn0g0LrQvtC7LdCy0L4g0L3QsNCx0YDQsNC90L3Ri9GFINC+0YfQutC+0LJcbmZ1bmN0aW9uIGdldFRvdGFsU2NvcmUoYW5zd2VycywgbGl2ZXMpIHtcbiAgaWYgKGFuc3dlcnMubGVuZ3RoIDwgMTApIHtcbiAgICByZXR1cm4gLTE7XG4gIH1cbiAgY29uc3Qgc2NvcmUgPSBhbnN3ZXJzLnJlZHVjZSgoYWNjLCBhbnN3ZXIpID0+IHtcbiAgICBpZiAoYW5zd2VyLmlzT0spIHtcbiAgICAgIGFjYyArPSAxMDA7XG4gICAgfVxuICAgIGlmIChhbnN3ZXIudGltZSA8IDEwKSB7XG4gICAgICBhY2MgKz0gNTA7XG4gICAgfVxuICAgIGlmIChhbnN3ZXIudGltZSA+IDIwKSB7XG4gICAgICBhY2MgLT0gNTA7XG4gICAgfVxuICAgIHJldHVybiBhY2M7XG4gIH0sIDApO1xuICByZXR1cm4gc2NvcmUgKyBsaXZlcyAqIDUwO1xufVxuXG5mdW5jdGlvbiBnZXRSaWdodEFuc3dlcnNDb3VudChhbnN3ZXJzKSB7XG4gIHJldHVybiBhbnN3ZXJzLmZpbHRlcigoYW5zd2VyKSA9PiBhbnN3ZXIuaXNPSykubGVuZ3RoO1xufVxuXG5mdW5jdGlvbiBnZXRTcGVlZEJvbnVzQ291bnQoYW5zd2Vycykge1xuICByZXR1cm4gYW5zd2Vycy5maWx0ZXIoKGFuc3dlcikgPT4gYW5zd2VyLnRpbWUgPCAxMCkubGVuZ3RoO1xufVxuXG5mdW5jdGlvbiBnZXRTbG93UGVuYWx0eUNvdW50KGFuc3dlcnMpIHtcbiAgcmV0dXJuIGFuc3dlcnMuZmlsdGVyKChhbnN3ZXIpID0+IGFuc3dlci50aW1lID4gMjApLmxlbmd0aDtcbn1cblxuZXhwb3J0IHtnZXRUb3RhbFNjb3JlLCBnZXRSaWdodEFuc3dlcnNDb3VudCwgZ2V0U3BlZWRCb251c0NvdW50LCBnZXRTbG93UGVuYWx0eUNvdW50fTtcbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcbmltcG9ydCBTdGF0c0Jsb2NrVmlldyBmcm9tICcuLi91dGlsLXZpZXdzL3N0YXRzLWJsb2NrLXZpZXcuanMnO1xuaW1wb3J0IHtnZXRUb3RhbFNjb3JlLCBnZXRSaWdodEFuc3dlcnNDb3VudCwgZ2V0U3BlZWRCb251c0NvdW50LCBnZXRTbG93UGVuYWx0eUNvdW50fSBmcm9tICcuLi9zY29yZS5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YXRzU2luZ2xlVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoYW5zd2VycywgbGl2ZXMpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuYW5zd2VycyA9IGFuc3dlcnM7XG4gICAgdGhpcy5saXZlcyA9IGxpdmVzO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIGNvbnN0IGlzV2luID0gdGhpcy5hbnN3ZXJzLmxlbmd0aCA9PT0gMTA7XG4gICAgY29uc3Qgc2NvcmUgPSBnZXRUb3RhbFNjb3JlKHRoaXMuYW5zd2VycywgdGhpcy5saXZlcyk7XG4gICAgY29uc3QgcmlnaHRBbnN3ZXJzQ291bnQgPSBnZXRSaWdodEFuc3dlcnNDb3VudCh0aGlzLmFuc3dlcnMpO1xuICAgIGNvbnN0IHNwZWVkQm9udXNDb3VudCA9IGdldFNwZWVkQm9udXNDb3VudCh0aGlzLmFuc3dlcnMpO1xuICAgIGNvbnN0IHNsb3dQZW5hbHR5Q291bnQgPSBnZXRTbG93UGVuYWx0eUNvdW50KHRoaXMuYW5zd2Vycyk7XG4gICAgY29uc3Qgc3RhdHNCbG9jayA9IG5ldyBTdGF0c0Jsb2NrVmlldyh0aGlzLmFuc3dlcnMpO1xuICAgIHJldHVybiBgPHNlY3Rpb24gY2xhc3M9XCJyZXN1bHRcIj5cbiAgICAgIDxoMiBjbGFzcz1cInJlc3VsdF9fdGl0bGUgcmVzdWx0X190aXRsZS0tc2luZ2xlXCI+JHsoaXNXaW4pID8gc2NvcmUgKyBgINC+0YfQutC+0LIuINCd0LXQv9C70L7RhdC+IWAgOiBg0J/QvtGA0LDQttC10L3QuNC1IWAgfTwvaDI+XG4gICAgICA8dGFibGUgY2xhc3M9XCJyZXN1bHRfX3RhYmxlIHJlc3VsdF9fdGFibGUtLXNpbmdsZVwiPlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRkIGNvbHNwYW49XCIyXCI+XG4gICAgICAgICAgICAke3N0YXRzQmxvY2sudGVtcGxhdGV9XG4gICAgICAgICAgPC90ZD5cbiAgICAgICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX3BvaW50c1wiPsOXIDEwMDwvdGQ+XG4gICAgICAgICAgPHRkIGNsYXNzPVwicmVzdWx0X190b3RhbFwiPiR7KGlzV2luKSA/IHJpZ2h0QW5zd2Vyc0NvdW50ICogMTAwIDogYEZhaWxgIH08L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgICAkeyhzcGVlZEJvbnVzQ291bnQpID8gU3RhdHNTaW5nbGVWaWV3LmdldFNwZWVkQm9udXNDb250ZW50KHNwZWVkQm9udXNDb3VudCkgOiBgYH1cbiAgICAgICAgJHsodGhpcy5saXZlcykgPyBTdGF0c1NpbmdsZVZpZXcuZ2V0TGl2ZXNCb251c0NvbnRlbnQodGhpcy5saXZlcykgOiBgYH1cbiAgICAgICAgJHsoc2xvd1BlbmFsdHlDb3VudCkgPyBTdGF0c1NpbmdsZVZpZXcuZ2V0U2xvd1BlbmFsdHlDb250ZW50KHNsb3dQZW5hbHR5Q291bnQpIDogYGB9XG4gICAgICA8L3RhYmxlPlxuICAgIDwvc2VjdGlvbj5gO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjbWFpbmApO1xuICAgIGNvbnN0IG9sZEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBzZWN0aW9uLnJlc3VsdGApO1xuICAgIHBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQob2xkRWxlbWVudCk7XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgc3RhdGljIGdldFNwZWVkQm9udXNDb250ZW50KHNwZWVkQm9udXNDb3VudCkge1xuICAgIHJldHVybiBgPHRyPlxuICAgICAgPHRkPjwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX2V4dHJhXCI+0JHQvtC90YPRgSDQt9CwINGB0LrQvtGA0L7RgdGC0Yw6PC90ZD5cbiAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fZXh0cmFcIj4ke3NwZWVkQm9udXNDb3VudH0gPHNwYW4gY2xhc3M9XCJzdGF0c19fcmVzdWx0IHN0YXRzX19yZXN1bHQtLWZhc3RcIj48L3NwYW4+PC90ZD5cbiAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fcG9pbnRzXCI+w5cgNTA8L3RkPlxuICAgICAgPHRkIGNsYXNzPVwicmVzdWx0X190b3RhbFwiPiR7c3BlZWRCb251c0NvdW50ICogNTB9PC90ZD5cbiAgICA8L3RyPmA7XG4gIH1cblxuICBzdGF0aWMgZ2V0TGl2ZXNCb251c0NvbnRlbnQobGl2ZXMpIHtcbiAgICByZXR1cm4gYDx0cj5cbiAgICAgIDx0ZD48L3RkPlxuICAgICAgPHRkIGNsYXNzPVwicmVzdWx0X19leHRyYVwiPtCR0L7QvdGD0YEg0LfQsCDQttC40LfQvdC4OjwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX2V4dHJhXCI+JHtsaXZlc30gPHNwYW4gY2xhc3M9XCJzdGF0c19fcmVzdWx0IHN0YXRzX19yZXN1bHQtLWFsaXZlXCI+PC9zcGFuPjwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX3BvaW50c1wiPsOXIDUwPC90ZD5cbiAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fdG90YWxcIj4ke2xpdmVzICogNTB9PC90ZD5cbiAgICA8L3RyPmA7XG4gIH1cblxuICBzdGF0aWMgZ2V0U2xvd1BlbmFsdHlDb250ZW50KHNsb3dQZW5hbHR5Q291bnQpIHtcbiAgICByZXR1cm4gYDx0cj5cbiAgICAgIDx0ZD48L3RkPlxuICAgICAgPHRkIGNsYXNzPVwicmVzdWx0X19leHRyYVwiPtCo0YLRgNCw0YQg0LfQsCDQvNC10LTQu9C40YLQtdC70YzQvdC+0YHRgtGMOjwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX2V4dHJhXCI+JHtzbG93UGVuYWx0eUNvdW50fSA8c3BhbiBjbGFzcz1cInN0YXRzX19yZXN1bHQgc3RhdHNfX3Jlc3VsdC0tc2xvd1wiPjwvc3Bhbj48L3RkPlxuICAgICAgPHRkIGNsYXNzPVwicmVzdWx0X19wb2ludHNcIj7DlyA1MDwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX3RvdGFsXCI+LSR7c2xvd1BlbmFsdHlDb3VudCAqIDUwfTwvdGQ+XG4gICAgPC90cj5gO1xuICB9XG5cbn1cblxuLy8gIGZvciAobGV0IGkgPSAwOyBpIDwgYW5zd2Vycy5sZW5ndGg7IGkrKykge1xuLy8gICAgcmVzdWx0ICs9IGA8dGFibGUgY2xhc3M9XCJyZXN1bHRfX3RhYmxlXCI+XG4vLyAgICAgIDx0cj5cbi8vICAgICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX251bWJlclwiPiR7aSArIDF9LjwvdGQ+XG4vLyAgICAgICAgPHRkIGNvbHNwYW49XCIyXCI+XG4vLyAgICAgICAgICAke2dldFN0YXRzSFRNTFN0cmluZyhhbnN3ZXJzKX1cbi8vICAgICAgICA8L3RkPlxuLy8gICAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fcG9pbnRzXCI+w5cgMTAwPC90ZD5cbi8vICAgICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX3RvdGFsXCI+JHsoaXNXaW4pID8gZ2V0U2NvcmUoYW5zd2VycywgbGl2ZXMpIDogYEZhaWwhYCB9PC90ZD5cbi8vICAgICAgPC90cj5cbi8vICAgICAgJHtnZXRTcGVlZEJvbnVzKCl9XG4vLyAgICAgICR7Z2V0TGl2ZXNCb251cygpfVxuLy8gICAgICAke2dldFNsb3dQZW5hbHR5KCl9XG4vLyAgICAgIDx0cj5cbi8vICAgICAgICA8dGQgY29sc3Bhbj1cIjVcIiBjbGFzcz1cInJlc3VsdF9fdG90YWwgIHJlc3VsdF9fdG90YWwtLWZpbmFsXCI+JHsoaXNXaW4pID8gZ2V0U2NvcmUoYW5zd2VycywgbGl2ZXMpIDogYEZhaWwhYCB9PC90ZD5cbi8vICAgICAgPC90cj5cbi8vICAgIDwvdGFibGU+YDtcbi8vICB9XG4iLCJpbXBvcnQgQWJzdHJhY3RTY3JlZW4gZnJvbSAnLi4vYWJzdHJhY3Qtc2NyZWVuLmpzJztcblxuaW1wb3J0IFN0YXRzU2NyZWVuVmlldyBmcm9tICcuL3N0YXRzLXNjcmVlbi12aWV3LmpzJztcbmltcG9ydCBTdGF0c1NpbmdsZVZpZXcgZnJvbSAnLi9zdGF0cy1zaW5nbGUtdmlldy5qcyc7XG5pbXBvcnQgQmFja0Fycm93VmlldyBmcm9tICcuLi91dGlsLXZpZXdzL2JhY2stYXJyb3ctdmlldy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YXRzU2NyZWVuIGV4dGVuZHMgQWJzdHJhY3RTY3JlZW4ge1xuXG4gIGNvbnN0cnVjdG9yKGdhbWVNb2RlbCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5nYW1lTW9kZWwgPSBnYW1lTW9kZWw7XG4gICAgdGhpcy52aWV3ID0gbmV3IFN0YXRzU2NyZWVuVmlldygpO1xuICB9XG5cbiAgX29uU2NyZWVuU2hvdygpIHtcbiAgICBjb25zdCBzdGF0c1NpbmdsZUJsb2NrID0gbmV3IFN0YXRzU2luZ2xlVmlldyh0aGlzLmdhbWVNb2RlbC5hbnN3ZXJzLCB0aGlzLmdhbWVNb2RlbC5saXZlcyk7XG4gICAgY29uc3QgYmFja0Fycm93ID0gbmV3IEJhY2tBcnJvd1ZpZXcoKTtcbiAgICBjb25zdCByZXN0YXJ0R2FtZSA9IHRoaXMuX3Jlc3RhcnRHYW1lLmJpbmQodGhpcyk7XG5cbiAgICBzdGF0c1NpbmdsZUJsb2NrLnJlbmRlcigpO1xuICAgIGJhY2tBcnJvdy5yZW5kZXIoKTtcblxuICAgIGJhY2tBcnJvdy5iaW5kKHJlc3RhcnRHYW1lKTtcbiAgfVxufVxuIiwiaW1wb3J0IEdhbWVNb2RlbCBmcm9tICcuL2dhbWUtbW9kZWwvZ2FtZS1tb2RlbC5qcyc7XG5cbmltcG9ydCBXZWxjb21lU2NyZWVuIGZyb20gJy4vd2VsY29tZS1zY3JlZW4vd2VsY29tZS1zY3JlZW4uanMnO1xuaW1wb3J0IEdyZWV0aW5nU2NyZWVuIGZyb20gJy4vZ3JlZXRpbmctc2NyZWVuL2dyZWV0aW5nLXNjcmVlbi5qcyc7XG5pbXBvcnQgUnVsZXNTY3JlZW4gZnJvbSAnLi9ydWxlcy1zY3JlZW4vcnVsZXMtc2NyZWVuLmpzJztcbmltcG9ydCBHYW1lU2NyZWVuIGZyb20gJy4vZ2FtZS1zY3JlZW4vZ2FtZS1zY3JlZW4uanMnO1xuaW1wb3J0IFN0YXRzU2NyZWVuIGZyb20gJy4vc3RhdHMtc2NyZWVuL3N0YXRzLXNjcmVlbi5qcyc7XG5cbmNvbnN0IGdhbWVNb2RlbCA9IG5ldyBHYW1lTW9kZWwoKTtcbmNvbnN0IHdlbGNvbWVTY3JlZW4gPSBuZXcgV2VsY29tZVNjcmVlbigpO1xuY29uc3QgZ3JlZXRpbmdTY3JlZW4gPSBuZXcgR3JlZXRpbmdTY3JlZW4oKTtcbmNvbnN0IHJ1bGVzU2NyZWVuID0gbmV3IFJ1bGVzU2NyZWVuKGdhbWVNb2RlbCk7XG5jb25zdCBzdGF0c1NjcmVlbiA9IG5ldyBTdGF0c1NjcmVlbihnYW1lTW9kZWwpO1xuY29uc3QgZ2FtZVNjcmVlbnMgPSBbXTtcbmdhbWVNb2RlbC5nYW1lcy5mb3JFYWNoKChnYW1lKSA9PiB7XG4gIGdhbWVTY3JlZW5zLnB1c2gobmV3IEdhbWVTY3JlZW4oZ2FtZU1vZGVsLCBnYW1lKSk7XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXBwbGljYXRpb24ge1xuXG4gIHN0YXRpYyBpbml0KCkge1xuICAgIHdlbGNvbWVTY3JlZW4ubmV4dFNjcmVlbiA9IGdyZWV0aW5nU2NyZWVuO1xuICAgIGdyZWV0aW5nU2NyZWVuLm5leHRTY3JlZW4gPSBydWxlc1NjcmVlbjtcbiAgICBydWxlc1NjcmVlbi5uZXh0U2NyZWVuID0gZ2FtZVNjcmVlbnNbMF07XG4gICAgcnVsZXNTY3JlZW4uc3RhcnRTY3JlZW4gPSB3ZWxjb21lU2NyZWVuO1xuXG4gICAgZ2FtZVNjcmVlbnMuZm9yRWFjaCgoZ2FtZVNjcmVlbiwgaW5kZXgpID0+IHtcbiAgICAgIGdhbWVTY3JlZW4ubmV4dFNjcmVlbiA9IGdhbWVTY3JlZW5zW2luZGV4ICsgMV07XG4gICAgICBnYW1lU2NyZWVuLnN0YXJ0U2NyZWVuID0gd2VsY29tZVNjcmVlbjtcbiAgICAgIGdhbWVTY3JlZW4uZW5kU2NyZWVuID0gc3RhdHNTY3JlZW47XG4gICAgfSk7XG5cbiAgICBnYW1lU2NyZWVuc1tnYW1lU2NyZWVucy5sZW5ndGggLSAxXS5uZXh0U2NyZWVuID0gc3RhdHNTY3JlZW47XG4gICAgc3RhdHNTY3JlZW4uc3RhcnRTY3JlZW4gPSB3ZWxjb21lU2NyZWVuO1xuICB9XG5cbiAgc3RhdGljIHN0YXJ0KCkge1xuICAgIHdlbGNvbWVTY3JlZW4uc2hvdygpO1xuICB9XG59XG4iXSwibmFtZXMiOlsiSW50cm9TY3JlZW5WaWV3Il0sIm1hcHBpbmdzIjoiOzs7RUFBQSxNQUFNLE1BQU0sR0FBRztFQUNmLEVBQUUsV0FBVyxFQUFFLEVBQUU7RUFDakIsRUFBRSxXQUFXLEVBQUUsQ0FBQztFQUNoQixFQUFFLGNBQWMsRUFBRSxLQUFLO0VBQ3ZCLEVBQUUsU0FBUyxFQUFFO0VBQ2IsSUFBSSxHQUFHLEVBQUUsQ0FBQztFQUNWLElBQUksR0FBRyxFQUFFLENBQUM7RUFDVixJQUFJLEtBQUssRUFBRSxDQUFDO0VBQ1osR0FBRztFQUNILENBQUM7O0VDUGMsTUFBTSxTQUFTLENBQUM7RUFDL0IsRUFBRSxXQUFXLEdBQUc7RUFDaEIsSUFBSSxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxDQUFDO0VBQzFCLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDO0VBQ3JDLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7RUFDdkIsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztFQUMxQyxJQUFJLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0VBQzdCLEdBQUc7QUFDSDtFQUNBLEVBQUUsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFO0VBQ3ZCLElBQUksSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7RUFDNUIsR0FBRztBQUNIO0VBQ0EsRUFBRSxJQUFJLEtBQUssR0FBRztFQUNkLElBQUksT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0VBQ3ZCLEdBQUc7QUFDSDtFQUNBLEVBQUUsSUFBSSxPQUFPLEdBQUc7RUFDaEIsSUFBSSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7RUFDekIsR0FBRztBQUNIO0VBQ0EsRUFBRSxJQUFJLEtBQUssR0FBRztFQUNkLElBQUksT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0VBQ3ZCLEdBQUc7QUFDSDtFQUNBLEVBQUUsSUFBSSxVQUFVLEdBQUc7RUFDbkIsSUFBSSxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7RUFDNUIsR0FBRztBQUNIO0VBQ0EsRUFBRSxLQUFLLEdBQUc7RUFDVixJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQztFQUNyQyxJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO0VBQ3ZCLElBQUksSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7RUFDN0IsR0FBRztBQUNIO0VBQ0EsRUFBRSxTQUFTLENBQUMsTUFBTSxFQUFFO0VBQ3BCLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FB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
