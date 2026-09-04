import { shuffleArray } from '../../../lib/func';
import type { SponsorStripCreative } from './sponsorStripCreative';
import { SponsorTier } from './sponsorStripCreative';

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
  // the one static slot, so two of them is not a degraded version of what was
  // sold, it is a different thing.
  gold: sponsors.find(({ tier }) => tier === SponsorTier.Gold) ?? null,
  premium: sponsors.filter(({ tier }) => tier === SponsorTier.Premium),
  community: sponsors.filter(({ tier }) => tier === SponsorTier.Community),
});

export interface Rotation {
  deck: SponsorStripCreative[];
  /**
   * One absolute draw position per slot; the creative on screen is
   * `deck[cursor % deck.length]`. Absolute rather than wrapped so a slot's
   * next draw is always "further down the deck than anything showing".
   */
  cursors: number[];
  next: number;
}

type Shuffle = <T>(items: T[]) => T[];

export const createRotation = (
  pool: SponsorStripCreative[],
  slotCount: number,
  shuffle: Shuffle = shuffleArray,
): Rotation => {
  // Shuffled once per mount so no advertiser is permanently first, and — once
  // the row starts trimming to fit — none is permanently the one dropped.
  const deck = shuffle(pool);
  const count = Math.max(0, Math.min(slotCount, deck.length));

  return {
    deck,
    cursors: Array.from({ length: count }, (_, index) => index),
    next: count,
  };
};

export const rotationSponsors = ({
  deck,
  cursors,
}: Rotation): SponsorStripCreative[] =>
  cursors.map((cursor) => deck[cursor % deck.length]);

/** A deck no larger than the row it fills has nothing to rotate to. */
export const canRotate = ({ deck, cursors }: Rotation): boolean =>
  deck.length > cursors.length;

export const rotateSlot = (rotation: Rotation, slot: number): Rotation => {
  if (!canRotate(rotation) || slot < 0 || slot >= rotation.cursors.length) {
    return rotation;
  }

  const { deck, cursors, next } = rotation;
  const shown = new Set(
    cursors
      .filter((_, index) => index !== slot)
      .map((cursor) => cursor % deck.length),
  );

  // Skip past anything already on screen, so the same logo can never appear
  // twice in the row. Terminates because the deck is larger than the row.
  let position = next;
  while (shown.has(position % deck.length)) {
    position += 1;
  }

  const updated = [...cursors];
  updated[slot] = position;

  return { deck, cursors: updated, next: position + 1 };
};

/**
 * Rotates the slot whose logo has been up longest, which is the lowest draw
 * position. Deriving the turn from the state rather than from a counter beside
 * it keeps each slot's turn evenly spaced and makes the ticker a pure step: a
 * counter captured in an interval callback reads whatever it has reached by the
 * time React applies the update, not the value it had when the tick fired, so
 * every queued rotation lands on the same slot.
 */
export const rotateNextSlot = (rotation: Rotation): Rotation => {
  const { cursors } = rotation;

  if (!cursors.length) {
    return rotation;
  }

  const oldest = cursors.reduce(
    (slot, cursor, index) => (cursor < cursors[slot] ? index : slot),
    0,
  );

  return rotateSlot(rotation, oldest);
};

/**
 * Grows or shrinks the row as the viewport changes. Shrinking drops the
 * rightmost slots, which is where the trimmed marks were already going.
 */
export const resizeRotation = (
  rotation: Rotation,
  slotCount: number,
): Rotation => {
  const { deck, cursors, next } = rotation;
  const count = Math.max(0, Math.min(slotCount, deck.length));

  if (count === cursors.length) {
    return rotation;
  }

  if (count < cursors.length) {
    return { deck, cursors: cursors.slice(0, count), next };
  }

  const added = count - cursors.length;

  return {
    deck,
    cursors: [
      ...cursors,
      ...Array.from({ length: added }, (_, index) => next + index),
    ],
    next: next + added,
  };
};
