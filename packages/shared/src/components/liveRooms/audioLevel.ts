const MIN_DECIBELS = -60;
const MAX_DECIBELS = -20;

export const computeRms = (data: Float32Array): number => {
  let sumSquares = 0;
  for (let i = 0; i < data.length; i += 1) {
    sumSquares += data[i] * data[i];
  }
  return Math.sqrt(sumSquares / data.length);
};

export const rmsToLevel = (rms: number): number => {
  if (rms <= 0) {
    return 0;
  }
  const decibels = 20 * Math.log10(rms);
  const normalized = (decibels - MIN_DECIBELS) / (MAX_DECIBELS - MIN_DECIBELS);
  return Math.min(1, Math.max(0, normalized));
};
