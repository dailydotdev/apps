import type { QueryKey, UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useFeature } from '../../components/GrowthBookProvider';
import type { Ad } from '../../graphql/posts';
import { fetchAdByPlacement, resolveAdFetchOptions } from '../../lib/ads';
import type { FetchAdByPlacementOptions } from '../../lib/ads';
import { featurePostBoostAds } from '../../lib/featureManagement';
import { useAuthContext } from '../../contexts/AuthContext';
import { useAdRequestConsent } from './useAdRequestConsent';
import { useAdPageViewId } from './useAdPageViewId';

interface UseAdQueryOptions {
  queryKey: QueryKey;
  enabled?: boolean;
  staleTime?: number;
  placement: FetchAdByPlacementOptions['placement'];
  active?: boolean;
  retry?: UseQueryOptions<Ad | null>['retry'];
  /**
   * Serve a fresh ad on every page view, e.g. each time a post is opened,
   * including reopening one already seen. Only for ads that belong to the
   * page itself. Persistent slots such as the feed widget or hero leave it
   * off, or they refetch whenever a post modal opens over the feed.
   */
  refreshOnPageView?: boolean;
}

export const useAdQuery = ({
  queryKey,
  enabled = true,
  staleTime,
  placement,
  active,
  retry,
  refreshOnPageView = false,
}: UseAdQueryOptions) => {
  const boostsEnabled = useFeature(featurePostBoostAds);
  const consent = useAdRequestConsent(enabled);
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const registered = isAuthReady ? isLoggedIn : undefined;
  const pageViewId = useAdPageViewId();
  const fetchOptions = useMemo(
    () =>
      resolveAdFetchOptions({
        placement,
        active,
        boostsEnabled,
        consent: consent ?? undefined,
        registered,
        pageViewId,
      }),
    [placement, active, boostsEnabled, consent, registered, pageViewId],
  );

  return useQuery<Ad | null>({
    // the page-view id, for page-owned ads, so each page view gets a fresh
    // ad. It is sent with every request either way. Then the consent
    // fingerprint so ads refetch when the user answers the CMP banner, and
    // login state so signing in swaps an anonymous-only ad
    queryKey: [
      ...queryKey,
      ...(refreshOnPageView ? [pageViewId] : []),
      consent?.gdprApplies,
      consent?.consentString ?? '',
      consent?.consentExists ?? '',
      isLoggedIn,
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
