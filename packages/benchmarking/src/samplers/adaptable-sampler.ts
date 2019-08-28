import { Sampler, Sample, Progress } from '../types';
import { tTest } from '../math';

interface Table {
  [df: string]: number,
}

/**
* T-Distribution two-tailed critical values for 97.5% confidence.
* For more info see http://www.itl.nist.gov/div898/handbook/eda/section3/eda3672.htm.
*/
const TDTable: Table = {
  '1': 12.706, '2': 4.303, '3': 3.182, '4': 2.776, '5': 2.571, '6': 2.447,
  '7': 2.365, '8': 2.306, '9': 2.262, '10': 2.228, '11': 2.201, '12': 2.179,
  '13': 2.16, '14': 2.145, '15': 2.131, '16': 2.12, '17': 2.11, '18': 2.101,
  '19': 2.093, '20': 2.086, '21': 2.08, '22': 2.074, '23': 2.069, '24': 2.064,
  '25': 2.06, '26': 2.056, '27': 2.052, '28': 2.048, '29': 2.045, '30': 2.042,
  'infinity': 1.96
};

export class Adaptableampler implements Sampler {

  private round: number;
  private needNewBatch: boolean;
  private batchSize: number;
  private lastBatchOffset: number;
  private lastBatchSamples: Sample[];

  constructor() {
    this.round = 1;
    this.needNewBatch = true;
    this.batchSize = 5;
    this.lastBatchOffset = 0;
    this.lastBatchSamples = [];
  }

  decide(progress: Progress) {
    // `+ 1` because current buffer has not been added to samples.
    const currentSampleSize = progress.samples.length + 1 - this.lastBatchOffset;

    if (currentSampleSize < this.batchSize) {
      return { sample: true, end: false };
    }

    if (this.needNewBatch === true) {
      this.lastBatchSamples = progress.samples
        .slice(this.lastBatchOffset)
        .concat({ cycles: 1, elapsedTotal: progress.elapsed });
      this.needNewBatch = false;
      this.lastBatchOffset = currentSampleSize;

      return { sample: true, end: false };
    }

    // Compare two batches.
    const lTimes = this.lastBatchSamples
      .map(sample => sample.elapsedTotal);
    const cTimes = progress.samples
      .slice(this.lastBatchOffset)
      .map(sample => sample.elapsedTotal / sample.cycles)
      .concat(progress.buffers);

    const t = tTest(lTimes, cTimes);
    // Compute the degrees of freedom.
    const df = lTimes.length + cTimes.length - 2;
    // Compute the critical value.
    const index: string = (Math.round(df) || 1).toString();
    // T-Value.
    const tv = TDTable[index] !== undefined ? TDTable[index] : TDTable.infinity;

    // If the t-value is acceptable, then stop sampling.
    if (t <= tv || this.round >= 3) {
      return { sample: true, end: true };
    }

    // If it's not, we start a new batch.
    this.needNewBatch = true;
    this.batchSize = this.batchSize * 2;
    this.round++;

    return { sample: true, end: false };
  }

}


