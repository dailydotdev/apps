import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../contexts/AuthContext';
import { useFeature } from '../components/GrowthBookProvider';
import { featureAppStoreReview } from '../lib/featureManagement';
import { MarketingCtaVariant } from '../components/marketing/cta/common';
import { LazyModal } from '../components/modals/common/types';
import { iOSSupportsReview } from '../lib/ios';
import { isIOSNative } from '../lib/func';
import { withoutLayoutVariantPrefix } from '../lib/layoutVariant';
import { useIsBootPopupsPaused } from '../lib/bootPopupsPause';
import { useBoot } from './useBoot';
import { useLazyModal } from './useLazyModal';

// A post page. A post opened over the feed pushes `/posts/:id` as its URL
// too, so this covers the modal as well.
export const isPostUrl = (url: string): boolean => {
  const [path = ''] = url.split('#')[0].split('?');

  return withoutLayoutVariantPrefix(path).startsWith('/posts/');
};

/**
 * Opens the App Store review ask when Customer.io has scheduled one for this
 * person through the `app_store_review` or `app_store_review_plus` marketing
 * CTA. Who and when is the campaign's call; this only waits for the natural
 * pause Apple asks for: leaving a post and landing back on the feed. At most
 * one ask per session, only in the iOS app with the review bridge, never over
 * another modal and never on a page that pauses pop-ups.
 */
export const useAppStoreReviewPrompt = (): void => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { getMarketingCta, clearMarketingCta } = useBoot();
  const { openModal, modal } = useLazyModal();
  const isPaused = useIsBootPopupsPaused();
  const isEnabled = useFeature(featureAppStoreReview);
  const plainCta = getMarketingCta(MarketingCtaVariant.AppStoreReview);
  const plusCta = getMarketingCta(MarketingCtaVariant.AppStoreReviewPlus);
  const marketingCta = plainCta ?? (user?.isPlus ? plusCta : null);
  const campaignId = marketingCta?.campaignId;
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
  const hasAsked = useRef(false);
  const wasOnPost = useRef(false);
  // Read through refs so nothing re-subscribes the listener: `router` itself
  // is a new instance on every navigation, only `router.events` is stable.
  const asPathRef = useRef(router?.asPath);
  asPathRef.current = router?.asPath;
  const modalRef = useRef(modal);
  modalRef.current = modal;
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;
  const marketingCtaRef = useRef(marketingCta);
  marketingCtaRef.current = marketingCta;
  const events = router?.events;

  useEffect(() => {
    if (!campaignId || !user || !isEnabled || !events || !iOSSupportsReview()) {
      return undefined;
    }

    wasOnPost.current = isPostUrl(asPathRef.current ?? '');

    const onRouteChange = (url: string) => {
      const onPost = isPostUrl(url);
      const leftPost = wasOnPost.current && !onPost;
      wasOnPost.current = onPost;

      if (
        !leftPost ||
        hasAsked.current ||
        modalRef.current ||
        isPausedRef.current ||
        !marketingCtaRef.current
      ) {
        return;
      }

      hasAsked.current = true;
      const { current } = marketingCtaRef;
      if (current.variant === MarketingCtaVariant.AppStoreReviewPlus) {
        openModal({
          type: LazyModal.AppStoreReviewPlus,
          props: { marketingCta: current },
        });
        return;
      }
      openModal({
        type: LazyModal.AppStoreReview,
        props: { marketingCta: current },
      });
    };

    events.on('routeChangeComplete', onRouteChange);

    return () => {
      events.off('routeChangeComplete', onRouteChange);
    };
  }, [campaignId, events, isEnabled, openModal, user]);
};
