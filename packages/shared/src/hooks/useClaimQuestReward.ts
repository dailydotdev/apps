import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../contexts/AuthContext';
import type { ClaimQuestRewardData } from '../graphql/quests';
import { CLAIM_QUEST_REWARD_MUTATION } from '../graphql/quests';
import { generateQueryKey, RequestKey } from '../lib/query';
import { useRequestProtocol } from './useRequestProtocol';

type ClaimQuestRewardArgs = {
  userQuestId: string;
};

export const useClaimQuestReward = () => {
  const queryClient = useQueryClient();
  const { user, refetchBoot } = useAuthContext();
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
    onSuccess: async (questDashboard) => {
      queryClient.setQueryData(questDashboardKey, questDashboard);
      await refetchBoot?.();
    },
  });
};
