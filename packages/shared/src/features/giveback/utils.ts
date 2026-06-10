import { ContributionSponsorTier } from './types';

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

// Finalized funding figures come back in cents. Keep the cents only when the
// amount isn't whole dollars, so "$12" stays clean but "$12.50" reads exactly.
export const formatDonationAmountCents = (
  amountCents: number,
  currency = GIVEBACK_CURRENCY,
): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: amountCents % 100 === 0 ? 0 : 2,
  }).format(amountCents / 100);

export const getGoalProgressPercentage = (
  raised: number,
  goal: number,
): number => {
  if (!goal) {
    return 0;
  }

  return Math.max(0, Math.min(100, (raised / goal) * 100));
};

export const sponsorTierLabel: Record<ContributionSponsorTier, string> = {
  [ContributionSponsorTier.Gold]: 'Gold',
  [ContributionSponsorTier.Silver]: 'Silver',
  [ContributionSponsorTier.Bronze]: 'Bronze',
};
