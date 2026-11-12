import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../contexts/AuthContext';
import { useFeature } from '../components/GrowthBookProvider';
import { featureAppStoreReview } from '../lib/featureManagement';
import { MarketingCtaVariant } from '../components/marketing/cta/common';
import { LazyModal } from '../components/modals/common/types';
import { iOSSupportsReview } from '../lib/ios';
import { withoutLayoutVariantPrefix } from '../lib/layoutVariant';
import { useBoot } from './useBoot';
import { useLazyModal } from './useLazyModal';

// A post page, or a feed with a post open in the modal.
export const isPostUrl = (url: string): boolean => {
  const [pathWithQuery = ''] = url.split('#');
  const [path = '', query = ''] = pathWithQuery.split('?');

  return (
    withoutLayoutVariantPrefix(path).startsWith('/posts/') ||
    new URLSearchParams(query).has('pmid')
  );
};

/**
 * Opens the App Store review ask when Customer.io has scheduled one for this
 * person through the `app_store_review` marketing CTA. Who and when is the
 * campaign's call; this only waits for the natural pause Apple asks for:
 * leaving a post and landing back on the feed. At most one ask per session,
 * only in the iOS app with the review bridge, and never over another modal.
 */
export const useAppStoreReviewPrompt = (): void => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { getMarketingCta } = useBoot();
  const { openModal, modal } = useLazyModal();
  const isEnabled = useFeature(featureAppStoreReview);
  const marketingCta = getMarketingCta(MarketingCtaVariant.AppStoreReview);
  const campaignId = marketingCta?.campaignId;
  const hasAsked = useRef(false);
  const wasOnPost = useRef(false);
  // Read through refs so a route change never re-subscribes the listener.
  const modalRef = useRef(modal);
  modalRef.current = modal;
  const marketingCtaRef = useRef(marketingCta);
  marketingCtaRef.current = marketingCta;

  useEffect(() => {
    if (
      !campaignId ||
      !user ||
      !isEnabled ||
      !router?.events ||
      !iOSSupportsReview()
    ) {
      return undefined;
    }

    wasOnPost.current = isPostUrl(router.asPath ?? '');

    const onRouteChange = (url: string) => {
      const onPost = isPostUrl(url);
      const leftPost = wasOnPost.current && !onPost;
      wasOnPost.current = onPost;

      if (
        !leftPost ||
        hasAsked.current ||
        modalRef.current ||
        !marketingCtaRef.current
      ) {
        return;
      }

      hasAsked.current = true;
      openModal({
        type: LazyModal.AppStoreReview,
        props: { marketingCta: marketingCtaRef.current },
      });
    };

    router.events.on('routeChangeComplete', onRouteChange);

    return () => {
      router.events.off('routeChangeComplete', onRouteChange);
    };
  }, [campaignId, isEnabled, openModal, router, user]);
};
