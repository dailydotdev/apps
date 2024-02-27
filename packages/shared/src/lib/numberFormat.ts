export function largeNumberFormat(value: number): string {
  let newValue = value;
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  let suffixNum = 0;
  while (newValue >= 1000) {
    newValue /= 1000;
    suffixNum += 1;
  }
  if (suffixNum > 0) {
    return newValue.toFixed(1) + suffixes[suffixNum];
  }
  return newValue.toString();
}

export const kFormatter = (num: number): string | number => {
  const kRemainder = num % 1000;

  return Math.abs(num) > 999
    ? `${(num / 1000).toFixed(kRemainder < 100 || kRemainder > 900 ? 0 : 1)}K`
    : num;
};
