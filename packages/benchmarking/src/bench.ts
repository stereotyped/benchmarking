import {
  AsyncOperation,
  SyncOperation,
  Mark,
  Sample,
  ProgressListener,
  Sampler,
  Progress,
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

export const StubProgressWatcher: ProgressListener = {
  notify: () => void 0,
};

export const NodeClock: Clock = () => process.hrtime.bigint();

/**
 * 
 * @param execution 
 * @param sampler {Sampler}
 * @param clock {Clock}
 * @param listener
 */
export async function run(
  execution: Execution,
  sampler: Sampler,
  clock: Clock,
  listener?: ProgressListener,
): Promise<Mark> {
  const _watcher = listener !== undefined ? listener : StubProgressWatcher;

  const runStartAt = clock();
  let runEndAt: bigint;
  let cycles = 0;

  let samples: Sample[] = [];
  let buffers: number[] = [];

  let lastSamplingTime = runStartAt;

  while (true) {
    const { startAt, endAt } = await execution();
    cycles ++;
    const elapsed = Number(endAt - startAt);

    // Record raw elapsed time.
    buffers.push(elapsed);

    const progress: Progress = {
      cycles,
      elapsedSinceLastSampling: endAt - lastSamplingTime,
      elapsed: endAt - runStartAt,
      buffers,
      samples,
    };

    const { sample, end } = sampler.decide(progress);

    // Take a sample if necessary.
    if (sample === true) {
      const bufferElapsedTotal = buffers.reduce((sum, point) => sum + point, 0);
      samples.push({
        elapsedTotal: bufferElapsedTotal,
        cycles: buffers.length,
      });

      buffers = [];
      lastSamplingTime = endAt;

      _watcher.notify(progress);
    }

    if (end === true) {
      runEndAt = endAt;
      break;
    }
  }

  return {
    startAt: runStartAt,
    endAt: runEndAt,
    cycles,
    samples,
  };
}

export function runAsync(benchmark: AsyncOperation, clock: Clock): Execution {
  return async () => {
    const startAt = clock();
    await benchmark();
    const endAt = clock();

    return { startAt, endAt };
  };
}

export function runSync(benchmark: SyncOperation, clock: Clock): Execution {
  return async () => {
    const startAt = clock();
    benchmark();
    const endAt = clock();

    return { startAt, endAt };
  };
}
