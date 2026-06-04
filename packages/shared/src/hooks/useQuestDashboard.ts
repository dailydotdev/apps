import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../contexts/AuthContext';
import type { QuestDashboard, QuestDashboardData } from '../graphql/quests';
import { QUEST_DASHBOARD_QUERY } from '../graphql/quests';
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
