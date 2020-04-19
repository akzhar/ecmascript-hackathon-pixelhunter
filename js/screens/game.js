import utils from '../utils.js';

function getHeader(time, lives) {
  return `<header class="header">
    <button class="back">
      <span class="visually-hidden">Вернуться к началу</span>
      <svg class="icon" width="45" height="45" viewBox="0 0 45 45" fill="#000000">
        <use xlink:href="img/sprite.svg#arrow-left"></use>
      </svg>
      <svg class="icon" width="101" height="44" viewBox="0 0 101 44" fill="#000000">
        <use xlink:href="img/sprite.svg#logo-small"></use>
      </svg>
    </button>
    <div class="game__timer">${time}</div>
    <div class="game__lives">
      ${utils.getLives(lives)}
    </div>
  </header>`;
}

function getGameContent(game, questions) {
  let content = ``;
  if (questions === 2) {
    content = `<form class="game__content">
      <div class="game__option">
        <img src="${game.option1}" alt="Option 1" width="468" height="458">
        <label class="game__answer game__answer--photo">
          <input class="visually-hidden" name="question1" type="radio" value="photo">
          <span>Фото</span>
        </label>
        <label class="game__answer game__answer--paint">
          <input class="visually-hidden" name="question1" type="radio" value="paint">
          <span>Рисунок</span>
        </label>
      </div>
      <div class="game__option">
        <img src="${game.option2}" alt="Option 2" width="468" height="458">
        <label class="game__answer  game__answer--photo">
          <input class="visually-hidden" name="question2" type="radio" value="photo">
          <span>Фото</span>
        </label>
        <label class="game__answer  game__answer--paint">
          <input class="visually-hidden" name="question2" type="radio" value="paint">
          <span>Рисунок</span>
        </label>
      </div>
    </form>`;
  } else if (questions === 1) {
    content = `<form class="game__content  game__content--wide">
      <div class="game__option">
        <img src="${game.option1}" alt="Option 1" width="705" height="455">
        <label class="game__answer  game__answer--photo">
          <input class="visually-hidden" name="question1" type="radio" value="photo">
          <span>Фото</span>
        </label>
        <label class="game__answer  game__answer--paint">
          <input class="visually-hidden" name="question1" type="radio" value="paint">
          <span>Рисунок</span>
        </label>
      </div>
    </form>`;
  } else if (questions === 3) {
    content = `<form class="game__content  game__content--triple">
      <div class="game__option">
        <img src="${game.option1}" alt="Option 1" width="304" height="455">
      </div>
      <div class="game__option game__option--selected">
        <img src="${game.option2}" alt="Option 2" width="304" height="455">
      </div>
      <div class="game__option">
        <img src="${game.option3}" alt="Option 3" width="304" height="455">
      </div>
    </form>`;
  }
  return content;
}

function getStats() {
  return `<ul class="stats">
    <li class="stats__result stats__result--wrong"></li>
    <li class="stats__result stats__result--slow"></li>
    <li class="stats__result stats__result--fast"></li>
    <li class="stats__result stats__result--correct"></li>
    <li class="stats__result stats__result--wrong"></li>
    <li class="stats__result stats__result--unknown"></li>
    <li class="stats__result stats__result--slow"></li>
    <li class="stats__result stats__result--unknown"></li>
    <li class="stats__result stats__result--fast"></li>
    <li class="stats__result stats__result--unknown"></li>
  </ul>`;
}

function getScreen(data, questions) {
  const game = data.games[questions];
  return `<div id="main" class="central__content">
    ${getHeader(data.time, data.lives)}
    <section class="game">
      <p class="game__task">${game.task}</p>
      ${getGameContent(game, questions)}
      ${getStats(data.stats)}
    </section>
  </div>`;
}

export default {getScreen};
