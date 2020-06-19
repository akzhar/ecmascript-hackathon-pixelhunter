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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGljYXRpb24uanMiLCJzb3VyY2VzIjpbInNyYy9qcy9jb25maWcuanMiLCJzcmMvanMvZ2FtZS1tb2RlbC9nYW1lLW1vZGVsLmpzIiwic3JjL2pzL2Fic3RyYWN0LXZpZXcuanMiLCJzcmMvanMvdXRpbC12aWV3cy9jb25maXJtLW1vZGFsLXZpZXcuanMiLCJzcmMvanMvYWJzdHJhY3Qtc2NyZWVuLmpzIiwic3JjL2pzL3dlbGNvbWUtc2NyZWVuL3dlbGNvbWUtc2NyZWVuLXZpZXcuanMiLCJzcmMvanMvd2VsY29tZS1zY3JlZW4vYXN0ZXJpc2stdmlldy5qcyIsInNyYy9qcy93ZWxjb21lLXNjcmVlbi93ZWxjb21lLXNjcmVlbi5qcyIsInNyYy9qcy9ncmVldGluZy1zY3JlZW4vZ3JlZXRpbmctc2NyZWVuLXZpZXcuanMiLCJzcmMvanMvZ3JlZXRpbmctc2NyZWVuL3N0YXJ0LWFycm93LXZpZXcuanMiLCJzcmMvanMvZ3JlZXRpbmctc2NyZWVuL2dyZWV0aW5nLXNjcmVlbi5qcyIsInNyYy9qcy9ydWxlcy1zY3JlZW4vcnVsZXMtc2NyZWVuLXZpZXcuanMiLCJzcmMvanMvcnVsZXMtc2NyZWVuL25hbWUtaW5wdXQtdmlldy5qcyIsInNyYy9qcy9ydWxlcy1zY3JlZW4vc3RhcnQtYnV0dG9uLXZpZXcuanMiLCJzcmMvanMvdXRpbC12aWV3cy9iYWNrLWFycm93LXZpZXcuanMiLCJzcmMvanMvcnVsZXMtc2NyZWVuL3J1bGVzLXNjcmVlbi5qcyIsInNyYy9qcy9nYW1lLXNjcmVlbi9nYW1lLXNjcmVlbi12aWV3LmpzIiwic3JjL2pzL2dhbWUtc2NyZWVuL3RpbWVyLWJsb2NrLXZpZXcuanMiLCJzcmMvanMvZ2FtZS1zY3JlZW4vbGl2ZXMtYmxvY2stdmlldy5qcyIsInNyYy9qcy91dGlsLXZpZXdzL3N0YXRzLWJsb2NrLXZpZXcuanMiLCJzcmMvanMvZGVidWcuanMiLCJzcmMvanMvZ2FtZS1zY3JlZW4vYW5zd2VyLXBob3RvLWJ1dHRvbi12aWV3LmpzIiwic3JjL2pzL2dhbWUtc2NyZWVuL2Fuc3dlci1wYWludC1idXR0b24tdmlldy5qcyIsInNyYy9qcy9nYW1lLXNjcmVlbi9hbnN3ZXItcGFpbnQtb3B0aW9uLXZpZXcuanMiLCJzcmMvanMvcmVzaXplLmpzIiwic3JjL2pzL2dhbWUtc2NyZWVuL2ltYWdlLXZpZXcuanMiLCJzcmMvanMvZ2FtZS1zY3JlZW4vZ2FtZS1zY3JlZW4uanMiLCJzcmMvanMvc3RhdHMtc2NyZWVuL3N0YXRzLXNjcmVlbi12aWV3LmpzIiwic3JjL2pzL3Njb3JlLmpzIiwic3JjL2pzL3N0YXRzLXNjcmVlbi9zdGF0cy1zaW5nbGUtdmlldy5qcyIsInNyYy9qcy9zdGF0cy1zY3JlZW4vc3RhdHMtc2NyZWVuLmpzIiwic3JjL2pzL2FwcGxpY2F0aW9uLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGNvbmZpZyA9IHtcbiAgR0FNRVNfQ09VTlQ6IDEwLFxuICBMSVZFU19DT1VOVDogMyxcbiAgVElNRV9UT19BTlNXRVI6IDMwMDAwLCAvLyAzMCBzZWNcbiAgR0FNRV9UWVBFOiB7XG4gICAgb25lOiAxLFxuICAgIHR3bzogMixcbiAgICB0aHJlZTogM1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjb25maWc7XG4iLCJpbXBvcnQgY29uZmlnIGZyb20gJy4uL2NvbmZpZy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdhbWVNb2RlbCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3BsYXllck5hbWUgPSBgYDtcbiAgICB0aGlzLl9saXZlcyA9IGNvbmZpZy5MSVZFU19DT1VOVDtcbiAgICB0aGlzLl9hbnN3ZXJzID0gW107XG4gICAgdGhpcy5fZ2FtZXMgPSBHYW1lTW9kZWwuZ2V0TmV3R2FtZXMoKTtcbiAgICB0aGlzLl9pc0dhbWVPdmVyID0gZmFsc2U7XG4gIH1cblxuICBzZXQgcGxheWVyTmFtZShuYW1lKSB7XG4gICAgdGhpcy5fcGxheWVyTmFtZSA9IG5hbWU7XG4gIH1cblxuICBnZXQgbGl2ZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xpdmVzO1xuICB9XG5cbiAgZ2V0IGFuc3dlcnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2Fuc3dlcnM7XG4gIH1cblxuICBnZXQgZ2FtZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dhbWVzO1xuICB9XG5cbiAgZ2V0IGlzR2FtZU92ZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzR2FtZU92ZXI7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB0aGlzLl9saXZlcyA9IGNvbmZpZy5MSVZFU19DT1VOVDtcbiAgICB0aGlzLl9hbnN3ZXJzID0gW107XG4gICAgdGhpcy5faXNHYW1lT3ZlciA9IGZhbHNlO1xuICB9XG5cbiAgYWRkQW5zd2VyKGFuc3dlcikge1xuICAgIHRoaXMuX2Fuc3dlcnMucHVzaChhbnN3ZXIpO1xuICB9XG5cbiAgbWludXNMaXZlKCkge1xuICAgIGlmICh0aGlzLl9saXZlcyA9PT0gMCkge1xuICAgICAgdGhpcy5faXNHYW1lT3ZlciA9IHRydWU7XG4gICAgfVxuICAgIGlmICh0aGlzLl9saXZlcykge1xuICAgICAgdGhpcy5fbGl2ZXMtLTtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgZ2V0TmV3R2FtZXMoKSB7XG4gICAgY29uc3QgZ2FtZXMgPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29uZmlnLkdBTUVTX0NPVU5UOyBpKyspIHtcbiAgICAgIGNvbnN0IGdhbWVUeXBlID0gR2FtZU1vZGVsLmdldFJhbmRvbUdhbWVUeXBlKCk7XG4gICAgICBzd2l0Y2ggKGdhbWVUeXBlKSB7XG4gICAgICAgIGNhc2UgY29uZmlnLkdBTUVfVFlQRS5vbmU6XG4gICAgICAgICAgZ2FtZXMucHVzaChHYW1lTW9kZWwuZ2V0R2FtZVR5cGUxKGkpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBjb25maWcuR0FNRV9UWVBFLnR3bzpcbiAgICAgICAgICBnYW1lcy5wdXNoKEdhbWVNb2RlbC5nZXRHYW1lVHlwZTIoaSkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGNvbmZpZy5HQU1FX1RZUEUudGhyZWU6XG4gICAgICAgICAgZ2FtZXMucHVzaChHYW1lTW9kZWwuZ2V0R2FtZVR5cGUzKGkpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZ2FtZXM7XG4gIH1cblxuICBzdGF0aWMgZ2V0UmFuZG9tR2FtZVR5cGUoKSB7XG4gICAgcmV0dXJuIE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIChjb25maWcuR0FNRV9UWVBFLnRocmVlIC0gY29uZmlnLkdBTUVfVFlQRS5vbmUpICsgY29uZmlnLkdBTUVfVFlQRS5vbmUpO1xuICB9XG5cbiAgc3RhdGljIGdldEdhbWVUeXBlMShpbmRleCkge1xuICAgIC8vIDEg0LjQt9C+0LHRgNCw0LbQtdC90LjQtVxuICAgIC8vINCyINGN0YLQvtC8INGA0LXQttC40LzQtSDQv9C+0LvRjNC30L7QstCw0YLQtdC70Ywg0LTQvtC70LbQtdC9INC+0L/RgNC10LTQtdC70LjRgtGMINC60LDRgNGC0LjQvdCwINGN0YLQviDQuNC70Lgg0YTQvtGC0L7Qs9GA0LDRhNC40Y9cbiAgICByZXR1cm4ge1xuICAgICAgZ2FtZUluZGV4OiBpbmRleCxcbiAgICAgIGdhbWVUeXBlOiBjb25maWcuR0FNRV9UWVBFLm9uZSxcbiAgICAgIGZyYW1lU2l6ZToge3dpZHRoOiA3MDUsIGhlaWdodDogNDU1fSxcbiAgICAgIHRhc2s6IGDQo9Cz0LDQtNCw0LksINGE0L7RgtC+INC40LvQuCDRgNC40YHRg9C90L7Quj9gLFxuICAgICAgcXVlc3Rpb25zOlxuICAgICAgW1xuICAgICAgICB7XG4gICAgICAgICAgaW1nOlxuICAgICAgICAgIFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgc3JjOiBgaHR0cHM6Ly9rNDIua24zLm5ldC9EMkYwMzcwRDYuanBnYCxcbiAgICAgICAgICAgICAgc2l6ZToge3dpZHRoOiA0NjgsIGhlaWdodDogMzU0fVxuICAgICAgICAgICAgfVxuICAgICAgICAgIF0sXG4gICAgICAgICAgY29ycmVjdEFuc3dlcjogYHBhaW50YFxuICAgICAgICB9XG4gICAgICBdXG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyBnZXRHYW1lVHlwZTIoaW5kZXgpIHtcbiAgICAvLyAyINC40LfQvtCx0YDQsNC20LXQvdC40Y9cbiAgICAvLyDQtNC70Y8g0LrQsNC20LTQvtCz0L4g0LjQtyDQuNC30L7QsdGA0LDQttC10L3QuNC5INC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRjCDQtNC+0LvQttC10L0g0YPQutCw0LfQsNGC0Ywg0LrQsNGA0YLQuNC90LAg0Y3RgtC+INC40LvQuCDRhNC+0YLQvtCz0YDQsNGE0LjRj1xuICAgIHJldHVybiB7XG4gICAgICBnYW1lSW5kZXg6IGluZGV4LFxuICAgICAgZ2FtZVR5cGU6IGNvbmZpZy5HQU1FX1RZUEUudHdvLFxuICAgICAgZnJhbWVTaXplOiB7d2lkdGg6IDQ2OCwgaGVpZ2h0OiA0NTh9LFxuICAgICAgdGFzazogYNCj0LPQsNC00LDQudGC0LUg0LTQu9GPINC60LDQttC00L7Qs9C+INC40LfQvtCx0YDQsNC20LXQvdC40Y8g0YTQvtGC0L4g0LjQu9C4INGA0LjRgdGD0L3QvtC6P2AsXG4gICAgICBxdWVzdGlvbnM6XG4gICAgICBbXG4gICAgICAgIHtcbiAgICAgICAgICBpbWc6XG4gICAgICAgICAgW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBzcmM6IGBodHRwczovL2s0Mi5rbjMubmV0L0NGNDI2MDlDOC5qcGdgLFxuICAgICAgICAgICAgICBzaXplOiB7d2lkdGg6IDYwMCwgaGVpZ2h0OiA4MzF9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgXSxcbiAgICAgICAgICBjb3JyZWN0QW5zd2VyOiBgcGFpbnRgXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBpbWc6XG4gICAgICAgICAgW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBzcmM6IGBodHRwOi8vaS5pbWd1ci5jb20vMUtlZ1dQei5qcGdgLFxuICAgICAgICAgICAgICBzaXplOiB7d2lkdGg6IDEwODAsIGhlaWdodDogNzIwfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIF0sXG4gICAgICAgICAgY29ycmVjdEFuc3dlcjogYHBob3RvYFxuICAgICAgICB9XG4gICAgICBdXG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyBnZXRHYW1lVHlwZTMoaW5kZXgpIHtcbiAgICAvLyAzINC40LfQvtCx0YDQsNC20LXQvdC40Y9cbiAgICAvLyDQv9C+0LvRjNC30L7QstCw0YLQtdC70Y4g0L3Rg9C20L3QviDQstGL0LHRgNCw0YLRjCDQvtC00L3QviDigJQg0LvQuNCx0L4g0L3Rg9C20L3QviDQstGL0LHRgNCw0YLRjCDQtdC00LjQvdGB0YLQstC10L3QvdGD0Y4g0YTQvtGC0L7Qs9GA0LDRhNC40Y4sINC70LjQsdC+INC10LTQuNC90YHRgtCy0LXQvdC90YPRjiDQutCw0YDRgtC40L3Rg1xuICAgIHJldHVybiB7XG4gICAgICBnYW1lSW5kZXg6IGluZGV4LFxuICAgICAgZ2FtZVR5cGU6IGNvbmZpZy5HQU1FX1RZUEUudGhyZWUsXG4gICAgICBmcmFtZVNpemU6IHt3aWR0aDogMzA0LCBoZWlnaHQ6IDQ1NX0sXG4gICAgICB0YXNrOiBg0J3QsNC50LTQuNGC0LUg0YDQuNGB0YPQvdC+0Log0YHRgNC10LTQuCDQuNC30L7QsdGA0LDQttC10L3QuNC5YCxcbiAgICAgIHF1ZXN0aW9uczogW1xuICAgICAgICB7XG4gICAgICAgICAgaW1nOlxuICAgICAgICAgIFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgc3JjOiBgaHR0cHM6Ly9rMzIua24zLm5ldC81QzcwNjBFQzUuanBnYCxcbiAgICAgICAgICAgICAgc2l6ZToge3dpZHRoOiAxMjAwLCBoZWlnaHQ6IDkwMH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHNyYzogYGh0dHBzOi8vaS5pbWd1ci5jb20vRGlITTVaYi5qcGdgLFxuICAgICAgICAgICAgICBzaXplOiB7d2lkdGg6IDEyNjQsIGhlaWdodDogMTg2NH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHNyYzogYGh0dHA6Ly9pLmltZ3VyLmNvbS9ES1IxSHRCLmpwZ2AsXG4gICAgICAgICAgICAgIHNpemU6IHt3aWR0aDogMTEyMCwgaGVpZ2h0OiAyOTY1fVxuICAgICAgICAgICAgfVxuICAgICAgICAgIF0sXG4gICAgICAgICAgY29ycmVjdEFuc3dlcjogMFxuICAgICAgICB9XG4gICAgICBdXG4gICAgfTtcbiAgfVxufVxuIiwiY29uc3QgZWxlbWVudHMgPSB7fTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgLy8g0LLQvtC30LLRgNCw0YnQsNC10YIg0YHRgtGA0L7QutGDLCDRgdC+0LTQtdGA0LbQsNGJ0YPRjiDRgNCw0LfQvNC10YLQutGDXG4gIGdldCB0ZW1wbGF0ZSgpIHt9XG5cbiAgLy8g0YHQvtC30LTQsNC10YIg0Lgg0LLQvtC30LLRgNCw0YnQsNC10YIgRE9NLdGN0LvQtdC80LXQvdGCINC90LAg0L7RgdC90L7QstC1INGI0LDQsdC70L7QvdCwXG4gIC8vINC00L7Qu9C20LXQvSDRgdC+0LfQtNCw0LLQsNGC0YwgRE9NLdGN0LvQtdC80LXQvdGCINGBINC/0L7QvNC+0YnRjNGOINC80LXRgtC+0LTQsCByZW5kZXIsINC00L7QsdCw0LLQu9GP0YLRjCDQtdC80YMg0L7QsdGA0LDQsdC+0YLRh9C40LrQuCwg0YEg0L/QvtC80L7RidGM0Y4g0LzQtdGC0L7QtNCwIGJpbmQg0Lgg0LLQvtC30LLRgNCw0YnQsNGC0Ywg0YHQvtC30LTQsNC90L3Ri9C5INGN0LvQtdC80LXQvdGCXG4gIC8vINCc0LXRgtC+0LQg0LTQvtC70LbQtdC9INC40YHQv9C+0LvRjNC30L7QstCw0YLRjCDQu9C10L3QuNCy0YvQtSDQstGL0YfQuNGB0LvQtdC90LjRjyDigJQg0Y3Qu9C10LzQtdC90YIg0LTQvtC70LbQtdC9INGB0L7Qt9C00LDQstCw0YLRjNGB0Y8g0L/RgNC4INC/0LXRgNCy0L7QvCDQvtCx0YDQsNGJ0LXQvdC40Lgg0Log0LPQtdGC0YLQtdGAINGBINC/0L7QvNC+0YnRjNGOINC80LXRgtC+0LTQsCByZW5kZXIsINC00L7Qu9C20L3RiyDQtNC+0LHQsNCy0LvRj9GC0YzRgdGPINC+0LHRgNCw0LHQvtGC0YfQuNC60LggKNC80LXRgtC+0LQgYmluZCkuXG4gIC8vINCf0YDQuCDQv9C+0YHQu9C10LTRg9GO0YnQuNGFINC+0LHRgNCw0YnQtdC90LjRj9GFINC00L7Qu9C20LXQvSDQuNGB0L/QvtC70YzQt9C+0LLQsNGC0YzRgdGPINGN0LvQtdC80LXQvdGCLCDRgdC+0LfQtNCw0L3QvdGL0Lkg0L/RgNC4INC/0LXRgNCy0L7QvCDQstGL0LfQvtCy0LUg0LPQtdGC0YLQtdGA0LAuXG4gIGdldCBlbGVtZW50KCkge1xuICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy50ZW1wbGF0ZTtcbiAgICAvLyBpZiAoIWVsZW1lbnRzLmhhc093blByb3BlcnR5KHRlbXBsYXRlKSkge1xuICAgICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChgZGl2YCk7XG4gICAgICBkaXYuaW5uZXJIVE1MID0gdGVtcGxhdGU7XG4gICAgICBjb25zdCBlbGVtID0gZGl2LmZpcnN0Q2hpbGQ7XG4gICAgICBlbGVtZW50c1t0ZW1wbGF0ZV0gPSBlbGVtO1xuICAgICAgcmV0dXJuIGVsZW07XG4gICAgLy8gfSBlbHNlIHtcbiAgICAgIC8vIHJldHVybiBlbGVtZW50c1t0ZW1wbGF0ZV07XG4gICAgLy8gfVxuICB9XG5cbiAgLy8g0L7RgtGA0LjRgdC+0LLRi9Cy0LDQtdGCIERPTS3RjdC70LXQvNC10L3Rgiwg0LTQvtCx0LDQstC70Y/QtdGCINC90LXQvtCx0YXQvtC00LjQvNGL0LUg0L7QsdGA0LDQsdC+0YLRh9C40LrQuFxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYG1haW4uY2VudHJhbGApO1xuICAgIGNvbnN0IG9sZEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjbWFpbmApO1xuICAgIHBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQob2xkRWxlbWVudCk7XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgLy8g0LTQvtCx0LDQstC70Y/QtdGCINC+0LHRgNCw0LHQvtGC0YfQuNC60Lgg0YHQvtCx0YvRgtC40LlcbiAgLy8g0JzQtdGC0L7QtCDQv9C+INGD0LzQvtC70YfQsNC90LjRjiDQvdC40YfQtdCz0L4g0L3QtSDQtNC10LvQsNC10YJcbiAgLy8g0JXRgdC70Lgg0L3Rg9C20L3QviDQvtCx0YDQsNCx0L7RgtCw0YLRjCDQutCw0LrQvtC1LdGC0L4g0YHQvtCx0YvRgtC40LUsINGC0L4g0Y3RgtC+0YIg0LzQtdGC0L7QtCDQtNC+0LvQttC10L0g0LHRi9GC0Ywg0L/QtdGA0LXQvtC/0YDQtdC00LXQu9GR0L0g0LIg0L3QsNGB0LvQtdC00L3QuNC60LUg0YEg0L3QtdC+0LHRhdC+0LTQuNC80L7QuSDQu9C+0LPQuNC60L7QuVxuICBiaW5kKCkge31cbn1cbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29uZmlybU1vZGFsVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gYDxzZWN0aW9uIGNsYXNzPVwibW9kYWxcIj5cbiAgICAgICAgICAgICAgPGZvcm0gY2xhc3M9XCJtb2RhbF9faW5uZXJcIj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwibW9kYWxfX2Nsb3NlXCIgdHlwZT1cImJ1dHRvblwiPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ2aXN1YWxseS1oaWRkZW5cIj7Ql9Cw0LrRgNGL0YLRjDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8aDIgY2xhc3M9XCJtb2RhbF9fdGl0bGVcIj7Qn9C+0LTRgtCy0LXRgNC20LTQtdC90LjQtTwvaDI+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJtb2RhbF9fdGV4dFwiPtCS0Ysg0YPQstC10YDQtdC90Ysg0YfRgtC+INGF0L7RgtC40YLQtSDQvdCw0YfQsNGC0Ywg0LjQs9GA0YMg0LfQsNC90L7QstC+PzwvcD5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWxfX2J1dHRvbi13cmFwcGVyXCI+XG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwibW9kYWxfX2J0biBtb2RhbF9fYnRuLS1va1wiPtCe0Lo8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJtb2RhbF9fYnRuIG1vZGFsX19idG4tLWNhbmNlbFwiPtCe0YLQvNC10L3QsDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICAgICA8L3NlY3Rpb24+YDtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI21haW5gKTtcbiAgICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XG4gIH1cblxuICBiaW5kKGNiKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCNtYWluYCk7XG4gICAgY29uc3QgbW9kYWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAubW9kYWxgKTtcbiAgICBjb25zdCBjbG9zZUJ0biA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoYC5tb2RhbF9fY2xvc2VgKTtcbiAgICBjb25zdCBjYW5jZWxCdG4gPSBtb2RhbC5xdWVyeVNlbGVjdG9yKGAubW9kYWxfX2J0bi0tY2FuY2VsYCk7XG4gICAgY29uc3Qgb2tCdG4gPSBtb2RhbC5xdWVyeVNlbGVjdG9yKGAubW9kYWxfX2J0bi0tb2tgKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGBrZXlkb3duYCwgKGV2dCkgPT4ge1xuICAgICAgaWYgKGV2dC5rZXlDb2RlID09PSAyNykge1xuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgcGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChtb2RhbCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgY2xvc2VCdG4uYWRkRXZlbnRMaXN0ZW5lcihgY2xpY2tgLCAoZXZ0KSA9PiB7XG4gICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQobW9kYWwpO1xuICAgIH0pO1xuICAgIGNhbmNlbEJ0bi5hZGRFdmVudExpc3RlbmVyKGBjbGlja2AsIChldnQpID0+IHtcbiAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgcGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChtb2RhbCk7XG4gICAgfSk7XG4gICAgb2tCdG4uYWRkRXZlbnRMaXN0ZW5lcihgY2xpY2tgLCAoZXZ0KSA9PiB7XG4gICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGNiKCk7XG4gICAgfSk7XG4gIH1cbn1cbiIsImltcG9ydCBDb25maXJtTW9kYWxWaWV3IGZyb20gJy4vdXRpbC12aWV3cy9jb25maXJtLW1vZGFsLXZpZXcuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBYnN0cmFjdFNjcmVlbiB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5nYW1lTW9kZWwgPSBudWxsO1xuICAgIHRoaXMuZ2FtZSA9IG51bGw7XG4gICAgdGhpcy52aWV3ID0gbnVsbDtcbiAgICB0aGlzLnRpbWVyID0gbnVsbDtcbiAgICB0aGlzLnN0YXJ0U2NyZWVuID0gbnVsbDtcbiAgICB0aGlzLm5leHRTY3JlZW4gPSBudWxsO1xuICAgIHRoaXMuZW5kU2NyZWVuID0gbnVsbDtcbiAgfVxuXG4gIC8vINC80LXRgtC+0LQg0L/QvtC60LDQt9CwINGN0LrRgNCw0L3QsCDQvtGC0YDQuNGB0L7QstGL0LLQsNC10YIg0Y3QutGA0LDQvSDQuCDQt9Cw0L/Rg9GB0LrQsNC10YIg0LzQtdGC0L7QtCBfb25TY3JlZW5TaG93XG4gIHNob3coKSB7XG4gICAgdGhpcy52aWV3LnJlbmRlcigpO1xuICAgIHRoaXMuX29uU2NyZWVuU2hvdygpO1xuICB9XG5cbiAgLy8g0LzQtdGC0L7QtCDRgNC10LDQu9C40LfRg9C10YIg0LHQuNC30L3QtdGBINC70L7Qs9C40LrRgyDRjdC60YDQsNC90LBcbiAgX29uU2NyZWVuU2hvdygpIHt9XG5cbiAgLy8g0LzQtdGC0L7QtCDQv9C10YDQtdC30LDQv9GD0YHQutCw0LXRgiDQuNCz0YDRg1xuICBfcmVzdGFydEdhbWUoKSB7XG4gICAgY29uc3QgY29uZmlybU1vZGFsID0gbmV3IENvbmZpcm1Nb2RhbFZpZXcoKTtcbiAgICBjb25maXJtTW9kYWwucmVuZGVyKCk7XG4gICAgY29uZmlybU1vZGFsLmJpbmQoKCkgPT4ge1xuICAgICAgdGhpcy5nYW1lTW9kZWwucmVzZXQoKTtcbiAgICAgIHRoaXMuc3RhcnRTY3JlZW4uc2hvdygpO1xuICAgIH0pO1xuICB9XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdlbGNvbWVTY3JlZW5WaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPGRpdiBpZD1cIm1haW5cIiBjbGFzcz1cImNlbnRyYWxfX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgPHNlY3Rpb24gaWQ9XCJpbnRyb1wiIGNsYXNzPVwiaW50cm9cIj5cbiAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIFRPIEFTVEVSSVNLIC0tPlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwiaW50cm9fX21vdHRvXCI+PHN1cD4qPC9zdXA+INCt0YLQviDQvdC1INGE0L7RgtC+LiDQrdGC0L4g0YDQuNGB0YPQvdC+0Log0LzQsNGB0LvQvtC8INC90LjQtNC10YDQu9Cw0L3QtNGB0LrQvtCz0L4g0YXRg9C00L7QttC90LjQutCwLdGE0L7RgtC+0YDQtdCw0LvQuNGB0YLQsCBUamFsZiBTcGFybmFheS48L3A+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImludHJvX190b3AgdG9wXCIgdHlwZT1cImJ1dHRvblwiPlxuICAgICAgICAgICAgICAgICAgPGltZyBzcmM9XCJpbWcvaWNvbi10b3Auc3ZnXCIgd2lkdGg9XCI3MVwiIGhlaWdodD1cIjc5XCIgYWx0PVwi0KLQvtC/INC40LPRgNC+0LrQvtCyXCI+XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgICAgIDwvZGl2PmA7XG4gIH1cbn1cbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXN0ZXJpc2tWaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPGJ1dHRvbiBjbGFzcz1cImludHJvX19hc3RlcmlzayBhc3Rlcmlza1wiIHR5cGU9XCJidXR0b25cIj48c3BhbiBjbGFzcz1cInZpc3VhbGx5LWhpZGRlblwiPtCf0YDQvtC00L7Qu9C20LjRgtGMPC9zcGFuPio8L2J1dHRvbj5gO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjaW50cm8nKTtcbiAgICBwYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZSh0aGlzLmVsZW1lbnQsIHBhcmVudEVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gIH1cblxuICBiaW5kKGNiKSB7XG4gICAgY29uc3QgYXN0ZXJpc2sgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuaW50cm9fX2FzdGVyaXNrYCk7XG4gICAgYXN0ZXJpc2suYWRkRXZlbnRMaXN0ZW5lcihgY2xpY2tgLCBjYik7XG4gIH1cbn1cbiIsImltcG9ydCBBYnN0cmFjdFNjcmVlbiBmcm9tICcuLi9hYnN0cmFjdC1zY3JlZW4uanMnO1xuXG5pbXBvcnQgSW50cm9TY3JlZW5WaWV3IGZyb20gJy4vd2VsY29tZS1zY3JlZW4tdmlldy5qcyc7XG5pbXBvcnQgQXN0ZXJpc2tWaWV3IGZyb20gJy4vYXN0ZXJpc2stdmlldy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdlbGNvbWVTY3JlZW4gZXh0ZW5kcyBBYnN0cmFjdFNjcmVlbiB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnZpZXcgPSBuZXcgSW50cm9TY3JlZW5WaWV3KCk7XG4gIH1cblxuICBfb25TY3JlZW5TaG93KCkge1xuICAgIGNvbnN0IGFzdGVyaXNrID0gbmV3IEFzdGVyaXNrVmlldygpO1xuICAgIGFzdGVyaXNrLnJlbmRlcigpO1xuICAgIGFzdGVyaXNrLmJpbmQodGhpcy5uZXh0U2NyZWVuLnNob3cuYmluZCh0aGlzLm5leHRTY3JlZW4pKTtcbiAgfVxufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHcmVldGluZ1NjcmVlblZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuIGA8ZGl2IGlkPVwibWFpblwiIGNsYXNzPVwiY2VudHJhbF9fY29udGVudFwiPlxuICAgICAgICAgICAgICA8c2VjdGlvbiBjbGFzcz1cImdyZWV0aW5nIGNlbnRyYWwtLWJsdXJcIj5cbiAgICAgICAgICAgICAgICA8aW1nIGNsYXNzPVwiZ3JlZXRpbmdfX2xvZ29cIiBzcmM9XCJpbWcvbG9nb19waC1iaWcuc3ZnXCIgd2lkdGg9XCIyMDFcIiBoZWlnaHQ9XCI4OVwiIGFsdD1cIlBpeGVsIEh1bnRlclwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJncmVldGluZ19fYXN0ZXJpc2sgYXN0ZXJpc2tcIj48c3BhbiBjbGFzcz1cInZpc3VhbGx5LWhpZGRlblwiPtCvINC/0YDQvtGB0YLQviDQutGA0LDRgdC40LLQsNGPINC30LLRkdC30LTQvtGH0LrQsDwvc3Bhbj4qPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyZWV0aW5nX19jaGFsbGVuZ2VcIj5cbiAgICAgICAgICAgICAgICAgIDxoMyBjbGFzcz1cImdyZWV0aW5nX19jaGFsbGVuZ2UtdGl0bGVcIj7Qm9GD0YfRiNC40LUg0YXRg9C00L7QttC90LjQutC4LdGE0L7RgtC+0YDQtdCw0LvQuNGB0YLRiyDQsdGA0L7RgdCw0Y7RgiDRgtC10LHQtSDQstGL0LfQvtCyITwvaDM+XG4gICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cImdyZWV0aW5nX19jaGFsbGVuZ2UtdGV4dFwiPtCf0YDQsNCy0LjQu9CwINC40LPRgNGLINC/0YDQvtGB0YLRizo8L3A+XG4gICAgICAgICAgICAgICAgICA8dWwgY2xhc3M9XCJncmVldGluZ19fY2hhbGxlbmdlLWxpc3RcIj5cbiAgICAgICAgICAgICAgICAgICAgPGxpPtCd0YPQttC90L4g0L7RgtC70LjRh9C40YLRjCDRgNC40YHRg9C90L7QuiDQvtGCINGE0L7RgtC+0LPRgNCw0YTQuNC4INC4INGB0LTQtdC70LDRgtGMINCy0YvQsdC+0YAuPC9saT5cbiAgICAgICAgICAgICAgICAgICAgPGxpPtCX0LDQtNCw0YfQsCDQutCw0LbQtdGC0YHRjyDRgtGA0LjQstC40LDQu9GM0L3QvtC5LCDQvdC+INC90LUg0LTRg9C80LDQuSwg0YfRgtC+INCy0YHQtSDRgtCw0Log0L/RgNC+0YHRgtC+LjwvbGk+XG4gICAgICAgICAgICAgICAgICAgIDxsaT7QpNC+0YLQvtGA0LXQsNC70LjQt9C8INC+0LHQvNCw0L3Rh9C40LIg0Lgg0LrQvtCy0LDRgNC10L0uPC9saT5cbiAgICAgICAgICAgICAgICAgICAgPGxpPtCf0L7QvNC90LgsINCz0LvQsNCy0L3QvtC1IOKAlCDRgdC80L7RgtGA0LXRgtGMINC+0YfQtdC90Ywg0LLQvdC40LzQsNGC0LXQu9GM0L3Qvi48L2xpPlxuICAgICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIFRPIFNUQVJUIEFSUk9XIC0tPlxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJncmVldGluZ19fdG9wIHRvcFwiIHR5cGU9XCJidXR0b25cIj5cbiAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPVwiaW1nL2ljb24tdG9wLnN2Z1wiIHdpZHRoPVwiNzFcIiBoZWlnaHQ9XCI3OVwiIGFsdD1cItCi0L7QvyDQuNCz0YDQvtC60L7QslwiPlxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgICAgICA8L2Rpdj5gO1xuICB9XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YXJ0QXJyb3dWaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPGJ1dHRvbiBjbGFzcz1cImdyZWV0aW5nX19jb250aW51ZVwiIHR5cGU9XCJidXR0b25cIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ2aXN1YWxseS1oaWRkZW5cIj7Qn9GA0L7QtNC+0LvQttC40YLRjDwvc3Bhbj5cbiAgICAgICAgICAgICAgPHN2ZyBjbGFzcz1cImljb25cIiB3aWR0aD1cIjY0XCIgaGVpZ2h0PVwiNjRcIiB2aWV3Qm94PVwiMCAwIDY0IDY0XCIgZmlsbD1cIiMwMDAwMDBcIj5cbiAgICAgICAgICAgICAgICA8dXNlIHhsaW5rOmhyZWY9XCJpbWcvc3ByaXRlLnN2ZyNhcnJvdy1yaWdodFwiPjwvdXNlPlxuICAgICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgIDwvYnV0dG9uPmA7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYHNlY3Rpb24uZ3JlZXRpbmdgKTtcbiAgICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XG4gIH1cblxuICBiaW5kKGNiKSB7XG4gICAgY29uc3Qgc3RhcnRBcnJvdyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5ncmVldGluZ19fY29udGludWVgKTtcbiAgICBzdGFydEFycm93LmFkZEV2ZW50TGlzdGVuZXIoYGNsaWNrYCwgY2IpO1xuICB9XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RTY3JlZW4gZnJvbSAnLi4vYWJzdHJhY3Qtc2NyZWVuLmpzJztcblxuaW1wb3J0IEdyZWV0aW5nU2NyZWVuVmlldyBmcm9tICcuL2dyZWV0aW5nLXNjcmVlbi12aWV3LmpzJztcbmltcG9ydCBTdGFydEFycm93VmlldyBmcm9tICcuL3N0YXJ0LWFycm93LXZpZXcuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHcmVldGluZ1NjcmVlbiBleHRlbmRzIEFic3RyYWN0U2NyZWVuIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMudmlldyA9IG5ldyBHcmVldGluZ1NjcmVlblZpZXcoKTtcbiAgfVxuXG4gIF9vblNjcmVlblNob3coKSB7XG4gICAgY29uc3Qgc3RhcnRBcnJvdyA9IG5ldyBTdGFydEFycm93VmlldygpO1xuICAgIHN0YXJ0QXJyb3cucmVuZGVyKCk7XG4gICAgc3RhcnRBcnJvdy5iaW5kKHRoaXMubmV4dFNjcmVlbi5zaG93LmJpbmQodGhpcy5uZXh0U2NyZWVuKSk7XG4gIH1cbn1cbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUnVsZXNTY3JlZW5WaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPGRpdiBpZD1cIm1haW5cIiBjbGFzcz1cImNlbnRyYWxfX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgPGhlYWRlciBjbGFzcz1cImhlYWRlclwiPlxuICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgVE8gQkFDSyBBUlJPVyAtLT5cbiAgICAgICAgICAgICAgPC9oZWFkZXI+XG4gICAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzPVwicnVsZXNcIj5cbiAgICAgICAgICAgICAgICA8aDIgY2xhc3M9XCJydWxlc19fdGl0bGVcIj7Qn9GA0LDQstC40LvQsDwvaDI+XG4gICAgICAgICAgICAgICAgPHVsIGNsYXNzPVwicnVsZXNfX2Rlc2NyaXB0aW9uXCI+XG4gICAgICAgICAgICAgICAgICA8bGk+0KPQs9Cw0LTQsNC5IDEwINGA0LDQtyDQtNC70Y8g0LrQsNC20LTQvtCz0L4g0LjQt9C+0LHRgNCw0LbQtdC90LjRjyDRhNC+0YLQvlxuICAgICAgICAgICAgICAgICAgICA8aW1nIGNsYXNzPVwicnVsZXNfX2ljb25cIiBzcmM9XCJpbWcvaWNvbi1waG90by5wbmdcIiB3aWR0aD1cIjMyXCIgaGVpZ2h0PVwiMzFcIiBhbHQ9XCLQpNC+0YLQvlwiPiDQuNC70Lgg0YDQuNGB0YPQvdC+0LpcbiAgICAgICAgICAgICAgICAgICAgPGltZyBjbGFzcz1cInJ1bGVzX19pY29uXCIgc3JjPVwiaW1nL2ljb24tcGFpbnQucG5nXCIgd2lkdGg9XCIzMlwiIGhlaWdodD1cIjMxXCIgYWx0PVwi0KDQuNGB0YPQvdC+0LpcIj48L2xpPlxuICAgICAgICAgICAgICAgICAgPGxpPtCk0L7RgtC+0LPRgNCw0YTQuNGP0LzQuCDQuNC70Lgg0YDQuNGB0YPQvdC60LDQvNC4INC80L7Qs9GD0YIg0LHRi9GC0Ywg0L7QsdCwINC40LfQvtCx0YDQsNC20LXQvdC40Y8uPC9saT5cbiAgICAgICAgICAgICAgICAgIDxsaT7QndCwINC60LDQttC00YPRjiDQv9C+0L/Ri9GC0LrRgyDQvtGC0LLQvtC00LjRgtGB0Y8gMzAg0YHQtdC60YPQvdC0LjwvbGk+XG4gICAgICAgICAgICAgICAgICA8bGk+0J7RiNC40LHQuNGC0YzRgdGPINC80L7QttC90L4g0L3QtSDQsdC+0LvQtdC1IDMg0YDQsNC3LjwvbGk+XG4gICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgICA8cCBjbGFzcz1cInJ1bGVzX19yZWFkeVwiPtCT0L7RgtC+0LLRiz88L3A+XG4gICAgICAgICAgICAgICAgPGZvcm0gY2xhc3M9XCJydWxlc19fZm9ybVwiPlxuICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBUTyBOQU1FIElOUFVUIC0tPlxuICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBUTyBTVEFSVCBCVVRUT04gLS0+XG4gICAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgICAgICA8L2Rpdj5gO1xuICB9XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE5hbWVJbnB1dFZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuIGA8aW5wdXQgY2xhc3M9XCJydWxlc19faW5wdXRcIiB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwi0JLQsNGI0LUg0JjQvNGPXCI+YDtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgZm9ybS5ydWxlc19fZm9ybWApO1xuICAgIHRoaXMuZWxlbWVudC52YWx1ZSA9IGBgO1xuICAgIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIGJpbmQoKSB7XG4gICAgY29uc3QgbmFtZUlucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLnJ1bGVzX19pbnB1dGApO1xuICAgIGNvbnN0IHN0YXJ0QnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLnJ1bGVzX19idXR0b25gKTtcbiAgICBuYW1lSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihgaW5wdXRgLCAoKSA9PiB7XG4gICAgICBzdGFydEJ0bi5kaXNhYmxlZCA9IChuYW1lSW5wdXQudmFsdWUgPT09IGBgKSA/IHRydWUgOiBmYWxzZTtcbiAgICB9KTtcbiAgfVxufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGFydEJ1dHRvblZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuIGA8YnV0dG9uIGNsYXNzPVwicnVsZXNfX2J1dHRvbiAgY29udGludWVcIiB0eXBlPVwic3VibWl0XCIgZGlzYWJsZWQ+R28hPC9idXR0b24+YDtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgZm9ybS5ydWxlc19fZm9ybWApO1xuICAgIHRoaXMuZWxlbWVudC5kaXNhYmxlZCA9IHRydWU7XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgYmluZChjYikge1xuICAgIGNvbnN0IHN0YXJ0QnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLnJ1bGVzX19idXR0b25gKTtcbiAgICBzdGFydEJ0bi5hZGRFdmVudExpc3RlbmVyKGBjbGlja2AsIGNiKTtcbiAgfVxufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYWNrQXJyb3dWaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPGJ1dHRvbiBjbGFzcz1cImJhY2tcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ2aXN1YWxseS1oaWRkZW5cIj7QktC10YDQvdGD0YLRjNGB0Y8g0Log0L3QsNGH0LDQu9GDPC9zcGFuPlxuICAgICAgICAgICAgICA8c3ZnIGNsYXNzPVwiaWNvblwiIHdpZHRoPVwiNDVcIiBoZWlnaHQ9XCI0NVwiIHZpZXdCb3g9XCIwIDAgNDUgNDVcIiBmaWxsPVwiIzAwMDAwMFwiPlxuICAgICAgICAgICAgICAgIDx1c2UgeGxpbms6aHJlZj1cImltZy9zcHJpdGUuc3ZnI2Fycm93LWxlZnRcIj48L3VzZT5cbiAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICAgIDxzdmcgY2xhc3M9XCJpY29uXCIgd2lkdGg9XCIxMDFcIiBoZWlnaHQ9XCI0NFwiIHZpZXdCb3g9XCIwIDAgMTAxIDQ0XCIgZmlsbD1cIiMwMDAwMDBcIj5cbiAgICAgICAgICAgICAgICA8dXNlIHhsaW5rOmhyZWY9XCJpbWcvc3ByaXRlLnN2ZyNsb2dvLXNtYWxsXCI+PC91c2U+XG4gICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgPC9idXR0b24+YDtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgaGVhZGVyLmhlYWRlcmApO1xuICAgIHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKHRoaXMuZWxlbWVudCwgcGFyZW50RWxlbWVudC5maXJzdENoaWxkKTtcbiAgfVxuXG4gIGJpbmQoY2IpIHtcbiAgICBjb25zdCBiYWNrQXJyb3cgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuYmFja2ApO1xuICAgIGJhY2tBcnJvdy5hZGRFdmVudExpc3RlbmVyKGBjbGlja2AsIGNiKTtcbiAgfVxufVxuIiwiaW1wb3J0IEFic3RyYWN0U2NyZWVuIGZyb20gJy4uL2Fic3RyYWN0LXNjcmVlbi5qcyc7XG5cbmltcG9ydCBSdWxlc1NjcmVlblZpZXcgZnJvbSAnLi9ydWxlcy1zY3JlZW4tdmlldy5qcyc7XG5pbXBvcnQgTmFtZUlucHV0VmlldyBmcm9tICcuL25hbWUtaW5wdXQtdmlldy5qcyc7XG5pbXBvcnQgU3RhcnRCdXR0b25WaWV3IGZyb20gJy4vc3RhcnQtYnV0dG9uLXZpZXcuanMnO1xuaW1wb3J0IEJhY2tBcnJvd1ZpZXcgZnJvbSAnLi4vdXRpbC12aWV3cy9iYWNrLWFycm93LXZpZXcuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSdWxlc1NjcmVlbiBleHRlbmRzIEFic3RyYWN0U2NyZWVuIHtcblxuICBjb25zdHJ1Y3RvcihnYW1lTW9kZWwpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZ2FtZU1vZGVsID0gZ2FtZU1vZGVsO1xuICAgIHRoaXMudmlldyA9IG5ldyBSdWxlc1NjcmVlblZpZXcoKTtcbiAgfVxuXG4gIF9vblNjcmVlblNob3coKSB7XG4gICAgY29uc3QgbmFtZUlucHV0ID0gbmV3IE5hbWVJbnB1dFZpZXcoKTtcbiAgICBjb25zdCBzdGFydEJ0biA9IG5ldyBTdGFydEJ1dHRvblZpZXcoKTtcbiAgICBjb25zdCBiYWNrQXJyb3cgPSBuZXcgQmFja0Fycm93VmlldygpO1xuICAgIGNvbnN0IG9uU3RhcnRCdG5DbGljayA9IHRoaXMuX29uU3RhcnRCdG5DbGljay5iaW5kKHRoaXMpO1xuICAgIGNvbnN0IHJlc3RhcnRHYW1lID0gdGhpcy5fcmVzdGFydEdhbWUuYmluZCh0aGlzKTtcblxuICAgIG5hbWVJbnB1dC5yZW5kZXIoKTtcbiAgICBzdGFydEJ0bi5yZW5kZXIoKTtcbiAgICBiYWNrQXJyb3cucmVuZGVyKCk7XG5cbiAgICBzdGFydEJ0bi5iaW5kKG9uU3RhcnRCdG5DbGljayk7XG4gICAgbmFtZUlucHV0LmJpbmQoKTtcbiAgICBiYWNrQXJyb3cuYmluZChyZXN0YXJ0R2FtZSk7XG4gIH1cblxuICBfb25TdGFydEJ0bkNsaWNrKCkge1xuICAgIGNvbnN0IG5hbWVJbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5ydWxlc19faW5wdXRgKTtcbiAgICB0aGlzLmdhbWVNb2RlbC5wbGF5ZXJOYW1lID0gbmFtZUlucHV0LnZhbHVlLnRyaW0oKTtcbiAgICB0aGlzLm5leHRTY3JlZW4uc2hvdygpO1xuICB9XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdhbWVTY3JlZW5WaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcihnYW1lKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPGRpdiBpZD1cIm1haW5cIiBjbGFzcz1cImNlbnRyYWxfX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgPGhlYWRlciBjbGFzcz1cImhlYWRlclwiPlxuICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgVE8gQkFDSyBBUlJPVyAtLT5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ2FtZV9fdGltZXJcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ2FtZV9fbGl2ZXNcIj48L2Rpdj5cbiAgICAgICAgICAgICAgPC9oZWFkZXI+XG4gICAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzPVwiZ2FtZVwiPlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwiZ2FtZV9fdGFza1wiPiR7dGhpcy5nYW1lLnRhc2t9PC9wPlxuICAgICAgICAgICAgICAgICR7R2FtZVNjcmVlblZpZXcuZ2V0R2FtZUNvbnRlbnQodGhpcy5nYW1lLmdhbWVUeXBlKX1cbiAgICAgICAgICAgICAgICA8dWwgY2xhc3M9XCJzdGF0c1wiPjwvdWw+XG4gICAgICAgICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgICAgIDwvZGl2PmA7XG4gIH1cblxuICBzdGF0aWMgZ2V0R2FtZUNvbnRlbnQoZ2FtZVR5cGUpIHtcbiAgICBsZXQgY29udGVudCA9IGBgO1xuICAgIGlmIChnYW1lVHlwZSA9PT0gMSkge1xuICAgICAgY29udGVudCA9IGA8Zm9ybSBjbGFzcz1cImdhbWVfX2NvbnRlbnQgIGdhbWVfX2NvbnRlbnQtLXdpZGVcIj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJnYW1lX19vcHRpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgSU1BR0UgLS0+XG4gICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIEFOU1dFUiBQSE9UTyBCVVRUT04gLS0+XG4gICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIEFOU1dFUiBQQUlOVCBCVVRUT04gLS0+XG4gICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgPC9mb3JtPmA7XG4gICAgfSBlbHNlIGlmIChnYW1lVHlwZSA9PT0gMikge1xuICAgICAgY29udGVudCA9IGA8Zm9ybSBjbGFzcz1cImdhbWVfX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ2FtZV9fb3B0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBJTUFHRSAtLT5cbiAgICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIEFOU1dFUiBQSE9UTyBCVVRUT04gLS0+XG4gICAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBBTlNXRVIgUEFJTlQgQlVUVE9OIC0tPlxuICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJnYW1lX19vcHRpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIElNQUdFIC0tPlxuICAgICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgQU5TV0VSIFBIT1RPIEJVVFRPTiAtLT5cbiAgICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIEFOU1dFUiBQQUlOVCBCVVRUT04gLS0+XG4gICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgIDwvZm9ybT5gO1xuICAgIH0gZWxzZSBpZiAoZ2FtZVR5cGUgPT09IDMpIHtcbiAgICAgIGNvbnRlbnQgPSBgPGZvcm0gY2xhc3M9XCJnYW1lX19jb250ZW50ICBnYW1lX19jb250ZW50LS10cmlwbGVcIj5cbiAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBBTlNXRVIgUEFJTlQgT1BUSU9OIC0tPlxuICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIEFOU1dFUiBQQUlOVCBPUFRJT04gLS0+XG4gICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgQU5TV0VSIFBBSU5UIE9QVElPTiAtLT5cbiAgICAgICAgICAgICAgICAgPC9mb3JtPmA7XG4gICAgfVxuICAgIHJldHVybiBjb250ZW50O1xuICB9XG5cbn1cbiIsImltcG9ydCBjb25maWcgZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGltZXJCbG9ja1ZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5faXNBY3RpdmUgPSB0cnVlO1xuICAgIHRoaXMuX3RpbWUgPSBjb25maWcuVElNRV9UT19BTlNXRVI7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgY29uc3QgdGltZSA9IFRpbWVyQmxvY2tWaWV3LmdldFRpbWVGb3JtYXR0ZWQodGhpcy50aW1lKTtcbiAgICByZXR1cm4gYDxkaXYgY2xhc3M9XCJnYW1lX190aW1lclwiPiR7dGltZX08L2Rpdj5gO1xuICB9XG5cbiAgZ2V0IHRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3RpbWU7XG4gIH1cblxuICBzZXQgdGltZShuZXdUaW1lKSB7XG4gICAgdGhpcy5fdGltZSA9IG5ld1RpbWU7XG4gIH1cblxuICBnZXQgaXNBY3RpdmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzQWN0aXZlO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBoZWFkZXIuaGVhZGVyYCk7XG4gICAgcGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUodGhpcy5lbGVtZW50LCBwYXJlbnRFbGVtZW50LmZpcnN0Q2hpbGQpO1xuICB9XG5cbiAgdXBkYXRlKCkge1xuICAgIGlmICh0aGlzLl9pc0FjdGl2ZSAmJiB0aGlzLnRpbWUgPiAwKSB7XG4gICAgICB0aGlzLnRpbWUgPSB0aGlzLnRpbWUgLSAxMDAwO1xuICAgICAgY29uc3QgdGltZSA9IFRpbWVyQmxvY2tWaWV3LmdldFRpbWVGb3JtYXR0ZWQodGhpcy50aW1lKTtcbiAgICAgIGNvbnN0IHRpbWVyRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYGRpdi5nYW1lX190aW1lcmApO1xuICAgICAgdGltZXJFbGVtZW50LnRleHRDb250ZW50ID0gdGltZTtcbiAgICAgIGlmICh0aGlzLnRpbWUgPT09IDUwMDAgfHwgdGhpcy50aW1lID09PSAzMDAwIHx8IHRoaXMudGltZSA9PT0gMTAwMCkge1xuICAgICAgICB0aW1lckVsZW1lbnQuc3R5bGUgPSBgY29sb3I6ICNkNzQwNDA7YDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRpbWVyRWxlbWVudC5zdHlsZSA9IGBjb2xvcjogYmxhY2s7YDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzdG9wKCkge1xuICAgIHRoaXMuX2lzQWN0aXZlID0gZmFsc2U7XG4gIH1cblxuICBzdGF0aWMgZ2V0VGltZUZvcm1hdHRlZCh0aW1lKSB7XG4gICAgY29uc3QgUkVHRVggPSAvXlxcZCQvO1xuICAgIGxldCBtaW4gPSBgYCArIE1hdGguZmxvb3IodGltZSAvIDEwMDAgLyA2MCk7XG4gICAgbGV0IHNlYyA9IGBgICsgTWF0aC5mbG9vcigodGltZSAtIChtaW4gKiAxMDAwICogNjApKSAvIDEwMDApO1xuICAgIGlmIChSRUdFWC50ZXN0KHNlYykpIHtcbiAgICAgIHNlYyA9IGAwJHtzZWN9YDtcbiAgICB9XG4gICAgaWYgKFJFR0VYLnRlc3QobWluKSkge1xuICAgICAgbWluID0gYDAke21pbn1gO1xuICAgIH1cbiAgICByZXR1cm4gYCR7bWlufToke3NlY31gO1xuICB9XG59XG4iLCJpbXBvcnQgY29uZmlnIGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExpdmVzQmxvY2tWaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcihsaXZlcykge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5saXZlcyA9IGxpdmVzO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIGxldCByZXN1bHQgPSBgYDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbmZpZy5MSVZFU19DT1VOVDsgaSsrKSB7XG4gICAgICByZXN1bHQgKz0gYDxpbWcgc3JjPVwiaW1nL2hlYXJ0X18keyh0aGlzLmxpdmVzID4gMCkgPyBgZnVsbGAgOiBgZW1wdHlgfS5zdmdcIiBjbGFzcz1cImdhbWVfX2hlYXJ0XCIgYWx0PVwiTGlmZVwiIHdpZHRoPVwiMzFcIiBoZWlnaHQ9XCIyN1wiPmA7XG4gICAgICB0aGlzLmxpdmVzLS07XG4gICAgfVxuICAgIHJldHVybiBgPGRpdiBjbGFzcz1cImdhbWVfX2xpdmVzXCI+JHtyZXN1bHR9PC9kaXY+YDtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgaGVhZGVyLmhlYWRlcmApO1xuICAgIGNvbnN0IG9sZEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBkaXYuZ2FtZV9fbGl2ZXNgKTtcbiAgICBwYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKG9sZEVsZW1lbnQpO1xuICAgIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGF0c0Jsb2NrVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoYW5zd2Vycykge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5hbnN3ZXJzID0gYW5zd2VycztcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICBsZXQgcmVzdWx0ID0gYGA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgICBjb25zdCBhbnN3ZXIgPSB0aGlzLmFuc3dlcnNbaV07XG4gICAgICBsZXQgbW9kaWZpZXIgPSBgYDtcbiAgICAgIGlmIChhbnN3ZXIpIHtcbiAgICAgICAgaWYgKGFuc3dlci5pc09LKSB7XG4gICAgICAgICAgbW9kaWZpZXIgPSBgY29ycmVjdGA7XG4gICAgICAgICAgaWYgKGFuc3dlci50aW1lIDwgMTApIHtcbiAgICAgICAgICAgIG1vZGlmaWVyID0gYGZhc3RgO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoYW5zd2VyLnRpbWUgPiAyMCkge1xuICAgICAgICAgICAgbW9kaWZpZXIgPSBgc2xvd2A7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1vZGlmaWVyID0gYHdyb25nYDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbW9kaWZpZXIgPSBgdW5rbm93bmA7XG4gICAgICB9XG4gICAgICByZXN1bHQgKz0gYDxsaSBjbGFzcz1cInN0YXRzX19yZXN1bHQgc3RhdHNfX3Jlc3VsdC0tJHttb2RpZmllcn1cIj48L2xpPmA7XG4gICAgfVxuICAgIHJldHVybiBgPHVsIGNsYXNzPVwic3RhdHNcIj4ke3Jlc3VsdH08L3VsPmA7XG59XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBzZWN0aW9uLmdhbWVgKTtcbiAgICBjb25zdCBvbGRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgdWwuc3RhdHNgKTtcbiAgICBwYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKG9sZEVsZW1lbnQpO1xuICAgIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxufVxuIiwiY29uc3QgREVCVUdfT04gPSB0cnVlO1xuY29uc3QgU1RZTEUgPSBgc3R5bGU9XCJib3gtc2hhZG93OiAwcHggMHB4IDEwcHggMTJweCByZ2JhKDE5LDE3MywyNCwxKTtcImA7XG5cbmZ1bmN0aW9uIGlzUGhvdG8oYW5zd2VyKSB7XG4gIHJldHVybiAoREVCVUdfT04gJiYgYW5zd2VyID09PSBgcGhvdG9gKSA/IFNUWUxFIDogYGA7XG59XG5cbmZ1bmN0aW9uIGlzUGFpbnQoYW5zd2VyKSB7XG4gIHJldHVybiAoREVCVUdfT04gJiYgYW5zd2VyID09PSBgcGFpbnRgKSA/IFNUWUxFIDogYGA7XG59XG5cbmZ1bmN0aW9uIGlzQ29ycmVjdChpc0NvcnJlY3QpIHtcbiAgcmV0dXJuIChERUJVR19PTiAmJiBpc0NvcnJlY3QpID8gU1RZTEUgOiBgYDtcbn1cblxuZXhwb3J0IGRlZmF1bHQge2lzUGhvdG8sIGlzUGFpbnQsIGlzQ29ycmVjdH07XG4iLCJpbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5pbXBvcnQgZGVidWcgZnJvbSAnLi4vZGVidWcuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBbnN3ZXJQaG90b0J1dHRvblZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKHF1ZXN0aW9uSW5kZXgsIGdhbWUpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMucXVlc3Rpb25JbmRleCA9IHF1ZXN0aW9uSW5kZXg7XG4gICAgdGhpcy5jb3JyZWN0QW5zd2VyID0gZ2FtZS5xdWVzdGlvbnNbdGhpcy5xdWVzdGlvbkluZGV4XS5jb3JyZWN0QW5zd2VyO1xuICAgIHRoaXMuZ2FtZUluZGV4ID0gZ2FtZS5nYW1lSW5kZXg7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuIGA8bGFiZWwgY2xhc3M9XCJnYW1lX19hbnN3ZXIgZ2FtZV9fYW5zd2VyLS1waG90b1wiPlxuICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJ2aXN1YWxseS1oaWRkZW5cIiBuYW1lPVwicXVlc3Rpb24gJHt0aGlzLnF1ZXN0aW9uSW5kZXh9XCIgdHlwZT1cInJhZGlvXCIgdmFsdWU9XCJwaG90b1wiIGRhdGEtZ2FtZWluZGV4PVwiJHt0aGlzLmdhbWVJbmRleH1cIiBkYXRhLXF1ZXN0aW9uaW5kZXg9XCIke3RoaXMucXVlc3Rpb25JbmRleH1cIj5cbiAgICAgICAgICAgICAgPHNwYW4gJHtkZWJ1Zy5pc1Bob3RvKHRoaXMuY29ycmVjdEFuc3dlcil9PtCk0L7RgtC+PC9zcGFuPlxuICAgICAgICAgICAgPC9sYWJlbD5gO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdkaXYuZ2FtZV9fb3B0aW9uJylbdGhpcy5xdWVzdGlvbkluZGV4XTtcbiAgICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XG4gIH1cblxuICBiaW5kKGNiKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2Rpdi5nYW1lX19vcHRpb24nKVt0aGlzLnF1ZXN0aW9uSW5kZXhdO1xuICAgIGNvbnN0IGFuc3dlckVsZW1lbnQgPSBwYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoYC5nYW1lX19hbnN3ZXItLXBob3RvID4gaW5wdXRgKTtcbiAgICBhbnN3ZXJFbGVtZW50LmNoZWNrZWQgPSBmYWxzZTtcbiAgICBhbnN3ZXJFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoYGNsaWNrYCwgY2IpO1xuICB9XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5pbXBvcnQgZGVidWcgZnJvbSAnLi4vZGVidWcuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBbnN3ZXJQYWludEJ1dHRvblZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKHF1ZXN0aW9uSW5kZXgsIGdhbWUpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMucXVlc3Rpb25JbmRleCA9IHF1ZXN0aW9uSW5kZXg7XG4gICAgdGhpcy5jb3JyZWN0QW5zd2VyID0gZ2FtZS5xdWVzdGlvbnNbdGhpcy5xdWVzdGlvbkluZGV4XS5jb3JyZWN0QW5zd2VyO1xuICAgIHRoaXMuZ2FtZUluZGV4ID0gZ2FtZS5nYW1lSW5kZXg7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuIGA8bGFiZWwgY2xhc3M9XCJnYW1lX19hbnN3ZXIgZ2FtZV9fYW5zd2VyLS1wYWludFwiPlxuICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJ2aXN1YWxseS1oaWRkZW5cIiBuYW1lPVwicXVlc3Rpb24gJHt0aGlzLnF1ZXN0aW9uSW5kZXh9XCIgdHlwZT1cInJhZGlvXCIgdmFsdWU9XCJwYWludFwiIGRhdGEtZ2FtZWluZGV4PVwiJHt0aGlzLmdhbWVJbmRleH1cIiBkYXRhLXF1ZXN0aW9uaW5kZXg9XCIke3RoaXMucXVlc3Rpb25JbmRleH1cIj5cbiAgICAgICAgICAgICAgPHNwYW4gJHtkZWJ1Zy5pc1BhaW50KHRoaXMuY29ycmVjdEFuc3dlcil9PtCg0LjRgdGD0L3QvtC6PC9zcGFuPlxuICAgICAgICAgICAgPC9sYWJlbD5gO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdkaXYuZ2FtZV9fb3B0aW9uJylbdGhpcy5xdWVzdGlvbkluZGV4XTtcbiAgICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XG4gIH1cblxuICBiaW5kKGNiKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2Rpdi5nYW1lX19vcHRpb24nKVt0aGlzLnF1ZXN0aW9uSW5kZXhdO1xuICAgIGNvbnN0IGFuc3dlckVsZW1lbnQgPSBwYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoYC5nYW1lX19hbnN3ZXItLXBhaW50ID4gaW5wdXRgKTtcbiAgICBhbnN3ZXJFbGVtZW50LmNoZWNrZWQgPSBmYWxzZTtcbiAgICBhbnN3ZXJFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoYGNsaWNrYCwgY2IpO1xuICB9XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5pbXBvcnQgZGVidWcgZnJvbSAnLi4vZGVidWcuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBbnN3ZXJQYWludE9wdGlvblZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKGFuc3dlckluZGV4LCBnYW1lKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmFuc3dlckluZGV4ID0gYW5zd2VySW5kZXg7XG4gICAgdGhpcy5nYW1lID0gZ2FtZTtcbiAgICB0aGlzLmNvcnJlY3RBbnN3ZXIgPSBnYW1lLnF1ZXN0aW9uc1swXS5jb3JyZWN0QW5zd2VyO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPGRpdiBjbGFzcz1cImdhbWVfX29wdGlvblwiIGRhdGEtYW5zd2VyPVwiJHt0aGlzLmFuc3dlckluZGV4fVwiIGRhdGEtZ2FtZWluZGV4PVwiJHt0aGlzLmdhbWUuZ2FtZUluZGV4fVwiICR7ZGVidWcuaXNDb3JyZWN0KHRoaXMuY29ycmVjdEFuc3dlciA9PT0gdGhpcy5hbnN3ZXJJbmRleCl9PlxuICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBJTUFHRSAtLT5cbiAgICAgICAgICAgIDwvZGl2PmA7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Zvcm0uZ2FtZV9fY29udGVudC0tdHJpcGxlJyk7XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgYmluZChjYikge1xuICAgIGNvbnN0IGFuc3dlckVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGAuZ2FtZV9fb3B0aW9uYClbdGhpcy5hbnN3ZXJJbmRleF07XG4gICAgYW5zd2VyRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGBjbGlja2AsIGNiKTtcbiAgfVxufVxuIiwiLy8gTWFuYWdpbmcgc2l6ZVxuLy8gQHBhcmFtICB7b2JqZWN0fSBmcmFtZSDQvtC/0LjRgdGL0LLQsNC10YIg0YDQsNC30LzQtdGA0Ysg0YDQsNC80LrQuCwg0LIg0LrQvtGC0L7RgNGL0LUg0LTQvtC70LbQvdC+INCx0YvRgtGMINCy0L/QuNGB0LDQvdC+INC40LfQvtCx0YDQsNC20LXQvdC40LVcbi8vIEBwYXJhbSAge29iamVjdH0gZ2l2ZW4g0L7Qv9C40YHRi9Cy0LDQtdGCINGA0LDQt9C80LXRgNGLINC40LfQvtCx0YDQsNC20LXQvdC40Y8sINC60L7RgtC+0YDRi9C1INC90YPQttC90L4g0L/QvtC00L7Qs9C90LDRgtGMINC/0L7QtCDRgNCw0LzQutGDXG4vLyBAcmV0dXJuIHtvYmplY3R9INC90L7QstGL0Lkg0L7QsdGK0LXQutGCLCDQutC+0YLQvtGA0YvQuSDQsdGD0LTQtdGCINGB0L7QtNC10YDQttCw0YLRjCDQuNC30LzQtdC90ZHQvdC90YvQtSDRgNCw0LfQvNC10YDRiyDQuNC30L7QsdGA0LDQttC10L3QuNGPXG5leHBvcnQgZGVmYXVsdCAgZnVuY3Rpb24gcmVzaXplKGZyYW1lLCBnaXZlbikge1xuICBsZXQgd2lkdGggPSBnaXZlbi53aWR0aDtcbiAgbGV0IGhlaWdodCA9IGdpdmVuLmhlaWdodDtcbiAgaWYgKHdpZHRoID4gZnJhbWUud2lkdGgpIHtcbiAgICBjb25zdCBtdWx0aXBsaWVyID0gd2lkdGggLyBmcmFtZS53aWR0aDtcbiAgICB3aWR0aCA9IGZyYW1lLndpZHRoO1xuICAgIGhlaWdodCA9IE1hdGguZmxvb3IoaGVpZ2h0IC8gbXVsdGlwbGllcik7XG4gIH1cbiAgaWYgKGhlaWdodCA+IGZyYW1lLmhlaWdodCkge1xuICAgIGNvbnN0IG11bHRpcGxpZXIgPSBoZWlnaHQgLyBmcmFtZS5oZWlnaHQ7XG4gICAgaGVpZ2h0ID0gZnJhbWUuaGVpZ2h0O1xuICAgIHdpZHRoID0gTWF0aC5mbG9vcih3aWR0aCAvIG11bHRpcGxpZXIpO1xuICB9XG4gIHJldHVybiB7d2lkdGgsIGhlaWdodH07XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5pbXBvcnQgcmVzaXplIGZyb20gXCIuLi9yZXNpemUuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW1hZ2VWaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcihxdWVzdGlvbk51bWJlciwgZ2FtZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5xdWVzdGlvbk51bWJlciA9IHF1ZXN0aW9uTnVtYmVyO1xuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XG4gICAgaWYgKGdhbWUuZ2FtZVR5cGUgPT09IDMpIHtcbiAgICAgIHRoaXMuaW1nID0gZ2FtZS5xdWVzdGlvbnNbMF0uaW1nW3RoaXMucXVlc3Rpb25OdW1iZXJdO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmltZyA9IGdhbWUucXVlc3Rpb25zW3RoaXMucXVlc3Rpb25OdW1iZXJdLmltZ1swXTtcbiAgICB9XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgY29uc3QgaW1nU2l6ZSA9IHJlc2l6ZSh0aGlzLmdhbWUuZnJhbWVTaXplLCB0aGlzLmltZy5zaXplKTtcbiAgICByZXR1cm4gYDxpbWcgc3JjPVwiJHt0aGlzLmltZy5zcmN9XCIgYWx0PVwiT3B0aW9uICR7dGhpcy5xdWVzdGlvbk51bWJlciArIDF9XCIgd2lkdGg9XCIke2ltZ1NpemUud2lkdGh9XCIgaGVpZ2h0PVwiJHtpbWdTaXplLmhlaWdodH1cIj5gO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdkaXYuZ2FtZV9fb3B0aW9uJylbdGhpcy5xdWVzdGlvbk51bWJlcl07XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG59XG4iLCJpbXBvcnQgY29uZmlnIGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgQWJzdHJhY3RTY3JlZW4gZnJvbSAnLi4vYWJzdHJhY3Qtc2NyZWVuLmpzJztcblxuaW1wb3J0IEdhbWVTY3JlZW5WaWV3IGZyb20gJy4vZ2FtZS1zY3JlZW4tdmlldy5qcyc7XG5pbXBvcnQgVGltZXJCbG9ja1ZpZXcgZnJvbSAnLi90aW1lci1ibG9jay12aWV3LmpzJztcbmltcG9ydCBMaXZlc0Jsb2NrVmlldyBmcm9tICcuL2xpdmVzLWJsb2NrLXZpZXcuanMnO1xuaW1wb3J0IFN0YXRzQmxvY2tWaWV3IGZyb20gJy4uL3V0aWwtdmlld3Mvc3RhdHMtYmxvY2stdmlldy5qcyc7XG5pbXBvcnQgQW5zd2VyUGhvdG9CdXR0b25WaWV3IGZyb20gJy4vYW5zd2VyLXBob3RvLWJ1dHRvbi12aWV3LmpzJztcbmltcG9ydCBBbnN3ZXJQYWludEJ1dHRvblZpZXcgZnJvbSAnLi9hbnN3ZXItcGFpbnQtYnV0dG9uLXZpZXcuanMnO1xuaW1wb3J0IEFuc3dlclBhaW50T3B0aW9uVmlldyBmcm9tICcuL2Fuc3dlci1wYWludC1vcHRpb24tdmlldy5qcyc7XG5pbXBvcnQgSW1hZ2VWaWV3IGZyb20gJy4vaW1hZ2Utdmlldy5qcyc7XG5pbXBvcnQgQmFja0Fycm93VmlldyBmcm9tICcuLi91dGlsLXZpZXdzL2JhY2stYXJyb3ctdmlldy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdhbWVTY3JlZW4gZXh0ZW5kcyBBYnN0cmFjdFNjcmVlbiB7XG5cbiAgY29uc3RydWN0b3IoZ2FtZU1vZGVsLCBnYW1lKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmdhbWVNb2RlbCA9IGdhbWVNb2RlbDtcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xuICAgIHRoaXMudmlldyA9IG5ldyBHYW1lU2NyZWVuVmlldyhnYW1lKTtcbiAgfVxuXG4gIF9vblNjcmVlblNob3coKSB7XG4gICAgY29uc3QgZ2FtZSA9IHRoaXMuZ2FtZTtcbiAgICBjb25zdCBnYW1lVHlwZSA9IGdhbWUuZ2FtZVR5cGU7XG4gICAgY29uc3QgbGl2ZXNCbG9jayA9IG5ldyBMaXZlc0Jsb2NrVmlldyh0aGlzLmdhbWVNb2RlbC5saXZlcyk7XG4gICAgY29uc3Qgc3RhdHNCbG9jayA9IG5ldyBTdGF0c0Jsb2NrVmlldyh0aGlzLmdhbWVNb2RlbC5hbnN3ZXJzKTtcblxuICAgIGxpdmVzQmxvY2sucmVuZGVyKCk7XG4gICAgc3RhdHNCbG9jay5yZW5kZXIoKTtcblxuICAgIHRoaXMudGltZXIgPSBuZXcgVGltZXJCbG9ja1ZpZXcoKTtcbiAgICB0aGlzLnRpbWVyLnJlbmRlcigpO1xuICAgIHRoaXMuX3RpbWVyT24oKTtcblxuICAgIGNvbnN0IG9uRXZlcnlBbnN3ZXIgPSB0aGlzLl9vbkV2ZXJ5QW5zd2VyLmJpbmQodGhpcyk7XG5cbiAgICBpZiAoZ2FtZVR5cGUgPT09IGNvbmZpZy5HQU1FX1RZUEUub25lKSB7XG4gICAgICBjb25zdCBhbnN3ZXIxUGhvdG9CdXR0b24gPSBuZXcgQW5zd2VyUGhvdG9CdXR0b25WaWV3KDAsIGdhbWUpO1xuICAgICAgY29uc3QgYW5zd2VyMVBhaW50QnV0dG9uID0gbmV3IEFuc3dlclBhaW50QnV0dG9uVmlldygwLCBnYW1lKTtcbiAgICAgIGNvbnN0IGltYWdlID0gbmV3IEltYWdlVmlldygwLCBnYW1lKTtcbiAgICAgIGFuc3dlcjFQaG90b0J1dHRvbi5yZW5kZXIoKTtcbiAgICAgIGFuc3dlcjFQYWludEJ1dHRvbi5yZW5kZXIoKTtcbiAgICAgIGltYWdlLnJlbmRlcigpO1xuICAgICAgYW5zd2VyMVBob3RvQnV0dG9uLmJpbmQob25FdmVyeUFuc3dlcik7XG4gICAgICBhbnN3ZXIxUGFpbnRCdXR0b24uYmluZChvbkV2ZXJ5QW5zd2VyKTtcbiAgICB9IGVsc2UgaWYgKGdhbWVUeXBlID09PSBjb25maWcuR0FNRV9UWVBFLnR3bykge1xuICAgICAgY29uc3QgYW5zd2VyMVBob3RvQnV0dG9uID0gbmV3IEFuc3dlclBob3RvQnV0dG9uVmlldygwLCBnYW1lKTtcbiAgICAgIGNvbnN0IGFuc3dlcjFQYWludEJ1dHRvbiA9IG5ldyBBbnN3ZXJQYWludEJ1dHRvblZpZXcoMCwgZ2FtZSk7XG4gICAgICBjb25zdCBpbWFnZTEgPSBuZXcgSW1hZ2VWaWV3KDAsIGdhbWUpO1xuICAgICAgY29uc3QgYW5zd2VyMlBob3RvQnV0dG9uID0gbmV3IEFuc3dlclBob3RvQnV0dG9uVmlldygxLCBnYW1lKTtcbiAgICAgIGNvbnN0IGFuc3dlcjJQYWludEJ1dHRvbiA9IG5ldyBBbnN3ZXJQYWludEJ1dHRvblZpZXcoMSwgZ2FtZSk7XG4gICAgICBjb25zdCBpbWFnZTIgPSBuZXcgSW1hZ2VWaWV3KDEsIGdhbWUpO1xuICAgICAgYW5zd2VyMVBob3RvQnV0dG9uLnJlbmRlcigpO1xuICAgICAgYW5zd2VyMVBhaW50QnV0dG9uLnJlbmRlcigpO1xuICAgICAgaW1hZ2UxLnJlbmRlcigpO1xuICAgICAgYW5zd2VyMVBob3RvQnV0dG9uLmJpbmQob25FdmVyeUFuc3dlcik7XG4gICAgICBhbnN3ZXIxUGFpbnRCdXR0b24uYmluZChvbkV2ZXJ5QW5zd2VyKTtcbiAgICAgIGFuc3dlcjJQaG90b0J1dHRvbi5yZW5kZXIoKTtcbiAgICAgIGFuc3dlcjJQYWludEJ1dHRvbi5yZW5kZXIoKTtcbiAgICAgIGltYWdlMi5yZW5kZXIoKTtcbiAgICAgIGFuc3dlcjJQaG90b0J1dHRvbi5iaW5kKG9uRXZlcnlBbnN3ZXIpO1xuICAgICAgYW5zd2VyMlBhaW50QnV0dG9uLmJpbmQob25FdmVyeUFuc3dlcik7XG4gICAgfSBlbHNlIGlmIChnYW1lVHlwZSA9PT0gY29uZmlnLkdBTUVfVFlQRS50aHJlZSkge1xuICAgICAgY29uc3QgYW5zd2VyMVBhaW50T3B0aW9uVmlldyA9IG5ldyBBbnN3ZXJQYWludE9wdGlvblZpZXcoMCwgZ2FtZSk7XG4gICAgICBjb25zdCBpbWFnZTEgPSBuZXcgSW1hZ2VWaWV3KDAsIGdhbWUpO1xuICAgICAgY29uc3QgYW5zd2VyMlBhaW50T3B0aW9uVmlldyA9IG5ldyBBbnN3ZXJQYWludE9wdGlvblZpZXcoMSwgZ2FtZSk7XG4gICAgICBjb25zdCBpbWFnZTIgPSBuZXcgSW1hZ2VWaWV3KDEsIGdhbWUpO1xuICAgICAgY29uc3QgYW5zd2VyM1BhaW50T3B0aW9uVmlldyA9IG5ldyBBbnN3ZXJQYWludE9wdGlvblZpZXcoMiwgZ2FtZSk7XG4gICAgICBjb25zdCBpbWFnZTMgPSBuZXcgSW1hZ2VWaWV3KDIsIGdhbWUpO1xuICAgICAgYW5zd2VyMVBhaW50T3B0aW9uVmlldy5yZW5kZXIoKTtcbiAgICAgIGltYWdlMS5yZW5kZXIoKTtcbiAgICAgIGFuc3dlcjJQYWludE9wdGlvblZpZXcucmVuZGVyKCk7XG4gICAgICBpbWFnZTIucmVuZGVyKCk7XG4gICAgICBhbnN3ZXIzUGFpbnRPcHRpb25WaWV3LnJlbmRlcigpO1xuICAgICAgaW1hZ2UzLnJlbmRlcigpO1xuICAgICAgYW5zd2VyMVBhaW50T3B0aW9uVmlldy5iaW5kKG9uRXZlcnlBbnN3ZXIpO1xuICAgICAgYW5zd2VyMlBhaW50T3B0aW9uVmlldy5iaW5kKG9uRXZlcnlBbnN3ZXIpO1xuICAgICAgYW5zd2VyM1BhaW50T3B0aW9uVmlldy5iaW5kKG9uRXZlcnlBbnN3ZXIpO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3RhcnRHYW1lID0gdGhpcy5fcmVzdGFydEdhbWUuYmluZCh0aGlzKTtcblxuICAgIGNvbnN0IGJhY2tBcnJvdyA9IG5ldyBCYWNrQXJyb3dWaWV3KCk7XG4gICAgYmFja0Fycm93LnJlbmRlcigpO1xuICAgIGJhY2tBcnJvdy5iaW5kKHJlc3RhcnRHYW1lKTtcbiAgfVxuXG4gIF90aW1lck9uKCkge1xuICAgIGlmICh0aGlzLnRpbWVyLmlzQWN0aXZlICYmIHRoaXMudGltZXIudGltZSA+IDApIHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLnRpbWVyLnVwZGF0ZSgpO1xuICAgICAgICB0aGlzLl90aW1lck9uKCk7XG4gICAgICB9LCAxMDAwKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGltZXIudGltZSA9PT0gMCkge1xuICAgICAgdGhpcy5fb25WYWxpZEFuc3dlcihmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgX29uRXZlcnlBbnN3ZXIoZXZ0KSB7XG4gICAgY29uc3QgZ2FtZSA9IHRoaXMuZ2FtZTtcbiAgICBpZiAoZ2FtZS5nYW1lVHlwZSA9PT0gY29uZmlnLkdBTUVfVFlQRS50aHJlZSkge1xuICAgICAgY29uc3QgaW5wdXQgPSBldnQuY3VycmVudFRhcmdldDtcbiAgICAgIGNvbnN0IGdhbWVJbmRleCA9IEdhbWVTY3JlZW4uZ2V0R2FtZUluZGV4KGlucHV0KTtcbiAgICAgIGNvbnN0IHF1ZXN0aW9uSW5kZXggPSAwO1xuICAgICAgY29uc3QgY29ycmVjdEFuc3dlciA9IHRoaXMuX2dldENvcnJlY3RBbnN3ZXIoZ2FtZUluZGV4LCBxdWVzdGlvbkluZGV4KTtcbiAgICAgIGNvbnN0IGlzT0sgPSAraW5wdXQuZGF0YXNldC5hbnN3ZXIgPT09IGNvcnJlY3RBbnN3ZXI7XG4gICAgICB0aGlzLl9vblZhbGlkQW5zd2VyKGlzT0spO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBpc0FsbCA9IHRoaXMuX2lzQWxsQW5zd2Vyc0dpdmVuKCk7XG4gICAgICBpZiAoaXNBbGwpIHtcbiAgICAgICAgY29uc3QgaXNPSyA9IHRoaXMuX2lzQWxsQW5zd2Vyc0dpdmVuQ29ycmVjdCgpO1xuICAgICAgICB0aGlzLl9vblZhbGlkQW5zd2VyKGlzT0spO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9pc0FsbEFuc3dlcnNHaXZlbigpIHtcbiAgICBjb25zdCBvcHRpb25zID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGAuZ2FtZV9fb3B0aW9uYCkpO1xuICAgIHJldHVybiBvcHRpb25zLmV2ZXJ5KChvcHRpb24pID0+IHtcbiAgICAgIGNvbnN0IGFuc3dlcnMgPSBBcnJheS5mcm9tKG9wdGlvbi5xdWVyeVNlbGVjdG9yQWxsKGAuZ2FtZV9fYW5zd2VyYCkpO1xuICAgICAgcmV0dXJuIGFuc3dlcnMuc29tZSgoYW5zd2VyKSA9PiB7XG4gICAgICAgIGNvbnN0IGlucHV0ID0gYW5zd2VyLnF1ZXJ5U2VsZWN0b3IoYGlucHV0YCk7XG4gICAgICAgIHJldHVybiBpbnB1dC5jaGVja2VkO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBfaXNBbGxBbnN3ZXJzR2l2ZW5Db3JyZWN0KCkge1xuICAgIGNvbnN0IG9wdGlvbnMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYC5nYW1lX19vcHRpb25gKSk7XG4gICAgcmV0dXJuIG9wdGlvbnMuZXZlcnkoKG9wdGlvbikgPT4ge1xuICAgICAgY29uc3QgYW5zd2VycyA9IEFycmF5LmZyb20ob3B0aW9uLnF1ZXJ5U2VsZWN0b3JBbGwoYC5nYW1lX19hbnN3ZXJgKSk7XG4gICAgICByZXR1cm4gYW5zd2Vycy5zb21lKChhbnN3ZXIpID0+IHtcbiAgICAgICAgY29uc3QgaW5wdXQgPSBhbnN3ZXIucXVlcnlTZWxlY3RvcihgaW5wdXRgKTtcbiAgICAgICAgY29uc3QgZ2FtZUluZGV4ID0gR2FtZVNjcmVlbi5nZXRHYW1lSW5kZXgoaW5wdXQpO1xuICAgICAgICBjb25zdCBxdWVzdGlvbkluZGV4ID0gR2FtZVNjcmVlbi5nZXRRdWVzdGlvbkluZGV4KGlucHV0KTtcbiAgICAgICAgY29uc3QgY29ycmVjdEFuc3dlciA9IHRoaXMuX2dldENvcnJlY3RBbnN3ZXIoZ2FtZUluZGV4LCBxdWVzdGlvbkluZGV4KTtcbiAgICAgICAgcmV0dXJuIGlucHV0LmNoZWNrZWQgJiYgaW5wdXQudmFsdWUgPT09IGNvcnJlY3RBbnN3ZXI7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIF9vblZhbGlkQW5zd2VyKGlzT0spIHtcbiAgICB0aGlzLl9zYXZlQW5zd2VyKGlzT0spO1xuICAgIGlmICghaXNPSykge1xuICAgICAgdGhpcy5nYW1lTW9kZWwubWludXNMaXZlKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLmdhbWVNb2RlbC5pc0dhbWVPdmVyKSB7XG4gICAgICB0aGlzLmVuZFNjcmVlbi5zaG93KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubmV4dFNjcmVlbi5zaG93KCk7XG4gICAgfVxuICB9XG5cbiAgX2dldENvcnJlY3RBbnN3ZXIoZ2FtZUluZGV4LCBxdWVzdGlvbkluZGV4KSB7XG4gICAgcmV0dXJuIHRoaXMuZ2FtZU1vZGVsLmdhbWVzW2dhbWVJbmRleF0ucXVlc3Rpb25zW3F1ZXN0aW9uSW5kZXhdLmNvcnJlY3RBbnN3ZXI7XG4gIH1cblxuICBfc2F2ZUFuc3dlcihpc09LKSB7XG4gICAgY29uc3QgdGltZSA9IChjb25maWcuVElNRV9UT19BTlNXRVIgLSB0aGlzLnRpbWVyLnRpbWUpIC8gMTAwMDtcbiAgICB0aGlzLnRpbWVyLnN0b3AoKTtcbiAgICB0aGlzLmdhbWVNb2RlbC5hZGRBbnN3ZXIoe2lzT0ssIHRpbWV9KTtcbiAgfVxuXG4gIHN0YXRpYyBnZXRHYW1lSW5kZXgoaW5wdXQpIHtcbiAgICByZXR1cm4gaW5wdXQuZGF0YXNldC5nYW1laW5kZXg7XG4gIH1cblxuICBzdGF0aWMgZ2V0UXVlc3Rpb25JbmRleChpbnB1dCkge1xuICAgIHJldHVybiBpbnB1dC5kYXRhc2V0LnF1ZXN0aW9uaW5kZXg7XG4gIH1cblxufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGF0c1NjcmVlblZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuIGA8ZGl2IGlkPVwibWFpblwiIGNsYXNzPVwiY2VudHJhbF9fY29udGVudFwiPlxuICAgICAgICAgICAgICA8aGVhZGVyIGNsYXNzPVwiaGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBUTyBCQUNLIEFSUk9XIC0tPlxuICAgICAgICAgICAgICA8L2hlYWRlcj5cbiAgICAgICAgICAgICAgPHNlY3Rpb24gY2xhc3M9XCJyZXN1bHRcIj48L3NlY3Rpb24+XG4gICAgICAgICAgICA8L2Rpdj5gO1xuICB9XG5cbn1cbiIsIi8vIFNjb3JpbmcgYXQgdGhlIGVuZCBvZiB0aGUgZ2FtZVxuLy8gQHBhcmFtICB7YXJyYXl9IGFuc3dlcnMg0LzQsNGB0YHQuNCyINC+0YLQstC10YLQvtCyINC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRj1xuLy8gQHBhcmFtICB7aW50ZWdlcn0gbGl2ZXMg0LrQvtC7LdCy0L4g0L7RgdGC0LDQstGI0LjRhdGB0Y8g0LbQuNC30L3QtdC5XG4vLyBAcmV0dXJuIHtpbnRlZ2VyfSDQutC+0Lst0LLQviDQvdCw0LHRgNCw0L3QvdGL0YUg0L7Rh9C60L7QslxuZnVuY3Rpb24gZ2V0VG90YWxTY29yZShhbnN3ZXJzLCBsaXZlcykge1xuICBpZiAoYW5zd2Vycy5sZW5ndGggPCAxMCkge1xuICAgIHJldHVybiAtMTtcbiAgfVxuICBjb25zdCBzY29yZSA9IGFuc3dlcnMucmVkdWNlKChhY2MsIGFuc3dlcikgPT4ge1xuICAgIGlmIChhbnN3ZXIuaXNPSykge1xuICAgICAgYWNjICs9IDEwMDtcbiAgICB9XG4gICAgaWYgKGFuc3dlci50aW1lIDwgMTApIHtcbiAgICAgIGFjYyArPSA1MDtcbiAgICB9XG4gICAgaWYgKGFuc3dlci50aW1lID4gMjApIHtcbiAgICAgIGFjYyAtPSA1MDtcbiAgICB9XG4gICAgcmV0dXJuIGFjYztcbiAgfSwgMCk7XG4gIHJldHVybiBzY29yZSArIGxpdmVzICogNTA7XG59XG5cbmZ1bmN0aW9uIGdldFJpZ2h0QW5zd2Vyc0NvdW50KGFuc3dlcnMpIHtcbiAgcmV0dXJuIGFuc3dlcnMuZmlsdGVyKChhbnN3ZXIpID0+IGFuc3dlci5pc09LKS5sZW5ndGg7XG59XG5cbmZ1bmN0aW9uIGdldFNwZWVkQm9udXNDb3VudChhbnN3ZXJzKSB7XG4gIHJldHVybiBhbnN3ZXJzLmZpbHRlcigoYW5zd2VyKSA9PiBhbnN3ZXIudGltZSA8IDEwKS5sZW5ndGg7XG59XG5cbmZ1bmN0aW9uIGdldFNsb3dQZW5hbHR5Q291bnQoYW5zd2Vycykge1xuICByZXR1cm4gYW5zd2Vycy5maWx0ZXIoKGFuc3dlcikgPT4gYW5zd2VyLnRpbWUgPiAyMCkubGVuZ3RoO1xufVxuXG5leHBvcnQge2dldFRvdGFsU2NvcmUsIGdldFJpZ2h0QW5zd2Vyc0NvdW50LCBnZXRTcGVlZEJvbnVzQ291bnQsIGdldFNsb3dQZW5hbHR5Q291bnR9O1xuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuaW1wb3J0IFN0YXRzQmxvY2tWaWV3IGZyb20gJy4uL3V0aWwtdmlld3Mvc3RhdHMtYmxvY2stdmlldy5qcyc7XG5pbXBvcnQge2dldFRvdGFsU2NvcmUsIGdldFJpZ2h0QW5zd2Vyc0NvdW50LCBnZXRTcGVlZEJvbnVzQ291bnQsIGdldFNsb3dQZW5hbHR5Q291bnR9IGZyb20gJy4uL3Njb3JlLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhdHNTaW5nbGVWaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcihhbnN3ZXJzLCBsaXZlcykge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5hbnN3ZXJzID0gYW5zd2VycztcbiAgICB0aGlzLmxpdmVzID0gbGl2ZXM7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgY29uc3QgaXNXaW4gPSB0aGlzLmFuc3dlcnMubGVuZ3RoID09PSAxMDtcbiAgICBjb25zdCBzY29yZSA9IGdldFRvdGFsU2NvcmUodGhpcy5hbnN3ZXJzLCB0aGlzLmxpdmVzKTtcbiAgICBjb25zdCByaWdodEFuc3dlcnNDb3VudCA9IGdldFJpZ2h0QW5zd2Vyc0NvdW50KHRoaXMuYW5zd2Vycyk7XG4gICAgY29uc3Qgc3BlZWRCb251c0NvdW50ID0gZ2V0U3BlZWRCb251c0NvdW50KHRoaXMuYW5zd2Vycyk7XG4gICAgY29uc3Qgc2xvd1BlbmFsdHlDb3VudCA9IGdldFNsb3dQZW5hbHR5Q291bnQodGhpcy5hbnN3ZXJzKTtcbiAgICBjb25zdCBzdGF0c0Jsb2NrID0gbmV3IFN0YXRzQmxvY2tWaWV3KHRoaXMuYW5zd2Vycyk7XG4gICAgcmV0dXJuIGA8c2VjdGlvbiBjbGFzcz1cInJlc3VsdFwiPlxuICAgICAgPGgyIGNsYXNzPVwicmVzdWx0X190aXRsZSByZXN1bHRfX3RpdGxlLS1zaW5nbGVcIj4keyhpc1dpbikgPyBzY29yZSArIGAg0L7Rh9C60L7Qsi4g0J3QtdC/0LvQvtGF0L4hYCA6IGDQn9C+0YDQsNC20LXQvdC40LUhYCB9PC9oMj5cbiAgICAgIDx0YWJsZSBjbGFzcz1cInJlc3VsdF9fdGFibGUgcmVzdWx0X190YWJsZS0tc2luZ2xlXCI+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGQgY29sc3Bhbj1cIjJcIj5cbiAgICAgICAgICAgICR7c3RhdHNCbG9jay50ZW1wbGF0ZX1cbiAgICAgICAgICA8L3RkPlxuICAgICAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fcG9pbnRzXCI+w5cgMTAwPC90ZD5cbiAgICAgICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX3RvdGFsXCI+JHsoaXNXaW4pID8gcmlnaHRBbnN3ZXJzQ291bnQgKiAxMDAgOiBgRmFpbGAgfTwvdGQ+XG4gICAgICAgIDwvdHI+XG4gICAgICAgICR7KHNwZWVkQm9udXNDb3VudCkgPyBTdGF0c1NpbmdsZVZpZXcuZ2V0U3BlZWRCb251c0NvbnRlbnQoc3BlZWRCb251c0NvdW50KSA6IGBgfVxuICAgICAgICAkeyh0aGlzLmxpdmVzKSA/IFN0YXRzU2luZ2xlVmlldy5nZXRMaXZlc0JvbnVzQ29udGVudCh0aGlzLmxpdmVzKSA6IGBgfVxuICAgICAgICAkeyhzbG93UGVuYWx0eUNvdW50KSA/IFN0YXRzU2luZ2xlVmlldy5nZXRTbG93UGVuYWx0eUNvbnRlbnQoc2xvd1BlbmFsdHlDb3VudCkgOiBgYH1cbiAgICAgIDwvdGFibGU+XG4gICAgPC9zZWN0aW9uPmA7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCNtYWluYCk7XG4gICAgY29uc3Qgb2xkRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYHNlY3Rpb24ucmVzdWx0YCk7XG4gICAgcGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChvbGRFbGVtZW50KTtcbiAgICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XG4gIH1cblxuICBzdGF0aWMgZ2V0U3BlZWRCb251c0NvbnRlbnQoc3BlZWRCb251c0NvdW50KSB7XG4gICAgcmV0dXJuIGA8dHI+XG4gICAgICA8dGQ+PC90ZD5cbiAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fZXh0cmFcIj7QkdC+0L3Rg9GBINC30LAg0YHQutC+0YDQvtGB0YLRjDo8L3RkPlxuICAgICAgPHRkIGNsYXNzPVwicmVzdWx0X19leHRyYVwiPiR7c3BlZWRCb251c0NvdW50fSA8c3BhbiBjbGFzcz1cInN0YXRzX19yZXN1bHQgc3RhdHNfX3Jlc3VsdC0tZmFzdFwiPjwvc3Bhbj48L3RkPlxuICAgICAgPHRkIGNsYXNzPVwicmVzdWx0X19wb2ludHNcIj7DlyA1MDwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX3RvdGFsXCI+JHtzcGVlZEJvbnVzQ291bnQgKiA1MH08L3RkPlxuICAgIDwvdHI+YDtcbiAgfVxuXG4gIHN0YXRpYyBnZXRMaXZlc0JvbnVzQ29udGVudChsaXZlcykge1xuICAgIHJldHVybiBgPHRyPlxuICAgICAgPHRkPjwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX2V4dHJhXCI+0JHQvtC90YPRgSDQt9CwINC20LjQt9C90Lg6PC90ZD5cbiAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fZXh0cmFcIj4ke2xpdmVzfSA8c3BhbiBjbGFzcz1cInN0YXRzX19yZXN1bHQgc3RhdHNfX3Jlc3VsdC0tYWxpdmVcIj48L3NwYW4+PC90ZD5cbiAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fcG9pbnRzXCI+w5cgNTA8L3RkPlxuICAgICAgPHRkIGNsYXNzPVwicmVzdWx0X190b3RhbFwiPiR7bGl2ZXMgKiA1MH08L3RkPlxuICAgIDwvdHI+YDtcbiAgfVxuXG4gIHN0YXRpYyBnZXRTbG93UGVuYWx0eUNvbnRlbnQoc2xvd1BlbmFsdHlDb3VudCkge1xuICAgIHJldHVybiBgPHRyPlxuICAgICAgPHRkPjwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX2V4dHJhXCI+0KjRgtGA0LDRhCDQt9CwINC80LXQtNC70LjRgtC10LvRjNC90L7RgdGC0Yw6PC90ZD5cbiAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fZXh0cmFcIj4ke3Nsb3dQZW5hbHR5Q291bnR9IDxzcGFuIGNsYXNzPVwic3RhdHNfX3Jlc3VsdCBzdGF0c19fcmVzdWx0LS1zbG93XCI+PC9zcGFuPjwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX3BvaW50c1wiPsOXIDUwPC90ZD5cbiAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fdG90YWxcIj4tJHtzbG93UGVuYWx0eUNvdW50ICogNTB9PC90ZD5cbiAgICA8L3RyPmA7XG4gIH1cblxufVxuXG4vLyAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbnN3ZXJzLmxlbmd0aDsgaSsrKSB7XG4vLyAgICByZXN1bHQgKz0gYDx0YWJsZSBjbGFzcz1cInJlc3VsdF9fdGFibGVcIj5cbi8vICAgICAgPHRyPlxuLy8gICAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fbnVtYmVyXCI+JHtpICsgMX0uPC90ZD5cbi8vICAgICAgICA8dGQgY29sc3Bhbj1cIjJcIj5cbi8vICAgICAgICAgICR7Z2V0U3RhdHNIVE1MU3RyaW5nKGFuc3dlcnMpfVxuLy8gICAgICAgIDwvdGQ+XG4vLyAgICAgICAgPHRkIGNsYXNzPVwicmVzdWx0X19wb2ludHNcIj7DlyAxMDA8L3RkPlxuLy8gICAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fdG90YWxcIj4keyhpc1dpbikgPyBnZXRTY29yZShhbnN3ZXJzLCBsaXZlcykgOiBgRmFpbCFgIH08L3RkPlxuLy8gICAgICA8L3RyPlxuLy8gICAgICAke2dldFNwZWVkQm9udXMoKX1cbi8vICAgICAgJHtnZXRMaXZlc0JvbnVzKCl9XG4vLyAgICAgICR7Z2V0U2xvd1BlbmFsdHkoKX1cbi8vICAgICAgPHRyPlxuLy8gICAgICAgIDx0ZCBjb2xzcGFuPVwiNVwiIGNsYXNzPVwicmVzdWx0X190b3RhbCAgcmVzdWx0X190b3RhbC0tZmluYWxcIj4keyhpc1dpbikgPyBnZXRTY29yZShhbnN3ZXJzLCBsaXZlcykgOiBgRmFpbCFgIH08L3RkPlxuLy8gICAgICA8L3RyPlxuLy8gICAgPC90YWJsZT5gO1xuLy8gIH1cbiIsImltcG9ydCBBYnN0cmFjdFNjcmVlbiBmcm9tICcuLi9hYnN0cmFjdC1zY3JlZW4uanMnO1xuXG5pbXBvcnQgU3RhdHNTY3JlZW5WaWV3IGZyb20gJy4vc3RhdHMtc2NyZWVuLXZpZXcuanMnO1xuaW1wb3J0IFN0YXRzU2luZ2xlVmlldyBmcm9tICcuL3N0YXRzLXNpbmdsZS12aWV3LmpzJztcbmltcG9ydCBCYWNrQXJyb3dWaWV3IGZyb20gJy4uL3V0aWwtdmlld3MvYmFjay1hcnJvdy12aWV3LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhdHNTY3JlZW4gZXh0ZW5kcyBBYnN0cmFjdFNjcmVlbiB7XG5cbiAgY29uc3RydWN0b3IoZ2FtZU1vZGVsKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmdhbWVNb2RlbCA9IGdhbWVNb2RlbDtcbiAgICB0aGlzLnZpZXcgPSBuZXcgU3RhdHNTY3JlZW5WaWV3KCk7XG4gIH1cblxuICBfb25TY3JlZW5TaG93KCkge1xuICAgIGNvbnN0IHN0YXRzU2luZ2xlQmxvY2sgPSBuZXcgU3RhdHNTaW5nbGVWaWV3KHRoaXMuZ2FtZU1vZGVsLmFuc3dlcnMsIHRoaXMuZ2FtZU1vZGVsLmxpdmVzKTtcbiAgICBjb25zdCBiYWNrQXJyb3cgPSBuZXcgQmFja0Fycm93VmlldygpO1xuICAgIGNvbnN0IHJlc3RhcnRHYW1lID0gdGhpcy5fcmVzdGFydEdhbWUuYmluZCh0aGlzKTtcblxuICAgIHN0YXRzU2luZ2xlQmxvY2sucmVuZGVyKCk7XG4gICAgYmFja0Fycm93LnJlbmRlcigpO1xuXG4gICAgYmFja0Fycm93LmJpbmQocmVzdGFydEdhbWUpO1xuICB9XG59XG4iLCJpbXBvcnQgR2FtZU1vZGVsIGZyb20gJy4vZ2FtZS1tb2RlbC9nYW1lLW1vZGVsLmpzJztcblxuaW1wb3J0IFdlbGNvbWVTY3JlZW4gZnJvbSAnLi93ZWxjb21lLXNjcmVlbi93ZWxjb21lLXNjcmVlbi5qcyc7XG5pbXBvcnQgR3JlZXRpbmdTY3JlZW4gZnJvbSAnLi9ncmVldGluZy1zY3JlZW4vZ3JlZXRpbmctc2NyZWVuLmpzJztcbmltcG9ydCBSdWxlc1NjcmVlbiBmcm9tICcuL3J1bGVzLXNjcmVlbi9ydWxlcy1zY3JlZW4uanMnO1xuaW1wb3J0IEdhbWVTY3JlZW4gZnJvbSAnLi9nYW1lLXNjcmVlbi9nYW1lLXNjcmVlbi5qcyc7XG5pbXBvcnQgU3RhdHNTY3JlZW4gZnJvbSAnLi9zdGF0cy1zY3JlZW4vc3RhdHMtc2NyZWVuLmpzJztcblxuY29uc3QgZ2FtZU1vZGVsID0gbmV3IEdhbWVNb2RlbCgpO1xuY29uc3Qgd2VsY29tZVNjcmVlbiA9IG5ldyBXZWxjb21lU2NyZWVuKCk7XG5jb25zdCBncmVldGluZ1NjcmVlbiA9IG5ldyBHcmVldGluZ1NjcmVlbigpO1xuY29uc3QgcnVsZXNTY3JlZW4gPSBuZXcgUnVsZXNTY3JlZW4oZ2FtZU1vZGVsKTtcbmNvbnN0IHN0YXRzU2NyZWVuID0gbmV3IFN0YXRzU2NyZWVuKGdhbWVNb2RlbCk7XG5jb25zdCBnYW1lU2NyZWVucyA9IFtdO1xuZ2FtZU1vZGVsLmdhbWVzLmZvckVhY2goKGdhbWUpID0+IHtcbiAgZ2FtZVNjcmVlbnMucHVzaChuZXcgR2FtZVNjcmVlbihnYW1lTW9kZWwsIGdhbWUpKTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBcHBsaWNhdGlvbiB7XG5cbiAgc3RhdGljIGluaXQoKSB7XG4gICAgd2VsY29tZVNjcmVlbi5uZXh0U2NyZWVuID0gZ3JlZXRpbmdTY3JlZW47XG4gICAgZ3JlZXRpbmdTY3JlZW4ubmV4dFNjcmVlbiA9IHJ1bGVzU2NyZWVuO1xuICAgIHJ1bGVzU2NyZWVuLm5leHRTY3JlZW4gPSBnYW1lU2NyZWVuc1swXTtcbiAgICBydWxlc1NjcmVlbi5zdGFydFNjcmVlbiA9IHdlbGNvbWVTY3JlZW47XG5cbiAgICBnYW1lU2NyZWVucy5mb3JFYWNoKChnYW1lU2NyZWVuLCBpbmRleCkgPT4ge1xuICAgICAgZ2FtZVNjcmVlbi5uZXh0U2NyZWVuID0gZ2FtZVNjcmVlbnNbaW5kZXggKyAxXTtcbiAgICAgIGdhbWVTY3JlZW4uc3RhcnRTY3JlZW4gPSB3ZWxjb21lU2NyZWVuO1xuICAgICAgZ2FtZVNjcmVlbi5lbmRTY3JlZW4gPSBzdGF0c1NjcmVlbjtcbiAgICB9KTtcblxuICAgIGdhbWVTY3JlZW5zW2dhbWVTY3JlZW5zLmxlbmd0aCAtIDFdLm5leHRTY3JlZW4gPSBzdGF0c1NjcmVlbjtcbiAgICBzdGF0c1NjcmVlbi5zdGFydFNjcmVlbiA9IHdlbGNvbWVTY3JlZW47XG4gIH1cblxuICBzdGF0aWMgc3RhcnQoKSB7XG4gICAgd2VsY29tZVNjcmVlbi5zaG93KCk7XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJJbnRyb1NjcmVlblZpZXciXSwibWFwcGluZ3MiOiI7OztFQUFBLE1BQU0sTUFBTSxHQUFHO0VBQ2YsRUFBRSxXQUFXLEVBQUUsRUFBRTtFQUNqQixFQUFFLFdBQVcsRUFBRSxDQUFDO0VBQ2hCLEVBQUUsY0FBYyxFQUFFLEtBQUs7RUFDdkIsRUFBRSxTQUFTLEVBQUU7RUFDYixJQUFJLEdBQUcsRUFBRSxDQUFDO0VBQ1YsSUFBSSxHQUFHLEVBQUUsQ0FBQztFQUNWLElBQUksS0FBSyxFQUFFLENBQUM7RUFDWixHQUFHO0VBQ0gsQ0FBQzs7RUNQYyxNQUFNLFNBQVMsQ0FBQztFQUMvQixFQUFFLFdBQVcsR0FBRztFQUNoQixJQUFJLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUM7RUFDMUIsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7RUFDckMsSUFBSSxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztFQUN2QixJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO0VBQzFDLElBQUksSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7RUFDN0IsR0FBRztBQUNIO0VBQ0EsRUFBRSxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUU7RUFDdkIsSUFBSSxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztFQUM1QixHQUFHO0FBQ0g7RUFDQSxFQUFFLElBQUksS0FBSyxHQUFHO0VBQ2QsSUFBSSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7RUFDdkIsR0FBRztBQUNIO0VBQ0EsRUFBRSxJQUFJLE9BQU8sR0FBRztFQUNoQixJQUFJLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztFQUN6QixHQUFHO0FBQ0g7RUFDQSxFQUFFLElBQUksS0FBSyxHQUFHO0VBQ2QsSUFBSSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7RUFDdkIsR0FBRztBQUNIO0VBQ0EsRUFBRSxJQUFJLFVBQVUsR0FBRztFQUNuQixJQUFJLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztFQUM1QixHQUFHO0FBQ0g7RUFDQSxFQUFFLEtBQUssR0FBRztFQUNWLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDO0VBQ3JDLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7RUFDdkIsSUFBSSxJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztFQUM3QixHQUFHO0FBQ0g7RUFDQSxFQUFFLFNBQVMsQ0FBQyxNQUFNLEVBQUU7RUFDcEIsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztFQUMvQixHQUFHO0FBQ0g7RUFDQSxFQUFFLFNBQVMsR0FBRztFQUNkLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtFQUMzQixNQUFNLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0VBQzlCLEtBQUs7RUFDTCxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtFQUNyQixNQUFNLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUNwQixLQUFLO0VBQ0wsR0FBRztBQUNIO0VBQ0EsRUFBRSxPQUFPLFdBQVcsR0FBRztFQUN2QixJQUFJLE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQztBQUNyQjtFQUNBLElBQUksS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLEVBQUU7RUFDakQsTUFBTSxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztFQUNyRCxNQUFNLFFBQVEsUUFBUTtFQUN0QixRQUFRLEtBQUssTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHO0VBQ2pDLFVBQVUsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDaEQsVUFBVSxNQUFNO0VBQ2hCLFFBQVEsS0FBSyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUc7RUFDakMsVUFBVSxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNoRCxVQUFVLE1BQU07RUFDaEIsUUFBUSxLQUFLLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSztFQUNuQyxVQUFVLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ2hELFVBQVUsTUFBTTtFQUNoQixPQUFPO0VBQ1AsS0FBSztBQUNMO0VBQ0EsSUFBSSxPQUFPLEtBQUssQ0FBQztFQUNqQixHQUFHO0FBQ0g7RUFDQSxFQUFFLE9BQU8saUJBQWlCLEdBQUc7RUFDN0IsSUFBSSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUM5RyxHQUFHO0FBQ0g7RUFDQSxFQUFFLE9BQU8sWUFBWSxDQUFDLEtBQUssRUFBRTtFQUM3QjtFQUNBO0VBQ0EsSUFBSSxPQUFPO0VBQ1gsTUFBTSxTQUFTLEVBQUUsS0FBSztFQUN0QixNQUFNLFFBQVEsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUc7RUFDcEMsTUFBTSxTQUFTLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUM7RUFDMUMsTUFBTSxJQUFJLEVBQUUsQ0FBQyx5QkFBeUIsQ0FBQztFQUN2QyxNQUFNLFNBQVM7RUFDZixNQUFNO0VBQ04sUUFBUTtFQUNSLFVBQVUsR0FBRztFQUNiLFVBQVU7RUFDVixZQUFZO0VBQ1osY0FBYyxHQUFHLEVBQUUsQ0FBQyxpQ0FBaUMsQ0FBQztFQUN0RCxjQUFjLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQztFQUM3QyxhQUFhO0VBQ2IsV0FBVztFQUNYLFVBQVUsYUFBYSxFQUFFLENBQUMsS0FBSyxDQUFDO0VBQ2hDLFNBQVM7RUFDVCxPQUFPO0VBQ1AsS0FBSyxDQUFDO0VBQ04sR0FBRztBQUNIO0VBQ0EsRUFBRSxPQUFPLFlBQVksQ0FBQyxLQUFLLEVBQUU7RUFDN0I7RUFDQTtFQUNBLElBQUksT0FBTztFQUNYLE1BQU0sU0FBUyxFQUFFLEtBQUs7RUFDdEIsTUFBTSxRQUFRLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHO0VBQ3BDLE1BQU0sU0FBUyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDO0VBQzFDLE1BQU0sSUFBSSxFQUFFLENBQUMsa0RBQWtELENBQUM7RUFDaEUsTUFBTSxTQUFTO0VBQ2YsTUFBTTtFQUNOLFFBQVE7RUFDUixVQUFVLEdBQUc7RUFDYixVQUFVO0VBQ1YsWUFBWTtFQUNaLGNBQWMsR0FBRyxFQUFFLENBQUMsaUNBQWlDLENBQUM7RUFDdEQsY0FBYyxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUM7RUFDN0MsYUFBYTtFQUNiLFdBQVc7RUFDWCxVQUFVLGFBQWEsRUFBRSxDQUFDLEtBQUssQ0FBQztFQUNoQyxTQUFTO0VBQ1QsUUFBUTtFQUNSLFVBQVUsR0FBRztFQUNiLFVBQVU7RUFDVixZQUFZO0VBQ1osY0FBYyxHQUFHLEVBQUUsQ0FBQyw4QkFBOEIsQ0FBQztFQUNuRCxjQUFjLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQztFQUM5QyxhQUFhO0VBQ2IsV0FBVztFQUNYLFVBQVUsYUFBYSxFQUFFLENBQUMsS0FBSyxDQUFDO0VBQ2hDLFNBQVM7RUFDVCxPQUFPO0VBQ1AsS0FBSyxDQUFDO0VBQ04sR0FBRztBQUNIO0VBQ0EsRUFBRSxPQUFPLFlBQVksQ0FBQyxLQUFLLEVBQUU7RUFDN0I7RUFDQTtFQUNBLElBQUksT0FBTztFQUNYLE1BQU0sU0FBUyxFQUFFLEtBQUs7RUFDdEIsTUFBTSxRQUFRLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLO0VBQ3RDLE1BQU0sU0FBUyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDO0VBQzFDLE1BQU0sSUFBSSxFQUFFLENBQUMsaUNBQWlDLENBQUM7RUFDL0MsTUFBTSxTQUFTLEVBQUU7RUFDakIsUUFBUTtFQUNSLFVBQVUsR0FBRztFQUNiLFVBQVU7RUFDVixZQUFZO0VBQ1osY0FBYyxHQUFHLEVBQUUsQ0FBQyxpQ0FBaUMsQ0FBQztFQUN0RCxjQUFjLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQztFQUM5QyxhQUFhO0VBQ2IsWUFBWTtFQUNaLGNBQWMsR0FBRyxFQUFFLENBQUMsK0JBQStCLENBQUM7RUFDcEQsY0FBYyxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUM7RUFDL0MsYUFBYTtFQUNiLFlBQVk7RUFDWixjQUFjLEdBQUcsRUFBRSxDQUFDLDhCQUE4QixDQUFDO0VBQ25ELGNBQWMsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDO0VBQy9DLGFBQWE7RUFDYixXQUFXO0VBQ1gsVUFBVSxhQUFhLEVBQUUsQ0FBQztFQUMxQixTQUFTO0VBQ1QsT0FBTztFQUNQLEtBQUssQ0FBQztFQUNOLEdBQUc7RUFDSDs7RUNqS2UsTUFBTSxZQUFZLENBQUM7QUFDbEM7RUFDQSxFQUFFLFdBQVcsR0FBRyxFQUFFO0FBQ2xCO0VBQ0E7RUFDQSxFQUFFLElBQUksUUFBUSxHQUFHLEVBQUU7QUFDbkI7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBLEVBQUUsSUFBSSxPQUFPLEdBQUc7RUFDaEIsSUFBSSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0VBQ25DO0VBQ0EsTUFBTSxNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztFQUNoRCxNQUFNLEdBQUcsQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO0VBQy9CLE1BQU0sTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQztFQUVsQyxNQUFNLE9BQU8sSUFBSSxDQUFDO0VBQ2xCO0VBQ0E7RUFDQTtFQUNBLEdBQUc7QUFDSDtFQUNBO0VBQ0EsRUFBRSxNQUFNLEdBQUc7RUFDWCxJQUFJLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0VBQ2pFLElBQUksTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7RUFDdkQsSUFBSSxhQUFhLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0VBQzFDLElBQUksYUFBYSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7RUFDNUMsR0FBRztBQUNIO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsRUFBRSxJQUFJLEdBQUcsRUFBRTtFQUNYOztFQ3BDZSxNQUFNLGdCQUFnQixTQUFTLFlBQVksQ0FBQztBQUMzRDtFQUNBLEVBQUUsV0FBVyxHQUFHO0VBQ2hCLElBQUksS0FBSyxFQUFFLENBQUM7RUFDWixHQUFHO0FBQ0g7RUFDQSxFQUFFLElBQUksUUFBUSxHQUFHO0VBQ2pCLElBQUksT0FBTyxDQUFDO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixDQUFDLENBQUM7RUFDeEIsR0FBRztBQUNIO0VBQ0EsRUFBRSxNQUFNLEdBQUc7RUFDWCxJQUFJLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0VBQzFELElBQUksYUFBYSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7RUFDNUMsR0FBRztBQUNIO0VBQ0EsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFO0VBQ1gsSUFBSSxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztFQUMxRCxJQUFJLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0VBQ25ELElBQUksTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7RUFDMUQsSUFBSSxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO0VBQ2pFLElBQUksTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7RUFDekQsSUFBSSxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSztFQUNsRCxNQUFNLElBQUksR0FBRyxDQUFDLE9BQU8sS0FBSyxFQUFFLEVBQUU7RUFDOUIsUUFBUSxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7RUFDN0IsUUFBUSxhQUFhLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0VBQ3pDLE9BQU87RUFDUCxLQUFLLENBQUMsQ0FBQztFQUNQLElBQUksUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUs7RUFDaEQsTUFBTSxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7RUFDM0IsTUFBTSxhQUFhLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0VBQ3ZDLEtBQUssQ0FBQyxDQUFDO0VBQ1AsSUFBSSxTQUFTLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSztFQUNqRCxNQUFNLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztFQUMzQixNQUFNLGFBQWEsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7RUFDdkMsS0FBSyxDQUFDLENBQUM7RUFDUCxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLO0VBQzdDLE1BQU0sR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO0VBQzNCLE1BQU0sRUFBRSxFQUFFLENBQUM7RUFDWCxLQUFLLENBQUMsQ0FBQztFQUNQLEdBQUc7RUFDSDs7RUNwRGUsTUFBTSxjQUFjLENBQUM7QUFDcEM7RUFDQSxFQUFFLFdBQVcsR0FBRztFQUNoQixJQUFJLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0VBQzFCLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7RUFDckIsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztFQUNyQixJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0VBQ3RCLElBQUksSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7RUFDNUIsSUFBSSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztFQUMzQixJQUFJLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0VBQzFCLEdBQUc7QUFDSDtFQUNBO0VBQ0EsRUFBRSxJQUFJLEdBQUc7RUFDVCxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDdkIsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7RUFDekIsR0FBRztBQUNIO0VBQ0E7RUFDQSxFQUFFLGFBQWEsR0FBRyxFQUFFO0FBQ3BCO0VBQ0E7RUFDQSxFQUFFLFlBQVksR0FBRztFQUNqQixJQUFJLE1BQU0sWUFBWSxHQUFHLElBQUksZ0JBQWdCLEVBQUUsQ0FBQztFQUNoRCxJQUFJLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUMxQixJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTTtFQUM1QixNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7RUFDN0IsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO0VBQzlCLEtBQUssQ0FBQyxDQUFDO0VBQ1AsR0FBRztFQUNIOztFQzlCZSxNQUFNLGlCQUFpQixTQUFTLFlBQVksQ0FBQztBQUM1RDtFQUNBLEVBQUUsV0FBVyxHQUFHO0VBQ2hCLElBQUksS0FBSyxFQUFFLENBQUM7RUFDWixHQUFHO0FBQ0g7RUFDQSxFQUFFLElBQUksUUFBUSxHQUFHO0VBQ2pCLElBQUksT0FBTyxDQUFDO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsQ0FBQyxDQUFDO0VBQ3BCLEdBQUc7RUFDSDs7RUNqQmUsTUFBTSxZQUFZLFNBQVMsWUFBWSxDQUFDO0FBQ3ZEO0VBQ0EsRUFBRSxXQUFXLEdBQUc7RUFDaEIsSUFBSSxLQUFLLEVBQUUsQ0FBQztFQUNaLEdBQUc7QUFDSDtFQUNBLEVBQUUsSUFBSSxRQUFRLEdBQUc7RUFDakIsSUFBSSxPQUFPLENBQUMsZ0hBQWdILENBQUMsQ0FBQztFQUM5SCxHQUFHO0FBQ0g7RUFDQSxFQUFFLE1BQU0sR0FBRztFQUNYLElBQUksTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztFQUMzRCxJQUFJLGFBQWEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7RUFDdkUsR0FBRztBQUNIO0VBQ0EsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFO0VBQ1gsSUFBSSxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO0VBQ2hFLElBQUksUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7RUFDM0MsR0FBRztFQUNIOztFQ2hCZSxNQUFNLGFBQWEsU0FBUyxjQUFjLENBQUM7QUFDMUQ7RUFDQSxFQUFFLFdBQVcsR0FBRztFQUNoQixJQUFJLEtBQUssRUFBRSxDQUFDO0VBQ1osSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUlBLGlCQUFlLEVBQUUsQ0FBQztFQUN0QyxHQUFHO0FBQ0g7RUFDQSxFQUFFLGFBQWEsR0FBRztFQUNsQixJQUFJLE1BQU0sUUFBUSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7RUFDeEMsSUFBSSxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDdEIsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztFQUM5RCxHQUFHO0VBQ0g7O0VDZmUsTUFBTSxrQkFBa0IsU0FBUyxZQUFZLENBQUM7QUFDN0Q7RUFDQSxFQUFFLFdBQVcsR0FBRztFQUNoQixJQUFJLEtBQUssRUFBRSxDQUFDO0VBQ1osR0FBRztBQUNIO0VBQ0EsRUFBRSxJQUFJLFFBQVEsR0FBRztFQUNqQixJQUFJLE9BQU8sQ0FBQztBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQixDQUFDLENBQUM7RUFDcEIsR0FBRztFQUNIOztFQzVCZSxNQUFNLGNBQWMsU0FBUyxZQUFZLENBQUM7QUFDekQ7RUFDQSxFQUFFLFdBQVcsR0FBRztFQUNoQixJQUFJLEtBQUssRUFBRSxDQUFDO0VBQ1osR0FBRztBQUNIO0VBQ0EsRUFBRSxJQUFJLFFBQVEsR0FBRztFQUNqQixJQUFJLE9BQU8sQ0FBQztBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLENBQUMsQ0FBQztFQUN2QixHQUFHO0FBQ0g7RUFDQSxFQUFFLE1BQU0sR0FBRztFQUNYLElBQUksTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztFQUNyRSxJQUFJLGFBQWEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0VBQzVDLEdBQUc7QUFDSDtFQUNBLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRTtFQUNYLElBQUksTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztFQUNyRSxJQUFJLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0VBQzdDLEdBQUc7RUFDSDs7RUNyQmUsTUFBTSxjQUFjLFNBQVMsY0FBYyxDQUFDO0FBQzNEO0VBQ0EsRUFBRSxXQUFXLEdBQUc7RUFDaEIsSUFBSSxLQUFLLEVBQUUsQ0FBQztFQUNaLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLGtCQUFrQixFQUFFLENBQUM7RUFDekMsR0FBRztBQUNIO0VBQ0EsRUFBRSxhQUFhLEdBQUc7RUFDbEIsSUFBSSxNQUFNLFVBQVUsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO0VBQzVDLElBQUksVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ3hCLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7RUFDaEUsR0FBRztFQUNIOztFQ2ZlLE1BQU0sZUFBZSxTQUFTLFlBQVksQ0FBQztBQUMxRDtFQUNBLEVBQUUsV0FBVyxHQUFHO0VBQ2hCLElBQUksS0FBSyxFQUFFLENBQUM7RUFDWixHQUFHO0FBQ0g7RUFDQSxFQUFFLElBQUksUUFBUSxHQUFHO0VBQ2pCLElBQUksT0FBTyxDQUFDO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsQ0FBQyxDQUFDO0VBQ3BCLEdBQUc7RUFDSDs7RUM3QmUsTUFBTSxhQUFhLFNBQVMsWUFBWSxDQUFDO0FBQ3hEO0VBQ0EsRUFBRSxXQUFXLEdBQUc7RUFDaEIsSUFBSSxLQUFLLEVBQUUsQ0FBQztFQUNaLEdBQUc7QUFDSDtFQUNBLEVBQUUsSUFBSSxRQUFRLEdBQUc7RUFDakIsSUFBSSxPQUFPLENBQUMsK0RBQStELENBQUMsQ0FBQztFQUM3RSxHQUFHO0FBQ0g7RUFDQSxFQUFFLE1BQU0sR0FBRztFQUNYLElBQUksTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztFQUNyRSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO0VBQzVCLElBQUksYUFBYSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7RUFDNUMsR0FBRztBQUNIO0VBQ0EsRUFBRSxJQUFJLEdBQUc7RUFDVCxJQUFJLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO0VBQzlELElBQUksTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7RUFDOUQsSUFBSSxTQUFTLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxNQUFNO0VBQzlDLE1BQU0sUUFBUSxDQUFDLFFBQVEsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQztFQUNsRSxLQUFLLENBQUMsQ0FBQztFQUNQLEdBQUc7RUFDSDs7RUN2QmUsTUFBTSxlQUFlLFNBQVMsWUFBWSxDQUFDO0FBQzFEO0VBQ0EsRUFBRSxXQUFXLEdBQUc7RUFDaEIsSUFBSSxLQUFLLEVBQUUsQ0FBQztFQUNaLEdBQUc7QUFDSDtFQUNBLEVBQUUsSUFBSSxRQUFRLEdBQUc7RUFDakIsSUFBSSxPQUFPLENBQUMsMkVBQTJFLENBQUMsQ0FBQztFQUN6RixHQUFHO0FBQ0g7RUFDQSxFQUFFLE1BQU0sR0FBRztFQUNYLElBQUksTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztFQUNyRSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztFQUNqQyxJQUFJLGFBQWEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0VBQzVDLEdBQUc7QUFDSDtFQUNBLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRTtFQUNYLElBQUksTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7RUFDOUQsSUFBSSxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztFQUMzQyxHQUFHO0VBQ0g7O0VDcEJlLE1BQU0sYUFBYSxTQUFTLFlBQVksQ0FBQztBQUN4RDtFQUNBLEVBQUUsV0FBVyxHQUFHO0VBQ2hCLElBQUksS0FBSyxFQUFFLENBQUM7RUFDWixHQUFHO0FBQ0g7RUFDQSxFQUFFLElBQUksUUFBUSxHQUFHO0VBQ2pCLElBQUksT0FBTyxDQUFDO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsQ0FBQyxDQUFDO0VBQ3ZCLEdBQUc7QUFDSDtFQUNBLEVBQUUsTUFBTSxHQUFHO0VBQ1gsSUFBSSxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztFQUNsRSxJQUFJLGFBQWEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7RUFDdkUsR0FBRztBQUNIO0VBQ0EsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFO0VBQ1gsSUFBSSxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztFQUN0RCxJQUFJLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0VBQzVDLEdBQUc7RUFDSDs7RUN0QmUsTUFBTSxXQUFXLFNBQVMsY0FBYyxDQUFDO0FBQ3hEO0VBQ0EsRUFBRSxXQUFXLENBQUMsU0FBUyxFQUFFO0VBQ3pCLElBQUksS0FBSyxFQUFFLENBQUM7RUFDWixJQUFJLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0VBQy9CLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLGVBQWUsRUFBRSxDQUFDO0VBQ3RDLEdBQUc7QUFDSDtFQUNBLEVBQUUsYUFBYSxHQUFHO0VBQ2xCLElBQUksTUFBTSxTQUFTLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQztFQUMxQyxJQUFJLE1BQU0sUUFBUSxHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7RUFDM0MsSUFBSSxNQUFNLFNBQVMsR0FBRyxJQUFJLGFBQWEsRUFBRSxDQUFDO0VBQzFDLElBQUksTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUM3RCxJQUFJLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JEO0VBQ0EsSUFBSSxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDdkIsSUFBSSxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDdEIsSUFBSSxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDdkI7RUFDQSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7RUFDbkMsSUFBSSxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7RUFDckIsSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0VBQ2hDLEdBQUc7QUFDSDtFQUNBLEVBQUUsZ0JBQWdCLEdBQUc7RUFDckIsSUFBSSxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztFQUM5RCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7RUFDdkQsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO0VBQzNCLEdBQUc7RUFDSDs7RUNsQ2UsTUFBTSxjQUFjLFNBQVMsWUFBWSxDQUFDO0FBQ3pEO0VBQ0EsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFO0VBQ3BCLElBQUksS0FBSyxFQUFFLENBQUM7RUFDWixJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0VBQ3JCLEdBQUc7QUFDSDtFQUNBLEVBQUUsSUFBSSxRQUFRLEdBQUc7RUFDakIsSUFBSSxPQUFPLENBQUM7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQ0FBc0MsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztBQUN2RCxnQkFBZ0IsRUFBRSxjQUFjLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDcEU7QUFDQTtBQUNBLGtCQUFrQixDQUFDLENBQUM7RUFDcEIsR0FBRztBQUNIO0VBQ0EsRUFBRSxPQUFPLGNBQWMsQ0FBQyxRQUFRLEVBQUU7RUFDbEMsSUFBSSxJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztFQUNyQixJQUFJLElBQUksUUFBUSxLQUFLLENBQUMsRUFBRTtFQUN4QixNQUFNLE9BQU8sR0FBRyxDQUFDO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsQ0FBQyxDQUFDO0VBQ3hCLEtBQUssTUFBTSxJQUFJLFFBQVEsS0FBSyxDQUFDLEVBQUU7RUFDL0IsTUFBTSxPQUFPLEdBQUcsQ0FBQztBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixDQUFDLENBQUM7RUFDMUIsS0FBSyxNQUFNLElBQUksUUFBUSxLQUFLLENBQUMsRUFBRTtFQUMvQixNQUFNLE9BQU8sR0FBRyxDQUFDO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixDQUFDLENBQUM7RUFDMUIsS0FBSztFQUNMLElBQUksT0FBTyxPQUFPLENBQUM7RUFDbkIsR0FBRztBQUNIO0VBQ0E7O0VDdERlLE1BQU0sY0FBYyxTQUFTLFlBQVksQ0FBQztBQUN6RDtFQUNBLEVBQUUsV0FBVyxHQUFHO0VBQ2hCLElBQUksS0FBSyxFQUFFLENBQUM7RUFDWixJQUFJLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0VBQzFCLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDO0VBQ3ZDLEdBQUc7QUFDSDtFQUNBLEVBQUUsSUFBSSxRQUFRLEdBQUc7RUFDakIsSUFBSSxNQUFNLElBQUksR0FBRyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQzVELElBQUksT0FBTyxDQUFDLHlCQUF5QixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztFQUNwRCxHQUFHO0FBQ0g7RUFDQSxFQUFFLElBQUksSUFBSSxHQUFHO0VBQ2IsSUFBSSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7RUFDdEIsR0FBRztBQUNIO0VBQ0EsRUFBRSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7RUFDcEIsSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQztFQUN6QixHQUFHO0FBQ0g7RUFDQSxFQUFFLElBQUksUUFBUSxHQUFHO0VBQ2pCLElBQUksT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0VBQzFCLEdBQUc7QUFDSDtFQUNBLEVBQUUsTUFBTSxHQUFHO0VBQ1gsSUFBSSxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztFQUNsRSxJQUFJLGFBQWEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7RUFDdkUsR0FBRztBQUNIO0VBQ0EsRUFBRSxNQUFNLEdBQUc7RUFDWCxJQUFJLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRTtFQUN6QyxNQUFNLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7RUFDbkMsTUFBTSxNQUFNLElBQUksR0FBRyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQzlELE1BQU0sTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7RUFDckUsTUFBTSxZQUFZLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztFQUN0QyxNQUFNLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7RUFDMUUsUUFBUSxZQUFZLENBQUMsS0FBSyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7RUFDL0MsT0FBTyxNQUFNO0VBQ2IsUUFBUSxZQUFZLENBQUMsS0FBSyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7RUFDN0MsT0FBTztFQUNQLEtBQUs7RUFDTCxHQUFHO0FBQ0g7RUFDQSxFQUFFLElBQUksR0FBRztFQUNULElBQUksSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7RUFDM0IsR0FBRztBQUNIO0VBQ0EsRUFBRSxPQUFPLGdCQUFnQixDQUFDLElBQUksRUFBRTtFQUNoQyxJQUFJLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQztFQUN6QixJQUFJLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQztFQUNoRCxJQUFJLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLElBQUksR0FBRyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQztFQUNqRSxJQUFJLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtFQUN6QixNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0VBQ3RCLEtBQUs7RUFDTCxJQUFJLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtFQUN6QixNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0VBQ3RCLEtBQUs7RUFDTCxJQUFJLE9BQU8sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztFQUMzQixHQUFHO0VBQ0g7O0VDNURlLE1BQU0sY0FBYyxTQUFTLFlBQVksQ0FBQztBQUN6RDtFQUNBLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRTtFQUNyQixJQUFJLEtBQUssRUFBRSxDQUFDO0VBQ1osSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztFQUN2QixHQUFHO0FBQ0g7RUFDQSxFQUFFLElBQUksUUFBUSxHQUFHO0VBQ2pCLElBQUksSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7RUFDcEIsSUFBSSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsRUFBRTtFQUNqRCxNQUFNLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLDREQUE0RCxDQUFDLENBQUM7RUFDMUksTUFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7RUFDbkIsS0FBSztFQUNMLElBQUksT0FBTyxDQUFDLHlCQUF5QixFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztFQUN0RCxHQUFHO0FBQ0g7RUFDQSxFQUFFLE1BQU0sR0FBRztFQUNYLElBQUksTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7RUFDbEUsSUFBSSxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztFQUNqRSxJQUFJLGFBQWEsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7RUFDMUMsSUFBSSxhQUFhLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztFQUM1QyxHQUFHO0VBQ0g7O0VDdkJlLE1BQU0sY0FBYyxTQUFTLFlBQVksQ0FBQztBQUN6RDtFQUNBLEVBQUUsV0FBVyxDQUFDLE9BQU8sRUFBRTtFQUN2QixJQUFJLEtBQUssRUFBRSxDQUFDO0VBQ1osSUFBSSxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztFQUMzQixHQUFHO0FBQ0g7RUFDQSxFQUFFLElBQUksUUFBUSxHQUFHO0VBQ2pCLElBQUksSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7RUFDcEIsSUFBSSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO0VBQ2pDLE1BQU0sTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNyQyxNQUFNLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDO0VBQ3hCLE1BQU0sSUFBSSxNQUFNLEVBQUU7RUFDbEIsUUFBUSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUU7RUFDekIsVUFBVSxRQUFRLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztFQUMvQixVQUFVLElBQUksTUFBTSxDQUFDLElBQUksR0FBRyxFQUFFLEVBQUU7RUFDaEMsWUFBWSxRQUFRLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUM5QixXQUFXO0VBQ1gsVUFBVSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEdBQUcsRUFBRSxFQUFFO0VBQ2hDLFlBQVksUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDOUIsV0FBVztFQUNYLFNBQVMsTUFBTTtFQUNmLFVBQVUsUUFBUSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7RUFDN0IsU0FBUztFQUNULE9BQU8sTUFBTTtFQUNiLFFBQVEsUUFBUSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7RUFDN0IsT0FBTztFQUNQLE1BQU0sTUFBTSxJQUFJLENBQUMsd0NBQXdDLEVBQUUsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0VBQzdFLEtBQUs7RUFDTCxJQUFJLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7RUFDOUMsQ0FBQztBQUNEO0VBQ0EsRUFBRSxNQUFNLEdBQUc7RUFDWCxJQUFJLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0VBQ2pFLElBQUksTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7RUFDMUQsSUFBSSxhQUFhLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0VBQzFDLElBQUksYUFBYSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7RUFDNUMsR0FBRztFQUNIOztFQ3ZDQSxNQUFNLEtBQUssR0FBRyxDQUFDLHdEQUF3RCxDQUFDLENBQUM7QUFDekU7RUFDQSxTQUFTLE9BQU8sQ0FBQyxNQUFNLEVBQUU7RUFDekIsRUFBRSxPQUFPLENBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7RUFDdkQsQ0FBQztBQUNEO0VBQ0EsU0FBUyxPQUFPLENBQUMsTUFBTSxFQUFFO0VBQ3pCLEVBQUUsT0FBTyxDQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO0VBQ3ZELENBQUM7QUFDRDtFQUNBLFNBQVMsU0FBUyxDQUFDLFNBQVMsRUFBRTtFQUM5QixFQUFFLE9BQU8sQ0FBWSxDQUFDLFNBQVMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7RUFDOUMsQ0FBQztBQUNEO0FBQ0EsY0FBZSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDOztFQ1o3QixNQUFNLHFCQUFxQixTQUFTLFlBQVksQ0FBQztBQUNoRTtFQUNBLEVBQUUsV0FBVyxDQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUU7RUFDbkMsSUFBSSxLQUFLLEVBQUUsQ0FBQztFQUNaLElBQUksSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7RUFDdkMsSUFBSSxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLGFBQWEsQ0FBQztFQUMxRSxJQUFJLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztFQUNwQyxHQUFHO0FBQ0g7RUFDQSxFQUFFLElBQUksUUFBUSxHQUFHO0VBQ2pCLElBQUksT0FBTyxDQUFDO0FBQ1osNERBQTRELEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyw2Q0FBNkMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLHNCQUFzQixFQUFFLElBQUksQ0FBQyxhQUFhLENBQUM7QUFDMUwsb0JBQW9CLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDeEQsb0JBQW9CLENBQUMsQ0FBQztFQUN0QixHQUFHO0FBQ0g7RUFDQSxFQUFFLE1BQU0sR0FBRztFQUNYLElBQUksTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0VBQzVGLElBQUksYUFBYSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7RUFDNUMsR0FBRztBQUNIO0VBQ0EsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFO0VBQ1gsSUFBSSxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7RUFDNUYsSUFBSSxNQUFNLGFBQWEsR0FBRyxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDO0VBQ3RGLElBQUksYUFBYSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7RUFDbEMsSUFBSSxhQUFhLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztFQUNoRCxHQUFHO0VBQ0g7O0VDM0JlLE1BQU0scUJBQXFCLFNBQVMsWUFBWSxDQUFDO0FBQ2hFO0VBQ0EsRUFBRSxXQUFXLENBQUMsYUFBYSxFQUFFLElBQUksRUFBRTtFQUNuQyxJQUFJLEtBQUssRUFBRSxDQUFDO0VBQ1osSUFBSSxJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztFQUN2QyxJQUFJLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsYUFBYSxDQUFDO0VBQzFFLElBQUksSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0VBQ3BDLEdBQUc7QUFDSDtFQUNBLEVBQUUsSUFBSSxRQUFRLEdBQUc7RUFDakIsSUFBSSxPQUFPLENBQUM7QUFDWiw0REFBNEQsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLDZDQUE2QyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsc0JBQXNCLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQztBQUMxTCxvQkFBb0IsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUN4RCxvQkFBb0IsQ0FBQyxDQUFDO0VBQ3RCLEdBQUc7QUFDSDtFQUNBLEVBQUUsTUFBTSxHQUFHO0VBQ1gsSUFBSSxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7RUFDNUYsSUFBSSxhQUFhLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztFQUM1QyxHQUFHO0FBQ0g7RUFDQSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUU7RUFDWCxJQUFJLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztFQUM1RixJQUFJLE1BQU0sYUFBYSxHQUFHLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLENBQUM7RUFDdEYsSUFBSSxhQUFhLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztFQUNsQyxJQUFJLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0VBQ2hELEdBQUc7RUFDSDs7RUMzQmUsTUFBTSxxQkFBcUIsU0FBUyxZQUFZLENBQUM7QUFDaEU7RUFDQSxFQUFFLFdBQVcsQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFO0VBQ2pDLElBQUksS0FBSyxFQUFFLENBQUM7RUFDWixJQUFJLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0VBQ25DLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7RUFDckIsSUFBSSxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDO0VBQ3pELEdBQUc7QUFDSDtFQUNBLEVBQUUsSUFBSSxRQUFRLEdBQUc7RUFDakIsSUFBSSxPQUFPLENBQUMsdUNBQXVDLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxLQUFLLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUMzSztBQUNBLGtCQUFrQixDQUFDLENBQUM7RUFDcEIsR0FBRztBQUNIO0VBQ0EsRUFBRSxNQUFNLEdBQUc7RUFDWCxJQUFJLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsNEJBQTRCLENBQUMsQ0FBQztFQUMvRSxJQUFJLGFBQWEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0VBQzVDLEdBQUc7QUFDSDtFQUNBLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRTtFQUNYLElBQUksTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7RUFDdkYsSUFBSSxhQUFhLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztFQUNoRCxHQUFHO0VBQ0g7O0VDM0JBO0VBQ0E7RUFDQTtFQUNBO0VBQ2dCLFNBQVMsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUU7RUFDOUMsRUFBRSxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO0VBQzFCLEVBQUUsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztFQUM1QixFQUFFLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUU7RUFDM0IsSUFBSSxNQUFNLFVBQVUsR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztFQUMzQyxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO0VBQ3hCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxDQUFDO0VBQzdDLEdBQUc7RUFDSCxFQUFFLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUU7RUFDN0IsSUFBSSxNQUFNLFVBQVUsR0FBRyxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztFQUM3QyxJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO0VBQzFCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxDQUFDO0VBQzNDLEdBQUc7RUFDSCxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7RUFDekI7O0VDZmUsTUFBTSxTQUFTLFNBQVMsWUFBWSxDQUFDO0FBQ3BEO0VBQ0EsRUFBRSxXQUFXLENBQUMsY0FBYyxFQUFFLElBQUksRUFBRTtFQUNwQyxJQUFJLEtBQUssRUFBRSxDQUFDO0VBQ1osSUFBSSxJQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztFQUN6QyxJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0VBQ3JCLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLENBQUMsRUFBRTtFQUM3QixNQUFNLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0VBQzVELEtBQUssTUFBTTtFQUNYLE1BQU0sSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDNUQsS0FBSztFQUNMLEdBQUc7QUFDSDtFQUNBLEVBQUUsSUFBSSxRQUFRLEdBQUc7RUFDakIsSUFBSSxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUMvRCxJQUFJLE9BQU8sQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0VBQ3JJLEdBQUc7QUFDSDtFQUNBLEVBQUUsTUFBTSxHQUFHO0VBQ1gsSUFBSSxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7RUFDN0YsSUFBSSxhQUFhLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztFQUM1QyxHQUFHO0VBQ0g7O0VDWmUsTUFBTSxVQUFVLFNBQVMsY0FBYyxDQUFDO0FBQ3ZEO0VBQ0EsRUFBRSxXQUFXLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRTtFQUMvQixJQUFJLEtBQUssRUFBRSxDQUFDO0VBQ1osSUFBSSxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztFQUMvQixJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0VBQ3JCLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUN6QyxHQUFHO0FBQ0g7RUFDQSxFQUFFLGFBQWEsR0FBRztFQUNsQixJQUFJLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7RUFDM0IsSUFBSSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0VBQ25DLElBQUksTUFBTSxVQUFVLEdBQUcsSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUNoRSxJQUFJLE1BQU0sVUFBVSxHQUFHLElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDbEU7RUFDQSxJQUFJLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUN4QixJQUFJLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUN4QjtFQUNBLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO0VBQ3RDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUN4QixJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUNwQjtFQUNBLElBQUksTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekQ7RUFDQSxJQUFJLElBQUksUUFBUSxLQUFLLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFO0VBQzNDLE1BQU0sTUFBTSxrQkFBa0IsR0FBRyxJQUFJLHFCQUFxQixDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztFQUNwRSxNQUFNLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7RUFDcEUsTUFBTSxNQUFNLEtBQUssR0FBRyxJQUFJLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7RUFDM0MsTUFBTSxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUNsQyxNQUFNLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ2xDLE1BQU0sS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ3JCLE1BQU0sa0JBQWtCLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0VBQzdDLE1BQU0sa0JBQWtCLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0VBQzdDLEtBQUssTUFBTSxJQUFJLFFBQVEsS0FBSyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTtFQUNsRCxNQUFNLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7RUFDcEUsTUFBTSxNQUFNLGtCQUFrQixHQUFHLElBQUkscUJBQXFCLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0VBQ3BFLE1BQU0sTUFBTSxNQUFNLEdBQUcsSUFBSSxTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0VBQzVDLE1BQU0sTUFBTSxrQkFBa0IsR0FBRyxJQUFJLHFCQUFxQixDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztFQUNwRSxNQUFNLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7RUFDcEUsTUFBTSxNQUFNLE1BQU0sR0FBRyxJQUFJLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7RUFDNUMsTUFBTSxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUNsQyxNQUFNLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ2xDLE1BQU0sTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ3RCLE1BQU0sa0JBQWtCLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0VBQzdDLE1BQU0sa0JBQWtCLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0VBQzdDLE1BQU0sa0JBQWtCLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDbEMsTUFBTSxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUNsQyxNQUFNLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUN0QixNQUFNLGtCQUFrQixDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztFQUM3QyxNQUFNLGtCQUFrQixDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztFQUM3QyxLQUFLLE1BQU0sSUFBSSxRQUFRLEtBQUssTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUU7RUFDcEQsTUFBTSxNQUFNLHNCQUFzQixHQUFHLElBQUkscUJBQXFCLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0VBQ3hFLE1BQU0sTUFBTSxNQUFNLEdBQUcsSUFBSSxTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0VBQzVDLE1BQU0sTUFBTSxzQkFBc0IsR0FBRyxJQUFJLHFCQUFxQixDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztFQUN4RSxNQUFNLE1BQU0sTUFBTSxHQUFHLElBQUksU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztFQUM1QyxNQUFNLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7RUFDeEUsTUFBTSxNQUFNLE1BQU0sR0FBRyxJQUFJLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7RUFDNUMsTUFBTSxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUN0QyxNQUFNLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUN0QixNQUFNLHNCQUFzQixDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ3RDLE1BQU0sTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ3RCLE1BQU0sc0JBQXNCLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDdEMsTUFBTSxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDdEIsTUFBTSxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7RUFDakQsTUFBTSxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7RUFDakQsTUFBTSxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7RUFDakQsS0FBSztBQUNMO0VBQ0EsSUFBSSxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNyRDtFQUNBLElBQUksTUFBTSxTQUFTLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQztFQUMxQyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUN2QixJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7RUFDaEMsR0FBRztBQUNIO0VBQ0EsRUFBRSxRQUFRLEdBQUc7RUFDYixJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFO0VBQ3BELE1BQU0sVUFBVSxDQUFDLE1BQU07RUFDdkIsUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQzVCLFFBQVEsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0VBQ3hCLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztFQUNmLEtBQUs7RUFDTCxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFO0VBQy9CLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUNqQyxLQUFLO0VBQ0wsR0FBRztBQUNIO0VBQ0EsRUFBRSxjQUFjLENBQUMsR0FBRyxFQUFFO0VBQ3RCLElBQUksTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztFQUMzQixJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRTtFQUNsRCxNQUFNLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQUM7RUFDdEMsTUFBTSxNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO0VBQ3ZELE1BQU0sTUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFDO0VBQzlCLE1BQU0sTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztFQUM3RSxNQUFNLE1BQU0sSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEtBQUssYUFBYSxDQUFDO0VBQzNELE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUNoQyxLQUFLLE1BQU07RUFDWCxNQUFNLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0VBQzlDLE1BQU0sSUFBSSxLQUFLLEVBQUU7RUFDakIsUUFBUSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztFQUN0RCxRQUFRLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDbEMsT0FBTztFQUNQLEtBQUs7RUFDTCxHQUFHO0FBQ0g7RUFDQSxFQUFFLGtCQUFrQixHQUFHO0VBQ3ZCLElBQUksTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDM0UsSUFBSSxPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEtBQUs7RUFDckMsTUFBTSxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUMzRSxNQUFNLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSztFQUN0QyxRQUFRLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0VBQ3BELFFBQVEsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDO0VBQzdCLE9BQU8sQ0FBQyxDQUFDO0VBQ1QsS0FBSyxDQUFDLENBQUM7RUFDUCxHQUFHO0FBQ0g7RUFDQSxFQUFFLHlCQUF5QixHQUFHO0VBQzlCLElBQUksTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDM0UsSUFBSSxPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEtBQUs7RUFDckMsTUFBTSxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUMzRSxNQUFNLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSztFQUN0QyxRQUFRLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0VBQ3BELFFBQVEsTUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUN6RCxRQUFRLE1BQU0sYUFBYSxHQUFHLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUNqRSxRQUFRLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUM7RUFDL0UsUUFBUSxPQUFPLEtBQUssQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxhQUFhLENBQUM7RUFDOUQsT0FBTyxDQUFDLENBQUM7RUFDVCxLQUFLLENBQUMsQ0FBQztFQUNQLEdBQUc7QUFDSDtFQUNBLEVBQUUsY0FBYyxDQUFDLElBQUksRUFBRTtFQUN2QixJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDM0IsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO0VBQ2YsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDO0VBQ2pDLEtBQUs7RUFDTCxJQUFJLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUU7RUFDbkMsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO0VBQzVCLEtBQUssTUFBTTtFQUNYLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztFQUM3QixLQUFLO0VBQ0wsR0FBRztBQUNIO0VBQ0EsRUFBRSxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsYUFBYSxFQUFFO0VBQzlDLElBQUksT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsYUFBYSxDQUFDO0VBQ2xGLEdBQUc7QUFDSDtFQUNBLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRTtFQUNwQixJQUFJLE1BQU0sSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUM7RUFDbEUsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0VBQ3RCLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztFQUMzQyxHQUFHO0FBQ0g7RUFDQSxFQUFFLE9BQU8sWUFBWSxDQUFDLEtBQUssRUFBRTtFQUM3QixJQUFJLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7RUFDbkMsR0FBRztBQUNIO0VBQ0EsRUFBRSxPQUFPLGdCQUFnQixDQUFDLEtBQUssRUFBRTtFQUNqQyxJQUFJLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUM7RUFDdkMsR0FBRztBQUNIO0VBQ0E7O0VDM0tlLE1BQU0sZUFBZSxTQUFTLFlBQVksQ0FBQztBQUMxRDtFQUNBLEVBQUUsV0FBVyxHQUFHO0VBQ2hCLElBQUksS0FBSyxFQUFFLENBQUM7RUFDWixHQUFHO0FBQ0g7RUFDQSxFQUFFLElBQUksUUFBUSxHQUFHO0VBQ2pCLElBQUksT0FBTyxDQUFDO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsQ0FBQyxDQUFDO0VBQ3BCLEdBQUc7QUFDSDtFQUNBOztFQ2pCQTtFQUNBO0VBQ0E7RUFDQTtFQUNBLFNBQVMsYUFBYSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUU7RUFDdkMsRUFBRSxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsRUFBRSxFQUFFO0VBQzNCLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQztFQUNkLEdBQUc7RUFDSCxFQUFFLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsTUFBTSxLQUFLO0VBQ2hELElBQUksSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFO0VBQ3JCLE1BQU0sR0FBRyxJQUFJLEdBQUcsQ0FBQztFQUNqQixLQUFLO0VBQ0wsSUFBSSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEdBQUcsRUFBRSxFQUFFO0VBQzFCLE1BQU0sR0FBRyxJQUFJLEVBQUUsQ0FBQztFQUNoQixLQUFLO0VBQ0wsSUFBSSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEdBQUcsRUFBRSxFQUFFO0VBQzFCLE1BQU0sR0FBRyxJQUFJLEVBQUUsQ0FBQztFQUNoQixLQUFLO0VBQ0wsSUFBSSxPQUFPLEdBQUcsQ0FBQztFQUNmLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztFQUNSLEVBQUUsT0FBTyxLQUFLLEdBQUcsS0FBSyxHQUFHLEVBQUUsQ0FBQztFQUM1QixDQUFDO0FBQ0Q7RUFDQSxTQUFTLG9CQUFvQixDQUFDLE9BQU8sRUFBRTtFQUN2QyxFQUFFLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sS0FBSyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDO0VBQ3hELENBQUM7QUFDRDtFQUNBLFNBQVMsa0JBQWtCLENBQUMsT0FBTyxFQUFFO0VBQ3JDLEVBQUUsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxLQUFLLE1BQU0sQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDO0VBQzdELENBQUM7QUFDRDtFQUNBLFNBQVMsbUJBQW1CLENBQUMsT0FBTyxFQUFFO0VBQ3RDLEVBQUUsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxLQUFLLE1BQU0sQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDO0VBQzdEOztFQzdCZSxNQUFNLGVBQWUsU0FBUyxZQUFZLENBQUM7QUFDMUQ7RUFDQSxFQUFFLFdBQVcsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFO0VBQzlCLElBQUksS0FBSyxFQUFFLENBQUM7RUFDWixJQUFJLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0VBQzNCLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7RUFDdkIsR0FBRztBQUNIO0VBQ0EsRUFBRSxJQUFJLFFBQVEsR0FBRztFQUNqQixJQUFJLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxLQUFLLEVBQUUsQ0FBQztFQUM3QyxJQUFJLE1BQU0sS0FBSyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUMxRCxJQUFJLE1BQU0saUJBQWlCLEdBQUcsb0JBQW9CLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0VBQ2pFLElBQUksTUFBTSxlQUFlLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0VBQzdELElBQUksTUFBTSxnQkFBZ0IsR0FBRyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7RUFDL0QsSUFBSSxNQUFNLFVBQVUsR0FBRyxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7RUFDeEQsSUFBSSxPQUFPLENBQUM7QUFDWixzREFBc0QsRUFBRSxDQUFDLEtBQUssSUFBSSxLQUFLLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFDN0c7QUFDQTtBQUNBO0FBQ0EsWUFBWSxFQUFFLFVBQVUsQ0FBQyxRQUFRLENBQUM7QUFDbEM7QUFDQTtBQUNBLG9DQUFvQyxFQUFFLENBQUMsS0FBSyxJQUFJLGlCQUFpQixHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ2xGO0FBQ0EsUUFBUSxFQUFFLENBQUMsZUFBZSxJQUFJLGVBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN6RixRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLGVBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDL0UsUUFBUSxFQUFFLENBQUMsZ0JBQWdCLElBQUksZUFBZSxDQUFDLHFCQUFxQixDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDNUY7QUFDQSxjQUFjLENBQUMsQ0FBQztFQUNoQixHQUFHO0FBQ0g7RUFDQSxFQUFFLE1BQU0sR0FBRztFQUNYLElBQUksTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7RUFDMUQsSUFBSSxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztFQUNoRSxJQUFJLGFBQWEsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7RUFDMUMsSUFBSSxhQUFhLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztFQUM1QyxHQUFHO0FBQ0g7RUFDQSxFQUFFLE9BQU8sb0JBQW9CLENBQUMsZUFBZSxFQUFFO0VBQy9DLElBQUksT0FBTyxDQUFDO0FBQ1o7QUFDQTtBQUNBLGdDQUFnQyxFQUFFLGVBQWUsQ0FBQztBQUNsRDtBQUNBLGdDQUFnQyxFQUFFLGVBQWUsR0FBRyxFQUFFLENBQUM7QUFDdkQsU0FBUyxDQUFDLENBQUM7RUFDWCxHQUFHO0FBQ0g7RUFDQSxFQUFFLE9BQU8sb0JBQW9CLENBQUMsS0FBSyxFQUFFO0VBQ3JDLElBQUksT0FBTyxDQUFDO0FBQ1o7QUFDQTtBQUNBLGdDQUFnQyxFQUFFLEtBQUssQ0FBQztBQUN4QztBQUNBLGdDQUFnQyxFQUFFLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDN0MsU0FBUyxDQUFDLENBQUM7RUFDWCxHQUFHO0FBQ0g7RUFDQSxFQUFFLE9BQU8scUJBQXFCLENBQUMsZ0JBQWdCLEVBQUU7RUFDakQsSUFBSSxPQUFPLENBQUM7QUFDWjtBQUNBO0FBQ0EsZ0NBQWdDLEVBQUUsZ0JBQWdCLENBQUM7QUFDbkQ7QUFDQSxpQ0FBaUMsRUFBRSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7QUFDekQsU0FBUyxDQUFDLENBQUM7RUFDWCxHQUFHO0FBQ0g7RUFDQSxDQUFDO0FBQ0Q7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7O0VDdEZlLE1BQU0sV0FBVyxTQUFTLGNBQWMsQ0FBQztBQUN4RDtFQUNBLEVBQUUsV0FBVyxDQUFDLFNBQVMsRUFBRTtFQUN6QixJQUFJLEtBQUssRUFBRSxDQUFDO0VBQ1osSUFBSSxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztFQUMvQixJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxlQUFlLEVBQUUsQ0FBQztFQUN0QyxHQUFHO0FBQ0g7RUFDQSxFQUFFLGFBQWEsR0FBRztFQUNsQixJQUFJLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUMvRixJQUFJLE1BQU0sU0FBUyxHQUFHLElBQUksYUFBYSxFQUFFLENBQUM7RUFDMUMsSUFBSSxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNyRDtFQUNBLElBQUksZ0JBQWdCLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDOUIsSUFBSSxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDdkI7RUFDQSxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7RUFDaEMsR0FBRztFQUNIOztFQ2hCQSxNQUFNLFNBQVMsR0FBRyxJQUFJLFNBQVMsRUFBRSxDQUFDO0VBQ2xDLE1BQU0sYUFBYSxHQUFHLElBQUksYUFBYSxFQUFFLENBQUM7RUFDMUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztFQUM1QyxNQUFNLFdBQVcsR0FBRyxJQUFJLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztFQUMvQyxNQUFNLFdBQVcsR0FBRyxJQUFJLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztFQUMvQyxNQUFNLFdBQVcsR0FBRyxFQUFFLENBQUM7RUFDdkIsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEtBQUs7RUFDbEMsRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0VBQ3BELENBQUMsQ0FBQyxDQUFDO0FBQ0g7RUFDZSxNQUFNLFdBQVcsQ0FBQztBQUNqQztFQUNBLEVBQUUsT0FBTyxJQUFJLEdBQUc7RUFDaEIsSUFBSSxhQUFhLENBQUMsVUFBVSxHQUFHLGNBQWMsQ0FBQztFQUM5QyxJQUFJLGNBQWMsQ0FBQyxVQUFVLEdBQUcsV0FBVyxDQUFDO0VBQzVDLElBQUksV0FBVyxDQUFDLFVBQVUsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDNUMsSUFBSSxXQUFXLENBQUMsV0FBVyxHQUFHLGFBQWEsQ0FBQztBQUM1QztFQUNBLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFVBQVUsRUFBRSxLQUFLLEtBQUs7RUFDL0MsTUFBTSxVQUFVLENBQUMsVUFBVSxHQUFHLFdBQVcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7RUFDckQsTUFBTSxVQUFVLENBQUMsV0FBVyxHQUFHLGFBQWEsQ0FBQztFQUM3QyxNQUFNLFVBQVUsQ0FBQyxTQUFTLEdBQUcsV0FBVyxDQUFDO0VBQ3pDLEtBQUssQ0FBQyxDQUFDO0FBQ1A7RUFDQSxJQUFJLFdBQVcsQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxXQUFXLENBQUM7RUFDakUsSUFBSSxXQUFXLENBQUMsV0FBVyxHQUFHLGFBQWEsQ0FBQztFQUM1QyxHQUFHO0FBQ0g7RUFDQSxFQUFFLE9BQU8sS0FBSyxHQUFHO0VBQ2pCLElBQUksYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDO0VBQ3pCLEdBQUc7RUFDSDs7Ozs7Ozs7Iiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
