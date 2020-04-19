import getElementFromHTMLString from './element.js';

const main = document.querySelector(`main.central`);

function switchScreen(screen) {
  const newScreen = getElementFromHTMLString(screen);
  const oldScreen = document.querySelector(`#main`);
  main.removeChild(oldScreen);
  main.appendChild(newScreen);
}

export default switchScreen;
