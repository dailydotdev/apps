import { useCallback, useContext } from 'react';
import { Post } from '../../graphql/posts';
import { useCopyPostLink } from '../useCopyPostLink';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { ShareProvider } from '../../lib/share';
import { postAnalyticsEvent } from '../../lib/feed';
import { Origin } from '../../lib/analytics';
import { useTrackedLink } from '../utils/useTrackedLink';
import { ReferralCampaignKey } from '../../lib/referral';

interface UseTrackedCopyPostLink {
  onCopyLink: (provider: ShareProvider) => void;
  isLoading: boolean;
}

export const useTrackedCopyPostLink = (
  post: Post,
  origin = Origin.FeedbackCard,
): UseTrackedCopyPostLink => {
  const { shareLink, isLoading } = useTrackedLink({
    link: post.commentsPermalink,
    cid: ReferralCampaignKey.SharePost,
  });
  console.log(shareLink);
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
