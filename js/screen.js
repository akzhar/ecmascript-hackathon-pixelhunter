const main = document.querySelector(`#main`);

function switchScreen(screen) {
  main.innerHTML = ``;
  main.appendChild(screen);
}

export default switchScreen;
