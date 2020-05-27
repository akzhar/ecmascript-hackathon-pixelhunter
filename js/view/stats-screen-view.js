import AbstractView from "./abstract-view.js";

export default class StatsScreenView extends AbstractView {

  constructor() {
    super();
  }

  get template() {
    return `<div id="main" class="central__content">
              <header class="header">
                <!-- PLACE TO BACK ARROW -->
              </header>
              <section class="result"></section>
            </div>`;
  }

}
