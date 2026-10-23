import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featurePlusCheckoutV2 } from '../../../lib/featureManagement';
import { isIOSNative } from '../../../lib/func';

const STORAGE_KEY = 'plus_checkout_v2_preview';

/** PR previews and local dev only — never production, so no one can opt out of
    (or into) the experiment there with a URL. */
export const isPreviewHost = (hostname: string): boolean =>
  hostname === 'localhost' ||
  hostname.endsWith('.localhost') ||
  hostname.endsWith('.preview.app.daily.dev');

/** `?checkout=v2` turns the new checkout on for this tab, `?checkout=v1` off. */
const usePreviewOverride = (value?: string | string[]): boolean | undefined =>
  useMemo(() => {
    if (
      typeof window === 'undefined' ||
      !isPreviewHost(window.location.hostname)
    ) {
      return undefined;
    }
    try {
      if (value === 'v2') {
        window.sessionStorage.setItem(STORAGE_KEY, 'v2');
      } else if (value === 'v1') {
        window.sessionStorage.setItem(STORAGE_KEY, 'v1');
      }
      const stored = window.sessionStorage.getItem(STORAGE_KEY);
      return stored ? stored === 'v2' : undefined;
    } catch {
      return value === 'v2' ? true : undefined;
    }
  }, [value]);

/**
 * Whether /plus renders the new checkout. Web only: the iOS app keeps its
 * StoreKit page. Plus members buying for themselves stay on today's page (they
 * see "already Plus" in both), team and gift purchases are in the test. The
 * thank-you page is always eligible: the buyer is a Plus member by then.
 */
export const usePlusCheckoutV2 = (): { isV2: boolean; isLoading: boolean } => {
  const { query, isReady, pathname } = useRouter();
  const { isAuthReady, user } = useAuthContext();
  const forced = usePreviewOverride(query.checkout);
  const isIOS = isIOSNative();
  const isTeamOrGift = query.type === 'team' || !!query.gift;
  const isSuccess = pathname === '/plus/success';
  const isEligible = !isIOS && (!user?.isPlus || isTeamOrGift || isSuccess);
  const isContextReady = isReady && isAuthReady;
  const { value, isLoading } = useConditionalFeature({
    feature: featurePlusCheckoutV2,
    shouldEvaluate: forced === undefined && isContextReady && isEligible,
  });

  if (!isContextReady) {
    return { isV2: false, isLoading: true };
  }
  if (isIOS) {
    return { isV2: false, isLoading: false };
  }
  if (forced !== undefined) {
    return { isV2: forced, isLoading: false };
  }
  if (!isEligible) {
    return { isV2: false, isLoading: false };
  }
  return { isV2: !!value, isLoading };
};
