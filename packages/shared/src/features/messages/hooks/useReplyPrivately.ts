import { useRouter } from 'next/router';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { Comment } from '../../../graphql/comments';
import { useMessagesEnabled } from './useMessagesEnabled';
import { DmOrigin, getMessagesUrl } from '../urls';

// The comment's "Reply privately" action; opening the chat from here carries
// the comment along as a reference card.
export const useReplyPrivately = (
  comment: Comment,
): (() => void) | undefined => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { isEnabled } = useMessagesEnabled();
  const { author } = comment;

  if (!isEnabled || !user || !author || author.id === user.id) {
    return undefined;
  }

  return () =>
    router.push(
      getMessagesUrl(author.id, {
        commentId: comment.id,
        origin: DmOrigin.Comment,
      }),
    );
};
