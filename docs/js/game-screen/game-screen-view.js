var gameScreenView = (function () {
  'use strict';

  const config = {
    GAMES_DATA_URL: `https://raw.githubusercontent.com/akzhar/pixelhunter/master/src/js/game-model/data.json`,
    GAMES_COUNT: 10,
    LIVES_COUNT: 3,
    TIME_TO_ANSWER: 30000, // 30 sec
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZS1zY3JlZW4vZ2FtZS1zY3JlZW4tdmlldy5qcyIsInNvdXJjZXMiOlsic3JjL2pzL2NvbmZpZy5qcyIsInNyYy9qcy9hYnN0cmFjdC12aWV3LmpzIiwic3JjL2pzL2dhbWUtc2NyZWVuL2dhbWUtc2NyZWVuLXZpZXcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgY29uZmlnID0ge1xuICBHQU1FU19EQVRBX1VSTDogYGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9ha3poYXIvcGl4ZWxodW50ZXIvbWFzdGVyL3NyYy9qcy9nYW1lLW1vZGVsL2RhdGEuanNvbmAsXG4gIEdBTUVTX0NPVU5UOiAxMCxcbiAgTElWRVNfQ09VTlQ6IDMsXG4gIFRJTUVfVE9fQU5TV0VSOiAzMDAwMCwgLy8gMzAgc2VjXG4gIEFuc3dlclR5cGU6IHtcbiAgICBQQUlOVElORzogYHBhaW50aW5nYCxcbiAgICBQSE9UTzogYHBob3RvYFxuICB9LFxuICBRdWVzdGlvblR5cGU6IHtcbiAgICBUV09fT0ZfVFdPOiBgdHdvLW9mLXR3b2AsXG4gICAgVElOREVSX0xJS0U6IGB0aW5kZXItbGlrZWAsXG4gICAgT05FX09GX1RIUkVFOiBgb25lLW9mLXRocmVlYFxuICB9LFxuICBRdWVzdGlvblR5cGVUb0ZyYW1lU2l6ZToge1xuICAgICd0d28tb2YtdHdvJzoge3dpZHRoOiA0NjgsIGhlaWdodDogNDU4fSxcbiAgICAndGluZGVyLWxpa2UnOiB7d2lkdGg6IDcwNSwgaGVpZ2h0OiA0NTV9LFxuICAgICdvbmUtb2YtdGhyZWUnOiB7d2lkdGg6IDMwNCwgaGVpZ2h0OiA0NTV9XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNvbmZpZztcbiIsImNvbnN0IGVsZW1lbnRzID0ge307XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFic3RyYWN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIC8vINCy0L7Qt9Cy0YDQsNGJ0LDQtdGCINGB0YLRgNC+0LrRgywg0YHQvtC00LXRgNC20LDRidGD0Y4g0YDQsNC30LzQtdGC0LrRg1xuICBnZXQgdGVtcGxhdGUoKSB7fVxuXG4gIC8vINGB0L7Qt9C00LDQtdGCINC4INCy0L7Qt9Cy0YDQsNGJ0LDQtdGCIERPTS3RjdC70LXQvNC10L3RgiDQvdCwINC+0YHQvdC+0LLQtSDRiNCw0LHQu9C+0L3QsFxuICAvLyDQtNC+0LvQttC10L0g0YHQvtC30LTQsNCy0LDRgtGMIERPTS3RjdC70LXQvNC10L3RgiDRgSDQv9C+0LzQvtGJ0YzRjiDQvNC10YLQvtC00LAgcmVuZGVyLCDQtNC+0LHQsNCy0LvRj9GC0Ywg0LXQvNGDINC+0LHRgNCw0LHQvtGC0YfQuNC60LgsINGBINC/0L7QvNC+0YnRjNGOINC80LXRgtC+0LTQsCBiaW5kINC4INCy0L7Qt9Cy0YDQsNGJ0LDRgtGMINGB0L7Qt9C00LDQvdC90YvQuSDRjdC70LXQvNC10L3RglxuICAvLyDQnNC10YLQvtC0INC00L7Qu9C20LXQvSDQuNGB0L/QvtC70YzQt9C+0LLQsNGC0Ywg0LvQtdC90LjQstGL0LUg0LLRi9GH0LjRgdC70LXQvdC40Y8g4oCUINGN0LvQtdC80LXQvdGCINC00L7Qu9C20LXQvSDRgdC+0LfQtNCw0LLQsNGC0YzRgdGPINC/0YDQuCDQv9C10YDQstC+0Lwg0L7QsdGA0LDRidC10L3QuNC4INC6INCz0LXRgtGC0LXRgCDRgSDQv9C+0LzQvtGJ0YzRjiDQvNC10YLQvtC00LAgcmVuZGVyLCDQtNC+0LvQttC90Ysg0LTQvtCx0LDQstC70Y/RgtGM0YHRjyDQvtCx0YDQsNCx0L7RgtGH0LjQutC4ICjQvNC10YLQvtC0IGJpbmQpLlxuICAvLyDQn9GA0Lgg0L/QvtGB0LvQtdC00YPRjtGJ0LjRhSDQvtCx0YDQsNGJ0LXQvdC40Y/RhSDQtNC+0LvQttC10L0g0LjRgdC/0L7Qu9GM0LfQvtCy0LDRgtGM0YHRjyDRjdC70LXQvNC10L3Rgiwg0YHQvtC30LTQsNC90L3Ri9C5INC/0YDQuCDQv9C10YDQstC+0Lwg0LLRi9C30L7QstC1INCz0LXRgtGC0LXRgNCwLlxuICBnZXQgZWxlbWVudCgpIHtcbiAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMudGVtcGxhdGU7XG4gICAgLy8gaWYgKCFlbGVtZW50cy5oYXNPd25Qcm9wZXJ0eSh0ZW1wbGF0ZSkpIHtcbiAgICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoYGRpdmApO1xuICAgICAgZGl2LmlubmVySFRNTCA9IHRlbXBsYXRlO1xuICAgICAgY29uc3QgZWxlbSA9IGRpdi5maXJzdENoaWxkO1xuICAgICAgZWxlbWVudHNbdGVtcGxhdGVdID0gZWxlbTtcbiAgICAgIHJldHVybiBlbGVtO1xuICAgIC8vIH0gZWxzZSB7XG4gICAgICAvLyByZXR1cm4gZWxlbWVudHNbdGVtcGxhdGVdO1xuICAgIC8vIH1cbiAgfVxuXG4gIC8vINC+0YLRgNC40YHQvtCy0YvQstCw0LXRgiBET00t0Y3Qu9C10LzQtdC90YIsINC00L7QsdCw0LLQu9GP0LXRgiDQvdC10L7QsdGF0L7QtNC40LzRi9C1INC+0LHRgNCw0LHQvtGC0YfQuNC60LhcbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBtYWluLmNlbnRyYWxgKTtcbiAgICBjb25zdCBvbGRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI21haW5gKTtcbiAgICBwYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKG9sZEVsZW1lbnQpO1xuICAgIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIC8vINC00L7QsdCw0LLQu9GP0LXRgiDQvtCx0YDQsNCx0L7RgtGH0LjQutC4INGB0L7QsdGL0YLQuNC5XG4gIC8vINCc0LXRgtC+0LQg0L/QviDRg9C80L7Qu9GH0LDQvdC40Y4g0L3QuNGH0LXQs9C+INC90LUg0LTQtdC70LDQtdGCXG4gIC8vINCV0YHQu9C4INC90YPQttC90L4g0L7QsdGA0LDQsdC+0YLQsNGC0Ywg0LrQsNC60L7QtS3RgtC+INGB0L7QsdGL0YLQuNC1LCDRgtC+INGN0YLQvtGCINC80LXRgtC+0LQg0LTQvtC70LbQtdC9INCx0YvRgtGMINC/0LXRgNC10L7Qv9GA0LXQtNC10LvRkdC9INCyINC90LDRgdC70LXQtNC90LjQutC1INGBINC90LXQvtCx0YXQvtC00LjQvNC+0Lkg0LvQvtCz0LjQutC+0LlcbiAgYmluZCgpIHt9XG59XG4iLCJpbXBvcnQgY29uZmlnIGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgQWJzdHJhY3RWaWV3IGZyb20gXCIuLi9hYnN0cmFjdC12aWV3LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdhbWVTY3JlZW5WaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcihnYW1lKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xuICB9XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPGRpdiBpZD1cIm1haW5cIiBjbGFzcz1cImNlbnRyYWxfX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgPGhlYWRlciBjbGFzcz1cImhlYWRlclwiPlxuICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgVE8gQkFDSyBBUlJPVyAtLT5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ2FtZV9fdGltZXJcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ2FtZV9fbGl2ZXNcIj48L2Rpdj5cbiAgICAgICAgICAgICAgPC9oZWFkZXI+XG4gICAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzPVwiZ2FtZVwiPlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwiZ2FtZV9fdGFza1wiPiR7dGhpcy5nYW1lLnF1ZXN0aW9ufTwvcD5cbiAgICAgICAgICAgICAgICAke0dhbWVTY3JlZW5WaWV3LmdldEdhbWVDb250ZW50KHRoaXMuZ2FtZS50eXBlKX1cbiAgICAgICAgICAgICAgICA8dWwgY2xhc3M9XCJzdGF0c1wiPjwvdWw+XG4gICAgICAgICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgICAgIDwvZGl2PmA7XG4gIH1cblxuICBzdGF0aWMgZ2V0R2FtZUNvbnRlbnQoZ2FtZVR5cGUpIHtcbiAgICBsZXQgY29udGVudCA9IGBgO1xuICAgIGlmIChnYW1lVHlwZSA9PT0gY29uZmlnLlF1ZXN0aW9uVHlwZS5USU5ERVJfTElLRSkge1xuICAgICAgY29udGVudCA9IGA8Zm9ybSBjbGFzcz1cImdhbWVfX2NvbnRlbnQgIGdhbWVfX2NvbnRlbnQtLXdpZGVcIj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJnYW1lX19vcHRpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgSU1BR0UgLS0+XG4gICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIEFOU1dFUiBQSE9UTyBCVVRUT04gLS0+XG4gICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIEFOU1dFUiBQQUlOVCBCVVRUT04gLS0+XG4gICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgPC9mb3JtPmA7XG4gICAgfSBlbHNlIGlmIChnYW1lVHlwZSA9PT0gY29uZmlnLlF1ZXN0aW9uVHlwZS5UV09fT0ZfVFdPKSB7XG4gICAgICBjb250ZW50ID0gYDxmb3JtIGNsYXNzPVwiZ2FtZV9fY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJnYW1lX19vcHRpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIElNQUdFIC0tPlxuICAgICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgQU5TV0VSIFBIT1RPIEJVVFRPTiAtLT5cbiAgICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIEFOU1dFUiBQQUlOVCBCVVRUT04gLS0+XG4gICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdhbWVfX29wdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgSU1BR0UgLS0+XG4gICAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBBTlNXRVIgUEhPVE8gQlVUVE9OIC0tPlxuICAgICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgQU5TV0VSIFBBSU5UIEJVVFRPTiAtLT5cbiAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgPC9mb3JtPmA7XG4gICAgfSBlbHNlIGlmIChnYW1lVHlwZSA9PT0gY29uZmlnLlF1ZXN0aW9uVHlwZS5PTkVfT0ZfVEhSRUUpIHtcbiAgICAgIGNvbnRlbnQgPSBgPGZvcm0gY2xhc3M9XCJnYW1lX19jb250ZW50ICBnYW1lX19jb250ZW50LS10cmlwbGVcIj5cbiAgICAgICAgICAgICAgICAgICA8IS0tIFBMQUNFIEZPUiBBTlNXRVIgUEFJTlQgT1BUSU9OIC0tPlxuICAgICAgICAgICAgICAgICAgIDwhLS0gUExBQ0UgRk9SIEFOU1dFUiBQQUlOVCBPUFRJT04gLS0+XG4gICAgICAgICAgICAgICAgICAgPCEtLSBQTEFDRSBGT1IgQU5TV0VSIFBBSU5UIE9QVElPTiAtLT5cbiAgICAgICAgICAgICAgICAgPC9mb3JtPmA7XG4gICAgfVxuICAgIHJldHVybiBjb250ZW50O1xuICB9XG5cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7RUFBQSxNQUFNLE1BQU0sR0FBRztFQUNmLEVBQUUsY0FBYyxFQUFFLENBQUMsdUZBQXVGLENBQUM7RUFDM0csRUFBRSxXQUFXLEVBQUUsRUFBRTtFQUNqQixFQUFFLFdBQVcsRUFBRSxDQUFDO0VBQ2hCLEVBQUUsY0FBYyxFQUFFLEtBQUs7RUFDdkIsRUFBRSxVQUFVLEVBQUU7RUFDZCxJQUFJLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQztFQUN4QixJQUFJLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztFQUNsQixHQUFHO0VBQ0gsRUFBRSxZQUFZLEVBQUU7RUFDaEIsSUFBSSxVQUFVLEVBQUUsQ0FBQyxVQUFVLENBQUM7RUFDNUIsSUFBSSxXQUFXLEVBQUUsQ0FBQyxXQUFXLENBQUM7RUFDOUIsSUFBSSxZQUFZLEVBQUUsQ0FBQyxZQUFZLENBQUM7RUFDaEMsR0FBRztFQUNILEVBQUUsdUJBQXVCLEVBQUU7RUFDM0IsSUFBSSxZQUFZLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUM7RUFDM0MsSUFBSSxhQUFhLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUM7RUFDNUMsSUFBSSxjQUFjLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUM7RUFDN0MsR0FBRztFQUNILENBQUM7O0VDakJjLE1BQU0sWUFBWSxDQUFDO0FBQ2xDO0VBQ0EsRUFBRSxXQUFXLEdBQUcsRUFBRTtBQUNsQjtFQUNBO0VBQ0EsRUFBRSxJQUFJLFFBQVEsR0FBRyxFQUFFO0FBQ25CO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQSxFQUFFLElBQUksT0FBTyxHQUFHO0VBQ2hCLElBQUksTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztFQUNuQztFQUNBLE1BQU0sTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7RUFDaEQsTUFBTSxHQUFHLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztFQUMvQixNQUFNLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUM7RUFFbEMsTUFBTSxPQUFPLElBQUksQ0FBQztFQUNsQjtFQUNBO0VBQ0E7RUFDQSxHQUFHO0FBQ0g7RUFDQTtFQUNBLEVBQUUsTUFBTSxHQUFHO0VBQ1gsSUFBSSxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztFQUNqRSxJQUFJLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0VBQ3ZELElBQUksYUFBYSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztFQUMxQyxJQUFJLGFBQWEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0VBQzVDLEdBQUc7QUFDSDtFQUNBO0VBQ0E7RUFDQTtFQUNBLEVBQUUsSUFBSSxHQUFHLEVBQUU7RUFDWDs7RUNuQ2UsTUFBTSxjQUFjLFNBQVMsWUFBWSxDQUFDO0FBQ3pEO0VBQ0EsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFO0VBQ3BCLElBQUksS0FBSyxFQUFFLENBQUM7RUFDWixJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0VBQ3JCLEdBQUc7QUFDSDtFQUNBLEVBQUUsSUFBSSxRQUFRLEdBQUc7RUFDakIsSUFBSSxPQUFPLENBQUM7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQ0FBc0MsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUMzRCxnQkFBZ0IsRUFBRSxjQUFjLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEU7QUFDQTtBQUNBLGtCQUFrQixDQUFDLENBQUM7RUFDcEIsR0FBRztBQUNIO0VBQ0EsRUFBRSxPQUFPLGNBQWMsQ0FBQyxRQUFRLEVBQUU7RUFDbEMsSUFBSSxJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztFQUNyQixJQUFJLElBQUksUUFBUSxLQUFLLE1BQU0sQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFO0VBQ3RELE1BQU0sT0FBTyxHQUFHLENBQUM7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixDQUFDLENBQUM7RUFDeEIsS0FBSyxNQUFNLElBQUksUUFBUSxLQUFLLE1BQU0sQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFO0VBQzVELE1BQU0sT0FBTyxHQUFHLENBQUM7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsQ0FBQyxDQUFDO0VBQzFCLEtBQUssTUFBTSxJQUFJLFFBQVEsS0FBSyxNQUFNLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRTtFQUM5RCxNQUFNLE9BQU8sR0FBRyxDQUFDO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixDQUFDLENBQUM7RUFDMUIsS0FBSztFQUNMLElBQUksT0FBTyxPQUFPLENBQUM7RUFDbkIsR0FBRztBQUNIO0VBQ0E7Ozs7Ozs7OyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
