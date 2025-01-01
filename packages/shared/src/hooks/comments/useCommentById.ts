import { useCallback, useMemo } from 'react';
import type {
  QueryObserverOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import { generateQueryKey, RequestKey } from '../../lib/query';
import type { Comment, CommentOnData } from '../../graphql/comments';
import { COMMENT_BY_ID_QUERY } from '../../graphql/comments';
import { useRequestProtocol } from '../useRequestProtocol';

interface UseCommentByIdProps {
  id: string;
  query?: string;
  options?: Partial<QueryObserverOptions<CommentOnData>>;
}

interface UseCommentByIdResult
  extends Pick<UseQueryResult, 'isError' | 'isLoading'> {
  comment: Comment;
  onEdit: () => void;
}

const useCommentById = ({
  id,
  query = COMMENT_BY_ID_QUERY,
  options = {},
}: UseCommentByIdProps): UseCommentByIdResult => {
  const { user } = useAuthContext();
  const { requestMethod } = useRequestProtocol();
  const client = useQueryClient();
  const {
    data: commentById,
    isError,
    isLoading,
  } = useQuery<CommentOnData>({
    queryKey: generateQueryKey(RequestKey.Comment, user, id),
    queryFn: () => requestMethod(query, { id: `${id}` }),
    ...options,
    enabled: !!id && options.enabled,
  });
  const comment = commentById || (options?.initialData as CommentOnData);

  const invalidate = useCallback(() => {
    client.invalidateQueries({
      queryKey: generateQueryKey(RequestKey.Comment, user, id),
      exact: true,
    });
  }, [client, user, id]);

  return useMemo(
    () => ({
      comment: comment?.comment,
      onEdit: invalidate,
      isError,
      isLoading,
    }),
    [comment, isError, isLoading, invalidate],
  );
};

export default useCommentById;
