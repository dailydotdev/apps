import type { ReactElement } from 'react';
import React from 'react';
import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import {
  isCompanyLeaderboard,
  LeaderboardType,
  leaderboardQueries,
  leaderboardTypeToTitle,
} from '@dailydotdev/shared/src/graphql/leaderboard';
import { useRouter } from 'next/router';
import { BreadCrumbs } from '@dailydotdev/shared/src/components/header';
import { SquadIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { GraphQLError } from '@dailydotdev/shared/src/lib/errors';
import { PageWrapperLayout } from '@dailydotdev/shared/src/components/layout/PageWrapperLayout';
import type { UserLeaderboard } from '@dailydotdev/shared/src/components/cards/Leaderboard';
import { UserTopList } from '@dailydotdev/shared/src/components/cards/Leaderboard';
import type { CompanyLeaderboard } from '@dailydotdev/shared/src/components/cards/Leaderboard/CompanyTopList';
import { CompanyTopList } from '@dailydotdev/shared/src/components/cards/Leaderboard/CompanyTopList';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import { defaultOpenGraph } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';
import type { DynamicSeoProps } from '../../components/common';

interface PageProps extends DynamicSeoProps {
  leaderboardType: LeaderboardType;
  title: string;
  userItems?: UserLeaderboard[];
  companyItems?: CompanyLeaderboard[];
}

const LeaderboardDetailPage = ({
  leaderboardType,
  title,
  userItems,
  companyItems,
}: PageProps): ReactElement => {
  const { isFallback: isLoading } = useRouter();

  const isCompany = isCompanyLeaderboard(leaderboardType);
  const concatScore = leaderboardType !== LeaderboardType.LongestStreak;

  if (isLoading || !title) {
    return <></>;
  }

  return (
    <PageWrapperLayout>
      <div className="mb-6 hidden justify-between laptop:flex">
        <BreadCrumbs>
          <SquadIcon size={IconSize.XSmall} secondary />
          <Link href="/users" passHref prefetch={false}>
            <a className="hover:underline">Leaderboard</a>
          </Link>
          <span className="px-1">/</span>
          {title}
        </BreadCrumbs>
      </div>
      <div className="mx-auto w-full max-w-screen-laptop">
        {isCompany ? (
          <CompanyTopList
            containerProps={{ title }}
            items={companyItems || []}
            isLoading={isLoading}
          />
        ) : (
          <UserTopList
            containerProps={{ title }}
            items={userItems || []}
            isLoading={isLoading}
            concatScore={concatScore}
          />
        )}
      </div>
    </PageWrapperLayout>
  );
};

LeaderboardDetailPage.getLayout = (...props: Parameters<typeof getLayout>) =>
  getFooterNavBarLayout(getLayout(...props));

LeaderboardDetailPage.layoutProps = {
  screenCentered: false,
};

export default LeaderboardDetailPage;

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return {
    paths: Object.values(LeaderboardType).map((id) => ({ params: { id } })),
    fallback: true,
  };
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<{ id: string }>): Promise<
  GetStaticPropsResult<PageProps>
> {
  const { id } = params || {};

  if (!id || !Object.values(LeaderboardType).includes(id as LeaderboardType)) {
    return {
      notFound: true,
    };
  }

  const leaderboardType = id as LeaderboardType;
  const title = leaderboardTypeToTitle[leaderboardType];
  const isCompany = isCompanyLeaderboard(leaderboardType);

  const getSeoProps = () => ({
    title: getTemplatedTitle(`${title} - Developer leaderboard`),
    openGraph: { ...defaultOpenGraph },
    description: `Check out the top 100 ${
      isCompany ? 'companies' : 'developers'
    } for ${title.toLowerCase()} on daily.dev.`,
  });

  try {
    const query = leaderboardQueries[leaderboardType];
    const res = await gqlClient.request<{
      [key: string]: UserLeaderboard[] | CompanyLeaderboard[];
    }>(query, { limit: 100 });

    const items = res[leaderboardType] || [];

    return {
      props: {
        leaderboardType,
        title,
        ...(isCompany
          ? { companyItems: items as CompanyLeaderboard[] }
          : { userItems: items as UserLeaderboard[] }),
        seo: getSeoProps(),
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
          leaderboardType,
          title,
          ...(isCompany ? { companyItems: [] } : { userItems: [] }),
          seo: getSeoProps(),
        },
        revalidate: 60,
      };
    }
    throw err;
  }
}
