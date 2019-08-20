// The type definitions for `cli-tables` is really bad, we have to skip it. 
const Table = require('cli-table3');

import ProgressBar from 'progress';

import { Report, Renderer, Progress, ProgressWatcher } from '../types';

export class CLI implements Renderer {

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

    const elapsed = parseInt((progress.elapsed / 1000000n).toString());
    const duration = parseInt((progress.duration / 1000000n).toString());
    const ratio = elapsed / duration;

    this.progressBar.update(ratio);

    if (this.progressBar.complete) {
      console.log('\nDone.\n');
    }
  }

  async renderReport(report: Report): Promise<void> {
    const table = new Table({
      head: report.columns,
    });
    const tableRows = report.rows
      .map(row => [row.name, ...row.values]);
    table.push(...tableRows);

    console.log(table.toString());
    console.log('');
    console.log(report.summary);
  }

}
