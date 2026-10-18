import type { RawPost } from './raw';
import { rawPosts } from './raw';

// A reader's three weeks on daily.dev, built from real posts. Reading comes
// in sessions (a few posts back to back), the way the analytics show people
// actually read; every layout reads this one history.

const NOW = new Date(2026, 9, 12, 14, 30);

export type Vote = 'up' | 'down' | null;

export interface HistoryItem extends RawPost {
  /** Unique per read: the same post can be read twice. */
  key: string;
  readAt: Date;
  sessionId: string;
  vote: Vote;
  bookmarked: boolean;
}

/** [days ago, hour, minute, posts in the session] */
const sessions: [number, number, number, number][] = [
  [0, 13, 52, 4],
  [0, 9, 14, 3],
  [1, 22, 5, 5],
  [1, 8, 40, 3],
  [2, 12, 10, 4],
  [3, 21, 30, 2],
  [3, 9, 2, 4],
  [4, 19, 45, 3],
  [6, 10, 20, 5],
  [7, 8, 55, 3],
  [8, 23, 10, 4],
  [9, 13, 0, 3],
  [10, 9, 30, 4],
  [13, 20, 15, 5],
  [14, 9, 5, 3],
  [16, 12, 45, 4],
  [18, 8, 20, 2],
  [20, 21, 40, 3],
  [21, 19, 10, 5],
];

const dayOf = (date: Date): string => date.toDateString();

/**
 * Tops a day's videos up to `size` by moving older videos into one of its
 * sessions, right after the session's last read. Videos already on the
 * days in `keep` stay where they are.
 */
const fillVideos = (
  items: HistoryItem[],
  sessionId: string,
  size: number,
  keep: Set<string>,
): HistoryItem[] => {
  const session = items.filter((item) => item.sessionId === sessionId);
  const last = session[session.length - 1];
  if (!last) {
    return items;
  }
  const day = dayOf(last.readAt);
  const have = items.filter(
    (item) => item.type === 'video' && dayOf(item.readAt) === day,
  ).length;
  const moved = new Map(
    items
      .filter((item) => item.type === 'video' && !keep.has(dayOf(item.readAt)))
      .slice(-Math.max(0, size - have))
      .map((item, index) => {
        const readAt = new Date(
          last.readAt.getTime() - (index + 1) * 6 * 60_000,
        );
        return [
          item.key,
          {
            ...item,
            readAt,
            key: `${item.id}-${readAt.getTime()}`,
            sessionId,
          },
        ];
      }),
  );
  return items
    .map((item) => moved.get(item.key) ?? item)
    .sort((a, b) => b.readAt.getTime() - a.readAt.getTime());
};

/**
 * Today has three videos, and yesterday night was a binge of eight, so one
 * day shows the videos row at full length. Older videos move in to make up
 * the numbers; the rest of the history keeps its rhythm.
 */
const withVideoDays = (items: HistoryItem[]): HistoryItem[] => {
  const today = dayOf(NOW);
  const yesterday = new Date(NOW);
  yesterday.setDate(yesterday.getDate() - 1);
  const keep = new Set([today, dayOf(yesterday)]);
  return fillVideos(fillVideos(items, 's0', 3, keep), 's2', 8, keep);
};

const build = (): HistoryItem[] => {
  const items: HistoryItem[] = [];
  let cursor = 0;
  sessions.forEach(([daysAgo, hour, minute, size], sessionIndex) => {
    const start = new Date(NOW);
    start.setDate(start.getDate() - daysAgo);
    start.setHours(hour, minute, 0, 0);
    for (let i = 0; i < size && cursor < rawPosts.length; i += 1) {
      const post = rawPosts[cursor];
      // Newest read first inside a session too.
      const readAt = new Date(start.getTime() - i * 6 * 60_000);
      const seed = cursor * 7 + 3;
      items.push({
        ...post,
        key: `${post.id}-${readAt.getTime()}`,
        readAt,
        sessionId: `s${sessionIndex}`,
        vote: seed % 5 === 0 ? 'up' : null,
        bookmarked: seed % 9 === 1,
      });
      cursor += 1;
    }
  });
  return withVideoDays(items);
};

export const history: HistoryItem[] = build();

/* ---------------------------------------------------------------- dates */

const startOfDay = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const daysAgo = (date: Date): number =>
  Math.round((startOfDay(NOW) - startOfDay(date)) / 86_400_000);

/** Production's ReadHistory format: Today, Yesterday, then weekday + date. */
const dayLabel = (date: Date): string => {
  const ago = daysAgo(date);
  if (ago === 0) {
    return 'Today';
  }
  if (ago === 1) {
    return 'Yesterday';
  }
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
};

interface Group<T> {
  id: string;
  label: string;
  items: T[];
}

export const groupByDay = (items: HistoryItem[]): Group<HistoryItem>[] =>
  items.reduce<Group<HistoryItem>[]>((groups, item) => {
    const id = String(startOfDay(item.readAt));
    const last = groups[groups.length - 1];
    if (last?.id === id) {
      last.items.push(item);
    } else {
      groups.push({ id, label: dayLabel(item.readAt), items: [item] });
    }
    return groups;
  }, []);

/* -------------------------------------------------------------- filters */

export type Kind = 'all' | 'article' | 'video';

export interface Filters {
  query: string;
  kind: Kind;
}

export const emptyFilters: Filters = { query: '', kind: 'all' };

export const kindLabels: Record<Kind, string> = {
  all: 'All',
  article: 'Articles',
  video: 'Videos',
};

/** Where a search term matched, so a row can say why it is in results. */
export type MatchField = 'title' | 'summary' | 'tag' | 'source';

export const matchField = (
  item: HistoryItem,
  query: string,
): MatchField | null => {
  const q = query.trim().toLowerCase().replace(/^#/, '');
  if (!q) {
    return null;
  }
  if (item.title.toLowerCase().includes(q)) {
    return 'title';
  }
  if (item.tags.some((tag) => tag.includes(q))) {
    return 'tag';
  }
  if (item.source.name.toLowerCase().includes(q)) {
    return 'source';
  }
  if (item.summary.toLowerCase().includes(q)) {
    return 'summary';
  }
  return null;
};

export const applyFilters = (
  items: HistoryItem[],
  filters: Filters,
): HistoryItem[] =>
  items.filter((item) => {
    if (filters.kind === 'article' && item.type !== 'article') {
      return false;
    }
    if (filters.kind === 'video' && item.type !== 'video') {
      return false;
    }
    return !filters.query.trim() || !!matchField(item, filters.query);
  });
