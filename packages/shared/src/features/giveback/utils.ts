import { ContributionSponsorTier } from './types';

export const GIVEBACK_CURRENCY = 'USD';

export const formatDonationAmount = (
  amount: number,
  currency = GIVEBACK_CURRENCY,
): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

export const getGoalProgressPercentage = (
  raised: number,
  goal: number,
): number => {
  if (!goal) {
    return 0;
  }

  return Math.max(0, Math.min(100, (raised / goal) * 100));
};

// Up to two uppercase initials for a sponsor avatar fallback.
export const getSponsorInitials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');

export const sponsorTierLabel: Record<ContributionSponsorTier, string> = {
  [ContributionSponsorTier.Gold]: 'Gold',
  [ContributionSponsorTier.Silver]: 'Silver',
  [ContributionSponsorTier.Bronze]: 'Bronze',
};
