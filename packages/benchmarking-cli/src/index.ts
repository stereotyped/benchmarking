import {
  Benchmark,
  benchmarking as coreBenchmarking,
} from '@stereotyped/benchmarking';

import { CLI } from './renderer';

export interface BenchmarkingOptions {
  /** Total test duration in seconds */
  duration: number,
}

export async function benchmarking(benchmark: Benchmark, options: BenchmarkingOptions) {
  const renderer = new CLI();
  const progressWatcher = renderer.progressWatcher();

  const report = await coreBenchmarking(benchmark, {
    ...options,
    progressWatcher,
  });
  await renderer.renderReport(report);

  return report;
}
