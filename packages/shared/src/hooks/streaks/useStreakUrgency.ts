import { useEffect, useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { getHourTimezone } from '../../lib/timezones';

export enum UrgencyLevel {
  None = 'none',
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

const URGENCY_CHECK_INTERVAL_MS = 60_000;

export const useStreakUrgency = (
  hasReadToday: boolean,
  isStreaksEnabled: boolean,
  currentStreak: number | undefined,
): UrgencyLevel => {
  const { user } = useAuthContext();
  const [urgency, setUrgency] = useState(UrgencyLevel.None);

  useEffect(() => {
    if (!isStreaksEnabled || hasReadToday || !currentStreak) {
      setUrgency(UrgencyLevel.None);
      return undefined;
    }

    const checkUrgency = () => {
      const timezone = user?.timezone;

      if (!timezone) {
        setUrgency(UrgencyLevel.None);
        return;
      }

      const hour = getHourTimezone(timezone);

      if (hour >= 23) {
        setUrgency(UrgencyLevel.High);
      } else if (hour >= 22) {
        setUrgency(UrgencyLevel.Medium);
      } else if (hour >= 21) {
        setUrgency(UrgencyLevel.Low);
      } else {
        setUrgency(UrgencyLevel.None);
      }
    };

    checkUrgency();
    const interval = setInterval(checkUrgency, URGENCY_CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [hasReadToday, isStreaksEnabled, currentStreak, user?.timezone]);

  return urgency;
};
