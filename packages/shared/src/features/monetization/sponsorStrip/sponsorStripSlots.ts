import type {
  ResolvedSponsor,
  SponsorStripCreative,
} from './sponsorStripCreative';
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

/** One mark on the row and the position it holds. */
export interface SponsorSlot {
  sponsor: ResolvedSponsor;
  slotIndex: number;
}

export const GOLD_SLOT_INDEX = 0;

export const premiumSlotIndex = (index: number): number => index + 1;

// Offset by the full premium row rather than by how many premium creatives
// happened to fill it, so a slot index means the same position from one
// session to the next.
export const communitySlotIndex = (index: number): number =>
  index + 1 + PREMIUM_SLOT_COUNT;

/** Every mark the row shows, gold first, in slot order. */
export const toSponsorSlots = (
  gold: ResolvedSponsor | null,
  premium: ResolvedSponsor[],
  community: ResolvedSponsor[],
): SponsorSlot[] => [
  ...(gold ? [{ sponsor: gold, slotIndex: GOLD_SLOT_INDEX }] : []),
  ...premium.map((sponsor, index) => ({
    sponsor,
    slotIndex: premiumSlotIndex(index),
  })),
  ...community.map((sponsor, index) => ({
    sponsor,
    slotIndex: communitySlotIndex(index),
  })),
];
