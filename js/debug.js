const IS_DEV = true;
const STYLE = `style="box-shadow: 0px 0px 10px 12px rgba(19,173,24,1);"`;

function isPhoto(answer) {
  return (IS_DEV && answer === `photo`) ? STYLE : ``;
}

function isPaint(answer) {
  return (IS_DEV && answer === `paint`) ? STYLE : ``;
}

function isRight(isOK) {
  return (IS_DEV && isOK) ? STYLE : ``;
}

export {isPhoto, isPaint, isRight};
