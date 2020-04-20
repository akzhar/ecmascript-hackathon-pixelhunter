const IS_DEV = true;
const STYLE = `style="box-shadow: 0px 0px 16px 17px rgba(19,173,24,1);"`;

function isPhoto(answer) {
  return (IS_DEV && answer === `photo`) ? STYLE : ``;
}

function isPaint(answer) {
  return (IS_DEV && answer === `paint`) ? STYLE : ``;
}

function isRight(isRight) {
  return (IS_DEV && isRight) ? STYLE : ``;
}

export {isPhoto, isPaint, isRight};
