import { useCallback } from 'react';
import type { Ad } from '../../graphql/posts';
import {
  AdPlacement,
  fetchAdByPlacement,
  resolveAdFetchOptions,
} from '../../lib/ads';
import {
  AdRefreshEngineVersion,
  featureAdRefreshEngine,
} from '../../lib/featureManagement';
import { useAuthContext } from '../../contexts/AuthContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { useAdRequestConsent } from './useAdRequestConsent';
import { getAdRefreshPlatform } from './refresh/adRefresh';

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
  const { isAuthReady, isLoggedIn, isAndroidApp } = useAuthContext();
  const registered = isAuthReady ? isLoggedIn : undefined;
  const { value: refreshEngineVersion } = useConditionalFeature({
    feature: featureAdRefreshEngine,
    shouldEvaluate: enabled,
  });
  const isRefreshEngine = refreshEngineVersion === AdRefreshEngineVersion.V2;

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
          refresh: {
            platform: getAdRefreshPlatform(isAndroidApp),
            count: 0,
            ...refresh,
          },
        }),
      });
    },
    [consent, isAndroidApp, isRefreshEngine, registered],
  );

  return {
    fetchAd: fetchAdQuery,
    isAdConsentReady: !!consent,
  };
};
