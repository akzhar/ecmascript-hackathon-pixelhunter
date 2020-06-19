import AbstractScreen from '../abstract-screen.js';

import GreetingScreenView from './greeting-screen-view.js';
import StartArrowView from './start-arrow-view.js';

export default class GreetingScreen extends AbstractScreen {

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
