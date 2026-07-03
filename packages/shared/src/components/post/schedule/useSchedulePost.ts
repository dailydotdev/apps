import { useCallback, useState } from 'react';
import { useAuthContext } from '../../../contexts/AuthContext';
import { DEFAULT_TIMEZONE } from '../../../lib/timezones';
import {
  getDefaultPostScheduledStart,
  validatePostScheduledStart,
} from '../../../lib/scheduledPost';

export interface ResolvedScheduledAt {
  iso?: string;
  error?: string;
}

export interface UseSchedulePost {
  isScheduled: boolean;
  scheduledStart: string;
  timezone: string;
  error: string | null;
  setScheduledStart: (value: string) => void;
  seedDefault: () => void;
  confirmSchedule: () => boolean;
  clearSchedule: () => void;
  resolveScheduledAt: () => ResolvedScheduledAt;
}

export const useSchedulePost = (): UseSchedulePost => {
  const { user } = useAuthContext();
  const timezone = user?.timezone || DEFAULT_TIMEZONE;
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledStart, setScheduledStartState] = useState('');
  const [error, setError] = useState<string | null>(null);

  const setScheduledStart = useCallback((value: string) => {
    setScheduledStartState(value);
    setError(null);
  }, []);

  // Seed a sensible default when the picker opens without overwriting an
  // existing selection.
  const seedDefault = useCallback(() => {
    setScheduledStartState(
      (current) => current || getDefaultPostScheduledStart(timezone),
    );
  }, [timezone]);

  const confirmSchedule = useCallback((): boolean => {
    const result = validatePostScheduledStart(scheduledStart, timezone);

    if ('error' in result) {
      setError(result.error);
      return false;
    }

    setError(null);
    setIsScheduled(true);
    return true;
  }, [scheduledStart, timezone]);

  const clearSchedule = useCallback(() => {
    setIsScheduled(false);
    setError(null);
  }, []);

  const resolveScheduledAt = useCallback((): ResolvedScheduledAt => {
    if (!isScheduled) {
      return {};
    }

    const result = validatePostScheduledStart(scheduledStart, timezone);

    if ('error' in result) {
      setError(result.error);
      return { error: result.error };
    }

    return { iso: result.iso };
  }, [isScheduled, scheduledStart, timezone]);

  return {
    isScheduled,
    scheduledStart,
    timezone,
    error,
    setScheduledStart,
    seedDefault,
    confirmSchedule,
    clearSchedule,
    resolveScheduledAt,
  };
};
