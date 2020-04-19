const games = {
  '2': {
    task: `Угадайте для каждого изображения фото или рисунок?`,
    option1: `https://k42.kn3.net/CF42609C8.jpg`, // painting
    option2: `http://i.imgur.com/1KegWPz.jpg` // photo
  },
  '1': {
    task: `Угадай, фото или рисунок?`,
    option1: `https://k42.kn3.net/D2F0370D6.jpg` // painting
  },
  '3': {
    task: `Найдите рисунок среди изображений`,
    option1: `https://k32.kn3.net/5C7060EC5.jpg`, // painting
    option2: `https://i.imgur.com/DiHM5Zb.jpg`, // photo
    option3: `https://k32.kn3.net/5C7060EC5.jpg`, // painting 'http://i.imgur.com/DKR1HtB.jpg' photo
  }
};

export default {
  lives: 2,
  time: `2:59`,
  games: games,
  stats: {}
};
