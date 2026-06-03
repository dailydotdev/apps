import { getSwipeOnboardingBarProgress } from './swipeOnboardingGuidance';

describe('getSwipeOnboardingBarProgress', () => {
  it('fills 0 to 100% linearly for swipes 0 to 9', () => {
    expect(getSwipeOnboardingBarProgress(0)).toBe(0);
    expect(getSwipeOnboardingBarProgress(2)).toBe(20);
    expect(getSwipeOnboardingBarProgress(5)).toBe(50);
    expect(getSwipeOnboardingBarProgress(9)).toBe(90);
  });

  it('clamps at 100% from 10 onwards', () => {
    expect(getSwipeOnboardingBarProgress(10)).toBe(100);
    expect(getSwipeOnboardingBarProgress(99)).toBe(100);
  });

  it('clamps negative swipe counts to 0', () => {
    expect(getSwipeOnboardingBarProgress(-1)).toBe(0);
  });
});
