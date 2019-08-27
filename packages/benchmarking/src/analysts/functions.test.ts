import * as functions from './functions';

describe('mean', () => {
  it('should works', () => {
    const m = functions.mean([1, 2, 3, 4]);
    expect(m).toBe(2.5);
  });
});

describe('stdev', () => {
  it('should works', () => {
    const m = functions.stdev([1345, 1301, 1368, 1322, 1310, 1370, 1318, 1350, 1303, 1299]);
    expect(m).toBe(27.46391571984349);
  });
});

describe('quantile', () => {
  it('median', () => {
    const m = functions.quantile([1345, 1301, 1368, 1322, 1310, 1370, 1318, 1350, 1303, 1299], 0.5);
    expect(m).toBe(1320);
  });
});
