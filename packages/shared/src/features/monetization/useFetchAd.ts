import { useCallback } from 'react';
import { useFeature } from '../../components/GrowthBookProvider';
import type { Ad } from '../../graphql/posts';
import { fetchAd } from '../../lib/ads';
import { featurePostBoostAds } from '../../lib/featureManagement';

interface UseFetchAds {
  fetchAd: (params: { active?: boolean }) => Promise<Ad | null>;
}

export const useFetchAd = (): UseFetchAds => {
  const isEnabled = useFeature(featurePostBoostAds);

  const fetchAdQuery: UseFetchAds['fetchAd'] = useCallback(
    ({ active }) => {
      const params = new URLSearchParams({
        active: active ? 'true' : 'false',
      });

      if (isEnabled) {
        params.append('allow_post_boost', 'true');
      }

      return fetchAd(params);
    },
    [isEnabled],
  );

  return {
    fetchAd: fetchAdQuery,
  };
};
