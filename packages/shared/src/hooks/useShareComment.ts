import { useCallback, useContext, useEffect, useState } from 'react';
import { Post } from '../graphql/posts';
import { postAnalyticsEvent } from '../lib/feed';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { ShareProvider } from '../lib/share';
import { Origin } from '../lib/analytics';
import { Comment, getCommentHash } from '../graphql/comments';
import useDebounce from './useDebounce';
import { useGetShortUrl } from './utils/useGetShortUrl';
import { ReferralCampaignKey } from '../lib';
import { useSharePost } from './useSharePost';

interface UseShareComment {
  openShareComment: (comment: Comment, post: Post) => void;
  showShareNewComment: string;
  onShowShareNewComment: (value: string) => void;
}

export function useShareComment(
  origin: Origin,
  enableShowShareNewComment = false,
): UseShareComment {
  const { trackEvent } = useContext(AnalyticsContext);
  const { openSharePost } = useSharePost(origin);
  const [showShareNewComment, setShowShareNewComment] = useState(null);
  const [showNewComment] = useDebounce((id) => setShowShareNewComment(id), 700);
  const { getShortUrl } = useGetShortUrl();

  useEffect(() => {
    if (enableShowShareNewComment) {
      showNewComment();
    }
  }, [showNewComment, enableShowShareNewComment]);

  const openShareComment = useCallback(
    async (comment, post) => {
      if ('share' in navigator) {
        try {
          const shortUrl = await getShortUrl(
            `${post.commentsPermalink}${getCommentHash(comment.id)}`,
            ReferralCampaignKey.ShareComment,
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
        openSharePost({ post, comment });
      }
    },
    // trackEvent is unstable
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getShortUrl, openSharePost, origin],
  );

  return {
    onShowShareNewComment: setShowShareNewComment,
    showShareNewComment,
    openShareComment,
  };
}
