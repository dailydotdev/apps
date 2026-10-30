import { useCallback, useContext, useEffect, useMemo } from 'react';
import type {
  InfiniteData,
  QueryObserverBaseResult,
} from '@tanstack/react-query';
import { useQuery, useQueryClient, focusManager } from '@tanstack/react-query';
import type { InViewHookResponse } from 'react-intersection-observer';
import { useInView } from 'react-intersection-observer';
import { useLogContext } from '../../contexts/LogContext';
import { ActiveFeedContext } from '../../contexts';
import { useFeature } from '../../components/GrowthBookProvider';
import { featureAutorotateAds } from '../../lib/featureManagement';
import type { Ad } from '../../graphql/posts';
import { generateAdLogEventKey } from './useLogImpression';
import { disabledRefetch } from '../../lib/func';
import { AdPlacement } from '../../lib/ads';
import { RequestKey } from '../../lib/query';
import { useFetchAd } from '../../features/monetization/useFetchAd';
import { getAdConsentQueryKey } from '../../features/monetization/adConsent';

export type InViewRef = InViewHookResponse['ref'];

export const useAutoRotatingAds = (
  ad: Ad,
  index: number,
  feedIndex: number,
  ref: InViewRef,
  disabled = false,
): {
  ref: InViewRef;
  refetch: QueryObserverBaseResult<Ad | null>['refetch'];
  isRefetching: QueryObserverBaseResult<Ad | null>['isRefetching'];
} => {
  const autorotateFlag = useFeature(featureAutorotateAds);
  const autorotateAds = disabled ? 0 : autorotateFlag ?? 0;
  const { logEventEnd } = useLogContext();
  const { queryKey: feedQueryKey = [] } = useContext(ActiveFeedContext);
  const queryClient = useQueryClient();
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.5,
    skip: !autorotateAds,
  });

  const rotationTime = (autorotateAds ?? 0) * 1_000;

  const refs = useCallback(
    (node?: Element | null) => {
      ref?.(node);
      inViewRef(node);
    },
    [inViewRef, ref],
  );

  const { fetchAd, isAdConsentReady, consent } = useFetchAd(!!autorotateAds);
  const queryKey = useMemo(
    () => [RequestKey.Ads, ...feedQueryKey, ...getAdConsentQueryKey(consent)],
    [feedQueryKey, consent],
  );

  const fetchNewAd = useCallback(async (): Promise<Ad | null> => {
    const newAd = await fetchAd({
      placement: AdPlacement.Feed,
      active: true,
    });
    if (!newAd) {
      return null;
    }

    // End the impression event for the old ad
    logEventEnd(generateAdLogEventKey(feedIndex));

    queryClient.setQueryData(
      queryKey,
      (currentData: InfiniteData<Ad, unknown>) => {
        const data = currentData;
        data.pages[index] = newAd;
        data.pageParams[index] = Date.now();
        return data;
      },
    );

    return newAd;
  }, [feedIndex, index, logEventEnd, fetchAd, queryClient, queryKey]);

  const { refetch, isRefetching } = useQuery<Ad | null>({
    queryKey: [...queryKey, index],
    queryFn: fetchNewAd,
    enabled: !!autorotateAds && isAdConsentReady,
    initialData: ad,
    staleTime: rotationTime,
    // Disable refetching when the ad is not in view,
    // and resets the timer for when it is back in view
    refetchInterval: () => (inView && isAdConsentReady ? rotationTime : false),
    ...disabledRefetch,
  });

  // Disable refetching when the window is not in focus
  useEffect(() => {
    focusManager.setEventListener((handleFocus) => {
      if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('blur', () => handleFocus(false), false);
      }

      return () => {
        window.removeEventListener('blur', () => handleFocus(false));
      };
    });

    focusManager.setEventListener((handleFocus) => {
      if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('focus', () => handleFocus(true), false);
      }

      return () => {
        window.removeEventListener('focus', () => handleFocus(true));
      };
    });
  }, []);

  return { ref: refs, refetch, isRefetching };
};
