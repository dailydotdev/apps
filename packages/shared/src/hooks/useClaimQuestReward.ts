import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../contexts/AuthContext';
import { useLogContext } from '../contexts/LogContext';
import type { ClaimQuestRewardData, QuestType } from '../graphql/quests';
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
    onSuccess: async (questDashboard, { userQuestId, questId, questType }) => {
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

      queryClient.setQueryData(questDashboardKey, questDashboard);
      await refetchBoot?.();
    },
  });
};
