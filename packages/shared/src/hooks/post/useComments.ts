import { useCallback, useMemo, useState } from 'react';
import { Comment } from '../../graphql/comments';
import { CommentMarkdownInputProps } from '../../components/fields/MarkdownInput/CommentMarkdownInput';
import { useAuthContext } from '../../contexts/AuthContext';
import { isNullOrUndefined } from '../../lib/func';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../../lib/feed';
import { AnalyticsEvent, Origin } from '../../lib/analytics';
import { Post } from '../../graphql/posts';
import { AuthTriggers } from '../../lib/auth';

type IsEdit = boolean;
type ParentId = string;
type ReplyTo = [Comment, ParentId, IsEdit?];

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
    const replyToUsername =
      isEdit || user?.username === replyComment?.author.username
        ? null
        : replyComment?.author.username;
    const replyToContent = replyToUsername ? `@${replyToUsername} ` : undefined;

    return {
      replyTo: replyToUsername,
      initialContent: isEdit ? replyComment?.content : replyToContent,
      editCommentId: isEdit ? replyComment?.id : null,
      parentCommentId: parentId,
    };
  }, [user, replyTo]);

  const onReplyTo = useCallback(
    (params: ReplyTo | null) => {
      if (!user) {
        return showLogin(AuthTriggers.Comment);
      }

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
