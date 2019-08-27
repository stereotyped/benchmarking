import { Analyst, Mark } from '../types';
import { stdev, quantile } from './functions';

export interface StandardReport {
  opCount: number,
  duration: number,
  time: {
    '2.5%': number,
    '50%': number,
    '95%': number,
    '99%': number,
    'Avg': number,
    'Stdev': number,
    'Min': number,
    'Max': number,
  },
  ops: {
    '2.5%': number,
    '50%': number,
    '95%': number,
    '99%': number,
    'Avg': number,
    'Stdev': number,
    'Min': number,
    'Max': number,
  },
}

const OneSecondInNanoseconds = 1000000000;

export class Standard implements Analyst<StandardReport> {

  async analyse(mark: Mark): Promise<StandardReport> {
    const duration = Number(mark.endAt - mark.startAt);

    const timeSamples = mark.samples
      .map(sample => (sample.elapsedTotal / sample.opCount).toFixed(0))
      .map(time => parseInt(time));

    const quantile250ForTime: number = quantile(timeSamples, 0.25);
    const quantile5000ForTime: number = quantile(timeSamples, 0.5);
    const quantile9500ForTime: number = quantile(timeSamples, 0.95);
    const quantile9900ForTime: number = quantile(timeSamples, 0.99);

    const timeAvg: number = avgTimes(timeSamples, () => true);
    const timeStdev: number = stdev(timeSamples);
    const timeMin: number = Math.min(...timeSamples);
    const timeMax: number = Math.max(...timeSamples)

    const avgTimeInQuantile250: number = avgTimes(timeSamples, num => num <= quantile250ForTime);
    const avgTimeInQuantile5000: number = avgTimes(timeSamples, num => num <= quantile5000ForTime);
    const avgTimeInQuantile9500: number = avgTimes(timeSamples, num => num <= quantile9500ForTime);
    const avgTimeInQuantile9900: number = avgTimes(timeSamples, num => num <= quantile9900ForTime);

    return {
      opCount: mark.opCount,
      duration,
      time: {
        '2.5%': avgTimeInQuantile250,
        '50%': avgTimeInQuantile5000,
        '95%': avgTimeInQuantile9500,
        '99%': avgTimeInQuantile9900,
        'Avg': timeAvg,
        'Stdev': timeStdev,
        'Min': timeMin,
        'Max': timeMax,
      },
      ops: {
        '2.5%': (OneSecondInNanoseconds / avgTimeInQuantile250),
        '50%': (OneSecondInNanoseconds / avgTimeInQuantile5000),
        '95%': (OneSecondInNanoseconds / avgTimeInQuantile9500),
        '99%': (OneSecondInNanoseconds / avgTimeInQuantile9900),
        'Avg': (OneSecondInNanoseconds / timeAvg),
        'Stdev': (OneSecondInNanoseconds / timeAvg) - (OneSecondInNanoseconds / (timeAvg + timeStdev)),
        'Min': (OneSecondInNanoseconds / timeMax),
        'Max': (OneSecondInNanoseconds / timeMin),
      },
    };
  }

}

export function avgTimes(nums: number[], filter: (num: number) => boolean): number {
  const filtered = nums.filter(filter);
  const sum = filtered.reduce((sum, num) => sum + num, 0);

  return sum / filtered.length;
}