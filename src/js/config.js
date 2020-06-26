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

export default config;
