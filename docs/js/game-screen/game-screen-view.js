var gameScreenView = (function () {
  'use strict';

  const config = {
    GET_DATA_URL: `https://raw.githubusercontent.com/akzhar/pixelhunter/master/src/js/game-model/data.json`,
    POST_DATA_URL: `https://echo.htmlacademy.ru/`,
    GAMES_COUNT: 10,
    LIVES_COUNT: 3,
    TIME_TO_ANSWER: 30000, // 30 sec
    COLOR_RED: `#d74040`,
    AnswerType: {
      PAINTING: `painting`,
      PHOTO: `photo`
    },
    QuestionType: {
      TWO_OF_TWO: `two-of-two`,
      TINDER_LIKE: `tinder-like`,
      ONE_OF_THREE: `one-of-three`
    },
    QuestionTypeToFrameSize: {
      'two-of-two': {width: 468, height: 458},
      'tinder-like': {width: 705, height: 455},
      'one-of-three': {width: 304, height: 455}
    }
  };

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

  class GameScreenView extends AbstractView {

    constructor(game) {
      super();
      this.game = game;
    }

    get template() {
      return `<div id="main" class="central__content">
              <header class="header">
                <!-- PLACE TO BACK ARROW -->
                <div class="game__timer"></div>
                <div class="game__lives"></div>
              </header>
              <section class="game">
                <p class="game__task">${this.game.question}</p>
                ${GameScreenView.getGameContent(this.game.type)}
                <ul class="stats"></ul>
              </section>
            </div>`;
    }

    static getGameContent(gameType) {
      let content = ``;
      if (gameType === config.QuestionType.TINDER_LIKE) {
        content = `<form class="game__content  game__content--wide">
                  <div class="game__option">
                    <!-- PLACE FOR IMAGE -->
                    <!-- PLACE FOR ANSWER PHOTO BUTTON -->
                    <!-- PLACE FOR ANSWER PAINT BUTTON -->
                 </div>
               </form>`;
      } else if (gameType === config.QuestionType.TWO_OF_TWO) {
        content = `<form class="game__content">
                   <div class="game__option">
                     <!-- PLACE FOR IMAGE -->
                     <!-- PLACE FOR ANSWER PHOTO BUTTON -->
                     <!-- PLACE FOR ANSWER PAINT BUTTON -->
                   </div>
                   <div class="game__option">
                     <!-- PLACE FOR IMAGE -->
                     <!-- PLACE FOR ANSWER PHOTO BUTTON -->
                     <!-- PLACE FOR ANSWER PAINT BUTTON -->
                   </div>
                 </form>`;
      } else if (gameType === config.QuestionType.ONE_OF_THREE) {
        content = `<form class="game__content  game__content--triple">
                   <!-- PLACE FOR ANSWER PAINT OPTION -->
                   <!-- PLACE FOR ANSWER PAINT OPTION -->
                   <!-- PLACE FOR ANSWER PAINT OPTION -->
                 </form>`;
      }
      return content;
    }

  }

  return GameScreenView;

}());

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZS1zY3JlZW4vZ2FtZS1zY3JlZW4tdmlldy5qcyIsInNvdXJjZXMiOlsic3JjL2pzL2NvbmZpZy5qcyIsInNyYy9qcy9hYnN0cmFjdC12aWV3LmpzIiwic3JjL2pzL2dhbWUtc2NyZWVuL2dhbWUtc2NyZWVuLXZpZXcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgY29uZmlnID0ge1xuICBHRVRfREFUQV9VUkw6IGBodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vYWt6aGFyL3BpeGVsaHVudGVyL21hc3Rlci9zcmMvanMvZ2FtZS1tb2RlbC9kYXRhLmpzb25gLFxuICBQT1NUX0RBVEFfVVJMOiBgaHR0cHM6Ly9lY2hvLmh0bWxhY2FkZW15LnJ1L2AsXG4gIEdBTUVTX0NPVU5UOiAxMCxcbiAgTElWRVNfQ09VTlQ6IDMsXG4gIFRJTUVfVE9fQU5TV0VSOiAzMDAwMCwgLy8gMzAgc2VjXG4gIENPTE9SX1JFRDogYCNkNzQwNDBgLFxuICBBbnN3ZXJUeXBlOiB7XG4gICAgUEFJTlRJTkc6IGBwYWludGluZ2AsXG4gICAgUEhPVE86IGBwaG90b2BcbiAgfSxcbiAgUXVlc3Rpb25UeXBlOiB7XG4gICAgVFdPX09GX1RXTzogYHR3by1vZi10d29gLFxuICAgIFRJTkRFUl9MSUtFOiBgdGluZGVyLWxpa2VgLFxuICAgIE9ORV9PRl9USFJFRTogYG9uZS1vZi10aHJlZWBcbiAgfSxcbiAgUXVlc3Rpb25UeXBlVG9GcmFtZVNpemU6IHtcbiAgICAndHdvLW9mLXR3byc6IHt3aWR0aDogNDY4LCBoZWlnaHQ6IDQ1OH0sXG4gICAgJ3RpbmRlci1saWtlJzoge3dpZHRoOiA3MDUsIGhlaWdodDogNDU1fSxcbiAgICAnb25lLW9mLXRocmVlJzoge3dpZHRoOiAzMDQsIGhlaWdodDogNDU1fVxuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjb25maWc7XG4iLCJjb25zdCBlbGVtZW50cyA9IHt9O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBYnN0cmFjdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKCkge31cblxuICAvLyDQstC+0LfQstGA0LDRidCw0LXRgiDRgdGC0YDQvtC60YMsINGB0L7QtNC10YDQttCw0YnRg9GOINGA0LDQt9C80LXRgtC60YNcbiAgZ2V0IHRlbXBsYXRlKCkge31cblxuICAvLyDRgdC+0LfQtNCw0LXRgiDQuCDQstC+0LfQstGA0LDRidCw0LXRgiBET00t0Y3Qu9C10LzQtdC90YIg0L3QsCDQvtGB0L3QvtCy0LUg0YjQsNCx0LvQvtC90LBcbiAgLy8g0LTQvtC70LbQtdC9INGB0L7Qt9C00LDQstCw0YLRjCBET00t0Y3Qu9C10LzQtdC90YIg0YEg0L/QvtC80L7RidGM0Y4g0LzQtdGC0L7QtNCwIHJlbmRlciwg0LTQvtCx0LDQstC70Y/RgtGMINC10LzRgyDQvtCx0YDQsNCx0L7RgtGH0LjQutC4LCDRgSDQv9C+0LzQvtGJ0YzRjiDQvNC10YLQvtC00LAgYmluZCDQuCDQstC+0LfQstGA0LDRidCw0YLRjCDRgdC+0LfQtNCw0L3QvdGL0Lkg0Y3Qu9C10LzQtdC90YJcbiAgLy8g0JzQtdGC0L7QtCDQtNC+0LvQttC10L0g0LjRgdC/0L7Qu9GM0LfQvtCy0LDRgtGMINC70LXQvdC40LLRi9C1INCy0YvRh9C40YHQu9C10L3QuNGPIOKAlCDRjdC70LXQvNC10L3RgiDQtNC+0LvQttC10L0g0YHQvtC30LTQsNCy0LDRgtGM0YHRjyDQv9GA0Lgg0L/QtdGA0LLQvtC8INC+0LHRgNCw0YnQtdC90LjQuCDQuiDQs9C10YLRgtC10YAg0YEg0L/QvtC80L7RidGM0Y4g0LzQtdGC0L7QtNCwIHJlbmRlciwg0LTQvtC70LbQvdGLINC00L7QsdCw0LLQu9GP0YLRjNGB0Y8g0L7QsdGA0LDQsdC+0YLRh9C40LrQuCAo0LzQtdGC0L7QtCBiaW5kKS5cbiAgLy8g0J/RgNC4INC/0L7RgdC70LXQtNGD0Y7RidC40YUg0L7QsdGA0LDRidC10L3QuNGP0YUg0LTQvtC70LbQtdC9INC40YHQv9C+0LvRjNC30L7QstCw0YLRjNGB0Y8g0Y3Qu9C10LzQtdC90YIsINGB0L7Qt9C00LDQvdC90YvQuSDQv9GA0Lgg0L/QtdGA0LLQvtC8INCy0YvQt9C+0LLQtSDQs9C10YLRgtC10YDQsC5cbiAgZ2V0IGVsZW1lbnQoKSB7XG4gICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlO1xuICAgIC8vIGlmICghZWxlbWVudHMuaGFzT3duUHJvcGVydHkodGVtcGxhdGUpKSB7XG4gICAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGBkaXZgKTtcbiAgICAgIGRpdi5pbm5lckhUTUwgPSB0ZW1wbGF0ZTtcbiAgICAgIGNvbnN0IGVsZW0gPSBkaXYuZmlyc3RDaGlsZDtcbiAgICAgIGVsZW1lbnRzW3RlbXBsYXRlXSA9IGVsZW07XG4gICAgICByZXR1cm4gZWxlbTtcbiAgICAvLyB9IGVsc2Uge1xuICAgICAgLy8gcmV0dXJuIGVsZW1lbnRzW3RlbXBsYXRlXTtcbiAgICAvLyB9XG4gIH1cblxuICAvLyDQvtGC0YDQuNGB0L7QstGL0LLQsNC10YIgRE9NLdGN0LvQtdC80LXQvdGCLCDQtNC+0LHQsNCy0LvRj9C10YIg0L3QtdC+0LHRhdC+0LTQuNC80YvQtSDQvtCx0YDQsNCx0L7RgtGH0LjQutC4XG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgbWFpbi5jZW50cmFsYCk7XG4gICAgY29uc3Qgb2xkRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCNtYWluYCk7XG4gICAgcGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChvbGRFbGVtZW50KTtcbiAgICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XG4gIH1cblxuICAvLyDQtNC+0LHQsNCy0LvRj9C10YIg0L7QsdGA0LDQsdC+0YLRh9C40LrQuCDRgdC+0LHRi9GC0LjQuVxuICAvLyDQnNC10YLQvtC0INC/0L4g0YPQvNC+0LvRh9Cw0L3QuNGOINC90LjRh9C10LPQviDQvdC1INC00LXQu9Cw0LXRglxuICAvLyDQldGB0LvQuCDQvdGD0LbQvdC+INC+0LHRgNCw0LHQvtGC0LDRgtGMINC60LDQutC+0LUt0YLQviDRgdC+0LHRi9GC0LjQtSwg0YLQviDRjdGC0L7RgiDQvNC10YLQvtC0INC00L7Qu9C20LXQvSDQsdGL0YLRjCDQv9C10YDQtdC+0L/RgNC10LTQtdC70ZHQvSDQsiDQvdCw0YHQu9C10LTQvdC40LrQtSDRgSDQvdC10L7QsdGF0L7QtNC40LzQvtC5INC70L7Qs9C40LrQvtC5XG4gIGJpbmQoKSB7fVxufVxuIiwiaW1wb3J0IGNvbmZpZyBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi4vYWJzdHJhY3Qtdmlldy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHYW1lU2NyZWVuVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoZ2FtZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5nYW1lID0gZ2FtZTtcbiAgfVxuXG4gIGdldCB0ZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gYDxkaXYgaWQ9XCJtYWluXCIgY2xhc3M9XCJjZW50cmFsX19jb250ZW50XCI+XG4gICAgICAgICAgICAgIDxoZWFkZXIgY2xhc3M9XCJoZWFkZXJcIj5cbiAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIFRPIEJBQ0sgQVJST1cgLS0+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdhbWVfX3RpbWVyXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdhbWVfX2xpdmVzXCI+PC9kaXY+XG4gICAgICAgICAgICAgIDwvaGVhZGVyPlxuICAgICAgICAgICAgICA8c2VjdGlvbiBjbGFzcz1cImdhbWVcIj5cbiAgICAgICAgICAgICAgICA8cCBjbGFzcz1cImdhbWVfX3Rhc2tcIj4ke3RoaXMuZ2FtZS5xdWVzdGlvbn08L3A+XG4gICAgICAgICAgICAgICAgJHtHYW1lU2NyZWVuVmlldy5nZXRHYW1lQ29udGVudCh0aGlzLmdhbWUudHlwZSl9XG4gICAgICAgICAgICAgICAgPHVsIGNsYXNzPVwic3RhdHNcIj48L3VsPlxuICAgICAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgICAgICA8L2Rpdj5gO1xuICB9XG5cbiAgc3RhdGljIGdldEdhbWVDb250ZW50KGdhbWVUeXBlKSB7XG4gICAgbGV0IGNvbnRlbnQgPSBgYDtcbiAgICBpZiAoZ2FtZVR5cGUgPT09IGNvbmZpZy5RdWVzdGlvblR5cGUuVElOREVSX0xJS0UpIHtcbiAgICAgIGNvbnRlbnQgPSBgPGZvcm0gY2xhc3M9XCJnYW1lX19jb250ZW50ICBnYW1lX19jb250ZW50LS13aWRlXCI+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ2FtZV9fb3B0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIElNQUdFIC0tPlxuICAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBBTlNXRVIgUEhPVE8gQlVUVE9OIC0tPlxuICAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBBTlNXRVIgUEFJTlQgQlVUVE9OIC0tPlxuICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgIDwvZm9ybT5gO1xuICAgIH0gZWxzZSBpZiAoZ2FtZVR5cGUgPT09IGNvbmZpZy5RdWVzdGlvblR5cGUuVFdPX09GX1RXTykge1xuICAgICAgY29udGVudCA9IGA8Zm9ybSBjbGFzcz1cImdhbWVfX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ2FtZV9fb3B0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBJTUFHRSAtLT5cbiAgICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIEFOU1dFUiBQSE9UTyBCVVRUT04gLS0+XG4gICAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBBTlNXRVIgUEFJTlQgQlVUVE9OIC0tPlxuICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJnYW1lX19vcHRpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIElNQUdFIC0tPlxuICAgICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgQU5TV0VSIFBIT1RPIEJVVFRPTiAtLT5cbiAgICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIEFOU1dFUiBQQUlOVCBCVVRUT04gLS0+XG4gICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgIDwvZm9ybT5gO1xuICAgIH0gZWxzZSBpZiAoZ2FtZVR5cGUgPT09IGNvbmZpZy5RdWVzdGlvblR5cGUuT05FX09GX1RIUkVFKSB7XG4gICAgICBjb250ZW50ID0gYDxmb3JtIGNsYXNzPVwiZ2FtZV9fY29udGVudCAgZ2FtZV9fY29udGVudC0tdHJpcGxlXCI+XG4gICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgQU5TV0VSIFBBSU5UIE9QVElPTiAtLT5cbiAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBBTlNXRVIgUEFJTlQgT1BUSU9OIC0tPlxuICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIEFOU1dFUiBQQUlOVCBPUFRJT04gLS0+XG4gICAgICAgICAgICAgICAgIDwvZm9ybT5gO1xuICAgIH1cbiAgICByZXR1cm4gY29udGVudDtcbiAgfVxuXG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0VBQUEsTUFBTSxNQUFNLEdBQUc7RUFDZixFQUFFLFlBQVksRUFBRSxDQUFDLHVGQUF1RixDQUFDO0VBQ3pHLEVBQUUsYUFBYSxFQUFFLENBQUMsNEJBQTRCLENBQUM7RUFDL0MsRUFBRSxXQUFXLEVBQUUsRUFBRTtFQUNqQixFQUFFLFdBQVcsRUFBRSxDQUFDO0VBQ2hCLEVBQUUsY0FBYyxFQUFFLEtBQUs7RUFDdkIsRUFB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
