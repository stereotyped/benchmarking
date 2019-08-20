import {
  AsyncBenchmark,
  SyncBenchmark,
  Report,
  Mark,
  MarkSample,
  Progress,
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
  const durationInNanosec = BigInt(duration) * 1000000000n;
  const _watcher = watcher !== undefined ? watcher : StubProgressWatcher;

  const runStartAt = clock();
  let runEndAt: bigint;

  let samples: MarkSample[] = [];
  let sampleBuffers: bigint[] = [];

  let takeSample = false;
  let exit = false;
  let lastSampleTime = runStartAt;

  while (true) {
    const { startAt, endAt } = await execution();
    const elapsed = endAt - startAt;

    // Record raw elapsed time.
    sampleBuffers.push(elapsed);

    // Check if the test duration limit is reached.
    const totalElapsed = endAt - runStartAt;
    if (totalElapsed >= durationInNanosec) {
      // Take a sample before exiting.
      takeSample = true;
      exit = true;
    }

    // When execution meets one of these conditions, we should take a sample:
    // * exceed 100ms since last sample been taken
    // * buffer has more then 100,000 records
    const elapsedSinceLastSample = endAt - lastSampleTime;
    if (elapsedSinceLastSample >= 100000000n) {
      takeSample = true;
    }
    if (sampleBuffers.length >= 100000) {
      takeSample = true;
    }

    // Take a sample if necessary.
    if (takeSample === true) {
      takeSample = false;

      const bufferElapsedTotal = sampleBuffers.reduce((sum, point) => sum + point, 0n);
      samples.push({
        elapsedTotal: bufferElapsedTotal,
        cycle: sampleBuffers.length,
      });

      sampleBuffers = [];
      lastSampleTime = endAt;

      _watcher.notify({
        sampleTotal: samples.length,
        elapsed: totalElapsed,
        duration: durationInNanosec,
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
    cycles: samples.reduce((total, sample) => total + sample.cycle, 0),
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
