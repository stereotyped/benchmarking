import { run, runAsync, runSync, NodeClock } from './bench';
import { CLI } from './renderers/cli';
import { Standard } from './analysts/standard';
import { Benchmark, Renderer } from './types';
import { isAsyncBenchmark } from './helpers';

// TODO: More renders to come later.
type Render = 'cli';

export interface BenchmarkingOptions {
  /** Total test duration in seconds */
  duration: number,
  async?: boolean,
  render?: Render,
}

export async function benchmarking(benchmark: Benchmark, options: BenchmarkingOptions) {
  let async = options.async;
  if (async === undefined) {
    async = await isAsyncBenchmark(benchmark);
  }

  const renderer: Renderer = new CLI();
  const progressWatcher = renderer.progressWatcher();

  const execution = async ? runAsync(benchmark, NodeClock) : runSync(benchmark, NodeClock);
  const mark = await run(execution, options.duration, NodeClock, progressWatcher);

  const analyst = new Standard();
  const report = await analyst.analyse(mark);

  await renderer.renderReport(report);
}
