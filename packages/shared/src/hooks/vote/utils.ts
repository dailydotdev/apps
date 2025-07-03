import type {
  InfiniteData,
  QueryClient,
  QueryKey,
} from '@tanstack/react-query';
import type { Edge } from '../../graphql/common';
import {
  generateQueryKey,
  RequestKey,
  updateReadingHistoryListPost,
  updateAdPostInCache,
  createAdPostRollbackHandler,
} from '../../lib/query';
import type { LoggedUser } from '../../lib/user';
import type { ReadHistoryInfiniteData } from '../useInfiniteReadingHistory';
import type { UseVoteMutationProps, UseVotePostProps } from './types';
import { voteMutationHandlers } from './types';
import type { Ad, PostItem, PostUserState } from '../../graphql/posts';
import { optimisticPostUpdateInFeed } from '../../lib/feed';
import type { AdItem, FeedItem, UpdateFeedPost } from '../useFeed';

export const mutateVoteReadHistoryPost = ({
  id,
  vote,
  data,
  user,
  queryClient,
}: Omit<UseVoteMutationProps, 'entity'> & {
  data: ReadHistoryInfiniteData;
  user: LoggedUser;
  queryClient: QueryClient;
}): ReturnType<UseVotePostProps['onMutate']> => {
  const mutationHandler = voteMutationHandlers[vote];

  if (!mutationHandler) {
    return undefined;
  }

  const findPost = (edge: Edge<PostItem>) => edge.node.post.id === id;

  const postPageIndex = data.pages.findIndex((page) =>
    page.readHistory.edges.some(findPost),
  );

  if (postPageIndex === -1) {
    return undefined;
  }

  const postIndexToUpdate =
    data.pages[postPageIndex].readHistory.edges.findIndex(findPost);

  if (postIndexToUpdate === -1) {
    return undefined;
  }

  const readingHistoryQueryKey = generateQueryKey(
    RequestKey.ReadingHistory,
    user,
  );

  return updateReadingHistoryListPost({
    queryKey: readingHistoryQueryKey,
    queryClient,
    pageIndex: postPageIndex,
    index: postIndexToUpdate,
    manipulate: (currentPost) => {
      return {
        ...currentPost,
        ...mutationHandler(currentPost),
      };
    },
  });
};

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
}): ReturnType<UseVotePostProps['onMutate']> => {
  if (!items) {
    return undefined;
  }

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

  let previousVote: PostUserState['vote'] | undefined;
  const rollbackFunctions: (() => void)[] = [];

  // Handle regular post update
  if (postIndexToUpdate !== -1) {
    previousVote = (items[postIndexToUpdate] as PostItem)?.post?.userState
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

      const rollbackMutationHandler = voteMutationHandlers[previousVote];

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
      previousVote = adPost.userState?.vote;

      // Update the ad's post in the ads cache
      const adsQueryKey = [RequestKey.Ads, ...feedQueryKey];
      const adsData = queryClient.getQueryData(adsQueryKey);

      if (adsData) {
        queryClient.setQueryData(
          adsQueryKey,
          (currentData: InfiniteData<Ad>) => {
            const existingAdPost = (adsData as InfiniteData<Ad>).pages.find(
              (page) => page.data?.post?.id === id,
            )?.data?.post;
            return updateAdPostInCache(
              id,
              currentData,
              mutationHandler(existingAdPost),
            );
          },
        );

        rollbackFunctions.push(() => {
          const rollbackMutationHandler = voteMutationHandlers[previousVote];

          if (!rollbackMutationHandler) {
            return;
          }

          queryClient.setQueryData(
            adsQueryKey,
            createAdPostRollbackHandler(id, {}, rollbackMutationHandler),
          );
        });
      }
    }
  }

  return () => {
    rollbackFunctions.forEach((rollback) => rollback());
  };
};
