import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { squadAnalyticsQueryOptions } from '../../../../graphql/squads';
import { squadSubscriptionQueryOptions } from '../../../../graphql/squadSubscription';
import { LogEvent, Origin } from '../../../../lib/log';
import { useSquadPageContext } from '../../SquadPageContext';
import { getSquadId, hasSquadFeature } from '../../lib/features';
import { isStaffViewer } from '../../lib/viewer';
import { getStartupsCheckoutUrl } from '../../lib/routes';
import { isCompanyPage } from '../../lib/companyPage';
import { useStartupsCashbackPromo } from '../../hooks/useStartupsCashbackPromo';
import { getStartupsStarterOffer } from '../../hooks/useStartupsPromo';
import { useLogStartups } from '../../hooks/useLogStartups';
import { useSquadFreeBoost } from '../freeBoost/useSquadFreeBoost';
import { SquadFreeBoost } from '../freeBoost/SquadFreeBoost';
import { SquadValuePanel } from './SquadValuePanel';

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
  const { data: subscription } = useQuery({
    ...squadSubscriptionQueryOptions({ user, sourceId }),
    enabled: !!user && isShown,
  });
  const { data: analytics } = useQuery({
    ...squadAnalyticsQueryOptions({ sourceId }),
    enabled: isShown && !boost,
  });
  const offer = getStartupsStarterOffer(useStartupsCashbackPromo());
  const logStartups = useLogStartups();

  if (!isShown) {
    return null;
  }

  if (boost) {
    return <SquadFreeBoost />;
  }

  if (!analytics || !subscription) {
    return null;
  }

  const isFree = !subscription.plan && !hasSquadFeature(squad, 'verified');

  return (
    <SquadValuePanel
      name={squad.name}
      stats={{
        impressions: analytics.impressions,
        reach: analytics.reach,
        clicks: analytics.clicks,
        engagement:
          analytics.upvotes + analytics.comments + analytics.bookmarks,
        followers: squad.membersCount ?? 0,
        agentViews: analytics.agentViews,
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
