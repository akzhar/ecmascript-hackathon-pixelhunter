import {assert} from 'chai';
import getScore from '../score.js';

// В блоке describe (набор тестов) указывается что будет тестировать этот блок тестов
//   – Отвечает на вопрос «О чём эти тесты?»
// В блоке it (тестовый случай) описывается, то что проверяет этот набор тестов
//   – Отвечает на вопрос «Что делают эти проверки?»

const notAllAnswers =
[{
  isRight: true,
  time: 30
},{
  isRight: false,
  time: 5
}];

const allAnswersNotFastNotSlow =
[{
  isRight: true,
  time: 11
},{
  isRight: true,
  time: 12
},{
  isRight: true,
  time: 11
},{
  isRight: true,
  time: 15
},{
  isRight: true,
  time: 19
},{
  isRight: true,
  time: 18
},{
  isRight: true,
  time: 17
},{
  isRight: true,
  time: 16
},{
  isRight: true,
  time: 18
},{
  isRight: true,
  time: 13
}];

// Тестируемые функции
// • Управление жизнями игрока
// • Переключение уровней
// • Отсчёт времени

describe(`Scoring at the end of the game`, () => {
  it(`should return -1 when not all answers (< 10) are given`, () => {
    assert.equal(-1, getScore(notAllAnswers, 2));
  });
  it(`should return 1150 when all answers are given (10) right, not fast but not slow (10 > time < 20) and all lives (4) are remain`, () => {
    assert.equal(1150, getScore(allAnswersNotFastNotSlow, 3));
  });
});
