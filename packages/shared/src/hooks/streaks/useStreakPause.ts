import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { differenceInCalendarDays, format, parse, parseISO } from 'date-fns';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useToastNotification } from '../useToastNotification';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { LogEvent } from '../../lib/log';
import { DEFAULT_TIMEZONE, dateFormatInTimezone } from '../../lib/timezones';
import type { UserStreak, UserStreakPause } from '../../graphql/users';
import type { ApiErrorResult } from '../../graphql/common';
import { ApiError, getApiError } from '../../graphql/common';
import {
  cancelStreakPause,
  MAX_STREAK_PAUSE_DAYS,
  MAX_STREAK_PAUSE_LEAD_DAYS,
  MAX_STREAK_PAUSES_PER_YEAR,
  MIN_STREAK_FOR_PAUSE,
  scheduleStreakPause,
  userStreakPauseQueryOptions,
} from '../../graphql/streakPause';
import { labels } from '../../lib/labels';

const LOCAL_DATE_FORMAT = 'yyyy-MM-dd';

// The local date (YYYY-MM-DD) of an instant in the user's timezone, the format
// the API speaks for pause bounds.
export const toStreakLocalDate = (date: Date, timezone?: string): string =>
  dateFormatInTimezone(date, LOCAL_DATE_FORMAT, timezone);

export const isStreakDayPaused = (
  value: Date,
  pause: UserStreakPause | null | undefined,
  timezone?: string,
): boolean => {
  if (!pause || Number.isNaN(value.getTime())) {
    return false;
  }

  const day = toStreakLocalDate(value, timezone);

  return day >= pause.start && day <= pause.end;
};

// Pause bounds are plain local dates, so format them as such instead of turning
// them into instants that could shift a day in the device zone.
export const formatStreakPauseDate = (date: string): string => {
  const parsed = parse(date, LOCAL_DATE_FORMAT, new Date());

  return Number.isNaN(parsed.getTime()) ? date : format(parsed, 'MMM d');
};

export const getStreakPauseDays = ({ start, end }: UserStreakPause): number =>
  differenceInCalendarDays(parseISO(end), parseISO(start)) + 1;

// Cancelling a pause that started before today still counts towards the
// yearly limit; one starting today has not covered a day yet.
export const hasStreakPauseStarted = (
  pause: UserStreakPause,
  timezone?: string,
): boolean => pause.start < toStreakLocalDate(new Date(), timezone);

// API validation and conflict messages are written for users.
export const getStreakPauseErrorMessage = (error: unknown): string => {
  const result = error as ApiErrorResult;

  if (getApiError(result, ApiError.Forbidden)) {
    return 'Pausing your streak is not available right now.';
  }

  const validation = getApiError(result, ApiError.GraphqlValidationFailed);
  if (validation) {
    return (
      validation.message ||
      `Pick dates starting tomorrow and within ${MAX_STREAK_PAUSE_LEAD_DAYS} days, for up to ${MAX_STREAK_PAUSE_DAYS} days. Your streak needs to be at least ${MIN_STREAK_FOR_PAUSE} days.`
    );
  }

  const conflict = getApiError(result, ApiError.Conflict);
  if (conflict) {
    return (
      conflict.message ||
      `You can have one streak pause scheduled, and up to ${MAX_STREAK_PAUSES_PER_YEAR} a year.`
    );
  }

  return labels.error.generic;
};

// Not flag-gated: the API keeps honoring a pause after the flag is off. Skips
// users whose streak never reached the minimum, who cannot have a pause.
export const useUserStreakPause = (
  streak?: Pick<UserStreak, 'max'> | null,
): UserStreakPause | undefined => {
  const { user, isLoggedIn } = useAuthContext();
  const { data } = useQuery({
    ...userStreakPauseQueryOptions(user),
    enabled: isLoggedIn && (streak?.max ?? 0) >= MIN_STREAK_FOR_PAUSE,
  });

  return data ?? undefined;
};

interface ActiveStreakPause {
  // The running or next scheduled pause.
  pause?: UserStreakPause;
  // Whether the pause covers today in the user's timezone.
  isActive: boolean;
}

// Read-only view of the pause for the streak surfaces (calendar, banner).
export const useActiveStreakPause = (
  streak?: Pick<UserStreak, 'max'> | null,
): ActiveStreakPause => {
  const { user } = useAuthContext();
  const pause = useUserStreakPause(streak);
  const timezone = user?.timezone ?? DEFAULT_TIMEZONE;

  return {
    pause,
    isActive: isStreakDayPaused(new Date(), pause, timezone),
  };
};

interface UseStreakPauseReturn {
  // Resolves whether the pause was scheduled; errors surface as a toast.
  schedule: (pause: UserStreakPause) => Promise<boolean>;
  // Resolves whether a pause was cancelled; errors surface as a toast.
  cancel: () => Promise<boolean>;
  isScheduling: boolean;
  isCancelling: boolean;
}

export const useStreakPause = (): UseStreakPauseReturn => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const queryClient = useQueryClient();

  const invalidateStreak = useCallback(
    () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: generateQueryKey(RequestKey.UserStreak, user),
        }),
        queryClient.invalidateQueries({
          queryKey: userStreakPauseQueryOptions(user).queryKey,
        }),
      ]),
    [queryClient, user],
  );

  const onError = useCallback(
    (error: unknown) => displayToast(getStreakPauseErrorMessage(error)),
    [displayToast],
  );

  const scheduleMutation = useMutation({
    mutationKey: generateQueryKey(RequestKey.UserStreak, user, 'pause'),
    mutationFn: scheduleStreakPause,
    onSuccess: (pause) => {
      logEvent({
        event_name: LogEvent.ScheduleStreakPause,
        extra: JSON.stringify({ days: getStreakPauseDays(pause) }),
      });
      invalidateStreak();
      displayToast(
        `Your streak is paused from ${formatStreakPauseDate(
          pause.start,
        )} to ${formatStreakPauseDate(pause.end)}.`,
      );
    },
    onError,
  });

  const cancelMutation = useMutation({
    mutationKey: generateQueryKey(RequestKey.UserStreak, user, 'cancel-pause'),
    mutationFn: cancelStreakPause,
    onSuccess: (cancelled) => {
      invalidateStreak();

      if (!cancelled) {
        displayToast('There is no streak pause to cancel.');
        return;
      }

      logEvent({ event_name: LogEvent.CancelStreakPause });
      displayToast('Your streak pause was canceled.');
    },
    onError,
  });

  const { mutateAsync: scheduleAsync } = scheduleMutation;
  const { mutateAsync: cancelAsync } = cancelMutation;

  const schedule = useCallback(
    (pause: UserStreakPause) =>
      scheduleAsync(pause).then(
        () => true,
        () => false,
      ),
    [scheduleAsync],
  );

  const cancel = useCallback(
    () => cancelAsync().catch(() => false),
    [cancelAsync],
  );

  return {
    schedule,
    cancel,
    isScheduling: scheduleMutation.isPending,
    isCancelling: cancelMutation.isPending,
  };
};
