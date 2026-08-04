import { useCallback } from 'react';
import { useFeature } from '../../components/GrowthBookProvider';
import type { Ad } from '../../graphql/posts';
import {
  AdPlacement,
  fetchAdByPlacement,
  resolveAdFetchOptions,
} from '../../lib/ads';
import { featurePostBoostAds } from '../../lib/featureManagement';
import { useAdMacroContext } from './useAdMacroContext';

interface UseFetchAds {
  fetchAd: (params: {
    active?: boolean;
    placement?: AdPlacement;
  }) => Promise<Ad | null>;
}

export const useFetchAd = (): UseFetchAds => {
  const boostsEnabled = useFeature(featurePostBoostAds);
  const consent = useAdMacroContext(true) ?? undefined;

  const fetchAdQuery: UseFetchAds['fetchAd'] = useCallback(
    ({ active, placement = AdPlacement.Feed }) => {
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
  };
};
