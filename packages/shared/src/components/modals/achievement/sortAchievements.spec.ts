import { AchievementType } from '../../../graphql/user/achievements';
import type { UserAchievement } from '../../../graphql/user/achievements';
import { sortLockedAchievements } from './sortAchievements';

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
