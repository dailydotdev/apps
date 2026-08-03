import type { QueryKey } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useFeature } from '../../components/GrowthBookProvider';
import type { Ad } from '../../graphql/posts';
import { fetchAdByPlacement, resolveAdFetchOptions } from '../../lib/ads';
import type { FetchAdByPlacementOptions } from '../../lib/ads';
import {
  featureIubendaCmp,
  featurePostBoostAds,
} from '../../lib/featureManagement';
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
  const cmpEnabled = useFeature(featureIubendaCmp);
  const macroContext = useAdMacroContext(enabled);
  // consent params ride on ad requests only for CMP users; with the flag off
  // the request is byte-identical to the pre-CMP one
  const consent = cmpEnabled ? macroContext ?? undefined : undefined;
  const fetchOptions = useMemo(
    () =>
      resolveAdFetchOptions({
        placement,
        active,
        boostsEnabled,
        consent,
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
