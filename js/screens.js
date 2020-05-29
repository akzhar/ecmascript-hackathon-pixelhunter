// модуль собирает все экраны игры по порядку

import data from './data.js';

import IntroScreenView from './view/intro-screen-view.js';
import GreetingScreenView from './view/greeting-screen-view.js';
import RulesScreenView from './view/rules-screen-view.js';
import GameScreenView from './view/game-screen-view.js';
import StatsScreenView from './view/stats-screen-view.js';

const screens = [];

screens.push({name: `intro`, screen: new IntroScreenView()});
screens.push({name: `greeting`, screen: new GreetingScreenView()});
screens.push({name: `rules`, screen: new RulesScreenView()});
data.games.forEach((game) => {
  screens.push({name: `game`, screen: new GameScreenView(game)});
});
screens.push({name: `stats`, screen: new StatsScreenView()});

export default screens;
