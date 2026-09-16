import type { UserAchievement } from '../../../graphql/user/achievements';
import {
  getClampedProgress,
  getTargetCount,
} from '../../../graphql/user/achievements';

const getProgressRatio = (achievement: UserAchievement): number => {
  const targetCount = getTargetCount(achievement.achievement);

  if (targetCount <= 0) {
    return 0;
  }

  return getClampedProgress(achievement) / targetCount;
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

      const clampedProgressA = getClampedProgress(a);
      const clampedProgressB = getClampedProgress(b);
      if (clampedProgressB !== clampedProgressA) {
        return clampedProgressB - clampedProgressA;
      }

      return b.achievement.xp - a.achievement.xp;
    });
};
