import { useMemo, useState } from 'react';
import {
  QueryObserverOptions,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';
import { graphqlUrl } from '../../lib/config';
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
  onEdit: (lastUpdatedAt: string) => void;
}

const useCommentById = ({
  id,
  query = COMMENT_BY_ID_QUERY,
  options = {},
}: UseCommentByIdProps): UseCommentByIdResult => {
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string>();

  const { user } = useAuthContext();
  const { requestMethod } = useRequestProtocol();
  const {
    data: commentById,
    isError,
    isLoading,
  } = useQuery<CommentOnData>(
    generateQueryKey(RequestKey.Comment, user, id, lastUpdatedAt),
    () => requestMethod(graphqlUrl, query, { id: `${id}` }),
    {
      ...options,
      enabled: !!id && options.enabled,
    },
  );
  const comment = commentById || (options?.initialData as CommentOnData);

  return useMemo(
    () => ({
      comment: comment?.comment,
      onEdit: setLastUpdatedAt,
      isError,
      isLoading,
    }),
    [comment, isError, isLoading],
  );
};

export default useCommentById;
