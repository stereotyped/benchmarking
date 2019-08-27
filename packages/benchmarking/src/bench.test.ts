import * as bench from './bench';

describe('runAsync', () => {
  it('should works as expected', async () => {
    const benchmark = () => Promise.resolve();
    const clock = jest.fn().mockImplementation(() => 1n);
    const execution = bench.runAsync(benchmark, clock);

    const info = await execution();

    expect(info).toHaveProperty('startAt');
    expect(info).toHaveProperty('endAt');
    expect(clock).toBeCalledTimes(2);
  });
});

describe('runSync', () => {
  it('should works as expected', async () => {
    const benchmark = () => void 0;
    const clock = jest.fn().mockImplementation(() => 1n);
    const execution = bench.runSync(benchmark, clock);

    const info = await execution();

    expect(info).toHaveProperty('startAt');
    expect(info).toHaveProperty('endAt');
    expect(clock).toBeCalledTimes(2);
  });
});

// describe('run', () => {
//   it('should take a sample when exceed 100ms since last sample been taken', async () => {
//     const benchmark = jest.fn().mockImplementation(() => void 0);
//     let executionClockBeenCalled = 0;
//     const executionClock = jest.fn().mockImplementation(() => {
//       executionClockBeenCalled++;

//       switch (executionClockBeenCalled) {
//         case 1:
//           // first benchmarking start
//           return 0n;
//           break;
//         case 2:
//           // first benchmarking end
//           return 100000000n;
//           break;
//         case 3:
//           // second benchmarking start, etc. ...
//           return 0n;
//           break;
//         case 4:
//           // make benchmarking stop
//           return 1000000000n;
//           break;
//       }
//     });
//     const execution = bench.runSync(benchmark, executionClock);
//     const benchClock = jest.fn().mockImplementation(() => 0n);

//     const mark = await bench.run(execution, 1, benchClock);

//     expect(executionClock).toBeCalledTimes(4);
//     expect(benchClock).toBeCalledTimes(1);

//     expect(mark.cycles).toBe(2);
//     expect(mark.startAt).toBe(0n);
//     expect(mark.endAt).toBe(1000000000n);

//     expect(mark.samples).toEqual([
//       { opCount: 2, elapsedTotal: 1000000000n },
//     ]);
//   });
// });
