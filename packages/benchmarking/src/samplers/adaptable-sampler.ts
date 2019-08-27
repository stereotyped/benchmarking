import { Sampler, Progress } from '../types';
import { mean, varianceWithMean, stdev } from '../math';

interface Table {
  [df: string]: number,
}

/**
* T-Distribution two-tailed critical values for 95% confidence.
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

  decide(progress: Progress) {
    const samples = progress.samples
      .map(sample => sample.elapsedTotal / sample.cycles)
      .concat(progress.buffers);

    // Compute the mean.
    const m = mean(samples);
    const v = varianceWithMean(samples, m);
    const sd = Math.sqrt(v);
    // Compute the sample standard error of the mean (a.k.a. the standard deviation of the sampling distribution of the sample mean).
    const sem = sd / Math.sqrt(samples.length);
    // Compute the degrees of freedom.
    const df = samples.length - 1;
    // Compute the critical value.
    const index: string = (Math.round(df) || 1).toString();
    // T-Value.
    const tv = TDTable[index] !== undefined ? TDTable[index] : TDTable.infinity;
    // Compute the margin of error.
    const moe = sem * tv;
    // Compute the relative margin of error.
    const rmoe = (moe / m) * 100 || 0;

    const minSampleSize = Math.ceil((tv * tv * sd * sd) / (moe * moe));

    if (samples.length >= minSampleSize) {
      return { sample: true, end: true };
    }

    return { sample: true, end: false };
  }

}
