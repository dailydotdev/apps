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

// Two-letter fallback for a sponsor with no logo (individuals, fresh sponsors).
export const getSponsorInitials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');

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
