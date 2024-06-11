import { useCallback, useMemo, useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { isNullOrUndefined } from '../../lib/func';
import { useLogContext } from '../../contexts/LogContext';
import { postLogEvent } from '../../lib/feed';
import { LogEvent, Origin } from '../../lib/log';
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
  const { logEvent } = useLogContext();
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
        logEvent(
          postLogEvent(LogEvent.OpenComment, post, {
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
    [user, showLogin, logEvent, post],
  );

  return {
    onReplyTo,
    inputProps,
    commentId: replyTo?.commentId,
  };
};
