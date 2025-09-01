import { useCallback } from 'react';
import type { Post } from '../graphql/posts';
import { postLogEvent } from '../lib/feed';
import { useLogContext } from '../contexts/LogContext';
import { ShareProvider } from '../lib/share';
import type { Origin } from '../lib/log';
import type { Comment } from '../graphql/comments';
import { getCommentHash } from '../graphql/comments';
import { useGetShortUrl } from './utils/useGetShortUrl';
import { ReferralCampaignKey } from '../lib';
import { useSharePost } from './useSharePost';
import { shouldUseNativeShare } from '../lib/func';
import { LogEvent } from '../lib/log';

interface UseShareComment {
  openShareComment: (comment: Comment, post: Post) => void;
}

export function useShareComment(origin: Origin): UseShareComment {
  const { logEvent } = useLogContext();
  const { openSharePost } = useSharePost(origin);
  const { getShortUrl } = useGetShortUrl();

  const openShareComment = useCallback(
    async (comment, post) => {
      if (shouldUseNativeShare()) {
        try {
          const shortUrl = await getShortUrl(
            `${post.commentsPermalink}${getCommentHash(comment.id)}`,
            ReferralCampaignKey.ShareComment,
          );
          await navigator.share({
            text: `${post.title}\n${shortUrl}`,
          });
          logEvent(
            postLogEvent(LogEvent.ShareComment, post, {
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
