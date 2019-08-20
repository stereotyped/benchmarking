import {
  AsyncBenchmark,
  SyncBenchmark,
  Mark,
  MarkSample,
  ProgressWatcher,
} from './types';

export interface ExecutionInfo {
  startAt: bigint,
  endAt: bigint,
}

export interface Execution {
  (): Promise<ExecutionInfo>
}

export interface Clock {
  (): bigint
}

export const StubProgressWatcher: ProgressWatcher = {
  notify: () => void 0,
};

export const NodeClock: Clock = () => process.hrtime.bigint();

/**
 * 
 * @param execution 
 * @param duration {number} Test duration, in seconds
 * @param clock {Clock}
 * @param watcher 
 */
export async function run(
  execution: Execution,
  duration: number,
  clock: Clock,
  watcher?: ProgressWatcher,
): Promise<Mark> {
  const durationLimit = duration * 1000000000;
  const _watcher = watcher !== undefined ? watcher : StubProgressWatcher;

  const runStartAt = clock();
  let runEndAt: bigint;

  let samples: MarkSample[] = [];
  let sampleBuffers: number[] = [];

  let takeSample = false;
  let exit = false;
  let lastSampleTime = runStartAt;

  while (true) {
    const { startAt, endAt } = await execution();
    const elapsed = Number(endAt - startAt);

    // Record raw elapsed time.
    sampleBuffers.push(elapsed);

    // Check if the test duration limit is reached.
    const elapsedTotal = Number(endAt - runStartAt);
    if (elapsedTotal >= durationLimit) {
      // Take a sample before exiting.
      takeSample = true;
      exit = true;
    }

    // When execution meets one of these conditions, we should take a sample:
    // * exceed 100ms since last sample been taken
    // * buffer has more then 10,000,000 records (100ns/op)
    const elapsedSinceLastSample = endAt - lastSampleTime;
    if (elapsedSinceLastSample >= 1000000000n) {
      takeSample = true;
    }
    if (sampleBuffers.length >= 100000) {
      takeSample = true;
    }

    // Take a sample if necessary.
    if (takeSample === true) {
      takeSample = false;

      const bufferElapsedTotal = sampleBuffers.reduce((sum, point) => sum + point, 0);
      samples.push({
        elapsedTotal: bufferElapsedTotal,
        opCount: sampleBuffers.length,
      });

      sampleBuffers = [];
      lastSampleTime = endAt;

      _watcher.notify({
        sampleCount: samples.length,
        sinceLastSample: elapsedTotal,
        duration: durationLimit,
      });
    }

    if (exit) {
      runEndAt = endAt;
      break;
    }
  }

  return {
    startAt: runStartAt,
    endAt: runEndAt,
    opCount: samples.reduce((total, sample) => total + sample.opCount, 0),
    samples,
  };
}

export function runAsync(benchmark: AsyncBenchmark, clock: Clock): Execution {
  return async () => {
    const startAt = clock();
    await benchmark();
    const endAt = clock();

    return { startAt, endAt };
  };
}

export function runSync(benchmark: SyncBenchmark, clock: Clock): Execution {
  return async () => {
    const startAt = clock();
    benchmark();
    const endAt = clock();

    return { startAt, endAt };
  };
}
