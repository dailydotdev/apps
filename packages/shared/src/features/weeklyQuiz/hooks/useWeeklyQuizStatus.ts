import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { gqlClient } from '../../../graphql/common';
import { disabledRefetch } from '../../../lib/func';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { WEEKLY_QUIZ_STATUS_QUERY } from '../graphql';
import type { WeeklyQuizStatus } from '../types';
import { demoStatus, isWeeklyQuizDemo } from '../demoMode';

interface UseWeeklyQuizStatus {
  status: WeeklyQuizStatus | undefined;
  isPending: boolean;
}

// Drives the banner (is the quiz live? already played?) and the intro screen's
// week toggle. Public — anonymous visitors get a valid status with their
// completion/result fields null, so the banner can invite them to play too.
export const useWeeklyQuizStatus = (): UseWeeklyQuizStatus => {
  const { user, isAuthReady } = useAuthContext();
  const demo = isWeeklyQuizDemo();

  const { data, isPending } = useQuery({
    queryKey: generateQueryKey(RequestKey.WeeklyQuizStatus, user),
    queryFn: () =>
      gqlClient.request<{ weeklyQuizStatus: WeeklyQuizStatus }>(
        WEEKLY_QUIZ_STATUS_QUERY,
      ),
    enabled: isAuthReady && !demo,
    staleTime: StaleTime.Default,
    ...disabledRefetch,
  });

  if (demo) {
    return { status: demoStatus, isPending: false };
  }

  return { status: data?.weeklyQuizStatus, isPending };
};
