import { useCallback, useContext } from 'react';

import LogContext from '../contexts/LogContext';
import { Comment, getCommentHash } from '../graphql/comments';
import { Post } from '../graphql/posts';
import { ReferralCampaignKey } from '../lib';
import { postLogEvent } from '../lib/feed';
import { Origin } from '../lib/log';
import { ShareProvider } from '../lib/share';
import { useSharePost } from './useSharePost';
import { useGetShortUrl } from './utils/useGetShortUrl';

interface UseShareComment {
  openShareComment: (comment: Comment, post: Post) => void;
}

export function useShareComment(origin: Origin): UseShareComment {
  const { logEvent } = useContext(LogContext);
  const { openSharePost } = useSharePost(origin);
  const { getShortUrl } = useGetShortUrl();

  const openShareComment = useCallback(
    async (comment, post) => {
      if ('share' in navigator) {
        try {
          const shortUrl = await getShortUrl(
            `${post.commentsPermalink}${getCommentHash(comment.id)}`,
            ReferralCampaignKey.ShareComment,
          );
          await navigator.share({
            text: `${post.title}\n${shortUrl}`,
          });
          logEvent(
            postLogEvent('share comment', post, {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getShortUrl, openSharePost, origin],
  );

  return { openShareComment };
}
