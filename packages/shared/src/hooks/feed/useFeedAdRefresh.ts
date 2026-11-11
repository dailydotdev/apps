import { useCallback, useContext } from 'react';
import type { InfiniteData } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useLogContext } from '../../contexts/LogContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { ActiveFeedContext } from '../../contexts/ActiveFeedContext';
import { useFeature } from '../../components/GrowthBookProvider';
import {
  AdRefreshEngineVersion,
  featureAdRefreshEngine,
} from '../../lib/featureManagement';
import type { Ad } from '../../graphql/posts';
import { AdActions, AdPlacement } from '../../lib/ads';
import { adLogEvent } from '../../lib/feed';
import { RequestKey } from '../../lib/query';
import { useFetchAd } from '../../features/monetization/useFetchAd';
import {
  AdRefreshOutcome,
  AdRefreshSlot,
  getAdRefreshLogExtra,
  getAdRefreshPlatform,
  getAdRefreshStopLogExtra,
} from '../../features/monetization/refresh/adRefresh';
import type {
  AdRefreshAttempt,
  AdRefreshStop,
} from '../../features/monetization/refresh/useAdRefresh';
import {
  carryAdRefreshSlot,
  useAdRefresh,
} from '../../features/monetization/refresh/useAdRefresh';
import { generateAdLogEventKey } from './useLogImpression';
import type { InViewRef } from './useAutoRotatingAds';
import { useAutoRotatingAds } from './useAutoRotatingAds';

const slot = AdRefreshSlot.FeedCard;

export const useFeedAdRefresh = (
  ad: Ad,
  index: number,
  feedIndex: number,
  ref: InViewRef,
  disabled = false,
): { ref: InViewRef; onAdClick: () => void } => {
  const isRefreshEngine =
    useFeature(featureAdRefreshEngine) === AdRefreshEngineVersion.V2;
  const legacy = useAutoRotatingAds(
    ad,
    index,
    feedIndex,
    ref,
    disabled || isRefreshEngine,
  );
  const { logEvent, logEventEnd } = useLogContext();
  const { queryKey: feedQueryKey } = useContext(ActiveFeedContext);
  const queryClient = useQueryClient();
  const { fetchAd, isAdConsentReady } = useFetchAd(
    isRefreshEngine && !disabled,
  );
  const { isAndroidApp } = useAuthContext();

  const onRefresh = useCallback(
    async ({
      count,
      sessionCount,
      policy,
      stats,
    }: AdRefreshAttempt): Promise<AdRefreshOutcome> => {
      const logRefresh = (outcome: AdRefreshOutcome, nextAd?: Ad) =>
        logEvent(
          adLogEvent(AdActions.Refresh, ad, {
            extra: getAdRefreshLogExtra({
              slot,
              platform: getAdRefreshPlatform(isAndroidApp),
              providerId: ad.providerId,
              count,
              sessionCount,
              policy,
              stats,
              outcome,
              nextGenerationId: nextAd?.generationId,
            }),
          }),
        );

      let newAd: Ad | null;
      try {
        newAd = await fetchAd({
          placement: AdPlacement.Feed,
          active: true,
          refresh: { count, generationId: ad.generationId },
        });
      } catch {
        logRefresh(AdRefreshOutcome.Failed);
        return AdRefreshOutcome.Failed;
      }

      if (!newAd) {
        logRefresh(AdRefreshOutcome.NoFill);
        return AdRefreshOutcome.NoFill;
      }

      carryAdRefreshSlot(ad.generationId, newAd.generationId);
      logRefresh(AdRefreshOutcome.Refreshed, newAd);
      logEventEnd(generateAdLogEventKey(feedIndex));

      queryClient.setQueryData<InfiniteData<Ad, unknown>>(
        [RequestKey.Ads, ...(feedQueryKey ?? [])],
        (data) =>
          data && {
            ...data,
            pages: data.pages.map((page, pageIndex) =>
              pageIndex === index ? newAd : page,
            ),
            pageParams: data.pageParams.map((param, pageIndex) =>
              pageIndex === index ? Date.now() : param,
            ),
          },
      );

      return AdRefreshOutcome.Refreshed;
    },
    [
      ad,
      feedIndex,
      feedQueryKey,
      fetchAd,
      index,
      isAndroidApp,
      logEvent,
      logEventEnd,
      queryClient,
    ],
  );

  const onStop = useCallback(
    ({ reason, count, sessionCount, policy }: AdRefreshStop) =>
      logEvent(
        adLogEvent(AdActions.RefreshStop, ad, {
          extra: getAdRefreshStopLogExtra({
            slot,
            platform: getAdRefreshPlatform(isAndroidApp),
            providerId: ad.providerId,
            reason,
            count,
            sessionCount,
            policy,
          }),
        }),
      ),
    [ad, isAndroidApp, logEvent],
  );

  const { ref: engineRef, onAdClick } = useAdRefresh({
    id: ad.generationId,
    refresh: ad.refresh,
    disabled: disabled || !isRefreshEngine || !isAdConsentReady,
    onRefresh,
    onStop,
  });

  const engineRefs = useCallback(
    (node?: Element | null) => {
      ref?.(node);
      engineRef(node);
    },
    [engineRef, ref],
  );

  return { ref: isRefreshEngine ? engineRefs : legacy.ref, onAdClick };
};
