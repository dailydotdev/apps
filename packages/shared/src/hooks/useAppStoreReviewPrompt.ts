import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../contexts/AuthContext';
import { useFeature } from '../components/GrowthBookProvider';
import { featureAppStoreReview } from '../lib/featureManagement';
import { MarketingCtaVariant } from '../components/marketing/cta/common';
import { LazyModal } from '../components/modals/common/types';
import { iOSSupportsReview } from '../lib/ios';
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
  const { getMarketingCta } = useBoot();
  const { openModal, modal } = useLazyModal();
  const isPaused = useIsBootPopupsPaused();
  const isEnabled = useFeature(featureAppStoreReview);
  const plainCta = getMarketingCta(MarketingCtaVariant.AppStoreReview);
  // The Plus thank-you only makes sense for a member; otherwise it waits in
  // boot until the campaign is corrected.
  const plusCta = user?.isPlus
    ? getMarketingCta(MarketingCtaVariant.AppStoreReviewPlus)
    : null;
  const marketingCta = plainCta ?? plusCta;
  const campaignId = marketingCta?.campaignId;
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
