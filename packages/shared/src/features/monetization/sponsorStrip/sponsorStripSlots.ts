import type { SponsorStripCreative } from './sponsorStripCreative';
import { SponsorTier } from './sponsorStripCreative';

/**
 * Premium is deliberately the scarcer tier: one gold, four premium, and
 * community takes whatever the row has left, which is always more.
 */
export const PREMIUM_SLOT_COUNT = 4;

interface SponsorPools {
  gold: SponsorStripCreative | null;
  premium: SponsorStripCreative[];
  community: SponsorStripCreative[];
}

export const partitionByTier = (
  sponsors: SponsorStripCreative[],
): SponsorPools => ({
  // A second gold creative is dropped rather than demoted. The tier is sold as
  // the one slot that never shares, so two of them is not a degraded version
  // of what was sold, it is a different thing.
  gold: sponsors.find(({ tier }) => tier === SponsorTier.Gold) ?? null,
  premium: sponsors.filter(({ tier }) => tier === SponsorTier.Premium),
  community: sponsors.filter(({ tier }) => tier === SponsorTier.Community),
});
