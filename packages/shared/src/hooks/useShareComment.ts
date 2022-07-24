import { useContext, useState } from 'react';
import { Post } from '../graphql/posts';
import { postAnalyticsEvent } from '../lib/feed';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { ShareProvider } from '../lib/share';
import { Origin } from '../lib/analytics';
import { Comment, getCommentHash } from '../graphql/comments';

export function useShareComment(
  origin: Origin,
  post: Post,
): {
  shareComment: Comment;
  openShareComment: (Comment) => void;
  closeShareComment: () => void;
} {
  const { trackEvent } = useContext(AnalyticsContext);
  const [shareModal, setShareModal] = useState<Comment>(null);

  const openShareComment = async (comment: Comment) => {
    if ('share' in navigator) {
      try {
        await navigator.share({
          text: `${post.title} ${post.commentsPermalink}${getCommentHash(
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
  };

  const closeShareComment = () => {
    setShareModal(null);
  };

  return {
    shareComment: shareModal,
    openShareComment,
    closeShareComment,
  };
}
