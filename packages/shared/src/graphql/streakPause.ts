import { gql } from 'graphql-request';
import { gqlClient } from './common';
import type { UserStreakPause } from './users';

// Mirrors of the API limits (src/common/schema/streaks.ts in daily-api).
export const MAX_STREAK_PAUSE_DAYS = 14;
export const MAX_STREAK_PAUSES_PER_YEAR = 2;
export const MIN_STREAK_FOR_PAUSE = 7;

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

export const cancelStreakPause = async (): Promise<boolean> => {
  const result = await gqlClient.request<{ cancelStreakPause: boolean }>(
    CANCEL_STREAK_PAUSE_MUTATION,
  );

  return result.cancelStreakPause;
};
