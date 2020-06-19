import GameModel from './game-model/game-model.js';

import WelcomeScreen from './welcome-screen/welcome-screen.js';
import GreetingScreen from './greeting-screen/greeting-screen.js';
import RulesScreen from './rules-screen/rules-screen.js';
import GameScreen from './game-screen/game-screen.js';
import StatsScreen from './stats-screen/stats-screen.js';

const gameModel = new GameModel();
const welcomeScreen = new WelcomeScreen();
const greetingScreen = new GreetingScreen();
const rulesScreen = new RulesScreen(gameModel);
const statsScreen = new StatsScreen(gameModel);
const gameScreens = [];
gameModel.games.forEach((game) => {
  gameScreens.push(new GameScreen(gameModel, game));
});

export default class Application {

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
