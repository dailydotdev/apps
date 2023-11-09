import { useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import AuthContext from '../../contexts/AuthContext';
import { RequestKey, generateQueryKey } from '../../lib/query';
import { ReadHistoryInfiniteData } from '../useInfiniteReadingHistory';
import { UseVotePost } from './types';
import { useVotePost } from './useVotePost';
import { mutateVoteReadHistoryPost } from './utils';

export type UseReadHistoryVotePost = UseVotePost;

export const useReadHistoryVotePost = (): UseReadHistoryVotePost => {
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);

  const votePost = useVotePost({
    variables: { key: RequestKey.ReadingHistory },
    onMutate: ({ id, vote }) => {
      const data = queryClient.getQueryData<ReadHistoryInfiniteData>(
        generateQueryKey(RequestKey.ReadingHistory, user),
      );

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
