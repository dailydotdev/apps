import { FeedItem, PostItem } from '../hooks/useFeed';
import { Ad, Post } from '../graphql/posts';
import { AnalyticsEvent } from '../hooks/analytics/useAnalyticsQueue';

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

interface FeedItemAnalyticsEvent extends AnalyticsEvent {
  event_name: string;
  feed_grid_columns?: number;
  feed_item_grid_column?: number;
  feed_item_grid_row?: number;
  feed_item_image: string;
  feed_item_target_url: string;
  feed_item_title: string;
  target_id: string;
  target_type: string;
}

interface PostItemAnalyticsEvent extends FeedItemAnalyticsEvent {
  post_author_id: string;
  post_comments_count: number;
  post_created_at: string;
  post_read_time: number;
  post_source_id: string;
  post_tags: string[];
  post_trending_value: number;
  post_upvotes_count: number;
}

interface AdItemAnalyticsEvent extends FeedItemAnalyticsEvent {
  ad_provider_id: string;
}

export function postAnalyticsEvent(
  eventName: string,
  post: Post,
  opts?: {
    columns?: number;
    column?: number;
    row?: number;
    extra?: Record<string, unknown>;
  },
): PostItemAnalyticsEvent {
  return {
    event_name: eventName,
    feed_grid_columns: opts?.columns,
    feed_item_grid_column: opts?.column,
    feed_item_grid_row: opts?.row,
    feed_item_image: post.image,
    feed_item_target_url: post.permalink,
    feed_item_title: post.title,
    post_author_id: post.author?.id,
    post_created_at: post.createdAt,
    post_comments_count: post.numComments,
    post_read_time: post.readTime,
    post_tags: post.tags,
    post_source_id: post.source?.id,
    post_trending_value: post.trending,
    post_upvotes_count: post.numUpvotes,
    target_id: post.id,
    target_type: 'post',
    extra: opts?.extra ? JSON.stringify(opts.extra) : undefined,
  };
}

export function adAnalyticsEvent(
  eventName: string,
  ad: Ad,
  opts?: {
    columns?: number;
    column?: number;
    row?: number;
    extra?: Record<string, unknown>;
  },
): AdItemAnalyticsEvent {
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
