import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  startOfWeek,
  startOfMonth,
  isAfter,
  parseISO,
  isEqual,
} from 'date-fns';
import { ActivityContainer } from '../../../../components/profile/ActivitySection';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import { Tooltip } from '../../../../components/tooltip/Tooltip';
import { InfoIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import { gqlClient } from '../../../../graphql/common';
import type {
  UserProfileAnalytics,
  UserProfileAnalyticsHistory,
} from '../../../../graphql/users';
import {
  USER_PROFILE_ANALYTICS_HISTORY_QUERY,
  USER_PROFILE_ANALYTICS_QUERY,
} from '../../../../graphql/users';
import { generateQueryKey, RequestKey } from '../../../../lib/query';
import { largeNumberFormat } from '../../../../lib';
import { SummaryCard } from './BadgesAndAwardsComponents';
import { ElementPlaceholder } from '../../../../components/ElementPlaceholder';

interface ProfileViewsWidgetProps {
  userId: string;
}

interface HistoryQueryResult {
  userProfileAnalyticsHistory: {
    edges: Array<{
      node: UserProfileAnalyticsHistory;
    }>;
  };
}

interface AnalyticsQueryResult {
  userProfileAnalytics: UserProfileAnalytics | null;
}

const ProfileViewsWidgetSkeleton = (): ReactElement => {
  return (
    <ActivityContainer data-testid="ProfileViewsWidgetSkeleton">
      <Typography
        tag={TypographyTag.H2}
        type={TypographyType.Callout}
        color={TypographyColor.Primary}
        bold
        className="flex items-center gap-1"
      >
        Profile Activity
        <Tooltip content="We started counting profile views from 23/01/2026">
          <div>
            <InfoIcon className="text-text-disabled" size={IconSize.Size16} />
          </div>
        </Tooltip>
      </Typography>
      <div className="my-3 flex flex-col gap-2">
        <div className="flex gap-2">
          <ElementPlaceholder className="flex flex-1 flex-col items-center rounded-10 p-2">
            <ElementPlaceholder className="h-6 w-8 rounded-4" />
            <ElementPlaceholder className="mt-1 h-4 w-16 rounded-4" />
          </ElementPlaceholder>
          <ElementPlaceholder className="flex flex-1 flex-col items-center rounded-10 p-2">
            <ElementPlaceholder className="h-6 w-8 rounded-4" />
            <ElementPlaceholder className="mt-1 h-4 w-16 rounded-4" />
          </ElementPlaceholder>
        </div>
        <ElementPlaceholder className="flex flex-col items-center rounded-10 p-2">
          <ElementPlaceholder className="h-6 w-8 rounded-4" />
          <ElementPlaceholder className="mt-1 h-4 w-16 rounded-4" />
        </ElementPlaceholder>
      </div>
    </ActivityContainer>
  );
};

export const ProfileViewsWidget = ({
  userId,
}: ProfileViewsWidgetProps): ReactElement => {
  const { data: historyData, isPending: isHistoryPending } =
    useQuery<HistoryQueryResult>({
      queryKey: generateQueryKey(RequestKey.ProfileAnalyticsHistory, {
        id: userId,
      }),
      queryFn: () =>
        gqlClient.request(USER_PROFILE_ANALYTICS_HISTORY_QUERY, {
          userId,
          first: 31,
        }),
      enabled: !!userId,
      refetchOnWindowFocus: false,
    });

  const { data: analyticsData, isPending: isAnalyticsPending } =
    useQuery<AnalyticsQueryResult>({
      queryKey: generateQueryKey(RequestKey.ProfileAnalytics, { id: userId }),
      queryFn: () =>
        gqlClient.request(USER_PROFILE_ANALYTICS_QUERY, {
          userId,
        }),
      enabled: !!userId,
      refetchOnWindowFocus: false,
    });

  const { thisWeek, thisMonth } = useMemo(() => {
    if (!historyData?.userProfileAnalyticsHistory?.edges) {
      return { thisWeek: 0, thisMonth: 0 };
    }

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);

    let weekTotal = 0;
    let monthTotal = 0;

    historyData.userProfileAnalyticsHistory.edges.forEach(({ node }) => {
      const entryDate = parseISO(node.date);

      if (isAfter(entryDate, monthStart) || isEqual(entryDate, monthStart)) {
        monthTotal += node.uniqueVisitors;
      }

      if (isAfter(entryDate, weekStart) || isEqual(entryDate, weekStart)) {
        weekTotal += node.uniqueVisitors;
      }
    });

    return { thisWeek: weekTotal, thisMonth: monthTotal };
  }, [historyData]);

  const total = analyticsData?.userProfileAnalytics?.uniqueVisitors ?? 0;

  if (isHistoryPending || isAnalyticsPending) {
    return <ProfileViewsWidgetSkeleton />;
  }

  return (
    <ActivityContainer>
      <Typography
        tag={TypographyTag.H2}
        type={TypographyType.Callout}
        color={TypographyColor.Primary}
        bold
        className="flex items-center gap-1"
      >
        Profile Activity
        <Tooltip content="Profile views are counted from 23/01/2026">
          <div>
            <InfoIcon className="text-text-disabled" size={IconSize.Size16} />
          </div>
        </Tooltip>
      </Typography>
      <div className="my-3 flex flex-col gap-2">
        <div className="flex gap-2">
          <SummaryCard
            count={largeNumberFormat(thisWeek)}
            label="Views this week"
          />
          <SummaryCard
            count={largeNumberFormat(thisMonth)}
            label="Views this month"
          />
        </div>
        <SummaryCard
          count={largeNumberFormat(total)}
          label="Total profile views"
        />
      </div>
    </ActivityContainer>
  );
};
