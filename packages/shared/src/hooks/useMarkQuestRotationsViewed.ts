import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../contexts/AuthContext';
import type {
  MarkQuestRotationsViewedData,
  QuestDashboard,
} from '../graphql/quests';
import { MARK_QUEST_ROTATIONS_VIEWED_MUTATION } from '../graphql/quests';
import { generateQueryKey, RequestKey } from '../lib/query';
import { useRequestProtocol } from './useRequestProtocol';

export const useMarkQuestRotationsViewed = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const { requestMethod } = useRequestProtocol();
  const questDashboardKey = generateQueryKey(RequestKey.QuestDashboard, user);

  return useMutation({
    mutationFn: async () => {
      const result = await requestMethod<MarkQuestRotationsViewedData>(
        MARK_QUEST_ROTATIONS_VIEWED_MUTATION,
      );

      return result.markQuestRotationsViewed;
    },
    onMutate: () => {
      const previousDashboard =
        queryClient.getQueryData<QuestDashboard>(questDashboardKey);

      queryClient.setQueryData<QuestDashboard | undefined>(
        questDashboardKey,
        (currentDashboard) => {
          if (!currentDashboard || !currentDashboard.hasNewQuestRotations) {
            return currentDashboard;
          }

          return {
            ...currentDashboard,
            hasNewQuestRotations: false,
          };
        },
      );

      return previousDashboard;
    },
    onError: (_, __, previousDashboard) => {
      if (previousDashboard) {
        queryClient.setQueryData(questDashboardKey, previousDashboard);
      }
    },
  });
};

export default useMarkQuestRotationsViewed;
