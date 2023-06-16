import { useCallback, useMemo, useState } from 'react';
import { Comment } from '../../graphql/comments';
import { CommentMarkdownInputProps } from '../../components/fields/MarkdownInput/CommentMarkdownInput';
import { useAuthContext } from '../../contexts/AuthContext';

type ReplyTo = [Comment, string, boolean?];

const initialState: ReplyTo = [null, null, false];

interface UseComments {
  replyComment: Comment;
  onReplyTo: (params: ReplyTo | null) => void;
  inputProps: Partial<CommentMarkdownInputProps>;
}

export const useComments = (): UseComments => {
  const { user, showLogin } = useAuthContext();
  const [replyTo, setReplyTo] = useState(initialState);

  const inputProps = useMemo(() => {
    const [replyComment, parentId, isEdit] = replyTo;

    return {
      replyTo: isEdit ? null : replyComment?.author.username,
      initialContent: isEdit
        ? replyComment?.content
        : `@${replyComment?.author.username} `,
      editCommentId: isEdit ? replyComment?.id : null,
      parentCommentId: parentId,
    };
  }, [replyTo]);

  const onReplyTo = useCallback(
    (params: ReplyTo | null) => {
      if (!user) return showLogin('comment');

      return setReplyTo(params === null ? initialState : params);
    },
    [user, showLogin],
  );

  return {
    replyComment: replyTo[0],
    onReplyTo,
    inputProps,
  };
};
