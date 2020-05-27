
// создать генератор объекта games для каждой новой игры (3 типа игр)

const games = [
  {
    gameType: 2, // 2 изображения: для каждого из изображений пользователь должен указать картина это или фотография.
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
        answer: `paint`
      },
      {
        img:
        [
          {
            src: `http://i.imgur.com/1KegWPz.jpg`,
            size: {width: 1080, height: 720}
          }
        ],
        answer: `photo`
      }
    ]
  },
  {
    gameType: 1, // 1 изображение: в этом режиме пользователь должен определить картина это или фотография.
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
        answer: `paint`
      }
    ]
  },
  {
    gameType: 3, // 3 изображения: пользователю нужно выбрать одно — либо нужно выбрать единственную фотографию, либо единственную картину.
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
        ], answer: 0
      }
    ]
  },
  {
    gameType: 2,
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
        answer: `paint`
      },
      {
        img:
        [
          {
            src: `http://i.imgur.com/1KegWPz.jpg`,
            size: {width: 1080, height: 720}
          }
        ],
        answer: `photo`
      }
    ]
  },
  {
    gameType: 1,
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
        answer: `paint`
      }
    ]
  },
  {
    gameType: 3,
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
        ], answer: 0
      }
    ]
  },
  {
    gameType: 2,
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
        answer: `paint`
      },
      {
        img:
        [
          {
            src: `http://i.imgur.com/1KegWPz.jpg`,
            size: {width: 1080, height: 720}
          }
        ],
        answer: `photo`
      }
    ]
  },
  {
    gameType: 1,
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
        answer: `paint`
      }
    ]
  },
  {
    gameType: 3,
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
        ], answer: 0
      }
    ]
  },
  {
    gameType: 1,
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
        answer: `paint`
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
