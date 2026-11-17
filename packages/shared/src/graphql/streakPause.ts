import { gql } from 'graphql-request';
import { gqlClient } from './common';
import type { UserStreakPause } from './users';
import { generateQueryKey, RequestKey, StaleTime } from '../lib/query';
import type { LoggedUser } from '../lib/user';

// Mirrors of the API limits (src/common/schema/streaks.ts in daily-api).
export const MAX_STREAK_PAUSE_DAYS = 14;
export const MAX_STREAK_PAUSES_PER_YEAR = 2;
export const MIN_STREAK_FOR_PAUSE = 7;
export const MAX_STREAK_PAUSE_LEAD_DAYS = 30;

// Kept out of USER_STREAK_FRAGMENT so the shell query never depends on it;
// reads only the pause, without resolving the streak
export const STREAK_PAUSE_QUERY = gql`
  query StreakPause {
    streakPause {
      start
      end
    }
  }
`;

export const SCHEDULE_STREAK_PAUSE_MUTATION = gql`
  mutation ScheduleStreakPause($start: String!, $end: String!) {
    scheduleStreakPause(start: $start, end: $end) {
      start
      end
    }
  }
`;

export const CANCEL_STREAK_PAUSE_MUTATION = gql`
  mutation CancelStreakPause {
    cancelStreakPause
  }
`;

export const scheduleStreakPause = async (
  pause: UserStreakPause,
): Promise<UserStreakPause> => {
  const result = await gqlClient.request<{
    scheduleStreakPause: UserStreakPause;
  }>(SCHEDULE_STREAK_PAUSE_MUTATION, pause);

  return result.scheduleStreakPause;
};

// The running or next scheduled pause, null when there is none. Its own key
// so streak invalidations on every read don't refetch it; only the pause
// mutations change it, and they invalidate it.
export const userStreakPauseQueryOptions = (user?: Pick<LoggedUser, 'id'>) => ({
  queryKey: generateQueryKey(RequestKey.StreakPause, user),
  queryFn: async (): Promise<UserStreakPause | null> => {
    const result = await gqlClient.request<{
      streakPause: UserStreakPause | null;
    }>(STREAK_PAUSE_QUERY);

    return result.streakPause;
  },
  staleTime: StaleTime.OneHour,
  retry: false,
});

export const cancelStreakPause = async (): Promise<boolean> => {
  const result = await gqlClient.request<{ cancelStreakPause: boolean }>(
    CANCEL_STREAK_PAUSE_MUTATION,
  );

  return result.cancelStreakPause;
};
