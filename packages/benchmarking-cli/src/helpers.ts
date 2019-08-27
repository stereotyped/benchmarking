export function formatReadableOPS(ops: number, decimals = 2): string {
  return ops.toFixed(decimals).toString();
}

const TinyTimeUnits = ['ns', 'µs', 'ms'];
const TinyTimeUnitsLastIndex = TinyTimeUnits.length - 1;
const HexTimeUnits = ['s', 'm'];
const HexTimeUnitsLastIndex = HexTimeUnits.length - 1;

export function formatReadableTime(nanosecs: number, decimals = 2): string {
  if (nanosecs === 0) {
    return '0 ns';
  }

  // Determine if it's less than a second.
  const tinyTimeIndex = Math.floor(Math.log(nanosecs) / Math.log(1000));
  // If it is, then using units: `ns`, `µs` or `ms`.
  if (tinyTimeIndex <= TinyTimeUnitsLastIndex) {
    const value = parseFloat((nanosecs / Math.pow(1000, tinyTimeIndex)).toFixed(decimals));

    return `${value} ${TinyTimeUnits[tinyTimeIndex]}`;
  }

  // If it is more than a second, then using units: `s` or `m`.
  const secs = nanosecs / 1000000000;
  const hexTimeIndex = Math.min(
    Math.floor(Math.log(secs) / Math.log(60)),
    HexTimeUnitsLastIndex
  );
  const value = parseFloat((secs / Math.pow(60, hexTimeIndex)).toFixed(decimals));

  return `${value} ${HexTimeUnits[hexTimeIndex]}`;
}
