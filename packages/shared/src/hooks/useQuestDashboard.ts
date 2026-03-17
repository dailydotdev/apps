import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../contexts/AuthContext';
import type { QuestDashboardData } from '../graphql/quests';
import { QUEST_DASHBOARD_QUERY } from '../graphql/quests';
import { RequestKey, StaleTime, generateQueryKey } from '../lib/query';
import { useRequestProtocol } from './useRequestProtocol';

export const useQuestDashboard = () => {
  const { isLoggedIn, user } = useAuthContext();
  const { requestMethod } = useRequestProtocol();

  return useQuery({
    queryKey: generateQueryKey(RequestKey.QuestDashboard, user),
    queryFn: async () => {
      const result = await requestMethod?.<QuestDashboardData>(
        QUEST_DASHBOARD_QUERY,
      );

      return result.questDashboard;
    },
    enabled: isLoggedIn,
    staleTime: StaleTime.OneMinute,
    retry: false,
  });
};
