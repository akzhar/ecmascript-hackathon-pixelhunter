function getElementFromHTMLString(htmlString) {
  let div = document.createElement(`div`);
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

export default getElementFromHTMLString;
