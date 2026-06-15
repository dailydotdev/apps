import { useEffect, useRef, useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useReadingStreakSummary } from './useReadingStreakSummary';
import { DEFAULT_TIMEZONE, dateFormatInTimezone } from '../../lib/timezones';
import type { UserStreak } from '../../graphql/users';

export type StreakRingState =
  | 'none'
  | 'pending'
  | 'safe'
  | 'celebration'
  | 'at_risk'
  | 'critical'
  | 'freeze';

const CELEBRATION_MS = 1800;
const AT_RISK_HOURS = 6;
const CRITICAL_HOURS = 2;
const TICK_MS = 5 * 60 * 1000;
// How long the urgency tooltip auto-surfaces when the streak first turns
// critical, before reverting to hover-only.
const CRITICAL_TOOLTIP_MS = 5000;

// Variable ring classes per state, applied to a 3px border overlay around the
// avatar (the base `-inset-[3px] rounded-[15px] border-[3px]` keeps it
// concentric with the rounded-12 image). Healthy states are a solid streak-pink
// ring; at-risk/critical/milestone fray into dashes in a non-streak colour so
// danger never reads as the pink streak.
const ringClassByState: Record<StreakRingState, string> = {
  none: 'border-dashed border-border-subtlest-secondary',
  // Pending is intentionally static (no pulse) — no early-day nagging.
  pending: 'border-accent-bacon-default',
  safe: 'border-accent-bacon-default',
  celebration: 'animate-reward-pop border-accent-bacon-default',
  at_risk: 'animate-streak-breathe border-dashed border-status-warning',
  critical: 'animate-streak-breathe-fast border-dashed border-status-error',
  freeze: 'border-accent-blueCheese-default',
};

export interface StreakRingInfo {
  isEnabled: boolean;
  streak?: UserStreak;
  state: StreakRingState;
  ringClassName: string;
  count: number;
  hasReadToday: boolean;
  copy: string;
  // at_risk | critical — drives the urgent chip border + tooltip emphasis.
  isUrgent: boolean;
  // True briefly when the streak first turns critical, to auto-open the
  // urgency tooltip; reverts to hover-only after.
  autoOpenTooltip: boolean;
}

const getCopy = (state: StreakRingState, count: number): string => {
  switch (state) {
    case 'pending':
      return `You haven't read today — keep your ${count}-day streak going.`;
    case 'safe':
      return `${count}-day reading streak.`;
    case 'celebration':
      return `Streak extended — ${count} days!`;
    case 'at_risk':
      return `Your ${count}-day streak ends tonight — read 1 post to keep it.`;
    case 'critical':
      return `Last chance — read 1 post to save your ${count}-day streak.`;
    case 'freeze':
      return 'Rest day — your streak is safe.';
    default:
      return 'Read a post to start your reading streak.';
  }
};

// Derives the avatar streak-ring state from the live streak data + the user's
// local time of day (for the pending -> at-risk -> critical escalation) and a
// one-off celebration when today's first read lands. See useStreakRingState
// callers (the rail avatar).
export const useStreakRingState = (): StreakRingInfo => {
  const { user } = useAuthContext();
  const { isEnabled, streak, count, hasReadToday, isAtRisk } =
    useReadingStreakSummary();
  const timezone = user?.timezone ?? DEFAULT_TIMEZONE;

  // Re-render every few minutes so the time-of-day escalation stays current.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((tick) => tick + 1), TICK_MS);
    return () => clearInterval(id);
  }, []);

  // One-off celebration the moment today's first read lands (false -> true).
  const [isCelebrating, setIsCelebrating] = useState(false);
  const prevReadRef = useRef<boolean | null>(null);
  useEffect(() => {
    // Wait for the streak data to load before tracking. Otherwise a page
    // refresh — where `hasReadToday` settles from false (loading) to true
    // (loaded) — would replay the pop even though the streak was earned
    // earlier. The first loaded value just sets the baseline (prev === null).
    if (!isEnabled) {
      return undefined;
    }
    const prev = prevReadRef.current;
    prevReadRef.current = hasReadToday;
    if (prev === false && hasReadToday) {
      setIsCelebrating(true);
      const timeout = setTimeout(() => setIsCelebrating(false), CELEBRATION_MS);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [isEnabled, hasReadToday]);

  const hour = parseInt(dateFormatInTimezone(new Date(), 'HH', timezone), 10);
  const hoursLeft = Number.isNaN(hour) ? 24 : 24 - hour;

  const state: StreakRingState = (() => {
    if (isCelebrating) {
      return 'celebration';
    }
    if (!isEnabled || (count === 0 && !hasReadToday)) {
      return 'none';
    }
    if (hasReadToday) {
      return 'safe';
    }
    // Not read today: weekends/freeze days aren't at risk (summary already
    // accounts for the timezone + week start).
    if (!isAtRisk) {
      return 'freeze';
    }
    if (hoursLeft <= CRITICAL_HOURS) {
      return 'critical';
    }
    if (hoursLeft <= AT_RISK_HOURS) {
      return 'at_risk';
    }
    return 'pending';
  })();

  // Auto-surface the urgency tooltip once when the streak first turns critical.
  const [autoOpenTooltip, setAutoOpenTooltip] = useState(false);
  const prevStateRef = useRef<StreakRingState | null>(null);
  useEffect(() => {
    const prev = prevStateRef.current;
    prevStateRef.current = state;
    if (prev !== 'critical' && state === 'critical') {
      setAutoOpenTooltip(true);
      const timeout = setTimeout(
        () => setAutoOpenTooltip(false),
        CRITICAL_TOOLTIP_MS,
      );
      return () => clearTimeout(timeout);
    }
    if (state !== 'critical') {
      setAutoOpenTooltip(false);
    }
    return undefined;
  }, [state]);

  return {
    isEnabled,
    streak,
    state,
    ringClassName: ringClassByState[state],
    count,
    hasReadToday,
    copy: getCopy(state, count),
    isUrgent: state === 'at_risk' || state === 'critical',
    autoOpenTooltip,
  };
};
