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
 * Kept in lockstep with the `ProfileUploadBanner` gate in `FeedContainer`:
 * the two render the same campaign, and only one of them may.
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
