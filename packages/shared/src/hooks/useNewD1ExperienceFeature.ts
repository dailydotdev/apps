import { featureNewD1Experience } from '../lib/featureManagement';
import { useConditionalFeature } from './useConditionalFeature';
import { useQuestDashboard } from './useQuestDashboard';

interface UseNewD1ExperienceFeature {
  value: boolean;
  isLoading: boolean;
}

export const useNewD1ExperienceFeature = ({
  shouldEvaluate = true,
}: {
  shouldEvaluate?: boolean;
} = {}): UseNewD1ExperienceFeature => {
  const { data, isLoading: isQuestsLoading } = useQuestDashboard();
  const hasIntroQuests = (data?.intro?.length ?? 0) > 0;
  const enabled = shouldEvaluate && hasIntroQuests;
  const { value, isLoading } = useConditionalFeature({
    feature: featureNewD1Experience,
    shouldEvaluate: enabled,
  });

  return {
    value: enabled && value,
    isLoading: isLoading || isQuestsLoading,
  };
};
