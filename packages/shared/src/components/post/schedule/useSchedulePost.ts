import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthContext } from '../../../contexts/AuthContext';
import { DEFAULT_TIMEZONE } from '../../../lib/timezones';
import {
  formatScheduledAtInput,
  getDefaultPostScheduledStart,
  validatePostScheduledStart,
} from '../../../lib/scheduledPost';

export interface ResolvedScheduledAt {
  iso?: string;
  error?: string;
}

export interface UseSchedulePostProps {
  // When editing an already-scheduled post, seed the picker with its time.
  initialScheduledAt?: string | null;
  // Label for the clear action. Composer: "Publish now" (post immediately on
  // submit). Editor: "Cancel scheduling" (publish with edits on submit).
  clearLabel?: string;
}

export interface UseSchedulePost {
  isScheduled: boolean;
  scheduledStart: string;
  timezone: string;
  error: string | null;
  clearLabel: string;
  setScheduledStart: (value: string) => void;
  seedDefault: () => void;
  confirmSchedule: () => boolean;
  clearSchedule: () => void;
  resolveScheduledAt: () => ResolvedScheduledAt;
}

export const useSchedulePost = ({
  initialScheduledAt,
  clearLabel = 'Publish now',
}: UseSchedulePostProps = {}): UseSchedulePost => {
  const { user } = useAuthContext();
  const timezone = user?.timezone || DEFAULT_TIMEZONE;
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledStart, setScheduledStartState] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Seed once when an existing schedule becomes available (post loads async).
  // Wait for the user so we format against their real timezone, not the default
  // (seeding early would lock in a wrong-tz value that resolves to a wrong instant).
  const hasSeeded = useRef(false);
  useEffect(() => {
    if (hasSeeded.current || !initialScheduledAt || !user) {
      return;
    }

    hasSeeded.current = true;
    setScheduledStartState(
      formatScheduledAtInput(initialScheduledAt, timezone),
    );
    setIsScheduled(true);
  }, [initialScheduledAt, timezone, user]);

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
    clearLabel,
    setScheduledStart,
    seedDefault,
    confirmSchedule,
    clearSchedule,
    resolveScheduledAt,
  };
};
