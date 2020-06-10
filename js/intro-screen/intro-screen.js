import AbstractScreen from '../abstract-screen.js';

import IntroScreenView from './intro-screen-view.js';
import AsteriskView from './asterisk-view.js';

export default class IntroScreen extends AbstractScreen {

  constructor() {
    super();
    this.view = new IntroScreenView();
  }

  _onScreenShow() {
    const asterisk = new AsteriskView();
    asterisk.render();
    asterisk.bind(this.nextScreen.show.bind(this.nextScreen));
  }
}
