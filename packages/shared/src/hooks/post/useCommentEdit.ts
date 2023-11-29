import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Comment, COMMENT_BY_ID_QUERY } from '../../graphql/comments';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { graphqlUrl } from '../../lib/config';
import { useAuthContext } from '../../contexts/AuthContext';
import { useRequestProtocol } from '../useRequestProtocol';
import { CommentWrite, CommentWriteProps } from './common';

interface UseCommentEdit extends CommentWrite {
  onEdit: (params: CommentWriteProps) => void;
}

export const useCommentEdit = (): UseCommentEdit => {
  const [state, setState] = useState<CommentWriteProps>();
  const { commentId: id } = state ?? {};
  const { user } = useAuthContext();
  const { requestMethod } = useRequestProtocol();
  const { data } = useQuery<{ comment: Comment }>(
    generateQueryKey(RequestKey.Comment, user, id),
    () => requestMethod(graphqlUrl, COMMENT_BY_ID_QUERY, { id }),
    { enabled: !!id },
  );

  const inputProps = useMemo(() => {
    if (!state || !data) {
      return null;
    }

    return {
      editCommentId: state.commentId,
      parentCommentId: state.parentCommentId,
      initialContent: data?.comment?.content,
    };
  }, [data, state]);

  return {
    onEdit: setState,
    inputProps,
  };
};
