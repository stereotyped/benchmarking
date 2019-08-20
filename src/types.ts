export interface AsyncBenchmark {
  (): Promise<any>
}

export interface SyncBenchmark {
  (): any
}

export type Benchmark = SyncBenchmark | AsyncBenchmark;

export interface Progress {
  sampleTotal: number,
  elapsed: bigint,
  duration: bigint,
}

export interface ProgressWatcher {
  notify(progress: Progress): any
}

export interface MarkSample {
  cycle: number,
  elapsedTotal: bigint,
}

export interface Mark {
  startAt: bigint,
  endAt: bigint,
  cycles: number,
  samples: MarkSample[],
}

export interface ReportRow {
  name: string,
  values: string[],
}

export interface Report {
  columns: string[],
  rows: ReportRow[],
  summary: string,
}

export interface Analyst {
  analyse(mark: Mark): Promise<Report>
}

export interface Renderer {
  progressWatcher(): ProgressWatcher
  renderReport(report: Report): Promise<void>
}
