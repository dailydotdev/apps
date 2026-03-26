import {
  formatAchievementReward,
  formatAchievementRewardAmount,
  getAchievementLeaderboardTitle,
  getAchievementMetricLabel,
  getAchievementRewardLabel,
  getAchievementRewardTotal,
  getAchievementRewardValue,
  hasCompletedAllAchievements,
  shouldShowAchievementTracker,
} from './achievements';

describe('achievements', () => {
  it('should use xp values when quests mode is enabled', () => {
    expect(
      getAchievementRewardValue({ points: 50, xp: 120 }, true),
    ).toBe(120);
    expect(
      getAchievementRewardValue({ points: 50, xp: null }, true),
    ).toBe(50);
    expect(
      getAchievementRewardValue({ points: 50, xp: 120 }, false),
    ).toBe(50);
  });

  it('should format achievement reward labels and totals', () => {
    expect(
      getAchievementRewardLabel({ showAchievementXp: true }),
    ).toBe('XP');
    expect(
      getAchievementRewardLabel({ showAchievementXp: false, amount: 1 }),
    ).toBe('point');
    expect(
      getAchievementRewardLabel({
        showAchievementXp: false,
        amount: 2,
        short: true,
      }),
    ).toBe('pts');
    expect(
      formatAchievementRewardAmount(120, {
        showAchievementXp: true,
        signed: true,
      }),
    ).toBe('+120 XP');
    expect(
      formatAchievementReward({ points: 50, xp: 120 }, { showAchievementXp: true }),
    ).toBe('120 XP');
    expect(
      getAchievementRewardTotal(
        [
          {
            achievement: {
              id: 'a',
              name: 'A',
              description: 'A',
              image: '',
              type: 'instant' as never,
              points: 5,
              xp: 10,
              rarity: null,
              unit: null,
            },
            progress: 1,
            unlockedAt: new Date().toISOString(),
            createdAt: null,
            updatedAt: null,
          },
          {
            achievement: {
              id: 'b',
              name: 'B',
              description: 'B',
              image: '',
              type: 'instant' as never,
              points: 10,
              xp: 25,
              rarity: null,
              unit: null,
            },
            progress: 1,
            unlockedAt: new Date().toISOString(),
            createdAt: null,
            updatedAt: null,
          },
        ],
        true,
      ),
    ).toBe(35);
  });

  it('should return quests-aware achievement labels', () => {
    expect(getAchievementMetricLabel(true)).toBe('Achievement XP');
    expect(getAchievementMetricLabel(false)).toBe('Achievement points');
    expect(getAchievementLeaderboardTitle(true)).toBe('Most achievement XP');
    expect(getAchievementLeaderboardTitle(false)).toBe(
      'Most achievement points',
    );
  });

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
