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

// Short, punchy earn pop (~0.3s strike + rebound), then the tile snaps back to
// its read-today look with no lingering hold.
const CELEBRATION_MS = 400;
const AT_RISK_HOURS = 6;
const CRITICAL_HOURS = 2;
const TICK_MS = 5 * 60 * 1000;

// The streak component is two layers: an outer border (frame) outlining the
// whole thing — avatar + bottom tab — and a separate inner background fill.
// Default states are just a slim coloured border with a transparent inside;
// only at-risk/critical add a faint colour fill that opacity-pulses (more/less
// visible) so danger reads as an ambient glow, not a solid block.
// Outer border (frame). Calm states (pending/safe/rest) wear a soft gray
// (border-subtlest-tertiary) — a touch more visible than the rail/panel
// separator so the ring reads against the dark surface. `new` and `at_risk` are dashed (gray /
// static amber). Critical is dashed red that gently breathes (opacity pulse) in
// sync with its fill — the escalation cue beyond at_risk's static amber. Rest
// day keeps the calm gray border; its frozen identity is the fill + flame/
// number colour. The earn celebration briefly flashes the brand pink.
export const frameClassByState: Record<StreakRingState, string> = {
  none: 'border-dashed border-border-subtlest-tertiary',
  pending: 'border-border-subtlest-tertiary',
  safe: 'border-border-subtlest-tertiary',
  // Earn: only the border animates — it pops bigger while shifting gray -> pink,
  // then settles back to default size (see streak-earn-border keyframe).
  celebration: 'animate-streak-earn-border border-accent-bacon-default',
  at_risk: 'border-dashed border-status-warning',
  critical: 'animate-streak-border-pulse border-dashed border-status-error',
  freeze: 'border-border-subtlest-tertiary',
};

// Inner background fill. Transparent by default; a faint, opacity-pulsing tint
// when at risk (`opacity-*` is the resting faintness + reduced-motion
// fallback). Critical pulses harder + wider (more prominent animation, not a
// heavier static block). Rest day is a static faint blue (frozen). The earn
// celebration is a solid brand-pink fill (V1 style).
export const fillClassByState: Record<StreakRingState, string> = {
  none: 'bg-transparent',
  pending: 'bg-transparent',
  safe: 'bg-transparent',
  // Earn: the background stays clear while the border pops, then fades to pink
  // on the way back (no size change) — see streak-earn-fill keyframe.
  celebration: 'animate-streak-earn-fill',
  at_risk: 'animate-streak-fade bg-status-warning opacity-20',
  critical: 'animate-streak-pulse bg-status-error opacity-40',
  freeze: 'bg-accent-blueCheese-flat',
};

// The earn pop now scales the border only (streak-earn-border), not the whole
// surround, so no surround-level animation is needed any more.
export const popClassByState: Record<StreakRingState, string> = {
  none: '',
  pending: '',
  safe: '',
  celebration: '',
  at_risk: '',
  critical: '',
  freeze: '',
};

// Count + flame colour. Not-read is muted gray; once you've read today the
// flame turns brand pink (and fills, via `secondary={hasReadToday}`).
// At-risk/critical use the state colour, rest day blue, earn flash white.
export const countClassByState: Record<StreakRingState, string> = {
  none: 'text-text-quaternary',
  pending: 'text-text-tertiary',
  safe: 'text-accent-bacon-default',
  // Earn shares the read-today pink for the flame + number.
  celebration: 'text-accent-bacon-default',
  at_risk: 'text-status-warning',
  critical: 'text-status-error',
  freeze: 'text-accent-blueCheese-default',
};

export interface StreakRingInfo {
  isEnabled: boolean;
  // Streak data still loading — render a same-size skeleton, no real state yet.
  isLoading: boolean;
  streak?: UserStreak;
  state: StreakRingState;
  // Outer border that outlines the whole component (dashed/solid + colour).
  frameClassName: string;
  // Inner background fill colour.
  fillClassName: string;
  // Scale-pop animation for the surround group (background only).
  popClassName: string;
  // Contrast-safe text/flame colour for the count on that fill.
  countClassName: string;
  count: number;
  hasReadToday: boolean;
  copy: string;
  // at_risk | critical — drives the urgent chip border + auto-opens the tooltip
  // (the caller keeps it open until the user hovers the streak).
  isUrgent: boolean;
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
  const { isEnabled, isLoading, streak, count, hasReadToday, isAtRisk } =
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
    // Wait for the streak data to load before tracking. Otherwise the
    // loading -> loaded settle of `hasReadToday` (false -> true) would replay
    // the pop on every refresh even though the streak was earned earlier. Only
    // once loaded does the first value set the baseline (prev === null).
    if (!isEnabled || isLoading) {
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
  }, [isEnabled, isLoading, hasReadToday]);

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

  return {
    isEnabled,
    isLoading,
    streak,
    state,
    frameClassName: frameClassByState[state],
    fillClassName: fillClassByState[state],
    popClassName: popClassByState[state],
    countClassName: countClassByState[state],
    count,
    hasReadToday,
    copy: getCopy(state, count),
    isUrgent: state === 'at_risk' || state === 'critical',
  };
};
