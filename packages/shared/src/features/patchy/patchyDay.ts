import { useEffect, useState } from 'react';
import { storageWrapper } from '../../lib/storageWrapper';

// What Patchy remembers about your day: a per-device, per-local-day tally of
// what you did. It resets when the local date changes. Nothing here is sent anywhere.
export const patchyActivities = [
  'read',
  'upvote',
  'bookmark',
  'streak_day',
  'pet',
  'treat',
] as const;
export type PatchyActivity = (typeof patchyActivities)[number];

export interface PatchyDay {
  day: string;
  reads: number;
  upvotes: number;
  bookmarks: number;
  pets: number;
  treatGiven: boolean;
}

export const getPatchyDayKey = (now: Date): string =>
  `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

export const createPatchyDay = (now: Date): PatchyDay => ({
  day: getPatchyDayKey(now),
  reads: 0,
  upvotes: 0,
  bookmarks: 0,
  pets: 0,
  treatGiven: false,
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
      pets: isCount(stored.pets) ? stored.pets : 0,
      treatGiven: stored.treatGiven === true,
    };
  } catch {
    return fresh;
  }
};

const counterFor: Partial<
  Record<
    PatchyActivity,
    keyof Pick<PatchyDay, 'reads' | 'upvotes' | 'bookmarks' | 'pets'>
  >
> = {
  read: 'reads',
  upvote: 'upvotes',
  bookmark: 'bookmarks',
  pet: 'pets',
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
  if (activity === 'treat') {
    next.treatGiven = true;
  }
  return next;
};

const storageKey = (userId: string) => `patchy_day:${userId}`;

type Listener = (day: PatchyDay) => void;
const listeners = new Set<Listener>();

export const readPatchyDay = (userId: string, now = new Date()): PatchyDay =>
  parsePatchyDay(storageWrapper.getItem(storageKey(userId)), now);

export const recordPatchyActivity = (
  userId: string,
  activity: PatchyActivity,
  now = new Date(),
): PatchyDay => {
  const next = addPatchyActivity(readPatchyDay(userId, now), activity, now);
  storageWrapper.setItem(storageKey(userId), JSON.stringify(next));
  listeners.forEach((listener) => listener(next));
  return next;
};

// The day as it is now, kept in sync with activity recorded anywhere on the
// page (the rail records, the den reads).
export const usePatchyDay = (userId: string | undefined): PatchyDay => {
  const [day, setDay] = useState<PatchyDay>(() =>
    userId ? readPatchyDay(userId) : createPatchyDay(new Date()),
  );
  useEffect(() => {
    if (!userId) {
      return undefined;
    }
    setDay(readPatchyDay(userId));
    const listener: Listener = (next) => setDay(next);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, [userId]);
  return day;
};

// One line under the den: what Patchy thinks of your day so far.
export const getPatchyQuip = (
  day: Pick<PatchyDay, 'reads' | 'upvotes' | 'bookmarks' | 'pets'>,
  streak: number,
): string => {
  if (day.bookmarks >= 3 && day.bookmarks > day.reads) {
    return `${day.bookmarks} saved for later, ${day.reads} read. I see you.`;
  }
  if (day.upvotes >= 3) {
    return `${day.upvotes} upvotes today. Generous mood!`;
  }
  if (day.reads >= 5) {
    return `${day.reads} posts today. Are you speedrunning the feed?`;
  }
  if (day.pets >= 5) {
    return 'OK, OK. You can stop petting me now. (Don’t.)';
  }
  if (streak >= 7) {
    return `${streak} days in a row. We make a good team.`;
  }
  if (day.reads > 0) {
    return 'Good start. One more?';
  }
  return 'Quiet day so far. I’m saving you a spot.';
};
