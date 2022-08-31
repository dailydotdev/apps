import { useContext, useMemo, useState } from 'react';
import { Post } from '../graphql/posts';
import { postAnalyticsEvent } from '../lib/feed';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { ShareProvider } from '../lib/share';
import { Origin } from '../lib/analytics';
import { Comment, getCommentHash } from '../graphql/comments';

export function useShareComment(origin: Origin): {
  shareComment: Comment;
  openShareComment: (Comment, Post) => void;
  closeShareComment: () => void;
} {
  const { trackEvent } = useContext(AnalyticsContext);
  const [shareModal, setShareModal] = useState<Comment>(null);

  return useMemo(
    () => ({
      shareComment: shareModal,
      openShareComment: async (comment: Comment, post: Post) => {
        if ('share' in navigator) {
          try {
            await navigator.share({
              text: `${post.title}\n${post.commentsPermalink}${getCommentHash(
                comment.id,
              )}`,
            });
            trackEvent(
              postAnalyticsEvent('share post', post, {
                extra: {
                  origin,
                  provider: ShareProvider.Native,
                  commentId: comment.id,
                },
              }),
            );
          } catch (err) {
            // Do nothing
          }
        } else {
          setShareModal(comment);
        }
      },
      closeShareComment: () => setShareModal(null),
    }),
    [shareModal],
  );
}
