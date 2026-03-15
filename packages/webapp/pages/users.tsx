import type { ReactElement } from 'react';
import React from 'react';
import type { GetStaticPropsResult } from 'next';
import type { NextSeoProps } from 'next-seo/lib/types';
import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import {
  HIGHEST_LEVEL_QUERY,
  LEADERBOARD_QUERY,
  LeaderboardType,
} from '@dailydotdev/shared/src/graphql/leaderboard';
import { useRouter } from 'next/router';
import { BreadCrumbs } from '@dailydotdev/shared/src/components/header';
import { SquadIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks';
import type { GraphQLError } from '@dailydotdev/shared/src/lib/errors';
import { questsFeature } from '@dailydotdev/shared/src/lib/featureManagement';
import { PageWrapperLayout } from '@dailydotdev/shared/src/components/layout/PageWrapperLayout';
import type { UserLeaderboard } from '@dailydotdev/shared/src/components/cards/Leaderboard';
import { UserTopList } from '@dailydotdev/shared/src/components/cards/Leaderboard';
import type { CompanyLeaderboard } from '@dailydotdev/shared/src/components/cards/Leaderboard/CompanyTopList';
import { CompanyTopList } from '@dailydotdev/shared/src/components/cards/Leaderboard/CompanyTopList';
import type { PopularHotTakes } from '@dailydotdev/shared/src/components/cards/Leaderboard/PopularHotTakesList';
import { PopularHotTakesList } from '@dailydotdev/shared/src/components/cards/Leaderboard/PopularHotTakesList';
import { getLayout as getFooterNavBarLayout } from '../components/layouts/FooterNavBarLayout';
import { getLayout } from '../components/layouts/MainLayout';
import { defaultOpenGraph } from '../next-seo';
import { getPageSeoTitles } from '../components/layouts/utils';

const seoTitles = getPageSeoTitles('The official developer leaderboard');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  description:
    'Check out the top developer leaderboards on daily.dev. See the best performers, longest streaks, top referrers, and community leaders.',
};

interface PageProps {
  highestReputation: UserLeaderboard[];
  longestStreak: UserLeaderboard[];
  highestPostViews: UserLeaderboard[];
  mostUpvoted: UserLeaderboard[];
  mostReferrals: UserLeaderboard[];
  mostReadingDays: UserLeaderboard[];
  mostAchievementPoints: UserLeaderboard[];
  highestLevel: UserLeaderboard[];
  isHighestLevelSupported: boolean;
  mostVerifiedUsers: CompanyLeaderboard[];
  popularHotTakes: PopularHotTakes[];
}

const isHighestLevelSchemaMissing = (error: GraphQLError): boolean => {
  return (
    error?.response?.errors?.some(
      ({ message }) =>
        message?.includes('Cannot query field "highestLevel"') ||
        message?.includes('Cannot query field "level" on type "Leaderboard"'),
    ) ?? false
  );
};

const LeaderboardPage = ({
  highestReputation,
  longestStreak,
  highestPostViews,
  mostUpvoted,
  mostReferrals,
  mostReadingDays,
  mostAchievementPoints,
  highestLevel,
  isHighestLevelSupported,
  mostVerifiedUsers,
  popularHotTakes,
}: PageProps): ReactElement => {
  const { isFallback: isLoading } = useRouter();
  const { value: isQuestsFeatureEnabled } = useConditionalFeature({
    feature: questsFeature,
  });

  if (isLoading) {
    return <></>;
  }

  return (
    <PageWrapperLayout>
      <div className="mb-6 hidden justify-between laptop:flex">
        <BreadCrumbs>
          <SquadIcon size={IconSize.XSmall} secondary /> Leaderboard
        </BreadCrumbs>
      </div>
      <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2 laptopXL:grid-cols-3">
        {isQuestsFeatureEnabled === true && isHighestLevelSupported && (
          <UserTopList
            containerProps={{
              title: 'Highest level',
              titleHref: `/users/${LeaderboardType.HighestLevel}`,
            }}
            items={highestLevel}
            isLoading={isLoading}
            showLevel
          />
        )}
        <UserTopList
          containerProps={{
            title: 'Highest reputation',
            titleHref: `/users/${LeaderboardType.HighestReputation}`,
          }}
          items={highestReputation}
          isLoading={isLoading}
        />
        <UserTopList
          containerProps={{
            title: 'Longest streak',
            titleHref: `/users/${LeaderboardType.LongestStreak}`,
          }}
          items={longestStreak}
          isLoading={isLoading}
          concatScore={false}
        />
        <UserTopList
          containerProps={{
            title: 'Highest post views',
            titleHref: `/users/${LeaderboardType.HighestPostViews}`,
          }}
          items={highestPostViews}
          isLoading={isLoading}
        />
        <UserTopList
          containerProps={{
            title: 'Most upvoted',
            titleHref: `/users/${LeaderboardType.MostUpvoted}`,
          }}
          items={mostUpvoted}
          isLoading={isLoading}
        />
        <UserTopList
          containerProps={{
            title: 'Most referrals',
            titleHref: `/users/${LeaderboardType.MostReferrals}`,
          }}
          items={mostReferrals}
          isLoading={isLoading}
        />
        <UserTopList
          containerProps={{
            title: 'Most reading days',
            titleHref: `/users/${LeaderboardType.MostReadingDays}`,
          }}
          items={mostReadingDays}
          isLoading={isLoading}
        />
        <UserTopList
          containerProps={{
            title: 'Most achievement points',
            titleHref: `/users/${LeaderboardType.MostAchievementPoints}`,
          }}
          items={mostAchievementPoints}
          isLoading={isLoading}
        />
        <CompanyTopList
          containerProps={{
            title: 'Most verified employees',
            titleHref: `/users/${LeaderboardType.MostVerifiedUsers}`,
          }}
          items={mostVerifiedUsers}
          isLoading={isLoading}
        />
        <PopularHotTakesList
          containerProps={{
            title: 'Most popular hot takes',
          }}
          items={popularHotTakes}
          isLoading={isLoading}
        />
      </div>
    </PageWrapperLayout>
  );
};

const getPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

LeaderboardPage.getLayout = getPageLayout;
LeaderboardPage.layoutProps = {
  screenCentered: false,
  seo,
};

export default LeaderboardPage;

export async function getStaticProps(): Promise<
  GetStaticPropsResult<PageProps>
> {
  try {
    const res = await gqlClient.request<Omit<PageProps, 'highestLevel'>>(
      LEADERBOARD_QUERY,
    );

    let highestLevel: UserLeaderboard[] = [];
    let isHighestLevelSupported = false;
    try {
      const levelRes = await gqlClient.request<{
        highestLevel: UserLeaderboard[];
      }>(HIGHEST_LEVEL_QUERY);
      highestLevel = levelRes.highestLevel ?? [];
      isHighestLevelSupported = true;
    } catch (levelError: unknown) {
      const error = levelError as GraphQLError;

      if (!isHighestLevelSchemaMissing(error)) {
        throw levelError;
      }
    }

    return {
      props: {
        highestReputation: res.highestReputation,
        longestStreak: res.longestStreak,
        highestPostViews: res.highestPostViews,
        mostUpvoted: res.mostUpvoted,
        mostReferrals: res.mostReferrals,
        mostReadingDays: res.mostReadingDays,
        mostAchievementPoints: res.mostAchievementPoints,
        highestLevel,
        isHighestLevelSupported,
        mostVerifiedUsers: res.mostVerifiedUsers,
        popularHotTakes: res.popularHotTakes,
      },
      revalidate: 3600,
    };
  } catch (err: unknown) {
    const error = err as GraphQLError;

    if (
      [ApiError.NotFound, ApiError.Forbidden].includes(
        error?.response?.errors?.[0]?.extensions?.code,
      )
    ) {
      return {
        props: {
          highestReputation: [],
          longestStreak: [],
          highestPostViews: [],
          mostUpvoted: [],
          mostReferrals: [],
          mostReadingDays: [],
          mostAchievementPoints: [],
          highestLevel: [],
          isHighestLevelSupported: false,
          mostVerifiedUsers: [],
          popularHotTakes: [],
        },
        revalidate: 60,
      };
    }
    throw err;
  }
}
