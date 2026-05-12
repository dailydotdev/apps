import { useCallback, useContext, useMemo } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import AlertContext from '../contexts/AlertContext';
import { generateQueryKey, RequestKey } from '../lib/query';
import type { Banner } from '../graphql/banner';
import { BANNER_QUERY } from '../graphql/banner';
import { gqlClient } from '../graphql/common';
import { hackathonParticipationQueryOptions } from '../features/hackathon/queries';
import { useAuthContext } from '../contexts/AuthContext';

type UseBanner = {
  isAvailable: boolean;
  latestBanner?: Banner;
  dismiss: () => Promise<void>;
};

export function useBanner(): UseBanner {
  const { alerts, updateAlerts } = useContext(AlertContext);
  const { user, isLoggedIn } = useAuthContext();

  const { data: latestBanner } = useQuery({
    queryKey: generateQueryKey(RequestKey.Banner, null),
    queryFn: () =>
      gqlClient.request(BANNER_QUERY, { lastSeen: alerts.lastBanner }),
    enabled: !!alerts.banner,
  });

  const isHackathonBanner =
    latestBanner?.banner?.title === 'daily.dev Hackathon';

  const { data: hackathonParticipation, isPending } = useQuery({
    ...hackathonParticipationQueryOptions(user),
    enabled: isLoggedIn && isHackathonBanner,
  });

  const isAvailable = useMemo(() => {
    if (
      isHackathonBanner &&
      !isPending &&
      !!hackathonParticipation?.whoami?.isHackathonParticipant
    ) {
      return false;
    }

    const lastSeenBannerDate = Date.parse(alerts?.lastBanner);
    const latestBannerDate = Date.parse(latestBanner?.banner?.timestamp);

    if (Number.isNaN(latestBannerDate) || Number.isNaN(lastSeenBannerDate)) {
      return false;
    }

    return latestBannerDate > lastSeenBannerDate;
  }, [
    alerts?.lastBanner,
    hackathonParticipation?.whoami?.isHackathonParticipant,
    isHackathonBanner,
    isPending,
    latestBanner?.banner?.timestamp,
  ]);

  const dismissMutation = useMutation({
    mutationFn: () => {
      const currentDate = new Date();

      return updateAlerts({
        lastBanner: currentDate.toISOString(),
      });
    },
  });

  const dismiss = useCallback(async () => {
    if (dismissMutation.isPending) {
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
