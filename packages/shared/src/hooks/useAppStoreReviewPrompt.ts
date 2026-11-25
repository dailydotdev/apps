import { useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useFeature } from '../components/GrowthBookProvider';
import { featureAppStoreReview } from '../lib/featureManagement';
import type { MarketingCta } from '../components/marketing/cta/common';
import { MarketingCtaVariant } from '../components/marketing/cta/common';
import { iOSSupportsReview } from '../lib/ios';
import { isIOSNative } from '../lib/func';
import { useBoot } from './useBoot';

/**
 * The App Store review ask Customer.io has scheduled for this person through
 * the `app_store_review` or `app_store_review_plus` marketing CTA, when it can
 * be shown here: logged in, the feature is on and the iOS app has the review
 * bridge. Who and when is the campaign's call; BootPopups queues the result
 * like any other marketing CTA popup.
 */
export const useAppStoreReviewPrompt = (): MarketingCta | null => {
  const { user } = useAuthContext();
  const { getMarketingCta, clearMarketingCta } = useBoot();
  const isEnabled = useFeature(featureAppStoreReview);
  const plainCta = getMarketingCta(MarketingCtaVariant.AppStoreReview);
  const plusCta = getMarketingCta(MarketingCtaVariant.AppStoreReviewPlus);
  const marketingCta = plainCta ?? (user?.isPlus ? plusCta : null);
  // Boot carries one marketing CTA. A Plus thank-you aimed at someone who
  // is not (or no longer) a member would hold that slot forever, so it is
  // cleared instead of shown.
  // The same goes for an iOS app older than the review bridge (before 1.26):
  // Customer.io can't tell app versions apart, and this app can never show
  // either ask, so it is cleared instead of holding the slot.
  const isMissingBridge = !!user && isIOSNative() && !iOSSupportsReview();
  const stalePlusCampaignId = user && !user.isPlus ? plusCta?.campaignId : null;
  const staleCampaignId = isMissingBridge
    ? (plainCta ?? plusCta)?.campaignId
    : stalePlusCampaignId;

  useEffect(() => {
    if (staleCampaignId) {
      clearMarketingCta(staleCampaignId);
    }
  }, [clearMarketingCta, staleCampaignId]);

  if (!marketingCta || !user || !isEnabled || !iOSSupportsReview()) {
    return null;
  }

  return marketingCta;
};
