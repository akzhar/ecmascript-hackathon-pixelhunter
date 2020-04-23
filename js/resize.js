// Managing size
// @param  {object} frame описывает размеры рамки, в которые должно быть вписано изображение
// @param  {object} given описывает размеры изображения, которые нужно подогнать под рамку
// @return {object} новый объект, который будет содержать изменённые размеры изображения
function resize(frame, given) {
  let width = given.width;
  let height = given.height;
  if (width > frame.width) {
    const multiplier = width / frame.width;
    width = frame.width;
    height = Math.floor(height / multiplier);
  }
  if (height > frame.height) {
    const multiplier = height / frame.height;
    height = frame.height;
    width = Math.floor(width / multiplier);
  }
  return {width, height};
}

export {resize};
