import { useQuery } from '@tanstack/react-query';
import type { Squad } from '../../../graphql/sources';
import { useAuthContext } from '../../../contexts/AuthContext';
import { squadAnalyticsQueryOptions } from '../../../graphql/squads';
import { squadSubscriptionQueryOptions } from '../../../graphql/squadSubscription';
import { squadFreeBoostQueryOptions } from '../../../graphql/squadFreeBoost';
import {
  developerTrendsQueryOptions,
  squadIntelHighlightsQueryOptions,
} from '../../../graphql/squadIntel';
import usePersistentContext from '../../../hooks/usePersistentContext';
import { getSquadId } from '../lib/features';
import { isCompanyPage } from '../lib/companyPage';
import { useCompanyPageReadiness } from '../components/readiness/useCompanyPageReadiness';

export const getSquadAgentWidgetDismissKey = (sourceId: string): string =>
  `squad_agent_widget_dismissed_${sourceId}`;

/**
 * Whether the data a company page's staff blocks render from (value panel or
 * first post card, plan badge, the side column's setup, intel, plan and agent)
 * is still loading. The queries go out in the same tick, so they share one
 * batched request, and the blocks wait for all of them.
 */
export const useSquadStaffLayerPending = (
  squad: Squad,
  isEnabled: boolean,
): boolean => {
  const { user } = useAuthContext();
  const sourceId = getSquadId(squad);
  const isShown = isEnabled && !!user && isCompanyPage(squad);
  const { data: subscription, isPending: isSubscriptionPending } = useQuery({
    ...squadSubscriptionQueryOptions({ user, sourceId }),
    enabled: isShown,
  });
  const { isPending: isBoostPending } = useQuery({
    ...squadFreeBoostQueryOptions({ user, sourceId }),
    enabled: isShown,
  });
  const { isPending: isAnalyticsPending } = useQuery({
    ...squadAnalyticsQueryOptions({ sourceId }),
    enabled: isShown,
  });
  const { isPending: isIntelPending } = useQuery(
    squadIntelHighlightsQueryOptions({
      user,
      sourceId,
      createdAt: squad.createdAt,
      enabled: isShown,
    }),
  );
  // The intel widget falls back to the trends without intel, so they are
  // fetched alongside instead of after it
  const { isPending: isTrendsPending } = useQuery(
    developerTrendsQueryOptions({ user, enabled: isShown }),
  );
  const readiness = useCompanyPageReadiness(
    squad,
    isShown && !isSubscriptionPending,
    subscription?.plan,
  );
  const [, , isAgentDismissFetched] = usePersistentContext(
    getSquadAgentWidgetDismissKey(sourceId),
    false,
  );

  if (!isShown) {
    return false;
  }

  return (
    isSubscriptionPending ||
    isBoostPending ||
    isAnalyticsPending ||
    isIntelPending ||
    isTrendsPending ||
    readiness.isPending ||
    !isAgentDismissFetched
  );
};
