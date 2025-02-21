import type { PricePreviewResponse } from '@paddle/paddle-js/types/price-preview/price-preview';

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
  value.replace(/\D/g, '');

export const getPrice = (
  item: PricePreviewResponse['data']['details']['lineItems'][0],
): number => {
  const priceAmount = parseFloat(item.totals.total);
  const priceAmountFormatted = parseFloat(
    removeNonNumber(item.formattedTotals.total),
  );

  if (priceAmount === priceAmountFormatted) {
    return priceAmount;
  }

  const fixedAmount = priceAmount / 100;

  if (fixedAmount === priceAmountFormatted) {
    return fixedAmount;
  }

  return priceAmount;
};
