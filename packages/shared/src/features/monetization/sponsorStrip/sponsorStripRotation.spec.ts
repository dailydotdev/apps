import type { SponsorStripCreative } from './sponsorStripCreative';
import { SponsorTier } from './sponsorStripCreative';
import {
  canRotate,
  createRotation,
  partitionByTier,
  resizeRotation,
  rotateNextSlot,
  rotateSlot,
  rotationSponsors,
} from './sponsorStripRotation';

const creative = (
  id: string,
  tier = SponsorTier.Community,
): SponsorStripCreative =>
  ({
    gen_id: id,
    company: id,
    tier,
  } as SponsorStripCreative);

const pool = (size: number, tier = SponsorTier.Community) =>
  Array.from({ length: size }, (_, index) => creative(`c${index}`, tier));

/** Keeps the deck in pool order so positions are assertable. */
const noShuffle = <T>(items: T[]): T[] => [...items];

const companies = (creatives: SponsorStripCreative[]) =>
  creatives.map(({ company }) => company);

describe('partitionByTier', () => {
  it('should keep a single gold sponsor', () => {
    const pools = partitionByTier([
      creative('gold-1', SponsorTier.Gold),
      creative('gold-2', SponsorTier.Gold),
      creative('premium-1', SponsorTier.Premium),
      creative('community-1'),
    ]);

    expect(pools.gold?.company).toEqual('gold-1');
    expect(companies(pools.premium)).toEqual(['premium-1']);
    expect(companies(pools.community)).toEqual(['community-1']);
  });

  it('should report no gold sponsor when none was sold', () => {
    expect(partitionByTier(pool(3)).gold).toBeNull();
  });
});

describe('createRotation', () => {
  it('should hold one cursor per slot', () => {
    const rotation = createRotation(pool(10), 4, noShuffle);

    expect(companies(rotationSponsors(rotation))).toEqual([
      'c0',
      'c1',
      'c2',
      'c3',
    ]);
  });

  it('should not open more slots than the deck can fill', () => {
    const rotation = createRotation(pool(2), 4, noShuffle);

    expect(rotationSponsors(rotation)).toHaveLength(2);
  });
});

describe('rotateSlot', () => {
  it('should hold still when the deck is no larger than the row', () => {
    const rotation = createRotation(pool(4), 4, noShuffle);

    expect(canRotate(rotation)).toBe(false);
    expect(rotateSlot(rotation, 0)).toBe(rotation);
  });

  it('should replace only the rotated slot', () => {
    const rotation = rotateSlot(createRotation(pool(6), 4, noShuffle), 1);

    expect(companies(rotationSponsors(rotation))).toEqual([
      'c0',
      'c4',
      'c2',
      'c3',
    ]);
  });

  it('should never show the same sponsor twice, whatever the rotation order', () => {
    let rotation = createRotation(pool(6), 4, noShuffle);

    // Deliberately lopsided: one slot rotating far more than its neighbours is
    // what a staggered ticker looks like if a slot count changes mid-session.
    [0, 0, 0, 2, 0, 1, 0, 0, 3, 0, 0, 0].forEach((slot) => {
      rotation = rotateSlot(rotation, slot);
      const shown = companies(rotationSponsors(rotation));

      expect(new Set(shown).size).toEqual(shown.length);
    });
  });

  it('should ignore a slot the row does not have', () => {
    const rotation = createRotation(pool(6), 4, noShuffle);

    expect(rotateSlot(rotation, 9)).toBe(rotation);
    expect(rotateSlot(rotation, -1)).toBe(rotation);
  });
});

describe('rotateNextSlot', () => {
  it('should take the slots in turn so each holds its logo for a full cycle', () => {
    let rotation = createRotation(pool(8), 4, noShuffle);
    const rotated: number[] = [];

    Array.from({ length: 8 }).forEach(() => {
      const before = rotationSponsors(rotation);
      rotation = rotateNextSlot(rotation);
      const after = rotationSponsors(rotation);

      rotated.push(
        after.findIndex((sponsor, slot) => sponsor !== before[slot]),
      );
    });

    expect(rotated).toEqual([0, 1, 2, 3, 0, 1, 2, 3]);
  });

  it('should do nothing to an empty row', () => {
    const rotation = createRotation([], 4, noShuffle);

    expect(rotateNextSlot(rotation)).toBe(rotation);
  });
});

describe('resizeRotation', () => {
  it('should drop the rightmost slots when the row narrows', () => {
    const rotation = resizeRotation(createRotation(pool(8), 4, noShuffle), 2);

    expect(companies(rotationSponsors(rotation))).toEqual(['c0', 'c1']);
  });

  it('should fill new slots with sponsors that are not already up', () => {
    const rotation = resizeRotation(createRotation(pool(8), 2, noShuffle), 4);
    const shown = companies(rotationSponsors(rotation));

    expect(shown).toHaveLength(4);
    expect(new Set(shown).size).toEqual(4);
  });

  it('should cap growth at the deck size', () => {
    const rotation = resizeRotation(createRotation(pool(3), 2, noShuffle), 12);

    expect(rotationSponsors(rotation)).toHaveLength(3);
  });

  it('should keep the same rotation when nothing changed', () => {
    const rotation = createRotation(pool(8), 4, noShuffle);

    expect(resizeRotation(rotation, 4)).toBe(rotation);
  });
});
