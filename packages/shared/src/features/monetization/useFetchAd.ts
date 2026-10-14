import { useCallback } from 'react';
import { useFeature } from '../../components/GrowthBookProvider';
import type { Ad } from '../../graphql/posts';
import {
  AdPlacement,
  fetchAdByPlacement,
  resolveAdFetchOptions,
} from '../../lib/ads';
import { featurePostBoostAds } from '../../lib/featureManagement';
import { useAuthContext } from '../../contexts/AuthContext';
import { useAdRequestConsent } from './useAdRequestConsent';
import type { AdRequestConsent } from './adConsent';
import { useAdPageViewId } from './useAdPageViewId';

interface UseFetchAds {
  pageViewId?: string;
  consent?: AdRequestConsent;
  fetchAd: (params: {
    active?: boolean;
    placement?: AdPlacement;
  }) => Promise<Ad | null>;
}

export const useFetchAd = (): UseFetchAds => {
  const boostsEnabled = useFeature(featurePostBoostAds);
  const consent = useAdRequestConsent(true) ?? undefined;
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const registered = isAuthReady ? isLoggedIn : undefined;
  const pageViewId = useAdPageViewId();

  const fetchAdQuery: UseFetchAds['fetchAd'] = useCallback(
    ({ active, placement = AdPlacement.Feed }) => {
      return fetchAdByPlacement(
        resolveAdFetchOptions({
          placement,
          active,
          boostsEnabled,
          consent,
          registered,
          pageViewId,
        }),
      );
    },
    [boostsEnabled, consent, registered, pageViewId],
  );

  return {
    fetchAd: fetchAdQuery,
    pageViewId,
    consent,
  };
};
