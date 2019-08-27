export interface AsyncOperation {
  (): Promise<any>
}

export interface SyncOperation {
  (): any
}

export type Operation = SyncOperation | AsyncOperation;

export interface Progress {
  cycles: number,
  /** In nanoseconds. */
  elapsedSinceLastSampling: bigint,
  /** In nanoseconds. */
  elapsed: bigint,
  // TODO:
  /** In nanoseconds. */
  // duration: number | undefined,
  buffers: number[],
  samples: Sample[],
}

export interface SamplerDecision {
  sample: boolean,
  end: boolean,
}

export interface Sampler {
  decide(progress: Progress): SamplerDecision
}

export interface ProgressListener {
  notify(progress: Progress): any
}

export interface Sample {
  cycles: number,
  elapsedTotal: number,
}

export interface Mark {
  startAt: bigint,
  endAt: bigint,
  cycles: number,
  samples: Sample[],
}

export interface Analyst<T> {
  analyse(mark: Mark): Promise<T>
}
