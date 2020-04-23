// модуль собирает все экраны игры по порядку

import data from '../data/data.js';
import {getGameHTMLString} from '../html.js';

import introHTMLString from './intro.js';
import greetingHTMLString from './greeting.js';
import rulesHTMLString from './rules.js';
import statsHTMLString from './stats/stats.js';

const screens = [];

screens.push({name: `intro`, html: introHTMLString});
screens.push({name: `greeting`, html: greetingHTMLString});
screens.push({name: `rules`, html: rulesHTMLString});
data.games.forEach((game, gameIndex) => {
  screens.push({name: `game`, gameType: game.gameType, html: getGameHTMLString(game, gameIndex)});
});
screens.push({name: `stats`, html: statsHTMLString});

export default screens;
