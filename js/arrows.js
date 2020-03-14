import getElementFromHTMLString from './element.js';

const body = document.querySelector(`body`);
const arrowsContent = `<div class="arrows__wrap">
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
  <button id="arrow-right" class="arrows__btn">-></button>
</div>`;

function addArrows() {
  const arrows = getElementFromHTMLString(arrowsContent);
  body.appendChild(arrows);
}

export default addArrows;
