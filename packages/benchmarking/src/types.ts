export interface AsyncBenchmark {
  (): Promise<any>
}

export interface SyncBenchmark {
  (): any
}

export type Benchmark = SyncBenchmark | AsyncBenchmark;

export interface Progress {
  sampleCount: number,
  sinceLastSample: number,
  duration: number,
}

export interface ProgressWatcher {
  notify(progress: Progress): any
}

export interface MarkSample {
  opCount: number,
  elapsedTotal: number,
}

export interface Mark {
  startAt: bigint,
  endAt: bigint,
  opCount: number,
  samples: MarkSample[],
}

export interface Analyst<T> {
  analyse(mark: Mark): Promise<T>
}
