import type { ReactElement, ReactNode } from 'react';
import React, { useMemo, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import { DataTile } from '../../../../components/DataTile';
import { IconSize } from '../../../../components/Icon';
import {
  BookmarkIcon,
  ClickIcon,
  DiscussIcon,
  EyeIcon,
  MedalBadgeIcon,
  MergeIcon,
  ShareIcon,
  UpvoteIcon,
} from '../../../../components/icons';
import type { AnalyticsNumberList } from '../../../../components/analytics/common';
import { AnalyticsNumbersList } from '../../../../components/analytics/AnalyticsNumbersList';
import { CreatorPeriodSelect } from '../../../../components/analytics/creator/CreatorPeriodSelect';
import {
  CreatorOverviewSection,
  CreatorOverviewSkeleton,
} from '../../../../components/analytics/creator/CreatorOverviewSection';
import {
  CreatorImpressionsSection,
  CreatorImpressionsSkeleton,
} from '../../../../components/analytics/creator/CreatorImpressionsSection';
import type { CreatorPostSort } from '../../../../components/analytics/creator/CreatorPostPerformanceTable';
import { CreatorPostPerformanceTable } from '../../../../components/analytics/creator/CreatorPostPerformanceTable';
import { CreatorDashboardError } from '../../../../components/analytics/creator/CreatorDashboardError';
import { CreatorAnalyticsAudience } from '../../../../components/analytics/creator/common';
import {
  CreatorPerformancePeriod,
  CreatorPostSortBy,
  CreatorPostSortOrder,
  squadPerformanceQueryOptions,
  squadPostPerformanceQueryOptions,
} from '../../../../graphql/creatorAnalytics';
import { HorizontalSeparator } from '../../../../components/utilities/common';
import { useSquadPageContext } from '../../SquadPageContext';
import { useSquadAnalytics } from '../../hooks/useSquadAnalytics';
import { SquadManageSection } from '../../lib/routes';
import { SquadManageSectionPanel } from './SquadManageLayout';

const Section = ({
  title,
  action,
  children,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-4">
    {(title || action) && (
      <div className="flex flex-wrap items-center justify-between gap-2">
        {title && (
          <Typography type={TypographyType.Body} bold tag={TypographyTag.H2}>
            {title}
          </Typography>
        )}
        {action}
      </div>
    )}
    {children}
  </section>
);

export const SquadManageAnalytics = (): ReactElement => {
  const { squad } = useSquadPageContext();
  const { canViewAnalytics, analytics } = useSquadAnalytics(squad);
  const [period, setPeriod] = useState(CreatorPerformancePeriod.Last30Days);
  const [sort, setSort] = useState<CreatorPostSort>({
    sortBy: CreatorPostSortBy.PublishedAt,
    order: CreatorPostSortOrder.Desc,
  });

  const {
    data: performance,
    isPending: isPerformancePending,
    isError: isPerformanceError,
    isFetching: isPerformanceFetching,
    refetch: refetchPerformance,
  } = useQuery({
    ...squadPerformanceQueryOptions({ sourceId: squad?.id, period }),
    enabled: !!squad?.id && canViewAnalytics,
  });

  const {
    data: postsData,
    isPending: isPostsPending,
    isError: isPostsError,
    isFetching: isPostsFetching,
    refetch: refetchPosts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    ...squadPostPerformanceQueryOptions({
      sourceId: squad?.id,
      period,
      sortBy: sort.sortBy,
      order: sort.order,
    }),
    enabled: !!squad?.id && canViewAnalytics,
  });

  const posts = useMemo(
    () =>
      postsData?.pages.flatMap((page) => page.edges.map(({ node }) => node)) ??
      [],
    [postsData],
  );

  const hasNoPosts = !isPostsPending && !isPostsError && posts.length === 0;

  const engagement: AnalyticsNumberList = [
    { icon: <UpvoteIcon />, label: 'Upvotes', value: analytics?.upvotes ?? 0 },
    {
      icon: <MergeIcon />,
      label: 'Upvotes ratio',
      value: `${analytics?.upvotesRatio ?? 0}%`,
      tooltip: 'The percentage of upvotes out of total votes.',
    },
    {
      icon: <DiscussIcon />,
      label: 'Comments',
      value: analytics?.comments ?? 0,
    },
    {
      icon: <BookmarkIcon />,
      label: 'Bookmarks',
      value: analytics?.bookmarks ?? 0,
    },
    {
      icon: <MedalBadgeIcon secondary />,
      label: 'Awards',
      value: analytics?.awards ?? 0,
    },
    { icon: <ShareIcon />, label: 'Shares', value: analytics?.shares ?? 0 },
    {
      icon: <ClickIcon />,
      label: 'Outbound visits',
      value: analytics?.clicks ?? 0,
    },
  ];

  return (
    <SquadManageSectionPanel section={SquadManageSection.Analytics}>
      <div className="flex flex-col gap-6 px-4 py-6 tablet:px-6">
        <Section
          title="Overview"
          action={
            <CreatorPeriodSelect
              period={period}
              onChange={setPeriod}
              disabled={isPerformancePending}
            />
          }
        >
          {isPerformancePending && <CreatorOverviewSkeleton tiles={3} />}
          {!isPerformancePending && isPerformanceError && (
            <CreatorDashboardError
              title="Could not load the squad overview"
              onRetry={refetchPerformance}
              isRetrying={isPerformanceFetching}
            />
          )}
          {!!performance && !isPerformancePending && !isPerformanceError && (
            <CreatorOverviewSection
              performance={performance}
              period={period}
              audience={CreatorAnalyticsAudience.Squad}
            />
          )}
        </Section>
        {!isPerformanceError && (
          <>
            <HorizontalSeparator />
            <Section>
              {isPerformancePending && <CreatorImpressionsSkeleton />}
              {!!performance && (
                <CreatorImpressionsSection
                  performance={performance}
                  period={period}
                  audience={CreatorAnalyticsAudience.Squad}
                />
              )}
            </Section>
          </>
        )}
        <HorizontalSeparator />
        <Section title="Post performance">
          {isPostsError && (
            <CreatorDashboardError
              title="Could not load the squad posts"
              onRetry={refetchPosts}
              isRetrying={isPostsFetching}
            />
          )}
          {!isPostsError && hasNoPosts && (
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Secondary}
            >
              No posts in this squad yet.
            </Typography>
          )}
          {!isPostsError && !hasNoPosts && (
            <CreatorPostPerformanceTable
              posts={posts}
              sort={sort}
              onSortChange={setSort}
              isPending={isPostsPending}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              fetchNextPage={fetchNextPage}
              audience={CreatorAnalyticsAudience.Squad}
            />
          )}
        </Section>
        <HorizontalSeparator />
        <Section title="All time">
          <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
            <DataTile
              label="Lifetime impressions"
              value={analytics?.impressions ?? 0}
              info="The total lifetime number of times posts from this squad were shown to developers across the platform"
              icon={
                <EyeIcon size={IconSize.Small} className="text-text-tertiary" />
              }
            />
            <DataTile
              label="Lifetime reach"
              value={analytics?.reach ?? 0}
              info="The estimated lifetime number of unique developers who viewed posts from this squad"
              icon={
                <EyeIcon size={IconSize.Small} className="text-text-tertiary" />
              }
            />
          </div>
          <AnalyticsNumbersList data={engagement} />
        </Section>
      </div>
    </SquadManageSectionPanel>
  );
};
