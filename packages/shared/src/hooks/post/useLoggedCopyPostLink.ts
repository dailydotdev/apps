import { useCallback, useContext } from 'react';
import { Post } from '../../graphql/posts';
import { useCopyPostLink } from '../useCopyPostLink';
import LogContext from '../../contexts/LogContext';
import { ShareProvider } from '../../lib/share';
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
  const { isLoading, shareLink } = useGetShortUrl({
    query: {
      url: post.commentsPermalink,
      cid: ReferralCampaignKey.SharePost,
    },
  });
  const [, copyLink] = useCopyPostLink(shareLink);
  const { logEvent } = useContext(LogContext);

  const onCopyLink = useCallback(
    (provider: ShareProvider) => {
      logEvent(
        postLogEvent('share post', post, {
          extra: { provider, origin },
        }),
      );
      copyLink({ link: shareLink });
    },
    [copyLink, origin, post, shareLink, logEvent],
  );

  return { onCopyLink, isLoading };
};
