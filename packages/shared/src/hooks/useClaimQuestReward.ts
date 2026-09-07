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
import type { LoggedUser } from '../lib/user';
import { useRequestProtocol } from './useRequestProtocol';

/** The last successful claim, published through the query cache. */
export type QuestClaim = {
  questId: string;
  questType: QuestType;
};

export const questClaimQueryKey = (
  user: Pick<LoggedUser, 'id'> | undefined | null,
): unknown[] => generateQueryKey(RequestKey.QuestClaim, user ?? undefined);

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
  const questClaimKey = questClaimQueryKey(user);

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
            milestone: claimResult.milestone,
            intro: claimResult.intro,
          };
        },
      );

      if (!didUpdateQuestDashboard) {
        await queryClient.invalidateQueries({
          queryKey: questDashboardKey,
          exact: true,
        });
      }

      // Published after the dashboard cache is current, so a listener reading
      // it sees the claim already applied. A fresh object every time, so a
      // second claim is distinguishable from the first.
      queryClient.setQueryData<QuestClaim>(questClaimKey, {
        questId,
        questType,
      });

      await refetchBoot?.();
    },
  });
};
