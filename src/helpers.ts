import { Benchmark } from './types';

export async function isAsyncBenchmark(benchmark: Benchmark): Promise<boolean> {
  const result = benchmark();
  if (result instanceof Promise ) {
    await result;

    return true;
  }

  return false;
}