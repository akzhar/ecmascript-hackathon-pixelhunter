// Scoring at the end of the game
// @param  {array} answers массив ответов пользователя
// @param  {integer} lives кол-во оставшихся жизней
// @return {integer} кол-во набранных очков
function getTotalScore(answers, lives) {
  if (answers.length < 10) return -1;
  const score = answers.reduce((score, answer) => {
    if (answer.isOK) score+= 100;
    if (answer.time < 10) score+= 50;
    if (answer.time > 20) score-= 50;
    return score;
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
