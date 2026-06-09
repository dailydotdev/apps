// Frontend "Giveback" is the brand name for the backend "contribution"
// program. Shapes here mirror the daily-api GraphQL contract so the UI can bind
// directly to live queries. User-specific fields are null for anonymous
// visitors (see the public `contributionStatus` query).

export interface ContributionStatus {
  enabled: boolean;
  eligible: boolean | null;
  // Campaign points unlocked this cycle. Points map 1:1 to currency.
  currentCyclePoints: number;
  currentCycleTargetPoints: number;
  lifetimePoints: number;
  // Total amount donated to causes so far, in cents.
  lifetimeAmountCents: number;
  // Distinct developers who have contributed at least one approved action.
  contributorsCount: number;
  userPoints: number | null;
}

// Derived from the sponsored amount on the backend, so a pledge can never
// disagree with its badge.
export enum ContributionSponsorTier {
  Gold = 'gold',
  Silver = 'silver',
  Bronze = 'bronze',
}

export interface ContributionSponsor {
  id: string;
  name: string;
  amountCents: number;
  url: string | null;
  logoUrl: string | null;
  tier: ContributionSponsorTier;
}
