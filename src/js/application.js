import config from './config.js';
import {getRandom} from './utils.js';
import {loadGames} from './backend.js';

import GameModel from './game-model/game-model.js';

import WelcomeScreen from './welcome-screen/welcome-screen.js';
import GreetingScreen from './greeting-screen/greeting-screen.js';
import RulesScreen from './rules-screen/rules-screen.js';
import GameScreen from './game-screen/game-screen.js';
import StatsScreen from './stats-screen/stats-screen.js';
import ErrorModalView from './util-views/error-modal-view.js';

export default class Application {

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
