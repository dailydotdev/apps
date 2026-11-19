import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import type { NextSeoProps } from 'next-seo';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Divider } from '@dailydotdev/shared/src/components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import classed from '@dailydotdev/shared/src/lib/classed';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { creatorAchievementsQueryOptions } from '@dailydotdev/shared/src/graphql/creatorAchievements';
import {
  CreatorPerformancePeriod,
  CreatorPostSortBy,
  CreatorPostSortOrder,
  creatorLifetimeTotalsQueryOptions,
  creatorPerformanceQueryOptions,
  creatorPostPerformanceQueryOptions,
} from '@dailydotdev/shared/src/graphql/creatorAnalytics';
import { CreatorPeriodSelect } from '@dailydotdev/shared/src/components/analytics/creator/CreatorPeriodSelect';
import {
  CreatorOverviewSection,
  CreatorOverviewSkeleton,
} from '@dailydotdev/shared/src/components/analytics/creator/CreatorOverviewSection';
import {
  CreatorImpressionsSection,
  CreatorImpressionsSkeleton,
} from '@dailydotdev/shared/src/components/analytics/creator/CreatorImpressionsSection';
import type { CreatorPostSort } from '@dailydotdev/shared/src/components/analytics/creator/CreatorPostPerformanceTable';
import { CreatorPostPerformanceTable } from '@dailydotdev/shared/src/components/analytics/creator/CreatorPostPerformanceTable';
import { CreatorDashboardError } from '@dailydotdev/shared/src/components/analytics/creator/CreatorDashboardError';
import { getLayout } from '../../components/layouts/MainLayout';
import { AnalyticsEmptyState } from '../../components/analytics/AnalyticsEmptyState';
import { CreatorAchievementsSection } from '../../components/analytics/creator/CreatorAchievementsSection';
import {
  AnalyticsPageShell,
  AnalyticsTab,
} from '../../components/analytics/AnalyticsPageShell';

const dividerClassName = 'bg-border-subtlest-tertiary';
const SectionContainer = classed('div', 'flex flex-col gap-4');

const SectionHeader = ({
  children,
}: {
  children: React.ReactNode;
}): ReactElement => (
  <Typography
    type={TypographyType.Body}
    bold
    tag={TypographyTag.H2}
    color={TypographyColor.Primary}
  >
    {children}
  </Typography>
);

const Analytics = (): ReactElement => {
  const { user } = useAuthContext();
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
  } = useQuery(creatorPerformanceQueryOptions({ user, period }));

  // Followers and reputation have no daily grain, so they come from the
  // lifetime row rather than the period contract.
  const { data: lifetime, isPending: isLifetimePending } = useQuery(
    creatorLifetimeTotalsQueryOptions({ user }),
  );

  const {
    data: postsData,
    isPending: isPostsPending,
    isError: isPostsError,
    isFetching: isPostsFetching,
    refetch: refetchPosts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    creatorPostPerformanceQueryOptions({
      user,
      period,
      sortBy: sort.sortBy,
      order: sort.order,
    }),
  );

  const {
    data: achievementsData,
    isPending: isAchievementsPending,
    isError: isAchievementsError,
    isFetching: isAchievementsFetching,
    refetch: refetchAchievements,
    fetchNextPage: fetchNextAchievementsPage,
    hasNextPage: hasNextAchievementsPage,
    isFetchingNextPage: isFetchingNextAchievementsPage,
  } = useInfiniteQuery(creatorAchievementsQueryOptions({ user }));

  // Both feed the same grid of tiles, so it renders once rather than
  // half-filling and then reflowing.
  const isOverviewPending = isPerformancePending || isLifetimePending;

  const achievements = useMemo(
    () =>
      achievementsData?.pages.flatMap((page) =>
        page.edges.map(({ node }) => node),
      ) ?? [],
    [achievementsData],
  );

  const posts = useMemo(
    () =>
      postsData?.pages.flatMap((page) => page.edges.map(({ node }) => node)) ??
      [],
    [postsData],
  );

  // Only an answered query with nothing in it means "no posts". While a sort
  // or period change is in flight the list is briefly empty, and showing the
  // "start posting" pitch to a creator who has posts would be absurd.
  const hasNoPosts = !isPostsPending && !isPostsError && posts.length === 0;

  return (
    <AnalyticsPageShell activeTab={AnalyticsTab.Content}>
      <SectionContainer>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionHeader>Overview</SectionHeader>
          <CreatorPeriodSelect
            period={period}
            onChange={setPeriod}
            disabled={isOverviewPending}
          />
        </div>
        {isOverviewPending && <CreatorOverviewSkeleton />}
        {!isOverviewPending && isPerformanceError && (
          <CreatorDashboardError
            title="Could not load your overview"
            onRetry={refetchPerformance}
            isRetrying={isPerformanceFetching}
          />
        )}
        {!!performance && !isOverviewPending && !isPerformanceError && (
          <CreatorOverviewSection
            performance={performance}
            period={period}
            lifetime={lifetime}
          />
        )}
      </SectionContainer>
      {/* The overview's error state already explains the failure; a
              second empty section under it would just be a gap. */}
      {!isPerformanceError && (
        <>
          <Divider className={dividerClassName} />
          <SectionContainer>
            {isPerformancePending && <CreatorImpressionsSkeleton />}
            {!!performance && (
              <CreatorImpressionsSection
                performance={performance}
                period={period}
              />
            )}
          </SectionContainer>
        </>
      )}
      <Divider className={dividerClassName} />
      <SectionContainer>
        <SectionHeader>Article performance</SectionHeader>
        {isPostsError && (
          <CreatorDashboardError
            title="Could not load your articles"
            onRetry={refetchPosts}
            isRetrying={isPostsFetching}
          />
        )}
        {!isPostsError && hasNoPosts && <AnalyticsEmptyState />}
        {!isPostsError && !hasNoPosts && (
          <CreatorPostPerformanceTable
            posts={posts}
            sort={sort}
            onSortChange={setSort}
            isPending={isPostsPending}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
          />
        )}
      </SectionContainer>
      <Divider className={dividerClassName} />
      <SectionContainer>
        <SectionHeader>Achievements</SectionHeader>
        {/* A failed background refetch also sets `isError`, so awards that
                are already on screen stay there rather than being replaced by
                an error card for a request the creator never made. */}
        {isAchievementsError && !achievements.length ? (
          <CreatorDashboardError
            title="Could not load your achievements"
            onRetry={refetchAchievements}
            isRetrying={isAchievementsFetching}
          />
        ) : (
          <CreatorAchievementsSection
            achievements={achievements}
            isPending={isAchievementsPending}
            hasNextPage={hasNextAchievementsPage}
            isFetchingNextPage={isFetchingNextAchievementsPage}
            fetchNextPage={fetchNextAchievementsPage}
          />
        )}
      </SectionContainer>
    </AnalyticsPageShell>
  );
};

const seo: NextSeoProps = { title: 'Analytics', nofollow: true, noindex: true };

Analytics.getLayout = getLayout;
Analytics.layoutProps = { seo };

export default Analytics;
