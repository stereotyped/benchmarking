// The type definitions for `cli-tables` is really bad, we have to skip it. 
const Table = require('cli-table3');

import ProgressBar from 'progress';
import { Progress, ProgressWatcher, StandardReport } from '@stereotyped/benchmarking';

import { formatReadableOPS, formatReadableTime } from './helpers';

export class CLI {

  private progressBar?: ProgressBar;

  progressWatcher(): ProgressWatcher {
    return {
      notify: this.renderProgress,
    };
  }

  renderProgress(progress: Progress) {
    if (this.progressBar === undefined) {
      this.progressBar = new ProgressBar(':bar :percent', {
        total: 100,
      });
    }

    const elapsed = parseInt((progress.sinceLastSample / 1000000).toString());
    const duration = parseInt((progress.duration / 1000000).toString());
    const ratio = elapsed / duration;

    this.progressBar.update(ratio);

    if (this.progressBar.complete) {
      console.log('\nDone.\n');
    }
  }

  async renderReport(report: StandardReport): Promise<void> {
    const table = new Table({
      head: [
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
    });
    const tableRows: Array<string[]> = [];

    tableRows.push([
      'Time/Op',
      ...Object.values(report.time).map(time => formatReadableTime(time)),
    ]);
    tableRows.push([
      'Ops/sec',
      ...Object.values(report.ops).map(ops => formatReadableOPS(ops)),
    ]);
    table.push(...tableRows);

    console.log(table.toString());
    console.log('');
    console.log(`Executed ${report.opCount} ops in ${report.duration}.`);
  }

}
