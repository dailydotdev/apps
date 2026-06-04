export const formatDonationAmount = (
  amount: number,
  currency = 'USD',
): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

export const getGoalProgressPercentage = (
  approvedAmount: number,
  goalAmount: number,
): number => {
  if (!goalAmount) {
    return 0;
  }

  return Math.max(0, Math.min(100, (approvedAmount / goalAmount) * 100));
};

export const formatCompactNumber = (value: number): string =>
  new Intl.NumberFormat('en-US', { notation: 'compact' }).format(value);
