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
  const diffSqredArr = nums.map(num => (num - m) ** 2);

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
