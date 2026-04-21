import { getAdSlotIndex } from './useFeed';

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

  it('returns undefined for indices before the first possible ad slot', () => {
    const adStart = 2;
    const adRepeat = 5;
    const adJitter = 2;
    expect(
      getAdSlotIndex({ index: -1, adStart, adRepeat, adJitter, seed }),
    ).toBeUndefined();
  });

  it('keeps jittered positions inside the expected window per slot', () => {
    const adStart = 2;
    const adRepeat = 5;
    const adJitter = 2;
    const windows = new Map<number, number[]>();
    for (let index = 0; index < 60; index += 1) {
      const n = getAdSlotIndex({
        index,
        adStart,
        adRepeat,
        adJitter,
        seed,
      });
      if (n !== undefined) {
        const list = windows.get(n) ?? [];
        list.push(index);
        windows.set(n, list);
      }
    }
    Array.from(windows.entries()).forEach(([n, hits]) => {
      expect(hits).toHaveLength(1);
      const center = adStart + n * adRepeat;
      expect(hits[0]).toBeGreaterThanOrEqual(center - adJitter);
      expect(hits[0]).toBeLessThanOrEqual(center + adJitter);
    });
    expect(windows.size).toBeGreaterThanOrEqual(10);
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

  it('clamps jitter so consecutive ads never overlap or reorder', () => {
    const adStart = 2;
    const adRepeat = 5;
    const adJitter = 100;
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
      expect(hits[i]).toBeGreaterThan(hits[i - 1]);
    }
  });
});
