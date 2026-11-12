import type { ReactElement } from 'react';
import React from 'react';
import type { GetStaticPropsResult } from 'next';
import type { NextSeoProps } from 'next-seo/lib/types';
import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import type {
  CompanyLeaderboard,
  UserLeaderboard,
} from '@dailydotdev/shared/src/graphql/leaderboard';
import {
  HIGHEST_LEVEL_QUERY,
  LEADERBOARD_LIST_LIMIT,
  LEADERBOARD_QUERY,
  LeaderboardType,
} from '@dailydotdev/shared/src/graphql/leaderboard';
import type { GraphQLError } from '@dailydotdev/shared/src/lib/errors';
import { ExploreHubHeader } from '@dailydotdev/shared/src/components/header/ExploreHubHeader';
import { PageWrapperLayout } from '@dailydotdev/shared/src/components/layout/PageWrapperLayout';
import { useLaptopLayout } from '@dailydotdev/shared/src/hooks/layout/useLaptopLayout';
import { PublicPageSignupBanner } from '@dailydotdev/shared/src/components/auth/PublicPageSignupBanner';
import type { LeaderboardBoards } from '@dailydotdev/shared/src/features/leaderboard/LeaderboardHub';
import { LeaderboardHub } from '@dailydotdev/shared/src/features/leaderboard/LeaderboardHub';
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
  boards: LeaderboardBoards;
  companies: CompanyLeaderboard[];
}

type LeaderboardQueryResult = Record<
  Exclude<
    LeaderboardType,
    | LeaderboardType.HighestLevel
    | LeaderboardType.MostQuestsCompleted
    | LeaderboardType.MostVerifiedUsers
  >,
  UserLeaderboard[]
> & { mostVerifiedUsers: CompanyLeaderboard[] };

const isHighestLevelSchemaMissing = (error: GraphQLError): boolean => {
  return (
    error?.response?.errors?.some(
      ({ message }) =>
        message?.includes('Cannot query field "highestLevel"') ||
        message?.includes('Cannot query field "level" on type "Leaderboard"'),
    ) ?? false
  );
};

const LeaderboardPage = ({ boards, companies }: PageProps): ReactElement => {
  const isLaptopLayout = useLaptopLayout();

  return (
    <>
      {isLaptopLayout && <ExploreHubHeader />}
      <PageWrapperLayout className="flex flex-col gap-8 px-4 pb-6 pt-3 tablet:gap-10">
        <LeaderboardHub boards={boards} companies={companies} />
      </PageWrapperLayout>
      <PublicPageSignupBanner />
    </>
  );
};

const getPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

LeaderboardPage.getLayout = getPageLayout;
LeaderboardPage.layoutProps = {
  seo,
};

export default LeaderboardPage;

export async function getStaticProps(): Promise<
  GetStaticPropsResult<PageProps>
> {
  try {
    const { mostVerifiedUsers, ...res } =
      await gqlClient.request<LeaderboardQueryResult>(LEADERBOARD_QUERY, {
        limit: LEADERBOARD_LIST_LIMIT,
      });
    const boards: LeaderboardBoards = res;

    try {
      const levelRes = await gqlClient.request<{
        highestLevel: UserLeaderboard[];
      }>(HIGHEST_LEVEL_QUERY, { limit: LEADERBOARD_LIST_LIMIT });
      boards[LeaderboardType.HighestLevel] = levelRes.highestLevel ?? [];
    } catch (levelError: unknown) {
      const error = levelError as GraphQLError;

      if (!isHighestLevelSchemaMissing(error)) {
        throw levelError;
      }
    }

    return {
      props: { boards, companies: mostVerifiedUsers },
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
        props: { boards: {}, companies: [] },
        revalidate: 60,
      };
    }
    throw err;
  }
}
