import AbstractView from "../abstract-view.js";

export default class LivesBlockView extends AbstractView {

  constructor(lives) {
    super();
    this.lives = lives;
  }

  get template() {
    let result = ``;
    for (let i = 0; i < 3; i++) {
      result += `<img src="img/heart__${(this.lives > 0) ? `full` : `empty`}.svg" class="game__heart" alt="Life" width="31" height="27">`;
      this.lives--;
    }
    return `<div class="game__lives">${result}</div>`;
  }

  render() {
    const parentElement = document.querySelector(`header.header`);
    const oldElement = document.querySelector(`div.game__lives`);
    parentElement.removeChild(oldElement);
    parentElement.appendChild(this.element);
  }
}
