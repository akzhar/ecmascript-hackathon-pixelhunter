import {assert} from 'chai';
import {getTotalScore, getRightAnswersCount, getSpeedBonusCount, getSlowPenaltyCount} from '../score.js';

// В блоке describe (набор тестов) указывается что будет тестировать этот блок тестов
//   – Отвечает на вопрос «О чём эти тесты?»
// В блоке it (тестовый случай) описывается, то что проверяет этот набор тестов
//   – Отвечает на вопрос «Что делают эти проверки?»

const notAllAnswers =
[{
  isOK: true,
  time: 30
},{
  isOK: false,
  time: 5
}];

const allAnswersNotFastNotSlow =
[{
  isOK: true,
  time: 11
},{
  isOK: true,
  time: 12
},{
  isOK: true,
  time: 11
},{
  isOK: true,
  time: 15
},{
  isOK: true,
  time: 19
},{
  isOK: true,
  time: 18
},{
  isOK: true,
  time: 17
},{
  isOK: true,
  time: 16
},{
  isOK: true,
  time: 18
},{
  isOK: true,
  time: 13
}];

// Тестируемые функции
// • Управление жизнями игрока
// • Переключение уровней
// • Отсчёт времени

describe(`Scoring at the end of the game`, () => {
  it(`should return -1 when not all answers (< 10) are given`, () => {
    assert.equal(-1, getTotalScore(notAllAnswers, 2));
  });
  it(`should return 1150 when all answers are given (10) right, not fast but not slow (10 > time < 20) and all lives (4) are remain`, () => {
    assert.equal(1150, getTotalScore(allAnswersNotFastNotSlow, 3));
  });
});
