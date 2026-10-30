import type {
  InfiniteData,
  QueryClient,
  QueryKey,
} from '@tanstack/react-query';
import {
  feedAdsQueryFilters,
  updateAdPostInCache,
  createAdPostRollbackHandler,
} from '../../lib/query';
import type { UseVoteMutationProps, UseVotePostRollback } from './types';
import { voteMutationHandlers } from './types';
import type { Ad, PostItem, PostUserState } from '../../graphql/posts';
import { optimisticPostUpdateInFeed } from '../../lib/feed';
import type { AdItem, FeedItem, UpdateFeedPost } from '../useFeed';

export const mutateVoteFeedPost = ({
  id,
  vote,
  items,
  updatePost,
  queryClient,
  feedQueryKey,
}: Omit<UseVoteMutationProps, 'entity'> & {
  items: FeedItem[];
  updatePost: UpdateFeedPost;
  queryClient?: QueryClient;
  feedQueryKey?: QueryKey;
}): UseVotePostRollback | undefined => {
  const mutationHandler = voteMutationHandlers[vote];

  if (!mutationHandler) {
    return undefined;
  }

  const postIndexToUpdate = items.findIndex(
    (item) => item.type === 'post' && item.post.id === id,
  );

  const adIndexToUpdate = items.findIndex(
    (item) => item.type === 'ad' && item.ad.data?.post?.id === id,
  );

  if (postIndexToUpdate === -1 && adIndexToUpdate === -1) {
    return undefined;
  }

  let previousPostVote: PostUserState['vote'] | undefined;
  let previousAdVote: PostUserState['vote'] | undefined;
  const rollbackFunctions: (() => void)[] = [];

  // Handle regular post update
  if (postIndexToUpdate !== -1) {
    previousPostVote = (items[postIndexToUpdate] as PostItem)?.post?.userState
      ?.vote;

    optimisticPostUpdateInFeed(
      items,
      updatePost,
      mutationHandler,
    )({ index: postIndexToUpdate });

    rollbackFunctions.push(() => {
      const postIndexToRollback = items.findIndex(
        (item) => item.type === 'post' && item.post.id === id,
      );

      if (postIndexToRollback === -1) {
        return;
      }

      if (typeof previousPostVote === 'undefined') {
        return;
      }

      const rollbackMutationHandler = voteMutationHandlers[previousPostVote];

      if (!rollbackMutationHandler) {
        return;
      }

      optimisticPostUpdateInFeed(
        items,
        updatePost,
        rollbackMutationHandler,
      )({ index: postIndexToUpdate });
    });
  }

  // Handle Post Ad update
  if (adIndexToUpdate !== -1 && queryClient && feedQueryKey) {
    const adItem = items[adIndexToUpdate] as AdItem;
    const adPost = adItem.ad.data?.post;

    if (adPost) {
      previousAdVote = adPost.userState?.vote;

      // Update the ad's post in the ads cache
      const adsFilters = feedAdsQueryFilters(feedQueryKey);

      queryClient.setQueriesData<InfiniteData<Ad>>(
        adsFilters,
        (currentData) => {
          if (!currentData || !currentData.pages?.length) {
            return currentData;
          }

          const existingAdPost = currentData.pages.find(
            (page) => page.data?.post?.id === id,
          )?.data?.post;

          if (!existingAdPost) {
            return currentData;
          }

          return updateAdPostInCache(
            id,
            currentData,
            mutationHandler(existingAdPost),
          );
        },
      );

      rollbackFunctions.push(() => {
        if (typeof previousAdVote === 'undefined') {
          return;
        }

        const rollbackMutationHandler = voteMutationHandlers[previousAdVote];

        if (!rollbackMutationHandler) {
          return;
        }

        queryClient.setQueriesData<InfiniteData<Ad>>(
          adsFilters,
          createAdPostRollbackHandler(id, {}, rollbackMutationHandler),
        );
      });
    }
  }

  return () => {
    rollbackFunctions.forEach((rollback) => rollback());
  };
};
