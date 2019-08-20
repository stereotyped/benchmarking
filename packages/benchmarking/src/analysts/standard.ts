import {
  max as mathMax,
  min as mathMin,
  std as mathStdev,
  bignumber,
  quantileSeq,
} from 'mathjs';

import { Analyst, Mark, Report, ReportRow } from '../types';

export class Standard implements Analyst {

  async analyse(mark: Mark): Promise<Report> {
    const durationTotalInMicrosecs = nanoToMicro(mark.endAt - mark.startAt);

    // Convert all samples from nano-seconds to micro-seconds.
    // micro-seconds is enough for now (year 2019).
    const durationsInMicrosecs = mark.samples
      .map(sample => sample.elapsedTotal / BigInt(sample.cycle))
      .map(nanoToMicro);

    const durationQuantile250Seq = <number>quantileSeq(durationsInMicrosecs, bignumber(0.25));
    const durationQuantile5000Seq = <number>quantileSeq(durationsInMicrosecs, bignumber(0.5));
    const durationQuantile9500Seq = <number>quantileSeq(durationsInMicrosecs, bignumber(0.95));
    const durationQuantile9900Seq = <number>quantileSeq(durationsInMicrosecs, bignumber(0.99));

    const durationAvg = filterThenAvg(durationsInMicrosecs, num => true);
    const durationStdev = mathStdev(durationsInMicrosecs);
    const durationMin = mathMin(durationsInMicrosecs);
    const durationMax = mathMax(durationsInMicrosecs);

    const durationQuantile250 = filterThenAvg(durationsInMicrosecs, (num: number) => num <= durationQuantile250Seq);
    const durationQuantile5000 = filterThenAvg(durationsInMicrosecs, (num: number) => num <= durationQuantile5000Seq);
    const durationQuantile9500 = filterThenAvg(durationsInMicrosecs, (num: number) => num <= durationQuantile9500Seq);
    const durationQuantile9900 = filterThenAvg(durationsInMicrosecs, (num: number) => num <= durationQuantile9900Seq);

    return {
      columns: [
        'Stat',
        '2.5%',
        '50%',
        '95%',
        '99%',
        'Avg',
        'Stdev',
        'Min',
        'Max',
      ],
      rows: [
        {
          name: 'Duration',
          values: ([
            durationQuantile250Seq,
            durationQuantile5000Seq,
            durationQuantile9500Seq,
            durationQuantile9900Seq,
            durationAvg,
            durationStdev,
            durationMin,
            durationMax,
          ]).map(formatReadableTime),
        },
        {
          name: 'Ops/Sec',
          values: ([
            (1000000 / durationQuantile250),
            (1000000 / durationQuantile5000),
            (1000000 / durationQuantile9500),
            (1000000 / durationQuantile9900),
            (1000000 / durationAvg),
            (1000000 / durationAvg) - (1000000 / (durationAvg + durationStdev)),
            (1000000 / durationMax),
            (1000000 / durationMin),
          ]).map(formatReadableOpsTotal),
        },
      ],
      summary: `${mark.cycles} tests in ${formatReadableTime(durationTotalInMicrosecs)}`,
    };
  }

}

export function formatReadableOpsTotal(ops: number): string {
  return ops.toFixed(2).toString();
}

export function formatReadableTime(microsecs: number): string {
  return `${(microsecs / 1000).toFixed(2)} ms`;
}

export function nanoToMicro(nano: bigint): number {
  return parseInt((nano / 1000n).toString());
}

export function filterThenAvg(nums: number[], filter: (num: number) => boolean): number {
  const filtered = nums.filter(filter);
  const sum = filtered.reduce((sum, num) => sum + num, 0);

  return sum / filtered.length;
}