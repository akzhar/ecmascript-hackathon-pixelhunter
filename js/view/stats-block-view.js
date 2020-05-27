import AbstractView from "./abstract-view.js";

export default class StatsBlockView extends AbstractView {

  constructor(answers) {
    super();
    this.answers = answers;
  }

  get template() {
    let result = ``;
    for (let i = 0; i < 10; i++) {
      const answer = this.answers[i];
      let modifier = ``;
      if (answer) {
        if (answer.isOK) {
          modifier = `correct`;
          if (answer.time < 10) {
            modifier = `fast`;
          }
          if (answer.time > 20) {
            modifier = `slow`;
          }
        } else {
          modifier = `wrong`;
        }
      } else {
        modifier = `unknown`;
      }
      result += `<li class="stats__result stats__result--${modifier}"></li>`;
    }
    return `<ul class="stats">${result}</ul>`;
}

  render() {
    const parentElement = document.querySelector(`section.game`);
    const oldElement = document.querySelector(`ul.stats`);
    parentElement.removeChild(oldElement);
    parentElement.appendChild(this.element);
  }
}
