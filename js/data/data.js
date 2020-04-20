
// создать генератор объекта games для каждой новой игры (3 типа игр)

const games = [
  { gameType: 2,
    task: `Угадайте для каждого изображения фото или рисунок?`,
    questions:
    [
      {
        src: `https://k42.kn3.net/CF42609C8.jpg`,
        answer: `paint`
      },
      {
        src: `http://i.imgur.com/1KegWPz.jpg`,
        answer: `photo`
      }
    ]
  },
  { gameType: 1,
    task: `Угадай, фото или рисунок?`,
    question: {
      src: `https://k42.kn3.net/D2F0370D6.jpg`,
      answer: `paint`
    }
  },
  { gameType: 3,
    task: `Найдите рисунок среди изображений`,
    question: {
      src:
      [
      `https://k32.kn3.net/5C7060EC5.jpg`,
      `https://i.imgur.com/DiHM5Zb.jpg`,
      'http://i.imgur.com/DKR1HtB.jpg'
      ]
      , answer: 0
    }
  },
  { gameType: 2,
    task: `Угадайте для каждого изображения фото или рисунок?`,
    questions:
    [
      {
        src: `https://k42.kn3.net/CF42609C8.jpg`,
        answer: `paint`
      },
      {
        src: `http://i.imgur.com/1KegWPz.jpg`,
        answer: `photo`
      }
    ]
  },
  { gameType: 1,
    task: `Угадай, фото или рисунок?`,
    question: {
      src: `https://k42.kn3.net/D2F0370D6.jpg`,
      answer: `paint`
    }
  },
  { gameType: 3,
    task: `Найдите рисунок среди изображений`,
    question: {
      src:
      [
      `https://k32.kn3.net/5C7060EC5.jpg`,
      `https://i.imgur.com/DiHM5Zb.jpg`,
      'http://i.imgur.com/DKR1HtB.jpg'
      ]
      , answer: 0
    }
  },
  { gameType: 2,
    task: `Угадайте для каждого изображения фото или рисунок?`,
    questions:
    [
      {
        src: `https://k42.kn3.net/CF42609C8.jpg`,
        answer: `paint`
      },
      {
        src: `http://i.imgur.com/1KegWPz.jpg`,
        answer: `photo`
      }
    ]
  },
  { gameType: 1,
    task: `Угадай, фото или рисунок?`,
    question: {
      src: `https://k42.kn3.net/D2F0370D6.jpg`,
      answer: `paint`
    }
  },
  { gameType: 3,
    task: `Найдите рисунок среди изображений`,
    question: {
      src:
      [
      `https://k32.kn3.net/5C7060EC5.jpg`,
      `https://i.imgur.com/DiHM5Zb.jpg`,
      'http://i.imgur.com/DKR1HtB.jpg'
      ]
      , answer: 0
    }
  },
  { gameType: 1,
    task: `Угадай, фото или рисунок?`,
    question: {
      src: `https://k42.kn3.net/D2F0370D6.jpg`,
      answer: `paint`
    }
  }
];

export default {
  user: ``,
  lives: 3,
  games: games,
  answers: []
};
