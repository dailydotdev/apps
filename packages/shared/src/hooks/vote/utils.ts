import { QueryClient } from '@tanstack/react-query';
import { Edge } from '../../graphql/common';
import {
  generateQueryKey,
  RequestKey,
  updateReadingHistoryListPost,
} from '../../lib/query';
import { LoggedUser } from '../../lib/user';
import { ReadHistoryInfiniteData } from '../useInfiniteReadingHistory';
import {
  UseVoteMutationProps,
  UseVotePostProps,
  voteMutationHandlers,
} from './types';
import { PostItem } from '../../graphql/posts';
import { optimisticPostUpdateInFeed } from '../../lib/feed';
import { FeedItem, UpdateFeedPost } from '../useFeed';

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
}: Omit<UseVoteMutationProps, 'entity'> & {
  items: FeedItem[];
  updatePost: UpdateFeedPost;
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

  if (postIndexToUpdate === -1) {
    return undefined;
  }

  const previousVote = (items[postIndexToUpdate] as PostItem)?.post?.userState
    ?.vote;

  optimisticPostUpdateInFeed(
    items,
    updatePost,
    mutationHandler,
  )({ index: postIndexToUpdate });

  return () => {
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
  };
};
