import type { StreakRingState } from '../../hooks/streaks/useStreakRingState';
import type { PatchyFace, PatchyPose } from './patchyAssets';

export type PatchyTrigger =
  | 'upvote'
  | 'bookmark'
  | 'streak_day'
  | 'late_night'
  | 'friday_deploy'
  | 'welcome_back';

export type PatchyEmote = 'hearts' | 'dots' | 'sparkle' | 'moon' | 'sweat';

export interface PatchyPeekConfig {
  pose: PatchyPose;
  emote: PatchyEmote;
  // The icon face while (and right after) he peeks.
  face: PatchyFace;
  // Higher wins when two triggers compete for the single pending slot.
  priority: number;
  // A pending peek that could not show (scrolling, a modal) goes stale after
  // this long: a hearts peek three minutes after the upvote reads as random.
  ttlMs: number;
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;

export const patchyPeeks: Record<PatchyTrigger, PatchyPeekConfig> = {
  upvote: {
    pose: 'wave',
    emote: 'hearts',
    face: 'happy',
    priority: 1,
    ttlMs: 20 * SECOND,
  },
  bookmark: {
    pose: 'sideeye',
    emote: 'dots',
    face: 'sideeye',
    priority: 1,
    ttlMs: 20 * SECOND,
  },
  // Usually lands while the post modal is open, so it waits for it to close.
  streak_day: {
    pose: 'bone',
    emote: 'sparkle',
    face: 'happy',
    priority: 3,
    ttlMs: 10 * MINUTE,
  },
  late_night: {
    pose: 'heavy',
    emote: 'moon',
    face: 'heavy',
    priority: 2,
    ttlMs: 5 * MINUTE,
  },
  friday_deploy: {
    pose: 'wave',
    emote: 'sweat',
    face: 'sideeye',
    priority: 2,
    ttlMs: 5 * MINUTE,
  },
  welcome_back: {
    pose: 'wave',
    emote: 'hearts',
    face: 'happy',
    priority: 4,
    ttlMs: 10 * MINUTE,
  },
};

// 01:00 up to 05:00 in the browser's local time.
export const LATE_NIGHT_START_HOUR = 1;
export const LATE_NIGHT_END_HOUR = 5;

export const isLateNight = (now: Date): boolean => {
  const hour = now.getHours();
  return hour >= LATE_NIGHT_START_HOUR && hour < LATE_NIGHT_END_HOUR;
};

// The "night" a late read belongs to, so the peek shows once per night.
export const getNightKey = (now: Date): string =>
  `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

// Friday 12:00 up to 18:00 local.
const FRIDAY = 5;
export const FRIDAY_AFTERNOON_START_HOUR = 12;
export const FRIDAY_AFTERNOON_END_HOUR = 18;

export const DEPLOY_TAGS = new Set([
  'deploy',
  'deployment',
  'devops',
  'cicd',
  'ci-cd',
  'continuous-delivery',
  'continuous-deployment',
  'continuous-integration',
]);

export const isFridayDeploy = (now: Date, tags?: string[]): boolean => {
  if (now.getDay() !== FRIDAY) {
    return false;
  }
  const hour = now.getHours();
  if (hour < FRIDAY_AFTERNOON_START_HOUR || hour >= FRIDAY_AFTERNOON_END_HOUR) {
    return false;
  }
  return !!tags?.some((tag) => DEPLOY_TAGS.has(tag.toLowerCase()));
};

export const AWAY_MS = 2 * 24 * 60 * MINUTE;

// Away = the last counted read was 2+ days ago and nothing today yet.
export const isAway = (
  lastViewAt: Date | string | undefined | null,
  hasReadToday: boolean,
  now: Date,
): boolean => {
  if (!lastViewAt || hasReadToday) {
    return false;
  }
  const last = new Date(lastViewAt).getTime();
  if (Number.isNaN(last)) {
    return false;
  }
  return now.getTime() - last >= AWAY_MS;
};

export type PatchyMood = 'happy' | 'ready' | 'sleepy' | 'resting' | 'away';

interface PatchyMoodInput {
  state: StreakRingState;
  hasReadToday: boolean;
  lastViewAt?: Date | string | null;
  now: Date;
}

// Never sad, never guilt: the worst he gets is asleep.
export const getPatchyMood = ({
  state,
  hasReadToday,
  lastViewAt,
  now,
}: PatchyMoodInput): PatchyMood => {
  if (isAway(lastViewAt, hasReadToday, now)) {
    return 'away';
  }
  if (isLateNight(now)) {
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

export const patchyFaceByMood: Record<PatchyMood, PatchyFace> = {
  happy: 'happy',
  ready: 'awake',
  sleepy: 'heavy',
  resting: 'asleep',
  away: 'asleep',
};

export const patchyMoodCopy: Record<PatchyMood, string> = {
  happy: 'Happy you stopped by today',
  ready: 'Ready when you are',
  sleepy: 'Getting sleepy',
  resting: 'Rest day, napping',
  away: 'Gone fishing. Glad you are back',
};

export const patchyMoodLabel: Record<PatchyMood, string> = {
  happy: 'delighted',
  ready: 'curious',
  sleepy: 'sleepy',
  resting: 'napping',
  away: 'gone fishing',
};
