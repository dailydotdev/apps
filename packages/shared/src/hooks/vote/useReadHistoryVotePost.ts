import { useContext } from 'react';
import { useQueryClient } from 'react-query';
import AuthContext from '../../contexts/AuthContext';
import { RequestKey } from '../../lib/query';
import { ReadHistoryInfiniteData } from '../useInfiniteReadingHistory';
import { UseVotePost } from './types';
import { useVotePost } from './useVotePost';
import { mutateVoteReadHistoryPost } from './utils';

export type UseReadHistoryVotePostProps = {
  data: ReadHistoryInfiniteData;
};

export type UseReadHistoryVotePost = UseVotePost;

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
