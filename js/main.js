import gameModel from './game-model/game-model.js';

import IntroScreen from './intro-screen/intro-screen.js';
import GreetingScreen from './greeting-screen/greeting-screen.js';
import RulesScreen from './rules-screen/rules-screen.js';
import GameScreen from './game-screen/game-screen.js';
import StatsScreen from './stats-screen/stats-screen.js';

const introScreen = new IntroScreen();
const greetingScreen = new GreetingScreen();
const rulesScreen = new RulesScreen(gameModel);
const statsScreen = new StatsScreen(gameModel);

const gameScreens = [];
gameModel.games.forEach((game) => {
  gameScreens.push(new GameScreen(gameModel, game));
});

introScreen.nextScreen = greetingScreen;
greetingScreen.nextScreen = rulesScreen;
rulesScreen.nextScreen = gameScreens[0];
rulesScreen.startScreen = introScreen;

gameScreens.forEach((gameScreen, index) => {
  gameScreen.nextScreen = gameScreens[index + 1];
  gameScreen.startScreen = introScreen;
  gameScreen.endScreen = statsScreen;
});

gameScreens[gameScreens.length - 1].nextScreen = statsScreen;
statsScreen.startScreen = introScreen;

// запуск игры
introScreen.show();

// класс GameScreen
// должен устанавливать изначальное состояние игры и начинать игру
// должен создавать и управлять представлением игры GameView
// Запускать/останавливать отсчёт времени в игре и обновлять модель и представление соответствующим образом
// Должен реагировать на действия, происходящие в представлении (выбор ответа игроком)
// обрабатывать его и обновлять модель и представление в соответствии с ответом
