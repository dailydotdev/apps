import { useCallback, useContext, useState } from 'react';
import type { Post } from '../../graphql/posts';
import { useCopyPostLink } from '../useCopyPostLink';
import LogContext from '../../contexts/LogContext';
import type { ShareProvider } from '../../lib/share';
import { postLogEvent } from '../../lib/feed';
import { Origin } from '../../lib/log';
import { ReferralCampaignKey } from '../../lib';
import { useGetShortUrl } from '../utils/useGetShortUrl';

interface UseLoggedCopyPostLink {
  onCopyLink: (provider: ShareProvider) => void;
  isLoading: boolean;
}

export const useLoggedCopyPostLink = (
  post: Post,
  origin = Origin.FeedbackCard,
): UseLoggedCopyPostLink => {
  const [isLoading, setIsLoading] = useState(false);
  const { getShortUrl } = useGetShortUrl();
  const [, copyLink] = useCopyPostLink(post?.commentsPermalink);
  const { logEvent } = useContext(LogContext);

  const onCopyLink = useCallback(
    async (provider: ShareProvider) => {
      setIsLoading(true);
      logEvent(
        postLogEvent('share post', post, {
          extra: { provider, origin },
        }),
      );
      const shareLink = await getShortUrl(
        post.commentsPermalink,
        ReferralCampaignKey.SharePost,
      );
      copyLink({ link: shareLink });
      setIsLoading(false);
    },
    [copyLink, origin, post, logEvent, getShortUrl],
  );

  return { onCopyLink, isLoading };
};
