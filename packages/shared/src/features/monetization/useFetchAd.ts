import { useCallback } from 'react';
import { useFeature } from '../../components/GrowthBookProvider';
import type { Ad } from '../../graphql/posts';
import {
  AdPlacement,
  fetchAdByPlacement,
  resolveAdFetchOptions,
} from '../../lib/ads';
import { featurePostBoostAds } from '../../lib/featureManagement';
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
  const consent = useAdRequestConsent(enabled);

  const fetchAdQuery: UseFetchAds['fetchAd'] = useCallback(
    async ({ active, placement = AdPlacement.Feed }) => {
      if (!consent) {
        return null;
      }
      return fetchAdByPlacement(
        resolveAdFetchOptions({
          placement,
          active,
          boostsEnabled,
          consent,
        }),
      );
    },
    [boostsEnabled, consent],
  );

  return {
    fetchAd: fetchAdQuery,
    isAdConsentReady: !!consent,
  };
};
