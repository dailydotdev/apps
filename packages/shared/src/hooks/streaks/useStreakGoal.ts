import { useAuthContext } from '../../contexts/AuthContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useConditionalFeature } from '../useConditionalFeature';
import { featureStreakGoals } from '../../lib/featureManagement';
import type { StreakGoal } from '../../graphql/settings';
import type { StreakGoalProgress } from '../../lib/streakGoal';
import { getStreakGoalProgress, isStreakGoal } from '../../lib/streakGoal';

interface UseStreakGoal {
  // In the streak_goals experiment, logged in and reading streaks on
  isEnabled: boolean;
  isLoading: boolean;
  goal: StreakGoal | null;
  // Null unless a goal is set and 0 < current < goal
  progress: StreakGoalProgress | null;
}

export const useStreakGoal = (current?: number): UseStreakGoal => {
  const { user } = useAuthContext();
  const { loadedSettings, optOutReadingStreak, streakGoal } =
    useSettingsContext();
  const isStreaksEnabled = !!user && loadedSettings && !optOutReadingStreak;
  const { value: isFeatureEnabled, isLoading } = useConditionalFeature({
    feature: featureStreakGoals,
    shouldEvaluate: isStreaksEnabled,
  });
  const isEnabled = isStreaksEnabled && isFeatureEnabled;
  const goal = isEnabled && isStreakGoal(streakGoal) ? streakGoal : null;

  return {
    isEnabled,
    isLoading,
    goal,
    progress: getStreakGoalProgress(current, goal),
  };
};
