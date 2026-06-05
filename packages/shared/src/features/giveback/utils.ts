import { GivebackSponsorTier } from './types';

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

// Up to two uppercase initials for a sponsor avatar fallback.
export const getSponsorInitials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');

export const sponsorTierLabel: Record<GivebackSponsorTier, string> = {
  [GivebackSponsorTier.Platinum]: 'Platinum',
  [GivebackSponsorTier.Gold]: 'Gold',
  [GivebackSponsorTier.Silver]: 'Silver',
  [GivebackSponsorTier.Backer]: 'Backer',
};

// Sponsor tier is purely a function of how much was contributed, so the badge
// can never drift from the amount.
export const getSponsorTier = (amount: number): GivebackSponsorTier => {
  if (amount >= 2500) {
    return GivebackSponsorTier.Platinum;
  }
  if (amount >= 1000) {
    return GivebackSponsorTier.Gold;
  }
  if (amount >= 250) {
    return GivebackSponsorTier.Silver;
  }
  return GivebackSponsorTier.Backer;
};
