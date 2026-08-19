const GIVEBACK_CURRENCY = 'USD';

export const formatDonationAmount = (
  amount: number,
  currency = GIVEBACK_CURRENCY,
): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
