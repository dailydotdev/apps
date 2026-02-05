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
