import type { QueryClient } from '@tanstack/react-query';
import { utcToZonedTime } from 'date-fns-tz';
import type { Post, PostData } from '../../graphql/posts';
import { SharedFeedPage } from '../../components/utilities/common';
import { getPostByIdKey, OtherFeedPage, RequestKey } from '../../lib/query';
import { DEFAULT_TIMEZONE } from '../../lib/timezones';
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
  // Tags opened today (each post counted once), and tags already suggested
  // (never twice).
  tagOpens: Record<string, number>;
  countedPosts: string[];
  suggestedTags: string[];
}

export const createPatchyOfferMemory = (now: Date): PatchyOfferMemory => ({
  day: getPatchyDayKey(now),
  shownToday: 0,
  dismissed: {},
  never: [],
  offeredToday: [],
  tagOpens: {},
  countedPosts: [],
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
      countedPosts: Array.isArray(stored.countedPosts)
        ? stored.countedPosts.filter((id) => typeof id === 'string')
        : [],
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

// Counts the post's tags, once per post a day; returns the tag that just
// reached the threshold, unless you already follow or block it or he
// suggested it before.
export const countPatchyTagOpen = (
  memory: PatchyOfferMemory,
  postId: string,
  tags: string[] | undefined,
  { followed, blocked }: { followed: string[]; blocked: string[] },
): { memory: PatchyOfferMemory; tag: string | null } => {
  if (memory.countedPosts.includes(postId)) {
    return { memory, tag: null };
  }
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
  return {
    memory: {
      ...memory,
      tagOpens,
      countedPosts: [...memory.countedPosts, postId],
    },
    tag,
  };
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

// The whole cached post, so it can open in the post modal.
export type PatchyQuickRead = Post;

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

// The feeds he picks from: yours, explore, tags, sources and bookmarks. Not
// search, squads, other people's profiles or related posts.
const quickReadFeeds = new Set<string>([
  SharedFeedPage.MyFeed,
  SharedFeedPage.Popular,
  SharedFeedPage.Upvoted,
  SharedFeedPage.Custom,
  OtherFeedPage.Following,
  OtherFeedPage.Explore,
  OtherFeedPage.ExploreLatest,
  OtherFeedPage.ExploreDiscussed,
  OtherFeedPage.ExploreUpvoted,
  RequestKey.Bookmarks,
  RequestKey.TagFeed,
  RequestKey.TagsMostUpvoted,
  RequestKey.TagsBestDiscussed,
  RequestKey.SourceFeed,
  RequestKey.SourceMostUpvoted,
  RequestKey.SourceBestDiscussed,
]);

// Short, unread posts from feeds the app already loaded (no extra request),
// best first. Walks the cached query data a few levels deep, because feeds
// nest posts as pages → edges → node.
interface QuickReadOptions {
  limit?: number;
  excludeId?: string;
  // Only posts with this tag.
  tag?: string;
  // Only posts you saved for later.
  isBookmarked?: boolean;
}

export const getPatchyQuickReads = (
  client: QueryClient,
  { limit = 3, excludeId, tag, isBookmarked }: QuickReadOptions = {},
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
        value.read === false &&
        value.id !== excludeId &&
        (!tag || !!value.tags?.some((postTag) => postTag === tag)) &&
        (!isBookmarked || !!value.bookmarked)
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
    .findAll({
      predicate: ({ queryKey }) => quickReadFeeds.has(String(queryKey[0])),
    })
    .forEach((query) => visit(query.state.data, 0));
  return [...found.values()]
    .sort((a, b) => (b.numUpvotes ?? 0) - (a.numUpvotes ?? 0))
    .slice(0, limit);
};

// The post you have open, for the Streak panel's menu to offer things about
// it. Set by the assistant's reading session.
let readingPost: Partial<Post> | null = null;
export const setPatchyReadingPost = (post: Partial<Post> | null): void => {
  readingPost = post;
};
export const getPatchyReadingPost = (): Partial<Post> | null => readingPost;

// The post as it is now: the open post's query is kept up to date by
// bookmarks and votes made anywhere, the snapshot from when it opened is not.
export const getPatchyCurrentPost = (
  client: QueryClient,
  post: Partial<Post>,
): Partial<Post> => {
  const cached = post.id
    ? client.getQueryData<PostData>(getPostByIdKey(post.id))?.post
    : undefined;
  return cached ? { ...post, ...cached } : post;
};

// Whole hours (at least one) until the streak day ends in the profile
// timezone.
export const getPatchyHoursLeftToday = (
  now: Date,
  timezone?: string,
): number => {
  const zoned = utcToZonedTime(now, timezone || DEFAULT_TIMEZONE);
  const minutesLeft =
    24 * 60 -
    (zoned.getHours() * 60 + zoned.getMinutes()) -
    zoned.getSeconds() / 60;
  return Math.max(1, Math.ceil(minutesLeft / 60));
};
