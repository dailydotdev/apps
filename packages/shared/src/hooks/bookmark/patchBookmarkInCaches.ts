import type {
  InfiniteData,
  QueryClient,
  QueryKey,
} from '@tanstack/react-query';
import type { Ad, Post } from '../../graphql/posts';
import type { FeedItem } from '../useFeed';
import { optimisticPostUpdateInFeed } from '../../lib/feed';
import {
  feedAdsQueryFilters,
  updateAdPostInCache,
  updateCachedPagePost,
  updatePostCache,
} from '../../lib/query';

interface PatchBookmarkInCachesProps {
  client: QueryClient;
  postId: string;
  feedQueryKey?: QueryKey;
  items: FeedItem[];
  // Derives the change from the cached post, so partial bookmark data merges
  // instead of replacing what another surface already wrote
  mutate: (post: Post) => Partial<Post>;
}

/**
 * Applies one bookmark change to every cache the post lives in: the post
 * page, the active feed, and the boosted-post ad slot when the post surfaced
 * as an ad. Reminders, read state, archive and notes all go through here.
 */
export const patchBookmarkInCaches = ({
  client,
  postId,
  feedQueryKey,
  items,
  mutate,
}: PatchBookmarkInCachesProps): void => {
  updatePostCache(client, postId, mutate);

  if (!feedQueryKey) {
    return;
  }

  const postIndex = items.findIndex(
    (item) => item.type === 'post' && item.post.id === postId,
  );

  if (postIndex !== -1) {
    const update = optimisticPostUpdateInFeed(
      items,
      updateCachedPagePost(feedQueryKey, client),
      mutate,
    );
    update({ index: postIndex });
  }

  const adItem = items.find(
    (item) => item.type === 'ad' && item.ad.data?.post?.id === postId,
  );
  const adPost = adItem?.type === 'ad' ? adItem.ad.data?.post : undefined;

  if (adPost) {
    client.setQueriesData<InfiniteData<Ad>>(
      feedAdsQueryFilters(feedQueryKey),
      (currentData) =>
        currentData
          ? updateAdPostInCache(postId, currentData, mutate(adPost))
          : currentData,
    );
  }
};
