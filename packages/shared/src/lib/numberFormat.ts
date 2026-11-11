import type { PaddleProductLineItem } from '../graphql/paddle';

export function largeNumberFormat(value: number): string | null {
  if (typeof value !== 'number') {
    return null;
  }
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  let suffixNum = 0;
  while (
    Math.abs(value) >= 1000 ** (suffixNum + 1) &&
    suffixNum < suffixes.length - 1
  ) {
    suffixNum += 1;
  }
  if (suffixNum === 0) {
    return value.toString();
  }
  const unit = 1000 ** suffixNum;
  const step = Math.abs(value) < 10 * unit ? unit / 10 : unit;
  return `${(Math.trunc(value / step) * step) / unit}${suffixes[suffixNum]}`;
}

export const getRandom4Digits = (leftPad?: string): string => {
  const random = Math.floor(1000 + Math.random() * 9000);

  if (!leftPad) {
    return random.toString();
  }

  return random.toString().padStart(4, leftPad);
};

export const removeNonNumber = (value: string): string =>
  value.replace(/,(\d{2})$/, '.$1').replace(/[^\d.]/g, '');

export const getPrice = (item: PaddleProductLineItem): number => {
  const priceAmount = parseFloat(item.totals.total);
  const priceAmountFormatted = parseFloat(
    removeNonNumber(item.formattedTotals.total),
  );

  if (priceAmount === priceAmountFormatted) {
    return priceAmount;
  }

  return priceAmount / 100;
};

export const formatDataTileValue = (value: number): string => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '0';
  }

  // For numbers less than 10,000, use locale formatting
  if (value < 10000) {
    return value.toLocaleString();
  }

  // For numbers 10,000 and above, use the existing largeNumberFormat logic
  return largeNumberFormat(value) || '0';
};
