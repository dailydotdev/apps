import { useFeature } from '../../components/GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { ReadingStreaksExperiment } from '../../lib/featureValues';
import { useActions } from '../useActions';
import { ActionType } from '../../graphql/actions';

interface UseStreakExperiment {
  shouldShowStreak: boolean;
  shouldShowPopup: boolean;
}

export const useStreakExperiment = (): UseStreakExperiment => {
  const streak = useFeature(feature.readingStreaks);
  const { checkHasCompleted } = useActions();

  return {
    shouldShowStreak: streak !== ReadingStreaksExperiment.Control,
    shouldShowPopup:
      streak === ReadingStreaksExperiment.V2 &&
      !checkHasCompleted(ActionType.ExistingUserSeenStreaks),
  };
};
