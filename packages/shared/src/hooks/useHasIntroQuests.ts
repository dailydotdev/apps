import { useQuestDashboard } from './useQuestDashboard';

export const useHasIntroQuests = ({
  shouldEvaluate = true,
}: {
  shouldEvaluate?: boolean;
} = {}): boolean => {
  const { data } = useQuestDashboard({ enabled: shouldEvaluate });

  return shouldEvaluate && (data?.intro?.length ?? 0) > 0;
};
