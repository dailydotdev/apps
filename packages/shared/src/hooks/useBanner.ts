import { useCallback, useContext, useMemo } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import AlertContext from '../contexts/AlertContext';
import { generateQueryKey, RequestKey } from '../lib/query';
import { Banner, BANNER_QUERY } from '../graphql/banner';
import { gqlClient } from '../graphql/common';

type UseBanner = {
  isAvailable: boolean;
  latestBanner?: Banner;
  dismiss: () => Promise<void>;
};

export function useBanner(): UseBanner {
  const { alerts, updateAlerts } = useContext(AlertContext);

  const { data: latestBanner } = useQuery(
    generateQueryKey(RequestKey.Banner, null),
    () => gqlClient.request(BANNER_QUERY, { lastSeen: alerts.lastBanner }),
    {
      enabled: !!alerts.banner,
    },
  );

  const isAvailable = useMemo(() => {
    const lastSeenBannerDate = Date.parse(alerts?.lastBanner);
    const latestBannerDate = Date.parse(latestBanner?.banner?.timestamp);

    if (Number.isNaN(latestBannerDate) || Number.isNaN(lastSeenBannerDate)) {
      return false;
    }

    return latestBannerDate > lastSeenBannerDate;
  }, [alerts.lastBanner, latestBanner?.banner?.timestamp]);

  const dismissMutation = useMutation(() => {
    const currentDate = new Date();

    return updateAlerts({
      lastBanner: currentDate.toISOString(),
    });
  });

  const dismiss = useCallback(async () => {
    if (dismissMutation.isLoading) {
      return;
    }

    await dismissMutation.mutateAsync();
  }, [dismissMutation]);

  return {
    isAvailable,
    latestBanner: latestBanner?.banner,
    dismiss,
  };
}
