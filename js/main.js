'use strict';

const body = document.querySelector(`body`);
const main = document.querySelector(`#main`);
const screens = Array.from(document.querySelectorAll(`template`)).map((template) => template.content.querySelector(`section`));
const arrowsContent = `
  <style>
    .arrows__wrap {
      position: absolute;
      top: 95px;
      left: 50%;
      margin-left: -56px;
    }
    .arrows__btn {
      background: none;
      border: 2px solid black;
      padding: 5px 20px;
    }
  </style>
  <button id="arrow-left" class="arrows__btn"><-</button>
  <button id="arrow-right" class="arrows__btn">-></button>`;

let screenNo = 0;

function changeScreen() {
  let lastNo = screens.length - 1;
  if (screenNo < 0) {
    screenNo = lastNo;
  }
  if (screenNo > lastNo) {
    screenNo = 0;
  }

  let screen = screens[screenNo];
  main.innerHTML = ``;
  main.appendChild(screen);
}

function nextScreen() {
  screenNo++;
  changeScreen();
}

function previousScreen() {
  screenNo--;
  changeScreen();
}

function addArrows() {
  const arrows = document.createElement(`div`);
  arrows.classList.add(`arrows__wrap`);
  arrows.innerHTML = arrowsContent;
  body.appendChild(arrows);
}

document.addEventListener(`keydown`, function (evt) {
  if (evt.keyCode === 37) {
    previousScreen();
  }
  if (evt.keyCode === 39) {
    nextScreen();
  }
});

addArrows();

const arrowLeft = document.querySelector(`#arrow-left`);
const arrowRight = document.querySelector(`#arrow-right`);

arrowLeft.addEventListener(`click`, previousScreen);
arrowRight.addEventListener(`click`, nextScreen);

changeScreen();

