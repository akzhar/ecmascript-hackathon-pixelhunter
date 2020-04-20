export default `<div id="main" class="central__content">
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
  </header>
  <section class="result"></section></div>`;

//  for (let i = 0; i < answers.length; i++) {
//    result += `<table class="result__table">
//      <tr>
//        <td class="result__number">${i + 1}.</td>
//        <td colspan="2">
//          ${getStatsHTMLString(answers)}
//        </td>
//        <td class="result__points">× 100</td>
//        <td class="result__total">${(isWin) ? getScore(answers, lives) : `Fail!` }</td>
//      </tr>
//      ${getSpeedBonus()}
//      ${getLivesBonus()}
//      ${getSlowPenalty()}
//      <tr>
//        <td colspan="5" class="result__total  result__total--final">${(isWin) ? getScore(answers, lives) : `Fail!` }</td>
//      </tr>
//    </table>`;
//  }
