import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../contexts/AuthContext';
import { useLogContext } from '../contexts/LogContext';
import type {
  ClaimQuestRewardData,
  QuestDashboard,
  QuestType,
} from '../graphql/quests';
import { CLAIM_QUEST_REWARD_MUTATION } from '../graphql/quests';
import { LogEvent, TargetType } from '../lib/log';
import { generateQueryKey, RequestKey } from '../lib/query';
import { useRequestProtocol } from './useRequestProtocol';

type ClaimQuestRewardArgs = {
  userQuestId: string;
  questId: string;
  questType: QuestType;
};

export const useClaimQuestReward = () => {
  const queryClient = useQueryClient();
  const { user, refetchBoot } = useAuthContext();
  const { logEvent } = useLogContext();
  const { requestMethod } = useRequestProtocol();
  const questDashboardKey = generateQueryKey(RequestKey.QuestDashboard, user);

  return useMutation({
    mutationFn: async ({ userQuestId }: ClaimQuestRewardArgs) => {
      const result = await requestMethod<ClaimQuestRewardData>(
        CLAIM_QUEST_REWARD_MUTATION,
        {
          userQuestId,
        },
      );

      return result.claimQuestReward;
    },
    onSuccess: async (claimResult, { userQuestId, questId, questType }) => {
      logEvent({
        event_name: LogEvent.ClaimQuest,
        target_id: questId,
        target_type: TargetType.Quest,
        extra: JSON.stringify({
          questType,
          userQuestId,
          userId: user?.id,
        }),
      });

      let didUpdateQuestDashboard = false;

      queryClient.setQueryData<QuestDashboard | undefined>(
        questDashboardKey,
        (currentDashboard) => {
          if (!currentDashboard) {
            return currentDashboard;
          }

          didUpdateQuestDashboard = true;

          return {
            ...currentDashboard,
            level: claimResult.level,
            daily: claimResult.daily,
            weekly: claimResult.weekly,
          };
        },
      );

      if (!didUpdateQuestDashboard) {
        await queryClient.invalidateQueries({
          queryKey: questDashboardKey,
          exact: true,
        });
      }

      await refetchBoot?.();
    },
  });
};
