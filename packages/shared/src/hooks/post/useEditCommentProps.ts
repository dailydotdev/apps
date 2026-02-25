import { useCallback, useMemo, useState } from 'react';
import type { CommentWrite, CommentWriteProps } from './common';
import useCommentById from '../comments/useCommentById';

interface UseCommentEdit extends CommentWrite {
  onEdit: (params?: CommentWriteProps | null) => void;
}

export const useEditCommentProps = (): UseCommentEdit => {
  const [state, setState] = useState<CommentWriteProps | null>(null);
  const { commentId: id } = state ?? {};
  const { comment, onEdit } = useCommentById({ id: id ?? '' });

  const inputProps = useMemo(() => {
    if (!state || !comment) {
      return null;
    }

    return {
      editCommentId: state.commentId,
      parentCommentId: state.parentCommentId,
      initialContent: comment?.content,
    };
  }, [comment, state]);

  return {
    onEdit: useCallback(
      (params) => {
        if (!params) {
          setState(null);
          return;
        }

        onEdit();
        setState(params);
      },
      [onEdit, setState],
    ),
    inputProps,
  };
};
