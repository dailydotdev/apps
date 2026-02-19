import {
  hasCompletedAllAchievements,
  shouldShowAchievementTracker,
} from './achievements';

describe('achievements', () => {
  it('should mark achievements as completed only when all are unlocked', () => {
    expect(
      hasCompletedAllAchievements({ unlockedCount: 10, totalCount: 10 }),
    ).toBe(true);
    expect(
      hasCompletedAllAchievements({ unlockedCount: 9, totalCount: 10 }),
    ).toBe(false);
  });

  it('should hide tracker when experiment is disabled', () => {
    expect(
      shouldShowAchievementTracker({
        isExperimentEnabled: false,
        unlockedCount: 10,
        totalCount: 10,
      }),
    ).toBe(false);
  });

  it('should hide tracker when experiment value is not strict true', () => {
    expect(
      shouldShowAchievementTracker({
        isExperimentEnabled: 'false' as unknown as boolean,
        unlockedCount: 0,
        totalCount: 10,
      }),
    ).toBe(false);
  });

  it('should hide tracker when experiment is enabled and all are completed', () => {
    expect(
      shouldShowAchievementTracker({
        isExperimentEnabled: true,
        unlockedCount: 10,
        totalCount: 10,
      }),
    ).toBe(false);
  });

  it('should show tracker when experiment is enabled and not all are completed', () => {
    expect(
      shouldShowAchievementTracker({
        isExperimentEnabled: true,
        unlockedCount: 3,
        totalCount: 10,
      }),
    ).toBe(true);
  });
});
