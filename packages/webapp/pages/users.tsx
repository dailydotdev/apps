import React, { ReactElement } from 'react';
import { GetStaticPropsResult } from 'next';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { LEADERBOARD_QUERY } from '@dailydotdev/shared/src/graphql/leaderboard';
import { useRouter } from 'next/router';
import { BreadCrumbs } from '@dailydotdev/shared/src/components/header';
import { SquadIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { GraphQLError } from '@dailydotdev/shared/src/lib/errors';
import { PageWrapperLayout } from '@dailydotdev/shared/src/components/layout/PageWrapperLayout';
import {
  UserLeaderboard,
  UserTopList,
} from '@dailydotdev/shared/src/components/cards/Leaderboard';
import {
  CompanyLeaderboard,
  CompanyTopList,
} from '@dailydotdev/shared/src/components/cards/Leaderboard/CompanyTopList';
import { getLayout as getFooterNavBarLayout } from '../components/layouts/FooterNavBarLayout';
import { getLayout } from '../components/layouts/MainLayout';
import { defaultOpenGraph } from '../next-seo';

const seo: NextSeoProps = {
  title: 'Leaderboard | daily.dev',
  openGraph: { ...defaultOpenGraph },
  description:
    'Check out the daily.dev Leaderboard to see the top-performing developers based on various criteria.',
};

interface PageProps {
  highestReputation: UserLeaderboard[];
  longestStreak: UserLeaderboard[];
  highestPostViews: UserLeaderboard[];
  mostUpvoted: UserLeaderboard[];
  mostReferrals: UserLeaderboard[];
  mostReadingDays: UserLeaderboard[];
  mostVerifiedUsers: CompanyLeaderboard[];
}

const LeaderboardPage = ({
  highestReputation,
  longestStreak,
  highestPostViews,
  mostUpvoted,
  mostReferrals,
  mostReadingDays,
  mostVerifiedUsers,
}: PageProps): ReactElement => {
  const { isFallback: isLoading } = useRouter();

  if (isLoading) {
    return <></>;
  }

  return (
    <>
      <NextSeo {...seo} />
      <PageWrapperLayout>
        <div className="mb-6 hidden justify-between laptop:flex">
          <BreadCrumbs>
            <SquadIcon size={IconSize.XSmall} secondary /> Leaderboard
          </BreadCrumbs>
        </div>
        <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2 laptopXL:grid-cols-3">
          <UserTopList
            containerProps={{ title: 'Highest reputation' }}
            items={highestReputation}
            isLoading={isLoading}
          />
          <UserTopList
            containerProps={{ title: 'Longest streak' }}
            items={longestStreak}
            isLoading={isLoading}
          />
          <UserTopList
            containerProps={{ title: 'Highest post views' }}
            items={highestPostViews}
            isLoading={isLoading}
          />
          <UserTopList
            containerProps={{ title: 'Most upvoted' }}
            items={mostUpvoted}
            isLoading={isLoading}
          />
          <UserTopList
            containerProps={{ title: 'Most referrals' }}
            items={mostReferrals}
            isLoading={isLoading}
          />
          <UserTopList
            containerProps={{ title: 'Most reading days' }}
            items={mostReadingDays}
            isLoading={isLoading}
          />
          <CompanyTopList
            containerProps={{ title: 'Most verified employees' }}
            items={mostVerifiedUsers}
            isLoading={isLoading}
          />
        </div>
      </PageWrapperLayout>
    </>
  );
};

const getPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

LeaderboardPage.getLayout = getPageLayout;
LeaderboardPage.layoutProps = {
  screenCentered: false,
};

export default LeaderboardPage;

export async function getStaticProps(): Promise<
  GetStaticPropsResult<PageProps>
> {
  try {
    const res = await gqlClient.request<PageProps>(LEADERBOARD_QUERY);
    console.log(res);
    return {
      props: {
        highestReputation: res.highestReputation,
        longestStreak: res.longestStreak,
        highestPostViews: res.highestPostViews,
        mostUpvoted: res.mostUpvoted,
        mostReferrals: res.mostReferrals,
        mostReadingDays: res.mostReadingDays,
        mostVerifiedUsers: res.mostVerifiedUsers,
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
          mostVerifiedUsers: [],
        },
        revalidate: 60,
      };
    }
    throw err;
  }
}
