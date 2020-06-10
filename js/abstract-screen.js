export default class AbstractScreen {

  constructor() {
    this.gameModel = null;
    this.game = null;
    this.view = null;
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
    this.gameModel.reset();
    this.startScreen.show();
  }
}
