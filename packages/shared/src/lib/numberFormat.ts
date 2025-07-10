import type { PaddleProductLineItem } from '../graphql/paddle';

export function largeNumberFormat(value: number): string | null {
  if (typeof value !== 'number') {
    return null;
  }
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
      newValue.toFixed(remainder >= 0 && remainder < 0.05 ? 0 : 1) +
      suffixes[suffixNum]
    );
  }
  return newValue.toString();
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

export const checkIsNumbersOnly = (value: string): boolean =>
  /^\d+$/.test(value);

export const formatDataTileValue = (value: number): string => {
  if (typeof value !== 'number') {
    return '0';
  }

  // For numbers less than 10,000, use locale formatting
  if (value < 10000) {
    return value.toLocaleString();
  }

  // For numbers 10,000 and above, use the existing largeNumberFormat logic
  return largeNumberFormat(value) || '0';
};
