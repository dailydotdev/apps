import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import type { PostData } from '../../graphql/posts';
import { getPostByIdKey, RequestKey, updatePostCache } from '../../lib/query';
import type { UseVotePost } from './types';
import { voteMutationHandlers } from './types';
import { useVotePost } from './useVotePost';
import { updateReadingHistoryPost } from '../useReadingHistory';

export type UseReadHistoryVotePost = UseVotePost;

export const useReadHistoryVotePost = (): UseReadHistoryVotePost => {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  const votePost = useVotePost({
    variables: { key: RequestKey.ReadingHistory },
    onMutate: ({ id, vote }) => {
      if (!user) {
        throw new Error(
          'useReadHistoryVotePost requires an authenticated user in onMutate',
        );
      }

      const mutationHandler = voteMutationHandlers[vote];

      if (!mutationHandler) {
        return undefined;
      }

      // The history pane may show the same post from its own cache.
      const previous = queryClient.getQueryData<PostData>(getPostByIdKey(id));
      updatePostCache(queryClient, id, mutationHandler);
      const rollbackHistory = updateReadingHistoryPost(
        queryClient,
        user,
        id,
        mutationHandler,
      );

      return () => {
        rollbackHistory();
        if (previous) {
          queryClient.setQueryData(getPostByIdKey(id), previous);
        }
      };
    },
  });

  return votePost;
};
