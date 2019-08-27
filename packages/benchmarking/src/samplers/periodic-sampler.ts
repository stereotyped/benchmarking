import { Sampler, Progress } from '../types';

export class PeriodicSampler implements Sampler {

  private durationInNanosecs?: bigint;
  private cycles?: number;

  constructor(options: { duration?: number, cycles?: number }) {
    const { duration, cycles } = options;

    if (duration === undefined && cycles === undefined) {
      throw new Error('Should specify `duration` or `cycles`, otherwise PeriodicSampler doesn\'t know when to stop benchmark.');
    }

    this.durationInNanosecs = BigInt(duration) * 1000000000n;
    this.cycles = cycles;
  }

  private exceededDuration(elapsed: bigint): boolean {
    if (this.durationInNanosecs === undefined) {
      return false;
    }

    return elapsed >= this.durationInNanosecs;
  }

  private exceededCycles(cycles: number): boolean {
    if (this.cycles === undefined) {
      return false;
    }

    return cycles >= this.cycles;
  }

  decide(progress: Progress) {
    if (this.exceededDuration(progress.elapsed) || this.exceededCycles(progress.cycles)) {
      return { sample: true, end: true };
    }

    if (progress.elapsedSinceLastSampling >= 1000000000n) {
      return { sample: true, end: false };
    }

    if (progress.buffers.length >= 100000) {
      return { sample: true, end: false };
    }

    return { sample: false, end: false };
  }

}
