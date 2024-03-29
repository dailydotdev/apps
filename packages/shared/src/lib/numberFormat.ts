export function largeNumberFormat(value: number): string {
  let newValue = value;
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  let suffixNum = 0;
  while (newValue >= 1000) {
    newValue /= 1000;
    suffixNum += 1;
  }
  if (suffixNum > 0) {
    const remainder = newValue % 1;
    return (
      newValue.toFixed(remainder >= 0 && remainder < 0.1 ? 0 : 1) +
      suffixes[suffixNum]
    );
  }
  return newValue.toString();
}
