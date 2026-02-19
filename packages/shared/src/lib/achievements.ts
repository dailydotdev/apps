interface AchievementTrackerVisibilityParams {
  isExperimentEnabled: boolean;
  unlockedCount: number;
  totalCount: number;
}

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
