import * as math from './math';

describe('mean', () => {
  it('should works', () => {
    const m = math.mean([1, 2, 3, 4]);
    expect(m).toBe(2.5);
  });
});

describe('stdev', () => {
  it('should works', () => {
    const m = math.stdev([1345, 1301, 1368, 1322, 1310, 1370, 1318, 1350, 1303, 1299]);
    expect(m).toBe(27.46391571984349);
  });
});

describe('quantile', () => {
  test('median', () => {
    const m = math.quantile([1345, 1301, 1368, 1322, 1310, 1370, 1318, 1350, 1303, 1299], 0.5);
    expect(m).toBe(1320);
  });
});

describe('variance', () => {
  it('should works', () => {
    const v = math.variance([17, 15, 23, 7, 9, 13]);
    expect(v).toBe(33.2);
  });
});

describe('student\'s t-test', () => {
  it('should works - small', () => {
    const aNums: number[] = [150, 100, 210, 300, 200, 210, 300];
    const bNums: number[] = [120, 125, 160, 130, 200, 170, 200];

    expect(math.tTest(aNums, bNums)).toBe(1.7113031128409284);
  });

  it('should works - big', () => {
    const aNums: number[] = [150, 350, 210, 300, 200, 210, 300];
    const bNums: number[] = [120, 80, 160, 130, 200, 170, 200];

    expect(math.tTest(aNums, bNums)).toBe(2.9724905041328977);
  });
});

