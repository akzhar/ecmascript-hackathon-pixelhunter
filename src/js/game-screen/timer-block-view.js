import config from '../config.js';
import AbstractView from "../abstract-view.js";

export default class TimerBlockView extends AbstractView {

  constructor() {
    super();
    this._isActive = true;
    this._time = config.TIME_TO_ANSWER;
  }

  get template() {
    const time = TimerBlockView.getTimeFormatted(this.time);
    return `<div class="game__timer">${time}</div>`;
  }

  get time() {
    return this._time;
  }

  set time(newTime) {
    this._time = newTime;
  }

  get isActive() {
    return this._isActive;
  }

  render() {
    const parentElement = document.querySelector(`header.header`);
    parentElement.insertBefore(this.element, parentElement.firstChild);
  }

  update() {
    if (this._isActive && this.time > 0) {
      this.time = this.time - 1000;
      const time = TimerBlockView.getTimeFormatted(this.time);
      const timerElement = document.querySelector(`div.game__timer`);
      timerElement.textContent = time;
      if (this.time === 5000 || this.time === 3000 || this.time === 1000) {
        timerElement.style = `color: ${config.COLOR_RED};`;
      } else {
        timerElement.style = `color: black;`;
      }
    }
  }

  stop() {
    this._isActive = false;
  }

  static getTimeFormatted(time) {
    const REGEX = /^\d$/;
    let min = `` + Math.floor(time / 1000 / 60);
    let sec = `` + Math.floor((time - (min * 1000 * 60)) / 1000);
    if (REGEX.test(sec)) {
      sec = `0${sec}`;
    }
    if (REGEX.test(min)) {
      min = `0${min}`;
    }
    return `${min}:${sec}`;
  }
}
