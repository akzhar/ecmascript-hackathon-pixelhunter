import data from '../data/data.js';

import intro from './intro.js';
import greeting from './greeting.js';
import rules from './rules.js';
import getGame from './game.js';
import stats from './stats/stats.js';

const screens = [];

screens.push({name: `intro`, screen: intro});
screens.push({name: `greeting`, screen: greeting});
screens.push({name: `rules`, screen: rules});
data.games.forEach((game) => {
  screens.push({name: `game`, screen: getGame(game), gameType: game.gameType});
});
screens.push({name: `stats`, screen: stats});

export default screens;
