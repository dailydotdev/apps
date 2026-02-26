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
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { ArenaLaunchPromo } from '../../components/agents/ArenaLaunchPromo';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';

interface ArenaPageRouteProps {
  initialTab: ArenaTab;
  dehydratedState: DehydratedState;
  isTwitterTraffic: boolean;
}

const ARENA_TITLE = 'The Arena - Agents & LLM Leaderboard | daily.dev';
const ARENA_DESCRIPTION =
  "No benchmarks. No hype. Just developers voting on which AI coding agents and LLMs actually deliver. See who's on top right now.";
const ARENA_LAUNCH_TWEET_URL =
  'https://x.com/idoshamun/status/2027040061061996827';
const TWITTER_HOST_INDICATORS = ['x.', 'twitter.', 't.co'];

const isTwitterUtmSource = (
  utmSource: string | string[] | undefined,
): boolean => {
  if (!utmSource) {
    return false;
  }

  const sources = Array.isArray(utmSource) ? utmSource : [utmSource];
  return sources.some((source) => {
    const normalizedSource = source.toLowerCase();
    return normalizedSource === 'twitter' || normalizedSource === 'x';
  });
};

const isTwitterReferrer = (referrer: string | undefined): boolean => {
  if (!referrer) {
    return false;
  }

  try {
    const host = new URL(referrer).hostname;
    return TWITTER_HOST_INDICATORS.some((indicator) =>
      host.includes(indicator),
    );
  } catch {
    return false;
  }
};

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

const ArenaPageRoute = ({
  initialTab,
  isTwitterTraffic,
}: ArenaPageRouteProps): ReactElement => {
  const router = useRouter();
  const { isLoggedIn } = useAuthContext();
  const shouldShowLaunchTweetPromo = isLoggedIn && !isTwitterTraffic;

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
      <ArenaPage
        activeTab={activeTab}
        onTabChange={handleTabChange}
        headerAside={
          <ArenaLaunchPromo
            visible={shouldShowLaunchTweetPromo}
            tweetUrl={ARENA_LAUNCH_TWEET_URL}
          />
        }
      />
    </>
  );
};

export async function getServerSideProps({
  query,
  req,
  res,
}: GetServerSidePropsContext): Promise<
  GetServerSidePropsResult<ArenaPageRouteProps>
> {
  const initialTab: ArenaTab = query.tab === 'llms' ? 'llms' : 'coding-agents';
  const referrerHeader =
    typeof req.headers.referer === 'string' ? req.headers.referer : undefined;
  const isTwitterTrafficDetected =
    isTwitterReferrer(referrerHeader) || isTwitterUtmSource(query.utm_source);

  res.setHeader(
    'Cache-Control',
    'public, s-maxage=60, stale-while-revalidate=120',
  );

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(arenaOptions({ groupId: initialTab }));

  return {
    props: {
      initialTab,
      isTwitterTraffic: isTwitterTrafficDetected,
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
