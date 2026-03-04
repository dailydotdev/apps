import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import type { ReactElement } from 'react';
import React, { useEffect, useMemo } from 'react';
import type { DehydratedState } from '@tanstack/react-query';
import {
  dehydrate,
  QueryClient,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { arenaOptions } from '@dailydotdev/shared/src/features/agents/arena/queries';
import { computeRankings } from '@dailydotdev/shared/src/features/agents/arena/arenaMetrics';
import type { FeedData } from '@dailydotdev/shared/src/graphql/feed';
import {
  baseFeedSupportedTypes,
  RankingAlgorithm,
  SOURCE_FEED_QUERY,
} from '@dailydotdev/shared/src/graphql/feed';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { useSharePost } from '@dailydotdev/shared/src/hooks/useSharePost';
import { useScrollRestoration } from '@dailydotdev/shared/src/hooks';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { sourceQueryOptions } from '@dailydotdev/shared/src/graphql/sources';
import { AgentsLeaderboardSection } from '../../components/agents/AgentsLeaderboardSection';
import { AgentsDigestCard } from '../../components/agents/AgentsDigestCard';
import { AgentsDoomScrollingSection } from '../../components/agents/AgentsDoomScrollingSection';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';

const AGENTS_TITLE = 'Agents Hub - Arena, Digest & Vibes | daily.dev';
const AGENTS_DESCRIPTION =
  'Track the top coding agents live, catch the latest Agents Digest, and follow the Vibes channel feed on daily.dev.';
const AGENTS_DIGEST_QUERY_KEY = generateQueryKey(
  RequestKey.SourceFeed,
  undefined,
  'agents_digest_latest_post',
);

interface AgentsHomePageProps {
  dehydratedState: DehydratedState;
}

const digestFeedVariables = {
  source: 'agents_digest',
  ranking: RankingAlgorithm.Time,
  first: 1,
  supportedTypes: baseFeedSupportedTypes,
};

const AgentsHomePage = (): ReactElement => {
  useScrollRestoration();

  const { user, tokenRefreshed } = useAuthContext();
  const queryClient = useQueryClient();
  const { copyLink } = useSharePost(Origin.Feed);

  const { data: arenaData, isFetching: isFetchingArena } = useQuery(
    arenaOptions({ groupId: 'coding-agents' }),
  );

  const rankings = useMemo(
    () =>
      arenaData?.sentimentTimeSeries && arenaData.sentimentGroup
        ? computeRankings(
            arenaData.sentimentTimeSeries.entities.nodes,
            arenaData.sentimentGroup.entities,
            arenaData.sentimentTimeSeries.resolutionSeconds,
          )
        : [],
    [arenaData?.sentimentTimeSeries, arenaData?.sentimentGroup],
  );

  const topFiveRankings = useMemo(() => rankings.slice(0, 5), [rankings]);
  const isArenaLoading = isFetchingArena && !arenaData;

  const { data: digestFeed } = useQuery({
    queryKey: AGENTS_DIGEST_QUERY_KEY,
    queryFn: () =>
      gqlClient.request<FeedData>(SOURCE_FEED_QUERY, digestFeedVariables),
  });

  const digestPost = digestFeed?.page?.edges?.[0]?.node;
  const { data: digestSource } = useQuery(
    sourceQueryOptions({ sourceId: 'agents_digest' }),
  );

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    queryClient.invalidateQueries({ queryKey: AGENTS_DIGEST_QUERY_KEY });
  }, [queryClient, user?.id]);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 px-4 pb-8 pt-6 laptop:max-w-[42.5rem] laptop:px-0 laptop:pt-10">
      <AgentsLeaderboardSection
        tools={topFiveRankings}
        loading={isArenaLoading}
      />
      <AgentsDigestCard
        post={digestPost}
        source={digestSource}
        onCopyLink={() => {
          if (!digestPost) {
            return;
          }

          copyLink({ post: digestPost });
        }}
      />
      <AgentsDoomScrollingSection
        userId={user?.id}
        tokenRefreshed={tokenRefreshed}
      />
    </div>
  );
};

const getAgentsLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

AgentsHomePage.getLayout = getAgentsLayout;
AgentsHomePage.layoutProps = {
  screenCentered: false,
  seo: {
    title: AGENTS_TITLE,
    description: AGENTS_DESCRIPTION,
    canonical: 'https://app.daily.dev/agents',
    openGraph: {
      title: AGENTS_TITLE,
      description: AGENTS_DESCRIPTION,
      url: 'https://app.daily.dev/agents',
      type: 'website',
    },
  },
};

export default AgentsHomePage;

export async function getServerSideProps({
  res,
}: GetServerSidePropsContext): Promise<
  GetServerSidePropsResult<AgentsHomePageProps>
> {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=60, stale-while-revalidate=120',
  );

  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery(arenaOptions({ groupId: 'coding-agents' })),
    queryClient.prefetchQuery({
      queryKey: AGENTS_DIGEST_QUERY_KEY,
      queryFn: () =>
        gqlClient.request<FeedData>(SOURCE_FEED_QUERY, digestFeedVariables),
    }),
    queryClient.prefetchQuery(
      sourceQueryOptions({ sourceId: 'agents_digest' }),
    ),
  ]);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
}
