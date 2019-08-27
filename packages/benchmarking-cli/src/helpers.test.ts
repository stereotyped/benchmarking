import * as helpers from './helpers';

describe('formatReadableTime', () => {
  test('nanosecond', () => {
    expect(helpers.formatReadableTime(232, 3)).toBe('232 ns');
  });

  test('microsecond', () => {
    expect(helpers.formatReadableTime(123321, 3)).toBe('123.321 µs');
  });

  test('millisecond with round-up', () => {
    expect(helpers.formatReadableTime(501207100, 2)).toBe('501.21 ms');
  });

  test('second', () => {
    expect(helpers.formatReadableTime(1234567890, 3)).toBe('1.235 s');
  });

  test('minute', () => {
    expect(helpers.formatReadableTime(61234567890, 3)).toBe('1.021 m');
  });

  test('beyond minite', () => {
    expect(helpers.formatReadableTime(3700000000000, 3)).toBe(`61.667 m`);
  });
});
