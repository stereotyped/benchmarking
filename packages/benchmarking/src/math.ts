/**
 * Functions base on: https://stackoverflow.com/a/55297611
 */

export function sortASC(nums: number[]): number[] {
  return Array.from(nums).sort((a, b) => a - b);
}

export function sum(nums: number[]): number {
  return nums.reduce((acc, v) => acc + v, 0);
}

export function mean(nums: number[]): number {
  return sum(nums) / nums.length;
}

export function stdev(nums: number[]): number {
  const m = mean(nums);

  return stdevWithMean(nums, m);
}

export function stdevWithMean(nums: number[], _mean: number): number {
  const diffSqredArr = nums.map(num => (num - _mean) ** 2);

  return Math.sqrt(
    sum(diffSqredArr) / (nums.length - 1)
  );
}

export function quantile(nums: number[], q: number): number {
  const sorted = sortASC(nums);
  const pos = ((sorted.length) - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;

  if ((sorted[base + 1] !== undefined)) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
}

export function variance(nums: number[]): number {
  const _mean = mean(nums);

  return varianceWithMean(nums, _mean);
}

export function varianceWithMean(nums: number[], _mean: number): number {
  const sum = nums.reduce((sum, num) => sum + ((num - _mean) ** 2), 0);

  return sum / (nums.length - 1);
}

export function tTest(aNums: number[], bNums: number[]): number {
  const lSize = aNums.length;
  const cSize = bNums.length;

  const lMean = mean(aNums);
  const cMean = mean(bNums);
  const lastSd = stdevWithMean(aNums, lMean);
  const currentSd = stdevWithMean(bNums, cMean);

  const a = (lSize + cSize) / (lSize * cSize);
  const b = ((lSize - 1) * (lastSd ** 2) + (cSize - 1) * (currentSd ** 2)) / (lSize + cSize - 2);
  const t = Math.abs(lMean - cMean) / Math.sqrt(a * b);

  return t;
}

