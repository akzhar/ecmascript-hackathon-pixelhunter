import config from './config.js';
import GameModel from './game-model/game-model.js';

import WelcomeScreen from './welcome-screen/welcome-screen.js';
import GreetingScreen from './greeting-screen/greeting-screen.js';
import RulesScreen from './rules-screen/rules-screen.js';
import GameScreen from './game-screen/game-screen.js';
import StatsScreen from './stats-screen/stats-screen.js';

async function getGamesPromise() {
  const response = await fetch(config.GAMES_DATA_URL);
  const gamesPromise = await response.json()
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

export default class Application {

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
