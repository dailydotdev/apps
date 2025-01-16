import { getTimezoneOffset } from 'date-fns-tz';
import { useAuthContext } from '../../contexts/AuthContext';
import { DEFAULT_TIMEZONE } from '../../lib/timezones';
import usePersistentContext from '../usePersistentContext';

export const timezoneMismatchIgnoreKey = 'timezoneMismatchIgnore';

export const useStreakTimezoneOk = (): boolean => {
  const { user, isLoggedIn } = useAuthContext();
  const [ignoredTimezone] = usePersistentContext(timezoneMismatchIgnoreKey, '');

  const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (ignoredTimezone === deviceTimezone) {
    return true;
  }

  return isLoggedIn
    ? getTimezoneOffset(user.timezone || DEFAULT_TIMEZONE) ===
        getTimezoneOffset(Intl.DateTimeFormat().resolvedOptions().timeZone)
    : true;
};
