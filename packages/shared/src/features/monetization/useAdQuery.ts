import type { QueryKey, UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { Ad } from '../../graphql/posts';
import { fetchAdByPlacement, resolveAdFetchOptions } from '../../lib/ads';
import type { FetchAdByPlacementOptions } from '../../lib/ads';
import { useAuthContext } from '../../contexts/AuthContext';
import { useAdRequestConsent } from './useAdRequestConsent';
import { useAdPageViewId } from './useAdPageViewId';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import {
  AdRefreshEngineVersion,
  featureAdRefreshEngine,
} from '../../lib/featureManagement';
import { getAdRefreshPlatform } from './refresh/adRefresh';

interface UseAdQueryOptions {
  queryKey: QueryKey;
  enabled?: boolean;
  staleTime?: number;
  /** How long the ad outlives the last slot showing it. */
  gcTime?: number;
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
  /**
   * For a slot that refreshes its creative the way the feed's ads do. On the
   * v2 refresh engine (`ad_refresh_engine_config`), the first request then
   * says so, as the feed's own ad requests do, and Skadi answers with the
   * creative's refresh policy. Without it the slot has nothing to refresh by.
   */
  isRefreshable?: boolean;
}

export const useAdQuery = ({
  queryKey,
  enabled = true,
  staleTime,
  gcTime,
  placement,
  active,
  retry,
  refreshOnPageView = false,
  isRefreshable = false,
}: UseAdQueryOptions) => {
  const consent = useAdRequestConsent(enabled);
  const { isAuthReady, isLoggedIn, isAndroidApp } = useAuthContext();
  const { value: refreshEngine, isLoading: isRefreshEngineLoading } =
    useConditionalFeature({
      feature: featureAdRefreshEngine,
      shouldEvaluate: enabled && isRefreshable,
    });
  const isRefreshEngine =
    isRefreshable && refreshEngine === AdRefreshEngineVersion.V2;
  const registered = isAuthReady ? isLoggedIn : undefined;
  const pageViewId = useAdPageViewId();
  const fetchOptions = useMemo(
    () => ({
      ...resolveAdFetchOptions({
        placement,
        active,
        consent: consent ?? undefined,
        registered,
        pageViewId,
      }),
      ...(isRefreshEngine && {
        refresh: { platform: getAdRefreshPlatform(isAndroidApp), count: 0 },
      }),
    }),
    [
      placement,
      active,
      consent,
      registered,
      pageViewId,
      isRefreshEngine,
      isAndroidApp,
    ],
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
    // A refreshable slot waits for the engine flag, so its first request
    // already asks for the refresh policy when the engine is on.
    enabled: enabled && !!consent && !(isRefreshable && isRefreshEngineLoading),
    staleTime,
    ...(gcTime !== undefined && { gcTime }),
    // an explicit undefined would replace the client's default retry rule
    ...(retry !== undefined && { retry }),
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};
