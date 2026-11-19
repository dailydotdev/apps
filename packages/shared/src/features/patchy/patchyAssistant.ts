import type { QueryClient } from '@tanstack/react-query';
import type { Post } from '../../graphql/posts';
import { storageWrapper } from '../../lib/storageWrapper';
import { getPatchyDayKey } from './patchyDay';

// Patchy as a companion: when he notices something, he offers one useful
// thing in a bubble. Everything here is the pure part (what to offer, when
// he is allowed to, what he remembers), so it is testable on its own.
export const patchyOfferKinds = [
  'follow_tag',
  'long_read',
  'finished',
  'streak_risk',
  'welcome_back',
] as const;
export type PatchyOfferKind = (typeof patchyOfferKinds)[number];

// Never more than this many suggestions in a day.
export const PATCHY_OFFERS_PER_DAY = 3;
// "Not now" this many times and he stops suggesting that kind of thing.
export const PATCHY_DISMISSALS_TO_MUTE = 2;
// Opening this many posts with one tag in a day makes it a suggestion.
export const PATCHY_TAG_OPENS_TO_SUGGEST = 3;
// Posts at least this long get the save-for-later offer.
export const PATCHY_LONG_READ_MINUTES = 15;
// Short enough to keep a streak alive in a minute or two.
export const PATCHY_QUICK_READ_MINUTES = 5;

export interface PatchyOfferMemory {
  day: string;
  shownToday: number;
  // Per kind: how many times you said "Not now" (all time).
  dismissed: Partial<Record<PatchyOfferKind, number>>;
  // Kinds you asked him to never suggest again.
  never: PatchyOfferKind[];
  // Kinds already offered today (each at most once a day).
  offeredToday: PatchyOfferKind[];
  // Tags opened today, and tags already suggested (never twice).
  tagOpens: Record<string, number>;
  suggestedTags: string[];
}

export const createPatchyOfferMemory = (now: Date): PatchyOfferMemory => ({
  day: getPatchyDayKey(now),
  shownToday: 0,
  dismissed: {},
  never: [],
  offeredToday: [],
  tagOpens: {},
  suggestedTags: [],
});

const isKind = (value: unknown): value is PatchyOfferKind =>
  patchyOfferKinds.includes(value as PatchyOfferKind);

const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

// The day-scoped parts reset when the date changes; what you told him
// (dismissals, never, suggested tags) is kept.
export const parsePatchyOfferMemory = (
  raw: string | null,
  now: Date,
): PatchyOfferMemory => {
  const fresh = createPatchyOfferMemory(now);
  if (!raw) {
    return fresh;
  }
  try {
    const stored = JSON.parse(raw) as Partial<PatchyOfferMemory>;
    const dismissed: PatchyOfferMemory['dismissed'] = {};
    Object.entries(stored?.dismissed ?? {}).forEach(([kind, count]) => {
      if (isKind(kind) && isCount(count)) {
        dismissed[kind] = count;
      }
    });
    const kept = {
      dismissed,
      never: Array.isArray(stored?.never) ? stored.never.filter(isKind) : [],
      suggestedTags: Array.isArray(stored?.suggestedTags)
        ? stored.suggestedTags.filter((tag) => typeof tag === 'string')
        : [],
    };
    if (stored?.day !== fresh.day) {
      return { ...fresh, ...kept };
    }
    const tagOpens: Record<string, number> = {};
    Object.entries(stored.tagOpens ?? {}).forEach(([tag, count]) => {
      if (isCount(count)) {
        tagOpens[tag] = count;
      }
    });
    return {
      ...fresh,
      ...kept,
      shownToday: isCount(stored.shownToday) ? stored.shownToday : 0,
      offeredToday: Array.isArray(stored.offeredToday)
        ? stored.offeredToday.filter(isKind)
        : [],
      tagOpens,
    };
  } catch {
    return fresh;
  }
};

export const canPatchyOffer = (
  memory: PatchyOfferMemory,
  kind: PatchyOfferKind,
): boolean =>
  memory.shownToday < PATCHY_OFFERS_PER_DAY &&
  !memory.never.includes(kind) &&
  !memory.offeredToday.includes(kind) &&
  (memory.dismissed[kind] ?? 0) < PATCHY_DISMISSALS_TO_MUTE;

export const withPatchyOfferShown = (
  memory: PatchyOfferMemory,
  kind: PatchyOfferKind,
  tag?: string,
): PatchyOfferMemory => ({
  ...memory,
  shownToday: memory.shownToday + 1,
  offeredToday: [...memory.offeredToday, kind],
  suggestedTags: tag ? [...memory.suggestedTags, tag] : memory.suggestedTags,
});

export const withPatchyOfferAnswer = (
  memory: PatchyOfferMemory,
  kind: PatchyOfferKind,
  answer: 'accept' | 'dismiss' | 'never' | 'ignore',
): PatchyOfferMemory => {
  if (answer === 'dismiss') {
    return {
      ...memory,
      dismissed: {
        ...memory.dismissed,
        [kind]: (memory.dismissed[kind] ?? 0) + 1,
      },
    };
  }
  if (answer === 'never' && !memory.never.includes(kind)) {
    return { ...memory, never: [...memory.never, kind] };
  }
  return memory;
};

// Counts the post's tags; returns the tag that just reached the threshold,
// unless you already follow or block it or he suggested it before.
export const countPatchyTagOpen = (
  memory: PatchyOfferMemory,
  tags: string[] | undefined,
  { followed, blocked }: { followed: string[]; blocked: string[] },
): { memory: PatchyOfferMemory; tag: string | null } => {
  const tagOpens = { ...memory.tagOpens };
  let tag: string | null = null;
  (tags ?? []).forEach((rawTag) => {
    const key = rawTag.toLowerCase();
    tagOpens[key] = (tagOpens[key] ?? 0) + 1;
    if (
      !tag &&
      tagOpens[key] === PATCHY_TAG_OPENS_TO_SUGGEST &&
      !followed.some((value) => value.toLowerCase() === key) &&
      !blocked.some((value) => value.toLowerCase() === key) &&
      !memory.suggestedTags.includes(key)
    ) {
      tag = key;
    }
  });
  return { memory: { ...memory, tagOpens }, tag };
};

const memoryKey = (userId: string) => `patchy_offers:${userId}`;

export const readPatchyOfferMemory = (
  userId: string,
  now = new Date(),
): PatchyOfferMemory =>
  parsePatchyOfferMemory(storageWrapper.getItem(memoryKey(userId)), now);

export const writePatchyOfferMemory = (
  userId: string,
  memory: PatchyOfferMemory,
): void => storageWrapper.setItem(memoryKey(userId), JSON.stringify(memory));

export type PatchyQuickRead = Pick<
  Post,
  'id' | 'title' | 'readTime' | 'commentsPermalink' | 'image'
> & { source?: Post['source']; numUpvotes?: number };

const isPostLike = (value: unknown): value is Post & { readTime: number } => {
  const post = value as Post;
  return (
    !!post &&
    typeof post === 'object' &&
    typeof post.id === 'string' &&
    typeof post.title === 'string' &&
    typeof post.commentsPermalink === 'string' &&
    typeof post.readTime === 'number'
  );
};

// Short, unread posts from feeds the app already loaded (no extra request),
// best first. Walks the cached query data a few levels deep, because feeds
// nest posts as pages → edges → node.
export const getPatchyQuickReads = (
  client: QueryClient,
  { limit = 3, excludeId }: { limit?: number; excludeId?: string } = {},
): PatchyQuickRead[] => {
  const found = new Map<string, Post>();
  const visit = (value: unknown, depth: number) => {
    if (!value || typeof value !== 'object' || depth > 6) {
      return;
    }
    if (isPostLike(value)) {
      if (
        value.readTime > 0 &&
        value.readTime <= PATCHY_QUICK_READ_MINUTES &&
        !value.read &&
        value.id !== excludeId
      ) {
        found.set(value.id, value);
      }
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => visit(item, depth + 1));
      return;
    }
    Object.values(value).forEach((item) => visit(item, depth + 1));
  };
  client
    .getQueryCache()
    .getAll()
    .forEach((query) => visit(query.state.data, 0));
  return [...found.values()]
    .sort((a, b) => (b.numUpvotes ?? 0) - (a.numUpvotes ?? 0))
    .slice(0, limit)
    .map(
      ({
        id,
        title,
        readTime,
        commentsPermalink,
        image,
        source,
        numUpvotes,
      }) => ({
        id,
        title,
        readTime,
        commentsPermalink,
        image,
        source,
        numUpvotes,
      }),
    );
};

// While a suggestion is on screen, his reaction peeks wait.
let isOfferOpen = false;
export const setPatchyOfferOpen = (open: boolean): void => {
  isOfferOpen = open;
};
export const isPatchyOfferOpen = (): boolean => isOfferOpen;

// While a reaction peek is on screen, suggestions wait.
let isPeeking = false;
export const setPatchyPeeking = (peeking: boolean): void => {
  isPeeking = peeking;
};
export const isPatchyPeeking = (): boolean => isPeeking;
