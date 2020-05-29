const elements = {};

export default class AbstractView {

  constructor() {}

  // возвращает строку, содержащую разметку
  get template() {}

  // отрисовывает DOM-элемент, добавляет необходимые обработчики
  render() {
    const parentElement = document.querySelector(`main.central`);
    const oldElement = document.querySelector(`#main`);
    parentElement.removeChild(oldElement);
    parentElement.appendChild(this.element);
  }

  // добавляет обработчики событий
  // Метод по умолчанию ничего не делает
  // Если нужно обработать какое-то событие, то этот метод должен быть переопределён в наследнике с необходимой логикой
  bind() {}

  // создает и возвращает DOM-элемент на основе шаблона
  // должен создавать DOM-элемент с помощью метода render, добавлять ему обработчики, с помощью метода bind и возвращать созданный элемент
  // Метод должен использовать ленивые вычисления — элемент должен создаваться при первом обращении к геттер с помощью метода render, должны добавляться обработчики (метод bind).
  // При последующих обращениях должен использоваться элемент, созданный при первом вызове геттера.
  get element() {
    const template = this.template;
    // if (!elements.hasOwnProperty(template)) {
      const div = document.createElement(`div`);
      div.innerHTML = template;
      const elem = div.firstChild;
      elements[template] = elem;
      return elem;
    // } else {
      // return elements[template];
    // }
  }
}
