import { FeedItem, PostItem } from '../hooks/useFeed';
import { Ad, Post, ReadHistoryPost } from '../graphql/posts';
import { LogEvent } from '../hooks/log/useLogQueue';
import { PostBootData } from './boot';
import { Origin } from './log';
import { SharedFeedPage } from '../components/utilities';
import { AllFeedPages, OtherFeedPage } from './query';

export function optimisticPostUpdateInFeed(
  items: FeedItem[],
  updatePost: (page: number, index: number, post: Post) => void,
  mutationFunction: (post: Post) => Partial<Post>,
): ({ index }: { index: number }) => Promise<() => void> {
  return async ({ index }) => {
    const item = items[index] as PostItem;
    const { post } = item;
    updatePost(item.page, item.index, {
      ...post,
      ...mutationFunction(post),
    });
    return () => updatePost(item.page, item.index, post);
  };
}

interface FeedItemLogEvent extends LogEvent {
  event_name: string;
  feed_grid_columns?: number;
  feed_item_grid_column?: number;
  feed_item_grid_row?: number;
  feed_item_meta?: string;
  feed_item_image: string;
  feed_item_target_url: string;
  feed_item_title: string;
  target_id: string;
  target_type: string;
}

interface PostItemLogEvent extends FeedItemLogEvent {
  post_author_id: string;
  post_scout_id: string;
  post_comments_count: number;
  post_created_at: string;
  post_read_time: number;
  post_source_id: string;
  post_tags: string[];
  post_trending_value: number;
  post_upvotes_count: number;
}

interface AdItemLogEvent extends FeedItemLogEvent {
  ad_provider_id: string;
}

interface FeedLogExtra {
  extra: {
    origin: string;
    feed: string;
    ranking?: string;
    variant?: string;
    parent_id?: string;
  };
}

export function feedLogExtra(
  feedName: string,
  ranking?: string,
  extra?: {
    scroll_y?: number;
  },
  origin?: Origin,
  variant?: string,
  parent_id?: string,
): FeedLogExtra {
  return {
    extra: {
      origin: origin ?? Origin.Feed,
      feed: feedName,
      variant,
      ...(ranking && { ranking }),
      ...(extra && extra),
      ...(parent_id && { parent_id }),
    },
  };
}

export interface FeedItemPosition {
  columns?: number;
  column?: number;
  row?: number;
}

export type PostLogEventFnOptions = FeedItemPosition & {
  extra?: Record<string, unknown>;
};

const feedPathWithIdMatcher = /^\/feeds\/(?<feedId>[A-z0-9]{9})\/?$/;

export function postLogEvent(
  eventName: string,
  post: Post | ReadHistoryPost | PostBootData,
  opts?: PostLogEventFnOptions,
): PostItemLogEvent {
  const extra = {
    ...opts?.extra,
  };

  if (typeof window !== 'undefined') {
    const currentUrl = new URL(window.location.href);

    const feedPathMatch = currentUrl.pathname.match(feedPathWithIdMatcher);

    if (feedPathMatch?.groups?.feedId) {
      extra.feed_id = feedPathMatch.groups.feedId;
    }
  }

  return {
    event_name: eventName,
    feed_grid_columns: opts?.columns,
    feed_item_grid_column: opts?.column,
    feed_item_grid_row: opts?.row,
    feed_item_image: post.image,
    feed_item_target_url: post.permalink,
    feed_item_title: post.title,
    feed_item_meta: (post as Post).feedMeta,
    post_author_id: post.author?.id,
    post_scout_id: post.scout?.id,
    post_created_at: post.createdAt,
    post_comments_count: post.numComments,
    post_read_time: post.readTime,
    post_tags: post.tags,
    post_source_id: post.source?.id,
    post_trending_value: post.trending,
    post_upvotes_count: post.numUpvotes,
    target_id: post.id,
    target_type: 'post',
    post_type: post.type,
    post_source_type: post.source?.type,
    extra: Object.keys(extra).length > 0 ? JSON.stringify(extra) : undefined,
  };
}

export function adLogEvent(
  eventName: string,
  ad: Ad,
  opts?: {
    columns?: number;
    column?: number;
    row?: number;
    extra?: Record<string, unknown>;
  },
): AdItemLogEvent {
  return {
    event_name: eventName,
    feed_grid_columns: opts?.columns,
    feed_item_grid_column: opts?.column,
    feed_item_grid_row: opts?.row,
    feed_item_image: ad.image,
    feed_item_target_url: ad.link,
    feed_item_title: ad.description,
    ad_provider_id: ad.providerId,
    target_id: ad.source,
    target_type: 'ad',
    extra: opts?.extra ? JSON.stringify(opts.extra) : undefined,
  };
}

export interface GetDefaultFeedProps {
  hasFiltered?: boolean;
  hasUser?: boolean;
}

export const getDefaultFeed = ({
  hasUser,
}: GetDefaultFeedProps): SharedFeedPage => {
  if (!hasUser) {
    return SharedFeedPage.Popular;
  }

  return SharedFeedPage.MyFeed;
};

export const defaultFeedConditions = [null, 'default', '/', ''];

export const getFeedName = (
  path: string,
  options: GetDefaultFeedProps = {},
): AllFeedPages => {
  const feed = path?.replaceAll?.('/', '') || '';

  if (defaultFeedConditions.some((condition) => condition === feed)) {
    return getDefaultFeed(options);
  }
  if (feed.startsWith('search')) {
    return SharedFeedPage.Search;
  }
  if (feed === '[userId]upvoted') {
    return OtherFeedPage.UserUpvoted;
  }
  if (feed === '[userId]posts') {
    return OtherFeedPage.UserPosts;
  }
  if (feed.startsWith('feeds')) {
    const isForm = ['new', 'edit'].some((item) => feed.endsWith(item));

    return isForm ? SharedFeedPage.CustomForm : SharedFeedPage.Custom;
  }

  const [page] = feed.split('?');

  return page.replace(/^\/+/, '') as SharedFeedPage;
};
