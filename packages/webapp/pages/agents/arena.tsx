import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import type { DehydratedState } from '@tanstack/react-query';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { ArenaPage } from '@dailydotdev/shared/src/features/agents/arena/ArenaPage';
import type { ArenaTab } from '@dailydotdev/shared/src/features/agents/arena/types';
import { arenaOptions } from '@dailydotdev/shared/src/features/agents/arena/queries';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';

interface ArenaPageRouteProps {
  initialTab: ArenaTab;
  dehydratedState: DehydratedState;
}

const ArenaPageRoute = ({ initialTab }: ArenaPageRouteProps): ReactElement => {
  const router = useRouter();
  const queryTab = router.query.tab;
  let activeTab: ArenaTab = initialTab;
  if (queryTab === 'llms') {
    activeTab = 'llms';
  }
  if (queryTab === 'coding-agents') {
    activeTab = 'coding-agents';
  }

  const handleTabChange = (tab: ArenaTab): void => {
    const query = tab === 'coding-agents' ? {} : { tab };
    router.replace({ pathname: router.pathname, query }, undefined, {
      shallow: true,
    });
  };

  return <ArenaPage activeTab={activeTab} onTabChange={handleTabChange} />;
};

export async function getServerSideProps({
  query,
  res,
}: GetServerSidePropsContext): Promise<
  GetServerSidePropsResult<ArenaPageRouteProps>
> {
  const initialTab: ArenaTab = query.tab === 'llms' ? 'llms' : 'coding-agents';

  res.setHeader(
    'Cache-Control',
    'public, s-maxage=60, stale-while-revalidate=120',
  );

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(arenaOptions({ groupId: initialTab }));

  return {
    props: {
      initialTab,
      dehydratedState: dehydrate(queryClient),
    },
  };
}

const getArenaLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

ArenaPageRoute.getLayout = getArenaLayout;
ArenaPageRoute.layoutProps = {
  screenCentered: false,
  seo: {
    title: 'The Arena - Agents & LLM Leaderboard | daily.dev',
    description:
      "No benchmarks. No hype. Just developers voting on which AI coding agents and LLMs actually deliver. See who's on top right now.",
  },
};

export default ArenaPageRoute;
