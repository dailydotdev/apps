import { MarketingCtaVariant } from '../../../components/marketing/cta/common';
import { useBoot } from '../../../hooks/useBoot';
import { useHasIntroQuests } from '../../../hooks/useHasIntroQuests';
import { useJobsFeature } from '../../../hooks/useJobsFeature';
import {
  uploadCvOpportunitySuccessContent,
  uploadCvProfileSuccessContent,
  useUploadCv,
} from './useUploadCv';

interface UseCvTopBannerProps {
  // The surface decides whether it is the feed the banner belongs to;
  // `FeedContainer` expresses the same thing as
  // `activeFeedName === SharedFeedPage.MyFeed`.
  enabled?: boolean;
}

interface UseCvTopBanner {
  shouldShow: boolean;
  subtitle: string;
  onUpload: ReturnType<typeof useUploadCv>['onUpload'];
  onClose: () => void;
}

const defaultSubtitle = 'Upload your CV to autofill your profile in seconds.';
const jobsSubtitle =
  'Upload your CV and let your next job quietly come to you.';

/**
 * The compact top-hero rendition of the feed CV banner, held to the same
 * contract as `ProfileUploadBanner` in `FeedContainer`: it needs a live
 * `feed_banner` marketing CTA, it yields to intro quests, and dismissing or
 * uploading clears the campaign rather than completing a local action.
 */
export const useCvTopBanner = ({
  enabled = true,
}: UseCvTopBannerProps = {}): UseCvTopBanner => {
  const { getMarketingCta, clearMarketingCta } = useBoot();
  const marketingCta = getMarketingCta(MarketingCtaVariant.FeedBanner);
  const { isJobsEnabled } = useJobsFeature();
  const { onUpload, shouldShow } = useUploadCv({
    modalContent: isJobsEnabled
      ? uploadCvOpportunitySuccessContent
      : uploadCvProfileSuccessContent,
    onUploadSuccess: () => {
      if (marketingCta) {
        clearMarketingCta(marketingCta.campaignId);
      }
    },
  });
  const shouldEvaluate = enabled && !!marketingCta && shouldShow;
  const hasIntroQuests = useHasIntroQuests({
    shouldEvaluate,
  });

  const campaignSubtitle = isJobsEnabled && marketingCta?.flags?.description;

  return {
    shouldShow: shouldEvaluate && !hasIntroQuests,
    subtitle:
      campaignSubtitle || (isJobsEnabled ? jobsSubtitle : defaultSubtitle),
    onUpload,
    onClose: () => {
      if (marketingCta) {
        clearMarketingCta(marketingCta.campaignId);
      }
    },
  };
};
