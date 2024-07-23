import React from 'react';
import { GetStaticPropsResult } from 'next';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { LEADERBOARD_QUERY } from '@dailydotdev/shared/src/graphql/leaderboard';
import { useRouter } from 'next/router';
import { BreadCrumbs } from '@dailydotdev/shared/src/components/header';
import { SquadIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { UserHighlight } from '@dailydotdev/shared/src/components/widgets/PostUsersHighlights';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import classed from '@dailydotdev/shared/src/lib/classed';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import type { GraphQLError } from '@dailydotdev/shared/src/lib/errors';
import { getLayout as getFooterNavBarLayout } from '../components/layouts/FooterNavBarLayout';
import { getLayout } from '../components/layouts/MainLayout';
import { ListItem, TopList } from '../components/common';
import { defaultOpenGraph } from '../next-seo';

const seo: NextSeoProps = {
  title: 'Leaderboard | daily.dev',
  openGraph: { ...defaultOpenGraph },
  description:
    'Check out the daily.dev Leaderboard to see the top-performing developers based on various criteria.',
};

type UserLeaderboard = {
  score: number;
  user: LoggedUser;
};

type PageProps = {
  highestReputation: UserLeaderboard[];
  longestStreak: UserLeaderboard[];
  highestPostViews: UserLeaderboard[];
  mostUpvoted: UserLeaderboard[];
  mostReferrals: UserLeaderboard[];
  mostReadingDays: UserLeaderboard[];
};

const PlaceholderList = classed(
  ElementPlaceholder,
  'h-[1.6875rem] my-1.5 rounded-12',
);

const indexToEmoji = (index: number): string => {
  switch (index) {
    case 0:
      return '🏆';
    case 1:
      return '🥈';
    case 2:
      return '🥉';
    default:
      return '';
  }
};

const UserTopList = ({
  items,
  isLoading,
  ...props
}: {
  title: string;
  items: UserLeaderboard[];
  isLoading: boolean;
  className?: string;
}): JSX.Element => {
  return (
    <TopList {...props}>
      <>
        {/* eslint-disable-next-line react/no-array-index-key */}
        {isLoading && [...Array(10)].map((_, i) => <PlaceholderList key={i} />)}
        {items?.map((item, i) => (
          <ListItem
            key={item.user.id}
            index={item.score}
            href={item.user.permalink}
          >
            <>
              <span className="pl-1">{indexToEmoji(i)}</span>
              <UserHighlight
                {...item.user}
                showReputation
                className={{
                  wrapper: 'min-w-0 flex-shrink !p-2',
                  image: '!size-8',
                  textWrapper: '!ml-2',
                  name: '!typo-caption1',
                  reputation: '!typo-caption1',
                  handle: '!typo-caption2',
                }}
                allowSubscribe={false}
              />
            </>
          </ListItem>
        ))}
      </>
    </TopList>
  );
};

const LeaderboardPage = ({
  highestReputation,
  longestStreak,
  highestPostViews,
  mostUpvoted,
  mostReferrals,
  mostReadingDays,
}: PageProps): JSX.Element => {
  const { isFallback: isLoading } = useRouter();

  if (isLoading) {
    return <></>;
  }

  return (
    <>
      <NextSeo {...seo} />
      <main className="tablet:p-4 laptop:px-10">
        <div className="mb-6 hidden justify-between laptop:flex">
          <BreadCrumbs>
            <SquadIcon size={IconSize.XSmall} secondary /> Leaderboard
          </BreadCrumbs>
        </div>
        <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2 laptopXL:grid-cols-3">
          <UserTopList
            title="Highest reputation"
            items={highestReputation}
            isLoading={isLoading}
          />
          <UserTopList
            title="Longest streak"
            items={longestStreak}
            isLoading={isLoading}
          />
          <UserTopList
            title="Highest post views"
            items={highestPostViews}
            isLoading={isLoading}
          />
          <UserTopList
            title="Most upvoted"
            items={mostUpvoted}
            isLoading={isLoading}
          />
          <UserTopList
            title="Most referrals"
            items={mostReferrals}
            isLoading={isLoading}
          />
          <UserTopList
            title="Most reading days"
            items={mostReadingDays}
            isLoading={isLoading}
          />
        </div>
      </main>
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

    return {
      props: {
        highestReputation: res.highestReputation,
        longestStreak: res.longestStreak,
        highestPostViews: res.highestPostViews,
        mostUpvoted: res.mostUpvoted,
        mostReferrals: res.mostReferrals,
        mostReadingDays: res.mostReadingDays,
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
        },
        revalidate: 60,
      };
    }
    throw err;
  }
}
