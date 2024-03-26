import { useCallback, useMemo, useState } from 'react';
import { CommentWrite, CommentWriteProps } from './common';
import useCommentById from '../comments/useCommentById';

interface UseCommentEdit extends CommentWrite {
  onEdit: (params: CommentWriteProps) => void;
}

export const useEditCommentProps = (): UseCommentEdit => {
  const [state, setState] = useState<CommentWriteProps>();
  const { commentId: id } = state ?? {};
  const { comment, onEdit } = useCommentById({ id });

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
        onEdit();
        setState(params);
      },
      [onEdit, setState],
    ),
    inputProps,
  };
};
