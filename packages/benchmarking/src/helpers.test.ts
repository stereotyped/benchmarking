import * as helpers from './helpers';

describe('isAsyncOperation', () => {
  test('sync', async () => {
    const benchmark = () => void 0;

    expect(await helpers.isAsyncOperation(benchmark)).toBeFalsy();
  });

  test('async', async () => {
    const benchmark = () => Promise.resolve();

    expect(await helpers.isAsyncOperation(benchmark)).toBeTruthy();
  });
});
