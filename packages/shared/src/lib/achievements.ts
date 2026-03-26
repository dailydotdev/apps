import type {
  Achievement,
  UserAchievement,
} from '../graphql/user/achievements';

interface AchievementTrackerVisibilityParams {
  isExperimentEnabled: boolean;
  unlockedCount: number;
  totalCount: number;
}

interface FormatAchievementRewardOptions {
  showAchievementXp: boolean;
  short?: boolean;
  signed?: boolean;
}

export const getAchievementRewardValue = (
  achievement: Pick<Achievement, 'points' | 'xp'>,
  showAchievementXp: boolean,
): number =>
  showAchievementXp && achievement.xp != null
    ? achievement.xp
    : achievement.points;

export const getAchievementRewardLabel = ({
  showAchievementXp,
  amount,
  short = false,
}: {
  showAchievementXp: boolean;
  amount?: number;
  short?: boolean;
}): string => {
  if (showAchievementXp) {
    return 'XP';
  }

  if (short) {
    return 'pts';
  }

  return amount === 1 ? 'point' : 'points';
};

export const formatAchievementRewardAmount = (
  amount: number,
  { showAchievementXp, short = false, signed = false }: FormatAchievementRewardOptions,
): string => {
  const prefix = signed ? '+' : '';
  return `${prefix}${amount.toLocaleString()} ${getAchievementRewardLabel({
    showAchievementXp,
    amount,
    short,
  })}`;
};

export const formatAchievementReward = (
  achievement: Pick<Achievement, 'points' | 'xp'>,
  options: FormatAchievementRewardOptions,
): string =>
  formatAchievementRewardAmount(
    getAchievementRewardValue(achievement, options.showAchievementXp),
    options,
  );

export const getAchievementRewardTotal = (
  achievements: UserAchievement[],
  showAchievementXp: boolean,
): number =>
  achievements.reduce(
    (sum, achievement) =>
      sum +
      getAchievementRewardValue(achievement.achievement, showAchievementXp),
    0,
  );

export const getAchievementMetricLabel = (
  showAchievementXp: boolean,
): string => (showAchievementXp ? 'Achievement XP' : 'Achievement points');

export const getAchievementLeaderboardTitle = (
  showAchievementXp: boolean,
): string =>
  showAchievementXp ? 'Most achievement XP' : 'Most achievement points';

export const hasCompletedAllAchievements = ({
  unlockedCount,
  totalCount,
}: Pick<
  AchievementTrackerVisibilityParams,
  'unlockedCount' | 'totalCount'
>): boolean => totalCount > 0 && unlockedCount >= totalCount;

export const shouldShowAchievementTracker = ({
  isExperimentEnabled,
  unlockedCount,
  totalCount,
}: AchievementTrackerVisibilityParams): boolean => {
  if (isExperimentEnabled !== true) {
    return false;
  }

  return !hasCompletedAllAchievements({ unlockedCount, totalCount });
};
