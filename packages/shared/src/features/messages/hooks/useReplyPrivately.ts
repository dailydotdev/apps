import { useRouter } from 'next/router';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import type { Comment } from '../../../graphql/comments';
import type { Post } from '../../../graphql/posts';
import { postLogEvent } from '../../../lib/feed';
import { LogEvent } from '../../../lib/log';
import type { Origin } from '../../../lib/log';
import { useMessagesEnabled } from './useMessagesEnabled';
import { DmOrigin, getMessagesUrl } from '../urls';

// The comment's "Reply privately" action; opening the chat from here carries
// the comment along as a reference card.
export const useReplyPrivately = (
  comment: Comment,
  post: Post,
  origin: Origin,
): (() => void) | undefined => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { isEnabled } = useMessagesEnabled();
  const { author } = comment;

  if (!isEnabled || !user || !author || author.id === user.id) {
    return undefined;
  }

  return () => {
    logEvent(
      postLogEvent(LogEvent.ReplyPrivately, post, {
        extra: { origin, commentId: comment.id },
      }),
    );
    router.push(
      getMessagesUrl(author.id, {
        commentId: comment.id,
        origin: DmOrigin.Comment,
      }),
    );
  };
};
