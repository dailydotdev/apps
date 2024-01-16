import { useFeature } from '../../components/GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { ReadingStreaksExperiment } from '../../lib/featureValues';

interface UseStreakExperiment {
  shouldShowStreak: boolean;
}

export const useStreakExperiment = (): UseStreakExperiment => {
  const streak = useFeature(feature.readingStreaks);

  return {
    shouldShowStreak: streak === ReadingStreaksExperiment.V1,
  };
};
