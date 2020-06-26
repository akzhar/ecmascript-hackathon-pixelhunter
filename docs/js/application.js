var application = (function () {
  'use strict';

  const config = {
    GAMES_DATA_URL: `https://raw.githubusercontent.com/akzhar/pixelhunter/master/src/js/game-model/data.json`,
    GAMES_COUNT: 10,
    LIVES_COUNT: 3,
    TIME_TO_ANSWER: 30000, // 30 sec
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
      this.game = game;
      this.image = game.answers[questionNumber].image;
    }

    get template() {
      const frameSize = config.QuestionTypeToFrameSize[this.game.type];
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


  // при рестарте удалять ранее созданный таймер

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

  async function getGamesPromise() {
    const response = await fetch(config.GAMES_DATA_URL);
    const gamesPromise = await response.json();
    return gamesPromise;
  }

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

  class Application {

    static init() {

      const gameModel = new GameModel();
      const welcomeScreen = new WelcomeScreen();
      const greetingScreen = new GreetingScreen();
      const rulesScreen = new RulesScreen(gameModel);
      const statsScreen = new StatsScreen(gameModel);

      const gameScreens = [];

      getGamesPromise().then(gamesArr => {

        const games = getRandom(gamesArr, config.GAMES_COUNT);
        gameModel._games = games;

        games.forEach((game, index) => {
          gameScreens.push(new GameScreen(gameModel, game, index));
        });

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

        welcomeScreen.show();

      });

    }
  }

  return Application;

}());

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGljYXRpb24uanMiLCJzb3VyY2VzIjpbInNyYy9qcy9jb25maWcuanMiLCJzcmMvanMvZ2FtZS1tb2RlbC9nYW1lLW1vZGVsLmpzIiwic3JjL2pzL2Fic3RyYWN0LXZpZXcuanMiLCJzcmMvanMvdXRpbC12aWV3cy9jb25maXJtLW1vZGFsLXZpZXcuanMiLCJzcmMvanMvYWJzdHJhY3Qtc2NyZWVuLmpzIiwic3JjL2pzL3dlbGNvbWUtc2NyZWVuL3dlbGNvbWUtc2NyZWVuLXZpZXcuanMiLCJzcmMvanMvd2VsY29tZS1zY3JlZW4vYXN0ZXJpc2stdmlldy5qcyIsInNyYy9qcy93ZWxjb21lLXNjcmVlbi93ZWxjb21lLXNjcmVlbi5qcyIsInNyYy9qcy9ncmVldGluZy1zY3JlZW4vZ3JlZXRpbmctc2NyZWVuLXZpZXcuanMiLCJzcmMvanMvZ3JlZXRpbmctc2NyZWVuL3N0YXJ0LWFycm93LXZpZXcuanMiLCJzcmMvanMvZ3JlZXRpbmctc2NyZWVuL2dyZWV0aW5nLXNjcmVlbi5qcyIsInNyYy9qcy9ydWxlcy1zY3JlZW4vcnVsZXMtc2NyZWVuLXZpZXcuanMiLCJzcmMvanMvcnVsZXMtc2NyZWVuL25hbWUtaW5wdXQtdmlldy5qcyIsInNyYy9qcy9ydWxlcy1zY3JlZW4vc3RhcnQtYnV0dG9uLXZpZXcuanMiLCJzcmMvanMvdXRpbC12aWV3cy9iYWNrLWFycm93LXZpZXcuanMiLCJzcmMvanMvcnVsZXMtc2NyZWVuL3J1bGVzLXNjcmVlbi5qcyIsInNyYy9qcy9nYW1lLXNjcmVlbi9nYW1lLXNjcmVlbi12aWV3LmpzIiwic3JjL2pzL2dhbWUtc2NyZWVuL3RpbWVyLWJsb2NrLXZpZXcuanMiLCJzcmMvanMvZ2FtZS1zY3JlZW4vbGl2ZXMtYmxvY2stdmlldy5qcyIsInNyYy9qcy91dGlsLXZpZXdzL3N0YXRzLWJsb2NrLXZpZXcuanMiLCJzcmMvanMvZGVidWcuanMiLCJzcmMvanMvZ2FtZS1zY3JlZW4vYW5zd2VyLXBob3RvLWJ1dHRvbi12aWV3LmpzIiwic3JjL2pzL2dhbWUtc2NyZWVuL2Fuc3dlci1wYWludC1idXR0b24tdmlldy5qcyIsInNyYy9qcy9nYW1lLXNjcmVlbi9hbnN3ZXItcGFpbnQtb3B0aW9uLXZpZXcuanMiLCJzcmMvanMvcmVzaXplLmpzIiwic3JjL2pzL2dhbWUtc2NyZWVuL2ltYWdlLXZpZXcuanMiLCJzcmMvanMvZ2FtZS1zY3JlZW4vZ2FtZS1zY3JlZW4uanMiLCJzcmMvanMvc3RhdHMtc2NyZWVuL3N0YXRzLXNjcmVlbi12aWV3LmpzIiwic3JjL2pzL3Njb3JlLmpzIiwic3JjL2pzL3N0YXRzLXNjcmVlbi9zdGF0cy1zaW5nbGUtdmlldy5qcyIsInNyYy9qcy9zdGF0cy1zY3JlZW4vc3RhdHMtc2NyZWVuLmpzIiwic3JjL2pzL2FwcGxpY2F0aW9uLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGNvbmZpZyA9IHtcbiAgR0FNRVNfREFUQV9VUkw6IGBodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vYWt6aGFyL3BpeGVsaHVudGVyL21hc3Rlci9zcmMvanMvZ2FtZS1tb2RlbC9kYXRhLmpzb25gLFxuICBHQU1FU19DT1VOVDogMTAsXG4gIExJVkVTX0NPVU5UOiAzLFxuICBUSU1FX1RPX0FOU1dFUjogMzAwMDAsIC8vIDMwIHNlY1xuICBBbnN3ZXJUeXBlOiB7XG4gICAgUEFJTlRJTkc6IGBwYWludGluZ2AsXG4gICAgUEhPVE86IGBwaG90b2BcbiAgfSxcbiAgUXVlc3Rpb25UeXBlOiB7XG4gICAgVFdPX09GX1RXTzogYHR3by1vZi10d29gLFxuICAgIFRJTkRFUl9MSUtFOiBgdGluZGVyLWxpa2VgLFxuICAgIE9ORV9PRl9USFJFRTogYG9uZS1vZi10aHJlZWBcbiAgfSxcbiAgUXVlc3Rpb25UeXBlVG9GcmFtZVNpemU6IHtcbiAgICAndHdvLW9mLXR3byc6IHt3aWR0aDogNDY4LCBoZWlnaHQ6IDQ1OH0sXG4gICAgJ3RpbmRlci1saWtlJzoge3dpZHRoOiA3MDUsIGhlaWdodDogNDU1fSxcbiAgICAnb25lLW9mLXRocmVlJzoge3dpZHRoOiAzMDQsIGhlaWdodDogNDU1fVxuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjb25maWc7XG4iLCJpbXBvcnQgY29uZmlnIGZyb20gJy4uL2NvbmZpZy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdhbWVNb2RlbCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3BsYXllck5hbWUgPSBgYDtcbiAgICB0aGlzLl9saXZlcyA9IGNvbmZpZy5MSVZFU19DT1VOVDtcbiAgICB0aGlzLl9nYW1lcyA9IFtdO1xuICAgIHRoaXMuX2Fuc3dlcnMgPSBbXTtcbiAgICB0aGlzLl9pc0dhbWVPdmVyID0gZmFsc2U7XG4gIH1cblxuICBzZXQgcGxheWVyTmFtZShuYW1lKSB7XG4gICAgdGhpcy5fcGxheWVyTmFtZSA9IG5hbWU7XG4gIH1cblxuICBnZXQgbGl2ZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xpdmVzO1xuICB9XG5cbiAgZ2V0IGFuc3dlcnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2Fuc3dlcnM7XG4gIH1cblxuICBnZXQgZ2FtZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dhbWVzO1xuICB9XG5cbiAgZ2V0IGlzR2FtZU92ZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzR2FtZU92ZXI7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB0aGlzLl9saXZlcyA9IGNvbmZpZy5MSVZFU19DT1VOVDtcbiAgICB0aGlzLl9hbnN3ZXJzID0gW107XG4gICAgdGhpcy5faXNHYW1lT3ZlciA9IGZhbHNlO1xuICB9XG5cbiAgYWRkQW5zd2VyKGFuc3dlcikge1xuICAgIHRoaXMuX2Fuc3dlcnMucHVzaChhbnN3ZXIpO1xuICB9XG5cbiAgbWludXNMaXZlKCkge1xuICAgIGlmICh0aGlzLl9saXZlcyA9PT0gMCkge1xuICAgICAgdGhpcy5faXNHYW1lT3ZlciA9IHRydWU7XG4gICAgfVxuICAgIGlmICh0aGlzLl9saXZlcykge1xuICAgICAgdGhpcy5fbGl2ZXMtLTtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgZ2V0Q29ycmVjdEFuc3dlcihnYW1lKSB7XG4gICAgY29uc3QgcXVlc3Rpb24gPSBnYW1lLnF1ZXN0aW9uO1xuICAgIGNvbnN0IGlzUGFpbnRpbmcgPSAvXFxz0YDQuNGB0YPQvdC+0LpcXHMvLnRlc3QocXVlc3Rpb24pO1xuICAgIGNvbnN0IGlzUGhvdG8gPSAvXFxz0YTQvtGC0L5cXHMvLnRlc3QocXVlc3Rpb24pO1xuICAgIGlmIChpc1BhaW50aW5nKSByZXR1cm4gYHBhaW50aW5nYDtcbiAgICBpZiAoaXNQaG90bykgcmV0dXJuIGBwaG90b2BcbiAgfVxuXG59XG4iLCJjb25zdCBlbGVtZW50cyA9IHt9O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKCkge31cblxuICAvLyDQstC+0LfQstGA0LDRidCw0LXRgiDRgdGC0YDQvtC60YMsINGB0L7QtNC10YDQttCw0YnRg9GOINGA0LDQt9C80LXRgtC60YNcbiAgZ2V0IHRlbXBsYXRlKCkge31cblxuICAvLyDRgdC+0LfQtNCw0LXRgiDQuCDQstC+0LfQstGA0LDRidCw0LXRgiBET00t0Y3Qu9C10LzQtdC90YIg0L3QsCDQvtGB0L3QvtCy0LUg0YjQsNCx0LvQvtC90LBcbiAgLy8g0LTQvtC70LbQtdC9INGB0L7Qt9C00LDQstCw0YLRjCBET00t0Y3Qu9C10LzQtdC90YIg0YEg0L/QvtC80L7RidGM0Y4g0LzQtdGC0L7QtNCwIHJlbmRlciwg0LTQvtCx0LDQstC70Y/RgtGMINC10LzRgyDQvtCx0YDQsNCx0L7RgtGH0LjQutC4LCDRgSDQv9C+0LzQvtGJ0YzRjiDQvNC10YLQvtC00LAgYmluZCDQuCDQstC+0LfQstGA0LDRidCw0YLRjCDRgdC+0LfQtNCw0L3QvdGL0Lkg0Y3Qu9C10LzQtdC90YJcbiAgLy8g0JzQtdGC0L7QtCDQtNC+0LvQttC10L0g0LjRgdC/0L7Qu9GM0LfQvtCy0LDRgtGMINC70LXQvdC40LLRi9C1INCy0YvRh9C40YHQu9C10L3QuNGPIOKAlCDRjdC70LXQvNC10L3RgiDQtNC+0LvQttC10L0g0YHQvtC30LTQsNCy0LDRgtGM0YHRjyDQv9GA0Lgg0L/QtdGA0LLQvtC8INC+0LHRgNCw0YnQtdC90LjQuCDQuiDQs9C10YLRgtC10YAg0YEg0L/QvtC80L7RidGM0Y4g0LzQtdGC0L7QtNCwIHJlbmRlciwg0LTQvtC70LbQvdGLINC00L7QsdCw0LLQu9GP0YLRjNGB0Y8g0L7QsdGA0LDQsdC+0YLRh9C40LrQuCAo0LzQtdGC0L7QtCBiaW5kKS5cbiAgLy8g0J/RgNC4INC/0L7RgdC70LXQtNGD0Y7RidC40YUg0L7QsdGA0LDRidC10L3QuNGP0YUg0LTQvtC70LbQtdC9INC40YHQv9C+0LvRjNC30L7QstCw0YLRjNGB0Y8g0Y3Qu9C10LzQtdC90YIsINGB0L7Qt9C00LDQvdC90YvQuSDQv9GA0Lgg0L/QtdGA0LLQvtC8INCy0YvQt9C+0LLQtSDQs9C10YLRgtC10YDQsC5cbiAgZ2V0IGVsZW1lbnQoKSB7XG4gICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlO1xuICAgIC8vIGlmICghZWxlbWVudHMuaGFzT3duUHJvcGVydHkodGVtcGxhdGUpKSB7XG4gICAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGBkaXZgKTtcbiAgICAgIGRpdi5pbm5lckhUTUwgPSB0ZW1wbGF0ZTtcbiAgICAgIGNvbnN0IGVsZW0gPSBkaXYuZmlyc3RDaGlsZDtcbiAgICAgIGVsZW1lbnRzW3RlbXBsYXRlXSA9IGVsZW07XG4gICAgICByZXR1cm4gZWxlbTtcbiAgICAvLyB9IGVsc2Uge1xuICAgICAgLy8gcmV0dXJuIGVsZW1lbnRzW3RlbXBsYXRlXTtcbiAgICAvLyB9XG4gIH1cblxuICAvLyDQvtGC0YDQuNGB0L7QstGL0LLQsNC10YIgRE9NLdGN0LvQtdC80LXQvdGCLCDQtNC+0LHQsNCy0LvRj9C10YIg0L3QtdC+0LHRhdC+0LTQuNC80YvQtSDQvtCx0YDQsNCx0L7RgtGH0LjQutC4XG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgbWFpbi5jZW50cmFsYCk7XG4gICAgY29uc3Qgb2xkRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCNtYWluYCk7XG4gICAgcGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChvbGRFbGVtZW50KTtcbiAgICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XG4gIH1cblxuICAvLyDQtNC+0LHQsNCy0LvRj9C10YIg0L7QsdGA0LDQsdC+0YLRh9C40LrQuCDRgdC+0LHRi9GC0LjQuVxuICAvLyDQnNC10YLQvtC0INC/0L4g0YPQvNC+0LvRh9Cw0L3QuNGOINC90LjRh9C10LPQviDQvdC1INC00LXQu9Cw0LXRglxuICAvLyDQldGB0LvQuCDQvdGD0LbQvdC+INC+0LHRgNCw0LHQvtGC0LDRgtGMINC60LDQutC+0LUt0YLQviDRgdC+0LHRi9GC0LjQtSwg0YLQviDRjdGC0L7RgiDQvNC10YLQvtC0INC00L7Qu9C20LXQvSDQsdGL0YLRjCDQv9C10YDQtdC+0L/RgNC10LTQtdC70ZHQvSDQsiDQvdCw0YHQu9C10LTQvdC40LrQtSDRgSDQvdC10L7QsdGF0L7QtNC40LzQvtC5INC70L7Qs9C40LrQvtC5XG4gIGJpbmQoKSB7fVxufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25maXJtTW9kYWxWaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPHNlY3Rpb24gY2xhc3M9XCJtb2RhbFwiPlxuICAgICAgICAgICAgICA8Zm9ybSBjbGFzcz1cIm1vZGFsX19pbm5lclwiPlxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJtb2RhbF9fY2xvc2VcIiB0eXBlPVwiYnV0dG9uXCI+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInZpc3VhbGx5LWhpZGRlblwiPtCX0LDQutGA0YvRgtGMPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDxoMiBjbGFzcz1cIm1vZGFsX190aXRsZVwiPtCf0L7QtNGC0LLQtdGA0LbQtNC10L3QuNC1PC9oMj5cbiAgICAgICAgICAgICAgICA8cCBjbGFzcz1cIm1vZGFsX190ZXh0XCI+0JLRiyDRg9Cy0LXRgNC10L3RiyDRh9GC0L4g0YXQvtGC0LjRgtC1INC90LDRh9Cw0YLRjCDQuNCz0YDRgyDQt9Cw0L3QvtCy0L4/PC9wPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbF9fYnV0dG9uLXdyYXBwZXJcIj5cbiAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJtb2RhbF9fYnRuIG1vZGFsX19idG4tLW9rXCI+0J7QujwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cIm1vZGFsX19idG4gbW9kYWxfX2J0bi0tY2FuY2VsXCI+0J7RgtC80LXQvdCwPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgIDwvc2VjdGlvbj5gO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjbWFpbmApO1xuICAgIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIGJpbmQoY2IpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI21haW5gKTtcbiAgICBjb25zdCBtb2RhbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5tb2RhbGApO1xuICAgIGNvbnN0IGNsb3NlQnRuID0gbW9kYWwucXVlcnlTZWxlY3RvcihgLm1vZGFsX19jbG9zZWApO1xuICAgIGNvbnN0IGNhbmNlbEJ0biA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoYC5tb2RhbF9fYnRuLS1jYW5jZWxgKTtcbiAgICBjb25zdCBva0J0biA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoYC5tb2RhbF9fYnRuLS1va2ApO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoYGtleWRvd25gLCAoZXZ0KSA9PiB7XG4gICAgICBpZiAoZXZ0LmtleUNvZGUgPT09IDI3KSB7XG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBwYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKG1vZGFsKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBjbG9zZUJ0bi5hZGRFdmVudExpc3RlbmVyKGBjbGlja2AsIChldnQpID0+IHtcbiAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgcGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChtb2RhbCk7XG4gICAgfSk7XG4gICAgY2FuY2VsQnRuLmFkZEV2ZW50TGlzdGVuZXIoYGNsaWNrYCwgKGV2dCkgPT4ge1xuICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBwYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKG1vZGFsKTtcbiAgICB9KTtcbiAgICBva0J0bi5hZGRFdmVudExpc3RlbmVyKGBjbGlja2AsIChldnQpID0+IHtcbiAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgY2IoKTtcbiAgICB9KTtcbiAgfVxufVxuIiwiaW1wb3J0IENvbmZpcm1Nb2RhbFZpZXcgZnJvbSAnLi91dGlsLXZpZXdzL2NvbmZpcm0tbW9kYWwtdmlldy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFic3RyYWN0U2NyZWVuIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmdhbWVNb2RlbCA9IG51bGw7XG4gICAgdGhpcy5nYW1lID0gbnVsbDtcbiAgICB0aGlzLnZpZXcgPSBudWxsO1xuICAgIHRoaXMudGltZXIgPSBudWxsO1xuICAgIHRoaXMuc3RhcnRTY3JlZW4gPSBudWxsO1xuICAgIHRoaXMubmV4dFNjcmVlbiA9IG51bGw7XG4gICAgdGhpcy5lbmRTY3JlZW4gPSBudWxsO1xuICB9XG5cbiAgLy8g0LzQtdGC0L7QtCDQv9C+0LrQsNC30LAg0Y3QutGA0LDQvdCwINC+0YLRgNC40YHQvtCy0YvQstCw0LXRgiDRjdC60YDQsNC9INC4INC30LDQv9GD0YHQutCw0LXRgiDQvNC10YLQvtC0IF9vblNjcmVlblNob3dcbiAgc2hvdygpIHtcbiAgICB0aGlzLnZpZXcucmVuZGVyKCk7XG4gICAgdGhpcy5fb25TY3JlZW5TaG93KCk7XG4gIH1cblxuICAvLyDQvNC10YLQvtC0INGA0LXQsNC70LjQt9GD0LXRgiDQsdC40LfQvdC10YEg0LvQvtCz0LjQutGDINGN0LrRgNCw0L3QsFxuICBfb25TY3JlZW5TaG93KCkge31cblxuICAvLyDQvNC10YLQvtC0INC/0LXRgNC10LfQsNC/0YPRgdC60LDQtdGCINC40LPRgNGDXG4gIF9yZXN0YXJ0R2FtZSgpIHtcbiAgICBjb25zdCBjb25maXJtTW9kYWwgPSBuZXcgQ29uZmlybU1vZGFsVmlldygpO1xuICAgIGNvbmZpcm1Nb2RhbC5yZW5kZXIoKTtcbiAgICBjb25maXJtTW9kYWwuYmluZCgoKSA9PiB7XG4gICAgICB0aGlzLmdhbWVNb2RlbC5yZXNldCgpO1xuICAgICAgdGhpcy5zdGFydFNjcmVlbi5zaG93KCk7XG4gICAgfSk7XG4gIH1cbn1cbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV2VsY29tZVNjcmVlblZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuIGA8ZGl2IGlkPVwibWFpblwiIGNsYXNzPVwiY2VudHJhbF9fY29udGVudFwiPlxuICAgICAgICAgICAgICA8c2VjdGlvbiBpZD1cImludHJvXCIgY2xhc3M9XCJpbnRyb1wiPlxuICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgVE8gQVNURVJJU0sgLS0+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJpbnRyb19fbW90dG9cIj48c3VwPio8L3N1cD4g0K3RgtC+INC90LUg0YTQvtGC0L4uINCt0YLQviDRgNC40YHRg9C90L7QuiDQvNCw0YHQu9C+0Lwg0L3QuNC00LXRgNC70LDQvdC00YHQutC+0LPQviDRhdGD0LTQvtC20L3QuNC60LAt0YTQvtGC0L7RgNC10LDQu9C40YHRgtCwIFRqYWxmIFNwYXJuYWF5LjwvcD5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiaW50cm9fX3RvcCB0b3BcIiB0eXBlPVwiYnV0dG9uXCI+XG4gICAgICAgICAgICAgICAgICA8aW1nIHNyYz1cImltZy9pY29uLXRvcC5zdmdcIiB3aWR0aD1cIjcxXCIgaGVpZ2h0PVwiNzlcIiBhbHQ9XCLQotC+0L8g0LjQs9GA0L7QutC+0LJcIj5cbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICAgICAgPC9kaXY+YDtcbiAgfVxufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBc3Rlcmlza1ZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuIGA8YnV0dG9uIGNsYXNzPVwiaW50cm9fX2FzdGVyaXNrIGFzdGVyaXNrXCIgdHlwZT1cImJ1dHRvblwiPjxzcGFuIGNsYXNzPVwidmlzdWFsbHktaGlkZGVuXCI+0J/RgNC+0LTQvtC70LbQuNGC0Yw8L3NwYW4+KjwvYnV0dG9uPmA7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNpbnRybycpO1xuICAgIHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKHRoaXMuZWxlbWVudCwgcGFyZW50RWxlbWVudC5maXJzdENoaWxkKTtcbiAgfVxuXG4gIGJpbmQoY2IpIHtcbiAgICBjb25zdCBhc3RlcmlzayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5pbnRyb19fYXN0ZXJpc2tgKTtcbiAgICBhc3Rlcmlzay5hZGRFdmVudExpc3RlbmVyKGBjbGlja2AsIGNiKTtcbiAgfVxufVxuIiwiaW1wb3J0IEFic3RyYWN0U2NyZWVuIGZyb20gJy4uL2Fic3RyYWN0LXNjcmVlbi5qcyc7XG5cbmltcG9ydCBJbnRyb1NjcmVlblZpZXcgZnJvbSAnLi93ZWxjb21lLXNjcmVlbi12aWV3LmpzJztcbmltcG9ydCBBc3Rlcmlza1ZpZXcgZnJvbSAnLi9hc3Rlcmlzay12aWV3LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV2VsY29tZVNjcmVlbiBleHRlbmRzIEFic3RyYWN0U2NyZWVuIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMudmlldyA9IG5ldyBJbnRyb1NjcmVlblZpZXcoKTtcbiAgfVxuXG4gIF9vblNjcmVlblNob3coKSB7XG4gICAgY29uc3QgYXN0ZXJpc2sgPSBuZXcgQXN0ZXJpc2tWaWV3KCk7XG4gICAgYXN0ZXJpc2sucmVuZGVyKCk7XG4gICAgYXN0ZXJpc2suYmluZCh0aGlzLm5leHRTY3JlZW4uc2hvdy5iaW5kKHRoaXMubmV4dFNjcmVlbikpO1xuICB9XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyZWV0aW5nU2NyZWVuVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gYDxkaXYgaWQ9XCJtYWluXCIgY2xhc3M9XCJjZW50cmFsX19jb250ZW50XCI+XG4gICAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzPVwiZ3JlZXRpbmcgY2VudHJhbC0tYmx1clwiPlxuICAgICAgICAgICAgICAgIDxpbWcgY2xhc3M9XCJncmVldGluZ19fbG9nb1wiIHNyYz1cImltZy9sb2dvX3BoLWJpZy5zdmdcIiB3aWR0aD1cIjIwMVwiIGhlaWdodD1cIjg5XCIgYWx0PVwiUGl4ZWwgSHVudGVyXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyZWV0aW5nX19hc3RlcmlzayBhc3Rlcmlza1wiPjxzcGFuIGNsYXNzPVwidmlzdWFsbHktaGlkZGVuXCI+0K8g0L/RgNC+0YHRgtC+INC60YDQsNGB0LjQstCw0Y8g0LfQstGR0LfQtNC+0YfQutCwPC9zcGFuPio8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JlZXRpbmdfX2NoYWxsZW5nZVwiPlxuICAgICAgICAgICAgICAgICAgPGgzIGNsYXNzPVwiZ3JlZXRpbmdfX2NoYWxsZW5nZS10aXRsZVwiPtCb0YPRh9GI0LjQtSDRhdGD0LTQvtC20L3QuNC60Lgt0YTQvtGC0L7RgNC10LDQu9C40YHRgtGLINCx0YDQvtGB0LDRjtGCINGC0LXQsdC1INCy0YvQt9C+0LIhPC9oMz5cbiAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwiZ3JlZXRpbmdfX2NoYWxsZW5nZS10ZXh0XCI+0J/RgNCw0LLQuNC70LAg0LjQs9GA0Ysg0L/RgNC+0YHRgtGLOjwvcD5cbiAgICAgICAgICAgICAgICAgIDx1bCBjbGFzcz1cImdyZWV0aW5nX19jaGFsbGVuZ2UtbGlzdFwiPlxuICAgICAgICAgICAgICAgICAgICA8bGk+0J3Rg9C20L3QviDQvtGC0LvQuNGH0LjRgtGMINGA0LjRgdGD0L3QvtC6INC+0YIg0YTQvtGC0L7Qs9GA0LDRhNC40Lgg0Lgg0YHQtNC10LvQsNGC0Ywg0LLRi9Cx0L7RgC48L2xpPlxuICAgICAgICAgICAgICAgICAgICA8bGk+0JfQsNC00LDRh9CwINC60LDQttC10YLRgdGPINGC0YDQuNCy0LjQsNC70YzQvdC+0LksINC90L4g0L3QtSDQtNGD0LzQsNC5LCDRh9GC0L4g0LLRgdC1INGC0LDQuiDQv9GA0L7RgdGC0L4uPC9saT5cbiAgICAgICAgICAgICAgICAgICAgPGxpPtCk0L7RgtC+0YDQtdCw0LvQuNC30Lwg0L7QsdC80LDQvdGH0LjQsiDQuCDQutC+0LLQsNGA0LXQvS48L2xpPlxuICAgICAgICAgICAgICAgICAgICA8bGk+0J/QvtC80L3QuCwg0LPQu9Cw0LLQvdC+0LUg4oCUINGB0LzQvtGC0YDQtdGC0Ywg0L7Rh9C10L3RjCDQstC90LjQvNCw0YLQtdC70YzQvdC+LjwvbGk+XG4gICAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgVE8gU1RBUlQgQVJST1cgLS0+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImdyZWV0aW5nX190b3AgdG9wXCIgdHlwZT1cImJ1dHRvblwiPlxuICAgICAgICAgICAgICAgICAgPGltZyBzcmM9XCJpbWcvaWNvbi10b3Auc3ZnXCIgd2lkdGg9XCI3MVwiIGhlaWdodD1cIjc5XCIgYWx0PVwi0KLQvtC/INC40LPRgNC+0LrQvtCyXCI+XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgICAgIDwvZGl2PmA7XG4gIH1cbn1cbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhcnRBcnJvd1ZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuIGA8YnV0dG9uIGNsYXNzPVwiZ3JlZXRpbmdfX2NvbnRpbnVlXCIgdHlwZT1cImJ1dHRvblwiPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInZpc3VhbGx5LWhpZGRlblwiPtCf0YDQvtC00L7Qu9C20LjRgtGMPC9zcGFuPlxuICAgICAgICAgICAgICA8c3ZnIGNsYXNzPVwiaWNvblwiIHdpZHRoPVwiNjRcIiBoZWlnaHQ9XCI2NFwiIHZpZXdCb3g9XCIwIDAgNjQgNjRcIiBmaWxsPVwiIzAwMDAwMFwiPlxuICAgICAgICAgICAgICAgIDx1c2UgeGxpbms6aHJlZj1cImltZy9zcHJpdGUuc3ZnI2Fycm93LXJpZ2h0XCI+PC91c2U+XG4gICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgPC9idXR0b24+YDtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihgc2VjdGlvbi5ncmVldGluZ2ApO1xuICAgIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIGJpbmQoY2IpIHtcbiAgICBjb25zdCBzdGFydEFycm93ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmdyZWV0aW5nX19jb250aW51ZWApO1xuICAgIHN0YXJ0QXJyb3cuYWRkRXZlbnRMaXN0ZW5lcihgY2xpY2tgLCBjYik7XG4gIH1cbn1cbiIsImltcG9ydCBBYnN0cmFjdFNjcmVlbiBmcm9tICcuLi9hYnN0cmFjdC1zY3JlZW4uanMnO1xuXG5pbXBvcnQgR3JlZXRpbmdTY3JlZW5WaWV3IGZyb20gJy4vZ3JlZXRpbmctc2NyZWVuLXZpZXcuanMnO1xuaW1wb3J0IFN0YXJ0QXJyb3dWaWV3IGZyb20gJy4vc3RhcnQtYXJyb3ctdmlldy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyZWV0aW5nU2NyZWVuIGV4dGVuZHMgQWJzdHJhY3RTY3JlZW4ge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy52aWV3ID0gbmV3IEdyZWV0aW5nU2NyZWVuVmlldygpO1xuICB9XG5cbiAgX29uU2NyZWVuU2hvdygpIHtcbiAgICBjb25zdCBzdGFydEFycm93ID0gbmV3IFN0YXJ0QXJyb3dWaWV3KCk7XG4gICAgc3RhcnRBcnJvdy5yZW5kZXIoKTtcbiAgICBzdGFydEFycm93LmJpbmQodGhpcy5uZXh0U2NyZWVuLnNob3cuYmluZCh0aGlzLm5leHRTY3JlZW4pKTtcbiAgfVxufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSdWxlc1NjcmVlblZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuIGA8ZGl2IGlkPVwibWFpblwiIGNsYXNzPVwiY2VudHJhbF9fY29udGVudFwiPlxuICAgICAgICAgICAgICA8aGVhZGVyIGNsYXNzPVwiaGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBUTyBCQUNLIEFSUk9XIC0tPlxuICAgICAgICAgICAgICA8L2hlYWRlcj5cbiAgICAgICAgICAgICAgPHNlY3Rpb24gY2xhc3M9XCJydWxlc1wiPlxuICAgICAgICAgICAgICAgIDxoMiBjbGFzcz1cInJ1bGVzX190aXRsZVwiPtCf0YDQsNCy0LjQu9CwPC9oMj5cbiAgICAgICAgICAgICAgICA8dWwgY2xhc3M9XCJydWxlc19fZGVzY3JpcHRpb25cIj5cbiAgICAgICAgICAgICAgICAgIDxsaT7Qo9Cz0LDQtNCw0LkgMTAg0YDQsNC3INC00LvRjyDQutCw0LbQtNC+0LPQviDQuNC30L7QsdGA0LDQttC10L3QuNGPINGE0L7RgtC+XG4gICAgICAgICAgICAgICAgICAgIDxpbWcgY2xhc3M9XCJydWxlc19faWNvblwiIHNyYz1cImltZy9pY29uLXBob3RvLnBuZ1wiIHdpZHRoPVwiMzJcIiBoZWlnaHQ9XCIzMVwiIGFsdD1cItCk0L7RgtC+XCI+INC40LvQuCDRgNC40YHRg9C90L7QulxuICAgICAgICAgICAgICAgICAgICA8aW1nIGNsYXNzPVwicnVsZXNfX2ljb25cIiBzcmM9XCJpbWcvaWNvbi1wYWludC5wbmdcIiB3aWR0aD1cIjMyXCIgaGVpZ2h0PVwiMzFcIiBhbHQ9XCLQoNC40YHRg9C90L7QulwiPjwvbGk+XG4gICAgICAgICAgICAgICAgICA8bGk+0KTQvtGC0L7Qs9GA0LDRhNC40Y/QvNC4INC40LvQuCDRgNC40YHRg9C90LrQsNC80Lgg0LzQvtCz0YPRgiDQsdGL0YLRjCDQvtCx0LAg0LjQt9C+0LHRgNCw0LbQtdC90LjRjy48L2xpPlxuICAgICAgICAgICAgICAgICAgPGxpPtCd0LAg0LrQsNC20LTRg9GOINC/0L7Qv9GL0YLQutGDINC+0YLQstC+0LTQuNGC0YHRjyAzMCDRgdC10LrRg9C90LQuPC9saT5cbiAgICAgICAgICAgICAgICAgIDxsaT7QntGI0LjQsdC40YLRjNGB0Y8g0LzQvtC20L3QviDQvdC1INCx0L7Qu9C10LUgMyDRgNCw0LcuPC9saT5cbiAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwicnVsZXNfX3JlYWR5XCI+0JPQvtGC0L7QstGLPzwvcD5cbiAgICAgICAgICAgICAgICA8Zm9ybSBjbGFzcz1cInJ1bGVzX19mb3JtXCI+XG4gICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIFRPIE5BTUUgSU5QVVQgLS0+XG4gICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIFRPIFNUQVJUIEJVVFRPTiAtLT5cbiAgICAgICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgICAgIDwvZGl2PmA7XG4gIH1cbn1cbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTmFtZUlucHV0VmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gYDxpbnB1dCBjbGFzcz1cInJ1bGVzX19pbnB1dFwiIHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCLQktCw0YjQtSDQmNC80Y9cIj5gO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBmb3JtLnJ1bGVzX19mb3JtYCk7XG4gICAgdGhpcy5lbGVtZW50LnZhbHVlID0gYGA7XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgYmluZCgpIHtcbiAgICBjb25zdCBuYW1lSW5wdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAucnVsZXNfX2lucHV0YCk7XG4gICAgY29uc3Qgc3RhcnRCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAucnVsZXNfX2J1dHRvbmApO1xuICAgIG5hbWVJbnB1dC5hZGRFdmVudExpc3RlbmVyKGBpbnB1dGAsICgpID0+IHtcbiAgICAgIHN0YXJ0QnRuLmRpc2FibGVkID0gKG5hbWVJbnB1dC52YWx1ZSA9PT0gYGApID8gdHJ1ZSA6IGZhbHNlO1xuICAgIH0pO1xuICB9XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YXJ0QnV0dG9uVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gYDxidXR0b24gY2xhc3M9XCJydWxlc19fYnV0dG9uICBjb250aW51ZVwiIHR5cGU9XCJzdWJtaXRcIiBkaXNhYmxlZD5HbyE8L2J1dHRvbj5gO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBmb3JtLnJ1bGVzX19mb3JtYCk7XG4gICAgdGhpcy5lbGVtZW50LmRpc2FibGVkID0gdHJ1ZTtcbiAgICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XG4gIH1cblxuICBiaW5kKGNiKSB7XG4gICAgY29uc3Qgc3RhcnRCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAucnVsZXNfX2J1dHRvbmApO1xuICAgIHN0YXJ0QnRuLmFkZEV2ZW50TGlzdGVuZXIoYGNsaWNrYCwgY2IpO1xuICB9XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhY2tBcnJvd1ZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuIGA8YnV0dG9uIGNsYXNzPVwiYmFja1wiPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInZpc3VhbGx5LWhpZGRlblwiPtCS0LXRgNC90YPRgtGM0YHRjyDQuiDQvdCw0YfQsNC70YM8L3NwYW4+XG4gICAgICAgICAgICAgIDxzdmcgY2xhc3M9XCJpY29uXCIgd2lkdGg9XCI0NVwiIGhlaWdodD1cIjQ1XCIgdmlld0JveD1cIjAgMCA0NSA0NVwiIGZpbGw9XCIjMDAwMDAwXCI+XG4gICAgICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPVwiaW1nL3Nwcml0ZS5zdmcjYXJyb3ctbGVmdFwiPjwvdXNlPlxuICAgICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgICAgPHN2ZyBjbGFzcz1cImljb25cIiB3aWR0aD1cIjEwMVwiIGhlaWdodD1cIjQ0XCIgdmlld0JveD1cIjAgMCAxMDEgNDRcIiBmaWxsPVwiIzAwMDAwMFwiPlxuICAgICAgICAgICAgICAgIDx1c2UgeGxpbms6aHJlZj1cImltZy9zcHJpdGUuc3ZnI2xvZ28tc21hbGxcIj48L3VzZT5cbiAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICA8L2J1dHRvbj5gO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBoZWFkZXIuaGVhZGVyYCk7XG4gICAgcGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUodGhpcy5lbGVtZW50LCBwYXJlbnRFbGVtZW50LmZpcnN0Q2hpbGQpO1xuICB9XG5cbiAgYmluZChjYikge1xuICAgIGNvbnN0IGJhY2tBcnJvdyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5iYWNrYCk7XG4gICAgYmFja0Fycm93LmFkZEV2ZW50TGlzdGVuZXIoYGNsaWNrYCwgY2IpO1xuICB9XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RTY3JlZW4gZnJvbSAnLi4vYWJzdHJhY3Qtc2NyZWVuLmpzJztcblxuaW1wb3J0IFJ1bGVzU2NyZWVuVmlldyBmcm9tICcuL3J1bGVzLXNjcmVlbi12aWV3LmpzJztcbmltcG9ydCBOYW1lSW5wdXRWaWV3IGZyb20gJy4vbmFtZS1pbnB1dC12aWV3LmpzJztcbmltcG9ydCBTdGFydEJ1dHRvblZpZXcgZnJvbSAnLi9zdGFydC1idXR0b24tdmlldy5qcyc7XG5pbXBvcnQgQmFja0Fycm93VmlldyBmcm9tICcuLi91dGlsLXZpZXdzL2JhY2stYXJyb3ctdmlldy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJ1bGVzU2NyZWVuIGV4dGVuZHMgQWJzdHJhY3RTY3JlZW4ge1xuXG4gIGNvbnN0cnVjdG9yKGdhbWVNb2RlbCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5nYW1lTW9kZWwgPSBnYW1lTW9kZWw7XG4gICAgdGhpcy52aWV3ID0gbmV3IFJ1bGVzU2NyZWVuVmlldygpO1xuICB9XG5cbiAgX29uU2NyZWVuU2hvdygpIHtcbiAgICBjb25zdCBuYW1lSW5wdXQgPSBuZXcgTmFtZUlucHV0VmlldygpO1xuICAgIGNvbnN0IHN0YXJ0QnRuID0gbmV3IFN0YXJ0QnV0dG9uVmlldygpO1xuICAgIGNvbnN0IGJhY2tBcnJvdyA9IG5ldyBCYWNrQXJyb3dWaWV3KCk7XG4gICAgY29uc3Qgb25TdGFydEJ0bkNsaWNrID0gdGhpcy5fb25TdGFydEJ0bkNsaWNrLmJpbmQodGhpcyk7XG4gICAgY29uc3QgcmVzdGFydEdhbWUgPSB0aGlzLl9yZXN0YXJ0R2FtZS5iaW5kKHRoaXMpO1xuXG4gICAgbmFtZUlucHV0LnJlbmRlcigpO1xuICAgIHN0YXJ0QnRuLnJlbmRlcigpO1xuICAgIGJhY2tBcnJvdy5yZW5kZXIoKTtcblxuICAgIHN0YXJ0QnRuLmJpbmQob25TdGFydEJ0bkNsaWNrKTtcbiAgICBuYW1lSW5wdXQuYmluZCgpO1xuICAgIGJhY2tBcnJvdy5iaW5kKHJlc3RhcnRHYW1lKTtcbiAgfVxuXG4gIF9vblN0YXJ0QnRuQ2xpY2soKSB7XG4gICAgY29uc3QgbmFtZUlucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLnJ1bGVzX19pbnB1dGApO1xuICAgIHRoaXMuZ2FtZU1vZGVsLnBsYXllck5hbWUgPSBuYW1lSW5wdXQudmFsdWUudHJpbSgpO1xuICAgIHRoaXMubmV4dFNjcmVlbi5zaG93KCk7XG4gIH1cbn1cbiIsImltcG9ydCBjb25maWcgZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FtZVNjcmVlblZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKGdhbWUpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuIGA8ZGl2IGlkPVwibWFpblwiIGNsYXNzPVwiY2VudHJhbF9fY29udGVudFwiPlxuICAgICAgICAgICAgICA8aGVhZGVyIGNsYXNzPVwiaGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBUTyBCQUNLIEFSUk9XIC0tPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJnYW1lX190aW1lclwiPjwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJnYW1lX19saXZlc1wiPjwvZGl2PlxuICAgICAgICAgICAgICA8L2hlYWRlcj5cbiAgICAgICAgICAgICAgPHNlY3Rpb24gY2xhc3M9XCJnYW1lXCI+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJnYW1lX190YXNrXCI+JHt0aGlzLmdhbWUucXVlc3Rpb259PC9wPlxuICAgICAgICAgICAgICAgICR7R2FtZVNjcmVlblZpZXcuZ2V0R2FtZUNvbnRlbnQodGhpcy5nYW1lLnR5cGUpfVxuICAgICAgICAgICAgICAgIDx1bCBjbGFzcz1cInN0YXRzXCI+PC91bD5cbiAgICAgICAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICAgICAgPC9kaXY+YDtcbiAgfVxuXG4gIHN0YXRpYyBnZXRHYW1lQ29udGVudChnYW1lVHlwZSkge1xuICAgIGxldCBjb250ZW50ID0gYGA7XG4gICAgaWYgKGdhbWVUeXBlID09PSBjb25maWcuUXVlc3Rpb25UeXBlLlRJTkRFUl9MSUtFKSB7XG4gICAgICBjb250ZW50ID0gYDxmb3JtIGNsYXNzPVwiZ2FtZV9fY29udGVudCAgZ2FtZV9fY29udGVudC0td2lkZVwiPlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdhbWVfX29wdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBJTUFHRSAtLT5cbiAgICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgQU5TV0VSIFBIT1RPIEJVVFRPTiAtLT5cbiAgICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgQU5TV0VSIFBBSU5UIEJVVFRPTiAtLT5cbiAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICA8L2Zvcm0+YDtcbiAgICB9IGVsc2UgaWYgKGdhbWVUeXBlID09PSBjb25maWcuUXVlc3Rpb25UeXBlLlRXT19PRl9UV08pIHtcbiAgICAgIGNvbnRlbnQgPSBgPGZvcm0gY2xhc3M9XCJnYW1lX19jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdhbWVfX29wdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgSU1BR0UgLS0+XG4gICAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBBTlNXRVIgUEhPVE8gQlVUVE9OIC0tPlxuICAgICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgQU5TV0VSIFBBSU5UIEJVVFRPTiAtLT5cbiAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ2FtZV9fb3B0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBJTUFHRSAtLT5cbiAgICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIEFOU1dFUiBQSE9UTyBCVVRUT04gLS0+XG4gICAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBBTlNXRVIgUEFJTlQgQlVUVE9OIC0tPlxuICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICA8L2Zvcm0+YDtcbiAgICB9IGVsc2UgaWYgKGdhbWVUeXBlID09PSBjb25maWcuUXVlc3Rpb25UeXBlLk9ORV9PRl9USFJFRSkge1xuICAgICAgY29udGVudCA9IGA8Zm9ybSBjbGFzcz1cImdhbWVfX2NvbnRlbnQgIGdhbWVfX2NvbnRlbnQtLXRyaXBsZVwiPlxuICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIEFOU1dFUiBQQUlOVCBPUFRJT04gLS0+XG4gICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgQU5TV0VSIFBBSU5UIE9QVElPTiAtLT5cbiAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBBTlNXRVIgUEFJTlQgT1BUSU9OIC0tPlxuICAgICAgICAgICAgICAgICA8L2Zvcm0+YDtcbiAgICB9XG4gICAgcmV0dXJuIGNvbnRlbnQ7XG4gIH1cblxufVxuIiwiaW1wb3J0IGNvbmZpZyBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUaW1lckJsb2NrVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9pc0FjdGl2ZSA9IHRydWU7XG4gICAgdGhpcy5fdGltZSA9IGNvbmZpZy5USU1FX1RPX0FOU1dFUjtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICBjb25zdCB0aW1lID0gVGltZXJCbG9ja1ZpZXcuZ2V0VGltZUZvcm1hdHRlZCh0aGlzLnRpbWUpO1xuICAgIHJldHVybiBgPGRpdiBjbGFzcz1cImdhbWVfX3RpbWVyXCI+JHt0aW1lfTwvZGl2PmA7XG4gIH1cblxuICBnZXQgdGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fdGltZTtcbiAgfVxuXG4gIHNldCB0aW1lKG5ld1RpbWUpIHtcbiAgICB0aGlzLl90aW1lID0gbmV3VGltZTtcbiAgfVxuXG4gIGdldCBpc0FjdGl2ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5faXNBY3RpdmU7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYGhlYWRlci5oZWFkZXJgKTtcbiAgICBwYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZSh0aGlzLmVsZW1lbnQsIHBhcmVudEVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gIH1cblxuICB1cGRhdGUoKSB7XG4gICAgaWYgKHRoaXMuX2lzQWN0aXZlICYmIHRoaXMudGltZSA+IDApIHtcbiAgICAgIHRoaXMudGltZSA9IHRoaXMudGltZSAtIDEwMDA7XG4gICAgICBjb25zdCB0aW1lID0gVGltZXJCbG9ja1ZpZXcuZ2V0VGltZUZvcm1hdHRlZCh0aGlzLnRpbWUpO1xuICAgICAgY29uc3QgdGltZXJFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgZGl2LmdhbWVfX3RpbWVyYCk7XG4gICAgICB0aW1lckVsZW1lbnQudGV4dENvbnRlbnQgPSB0aW1lO1xuICAgICAgaWYgKHRoaXMudGltZSA9PT0gNTAwMCB8fCB0aGlzLnRpbWUgPT09IDMwMDAgfHwgdGhpcy50aW1lID09PSAxMDAwKSB7XG4gICAgICAgIHRpbWVyRWxlbWVudC5zdHlsZSA9IGBjb2xvcjogI2Q3NDA0MDtgO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGltZXJFbGVtZW50LnN0eWxlID0gYGNvbG9yOiBibGFjaztgO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHN0b3AoKSB7XG4gICAgdGhpcy5faXNBY3RpdmUgPSBmYWxzZTtcbiAgfVxuXG4gIHN0YXRpYyBnZXRUaW1lRm9ybWF0dGVkKHRpbWUpIHtcbiAgICBjb25zdCBSRUdFWCA9IC9eXFxkJC87XG4gICAgbGV0IG1pbiA9IGBgICsgTWF0aC5mbG9vcih0aW1lIC8gMTAwMCAvIDYwKTtcbiAgICBsZXQgc2VjID0gYGAgKyBNYXRoLmZsb29yKCh0aW1lIC0gKG1pbiAqIDEwMDAgKiA2MCkpIC8gMTAwMCk7XG4gICAgaWYgKFJFR0VYLnRlc3Qoc2VjKSkge1xuICAgICAgc2VjID0gYDAke3NlY31gO1xuICAgIH1cbiAgICBpZiAoUkVHRVgudGVzdChtaW4pKSB7XG4gICAgICBtaW4gPSBgMCR7bWlufWA7XG4gICAgfVxuICAgIHJldHVybiBgJHttaW59OiR7c2VjfWA7XG4gIH1cbn1cbiIsImltcG9ydCBjb25maWcgZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGl2ZXNCbG9ja1ZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKGxpdmVzKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmxpdmVzID0gbGl2ZXM7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgbGV0IHJlc3VsdCA9IGBgO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29uZmlnLkxJVkVTX0NPVU5UOyBpKyspIHtcbiAgICAgIHJlc3VsdCArPSBgPGltZyBzcmM9XCJpbWcvaGVhcnRfXyR7KHRoaXMubGl2ZXMgPiAwKSA/IGBmdWxsYCA6IGBlbXB0eWB9LnN2Z1wiIGNsYXNzPVwiZ2FtZV9faGVhcnRcIiBhbHQ9XCJMaWZlXCIgd2lkdGg9XCIzMVwiIGhlaWdodD1cIjI3XCI+YDtcbiAgICAgIHRoaXMubGl2ZXMtLTtcbiAgICB9XG4gICAgcmV0dXJuIGA8ZGl2IGNsYXNzPVwiZ2FtZV9fbGl2ZXNcIj4ke3Jlc3VsdH08L2Rpdj5gO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBoZWFkZXIuaGVhZGVyYCk7XG4gICAgY29uc3Qgb2xkRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYGRpdi5nYW1lX19saXZlc2ApO1xuICAgIHBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQob2xkRWxlbWVudCk7XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YXRzQmxvY2tWaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcihhbnN3ZXJzKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmFuc3dlcnMgPSBhbnN3ZXJzO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIGxldCByZXN1bHQgPSBgYDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICAgIGNvbnN0IGFuc3dlciA9IHRoaXMuYW5zd2Vyc1tpXTtcbiAgICAgIGxldCBtb2RpZmllciA9IGBgO1xuICAgICAgaWYgKGFuc3dlcikge1xuICAgICAgICBpZiAoYW5zd2VyLmlzT0spIHtcbiAgICAgICAgICBtb2RpZmllciA9IGBjb3JyZWN0YDtcbiAgICAgICAgICBpZiAoYW5zd2VyLnRpbWUgPCAxMCkge1xuICAgICAgICAgICAgbW9kaWZpZXIgPSBgZmFzdGA7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChhbnN3ZXIudGltZSA+IDIwKSB7XG4gICAgICAgICAgICBtb2RpZmllciA9IGBzbG93YDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbW9kaWZpZXIgPSBgd3JvbmdgO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtb2RpZmllciA9IGB1bmtub3duYDtcbiAgICAgIH1cbiAgICAgIHJlc3VsdCArPSBgPGxpIGNsYXNzPVwic3RhdHNfX3Jlc3VsdCBzdGF0c19fcmVzdWx0LS0ke21vZGlmaWVyfVwiPjwvbGk+YDtcbiAgICB9XG4gICAgcmV0dXJuIGA8dWwgY2xhc3M9XCJzdGF0c1wiPiR7cmVzdWx0fTwvdWw+YDtcbn1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYHNlY3Rpb24uZ2FtZWApO1xuICAgIGNvbnN0IG9sZEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGB1bC5zdGF0c2ApO1xuICAgIHBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQob2xkRWxlbWVudCk7XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG59XG4iLCJjb25zdCBERUJVR19PTiA9IHRydWU7XG5jb25zdCBTVFlMRSA9IGBzdHlsZT1cImJveC1zaGFkb3c6IDBweCAwcHggMTBweCAxMnB4IHJnYmEoMTksMTczLDI0LDEpO1wiYDtcblxuZnVuY3Rpb24gaXNQaG90byhhbnN3ZXIpIHtcbiAgcmV0dXJuIChERUJVR19PTiAmJiBhbnN3ZXIgPT09IGBwaG90b2ApID8gU1RZTEUgOiBgYDtcbn1cblxuZnVuY3Rpb24gaXNQYWludChhbnN3ZXIpIHtcbiAgcmV0dXJuIChERUJVR19PTiAmJiBhbnN3ZXIgPT09IGBwYWludGluZ2ApID8gU1RZTEUgOiBgYDtcbn1cblxuZnVuY3Rpb24gaXNDb3JyZWN0KGlzQ29ycmVjdCkge1xuICByZXR1cm4gKERFQlVHX09OICYmIGlzQ29ycmVjdCkgPyBTVFlMRSA6IGBgO1xufVxuXG5leHBvcnQgZGVmYXVsdCB7aXNQaG90bywgaXNQYWludCwgaXNDb3JyZWN0fTtcbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcbmltcG9ydCBkZWJ1ZyBmcm9tICcuLi9kZWJ1Zy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFuc3dlclBob3RvQnV0dG9uVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoYW5zd2VySW5kZXgsIGdhbWUpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XG4gICAgdGhpcy5hbnN3ZXJJbmRleCA9IGFuc3dlckluZGV4O1xuICAgIHRoaXMuYW5zd2VyVHlwZSA9IGdhbWUuYW5zd2Vyc1thbnN3ZXJJbmRleF0udHlwZTtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gYDxsYWJlbCBjbGFzcz1cImdhbWVfX2Fuc3dlciBnYW1lX19hbnN3ZXItLXBob3RvXCI+XG4gICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInZpc3VhbGx5LWhpZGRlblwiIHZhbHVlPVwicGhvdG9cIiBuYW1lPVwicXVlc3Rpb24gJHt0aGlzLmFuc3dlckluZGV4fVwiIHR5cGU9XCJyYWRpb1wiIGRhdGEtYW5zd2VyaW5kZXg9XCIke3RoaXMuYW5zd2VySW5kZXh9XCI+XG4gICAgICAgICAgICAgIDxzcGFuICR7ZGVidWcuaXNQaG90byh0aGlzLmFuc3dlclR5cGUpfT7QpNC+0YLQvjwvc3Bhbj5cbiAgICAgICAgICAgIDwvbGFiZWw+YDtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnZGl2LmdhbWVfX29wdGlvbicpW3RoaXMuYW5zd2VySW5kZXhdO1xuICAgIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIGJpbmQoY2IpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnZGl2LmdhbWVfX29wdGlvbicpW3RoaXMuYW5zd2VySW5kZXhdO1xuICAgIGNvbnN0IGFuc3dlckVsZW1lbnQgPSBwYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoYC5nYW1lX19hbnN3ZXItLXBob3RvID4gaW5wdXRgKTtcbiAgICBhbnN3ZXJFbGVtZW50LmNoZWNrZWQgPSBmYWxzZTtcbiAgICBhbnN3ZXJFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoYGNsaWNrYCwgY2IpO1xuICB9XG59XG4iLCJpbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5pbXBvcnQgZGVidWcgZnJvbSAnLi4vZGVidWcuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBbnN3ZXJQYWludEJ1dHRvblZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKGFuc3dlckluZGV4LCBnYW1lKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xuICAgIHRoaXMuYW5zd2VySW5kZXggPSBhbnN3ZXJJbmRleDtcbiAgICB0aGlzLmFuc3dlclR5cGUgPSBnYW1lLmFuc3dlcnNbYW5zd2VySW5kZXhdLnR5cGU7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuIGA8bGFiZWwgY2xhc3M9XCJnYW1lX19hbnN3ZXIgZ2FtZV9fYW5zd2VyLS1wYWludFwiPlxuICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJ2aXN1YWxseS1oaWRkZW5cIiB2YWx1ZT1cInBhaW50aW5nXCIgbmFtZT1cInF1ZXN0aW9uICR7dGhpcy5hbnN3ZXJJbmRleH1cIiB0eXBlPVwicmFkaW9cIiBkYXRhLWFuc3dlcmluZGV4PVwiJHt0aGlzLmFuc3dlckluZGV4fVwiPlxuICAgICAgICAgICAgICA8c3BhbiAke2RlYnVnLmlzUGFpbnQodGhpcy5hbnN3ZXJUeXBlKX0+0KDQuNGB0YPQvdC+0Lo8L3NwYW4+XG4gICAgICAgICAgICA8L2xhYmVsPmA7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2Rpdi5nYW1lX19vcHRpb24nKVt0aGlzLmFuc3dlckluZGV4XTtcbiAgICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XG4gIH1cblxuICBiaW5kKGNiKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2Rpdi5nYW1lX19vcHRpb24nKVt0aGlzLmFuc3dlckluZGV4XTtcbiAgICBjb25zdCBhbnN3ZXJFbGVtZW50ID0gcGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKGAuZ2FtZV9fYW5zd2VyLS1wYWludCA+IGlucHV0YCk7XG4gICAgYW5zd2VyRWxlbWVudC5jaGVja2VkID0gZmFsc2U7XG4gICAgYW5zd2VyRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGBjbGlja2AsIGNiKTtcbiAgfVxufVxuIiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuaW1wb3J0IGRlYnVnIGZyb20gJy4uL2RlYnVnLmpzJztcbmltcG9ydCBHYW1lTW9kZWwgZnJvbSAnLi4vZ2FtZS1tb2RlbC9nYW1lLW1vZGVsLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQW5zd2VyUGFpbnRPcHRpb25WaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcihhbnN3ZXJJbmRleCwgZ2FtZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5nYW1lID0gZ2FtZTtcbiAgICB0aGlzLmFuc3dlckluZGV4ID0gYW5zd2VySW5kZXg7XG4gICAgdGhpcy5hbnN3ZXJUeXBlID0gZ2FtZS5hbnN3ZXJzW2Fuc3dlckluZGV4XS50eXBlO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIGNvbnN0IGNvcnJlY3RBbnN3ZXIgPSBHYW1lTW9kZWwuZ2V0Q29ycmVjdEFuc3dlcih0aGlzLmdhbWUpO1xuICAgIHJldHVybiBgPGRpdiBjbGFzcz1cImdhbWVfX29wdGlvblwiIGRhdGEtYW5zd2VyPVwiJHt0aGlzLmFuc3dlclR5cGV9XCIgZGF0YS1hbnN3ZXJpbmRleD1cIiR7dGhpcy5hbnN3ZXJJbmRleH1cIiAke2RlYnVnLmlzQ29ycmVjdCh0aGlzLmFuc3dlclR5cGUgPT09IGNvcnJlY3RBbnN3ZXIpfT5cbiAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgSU1BR0UgLS0+XG4gICAgICAgICAgICA8L2Rpdj5gO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdmb3JtLmdhbWVfX2NvbnRlbnQtLXRyaXBsZScpO1xuICAgIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIGJpbmQoY2IpIHtcbiAgICBjb25zdCBhbnN3ZXJFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgLmdhbWVfX29wdGlvbmApW3RoaXMuYW5zd2VySW5kZXhdO1xuICAgIGFuc3dlckVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihgY2xpY2tgLCBjYik7XG4gIH1cbn1cbiIsIi8vIE1hbmFnaW5nIHNpemVcbi8vIEBwYXJhbSAge29iamVjdH0gZnJhbWUg0L7Qv9C40YHRi9Cy0LDQtdGCINGA0LDQt9C80LXRgNGLINGA0LDQvNC60LgsINCyINC60L7RgtC+0YDRi9C1INC00L7Qu9C20L3QviDQsdGL0YLRjCDQstC/0LjRgdCw0L3QviDQuNC30L7QsdGA0LDQttC10L3QuNC1XG4vLyBAcGFyYW0gIHtvYmplY3R9IGdpdmVuINC+0L/QuNGB0YvQstCw0LXRgiDRiNC40YDQuNC90YMg0Lgg0LLRi9GB0L7RgtGDINC40LfQvtCx0YDQsNC20LXQvdC40Y8sINC60L7RgtC+0YDQvtC1INC90YPQttC90L4g0L/QvtC00L7Qs9C90LDRgtGMINC/0L7QtCDRgNCw0LzQutGDXG4vLyBAcmV0dXJuIHtvYmplY3R9INC90L7QstGL0Lkg0L7QsdGK0LXQutGCLCDQutC+0YLQvtGA0YvQuSDQsdGD0LTQtdGCINGB0L7QtNC10YDQttCw0YLRjCDQuNC30LzQtdC90ZHQvdC90YvQtSDRgNCw0LfQvNC10YDRiyDQuNC30L7QsdGA0LDQttC10L3QuNGPXG5leHBvcnQgZGVmYXVsdCAgZnVuY3Rpb24gcmVzaXplKGZyYW1lLCBnaXZlbikge1xuICBsZXQgd2lkdGggPSBnaXZlbi53aWR0aDtcbiAgbGV0IGhlaWdodCA9IGdpdmVuLmhlaWdodDtcbiAgaWYgKHdpZHRoID4gZnJhbWUud2lkdGgpIHtcbiAgICBjb25zdCBtdWx0aXBsaWVyID0gd2lkdGggLyBmcmFtZS53aWR0aDtcbiAgICB3aWR0aCA9IGZyYW1lLndpZHRoO1xuICAgIGhlaWdodCA9IE1hdGguZmxvb3IoaGVpZ2h0IC8gbXVsdGlwbGllcik7XG4gIH1cbiAgaWYgKGhlaWdodCA+IGZyYW1lLmhlaWdodCkge1xuICAgIGNvbnN0IG11bHRpcGxpZXIgPSBoZWlnaHQgLyBmcmFtZS5oZWlnaHQ7XG4gICAgaGVpZ2h0ID0gZnJhbWUuaGVpZ2h0O1xuICAgIHdpZHRoID0gTWF0aC5mbG9vcih3aWR0aCAvIG11bHRpcGxpZXIpO1xuICB9XG4gIHJldHVybiB7d2lkdGgsIGhlaWdodH07XG59XG4iLCJpbXBvcnQgY29uZmlnIGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5pbXBvcnQgcmVzaXplIGZyb20gXCIuLi9yZXNpemUuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW1hZ2VWaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcihxdWVzdGlvbk51bWJlciwgZ2FtZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5xdWVzdGlvbk51bWJlciA9IHF1ZXN0aW9uTnVtYmVyO1xuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XG4gICAgdGhpcy5pbWFnZSA9IGdhbWUuYW5zd2Vyc1txdWVzdGlvbk51bWJlcl0uaW1hZ2U7XG4gIH1cblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgY29uc3QgZnJhbWVTaXplID0gY29uZmlnLlF1ZXN0aW9uVHlwZVRvRnJhbWVTaXplW3RoaXMuZ2FtZS50eXBlXTtcbiAgICBjb25zdCBpbWFnZVNpemUgPSB7d2lkdGg6IHRoaXMuaW1hZ2Uud2lkdGgsIGhlaWdodDogdGhpcy5pbWFnZS5oZWlnaHR9O1xuICAgIGNvbnN0IHJlc2l6ZWRJbWFnZVNpemUgPSByZXNpemUoZnJhbWVTaXplLCBpbWFnZVNpemUpO1xuICAgIHJldHVybiBgPGltZyBzcmM9XCIke3RoaXMuaW1hZ2UudXJsfVwiIGFsdD1cIk9wdGlvbiAke3RoaXMucXVlc3Rpb25OdW1iZXIgKyAxfVwiIHdpZHRoPVwiJHtyZXNpemVkSW1hZ2VTaXplLndpZHRofVwiIGhlaWdodD1cIiR7cmVzaXplZEltYWdlU2l6ZS5oZWlnaHR9XCI+YDtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnZGl2LmdhbWVfX29wdGlvbicpW3RoaXMucXVlc3Rpb25OdW1iZXJdO1xuICAgIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxufVxuIiwiaW1wb3J0IGNvbmZpZyBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IEFic3RyYWN0U2NyZWVuIGZyb20gJy4uL2Fic3RyYWN0LXNjcmVlbi5qcyc7XG5pbXBvcnQgR2FtZU1vZGVsIGZyb20gJy4uL2dhbWUtbW9kZWwvZ2FtZS1tb2RlbC5qcyc7XG5cbmltcG9ydCBHYW1lU2NyZWVuVmlldyBmcm9tICcuL2dhbWUtc2NyZWVuLXZpZXcuanMnO1xuaW1wb3J0IFRpbWVyQmxvY2tWaWV3IGZyb20gJy4vdGltZXItYmxvY2stdmlldy5qcyc7XG5pbXBvcnQgTGl2ZXNCbG9ja1ZpZXcgZnJvbSAnLi9saXZlcy1ibG9jay12aWV3LmpzJztcbmltcG9ydCBTdGF0c0Jsb2NrVmlldyBmcm9tICcuLi91dGlsLXZpZXdzL3N0YXRzLWJsb2NrLXZpZXcuanMnO1xuaW1wb3J0IEFuc3dlclBob3RvQnV0dG9uVmlldyBmcm9tICcuL2Fuc3dlci1waG90by1idXR0b24tdmlldy5qcyc7XG5pbXBvcnQgQW5zd2VyUGFpbnRCdXR0b25WaWV3IGZyb20gJy4vYW5zd2VyLXBhaW50LWJ1dHRvbi12aWV3LmpzJztcbmltcG9ydCBBbnN3ZXJQYWludE9wdGlvblZpZXcgZnJvbSAnLi9hbnN3ZXItcGFpbnQtb3B0aW9uLXZpZXcuanMnO1xuaW1wb3J0IEltYWdlVmlldyBmcm9tICcuL2ltYWdlLXZpZXcuanMnO1xuaW1wb3J0IEJhY2tBcnJvd1ZpZXcgZnJvbSAnLi4vdXRpbC12aWV3cy9iYWNrLWFycm93LXZpZXcuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHYW1lU2NyZWVuIGV4dGVuZHMgQWJzdHJhY3RTY3JlZW4ge1xuXG4gIGNvbnN0cnVjdG9yKGdhbWVNb2RlbCwgZ2FtZSwgaW5kZXgpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZ2FtZU1vZGVsID0gZ2FtZU1vZGVsO1xuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XG4gICAgdGhpcy5nYW1lSW5kZXggPSBpbmRleDtcbiAgICB0aGlzLnZpZXcgPSBuZXcgR2FtZVNjcmVlblZpZXcoZ2FtZSk7XG4gIH1cblxuICBfb25TY3JlZW5TaG93KCkge1xuICAgIGNvbnN0IGdhbWUgPSB0aGlzLmdhbWU7XG4gICAgY29uc3QgbGl2ZXNCbG9jayA9IG5ldyBMaXZlc0Jsb2NrVmlldyh0aGlzLmdhbWVNb2RlbC5saXZlcyk7XG4gICAgY29uc3Qgc3RhdHNCbG9jayA9IG5ldyBTdGF0c0Jsb2NrVmlldyh0aGlzLmdhbWVNb2RlbC5hbnN3ZXJzKTtcblxuICAgIGxpdmVzQmxvY2sucmVuZGVyKCk7XG4gICAgc3RhdHNCbG9jay5yZW5kZXIoKTtcblxuICAgIHRoaXMudGltZXIgPSBuZXcgVGltZXJCbG9ja1ZpZXcoKTtcbiAgICB0aGlzLnRpbWVyLnJlbmRlcigpO1xuICAgIHRoaXMuX3RpbWVyT24oKTtcblxuICAgIGNvbnN0IG9uRXZlcnlBbnN3ZXIgPSB0aGlzLl9vbkV2ZXJ5QW5zd2VyLmJpbmQodGhpcyk7XG4gICAgaWYgKGdhbWUudHlwZSA9PT0gY29uZmlnLlF1ZXN0aW9uVHlwZS5USU5ERVJfTElLRSkge1xuICAgICAgY29uc3QgYW5zd2VyMVBob3RvQnV0dG9uID0gbmV3IEFuc3dlclBob3RvQnV0dG9uVmlldygwLCBnYW1lKTtcbiAgICAgIGNvbnN0IGFuc3dlcjFQYWludEJ1dHRvbiA9IG5ldyBBbnN3ZXJQYWludEJ1dHRvblZpZXcoMCwgZ2FtZSk7XG4gICAgICBjb25zdCBpbWFnZSA9IG5ldyBJbWFnZVZpZXcoMCwgZ2FtZSk7XG4gICAgICBhbnN3ZXIxUGhvdG9CdXR0b24ucmVuZGVyKCk7XG4gICAgICBhbnN3ZXIxUGFpbnRCdXR0b24ucmVuZGVyKCk7XG4gICAgICBpbWFnZS5yZW5kZXIoKTtcbiAgICAgIGFuc3dlcjFQaG90b0J1dHRvbi5iaW5kKG9uRXZlcnlBbnN3ZXIpO1xuICAgICAgYW5zd2VyMVBhaW50QnV0dG9uLmJpbmQob25FdmVyeUFuc3dlcik7XG4gICAgfSBlbHNlIGlmIChnYW1lLnR5cGUgPT09IGNvbmZpZy5RdWVzdGlvblR5cGUuVFdPX09GX1RXTykge1xuICAgICAgY29uc3QgYW5zd2VyMVBob3RvQnV0dG9uID0gbmV3IEFuc3dlclBob3RvQnV0dG9uVmlldygwLCBnYW1lKTtcbiAgICAgIGNvbnN0IGFuc3dlcjFQYWludEJ1dHRvbiA9IG5ldyBBbnN3ZXJQYWludEJ1dHRvblZpZXcoMCwgZ2FtZSk7XG4gICAgICBjb25zdCBpbWFnZTEgPSBuZXcgSW1hZ2VWaWV3KDAsIGdhbWUpO1xuICAgICAgY29uc3QgYW5zd2VyMlBob3RvQnV0dG9uID0gbmV3IEFuc3dlclBob3RvQnV0dG9uVmlldygxLCBnYW1lKTtcbiAgICAgIGNvbnN0IGFuc3dlcjJQYWludEJ1dHRvbiA9IG5ldyBBbnN3ZXJQYWludEJ1dHRvblZpZXcoMSwgZ2FtZSk7XG4gICAgICBjb25zdCBpbWFnZTIgPSBuZXcgSW1hZ2VWaWV3KDEsIGdhbWUpO1xuICAgICAgYW5zd2VyMVBob3RvQnV0dG9uLnJlbmRlcigpO1xuICAgICAgYW5zd2VyMVBhaW50QnV0dG9uLnJlbmRlcigpO1xuICAgICAgaW1hZ2UxLnJlbmRlcigpO1xuICAgICAgYW5zd2VyMVBob3RvQnV0dG9uLmJpbmQob25FdmVyeUFuc3dlcik7XG4gICAgICBhbnN3ZXIxUGFpbnRCdXR0b24uYmluZChvbkV2ZXJ5QW5zd2VyKTtcbiAgICAgIGFuc3dlcjJQaG90b0J1dHRvbi5yZW5kZXIoKTtcbiAgICAgIGFuc3dlcjJQYWludEJ1dHRvbi5yZW5kZXIoKTtcbiAgICAgIGltYWdlMi5yZW5kZXIoKTtcbiAgICAgIGFuc3dlcjJQaG90b0J1dHRvbi5iaW5kKG9uRXZlcnlBbnN3ZXIpO1xuICAgICAgYW5zd2VyMlBhaW50QnV0dG9uLmJpbmQob25FdmVyeUFuc3dlcik7XG4gICAgfSBlbHNlIGlmIChnYW1lLnR5cGUgPT09IGNvbmZpZy5RdWVzdGlvblR5cGUuT05FX09GX1RIUkVFKSB7XG4gICAgICBjb25zdCBhbnN3ZXIxUGFpbnRPcHRpb25WaWV3ID0gbmV3IEFuc3dlclBhaW50T3B0aW9uVmlldygwLCBnYW1lKTtcbiAgICAgIGNvbnN0IGltYWdlMSA9IG5ldyBJbWFnZVZpZXcoMCwgZ2FtZSk7XG4gICAgICBjb25zdCBhbnN3ZXIyUGFpbnRPcHRpb25WaWV3ID0gbmV3IEFuc3dlclBhaW50T3B0aW9uVmlldygxLCBnYW1lKTtcbiAgICAgIGNvbnN0IGltYWdlMiA9IG5ldyBJbWFnZVZpZXcoMSwgZ2FtZSk7XG4gICAgICBjb25zdCBhbnN3ZXIzUGFpbnRPcHRpb25WaWV3ID0gbmV3IEFuc3dlclBhaW50T3B0aW9uVmlldygyLCBnYW1lKTtcbiAgICAgIGNvbnN0IGltYWdlMyA9IG5ldyBJbWFnZVZpZXcoMiwgZ2FtZSk7XG4gICAgICBhbnN3ZXIxUGFpbnRPcHRpb25WaWV3LnJlbmRlcigpO1xuICAgICAgaW1hZ2UxLnJlbmRlcigpO1xuICAgICAgYW5zd2VyMlBhaW50T3B0aW9uVmlldy5yZW5kZXIoKTtcbiAgICAgIGltYWdlMi5yZW5kZXIoKTtcbiAgICAgIGFuc3dlcjNQYWludE9wdGlvblZpZXcucmVuZGVyKCk7XG4gICAgICBpbWFnZTMucmVuZGVyKCk7XG4gICAgICBhbnN3ZXIxUGFpbnRPcHRpb25WaWV3LmJpbmQob25FdmVyeUFuc3dlcik7XG4gICAgICBhbnN3ZXIyUGFpbnRPcHRpb25WaWV3LmJpbmQob25FdmVyeUFuc3dlcik7XG4gICAgICBhbnN3ZXIzUGFpbnRPcHRpb25WaWV3LmJpbmQob25FdmVyeUFuc3dlcik7XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdGFydEdhbWUgPSB0aGlzLl9yZXN0YXJ0R2FtZS5iaW5kKHRoaXMpO1xuXG4gICAgY29uc3QgYmFja0Fycm93ID0gbmV3IEJhY2tBcnJvd1ZpZXcoKTtcbiAgICBiYWNrQXJyb3cucmVuZGVyKCk7XG4gICAgYmFja0Fycm93LmJpbmQocmVzdGFydEdhbWUpO1xuICB9XG5cbiAgX3RpbWVyT24oKSB7XG4gICAgaWYgKHRoaXMudGltZXIuaXNBY3RpdmUgJiYgdGhpcy50aW1lci50aW1lID4gMCkge1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMudGltZXIudXBkYXRlKCk7XG4gICAgICAgIHRoaXMuX3RpbWVyT24oKTtcbiAgICAgIH0sIDEwMDApO1xuICAgIH1cbiAgICBpZiAodGhpcy50aW1lci50aW1lID09PSAwKSB7XG4gICAgICB0aGlzLl9vblZhbGlkQW5zd2VyKGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICBfb25FdmVyeUFuc3dlcihldnQpIHtcbiAgICBpZiAodGhpcy5nYW1lLnR5cGUgPT09IGNvbmZpZy5RdWVzdGlvblR5cGUuT05FX09GX1RIUkVFKSB7XG4gICAgICBjb25zdCBpbnB1dCA9IGV2dC5jdXJyZW50VGFyZ2V0O1xuICAgICAgY29uc3QgYW5zd2VySW5kZXggPSBHYW1lU2NyZWVuLmdldEFuc3dlckluZGV4KGlucHV0KTtcbiAgICAgIGNvbnN0IGFjdHVhbEFuc3dlciA9IHRoaXMuX2dldEFuc3dlclR5cGUodGhpcy5nYW1lSW5kZXgsIGFuc3dlckluZGV4KTtcbiAgICAgIGNvbnN0IGNvcnJlY3RBbnN3ZXIgPSBHYW1lTW9kZWwuZ2V0Q29ycmVjdEFuc3dlcih0aGlzLmdhbWUpO1xuICAgICAgY29uc3QgaXNPSyA9IGFjdHVhbEFuc3dlciA9PT0gY29ycmVjdEFuc3dlcjtcbiAgICAgIHRoaXMuX29uVmFsaWRBbnN3ZXIoaXNPSyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGlzQWxsID0gdGhpcy5faXNBbGxBbnN3ZXJzR2l2ZW4oKTtcbiAgICAgIGlmIChpc0FsbCkge1xuICAgICAgICBjb25zdCBpc09LID0gdGhpcy5faXNBbGxBbnN3ZXJzR2l2ZW5Db3JyZWN0KCk7XG4gICAgICAgIHRoaXMuX29uVmFsaWRBbnN3ZXIoaXNPSyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2lzQWxsQW5zd2Vyc0dpdmVuKCkge1xuICAgIGNvbnN0IG9wdGlvbnMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYC5nYW1lX19vcHRpb25gKSk7XG4gICAgcmV0dXJuIG9wdGlvbnMuZXZlcnkoKG9wdGlvbikgPT4ge1xuICAgICAgY29uc3QgYW5zd2VycyA9IEFycmF5LmZyb20ob3B0aW9uLnF1ZXJ5U2VsZWN0b3JBbGwoYC5nYW1lX19hbnN3ZXJgKSk7XG4gICAgICByZXR1cm4gYW5zd2Vycy5zb21lKChhbnN3ZXIpID0+IHtcbiAgICAgICAgY29uc3QgaW5wdXQgPSBhbnN3ZXIucXVlcnlTZWxlY3RvcihgaW5wdXRgKTtcbiAgICAgICAgcmV0dXJuIGlucHV0LmNoZWNrZWQ7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIF9pc0FsbEFuc3dlcnNHaXZlbkNvcnJlY3QoKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgLmdhbWVfX29wdGlvbmApKTtcbiAgICByZXR1cm4gb3B0aW9ucy5ldmVyeSgob3B0aW9uKSA9PiB7XG4gICAgICBjb25zdCBhbnN3ZXJzID0gQXJyYXkuZnJvbShvcHRpb24ucXVlcnlTZWxlY3RvckFsbChgLmdhbWVfX2Fuc3dlcmApKTtcbiAgICAgIHJldHVybiBhbnN3ZXJzLnNvbWUoKGFuc3dlcikgPT4ge1xuICAgICAgICBjb25zdCBpbnB1dCA9IGFuc3dlci5xdWVyeVNlbGVjdG9yKGBpbnB1dGApO1xuICAgICAgICBjb25zdCBhbnN3ZXJJbmRleCA9IEdhbWVTY3JlZW4uZ2V0QW5zd2VySW5kZXgoaW5wdXQpO1xuICAgICAgICBjb25zdCBhY3R1YWxBbnN3ZXIgPSB0aGlzLl9nZXRBbnN3ZXJUeXBlKHRoaXMuZ2FtZUluZGV4LCBhbnN3ZXJJbmRleCk7XG4gICAgICAgIHJldHVybiBpbnB1dC5jaGVja2VkICYmIGlucHV0LnZhbHVlID09PSBhY3R1YWxBbnN3ZXI7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIF9vblZhbGlkQW5zd2VyKGlzT0spIHtcbiAgICB0aGlzLl9zYXZlQW5zd2VyKGlzT0spO1xuICAgIGlmICghaXNPSykge1xuICAgICAgdGhpcy5nYW1lTW9kZWwubWludXNMaXZlKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLmdhbWVNb2RlbC5pc0dhbWVPdmVyKSB7XG4gICAgICB0aGlzLmVuZFNjcmVlbi5zaG93KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubmV4dFNjcmVlbi5zaG93KCk7XG4gICAgfVxuICB9XG5cbiAgX2dldEFuc3dlclR5cGUoZ2FtZUluZGV4LCBhbnN3ZXJJbmRleCkge1xuICAgIHJldHVybiB0aGlzLmdhbWVNb2RlbC5nYW1lc1tnYW1lSW5kZXhdLmFuc3dlcnNbYW5zd2VySW5kZXhdLnR5cGU7XG4gIH1cblxuICBfc2F2ZUFuc3dlcihpc09LKSB7XG4gICAgY29uc3QgdGltZSA9IChjb25maWcuVElNRV9UT19BTlNXRVIgLSB0aGlzLnRpbWVyLnRpbWUpIC8gMTAwMDtcbiAgICB0aGlzLnRpbWVyLnN0b3AoKTtcbiAgICB0aGlzLmdhbWVNb2RlbC5hZGRBbnN3ZXIoe2lzT0ssIHRpbWV9KTtcbiAgfVxuXG4gIHN0YXRpYyBnZXRBbnN3ZXJJbmRleChpbnB1dCkge1xuICAgIHJldHVybiBpbnB1dC5kYXRhc2V0LmFuc3dlcmluZGV4O1xuICB9XG5cbn1cblxuXG4vLyDQv9GA0Lgg0YDQtdGB0YLQsNGA0YLQtSDRg9C00LDQu9GP0YLRjCDRgNCw0L3QtdC1INGB0L7Qt9C00LDQvdC90YvQuSDRgtCw0LnQvNC10YBcbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhdHNTY3JlZW5WaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPGRpdiBpZD1cIm1haW5cIiBjbGFzcz1cImNlbnRyYWxfX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgPGhlYWRlciBjbGFzcz1cImhlYWRlclwiPlxuICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgVE8gQkFDSyBBUlJPVyAtLT5cbiAgICAgICAgICAgICAgPC9oZWFkZXI+XG4gICAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzPVwicmVzdWx0XCI+PC9zZWN0aW9uPlxuICAgICAgICAgICAgPC9kaXY+YDtcbiAgfVxuXG59XG4iLCIvLyBTY29yaW5nIGF0IHRoZSBlbmQgb2YgdGhlIGdhbWVcbi8vIEBwYXJhbSAge2FycmF5fSBhbnN3ZXJzINC80LDRgdGB0LjQsiDQvtGC0LLQtdGC0L7QsiDQv9C+0LvRjNC30L7QstCw0YLQtdC70Y9cbi8vIEBwYXJhbSAge2ludGVnZXJ9IGxpdmVzINC60L7Quy3QstC+INC+0YHRgtCw0LLRiNC40YXRgdGPINC20LjQt9C90LXQuVxuLy8gQHJldHVybiB7aW50ZWdlcn0g0LrQvtC7LdCy0L4g0L3QsNCx0YDQsNC90L3Ri9GFINC+0YfQutC+0LJcbmZ1bmN0aW9uIGdldFRvdGFsU2NvcmUoYW5zd2VycywgbGl2ZXMpIHtcbiAgaWYgKGFuc3dlcnMubGVuZ3RoIDwgMTApIHtcbiAgICByZXR1cm4gLTE7XG4gIH1cbiAgY29uc3Qgc2NvcmUgPSBhbnN3ZXJzLnJlZHVjZSgoYWNjLCBhbnN3ZXIpID0+IHtcbiAgICBpZiAoYW5zd2VyLmlzT0spIHtcbiAgICAgIGFjYyArPSAxMDA7XG4gICAgfVxuICAgIGlmIChhbnN3ZXIudGltZSA8IDEwKSB7XG4gICAgICBhY2MgKz0gNTA7XG4gICAgfVxuICAgIGlmIChhbnN3ZXIudGltZSA+IDIwKSB7XG4gICAgICBhY2MgLT0gNTA7XG4gICAgfVxuICAgIHJldHVybiBhY2M7XG4gIH0sIDApO1xuICByZXR1cm4gc2NvcmUgKyBsaXZlcyAqIDUwO1xufVxuXG5mdW5jdGlvbiBnZXRSaWdodEFuc3dlcnNDb3VudChhbnN3ZXJzKSB7XG4gIHJldHVybiBhbnN3ZXJzLmZpbHRlcigoYW5zd2VyKSA9PiBhbnN3ZXIuaXNPSykubGVuZ3RoO1xufVxuXG5mdW5jdGlvbiBnZXRTcGVlZEJvbnVzQ291bnQoYW5zd2Vycykge1xuICByZXR1cm4gYW5zd2Vycy5maWx0ZXIoKGFuc3dlcikgPT4gYW5zd2VyLnRpbWUgPCAxMCkubGVuZ3RoO1xufVxuXG5mdW5jdGlvbiBnZXRTbG93UGVuYWx0eUNvdW50KGFuc3dlcnMpIHtcbiAgcmV0dXJuIGFuc3dlcnMuZmlsdGVyKChhbnN3ZXIpID0+IGFuc3dlci50aW1lID4gMjApLmxlbmd0aDtcbn1cblxuZXhwb3J0IHtnZXRUb3RhbFNjb3JlLCBnZXRSaWdodEFuc3dlcnNDb3VudCwgZ2V0U3BlZWRCb251c0NvdW50LCBnZXRTbG93UGVuYWx0eUNvdW50fTtcbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcbmltcG9ydCBTdGF0c0Jsb2NrVmlldyBmcm9tICcuLi91dGlsLXZpZXdzL3N0YXRzLWJsb2NrLXZpZXcuanMnO1xuaW1wb3J0IHtnZXRUb3RhbFNjb3JlLCBnZXRSaWdodEFuc3dlcnNDb3VudCwgZ2V0U3BlZWRCb251c0NvdW50LCBnZXRTbG93UGVuYWx0eUNvdW50fSBmcm9tICcuLi9zY29yZS5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YXRzU2luZ2xlVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoYW5zd2VycywgbGl2ZXMpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuYW5zd2VycyA9IGFuc3dlcnM7XG4gICAgdGhpcy5saXZlcyA9IGxpdmVzO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIGNvbnN0IGlzV2luID0gdGhpcy5hbnN3ZXJzLmxlbmd0aCA9PT0gMTA7XG4gICAgY29uc3Qgc2NvcmUgPSBnZXRUb3RhbFNjb3JlKHRoaXMuYW5zd2VycywgdGhpcy5saXZlcyk7XG4gICAgY29uc3QgcmlnaHRBbnN3ZXJzQ291bnQgPSBnZXRSaWdodEFuc3dlcnNDb3VudCh0aGlzLmFuc3dlcnMpO1xuICAgIGNvbnN0IHNwZWVkQm9udXNDb3VudCA9IGdldFNwZWVkQm9udXNDb3VudCh0aGlzLmFuc3dlcnMpO1xuICAgIGNvbnN0IHNsb3dQZW5hbHR5Q291bnQgPSBnZXRTbG93UGVuYWx0eUNvdW50KHRoaXMuYW5zd2Vycyk7XG4gICAgY29uc3Qgc3RhdHNCbG9jayA9IG5ldyBTdGF0c0Jsb2NrVmlldyh0aGlzLmFuc3dlcnMpO1xuICAgIHJldHVybiBgPHNlY3Rpb24gY2xhc3M9XCJyZXN1bHRcIj5cbiAgICAgIDxoMiBjbGFzcz1cInJlc3VsdF9fdGl0bGUgcmVzdWx0X190aXRsZS0tc2luZ2xlXCI+JHsoaXNXaW4pID8gc2NvcmUgKyBgINC+0YfQutC+0LIuINCd0LXQv9C70L7RhdC+IWAgOiBg0J/QvtGA0LDQttC10L3QuNC1IWAgfTwvaDI+XG4gICAgICA8dGFibGUgY2xhc3M9XCJyZXN1bHRfX3RhYmxlIHJlc3VsdF9fdGFibGUtLXNpbmdsZVwiPlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRkIGNvbHNwYW49XCIyXCI+XG4gICAgICAgICAgICAke3N0YXRzQmxvY2sudGVtcGxhdGV9XG4gICAgICAgICAgPC90ZD5cbiAgICAgICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX3BvaW50c1wiPsOXIDEwMDwvdGQ+XG4gICAgICAgICAgPHRkIGNsYXNzPVwicmVzdWx0X190b3RhbFwiPiR7KGlzV2luKSA/IHJpZ2h0QW5zd2Vyc0NvdW50ICogMTAwIDogYEZhaWxgIH08L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgICAkeyhzcGVlZEJvbnVzQ291bnQpID8gU3RhdHNTaW5nbGVWaWV3LmdldFNwZWVkQm9udXNDb250ZW50KHNwZWVkQm9udXNDb3VudCkgOiBgYH1cbiAgICAgICAgJHsodGhpcy5saXZlcykgPyBTdGF0c1NpbmdsZVZpZXcuZ2V0TGl2ZXNCb251c0NvbnRlbnQodGhpcy5saXZlcykgOiBgYH1cbiAgICAgICAgJHsoc2xvd1BlbmFsdHlDb3VudCkgPyBTdGF0c1NpbmdsZVZpZXcuZ2V0U2xvd1BlbmFsdHlDb250ZW50KHNsb3dQZW5hbHR5Q291bnQpIDogYGB9XG4gICAgICA8L3RhYmxlPlxuICAgIDwvc2VjdGlvbj5gO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjbWFpbmApO1xuICAgIGNvbnN0IG9sZEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBzZWN0aW9uLnJlc3VsdGApO1xuICAgIHBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQob2xkRWxlbWVudCk7XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgc3RhdGljIGdldFNwZWVkQm9udXNDb250ZW50KHNwZWVkQm9udXNDb3VudCkge1xuICAgIHJldHVybiBgPHRyPlxuICAgICAgPHRkPjwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX2V4dHJhXCI+0JHQvtC90YPRgSDQt9CwINGB0LrQvtGA0L7RgdGC0Yw6PC90ZD5cbiAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fZXh0cmFcIj4ke3NwZWVkQm9udXNDb3VudH0gPHNwYW4gY2xhc3M9XCJzdGF0c19fcmVzdWx0IHN0YXRzX19yZXN1bHQtLWZhc3RcIj48L3NwYW4+PC90ZD5cbiAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fcG9pbnRzXCI+w5cgNTA8L3RkPlxuICAgICAgPHRkIGNsYXNzPVwicmVzdWx0X190b3RhbFwiPiR7c3BlZWRCb251c0NvdW50ICogNTB9PC90ZD5cbiAgICA8L3RyPmA7XG4gIH1cblxuICBzdGF0aWMgZ2V0TGl2ZXNCb251c0NvbnRlbnQobGl2ZXMpIHtcbiAgICByZXR1cm4gYDx0cj5cbiAgICAgIDx0ZD48L3RkPlxuICAgICAgPHRkIGNsYXNzPVwicmVzdWx0X19leHRyYVwiPtCR0L7QvdGD0YEg0LfQsCDQttC40LfQvdC4OjwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX2V4dHJhXCI+JHtsaXZlc30gPHNwYW4gY2xhc3M9XCJzdGF0c19fcmVzdWx0IHN0YXRzX19yZXN1bHQtLWFsaXZlXCI+PC9zcGFuPjwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX3BvaW50c1wiPsOXIDUwPC90ZD5cbiAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fdG90YWxcIj4ke2xpdmVzICogNTB9PC90ZD5cbiAgICA8L3RyPmA7XG4gIH1cblxuICBzdGF0aWMgZ2V0U2xvd1BlbmFsdHlDb250ZW50KHNsb3dQZW5hbHR5Q291bnQpIHtcbiAgICByZXR1cm4gYDx0cj5cbiAgICAgIDx0ZD48L3RkPlxuICAgICAgPHRkIGNsYXNzPVwicmVzdWx0X19leHRyYVwiPtCo0YLRgNCw0YQg0LfQsCDQvNC10LTQu9C40YLQtdC70YzQvdC+0YHRgtGMOjwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX2V4dHJhXCI+JHtzbG93UGVuYWx0eUNvdW50fSA8c3BhbiBjbGFzcz1cInN0YXRzX19yZXN1bHQgc3RhdHNfX3Jlc3VsdC0tc2xvd1wiPjwvc3Bhbj48L3RkPlxuICAgICAgPHRkIGNsYXNzPVwicmVzdWx0X19wb2ludHNcIj7DlyA1MDwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX3RvdGFsXCI+LSR7c2xvd1BlbmFsdHlDb3VudCAqIDUwfTwvdGQ+XG4gICAgPC90cj5gO1xuICB9XG5cbn1cblxuLy8gIGZvciAobGV0IGkgPSAwOyBpIDwgYW5zd2Vycy5sZW5ndGg7IGkrKykge1xuLy8gICAgcmVzdWx0ICs9IGA8dGFibGUgY2xhc3M9XCJyZXN1bHRfX3RhYmxlXCI+XG4vLyAgICAgIDx0cj5cbi8vICAgICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX251bWJlclwiPiR7aSArIDF9LjwvdGQ+XG4vLyAgICAgICAgPHRkIGNvbHNwYW49XCIyXCI+XG4vLyAgICAgICAgICAke2dldFN0YXRzSFRNTFN0cmluZyhhbnN3ZXJzKX1cbi8vICAgICAgICA8L3RkPlxuLy8gICAgICAgIDx0ZCBjbGFzcz1cInJlc3VsdF9fcG9pbnRzXCI+w5cgMTAwPC90ZD5cbi8vICAgICAgICA8dGQgY2xhc3M9XCJyZXN1bHRfX3RvdGFsXCI+JHsoaXNXaW4pID8gZ2V0U2NvcmUoYW5zd2VycywgbGl2ZXMpIDogYEZhaWwhYCB9PC90ZD5cbi8vICAgICAgPC90cj5cbi8vICAgICAgJHtnZXRTcGVlZEJvbnVzKCl9XG4vLyAgICAgICR7Z2V0TGl2ZXNCb251cygpfVxuLy8gICAgICAke2dldFNsb3dQZW5hbHR5KCl9XG4vLyAgICAgIDx0cj5cbi8vICAgICAgICA8dGQgY29sc3Bhbj1cIjVcIiBjbGFzcz1cInJlc3VsdF9fdG90YWwgIHJlc3VsdF9fdG90YWwtLWZpbmFsXCI+JHsoaXNXaW4pID8gZ2V0U2NvcmUoYW5zd2VycywgbGl2ZXMpIDogYEZhaWwhYCB9PC90ZD5cbi8vICAgICAgPC90cj5cbi8vICAgIDwvdGFibGU+YDtcbi8vICB9XG4iLCJpbXBvcnQgQWJzdHJhY3RTY3JlZW4gZnJvbSAnLi4vYWJzdHJhY3Qtc2NyZWVuLmpzJztcblxuaW1wb3J0IFN0YXRzU2NyZWVuVmlldyBmcm9tICcuL3N0YXRzLXNjcmVlbi12aWV3LmpzJztcbmltcG9ydCBTdGF0c1NpbmdsZVZpZXcgZnJvbSAnLi9zdGF0cy1zaW5nbGUtdmlldy5qcyc7XG5pbXBvcnQgQmFja0Fycm93VmlldyBmcm9tICcuLi91dGlsLXZpZXdzL2JhY2stYXJyb3ctdmlldy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YXRzU2NyZWVuIGV4dGVuZHMgQWJzdHJhY3RTY3JlZW4ge1xuXG4gIGNvbnN0cnVjdG9yKGdhbWVNb2RlbCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5nYW1lTW9kZWwgPSBnYW1lTW9kZWw7XG4gICAgdGhpcy52aWV3ID0gbmV3IFN0YXRzU2NyZWVuVmlldygpO1xuICB9XG5cbiAgX29uU2NyZWVuU2hvdygpIHtcbiAgICBjb25zdCBzdGF0c1NpbmdsZUJsb2NrID0gbmV3IFN0YXRzU2luZ2xlVmlldyh0aGlzLmdhbWVNb2RlbC5hbnN3ZXJzLCB0aGlzLmdhbWVNb2RlbC5saXZlcyk7XG4gICAgY29uc3QgYmFja0Fycm93ID0gbmV3IEJhY2tBcnJvd1ZpZXcoKTtcbiAgICBjb25zdCByZXN0YXJ0R2FtZSA9IHRoaXMuX3Jlc3RhcnRHYW1lLmJpbmQodGhpcyk7XG5cbiAgICBzdGF0c1NpbmdsZUJsb2NrLnJlbmRlcigpO1xuICAgIGJhY2tBcnJvdy5yZW5kZXIoKTtcblxuICAgIGJhY2tBcnJvdy5iaW5kKHJlc3RhcnRHYW1lKTtcbiAgfVxufVxuIiwiaW1wb3J0IGNvbmZpZyBmcm9tICcuL2NvbmZpZy5qcyc7XG5pbXBvcnQgR2FtZU1vZGVsIGZyb20gJy4vZ2FtZS1tb2RlbC9nYW1lLW1vZGVsLmpzJztcblxuaW1wb3J0IFdlbGNvbWVTY3JlZW4gZnJvbSAnLi93ZWxjb21lLXNjcmVlbi93ZWxjb21lLXNjcmVlbi5qcyc7XG5pbXBvcnQgR3JlZXRpbmdTY3JlZW4gZnJvbSAnLi9ncmVldGluZy1zY3JlZW4vZ3JlZXRpbmctc2NyZWVuLmpzJztcbmltcG9ydCBSdWxlc1NjcmVlbiBmcm9tICcuL3J1bGVzLXNjcmVlbi9ydWxlcy1zY3JlZW4uanMnO1xuaW1wb3J0IEdhbWVTY3JlZW4gZnJvbSAnLi9nYW1lLXNjcmVlbi9nYW1lLXNjcmVlbi5qcyc7XG5pbXBvcnQgU3RhdHNTY3JlZW4gZnJvbSAnLi9zdGF0cy1zY3JlZW4vc3RhdHMtc2NyZWVuLmpzJztcblxuYXN5bmMgZnVuY3Rpb24gZ2V0R2FtZXNQcm9taXNlKCkge1xuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGNvbmZpZy5HQU1FU19EQVRBX1VSTCk7XG4gIGNvbnN0IGdhbWVzUHJvbWlzZSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICByZXR1cm4gZ2FtZXNQcm9taXNlO1xufVxuXG5mdW5jdGlvbiBnZXRSYW5kb20oYXJyLCBuKSB7XG4gIGNvbnN0IHJlc3VsdCA9IG5ldyBBcnJheShuKTtcbiAgbGV0IGxlbiA9IGFyci5sZW5ndGg7XG4gIGNvbnN0IHRha2VuID0gbmV3IEFycmF5KGxlbik7XG4gIGlmIChuID4gbGVuKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXCJnZXRSYW5kb206IG1vcmUgZWxlbWVudHMgdGFrZW4gdGhhbiBhdmFpbGFibGVcIik7XG4gIH1cbiAgd2hpbGUgKG4tLSkge1xuICAgIGNvbnN0IHggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBsZW4pO1xuICAgIHJlc3VsdFtuXSA9IGFyclt4IGluIHRha2VuID8gdGFrZW5beF0gOiB4XTtcbiAgICB0YWtlblt4XSA9IC0tbGVuIGluIHRha2VuID8gdGFrZW5bbGVuXSA6IGxlbjtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBcHBsaWNhdGlvbiB7XG5cbiAgc3RhdGljIGluaXQoKSB7XG5cbiAgICBjb25zdCBnYW1lTW9kZWwgPSBuZXcgR2FtZU1vZGVsKCk7XG4gICAgY29uc3Qgd2VsY29tZVNjcmVlbiA9IG5ldyBXZWxjb21lU2NyZWVuKCk7XG4gICAgY29uc3QgZ3JlZXRpbmdTY3JlZW4gPSBuZXcgR3JlZXRpbmdTY3JlZW4oKTtcbiAgICBjb25zdCBydWxlc1NjcmVlbiA9IG5ldyBSdWxlc1NjcmVlbihnYW1lTW9kZWwpO1xuICAgIGNvbnN0IHN0YXRzU2NyZWVuID0gbmV3IFN0YXRzU2NyZWVuKGdhbWVNb2RlbCk7XG5cbiAgICBjb25zdCBnYW1lU2NyZWVucyA9IFtdO1xuXG4gICAgZ2V0R2FtZXNQcm9taXNlKCkudGhlbihnYW1lc0FyciA9PiB7XG5cbiAgICAgIGNvbnN0IGdhbWVzID0gZ2V0UmFuZG9tKGdhbWVzQXJyLCBjb25maWcuR0FNRVNfQ09VTlQpO1xuICAgICAgZ2FtZU1vZGVsLl9nYW1lcyA9IGdhbWVzO1xuXG4gICAgICBnYW1lcy5mb3JFYWNoKChnYW1lLCBpbmRleCkgPT4ge1xuICAgICAgICBnYW1lU2NyZWVucy5wdXNoKG5ldyBHYW1lU2NyZWVuKGdhbWVNb2RlbCwgZ2FtZSwgaW5kZXgpKTtcbiAgICAgIH0pO1xuXG4gICAgICB3ZWxjb21lU2NyZWVuLm5leHRTY3JlZW4gPSBncmVldGluZ1NjcmVlbjtcbiAgICAgIGdyZWV0aW5nU2NyZWVuLm5leHRTY3JlZW4gPSBydWxlc1NjcmVlbjtcbiAgICAgIHJ1bGVzU2NyZWVuLm5leHRTY3JlZW4gPSBnYW1lU2NyZWVuc1swXTtcbiAgICAgIHJ1bGVzU2NyZWVuLnN0YXJ0U2NyZWVuID0gd2VsY29tZVNjcmVlbjtcblxuICAgICAgZ2FtZVNjcmVlbnMuZm9yRWFjaCgoZ2FtZVNjcmVlbiwgaW5kZXgpID0+IHtcbiAgICAgICAgZ2FtZVNjcmVlbi5uZXh0U2NyZWVuID0gZ2FtZVNjcmVlbnNbaW5kZXggKyAxXTtcbiAgICAgICAgZ2FtZVNjcmVlbi5zdGFydFNjcmVlbiA9IHdlbGNvbWVTY3JlZW47XG4gICAgICAgIGdhbWVTY3JlZW4uZW5kU2NyZWVuID0gc3RhdHNTY3JlZW47XG4gICAgICB9KTtcblxuICAgICAgZ2FtZVNjcmVlbnNbZ2FtZVNjcmVlbnMubGVuZ3RoIC0gMV0ubmV4dFNjcmVlbiA9IHN0YXRzU2NyZWVuO1xuICAgICAgc3RhdHNTY3JlZW4uc3RhcnRTY3JlZW4gPSB3ZWxjb21lU2NyZWVuO1xuXG4gICAgICB3ZWxjb21lU2NyZWVuLnNob3coKTtcblxuICAgIH0pO1xuXG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJJbnRyb1NjcmVlblZpZXciXSwibWFwcGluZ3MiOiI7OztFQUFB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
