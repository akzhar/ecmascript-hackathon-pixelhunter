function getLives(lives) {
  let result = ``;
  for (let i = 0; i < 3; i++) {
    result += `<img src="img/heart__${(lives > 0) ? `full` : `empty`}.svg" class="game__heart" alt="Life" width="31" height="27">`;
    lives--;
  }
  return result;
}

export default {getLives};
