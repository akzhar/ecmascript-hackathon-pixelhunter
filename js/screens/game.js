import {isPhoto, isPaint, isRight} from '../debug.js';

function getGameContent(game, gameType) {
  let content = ``;
  if (gameType === 2) {
    content = `<form class="game__content">
      <div class="game__option">
        <img src="${game.questions[0].src}" alt="Option 1" width="468" height="458">
        <label class="game__answer game__answer--photo">
          <input class="visually-hidden" name="question1" type="radio" value="photo" data-answer="${game.questions[0].answer}">
          <span ${isPhoto(game.questions[0].answer)}>Фото</span>
        </label>
        <label class="game__answer game__answer--paint">
          <input class="visually-hidden" name="question1" type="radio" value="paint" data-answer="${game.questions[0].answer}">
          <span ${isPaint(game.questions[0].answer)}>Рисунок</span>
        </label>
      </div>
      <div class="game__option">
        <img src="${game.questions[1].src}" alt="Option 2" width="468" height="458">
        <label class="game__answer  game__answer--photo">
          <input class="visually-hidden" name="question2" type="radio" value="photo" data-answer="${game.questions[1].answer}">
          <span ${isPhoto(game.questions[1].answer)}>Фото</span>
        </label>
        <label class="game__answer  game__answer--paint">
          <input class="visually-hidden" name="question2" type="radio" value="paint" data-answer="${game.questions[1].answer}">
          <span ${isPaint(game.questions[1].answer)}>Рисунок</span>
        </label>
      </div>
    </form>`;
  } else if (gameType === 1) {
    content = `<form class="game__content  game__content--wide">
      <div class="game__option">
        <img src="${game.question.src}" alt="Option 1" width="705" height="455">
        <label class="game__answer  game__answer--photo">
          <input class="visually-hidden" name="question1" type="radio" value="photo" data-answer="${game.question.answer}">
          <span ${isPhoto(game.question.answer)}>Фото</span>
        </label>
        <label class="game__answer  game__answer--paint">
          <input class="visually-hidden" name="question1" type="radio" value="paint" data-answer="${game.question.answer}">
          <span ${isPaint(game.question.answer)}>Рисунок</span>
        </label>
      </div>
    </form>`;
  } else if (gameType === 3) {
    content = `<form class="game__content  game__content--triple">
      <div class="game__option" data-value="0" data-answer="${game.question.answer}" ${isRight(game.question.answer === 0)}>
        <img src="${game.question.src[0]}" alt="Option 1" width="304" height="455">
      </div>
      <div class="game__option" data-value="1" data-answer="${game.question.answer}" ${isRight(game.question.answer === 1)}>
        <img src="${game.question.src[1]}" alt="Option 2" width="304" height="455">
      </div>
      <div class="game__option" data-value="2" data-answer="${game.question.answer}" ${isRight(game.question.answer === 2)}>
        <img src="${game.question.src[2]}" alt="Option 3" width="304" height="455">
      </div>
    </form>`;
  }
  return content;
}

function getGame(game) {
  return `<div id="main" class="central__content">
    <header class="header">
      <button class="back">
        <span class="visually-hidden">Вернуться к началу</span>
        <svg class="icon" width="45" height="45" viewBox="0 0 45 45" fill="#000000">
          <use xlink:href="img/sprite.svg#arrow-left"></use>
        </svg>
        <svg class="icon" width="101" height="44" viewBox="0 0 101 44" fill="#000000">
          <use xlink:href="img/sprite.svg#logo-small"></use>
        </svg>
      </button>
      <div class="game__timer">3:00</div>
      <div class="game__lives"></div>
    </header>
    <section class="game">
      <p class="game__task">${game.task}</p>
      ${getGameContent(game, game.gameType)}
      <ul class="stats"></ul>
    </section>
  </div>`;
}

export default getGame;
