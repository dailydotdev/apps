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
};

export const feedItems: FeedItem[] = aggregatedFeed as FeedItem[];

export const categoryLabels: Record<Category, string> = {
  leak: 'LEAK',
  milestone: 'MILESTONE',
  release: 'RELEASE',
  hot_take: 'HOT TAKE',
  thread: 'THREAD',
  feature: 'FEATURE',
  endorsement: 'ENDORSEMENT',
  announcement: 'NEWS',
  drama: 'DRAMA',
  insight: 'INSIGHT',
  data: 'DATA',
  product_launch: 'LAUNCH',
  tips: 'TIP',
  standard: 'STANDARD',
  commentary: 'COMMENTARY',
};

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

export const getBreakingItems = (items: FeedItem[]): FeedItem[] => {
  const today = getTodayDateString();
  return items.filter(
    (item) =>
      item.date === today &&
      ['drama', 'leak', 'hot_take'].includes(item.category),
  );
};

export const getMilestoneItems = (items: FeedItem[]): FeedItem[] => {
  const today = getTodayDateString();
  return items.filter(
    (item) =>
      item.date === today &&
      ['milestone', 'product_launch'].includes(item.category),
  );
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
