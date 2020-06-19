const DEBUG_ON = true;
const STYLE = `style="box-shadow: 0px 0px 10px 12px rgba(19,173,24,1);"`;

function isPhoto(answer) {
  return (DEBUG_ON && answer === `photo`) ? STYLE : ``;
}

function isPaint(answer) {
  return (DEBUG_ON && answer === `paint`) ? STYLE : ``;
}

function isCorrect(isCorrect) {
  return (DEBUG_ON && isCorrect) ? STYLE : ``;
}

export default {isPhoto, isPaint, isCorrect};
