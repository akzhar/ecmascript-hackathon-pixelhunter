var rulesScreenView = (function () {
  'use strict';

  class AbstractView {

    constructor() {}

    // возвращает строку, содержащую разметку
    get template() {}

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
        return elem;
      // } else {
        // return elements[template];
      // }
    }

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
  }

  class RulesScreenView extends AbstractView {

    constructor() {
      super();
    }

    get template() {
      return `<div id="main" class="central__content">
              <header class="header">
                <!-- PLACE TO BACK ARROW -->
              </header>
              <section class="rules">
                <h2 class="rules__title">Правила</h2>
                <ul class="rules__description">
                  <li>Угадай 10 раз для каждого изображения фото
                    <img class="rules__icon" src="img/icon-photo.png" width="32" height="31" alt="Фото"> или рисунок
                    <img class="rules__icon" src="img/icon-paint.png" width="32" height="31" alt="Рисунок"></li>
                  <li>Фотографиями или рисунками могут быть оба изображения.</li>
                  <li>На каждую попытку отводится 30 секунд.</li>
                  <li>Ошибиться можно не более 3 раз.</li>
                </ul>
                <p class="rules__ready">Готовы?</p>
                <form class="rules__form">
                  <!-- PLACE TO NAME INPUT -->
                  <!-- PLACE TO START BUTTON -->
                </form>
              </section>
            </div>`;
    }
  }

  return RulesScreenView;

}());

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVsZXMtc2NyZWVuL3J1bGVzLXNjcmVlbi12aWV3LmpzIiwic291cmNlcyI6WyJzcmMvanMvYWJzdHJhY3Qtdmlldy5qcyIsInNyYy9qcy9ydWxlcy1zY3JlZW4vcnVsZXMtc2NyZWVuLXZpZXcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZWxlbWVudHMgPSB7fTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgLy8g0LLQvtC30LLRgNCw0YnQsNC10YIg0YHRgtGA0L7QutGDLCDRgdC+0LTQtdGA0LbQsNGJ0YPRjiDRgNCw0LfQvNC10YLQutGDXG4gIGdldCB0ZW1wbGF0ZSgpIHt9XG5cbiAgLy8g0YHQvtC30LTQsNC10YIg0Lgg0LLQvtC30LLRgNCw0YnQsNC10YIgRE9NLdGN0LvQtdC80LXQvdGCINC90LAg0L7RgdC90L7QstC1INGI0LDQsdC70L7QvdCwXG4gIC8vINC00L7Qu9C20LXQvSDRgdC+0LfQtNCw0LLQsNGC0YwgRE9NLdGN0LvQtdC80LXQvdGCINGBINC/0L7QvNC+0YnRjNGOINC80LXRgtC+0LTQsCByZW5kZXIsINC00L7QsdCw0LLQu9GP0YLRjCDQtdC80YMg0L7QsdGA0LDQsdC+0YLRh9C40LrQuCwg0YEg0L/QvtC80L7RidGM0Y4g0LzQtdGC0L7QtNCwIGJpbmQg0Lgg0LLQvtC30LLRgNCw0YnQsNGC0Ywg0YHQvtC30LTQsNC90L3Ri9C5INGN0LvQtdC80LXQvdGCXG4gIC8vINCc0LXRgtC+0LQg0LTQvtC70LbQtdC9INC40YHQv9C+0LvRjNC30L7QstCw0YLRjCDQu9C10L3QuNCy0YvQtSDQstGL0YfQuNGB0LvQtdC90LjRjyDigJQg0Y3Qu9C10LzQtdC90YIg0LTQvtC70LbQtdC9INGB0L7Qt9C00LDQstCw0YLRjNGB0Y8g0L/RgNC4INC/0LXRgNCy0L7QvCDQvtCx0YDQsNGJ0LXQvdC40Lgg0Log0LPQtdGC0YLQtdGAINGBINC/0L7QvNC+0YnRjNGOINC80LXRgtC+0LTQsCByZW5kZXIsINC00L7Qu9C20L3RiyDQtNC+0LHQsNCy0LvRj9GC0YzRgdGPINC+0LHRgNCw0LHQvtGC0YfQuNC60LggKNC80LXRgtC+0LQgYmluZCkuXG4gIC8vINCf0YDQuCDQv9C+0YHQu9C10LTRg9GO0YnQuNGFINC+0LHRgNCw0YnQtdC90LjRj9GFINC00L7Qu9C20LXQvSDQuNGB0L/QvtC70YzQt9C+0LLQsNGC0YzRgdGPINGN0LvQtdC80LXQvdGCLCDRgdC+0LfQtNCw0L3QvdGL0Lkg0L/RgNC4INC/0LXRgNCy0L7QvCDQstGL0LfQvtCy0LUg0LPQtdGC0YLQtdGA0LAuXG4gIGdldCBlbGVtZW50KCkge1xuICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy50ZW1wbGF0ZTtcbiAgICAvLyBpZiAoIWVsZW1lbnRzLmhhc093blByb3BlcnR5KHRlbXBsYXRlKSkge1xuICAgICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChgZGl2YCk7XG4gICAgICBkaXYuaW5uZXJIVE1MID0gdGVtcGxhdGU7XG4gICAgICBjb25zdCBlbGVtID0gZGl2LmZpcnN0Q2hpbGQ7XG4gICAgICBlbGVtZW50c1t0ZW1wbGF0ZV0gPSBlbGVtO1xuICAgICAgcmV0dXJuIGVsZW07XG4gICAgLy8gfSBlbHNlIHtcbiAgICAgIC8vIHJldHVybiBlbGVtZW50c1t0ZW1wbGF0ZV07XG4gICAgLy8gfVxuICB9XG5cbiAgLy8g0L7RgtGA0LjRgdC+0LLRi9Cy0LDQtdGCIERPTS3RjdC70LXQvNC10L3Rgiwg0LTQvtCx0LDQstC70Y/QtdGCINC90LXQvtCx0YXQvtC00LjQvNGL0LUg0L7QsdGA0LDQsdC+0YLRh9C40LrQuFxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYG1haW4uY2VudHJhbGApO1xuICAgIGNvbnN0IG9sZEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjbWFpbmApO1xuICAgIHBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQob2xkRWxlbWVudCk7XG4gICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgLy8g0LTQvtCx0LDQstC70Y/QtdGCINC+0LHRgNCw0LHQvtGC0YfQuNC60Lgg0YHQvtCx0YvRgtC40LlcbiAgLy8g0JzQtdGC0L7QtCDQv9C+INGD0LzQvtC70YfQsNC90LjRjiDQvdC40YfQtdCz0L4g0L3QtSDQtNC10LvQsNC10YJcbiAgLy8g0JXRgdC70Lgg0L3Rg9C20L3QviDQvtCx0YDQsNCx0L7RgtCw0YLRjCDQutCw0LrQvtC1LdGC0L4g0YHQvtCx0YvRgtC40LUsINGC0L4g0Y3RgtC+0YIg0LzQtdGC0L7QtCDQtNC+0LvQttC10L0g0LHRi9GC0Ywg0L/QtdGA0LXQvtC/0YDQtdC00LXQu9GR0L0g0LIg0L3QsNGB0LvQtdC00L3QuNC60LUg0YEg0L3QtdC+0LHRhdC+0LTQuNC80L7QuSDQu9C+0LPQuNC60L7QuVxuICBiaW5kKCkge31cbn1cbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSBcIi4uL2Fic3RyYWN0LXZpZXcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUnVsZXNTY3JlZW5WaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPGRpdiBpZD1cIm1haW5cIiBjbGFzcz1cImNlbnRyYWxfX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgPGhlYWRlciBjbGFzcz1cImhlYWRlclwiPlxuICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgVE8gQkFDSyBBUlJPVyAtLT5cbiAgICAgICAgICAgICAgPC9oZWFkZXI+XG4gICAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzPVwicnVsZXNcIj5cbiAgICAgICAgICAgICAgICA8aDIgY2xhc3M9XCJydWxlc19fdGl0bGVcIj7Qn9GA0LDQstC40LvQsDwvaDI+XG4gICAgICAgICAgICAgICAgPHVsIGNsYXNzPVwicnVsZXNfX2Rlc2NyaXB0aW9uXCI+XG4gICAgICAgICAgICAgICAgICA8bGk+0KPQs9Cw0LTQsNC5IDEwINGA0LDQtyDQtNC70Y8g0LrQsNC20LTQvtCz0L4g0LjQt9C+0LHRgNCw0LbQtdC90LjRjyDRhNC+0YLQvlxuICAgICAgICAgICAgICAgICAgICA8aW1nIGNsYXNzPVwicnVsZXNfX2ljb25cIiBzcmM9XCJpbWcvaWNvbi1waG90by5wbmdcIiB3aWR0aD1cIjMyXCIgaGVpZ2h0PVwiMzFcIiBhbHQ9XCLQpNC+0YLQvlwiPiDQuNC70Lgg0YDQuNGB0YPQvdC+0LpcbiAgICAgICAgICAgICAgICAgICAgPGltZyBjbGFzcz1cInJ1bGVzX19pY29uXCIgc3JjPVwiaW1nL2ljb24tcGFpbnQucG5nXCIgd2lkdGg9XCIzMlwiIGhlaWdodD1cIjMxXCIgYWx0PVwi0KDQuNGB0YPQvdC+0LpcIj48L2xpPlxuICAgICAgICAgICAgICAgICAgPGxpPtCk0L7RgtC+0LPRgNCw0YTQuNGP0LzQuCDQuNC70Lgg0YDQuNGB0YPQvdC60LDQvNC4INC80L7Qs9GD0YIg0LHRi9GC0Ywg0L7QsdCwINC40LfQvtCx0YDQsNC20LXQvdC40Y8uPC9saT5cbiAgICAgICAgICAgICAgICAgIDxsaT7QndCwINC60LDQttC00YPRjiDQv9C+0L/Ri9GC0LrRgyDQvtGC0LLQvtC00LjRgtGB0Y8gMzAg0YHQtdC60YPQvdC0LjwvbGk+XG4gICAgICAgICAgICAgICAgICA8bGk+0J7RiNC40LHQuNGC0YzRgdGPINC80L7QttC90L4g0L3QtSDQsdC+0LvQtdC1IDMg0YDQsNC3LjwvbGk+XG4gICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgICA8cCBjbGFzcz1cInJ1bGVzX19yZWFkeVwiPtCT0L7RgtC+0LLRiz88L3A+XG4gICAgICAgICAgICAgICAgPGZvcm0gY2xhc3M9XCJydWxlc19fZm9ybVwiPlxuICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBUTyBOQU1FIElOUFVUIC0tPlxuICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBUTyBTVEFSVCBCVVRUT04gLS0+XG4gICAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgICAgICA8L2Rpdj5gO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0VBRWUsTUFBTSxZQUFZLENBQUM7QUFDbEM7RUFDQSxFQUFFLFdBQVcsR0FBRyxFQUFFO0FBQ2xCO0VBQ0E7RUFDQSxFQUFFLElBQUksUUFBUSxHQUFHLEVBQUU7QUFDbkI7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBLEVBQUUsSUFBSSxPQUFPLEdBQUc7RUFDaEIsSUFBSSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0VBQ25DO0VBQ0EsTUFBTSxNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztFQUNoRCxNQUFNLEdBQUcsQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO0VBQy9CLE1BQU0sTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQztFQUVsQyxNQUFNLE9BQU8sSUFBSSxDQUFDO0VBQ2xCO0VBQ0E7RUFDQTtFQUNBLEdBQUc7QUFDSDtFQUNBO0VBQ0EsRUFBRSxNQUFNLEdBQUc7RUFDWCxJQUFJLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0VBQ2pFLElBQUksTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7RUFDdkQsSUFBSSxhQUFhLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0VBQzFDLElBQUksYUFBYSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7RUFDNUMsR0FBRztBQUNIO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsRUFBRSxJQUFJLEdBQUcsRUFBRTtFQUNYOztFQ3BDZSxNQUFNLGVBQWUsU0FBUyxZQUFZLENBQUM7QUFDMUQ7RUFDQSxFQUFFLFdBQVcsR0FBRztFQUNoQixJQUFJLEtBQUssRUFBRSxDQUFDO0VBQ1osR0FBRztBQUNIO0VBQ0EsRUFBRSxJQUFJLFFBQVEsR0FBRztFQUNqQixJQUFJLE9BQU8sQ0FBQztBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLENBQUMsQ0FBQztFQUNwQixHQUFHO0VBQ0g7Ozs7Ozs7OyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
