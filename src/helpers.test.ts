import * as helpers from './helpers';

describe('isAsyncBenchmark', () => {
  test('sync', async () => {
    const benchmark = () => void 0;

    expect(await helpers.isAsyncBenchmark(benchmark)).toBeFalsy();
  });

  test('async', async () => {
    const benchmark = () => Promise.resolve();

    expect(await helpers.isAsyncBenchmark(benchmark)).toBeTruthy();
  });
});

