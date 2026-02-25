import { useCallback, useMemo, useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useActiveFeedContext } from '../../contexts';
import { postLogEvent } from '../../lib/feed';
import { LogEvent, Origin } from '../../lib/log';
import type { Post } from '../../graphql/posts';
import { AuthTriggers } from '../../lib/auth';
import type { CommentWrite, CommentWriteProps } from './common';

interface ReplyTo extends CommentWriteProps {
  username: string;
}

interface UseComments extends CommentWrite {
  commentId: string;
  onReplyTo: (params?: ReplyTo | null) => void;
}

export const getReplyToInitialContent = (
  username?: string,
): string | undefined => (username ? `@${username}\u00a0` : undefined);

export const useComments = (post: Post): UseComments => {
  const { logEvent } = useLogContext();
  const { logOpts } = useActiveFeedContext();
  const { user, showLogin } = useAuthContext();
  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);

  const inputProps = useMemo(() => {
    if (!replyTo) {
      return null;
    }

    const { username, parentCommentId } = replyTo ?? {};

    return {
      parentCommentId,
      replyTo: username,
      initialContent: getReplyToInitialContent(username),
    };
  }, [replyTo]);

  const onReplyTo = useCallback(
    (params?: ReplyTo | null) => {
      if (!user) {
        return showLogin({ trigger: AuthTriggers.Comment });
      }

      if (params) {
        logEvent(
          postLogEvent(LogEvent.OpenComment, post, {
            extra: { origin: Origin.PostCommentButton },
            ...(logOpts && logOpts),
          }),
        );
      }

      if (!params) {
        return setReplyTo(null);
      }

      if (params.username === user.username) {
        return setReplyTo({ ...params, username: '' });
      }

      return setReplyTo(params);
    },
    [user, showLogin, logEvent, post, logOpts],
  );

  return {
    onReplyTo,
    inputProps,
    commentId: replyTo?.commentId ?? '',
  };
};
