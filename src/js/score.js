import config from './config.js';

// Scoring at the end of the game
// @param  {array} answers массив ответов пользователя
// @param  {integer} lives кол-во оставшихся жизней
// @return {integer} кол-во набранных очков
function getTotalScore(answers, lives) {
  if (answers.length < config.GAMES_COUNT) {
    return -1;
  }
  const score = answers.reduce((acc, answer) => {
    if (answer.isOK) {
      acc += 100;
    }
    if (answer.time < 10) {
      acc += 50;
    }
    if (answer.time > 20) {
      acc -= 50;
    }
    return acc;
  }, 0);
  return score + lives * 50;
}

function getRightAnswersCount(answers) {
  return answers.filter((answer) => answer.isOK).length;
}

function getSpeedBonusCount(answers) {
  return answers.filter((answer) => answer.time < 10).length;
}

function getSlowPenaltyCount(answers) {
  return answers.filter((answer) => answer.time > 20).length;
}

export {getTotalScore, getRightAnswersCount, getSpeedBonusCount, getSlowPenaltyCount};
