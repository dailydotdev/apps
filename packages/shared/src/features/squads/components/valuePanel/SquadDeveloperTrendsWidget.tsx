import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { developerTrendsQueryOptions } from '../../../../graphql/developerTrends';
import type { DeveloperTrends } from '../../../../graphql/developerTrends';
import { squadSubscriptionQueryOptions } from '../../../../graphql/squadSubscription';
import { useSquadPageContext } from '../../SquadPageContext';
import { getSquadId, hasSquadFeature } from '../../lib/features';
import { isStaffViewer } from '../../lib/viewer';
import { getSquadIntelUrl } from '../../lib/routes';
import { getIntelWeekLabel } from '../../lib/intel';
import { isCompanyPage } from '../../lib/companyPage';
import { DeveloperTrendsWidget } from './DeveloperTrendsWidget';

const TOPICS = 4;

/** The format that drew the most comments, as one line */
export const getTrendsTip = ({
  formats,
}: Pick<DeveloperTrends, 'formats'>): string | null => {
  const best = [...formats].sort((a, b) => b.comments - a.comments)[0];

  if (!best || best.comments <= 1) {
    return null;
  }

  return `${best.format} got ${best.comments.toFixed(
    1,
  )}x the comments of an average post.`;
};

/**
 * The week's developer trends in the right column of a free company page,
 * for its admins and moderators. Paid pages get their own intel instead.
 */
export const SquadDeveloperTrendsWidget = (): ReactElement | null => {
  const { squad, viewer, isViewerKnown } = useSquadPageContext();
  const { user } = useAuthContext();
  const sourceId = getSquadId(squad);
  const isCandidate =
    isViewerKnown &&
    isStaffViewer(viewer) &&
    isCompanyPage(squad) &&
    !hasSquadFeature(squad, 'verified');
  const { data: subscription } = useQuery({
    ...squadSubscriptionQueryOptions({ user, sourceId }),
    enabled: !!user && isCandidate,
  });
  const isFree = isCandidate && !!subscription && !subscription.plan;
  const { data: trends } = useQuery({
    ...developerTrendsQueryOptions(),
    enabled: isFree,
  });

  if (!isFree || !trends) {
    return null;
  }

  return (
    <DeveloperTrendsWidget
      weekLabel={getIntelWeekLabel(trends)}
      topics={trends.risingTopics
        .filter((topic) => topic.broad)
        .slice(0, TOPICS)}
      tip={getTrendsTip(trends)}
      reportUrl={getSquadIntelUrl(squad.handle)}
      upsell="The Startup plan sends you this report for your own topics every week, with post ideas."
    />
  );
};
