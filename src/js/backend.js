import config from './config.js';

async function loadGames() {
  const response = await fetch(config.GET_DATA_URL);
  const gamesPromise = await response.json();
  return gamesPromise;
}

async function postData(data = {}) {
  const response = await fetch(config.POST_DATA_URL, {
    method: `POST`,
    headers: {
      'Content-Type': `application/json`
    },
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return await response.json();
}

export {loadGames, postData};
