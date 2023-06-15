import { useMemo, useState } from 'react';
import { Comment } from '../../graphql/comments';
import { CommentMarkdownInputProps } from '../../components/fields/MarkdownInput/CommentMarkdownInput';

type ReplyTo = [Comment, string, boolean?];

const initialState: ReplyTo = [null, null, false];

interface UseComments {
  replyComment: Comment;
  onReplyTo: (params: ReplyTo | null) => void;
  inputProps: Partial<CommentMarkdownInputProps>;
}

export const useComments = (): UseComments => {
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

  return {
    replyComment: replyTo[0],
    onReplyTo: (params) => setReplyTo(params === null ? initialState : params),
    inputProps,
  };
};
