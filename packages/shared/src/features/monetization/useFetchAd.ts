import { useCallback } from 'react';
import type { Ad } from '../../graphql/posts';
import {
  AdPlacement,
  fetchAdByPlacement,
  resolveAdFetchOptions,
} from '../../lib/ads';
import { featureAdRefreshEngine } from '../../lib/featureManagement';
import { useAuthContext } from '../../contexts/AuthContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { useAdRequestConsent } from './useAdRequestConsent';
import { useAdRefreshContext } from './refresh/AdRefreshContext';

interface UseFetchAds {
  isAdConsentReady: boolean;
  fetchAd: (params: {
    active?: boolean;
    placement?: AdPlacement;
    refresh?: { count: number; generationId?: string };
  }) => Promise<Ad | null>;
}

export const useFetchAd = (enabled = true): UseFetchAds => {
  const consent = useAdRequestConsent(enabled);
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const registered = isAuthReady ? isLoggedIn : undefined;
  const { value: isRefreshEngine } = useConditionalFeature({
    feature: featureAdRefreshEngine,
    shouldEvaluate: enabled,
  });
  const { platform } = useAdRefreshContext();

  const fetchAdQuery: UseFetchAds['fetchAd'] = useCallback(
    async ({ active, placement = AdPlacement.Feed, refresh }) => {
      if (!consent) {
        return null;
      }
      return fetchAdByPlacement({
        ...resolveAdFetchOptions({
          placement,
          active,
          consent,
          registered,
        }),
        ...(isRefreshEngine && {
          refresh: { platform, count: 0, ...refresh },
        }),
      });
    },
    [consent, isRefreshEngine, platform, registered],
  );

  return {
    fetchAd: fetchAdQuery,
    isAdConsentReady: !!consent,
  };
};
