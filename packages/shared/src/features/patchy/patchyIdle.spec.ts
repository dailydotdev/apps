import { pickPatchyIdleAction } from './patchyIdle';

const rolls = Array.from({ length: 200 }, (_, index) => index / 200);
const share = (context: { isReading: boolean; isEvening: boolean }) => {
  const counts: Record<string, number> = {};
  rolls.forEach((roll) => {
    const name = pickPatchyIdleAction(roll, context);
    counts[name] = (counts[name] ?? 0) + 1;
  });
  return counts;
};

describe('pickPatchyIdleAction', () => {
  it('mostly reads along while a post is open', () => {
    const reading = share({ isReading: true, isEvening: false });
    const browsing = share({ isReading: false, isEvening: false });
    expect(reading.read).toBeGreaterThan(80);
    expect(browsing.read).toBeUndefined();
    expect(browsing.glance).toBeGreaterThan(reading.glance);
  });

  it('yawns more in the evening and rarely chases his tail', () => {
    const evening = share({ isReading: false, isEvening: true });
    const day = share({ isReading: false, isEvening: false });
    expect(evening.yawn).toBeGreaterThan(day.yawn);
    expect(day.spin).toBeLessThan(10);
  });

  it('handles out-of-range dice', () => {
    expect(
      pickPatchyIdleAction(-1, { isReading: false, isEvening: false }),
    ).toBe('glance');
    expect(
      pickPatchyIdleAction(1, { isReading: false, isEvening: false }),
    ).toBe('spin');
  });
});
