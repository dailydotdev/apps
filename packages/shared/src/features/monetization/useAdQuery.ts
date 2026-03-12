import type { QueryKey } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useFeature } from '../../components/GrowthBookProvider';
import type { Ad } from '../../graphql/posts';
import { fetchAdByPlacement, resolveAdFetchOptions } from '../../lib/ads';
import type { FetchAdByPlacementOptions } from '../../lib/ads';
import { featurePostBoostAds } from '../../lib/featureManagement';

interface UseAdQueryOptions {
  queryKey: QueryKey;
  enabled?: boolean;
  staleTime?: number;
  placement: FetchAdByPlacementOptions['placement'];
  active?: boolean;
}

export const useAdQuery = ({
  queryKey,
  enabled = true,
  staleTime,
  placement,
  active,
}: UseAdQueryOptions) => {
  const boostsEnabled = useFeature(featurePostBoostAds);
  const fetchOptions = useMemo(
    () =>
      resolveAdFetchOptions({
        placement,
        active,
        boostsEnabled,
      }),
    [placement, active, boostsEnabled],
  );

  return useQuery<Ad | null>({
    queryKey,
    queryFn: () => fetchAdByPlacement(fetchOptions),
    enabled,
    staleTime,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};
