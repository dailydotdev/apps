import { useCallback } from 'react';
import { useFeature } from '../../components/GrowthBookProvider';
import type { Ad } from '../../graphql/posts';
import {
  AdPlacement,
  fetchAdByPlacement,
  resolveAdFetchOptions,
} from '../../lib/ads';
import {
  featureAdV2Placements,
  featurePostBoostAds,
} from '../../lib/featureManagement';
import { useAuthContext } from '../../contexts/AuthContext';
import { useAdRequestConsent } from './useAdRequestConsent';

interface UseFetchAds {
  isAdConsentReady: boolean;
  fetchAd: (params: {
    active?: boolean;
    placement?: AdPlacement;
  }) => Promise<Ad | null>;
}

export const useFetchAd = (enabled = true): UseFetchAds => {
  const boostsEnabled = useFeature(featurePostBoostAds);
  const v2Placements = useFeature(featureAdV2Placements);
  const consent = useAdRequestConsent(enabled);
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const registered = isAuthReady ? isLoggedIn : undefined;

  const fetchAdQuery: UseFetchAds['fetchAd'] = useCallback(
    async ({ active, placement = AdPlacement.Feed }) => {
      if (!consent) {
        return null;
      }
      return fetchAdByPlacement({
        ...resolveAdFetchOptions({
          placement,
          active,
          boostsEnabled,
          consent,
          registered,
        }),
        v2Placements,
      });
    },
    [boostsEnabled, consent, registered, v2Placements],
  );

  return {
    fetchAd: fetchAdQuery,
    isAdConsentReady: !!consent,
  };
};
