import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../contexts/AuthContext';
import type { QuestDashboard, QuestDashboardData } from '../graphql/quests';
import {
  QUEST_DASHBOARD_QUERY,
  QuestRewardType,
  isQuestClaimed,
} from '../graphql/quests';
import { RequestKey, StaleTime, generateQueryKey } from '../lib/query';
import { useRequestProtocol } from './useRequestProtocol';

export const useQuestDashboard = ({
  enabled = true,
}: { enabled?: boolean } = {}) => {
  const { isLoggedIn, user } = useAuthContext();
  const { requestMethod } = useRequestProtocol();

  return useQuery({
    queryKey: generateQueryKey(RequestKey.QuestDashboard, user),
    queryFn: async () => {
      const result = await requestMethod<QuestDashboardData>(
        QUEST_DASHBOARD_QUERY,
      );

      return result.questDashboard;
    },
    enabled: isLoggedIn && enabled,
    staleTime: StaleTime.OneMinute,
    retry: false,
  });
};

// Number of claimable (completed-but-unclaimed) daily + weekly quests. This is
// the "you have a quest to claim" signal shown on the header quest button and
// the Game Center sidebar tab.
export const getClaimableQuestCount = (dashboard?: QuestDashboard): number => {
  if (!dashboard) {
    return 0;
  }

  return [
    ...dashboard.daily.regular,
    ...dashboard.daily.plus,
    ...dashboard.weekly.regular,
    ...dashboard.weekly.plus,
  ].filter((quest) => quest.claimable).length;
};

export const useClaimableQuestCount = (): number => {
  const { data } = useQuestDashboard();

  return useMemo(() => getClaimableQuestCount(data), [data]);
};

export type DailyQuestSummary = {
  total: number;
  claimed: number;
  xpEarned: number;
};

// Progress through today's daily quests. Locked quests are excluded from the
// total: the Plus bucket is unreachable for free users, so counting it would
// show them a progress denominator they can never close.
export const getDailyQuestSummary = (
  dashboard?: QuestDashboard,
): DailyQuestSummary => {
  const quests = [
    ...(dashboard?.daily.regular ?? []),
    ...(dashboard?.daily.plus ?? []),
  ].filter((quest) => !quest.locked);
  const claimed = quests.filter(isQuestClaimed);

  return {
    total: quests.length,
    claimed: claimed.length,
    xpEarned: claimed.reduce(
      (total, quest) =>
        total +
        quest.rewards
          .filter((reward) => reward.type === QuestRewardType.Xp)
          .reduce((sum, reward) => sum + reward.amount, 0),
      0,
    ),
  };
};
