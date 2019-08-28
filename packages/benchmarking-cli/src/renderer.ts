// The type definitions for `cli-tables` is really bad, we have to skip it. 
const Table = require('cli-table3');

import ProgressBar from 'progress';
import ora from 'ora';
import { Progress, ProgressListener, DetailedReport } from '@stereotyped/benchmarking';

import { formatReadableOPS, formatReadableTime } from './helpers';

export class Renderer {

  private oraInstance?: ora.Ora;
  private progressBar?: ProgressBar;
  private started: boolean;

  private durationLimitInNanosecs?: bigint;
  private cycleLimit?: number;
  private benchmarkHasLimit: boolean;

  constructor({ duration, cycles }: { duration?: number, cycles?: number }) {
    if (duration === undefined && cycles === undefined) {
      this.benchmarkHasLimit = false;
    } else {
      this.benchmarkHasLimit = true;
    }

    if (duration !== undefined) {
      this.durationLimitInNanosecs = BigInt(duration) * 1000000000n;
    }
    if (cycles !== undefined) {
      this.cycleLimit = cycles;
    }

    this.started = false;
  }

  progressListener(): ProgressListener {
    return {
      notify: progress => this.renderProgress(progress),
    };
  }

  private initializeRendering() {
    if (this.started === true) {
      return;
    }
    this.started = true;

    if (this.benchmarkHasLimit === false) {
      this.oraInstance = ora({
        text: 'Benchmarking...',
      });
      this.oraInstance.start();
      return;
    }

    this.progressBar = new ProgressBar(':bar :percent', {
      total: 100,
    });
  }

  private updateProgress(progress: Progress) {
    if (this.progressBar === undefined) {
      return;
    }

    let durationProgressRatio = 0;
    if (this.durationLimitInNanosecs !== undefined) {
      durationProgressRatio = parseInt(progress.elapsed.toString()) / parseInt(this.durationLimitInNanosecs.toString());
    }
    let cycleProgressRatio = 0;
    if (this.cycleLimit !== undefined) {
      cycleProgressRatio = progress.cycles / this.cycleLimit;
    }
    const ratio = Math.max(durationProgressRatio, cycleProgressRatio);

    this.progressBar.update(ratio);
  }

  private finishProgressing() {
    if (this.oraInstance !== undefined) {
      this.oraInstance.stop();
      return;
    }
    if (this.progressBar !== undefined) {
      this.progressBar.update(1);
    }
  }

  renderProgress(progress: Progress) {
    this.initializeRendering();
    this.updateProgress(progress);
  }

  async renderReport(report: DetailedReport): Promise<void> {
    this.finishProgressing();

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
    console.log(`Executed ${report.cycles} ops in ${formatReadableTime(report.duration)}.`);
  }

}
