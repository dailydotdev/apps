import type { QueryKey, UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useFeature } from '../../components/GrowthBookProvider';
import type { Ad } from '../../graphql/posts';
import { fetchAdByPlacement, resolveAdFetchOptions } from '../../lib/ads';
import type { FetchAdByPlacementOptions } from '../../lib/ads';
import { featurePostBoostAds } from '../../lib/featureManagement';
import { useAdRequestConsent } from './useAdRequestConsent';
import { useAdPageViewId } from './useAdPageViewId';

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
  const consent = useAdRequestConsent(enabled);
  const pageViewId = useAdPageViewId();
  const fetchOptions = useMemo(
    () =>
      resolveAdFetchOptions({
        placement,
        active,
        boostsEnabled,
        consent: consent ?? undefined,
        pageViewId,
      }),
    [placement, active, boostsEnabled, consent, pageViewId],
  );

  return useQuery<Ad | null>({
    // consent fingerprint so ads refetch when the user answers the CMP banner
    queryKey: [
      ...queryKey,
      pageViewId,
      consent?.gdprApplies,
      consent?.consentString ?? '',
      consent?.consentExists ?? '',
    ],
    queryFn: async () => (consent ? fetchAdByPlacement(fetchOptions) : null),
    enabled: enabled && !!consent,
    staleTime,
    // an explicit undefined would replace the client's default retry rule
    ...(retry !== undefined && { retry }),
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};
