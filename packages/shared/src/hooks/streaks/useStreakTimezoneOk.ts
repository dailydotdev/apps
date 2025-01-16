import { getTimezoneOffset } from 'date-fns-tz';
import { useEffect, useMemo } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { DEFAULT_TIMEZONE } from '../../lib/timezones';
import usePersistentContext from '../usePersistentContext';
import { useActions } from '../useActions';
import { ActionType } from '../../graphql/actions';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';

export const timezoneMismatchIgnoreKey = 'timezoneMismatchIgnore';

export const useStreakTimezoneOk = (): boolean => {
  const { user, isLoggedIn } = useAuthContext();
  const { checkHasCompleted, isActionsFetched, completeAction } = useActions();
  const { logEvent } = useLogContext();

  const [ignoredTimezone] = usePersistentContext(timezoneMismatchIgnoreKey, '');
  const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const isTimezoneOk = useMemo(() => {
    if (ignoredTimezone === deviceTimezone) {
      return true;
    }

    if (!isLoggedIn) {
      return true;
    }

    return (
      getTimezoneOffset(user?.timezone || DEFAULT_TIMEZONE) ===
      getTimezoneOffset(Intl.DateTimeFormat().resolvedOptions().timeZone)
    );
  }, [deviceTimezone, ignoredTimezone, isLoggedIn, user?.timezone]);

  // once off check to see how many users with timezone mismatches we have in the wild
  useEffect(() => {
    if (isTimezoneOk) {
      return;
    }

    if (!isActionsFetched) {
      return;
    }

    if (checkHasCompleted(ActionType.StreakTimezoneMismatch)) {
      return;
    }

    logEvent({
      event_name: LogEvent.StreakTimezoneMismatch,
      extra: JSON.stringify({
        device_timezone: deviceTimezone,
        user_timezone: user?.timezone,
        timezone_ok: isTimezoneOk,
        timezone_ignore: ignoredTimezone,
      }),
    });

    completeAction(ActionType.StreakTimezoneMismatch);
  }, [
    isTimezoneOk,
    ignoredTimezone,
    isActionsFetched,
    checkHasCompleted,
    completeAction,
    logEvent,
    deviceTimezone,
    user?.timezone,
  ]);

  return isTimezoneOk;
};
