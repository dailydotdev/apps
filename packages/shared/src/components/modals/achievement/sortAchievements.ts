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

/**
 * Rarest first, so the profile widget and the share card can never disagree
 * about which achievements are the ones worth showing.
 */
export const sortRarestUnlockedAchievements = (
  achievements: UserAchievement[],
): UserAchievement[] => {
  return achievements
    .filter((achievement) => achievement.unlockedAt !== null)
    .sort((a, b) => {
      const rarityA = a.achievement.rarity ?? Infinity;
      const rarityB = b.achievement.rarity ?? Infinity;
      if (rarityA !== rarityB) {
        return rarityA - rarityB;
      }

      const xpDelta = b.achievement.xp - a.achievement.xp;
      if (xpDelta !== 0) {
        return xpDelta;
      }

      const unlockedDateA = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
      const unlockedDateB = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
      if (unlockedDateA !== unlockedDateB) {
        return unlockedDateB - unlockedDateA;
      }

      return a.achievement.id.localeCompare(b.achievement.id);
    });
};
