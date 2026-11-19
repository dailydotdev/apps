import type { StreakRingState } from '../../hooks/streaks/useStreakRingState';
import type {
  PatchyConfig,
  PatchyHourWindow,
  PatchyMood,
  PatchyTrigger,
} from './patchyConfig';

// The day a window that `now` falls in opened, or null outside it. A window
// whose start is after its end wraps past midnight (23 to 3), so its early
// hours belong to the previous day.
const getWindowStartDay = (
  now: Date,
  { startHour, endHour }: PatchyHourWindow,
): Date | null => {
  const hour = now.getHours();
  if (startHour < endHour) {
    return hour >= startHour && hour < endHour ? now : null;
  }
  if (hour >= startHour) {
    return now;
  }
  if (hour < endHour) {
    const previousDay = new Date(now);
    previousDay.setDate(now.getDate() - 1);
    return previousDay;
  }
  return null;
};

export const isLateNight = (now: Date, window: PatchyHourWindow): boolean =>
  getWindowStartDay(now, window) !== null;

// The night a late read belongs to, so the yawn plays once per night even
// when the window wraps past midnight.
export const getNightKey = (now: Date, window: PatchyHourWindow): string => {
  const day = getWindowStartDay(now, window) ?? now;
  return `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`;
};

const FRIDAY = 5;

export const isFridayDeploy = (
  now: Date,
  tags: string[] | undefined,
  { tags: deployTags, ...window }: PatchyConfig['fridayDeploy'],
): boolean => {
  if (getWindowStartDay(now, window)?.getDay() !== FRIDAY) {
    return false;
  }
  const deploy = new Set(deployTags.map((tag) => tag.toLowerCase()));
  return !!tags?.some((tag) => deploy.has(tag.toLowerCase()));
};

// Away = the last counted read is older than `awayMs` and nothing today yet.
export const isAway = (
  lastViewAt: Date | string | undefined | null,
  hasReadToday: boolean,
  now: Date,
  awayMs: number,
): boolean => {
  if (!lastViewAt || hasReadToday) {
    return false;
  }
  const last = new Date(lastViewAt).getTime();
  if (Number.isNaN(last)) {
    return false;
  }
  return now.getTime() - last >= awayMs;
};

interface PatchyMoodInput {
  state: StreakRingState;
  hasReadToday: boolean;
  lastViewAt?: Date | string | null;
  now: Date;
  config: PatchyConfig;
}

// Never sad, never guilt: the worst he gets is asleep.
export const getPatchyMood = ({
  state,
  hasReadToday,
  lastViewAt,
  now,
  config,
}: PatchyMoodInput): PatchyMood => {
  if (isAway(lastViewAt, hasReadToday, now, config.awayMs)) {
    return 'away';
  }
  if (isLateNight(now, config.lateNight)) {
    return 'sleepy';
  }
  if (state === 'freeze') {
    return 'resting';
  }
  if (hasReadToday || state === 'celebration') {
    return 'happy';
  }
  return 'ready';
};

// Repeating the same action in one day escalates: the third upvote or
// bookmark of the day (and every fifth after that) gets the bigger reaction.
export const PATCHY_ESCALATE_AT = 3;
const PATCHY_ESCALATE_EVERY = 5;

const isEscalation = (count: number): boolean =>
  count === PATCHY_ESCALATE_AT ||
  (count > PATCHY_ESCALATE_AT &&
    (count - PATCHY_ESCALATE_AT) % PATCHY_ESCALATE_EVERY === 0);

export const getActionTrigger = (
  action: 'upvote' | 'bookmark',
  countToday: number,
): PatchyTrigger => {
  if (!isEscalation(countToday)) {
    return action;
  }
  return action === 'upvote' ? 'on_a_roll' : 'bookmark_pile';
};
