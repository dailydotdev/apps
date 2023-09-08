import { useContext } from 'react';
import { QueryClient, useQueryClient } from 'react-query';
import AuthContext from '../../contexts/AuthContext';
import { Edge } from '../../graphql/common';
import {
  generateQueryKey,
  RequestKey,
  updateReadingHistoryListPost,
} from '../../lib/query';
import { LoggedUser } from '../../lib/user';
import { PostItem } from '../useFeed';
import { ReadHistoryInfiniteData } from '../useInfiniteReadingHistory';
import {
  UseVotePost,
  UseVotePostMutationProps,
  UseVotePostProps,
  voteMutationHandlers,
} from './types';
import { useVotePost } from './useVotePost';

export type UseReadHistoryVotePostProps = {
  data: ReadHistoryInfiniteData;
};

export type UseReadHistoryVotePost = UseVotePost;

const mutateVoteReadHistoryPost = ({
  id,
  vote,
  data,
  user,
  queryClient,
}: UseVotePostMutationProps & {
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

export const useReadHistoryVotePost = ({
  data,
}: UseReadHistoryVotePostProps): UseReadHistoryVotePost => {
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);

  const votePost = useVotePost({
    variables: { key: RequestKey.ReadingHistory },
    onMutate: ({ id, vote }) => {
      return mutateVoteReadHistoryPost({
        id,
        vote,
        data,
        user,
        queryClient,
      });
    },
  });

  return votePost;
};
