
// создать генератор объекта games для каждой новой игры (3 типа игр)

const games = [
  {
    gameIndex: 0,
    gameType: 2, // 2 изображения: для каждого из изображений пользователь должен указать картина это или фотография.
    frameSize: {width: 468, height: 458},
    task: `Угадайте для каждого изображения фото или рисунок?`,
    questions:
    [
      {
        img:
        [
          {
            src: `https://k42.kn3.net/CF42609C8.jpg`,
            size: {width: 600, height: 831}
          }
        ],
        correctAnswer: `paint`
      },
      {
        img:
        [
          {
            src: `http://i.imgur.com/1KegWPz.jpg`,
            size: {width: 1080, height: 720}
          }
        ],
        correctAnswer: `photo`
      }
    ]
  },
  {
    gameIndex: 1,
    gameType: 1, // 1 изображение: в этом режиме пользователь должен определить картина это или фотография.
    frameSize: {width: 705, height: 455},
    task: `Угадай, фото или рисунок?`,
    questions:
    [
      {
        img:
        [
          {
            src: `https://k42.kn3.net/D2F0370D6.jpg`,
            size: {width: 468, height: 354}
          }
        ],
        correctAnswer: `paint`
      }
    ]
  },
  {
    gameIndex: 2,
    gameType: 3, // 3 изображения: пользователю нужно выбрать одно — либо нужно выбрать единственную фотографию, либо единственную картину.
    frameSize: {width: 304, height: 455},
    task: `Найдите рисунок среди изображений`,
    questions: [
      {
        img:
        [
          {
            src: `https://k32.kn3.net/5C7060EC5.jpg`,
            size: {width: 1200, height: 900}
          },
          {
            src: `https://i.imgur.com/DiHM5Zb.jpg`,
            size: {width: 1264, height: 1864}
          },
          {
            src: `http://i.imgur.com/DKR1HtB.jpg`,
            size: {width: 1120, height: 2965}
          }
        ], correctAnswer: 0
      }
    ]
  },
  {
    gameIndex: 3,
    gameType: 2,
    frameSize: {width: 468, height: 458},
    task: `Угадайте для каждого изображения фото или рисунок?`,
    questions:
    [
      {
        img:
        [
          {
            src: `https://k42.kn3.net/CF42609C8.jpg`,
            size: {width: 600, height: 831}
          }
        ],
        correctAnswer: `paint`
      },
      {
        img:
        [
          {
            src: `http://i.imgur.com/1KegWPz.jpg`,
            size: {width: 1080, height: 720}
          }
        ],
        correctAnswer: `photo`
      }
    ]
  },
  {
    gameIndex: 4,
    gameType: 1,
    frameSize: {width: 705, height: 455},
    task: `Угадай, фото или рисунок?`,
    questions:
    [
      {
        img:
        [
          {
            src: `https://k42.kn3.net/D2F0370D6.jpg`,
            size: {width: 468, height: 354}
          }
        ],
        correctAnswer: `paint`
      }
    ]
  },
  {
    gameIndex: 5,
    gameType: 3,
    frameSize: {width: 304, height: 455},
    task: `Найдите рисунок среди изображений`,
    questions: [
      {
        img:
        [
          {
            src: `https://k32.kn3.net/5C7060EC5.jpg`,
            size: {width: 1200, height: 900}
          },
          {
            src: `https://i.imgur.com/DiHM5Zb.jpg`,
            size: {width: 1264, height: 1864}
          },
          {
            src: `http://i.imgur.com/DKR1HtB.jpg`,
            size: {width: 1120, height: 2965}
          }
        ], correctAnswer: 0
      }
    ]
  },
  {
    gameIndex: 6,
    gameType: 2,
    frameSize: {width: 468, height: 458},
    task: `Угадайте для каждого изображения фото или рисунок?`,
    questions:
    [
      {
        img:
        [
          {
            src: `https://k42.kn3.net/CF42609C8.jpg`,
            size: {width: 600, height: 831}
          }
        ],
        correctAnswer: `paint`
      },
      {
        img:
        [
          {
            src: `http://i.imgur.com/1KegWPz.jpg`,
            size: {width: 1080, height: 720}
          }
        ],
        correctAnswer: `photo`
      }
    ]
  },
  {
    gameIndex: 7,
    gameType: 1,
    frameSize: {width: 705, height: 455},
    task: `Угадай, фото или рисунок?`,
    questions:
    [
      {
        img:
        [
          {
            src: `https://k42.kn3.net/D2F0370D6.jpg`,
            size: {width: 468, height: 354}
          }
        ],
        correctAnswer: `paint`
      }
    ]
  },
  {
    gameIndex: 8,
    gameType: 3,
    frameSize: {width: 304, height: 455},
    task: `Найдите рисунок среди изображений`,
    questions: [
      {
        img:
        [
          {
            src: `https://k32.kn3.net/5C7060EC5.jpg`,
            size: {width: 1200, height: 900}
          },
          {
            src: `https://i.imgur.com/DiHM5Zb.jpg`,
            size: {width: 1264, height: 1864}
          },
          {
            src: `http://i.imgur.com/DKR1HtB.jpg`,
            size: {width: 1120, height: 2965}
          }
        ], correctAnswer: 0
      }
    ]
  },
  {
    gameIndex: 9,
    gameType: 1,
    frameSize: {width: 705, height: 455},
    task: `Угадай, фото или рисунок?`,
    questions:
    [
      {
        img:
        [
          {
            src: `https://k42.kn3.net/D2F0370D6.jpg`,
            size: {width: 468, height: 354}
          }
        ],
        correctAnswer: `paint`
      }
    ]
  }
];

export default {
  user: ``,
  lives: 3,
  games,
  answers: []
};
