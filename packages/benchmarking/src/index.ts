import { run, runAsync, runSync, NodeClock } from './bench';
import { Standard } from './analysts/standard';
import { Benchmark, ProgressWatcher } from './types';
import { isAsyncBenchmark } from './helpers';

export interface BenchmarkingOptions {
  /** Total test duration in seconds */
  duration: number,
  async?: boolean,
  progressWatcher?: ProgressWatcher,
}

export async function benchmarking(benchmark: Benchmark, options: BenchmarkingOptions) {
  let async = options.async;
  if (async === undefined) {
    async = await isAsyncBenchmark(benchmark);
  }

  const execution = async ? runAsync(benchmark, NodeClock) : runSync(benchmark, NodeClock);
  const mark = await run(execution, options.duration, NodeClock, options.progressWatcher);

  const analyst = new Standard();

  return await analyst.analyse(mark);
}

export {
  isAsyncBenchmark,
} from './helpers';

export {
  StandardReport,
} from './analysts/standard';

export {
  AsyncBenchmark,
  SyncBenchmark,
  Benchmark,
  Progress,
  ProgressWatcher,
} from './types';
