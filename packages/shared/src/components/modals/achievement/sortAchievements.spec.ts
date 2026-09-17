import { AchievementType } from '../../../graphql/user/achievements';
import type { UserAchievement } from '../../../graphql/user/achievements';
import {
  sortLockedAchievements,
  sortRarestUnlockedAchievements,
} from './sortAchievements';

const createAchievement = ({
  id,
  progress,
  xp,
  targetCount,
  unlockedAt = null,
}: {
  id: string;
  progress: number;
  xp: number;
  targetCount: number;
  unlockedAt?: string | null;
}): UserAchievement => ({
  achievement: {
    id,
    name: id,
    description: `${id} description`,
    image: 'https://daily.dev/default-achievement.png',
    type: AchievementType.Milestone,
    criteria: { targetCount },
    xp,
    rarity: null,
    unit: null,
  },
  progress,
  unlockedAt,
  createdAt: null,
  updatedAt: null,
});

describe('sortLockedAchievements', () => {
  it('should filter unlocked achievements and sort by ratio, progress, then xp', () => {
    const achievements: UserAchievement[] = [
      createAchievement({
        id: 'ratio-high',
        progress: 8,
        targetCount: 10,
        xp: 10,
      }),
      createAchievement({
        id: 'ratio-equal-progress-high',
        progress: 6,
        targetCount: 10,
        xp: 5,
      }),
      createAchievement({
        id: 'ratio-equal-progress-low-xp-high',
        progress: 6,
        targetCount: 10,
        xp: 50,
      }),
      createAchievement({
        id: 'unlocked',
        progress: 10,
        targetCount: 10,
        xp: 100,
        unlockedAt: new Date().toISOString(),
      }),
    ];

    const sorted = sortLockedAchievements(achievements);

    expect(sorted.map((item) => item.achievement.id)).toEqual([
      'ratio-high',
      'ratio-equal-progress-low-xp-high',
      'ratio-equal-progress-high',
    ]);
  });
});

describe('sortRarestUnlockedAchievements', () => {
  const unlocked = ({
    id,
    rarity,
    xp = 10,
    unlockedAt = '2026-01-01T00:00:00.000Z',
  }: {
    id: string;
    rarity: number | null;
    xp?: number;
    unlockedAt?: string;
  }): UserAchievement => {
    const base = createAchievement({
      id,
      progress: 1,
      targetCount: 1,
      xp,
      unlockedAt,
    });

    return { ...base, achievement: { ...base.achievement, rarity } };
  };

  it('drops the locked ones', () => {
    const result = sortRarestUnlockedAchievements([
      createAchievement({
        id: 'locked',
        progress: 0,
        targetCount: 5,
        xp: 1,
      }),
      unlocked({ id: 'earned', rarity: 20 }),
    ]);

    expect(result.map((a) => a.achievement.id)).toEqual(['earned']);
  });

  it('puts the rarest first, and an unknown rarity last', () => {
    const result = sortRarestUnlockedAchievements([
      unlocked({ id: 'common', rarity: 40 }),
      unlocked({ id: 'unknown', rarity: null }),
      unlocked({ id: 'rarest', rarity: 1 }),
    ]);

    expect(result.map((a) => a.achievement.id)).toEqual([
      'rarest',
      'common',
      'unknown',
    ]);
  });

  it('breaks a rarity tie on xp, then on the more recent unlock', () => {
    const result = sortRarestUnlockedAchievements([
      unlocked({
        id: 'older',
        rarity: 5,
        xp: 50,
        unlockedAt: '2026-01-01T00:00:00.000Z',
      }),
      unlocked({ id: 'less-xp', rarity: 5, xp: 10 }),
      unlocked({
        id: 'newer',
        rarity: 5,
        xp: 50,
        unlockedAt: '2026-06-01T00:00:00.000Z',
      }),
    ]);

    expect(result.map((a) => a.achievement.id)).toEqual([
      'newer',
      'older',
      'less-xp',
    ]);
  });
});
