import { run, runAsync, runSync, NodeClock } from './bench';
import { DetailedAnalyst } from './analysts';
import { Operation, ProgressListener, Sampler } from './types';
import { isAsyncOperation } from './helpers';
import { Adaptableampler, PeriodicSampler } from './samplers';

export interface BenchmarkOptions {
  /** Total test duration in seconds */
  duration?: number,
  cycles?: number,
  async?: boolean,
  progressListener?: ProgressListener,
}

export async function benchmark(operation: Operation, options: BenchmarkOptions) {
  let async = options.async;
  if (async === undefined) {
    async = await isAsyncOperation(operation);
  }

  const sampler = createSampler(options);
  const execution = async ? runAsync(operation, NodeClock) : runSync(operation, NodeClock);
  const mark = await run(execution, sampler, NodeClock, options.progressListener);

  const analyst = new DetailedAnalyst();

  return await analyst.analyse(mark);
}

export function createSampler(options: BenchmarkOptions): Sampler {
  if (options.duration === undefined && options.cycles === undefined) {
    return new Adaptableampler();
  }

  return new PeriodicSampler({
    duration: options.duration,
    cycles: options.cycles,
  });
}

export {
  isAsyncOperation as isAsyncBenchmark,
} from './helpers';

export {
  DetailedAnalyst,
  DetailedReport,
} from './analysts';

export {
  AsyncOperation,
  SyncOperation,
  Operation,
  Progress,
  ProgressListener,
} from './types';
