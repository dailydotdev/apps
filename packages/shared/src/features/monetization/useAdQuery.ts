import type { QueryKey } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useFeature } from '../../components/GrowthBookProvider';
import type { Ad } from '../../graphql/posts';
import { fetchAdByPlacement, resolveAdFetchOptions } from '../../lib/ads';
import type { FetchAdByPlacementOptions } from '../../lib/ads';
import { featurePostBoostAds } from '../../lib/featureManagement';
import { useAdMacroContext } from './useAdMacroContext';

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
  const consent = useAdMacroContext(enabled);
  const fetchOptions = useMemo(
    () =>
      resolveAdFetchOptions({
        placement,
        active,
        boostsEnabled,
        consent: consent ?? undefined,
      }),
    [placement, active, boostsEnabled, consent],
  );

  return useQuery<Ad | null>({
    // consent fingerprint so ads refetch when the user answers the CMP banner
    queryKey: [...queryKey, consent?.gdprApplies, consent?.consentString ?? ''],
    queryFn: () => fetchAdByPlacement(fetchOptions),
    enabled,
    staleTime,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};
