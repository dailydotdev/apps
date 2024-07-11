import { useCallback, useMemo } from 'react';
import {
  QueryObserverOptions,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import { generateQueryKey, RequestKey } from '../../lib/query';
import {
  Comment,
  COMMENT_BY_ID_QUERY,
  CommentOnData,
} from '../../graphql/comments';
import { useRequestProtocol } from '../useRequestProtocol';

interface UseCommentByIdProps {
  id: string;
  query?: string;
  options?: QueryObserverOptions<CommentOnData>;
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
  } = useQuery<CommentOnData>(
    generateQueryKey(RequestKey.Comment, user, id),
    () => requestMethod(query, { id: `${id}` }),
    {
      ...options,
      enabled: !!id && options.enabled,
    },
  );
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
