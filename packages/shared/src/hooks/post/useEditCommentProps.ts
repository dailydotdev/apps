import { useCallback, useMemo, useState } from 'react';
import type { CommentWrite, CommentWriteProps } from './common';
import useCommentById from '../comments/useCommentById';

interface UseCommentEdit extends CommentWrite {
  onEdit: (params: CommentWriteProps | null) => void;
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
      ...(state.parentCommentId
        ? { parentCommentId: state.parentCommentId }
        : {}),
      ...(comment?.content ? { initialContent: comment.content } : {}),
    };
  }, [comment, state]);

  return {
    onEdit: useCallback(
      (params) => {
        onEdit();
        setState(params);
      },
      [onEdit, setState],
    ),
    inputProps,
  };
};
