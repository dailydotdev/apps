import { useCallback } from 'react';
import { useFeature } from '../../components/GrowthBookProvider';
import type { Ad } from '../../graphql/posts';
import {
  AdPlacement,
  fetchAdByPlacement,
  resolveAdFetchOptions,
} from '../../lib/ads';
import { featurePostBoostAds } from '../../lib/featureManagement';
import { useAuthContext } from '../../contexts/AuthContext';
import { useAdRequestConsent } from './useAdRequestConsent';

interface UseFetchAds {
  fetchAd: (params: {
    active?: boolean;
    placement?: AdPlacement;
  }) => Promise<Ad | null>;
}

export const useFetchAd = (): UseFetchAds => {
  const boostsEnabled = useFeature(featurePostBoostAds);
  const consent = useAdRequestConsent(true) ?? undefined;
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const registered = isAuthReady ? isLoggedIn : undefined;

  const fetchAdQuery: UseFetchAds['fetchAd'] = useCallback(
    ({ active, placement = AdPlacement.Feed }) => {
      return fetchAdByPlacement(
        resolveAdFetchOptions({
          placement,
          active,
          boostsEnabled,
          consent,
          registered,
        }),
      );
    },
    [boostsEnabled, consent, registered],
  );

  return {
    fetchAd: fetchAdQuery,
  };
};
