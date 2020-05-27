import AbstractView from "./abstract-view.js";

export default class IntroScreenView extends AbstractView {

  constructor() {
    super();
  }

  get template() {
    return `<div id="main" class="central__content">
              <section id="intro" class="intro">
                <!-- PLACE TO ASTERISK -->
                <p class="intro__motto"><sup>*</sup> Это не фото. Это рисунок маслом нидерландского художника-фотореалиста Tjalf Sparnaay.</p>
                <button class="intro__top top" type="button">
                  <img src="img/icon-top.svg" width="71" height="79" alt="Топ игроков">
                </button>
              </section>
            </div>`;
  }
}
