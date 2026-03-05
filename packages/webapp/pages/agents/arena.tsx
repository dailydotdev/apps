import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import type { DehydratedState } from '@tanstack/react-query';
import { dehydrate, QueryClient, useQuery } from '@tanstack/react-query';
import { ArenaPage } from '@dailydotdev/shared/src/features/agents/arena/ArenaPage';
import { getArenaLastUpdatedIso } from '@dailydotdev/shared/src/features/agents/arena/timestamps';
import type {
  ArenaQueryResponse,
  ArenaTab,
} from '@dailydotdev/shared/src/features/agents/arena/types';
import { arenaOptions } from '@dailydotdev/shared/src/features/agents/arena/queries';
import { computeRankings } from '@dailydotdev/shared/src/features/agents/arena/arenaMetrics';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';

interface ArenaPageRouteProps {
  initialTab: ArenaTab;
  dehydratedState: DehydratedState;
}

const ARENA_TITLE = 'The Arena - Agents & LLM Leaderboard | daily.dev';
const ARENA_DESCRIPTION =
  "No benchmarks. No hype. Just developers voting on which AI coding agents and LLMs actually deliver. See who's on top right now.";

const getTabUrl = (tab: ArenaTab): string => {
  if (tab === 'coding-agents') {
    return 'https://app.daily.dev/agents/arena';
  }

  return 'https://app.daily.dev/agents/arena?tab=llms';
};

const getArenaJsonLd = ({
  activeTab,
  rankings,
  dateModified,
}: {
  activeTab: ArenaTab;
  rankings: ReturnType<typeof computeRankings>;
  dateModified?: string;
}): string =>
  JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: ARENA_TITLE,
    description: ARENA_DESCRIPTION,
    url: getTabUrl(activeTab),
    ...(dateModified ? { dateModified } : {}),
    isPartOf: {
      '@type': 'WebSite',
      name: 'daily.dev',
      url: 'https://app.daily.dev',
    },
    about: [
      { '@type': 'Thing', name: 'AI coding agents' },
      { '@type': 'Thing', name: 'Large language models' },
      { '@type': 'Thing', name: 'Developer sentiment' },
    ],
    mainEntity: {
      '@type': 'ItemList',
      name:
        activeTab === 'coding-agents' ? 'Coding Agents Ranking' : 'LLM Ranking',
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
      numberOfItems: Math.min(rankings.length, 10),
      itemListElement: rankings.slice(0, 10).map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'SoftwareApplication',
          name: item.entity.name,
          image: item.entity.logo,
          applicationCategory:
            activeTab === 'coding-agents'
              ? 'DeveloperApplication'
              : 'ArtificialIntelligenceApplication',
        },
      })),
    },
  });

const getArenaBreadcrumbJsonLd = (): string =>
  JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://app.daily.dev',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Agentic Hub',
        item: 'https://app.daily.dev/agents',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'The Arena',
        item: 'https://app.daily.dev/agents/arena',
      },
    ],
  });

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

  const { data } = useQuery(arenaOptions({ groupId: activeTab }));
  const rankings =
    data?.sentimentTimeSeries && data.sentimentGroup
      ? computeRankings(
          data.sentimentTimeSeries.entities.nodes,
          data.sentimentGroup.entities,
          data.sentimentTimeSeries.resolutionSeconds,
        )
      : [];
  const dateModified = data
    ? getArenaLastUpdatedIso(data as ArenaQueryResponse)
    : undefined;

  const handleTabChange = (tab: ArenaTab): void => {
    const query = tab === 'coding-agents' ? {} : { tab };
    router.replace({ pathname: router.pathname, query }, undefined, {
      shallow: true,
    });
  };

  return (
    <>
      <script
        key={activeTab}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: getArenaJsonLd({ activeTab, rankings, dateModified }),
        }}
      />
      <script
        key="arena-breadcrumbs"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: getArenaBreadcrumbJsonLd(),
        }}
      />
      <ArenaPage activeTab={activeTab} onTabChange={handleTabChange} />
    </>
  );
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
    title: ARENA_TITLE,
    description: ARENA_DESCRIPTION,
    canonical: 'https://app.daily.dev/agents/arena',
    openGraph: {
      title: ARENA_TITLE,
      description: ARENA_DESCRIPTION,
      url: 'https://app.daily.dev/agents/arena',
      type: 'website',
    },
  },
};

export default ArenaPageRoute;
