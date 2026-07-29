import { getAdSlotIndex } from './feed';

describe('getAdSlotIndex', () => {
  const seed = '["feed","my-feed"]';

  it('matches modulo math when adJitter is 0', () => {
    const adStart = 2;
    const adRepeat = 5;
    const positions: number[] = [];
    for (let index = 0; index < 40; index += 1) {
      const n = getAdSlotIndex({ index, adStart, adRepeat, seed });
      if (n !== undefined) {
        positions.push(index);
      }
    }
    expect(positions).toEqual([2, 7, 12, 17, 22, 27, 32, 37]);
  });

  it('returns undefined for indices before adStart (no jitter)', () => {
    const adStart = 2;
    const adRepeat = 5;
    expect(
      getAdSlotIndex({ index: 0, adStart, adRepeat, seed }),
    ).toBeUndefined();
    expect(
      getAdSlotIndex({ index: 1, adStart, adRepeat, seed }),
    ).toBeUndefined();
  });

  it('returns undefined for non-positive adRepeat', () => {
    expect(
      getAdSlotIndex({ index: 2, adStart: 2, adRepeat: 0, seed }),
    ).toBeUndefined();
  });

  it('never places the first ad before adStart, even with jitter', () => {
    const adStart = 2;
    const adRepeat = 5;
    const adJitter = 3;
    const seeds = Array.from({ length: 50 }, (_, i) => `["feed","user-${i}"]`);
    seeds.forEach((s) => {
      let firstHit: number | undefined;
      for (let index = 0; index < adStart + adRepeat; index += 1) {
        if (
          getAdSlotIndex({ index, adStart, adRepeat, adJitter, seed: s }) !==
          undefined
        ) {
          firstHit = index;
          break;
        }
      }
      expect(firstHit).toBeDefined();
      expect(firstHit).toBeGreaterThanOrEqual(adStart);
      expect(firstHit).toBeLessThanOrEqual(adStart + adJitter);
    });
  });

  it('keeps consecutive ad gaps within [adRepeat - J, adRepeat + J]', () => {
    const adStart = 2;
    const adRepeat = 5;
    const adJitter = 3;
    const hits: number[] = [];
    for (let index = 0; index < 200; index += 1) {
      if (
        getAdSlotIndex({ index, adStart, adRepeat, adJitter, seed }) !==
        undefined
      ) {
        hits.push(index);
      }
    }
    expect(hits.length).toBeGreaterThan(5);
    for (let i = 1; i < hits.length; i += 1) {
      const gap = hits[i] - hits[i - 1];
      expect(gap).toBeGreaterThanOrEqual(adRepeat - adJitter);
      expect(gap).toBeLessThanOrEqual(adRepeat + adJitter);
    }
  });

  it('is deterministic for the same seed and slot index', () => {
    const args = {
      adStart: 2,
      adRepeat: 5,
      adJitter: 2,
      seed,
    };
    const runA: Array<number | undefined> = [];
    const runB: Array<number | undefined> = [];
    for (let index = 0; index < 40; index += 1) {
      runA.push(getAdSlotIndex({ index, ...args }));
      runB.push(getAdSlotIndex({ index, ...args }));
    }
    expect(runA).toEqual(runB);
  });

  it('produces different positions for different seeds', () => {
    const args = { adStart: 2, adRepeat: 5, adJitter: 2 };
    const collect = (s: string): number[] => {
      const hits: number[] = [];
      for (let index = 0; index < 60; index += 1) {
        if (getAdSlotIndex({ index, ...args, seed: s }) !== undefined) {
          hits.push(index);
        }
      }
      return hits;
    };
    const seedA = '["feed","user-a"]';
    const seedB = '["feed","user-b"]';
    expect(collect(seedA)).not.toEqual(collect(seedB));
  });

  it('always leaves at least one post between consecutive ads, regardless of jitter size', () => {
    // adRepeat is small and jitter is intentionally huge — clamp must still
    // guarantee `gap >= 2` so we never render `ad, ad` back-to-back.
    const adStart = 2;
    const adRepeat = 3;
    const adJitter = 100;
    const seeds = Array.from({ length: 25 }, (_, i) => `["feed","user-${i}"]`);
    seeds.forEach((s) => {
      const hits: number[] = [];
      for (let index = 0; index < 200; index += 1) {
        if (
          getAdSlotIndex({ index, adStart, adRepeat, adJitter, seed: s }) !==
          undefined
        ) {
          hits.push(index);
        }
      }
      expect(hits.length).toBeGreaterThan(5);
      for (let i = 1; i < hits.length; i += 1) {
        expect(hits[i] - hits[i - 1]).toBeGreaterThanOrEqual(2);
      }
    });
  });
});
