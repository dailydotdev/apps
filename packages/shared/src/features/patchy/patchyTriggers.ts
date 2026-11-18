import type { StreakRingState } from '../../hooks/streaks/useStreakRingState';
import type {
  PatchyConfig,
  PatchyHourWindow,
  PatchyMood,
} from './patchyConfig';

const isInWindow = (hour: number, { startHour, endHour }: PatchyHourWindow) =>
  hour >= startHour && hour < endHour;

export const isLateNight = (now: Date, window: PatchyHourWindow): boolean =>
  isInWindow(now.getHours(), window);

// The "night" a late read belongs to, so the peek shows once per night.
export const getNightKey = (now: Date): string =>
  `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

const FRIDAY = 5;

export const isFridayDeploy = (
  now: Date,
  tags: string[] | undefined,
  { tags: deployTags, ...window }: PatchyConfig['fridayDeploy'],
): boolean =>
  now.getDay() === FRIDAY &&
  isInWindow(now.getHours(), window) &&
  !!tags?.some((tag) => deployTags.includes(tag.toLowerCase()));

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
