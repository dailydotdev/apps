import { storageWrapper } from '../../lib/storageWrapper';

// What Patchy remembers about your day: a per-device, per-local-day tally of
// what you did. It resets when the local date changes. Nothing here is sent anywhere.
export const patchyActivities = [
  'read',
  'upvote',
  'bookmark',
  'streak_day',
] as const;
export type PatchyActivity = (typeof patchyActivities)[number];

export interface PatchyDay {
  day: string;
  reads: number;
  upvotes: number;
  bookmarks: number;
}

export const getPatchyDayKey = (now: Date): string =>
  `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

export const createPatchyDay = (now: Date): PatchyDay => ({
  day: getPatchyDayKey(now),
  reads: 0,
  upvotes: 0,
  bookmarks: 0,
});

const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

// Anything stored for another day, or broken, starts a fresh day.
export const parsePatchyDay = (raw: string | null, now: Date): PatchyDay => {
  const fresh = createPatchyDay(now);
  if (!raw) {
    return fresh;
  }
  try {
    const stored = JSON.parse(raw) as Partial<PatchyDay>;
    if (!stored || stored.day !== fresh.day) {
      return fresh;
    }
    return {
      day: fresh.day,
      reads: isCount(stored.reads) ? stored.reads : 0,
      upvotes: isCount(stored.upvotes) ? stored.upvotes : 0,
      bookmarks: isCount(stored.bookmarks) ? stored.bookmarks : 0,
    };
  } catch {
    return fresh;
  }
};

const counterFor: Partial<
  Record<
    PatchyActivity,
    keyof Pick<PatchyDay, 'reads' | 'upvotes' | 'bookmarks'>
  >
> = {
  read: 'reads',
  upvote: 'upvotes',
  bookmark: 'bookmarks',
};

// Pure: the day after one more activity.
export const addPatchyActivity = (
  day: PatchyDay,
  activity: PatchyActivity,
  now: Date,
): PatchyDay => {
  const base = day.day === getPatchyDayKey(now) ? day : createPatchyDay(now);
  const counter = counterFor[activity];
  const next: PatchyDay = { ...base };
  if (counter) {
    next[counter] = base[counter] + 1;
  }
  return next;
};

const storageKey = (userId: string) => `patchy_day:${userId}`;

export const readPatchyDay = (userId: string, now = new Date()): PatchyDay =>
  parsePatchyDay(storageWrapper.getItem(storageKey(userId)), now);

export const recordPatchyActivity = (
  userId: string,
  activity: PatchyActivity,
  now = new Date(),
): PatchyDay => {
  const next = addPatchyActivity(readPatchyDay(userId, now), activity, now);
  storageWrapper.setItem(storageKey(userId), JSON.stringify(next));
  return next;
};
