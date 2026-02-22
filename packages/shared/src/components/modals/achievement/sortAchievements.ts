import type { UserAchievement } from '../../../graphql/user/achievements';
import { getTargetCount } from '../../../graphql/user/achievements';

const getProgressRatio = (achievement: UserAchievement): number => {
  const targetCount = getTargetCount(achievement.achievement);

  if (targetCount <= 0) {
    return 0;
  }

  return Math.min(achievement.progress / targetCount, 1);
};

export const sortLockedAchievements = (
  achievements: UserAchievement[],
): UserAchievement[] => {
  return achievements
    .filter((achievement) => !achievement.unlockedAt)
    .sort((a, b) => {
      const ratioDelta = getProgressRatio(b) - getProgressRatio(a);
      if (ratioDelta !== 0) {
        return ratioDelta;
      }

      if (b.progress !== a.progress) {
        return b.progress - a.progress;
      }

      return b.achievement.points - a.achievement.points;
    });
};
