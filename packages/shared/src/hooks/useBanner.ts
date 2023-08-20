import { useContext, useMemo } from 'react';
import { useMutation, useQuery } from 'react-query';
import request from 'graphql-request';
import AlertContext from '../contexts/AlertContext';
import { generateQueryKey, RequestKey } from '../lib/query';
import { graphqlUrl } from '../lib/config';
import { Banner, BANNER_QUERY } from '../graphql/banner';

type UseBanner = {
  isAvailable: boolean;
  latestBanner?: Banner;
  dismiss: () => Promise<void>;
};

export function useBanner(): UseBanner {
  const { alerts, updateAlerts } = useContext(AlertContext);

  const { data: latestBanner } = useQuery(
    generateQueryKey(RequestKey.Banner, null),
    () => request(graphqlUrl, BANNER_QUERY, { lastSeen: alerts.lastBanner }),
    {
      enabled: !!alerts.banner,
    },
  );

  const isAvailable = useMemo(() => {
    const lastBannerDate = Date.parse(alerts?.lastBanner);
    const lastPostDate = Date.parse(latestBanner?.banner?.timestamp);

    if (Number.isNaN(lastBannerDate) || Number.isNaN(lastPostDate)) {
      return false;
    }

    return lastPostDate > lastBannerDate;
  }, [alerts.lastBanner, latestBanner?.banner?.timestamp]);

  const dismissMutation = useMutation(() => {
    const currentDate = new Date();

    return updateAlerts({
      lastBanner: currentDate.toISOString(),
    });
  });

  const dismiss = async () => {
    if (dismissMutation.isLoading) {
      return;
    }

    await dismissMutation.mutateAsync();
  };

  return {
    isAvailable,
    latestBanner: latestBanner?.banner,
    dismiss,
  };
}
