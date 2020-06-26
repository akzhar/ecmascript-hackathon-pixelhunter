import {postData} from '../backend.js';
import AbstractScreen from '../abstract-screen.js';

import StatsScreenView from './stats-screen-view.js';
import StatsSingleView from './stats-single-view.js';
import BackArrowView from '../util-views/back-arrow-view.js';

export default class StatsScreen extends AbstractScreen {

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
