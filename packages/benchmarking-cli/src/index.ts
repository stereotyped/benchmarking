import {
  Operation,
  benchmark as coreBenchmark,
} from '@stereotyped/benchmarking';

import { Renderer } from './renderer';

export interface BenchmarkOptions {
  duration?: number,
  cycles?: number,
}

export async function benchmark(operation: Operation, options: BenchmarkOptions) {
  const renderer = new Renderer({
    duration: options.duration,
    cycles: options.cycles,
  });
  const progressListener = renderer.progressListener();

  const report = await coreBenchmark(operation, {
    ...options,
    progressListener,
  });
  await renderer.renderReport(report);

  return report;
}
