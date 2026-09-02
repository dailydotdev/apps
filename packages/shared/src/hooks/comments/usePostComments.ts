import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import AuthContext from '../../contexts/AuthContext';
import type { PostCommentsData, SortCommentsBy } from '../../graphql/comments';
import { POST_COMMENTS_QUERY } from '../../graphql/comments';
import { useRequestProtocol } from '../useRequestProtocol';
import { initialDataKey } from '../../lib/constants';
import { generateCommentsQueryKey } from '../../lib/query';

interface UsePostCommentsProps {
  postId: string;
  sortBy?: SortCommentsBy;
}

interface UsePostCommentsResult {
  queryKey: ReturnType<typeof generateCommentsQueryKey>;
  comments?: PostCommentsData;
  isLoading: boolean;
  commentsCount: number;
}

/**
 * Shared by the comment list and the surfaces around it (sort toggles, meta
 * bars), so they read the same cache entry and can't disagree on whether the
 * post has comments.
 */
export const usePostComments = ({
  postId,
  sortBy,
}: UsePostCommentsProps): UsePostCommentsResult => {
  const { tokenRefreshed } = useContext(AuthContext);
  const { requestMethod } = useRequestProtocol();
  const queryKey = generateCommentsQueryKey({ postId, sortBy });
  const { data: comments, isLoading } = useQuery<PostCommentsData>({
    queryKey,

    queryFn: (): Promise<PostCommentsData> =>
      requestMethod(
        POST_COMMENTS_QUERY,
        { postId, [initialDataKey]: comments, first: 500, sortBy },
        { requestKey: JSON.stringify(queryKey) },
      ),
    enabled: !!postId && tokenRefreshed,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    queryKey,
    comments,
    isLoading,
    commentsCount: comments?.postComments?.edges?.length || 0,
  };
};
