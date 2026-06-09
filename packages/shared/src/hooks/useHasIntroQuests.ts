import { useQuestDashboard } from './useQuestDashboard';

interface UseHasIntroQuests {
  value: boolean;
  isLoading: boolean;
}

export const useHasIntroQuests = ({
  shouldEvaluate = true,
}: {
  shouldEvaluate?: boolean;
} = {}): UseHasIntroQuests => {
  const { data, isLoading } = useQuestDashboard({
    enabled: shouldEvaluate,
  });
  const hasIntroQuests = (data?.intro?.length ?? 0) > 0;

  return {
    value: shouldEvaluate && hasIntroQuests,
    isLoading,
  };
};
