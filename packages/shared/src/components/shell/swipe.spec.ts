import { resolveSwipe } from './swipe';
import { swipe } from './constants';

describe('resolveSwipe', () => {
  it('opens the next segment on a long drag to the left', () => {
    expect(resolveSwipe(-(swipe.commitDistance + 10), 4, 400)).toBe(1);
  });

  it('opens the previous segment on a long drag to the right', () => {
    expect(resolveSwipe(swipe.commitDistance + 10, -6, 400)).toBe(-1);
  });

  it('springs back from a short, slow drag', () => {
    expect(resolveSwipe(-(swipe.commitDistance - 10), 2, 600)).toBe(0);
  });

  it('accepts a quick flick over a shorter distance', () => {
    expect(resolveSwipe(-(swipe.velocityDistance + 4), 3, 60)).toBe(1);
  });

  it('ignores a drag that leaves the cone', () => {
    const dx = swipe.commitDistance + 20;
    expect(resolveSwipe(dx, dx / swipe.coneRatio + 1, 300)).toBe(0);
  });
});
