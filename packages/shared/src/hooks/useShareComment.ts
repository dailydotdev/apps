import { useContext, useEffect, useMemo, useState } from 'react';
import { Post } from '../graphql/posts';
import { postAnalyticsEvent } from '../lib/feed';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { ShareCID, ShareProvider } from '../lib/share';
import { Origin } from '../lib/analytics';
import { Comment, getCommentHash } from '../graphql/comments';
import useDebounce from './useDebounce';
import { useGetShortUrl } from './utils/useGetShortUrl';

interface UseShareComment {
  shareComment: Comment;
  openShareComment: (comment: Comment, post: Post) => void;
  closeShareComment: () => void;
  showShareNewComment: string;
  onShowShareNewComment: (value: string) => void;
}

export function useShareComment(
  origin: Origin,
  enableShowShareNewComment = false,
): UseShareComment {
  const { trackEvent } = useContext(AnalyticsContext);
  const [shareModal, setShareModal] = useState<Comment>(null);
  const [showShareNewComment, setShowShareNewComment] = useState(null);
  const [showNewComment] = useDebounce((id) => setShowShareNewComment(id), 700);
  const { getShortUrl } = useGetShortUrl();

  useEffect(() => {
    if (enableShowShareNewComment) {
      showNewComment();
    }
  }, [showNewComment, enableShowShareNewComment]);

  return useMemo(
    () => ({
      showShareNewComment,
      onShowShareNewComment: setShowShareNewComment,
      shareComment: shareModal,
      openShareComment: async (comment, post) => {
        if ('share' in navigator) {
          try {
            const shortUrl = await getShortUrl(
              `${post.commentsPermalink}${getCommentHash(comment.id)}`,
              ShareCID.Comment,
            );
            await navigator.share({
              text: `${post.title}\n${shortUrl}$}`,
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
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shareModal],
  );
}
