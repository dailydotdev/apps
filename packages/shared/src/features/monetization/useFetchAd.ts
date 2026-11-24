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
import { useAdSlotFetch } from './useAdSlotFetch';
import type { AdSlotFetchTransition } from './adSlotLifecycle';
import { useAdLifecycle } from './useAdLifecycle';
import { useAdEntity } from './useAdEntity';

interface UseFetchAds {
  isAdConsentReady: boolean;
  fetchAd: (params: {
    active?: boolean;
    placement?: AdPlacement;
    refresh?: { count: number; generationId?: string };
    onTransition?: (transition: AdSlotFetchTransition) => void;
  }) => Promise<Ad | null>;
}

export const useFetchAd = (enabled = true): UseFetchAds => {
  const consent = useAdRequestConsent(enabled);
  const { resolveAd } = useAdLifecycle(enabled);
  const { isAuthReady, isLoggedIn, isAndroidApp } = useAuthContext();
  const registered = isAuthReady ? isLoggedIn : undefined;
  const { entity } = useAdEntity(enabled);
  const { value: refreshEngineVersion } = useConditionalFeature({
    feature: featureAdRefreshEngine,
    shouldEvaluate: enabled,
  });
  const isRefreshEngine = refreshEngineVersion === AdRefreshEngineVersion.V2;

  const onFetchTransition = useAdSlotFetch(consent);
  const fetchAdQuery: UseFetchAds['fetchAd'] = useCallback(
    async ({ active, placement = AdPlacement.Feed, refresh, onTransition }) => {
      if (!consent) {
        return null;
      }
      return resolveAd(
        await fetchAdByPlacement({
          ...resolveAdFetchOptions({
            placement,
            active,
            consent,
            registered,
            entity,
          }),
          ...(isRefreshEngine && {
            refresh: {
              platform: getAdRefreshPlatform(isAndroidApp),
              count: 0,
              ...refresh,
            },
          }),
          onTransition: (transition) => {
            const resolved = onFetchTransition(transition);
            onTransition?.(resolved);
          },
        }),
      );
    },
    [
      consent,
      entity,
      isAndroidApp,
      isRefreshEngine,
      onFetchTransition,
      registered,
      resolveAd,
    ],
  );

  return {
    fetchAd: fetchAdQuery,
    isAdConsentReady: !!consent,
  };
};
