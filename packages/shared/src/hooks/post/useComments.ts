import { useCallback, useMemo, useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { isNullOrUndefined } from '../../lib/func';
import { useLogContext } from '../../contexts/LogContext';
import { postLogsEvent } from '../../lib/feed';
import { LogsEvent, Origin } from '../../lib/logs';
import { Post } from '../../graphql/posts';
import { AuthTriggers } from '../../lib/auth';
import { CommentWrite, CommentWriteProps } from './common';

interface ReplyTo extends CommentWriteProps {
  username: string;
}

interface UseComments extends CommentWrite {
  commentId: string;
  onReplyTo: (params: ReplyTo) => void;
}

export const useComments = (post: Post): UseComments => {
  const { trackEvent } = useLogContext();
  const { user, showLogin } = useAuthContext();
  const [replyTo, setReplyTo] = useState<ReplyTo>(null);

  const inputProps = useMemo(() => {
    if (!replyTo) {
      return null;
    }

    const { username, parentCommentId } = replyTo ?? {};
    const replyToContent = username ? `@${username} ` : undefined;

    return {
      parentCommentId,
      replyTo: username,
      initialContent: replyToContent,
    };
  }, [replyTo]);

  const onReplyTo = useCallback(
    (params: ReplyTo) => {
      if (!user) {
        return showLogin({ trigger: AuthTriggers.Comment });
      }

      if (!isNullOrUndefined(params)) {
        trackEvent(
          postLogsEvent(LogsEvent.OpenComment, post, {
            extra: { origin: Origin.PostCommentButton },
          }),
        );
      }

      if (!params) {
        return setReplyTo(null);
      }

      if (params.username === user.username) {
        return setReplyTo({ ...params, username: null });
      }

      return setReplyTo(params);
    },
    [user, showLogin, trackEvent, post],
  );

  return {
    onReplyTo,
    inputProps,
    commentId: replyTo?.commentId,
  };
};
