import type { ReactElement } from 'react';
import React, { useCallback, useMemo } from 'react';
import type { NextSeoProps } from 'next-seo';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { addDays, subDays } from 'date-fns';
import {
  ResponsivePageContainer,
  Divider,
  pageBorders,
} from '@dailydotdev/shared/src/components/utilities';
import { LayoutHeader } from '@dailydotdev/shared/src/components/layout/common';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { DataTile } from '@dailydotdev/shared/src/components/DataTile';
import {
  AddUserIcon,
  ReputationIcon,
  UpvoteIcon,
  EyeIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import classed from '@dailydotdev/shared/src/lib/classed';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  generateQueryKey,
  RequestKey,
  StaleTime,
  getNextPageParam,
} from '@dailydotdev/shared/src/lib/query';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import {
  USER_POSTS_ANALYTICS_QUERY,
  USER_POSTS_ANALYTICS_HISTORY_QUERY,
  USER_POSTS_WITH_ANALYTICS_QUERY,
} from '@dailydotdev/shared/src/graphql/users';
import type {
  UserPostsAnalytics,
  UserPostsAnalyticsHistoryNode,
  UserPostWithAnalytics,
} from '@dailydotdev/shared/src/graphql/users';
import type { Connection } from '@dailydotdev/shared/src/graphql/common';
import {
  dateFormatInTimezone,
  DEFAULT_TIMEZONE,
} from '@dailydotdev/shared/src/lib/timezones';
import dynamic from 'next/dynamic';
import ProtectedPage from '../../components/ProtectedPage';
import { getLayout } from '../../components/layouts/MainLayout';
import { UserPostsAnalyticsTable } from '../../components/analytics/UserPostsAnalyticsTable';
import { AnalyticsEmptyState } from '../../components/analytics/AnalyticsEmptyState';

const CombinedImpressionsChart = dynamic(
  () =>
    import(
      '@dailydotdev/shared/src/components/analytics/CombinedImpressionsChart'
    ).then((mod) => mod.CombinedImpressionsChart),
  {
    loading: () => <div className="h-40 w-full" />,
  },
);

const dividerClassName = 'bg-border-subtlest-tertiary';
const SectionContainer = classed('div', 'flex flex-col gap-4');
const SectionHeader = ({
  children,
}: {
  children: React.ReactNode;
}): ReactElement => {
  return (
    <Typography
      type={TypographyType.Body}
      bold
      tag={TypographyTag.H2}
      color={TypographyColor.Primary}
    >
      {children}
    </Typography>
  );
};

const POST_ANALYTICS_HISTORY_LIMIT = 45;

type ImpressionNode = {
  name: string;
  value: number;
  isBoosted: boolean;
};

const Analytics = (): ReactElement => {
  const { user } = useAuthContext();
  const userTimezone = user?.timezone || DEFAULT_TIMEZONE;

  const analyticsQueryKey = generateQueryKey(
    RequestKey.UserPostsAnalytics,
    user,
  );

  const historyQueryKey = generateQueryKey(
    RequestKey.UserPostsAnalyticsHistory,
    user,
  );

  const postsQueryKey = generateQueryKey(
    RequestKey.UserPostsWithAnalytics,
    user,
  );

  const { data: analytics } = useQuery({
    queryKey: analyticsQueryKey,
    queryFn: async () => {
      const result = await gqlClient.request<{
        userPostsAnalytics: UserPostsAnalytics;
      }>(USER_POSTS_ANALYTICS_QUERY);
      return result.userPostsAnalytics;
    },
    staleTime: StaleTime.Default,
    enabled: !!user,
  });

  const { data: historyData, isLoading: isLoadingHistory } = useQuery({
    queryKey: historyQueryKey,
    queryFn: async () => {
      const result = await gqlClient.request<{
        userPostsAnalyticsHistory: UserPostsAnalyticsHistoryNode[];
      }>(USER_POSTS_ANALYTICS_HISTORY_QUERY);
      return result.userPostsAnalyticsHistory;
    },
    staleTime: StaleTime.Default,
    enabled: !!user,
    select: useCallback(
      (data: UserPostsAnalyticsHistoryNode[]): ImpressionNode[] => {
        if (!data) {
          return [];
        }

        const impressionsMap = data.reduce((acc, item) => {
          const date = dateFormatInTimezone(
            new Date(item.date),
            'yyyy-MM-dd',
            userTimezone,
          );

          acc[date] = {
            name: new Date(item.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
            value: item.impressions,
            isBoosted: item.impressionsAds > 0,
          };

          return acc;
        }, {} as Record<string, ImpressionNode>);

        const historyCutOffDate = subDays(
          new Date(),
          POST_ANALYTICS_HISTORY_LIMIT - 1,
        );

        const impressionsData: ImpressionNode[] = [];

        for (let i = 0; i < POST_ANALYTICS_HISTORY_LIMIT; i += 1) {
          const paddedDate = addDays(historyCutOffDate, i);
          const date = dateFormatInTimezone(
            paddedDate,
            'yyyy-MM-dd',
            userTimezone,
          );

          if (impressionsMap[date]) {
            impressionsData.push(impressionsMap[date]);
          } else {
            impressionsData.push({
              name: paddedDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              }),
              value: 0,
              isBoosted: false,
            });
          }
        }

        return impressionsData;
      },
      [userTimezone],
    ),
  });

  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingPosts,
  } = useInfiniteQuery({
    queryKey: postsQueryKey,
    queryFn: async ({ pageParam }) => {
      const result = await gqlClient.request<{
        userPostsWithAnalytics: Connection<UserPostWithAnalytics>;
      }>(USER_POSTS_WITH_ANALYTICS_QUERY, {
        first: 20,
        after: pageParam,
      });
      return result.userPostsWithAnalytics;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => getNextPageParam(lastPage?.pageInfo),
    staleTime: StaleTime.Default,
    enabled: !!user,
  });

  const posts = useMemo(
    () =>
      postsData?.pages.flatMap((page) => page.edges.map((e) => e.node)) ?? [],
    [postsData],
  );

  const hasNoPosts = !isLoadingPosts && !!postsData && posts.length === 0;

  const hasChartData = useMemo(() => {
    if (!historyData || historyData.length === 0) {
      return false;
    }
    return historyData.some((item) => item.value > 0);
  }, [historyData]);

  return (
    <ProtectedPage>
      <div className="mx-auto w-full max-w-[48rem]">
        <LayoutHeader
          className={classNames('!mb-0 gap-2 border-b px-4', pageBorders)}
        >
          <Typography
            type={TypographyType.Title3}
            bold
            color={TypographyColor.Primary}
            className="flex-1"
          >
            Analytics
          </Typography>
        </LayoutHeader>
        <ResponsivePageContainer className="!mx-0 !w-full !max-w-full gap-6">
          <SectionContainer>
            <SectionHeader>Overview (last 45 days)</SectionHeader>
            <div className="grid grid-cols-2 gap-4 tablet:grid-cols-4">
              <DataTile
                label="Impressions"
                value={analytics?.impressions ?? 0}
                info="The total number of times all your posts were shown to developers across the platform"
                icon={
                  <EyeIcon
                    size={IconSize.Small}
                    className="text-text-tertiary"
                  />
                }
              />
              <DataTile
                label="Upvotes"
                value={analytics?.upvotes ?? 0}
                info="The total number of upvotes received across all your posts on the platform"
                icon={
                  <UpvoteIcon
                    size={IconSize.Small}
                    className="text-text-tertiary"
                  />
                }
              />
              <DataTile
                label="Followers"
                value={analytics?.followers ?? 0}
                info="The number of developers who followed you after discovering your content"
                icon={
                  <AddUserIcon
                    size={IconSize.Small}
                    className="text-text-tertiary"
                  />
                }
              />
              <DataTile
                label="Reputation"
                value={analytics?.reputation ?? 0}
                info="The total number of reputation points earned across all your posts"
                icon={
                  <ReputationIcon
                    size={IconSize.Small}
                    secondary
                    className="text-text-tertiary"
                  />
                }
              />
            </div>
          </SectionContainer>
          <Divider className={dividerClassName} />
          <SectionContainer>
            <div className="flex items-center">
              <Typography type={TypographyType.Footnote} bold>
                Impressions in the last 45 days
              </Typography>
              {hasChartData && (
                <div className="ml-auto flex gap-2">
                  <div className="flex items-center gap-1">
                    <div className="size-2 rounded-full bg-brand-default" />
                    <Typography type={TypographyType.Footnote}>
                      Organic
                    </Typography>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="size-2 rounded-full bg-accent-blueCheese-default" />
                    <Typography type={TypographyType.Footnote}>
                      Promoted
                    </Typography>
                  </div>
                </div>
              )}
            </div>
            {isLoadingHistory ? (
              <div className="h-40 w-full" />
            ) : hasChartData ? (
              <CombinedImpressionsChart data={historyData} />
            ) : (
              <div className="flex h-40 items-center justify-center rounded-12 border border-border-subtlest-tertiary">
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Tertiary}
                >
                  No impression data yet. Check back after your posts get some
                  views.
                </Typography>
              </div>
            )}
          </SectionContainer>
          <Divider className={dividerClassName} />
          <SectionContainer>
            <SectionHeader>Posts</SectionHeader>
            {hasNoPosts ? (
              <AnalyticsEmptyState />
            ) : (
              <UserPostsAnalyticsTable
                posts={posts}
                isLoading={isLoadingPosts}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
              />
            )}
          </SectionContainer>
        </ResponsivePageContainer>
      </div>
    </ProtectedPage>
  );
};

const seo: NextSeoProps = { title: 'Analytics', nofollow: true, noindex: true };

Analytics.getLayout = getLayout;
Analytics.layoutProps = { seo, screenCentered: false };

export default Analytics;
