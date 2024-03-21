import { useCallback, useContext } from 'react';
import { Post } from '../../graphql/posts';
import { useCopyPostLink } from '../useCopyPostLink';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { ShareProvider } from '../../lib/share';
import { postAnalyticsEvent } from '../../lib/feed';
import { Origin } from '../../lib/analytics';
import { ReferralCampaignKey } from '../../lib/referral';
import { useGetShortUrl } from '../utils/useGetShortUrl';

interface UseTrackedCopyPostLink {
  onCopyLink: (provider: ShareProvider) => void;
  isLoading: boolean;
}

export const useTrackedCopyPostLink = (
  post: Post,
  origin = Origin.FeedbackCard,
): UseTrackedCopyPostLink => {
  const { isLoading, shareLink } = useGetShortUrl({
    query: {
      url: post.commentsPermalink,
      cid: ReferralCampaignKey.SharePost,
    },
  });
  const [, copyLink] = useCopyPostLink(shareLink);
  const { trackEvent } = useContext(AnalyticsContext);

  const onCopyLink = useCallback(
    (provider: ShareProvider) => {
      trackEvent(
        postAnalyticsEvent('share post', post, {
          extra: { provider, origin },
        }),
      );
      copyLink({ link: shareLink });
    },
    [copyLink, origin, post, shareLink, trackEvent],
  );

  return { onCopyLink, isLoading };
};
