import { featureNewD1Experience } from '../lib/featureManagement';
import { useConditionalFeature } from './useConditionalFeature';
import { useQuestDashboard } from './useQuestDashboard';

interface UseNewD1ExperienceFeature {
  value: boolean;
  isLoading: boolean;
}

export const useNewD1ExperienceFeature = ({
  shouldEvaluate,
}: {
  shouldEvaluate?: boolean;
} = {}): UseNewD1ExperienceFeature => {
  const { data, isLoading: isQuestsLoading } = useQuestDashboard();
  const hasIntroQuests = (data?.intro?.length ?? 0) > 0;
  const evaluate = shouldEvaluate !== false && hasIntroQuests;
  const { value, isLoading } = useConditionalFeature({
    feature: featureNewD1Experience,
    shouldEvaluate: evaluate,
  });

  return {
    value: evaluate && value,
    isLoading: isLoading || isQuestsLoading,
  };
};
