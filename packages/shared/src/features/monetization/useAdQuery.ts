import type { QueryKey, UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useFeature } from '../../components/GrowthBookProvider';
import type { Ad } from '../../graphql/posts';
import { fetchAdByPlacement, resolveAdFetchOptions } from '../../lib/ads';
import type { FetchAdByPlacementOptions } from '../../lib/ads';
import { featurePostBoostAds } from '../../lib/featureManagement';
import { useAdMacroContext } from './useAdMacroContext';
import { useAuthContext } from '../../contexts/AuthContext';

interface UseAdQueryOptions {
  queryKey: QueryKey;
  enabled?: boolean;
  staleTime?: number;
  placement: FetchAdByPlacementOptions['placement'];
  active?: boolean;
  retry?: UseQueryOptions<Ad | null>['retry'];
}

export const useAdQuery = ({
  queryKey,
  enabled = true,
  staleTime,
  placement,
  active,
  retry,
}: UseAdQueryOptions) => {
  const boostsEnabled = useFeature(featurePostBoostAds);
  const consent = useAdMacroContext(enabled) ?? undefined;
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const registered = isAuthReady ? isLoggedIn : undefined;
  const fetchOptions = useMemo(
    () =>
      resolveAdFetchOptions({
        placement,
        active,
        boostsEnabled,
        consent,
        registered,
      }),
    [placement, active, boostsEnabled, consent, registered],
  );

  return useQuery<Ad | null>({
    // consent fingerprint so ads refetch when the user answers the CMP banner,
    // and login state so signing in swaps an anonymous-only ad
    queryKey: [
      ...queryKey,
      consent?.gdprApplies,
      consent?.consentString ?? '',
      isLoggedIn,
    ],
    queryFn: () => fetchAdByPlacement(fetchOptions),
    enabled,
    staleTime,
    // an explicit undefined would replace the client's default retry rule
    ...(retry !== undefined && { retry }),
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};
