import { useCallback, useMemo, useState } from 'react';
import { Comment } from '../../graphql/comments';
import { CommentMarkdownInputProps } from '../../components/fields/MarkdownInput/CommentMarkdownInput';
import { useAuthContext } from '../../contexts/AuthContext';
import { isNullOrUndefined } from '../../lib/func';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../../lib/feed';
import { AnalyticsEvent, Origin } from '../../lib/analytics';
import { Post } from '../../graphql/posts';

type ReplyTo = [Comment, string, boolean?];

const initialState: ReplyTo = [null, null, false];

interface UseComments {
  replyComment: Comment;
  onReplyTo: (params: ReplyTo | null) => void;
  inputProps: Partial<CommentMarkdownInputProps>;
}

export const useComments = (post: Post): UseComments => {
  const { trackEvent } = useAnalyticsContext();
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

      if (!isNullOrUndefined(params)) {
        trackEvent(
          postAnalyticsEvent(AnalyticsEvent.OpenComment, post, {
            extra: { origin: Origin.PostCommentButton },
          }),
        );
      }

      return setReplyTo(params === null ? initialState : params);
    },
    [user, showLogin, trackEvent, post],
  );

  return {
    replyComment: replyTo[0],
    onReplyTo,
    inputProps,
  };
};
