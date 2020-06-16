import AbstractScreen from '../abstract-screen.js';

import RulesScreenView from './rules-screen-view.js';
import NameInputView from './name-input-view.js';
import StartButtonView from './start-button-view.js';
import BackArrowView from '../util-views/back-arrow-view.js';

export default class RulesScreen extends AbstractScreen {

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
