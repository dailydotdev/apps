import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { differenceInCalendarDays, format, parse, parseISO } from 'date-fns';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useToastNotification } from '../useToastNotification';
import { useConditionalFeature } from '../useConditionalFeature';
import { featureStreakPause } from '../../lib/featureManagement';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { LogEvent } from '../../lib/log';
import { DEFAULT_TIMEZONE, dateFormatInTimezone } from '../../lib/timezones';
import type { UserStreak, UserStreakPause } from '../../graphql/users';
import type { ApiErrorResult } from '../../graphql/common';
import { ApiError, getApiError } from '../../graphql/common';
import {
  cancelStreakPause,
  MAX_STREAK_PAUSE_DAYS,
  MIN_STREAK_FOR_PAUSE,
  scheduleStreakPause,
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

export const getStreakPauseErrorMessage = (error: unknown): string => {
  const result = error as ApiErrorResult;

  if (getApiError(result, ApiError.Forbidden)) {
    return 'Pausing your streak is not available right now.';
  }

  const validation = getApiError(result, ApiError.GraphqlValidationFailed);
  if (validation) {
    if (validation.message.includes('streak of at least')) {
      return `Your streak needs to be at least ${MIN_STREAK_FOR_PAUSE} days before you can pause it.`;
    }

    return `Pick dates starting tomorrow, for up to ${MAX_STREAK_PAUSE_DAYS} days.`;
  }

  const conflict = getApiError(result, ApiError.Conflict);
  if (conflict) {
    if (conflict.message.includes('a year')) {
      return "You've already paused your streak twice this year.";
    }

    return 'You already have a streak pause scheduled.';
  }

  return labels.error.generic;
};

interface ActiveStreakPause {
  // The running or next scheduled pause, undefined while the flag is off.
  pause?: UserStreakPause;
  // Whether the pause covers today in the user's timezone.
  isActive: boolean;
}

// Read-only view of the pause for the streak surfaces (calendar, banner). The
// flag is only evaluated once the API returned a pause.
export const useActiveStreakPause = (
  streak?: Pick<UserStreak, 'pause'> | null,
): ActiveStreakPause => {
  const { user } = useAuthContext();
  const { value: isEnabled } = useConditionalFeature({
    feature: featureStreakPause,
    shouldEvaluate: !!streak?.pause,
  });
  const pause = (isEnabled && streak?.pause) || undefined;
  const timezone = user?.timezone ?? DEFAULT_TIMEZONE;

  return {
    pause,
    isActive: isStreakDayPaused(new Date(), pause, timezone),
  };
};

interface UseStreakPauseReturn {
  // Resolves whether the pause was scheduled; errors surface as a toast.
  schedule: (pause: UserStreakPause) => Promise<boolean>;
  cancel: () => Promise<void>;
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
      queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.UserStreak, user),
      }),
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
    onSuccess: () => {
      logEvent({ event_name: LogEvent.CancelStreakPause });
      invalidateStreak();
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

  const cancel = useCallback(async () => {
    await cancelAsync().catch(() => undefined);
  }, [cancelAsync]);

  return {
    schedule,
    cancel,
    isScheduling: scheduleMutation.isPending,
    isCancelling: cancelMutation.isPending,
  };
};
