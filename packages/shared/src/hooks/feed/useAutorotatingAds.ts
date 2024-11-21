import { useCallback, useContext, useEffect, useMemo } from 'react';
import {
  useQuery,
  useQueryClient,
  type InfiniteData,
  focusManager,
} from '@tanstack/react-query';
import {
  useInView,
  type InViewHookResponse,
} from 'react-intersection-observer';
import { useLogContext } from '../../contexts/LogContext';
import { ActiveFeedContext } from '../../contexts';
import { useFeature } from '../../components/GrowthBookProvider';
import { featureAutorotateAds } from '../../lib/featureManagement';
import type { Ad } from '../../graphql/posts';
import { generateAdLogEventKey } from './useLogImpression';
import { disabledRefetch } from '../../lib/func';
import { RequestKey } from '../../lib/query';
import { fetchAd } from '../../lib/ads';

export type InViewRef = InViewHookResponse['ref'];

export const useAutoRotatingAds = (
  ad: Ad,
  index: number,
  feedIndex: number,
  ref: InViewRef,
): {
  ref: InViewRef;
} => {
  const autorotateAds = useFeature(featureAutorotateAds);
  const { logEventEnd } = useLogContext();
  const { queryKey: feedQueryKey } = useContext(ActiveFeedContext);
  const queryClient = useQueryClient();
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.5,
    skip: !autorotateAds,
  });

  const refs = useCallback(
    (node: HTMLElement) => {
      ref(node);
      inViewRef(node);
    },
    [inViewRef, ref],
  );

  const queryKey = useMemo(
    () => [RequestKey.Ads, ...feedQueryKey],
    [feedQueryKey],
  );

  const fetchNewAd = useCallback(async (): Promise<Ad> => {
    const newAd = await fetchAd(true);
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
  }, [feedIndex, index, logEventEnd, queryClient, queryKey]);

  useQuery<Ad>({
    queryKey: [...queryKey, index],
    queryFn: fetchNewAd,
    enabled: !!autorotateAds,
    initialData: ad,
    staleTime: autorotateAds,
    // Disable refetching when the ad is not in view,
    // and resets the timer for when it is back in view
    refetchInterval: () => (inView ? autorotateAds : false),
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

  return { ref: refs };
};
