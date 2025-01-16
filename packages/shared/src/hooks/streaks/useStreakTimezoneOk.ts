import { getTimezoneOffset } from 'date-fns-tz';
import { useEffect, useMemo } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { DEFAULT_TIMEZONE } from '../../lib/timezones';
import { useActions } from '../useActions';
import { ActionType } from '../../graphql/actions';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';
import { useSettingsContext } from '../../contexts/SettingsContext';

export const useStreakTimezoneOk = (): boolean => {
  const { user, isLoggedIn } = useAuthContext();
  const { checkHasCompleted, isActionsFetched, completeAction } = useActions();
  const { logEvent } = useLogContext();
  const { flags } = useSettingsContext();

  const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const isTimezoneOk = useMemo(() => {
    if (flags?.timezoneMismatchIgnore === deviceTimezone) {
      return true;
    }

    if (!isLoggedIn) {
      return true;
    }

    return (
      getTimezoneOffset(user?.timezone || DEFAULT_TIMEZONE) ===
      getTimezoneOffset(Intl.DateTimeFormat().resolvedOptions().timeZone)
    );
  }, [
    deviceTimezone,
    flags?.timezoneMismatchIgnore,
    isLoggedIn,
    user?.timezone,
  ]);

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
        timezone_ignore: flags?.timezoneMismatchIgnore,
      }),
    });

    completeAction(ActionType.StreakTimezoneMismatch);
  }, [
    isTimezoneOk,
    flags?.timezoneMismatchIgnore,
    isActionsFetched,
    checkHasCompleted,
    completeAction,
    logEvent,
    deviceTimezone,
    user?.timezone,
  ]);

  return isTimezoneOk;
};
