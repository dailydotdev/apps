import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { addDays, subDays } from 'date-fns';
import type { Squad } from '../../../graphql/sources';
import { SourcePermissions } from '../../../graphql/sources';
import type { SquadAnalytics } from '../../../graphql/squads';
import {
  squadAnalyticsHistoryQueryOptions,
  squadAnalyticsQueryOptions,
  verifyPermission,
} from '../../../graphql/squads';
import { useAuthContext } from '../../../contexts/AuthContext';
import { dateFormatInTimezone, DEFAULT_TIMEZONE } from '../../../lib/timezones';

export const SQUAD_ANALYTICS_HISTORY_DAYS = 45;

export interface SquadImpressionNode {
  name: string;
  value: number;
  isBoosted: boolean;
}

interface UseSquadAnalytics {
  canViewAnalytics: boolean;
  analytics?: SquadAnalytics;
  impressions: SquadImpressionNode[];
  hasImpressions: boolean;
}

const getDayLabel = (date: Date): string =>
  date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const useSquadAnalytics = (squad?: Squad): UseSquadAnalytics => {
  const { user } = useAuthContext();
  const timezone = user?.timezone || DEFAULT_TIMEZONE;
  const canViewAnalytics =
    !!squad && verifyPermission(squad, SourcePermissions.ViewAnalytics);

  const { data: analytics } = useQuery({
    ...squadAnalyticsQueryOptions({ sourceId: squad?.id }),
    enabled: !!squad?.id && canViewAnalytics,
  });

  const { data: history } = useQuery({
    ...squadAnalyticsHistoryQueryOptions({ sourceId: squad?.id }),
    enabled: !!squad?.id && canViewAnalytics,
  });

  const impressions = useMemo((): SquadImpressionNode[] => {
    if (!history) {
      return [];
    }

    const byDate = history.reduce<Record<string, SquadImpressionNode>>(
      (acc, item) => {
        const date = new Date(item.date);
        acc[dateFormatInTimezone(date, 'yyyy-MM-dd', timezone)] = {
          name: getDayLabel(date),
          value: item.impressions,
          isBoosted: item.impressionsAds > 0,
        };

        return acc;
      },
      {},
    );
    const cutOff = subDays(new Date(), SQUAD_ANALYTICS_HISTORY_DAYS - 1);

    return Array.from({ length: SQUAD_ANALYTICS_HISTORY_DAYS }, (_, index) => {
      const day = addDays(cutOff, index);
      const key = dateFormatInTimezone(day, 'yyyy-MM-dd', timezone);

      return (
        byDate[key] ?? { name: getDayLabel(day), value: 0, isBoosted: false }
      );
    });
  }, [history, timezone]);

  return {
    canViewAnalytics,
    analytics,
    impressions,
    hasImpressions: impressions.some((item) => item.value > 0),
  };
};
