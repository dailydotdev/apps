import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { squadAnalyticsQueryOptions } from '../../../../graphql/squads';
import { squadSubscriptionQueryOptions } from '../../../../graphql/squadSubscription';
import { squadFreeBoostQueryOptions } from '../../../../graphql/squadFreeBoost';
import { LogEvent, Origin } from '../../../../lib/log';
import { useSquadPageContext } from '../../SquadPageContext';
import { getSquadId, hasSquadFeature } from '../../lib/features';
import { isStaffViewer } from '../../lib/viewer';
import {
  getSquadManageUrl,
  getStartupsCheckoutUrl,
  SquadManageSection,
} from '../../lib/routes';
import { isCompanyPage } from '../../lib/companyPage';
import { useStartupsCashbackPromo } from '../../hooks/useStartupsCashbackPromo';
import { getStartupsStarterOffer } from '../../hooks/useStartupsPromo';
import { useLogStartups } from '../../hooks/useLogStartups';
import { useSquadFreeBoost } from '../freeBoost/useSquadFreeBoost';
import { SquadFreeBoost } from '../freeBoost/SquadFreeBoost';
import { SquadValuePanel, SquadValuePanelPlaceholder } from './SquadValuePanel';

/**
 * The top of a company page's feed, for its admins and moderators: the free
 * boost while it has something to say, then what daily.dev did for the page.
 * On the free plan this is the page's one place that sells Starter.
 */
export const SquadCompanyValue = (): ReactElement | null => {
  const { squad, viewer, isViewerKnown } = useSquadPageContext();
  const { user } = useAuthContext();
  const sourceId = getSquadId(squad);
  const isShown =
    isViewerKnown && isStaffViewer(viewer) && isCompanyPage(squad);
  const boost = useSquadFreeBoost(squad);
  // Fetched together and shown once all are in, so nothing pops in above the
  // feed after the placeholder
  const { isPending: isBoostPending } = useQuery({
    ...squadFreeBoostQueryOptions({ user, sourceId }),
    enabled: !!user && isShown,
  });
  const { data: subscription, isPending: isSubscriptionPending } = useQuery({
    ...squadSubscriptionQueryOptions({ user, sourceId }),
    enabled: !!user && isShown,
  });
  const { data: analytics, isPending: isAnalyticsPending } = useQuery({
    ...squadAnalyticsQueryOptions({ sourceId }),
    enabled: isShown,
  });
  const offer = getStartupsStarterOffer(useStartupsCashbackPromo());
  const logStartups = useLogStartups();

  if (!isShown) {
    return null;
  }

  if (boost) {
    return <SquadFreeBoost />;
  }

  if (isBoostPending || isSubscriptionPending || isAnalyticsPending) {
    return <SquadValuePanelPlaceholder />;
  }

  if (!subscription) {
    return null;
  }

  const isFree = !subscription.plan && !hasSquadFeature(squad, 'verified');

  return (
    <SquadValuePanel
      name={squad.name}
      analyticsUrl={getSquadManageUrl(
        squad.handle,
        SquadManageSection.Analytics,
      )}
      stats={{
        impressions: analytics?.impressions ?? 0,
        reach: analytics?.reach ?? 0,
        clicks: analytics?.clicks ?? 0,
        engagement:
          (analytics?.upvotes ?? 0) +
          (analytics?.comments ?? 0) +
          (analytics?.bookmarks ?? 0),
        followers: squad.membersCount ?? 0,
        agentViews: isFree
          ? null
          : (analytics?.agentViews ?? 0) + (analytics?.agentViewsBot ?? 0),
      }}
      upgrade={
        isFree
          ? {
              offer,
              checkoutUrl: getStartupsCheckoutUrl({ sourceId }),
              onClick: () =>
                logStartups(LogEvent.UpgradeSubscription, 'value panel', {
                  origin: Origin.SquadPage,
                  source_id: sourceId,
                }),
            }
          : undefined
      }
    />
  );
};
