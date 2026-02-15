import aggregatedFeed from '../pages/ai-coding-hub-data/aggregated_feed.json';

export type Category =
  | 'leak'
  | 'milestone'
  | 'release'
  | 'hot_take'
  | 'thread'
  | 'feature'
  | 'endorsement'
  | 'announcement'
  | 'drama'
  | 'insight'
  | 'data'
  | 'product_launch'
  | 'tips'
  | 'standard'
  | 'commentary';

export type FeedItem = {
  id: string;
  type: string;
  headline: string;
  summary: string;
  date: string;
  category: Category;
  tags: string[];
  source_tweet_id: string;
  related_tweet_ids: string[];
  author_username: string;
  author_name: string;
  author_avatar_url: string;
  upvotes: number;
  comments: number;
};

type AggregatedFeedItem = Omit<
  FeedItem,
  'upvotes' | 'comments' | 'author_username' | 'author_name' | 'author_avatar_url'
> & {
  author_username?: string;
  author_name?: string;
  author_avatar_url?: string;
};

const normalizeTag = (tag: string): string => tag.replace(/_/g, '');
const toTitleCase = (value: string): string =>
  value
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');

const getAuthorFromItem = (
  item: AggregatedFeedItem,
): Pick<FeedItem, 'author_username' | 'author_name' | 'author_avatar_url'> => {
  const sourceTag = item.tags[0] || 'source';
  const fallbackUsername = normalizeTag(sourceTag).toLowerCase();
  const fallbackName = toTitleCase(
    normalizeTag(sourceTag).replace(/-/g, ' '),
  );
  const fallbackAvatar = `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(`${fallbackUsername}-${item.source_tweet_id}`)}`;

  return {
    author_username: item.author_username || fallbackUsername,
    author_name: item.author_name || fallbackName,
    author_avatar_url: item.author_avatar_url || fallbackAvatar,
  };
};

export const feedItems: FeedItem[] = (aggregatedFeed as AggregatedFeedItem[]).map(
  (item) => ({
    ...item,
    ...getAuthorFromItem(item),
    upvotes: 0,
    comments: 0,
  }),
);

export const categoryLabels: Record<Category, string> = {
  leak: 'Leak',
  milestone: 'Milestone',
  release: 'Release',
  hot_take: 'Hot take',
  thread: 'Thread',
  feature: 'Feature',
  endorsement: 'Endorsement',
  announcement: 'News',
  drama: 'Drama',
  insight: 'Insight',
  data: 'Data',
  product_launch: 'Launch',
  tips: 'Tip',
  standard: 'Standard',
  commentary: 'Commentary',
};

export const VIRAL_MENTIONS_THRESHOLD = 8;

export const getMentionsCount = (item: FeedItem): number => {
  const uniqueTweetIds = new Set([
    item.source_tweet_id,
    ...item.related_tweet_ids,
  ].filter(Boolean));
  return uniqueTweetIds.size;
};

export const getMentionsLabel = (item: FeedItem): string =>
  `${getMentionsCount(item)} mentions`;

export const isViralFeedItem = (item: FeedItem): boolean =>
  getMentionsCount(item) >= VIRAL_MENTIONS_THRESHOLD;

export const getRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'today';
  }
  if (diffDays === 1) {
    return 'yesterday';
  }
  return `${diffDays}d ago`;
};

export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getRecentDateStrings = (): string[] => {
  const dates: string[] = [];
  for (let i = 0; i < 2; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

export const getBreakingItems = (items: FeedItem[]): FeedItem[] => {
  const recentDates = getRecentDateStrings();
  return items
    .filter(
      (item) =>
        recentDates.includes(item.date) &&
        ['drama', 'leak', 'hot_take'].includes(item.category),
    )
    .slice(0, 3);
};

export const getMilestoneItems = (items: FeedItem[]): FeedItem[] => {
  const recentDates = getRecentDateStrings();
  return items
    .filter(
      (item) =>
        recentDates.includes(item.date) &&
        ['milestone', 'product_launch'].includes(item.category),
    )
    .slice(0, 3);
};

export const getTrendingTools = (
  items: FeedItem[],
): { name: string; count: number }[] => {
  const tagCounts: Record<string, number> = {};
  const toolTags = [
    'claude_code',
    'codex',
    'cursor',
    'copilot',
    'windsurf',
    'cline',
    'openai',
    'anthropic',
    'kimi',
    'opus_4.6',
    'gpt_5.3',
    'opencode',
    'aider',
  ];

  items.forEach((item) => {
    item.tags.forEach((tag) => {
      const normalized = tag.toLowerCase();
      if (toolTags.some((t) => normalized.includes(t.replace('_', '')))) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    });
  });

  return Object.entries(tagCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
};
