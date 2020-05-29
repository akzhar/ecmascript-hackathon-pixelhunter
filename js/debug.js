const IS_DEBUG_MODE_ON = true;
const DEBUG_MODE_STYLE = `style="box-shadow: 0px 0px 10px 12px rgba(19,173,24,1);"`;

function isPhoto(answer) {
  return (IS_DEBUG_MODE_ON && answer === `photo`) ? DEBUG_MODE_STYLE : ``;
}

function isPaint(answer) {
  return (IS_DEBUG_MODE_ON && answer === `paint`) ? DEBUG_MODE_STYLE : ``;
}

function isCorrect(isCorrect) {
  return (IS_DEBUG_MODE_ON && isCorrect) ? DEBUG_MODE_STYLE : ``;
}

export default {isPhoto, isPaint, isCorrect};
