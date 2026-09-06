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

      const pointsDelta = b.achievement.points - a.achievement.points;
      if (pointsDelta !== 0) {
        return pointsDelta;
      }

      const unlockedDateA = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
      const unlockedDateB = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
      if (unlockedDateA !== unlockedDateB) {
        return unlockedDateB - unlockedDateA;
      }

      return a.achievement.id.localeCompare(b.achievement.id);
    });
};
