import type { GetStaticPropsResult } from 'next';
import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import type { DehydratedState } from '@tanstack/react-query';
import { dehydrate, QueryClient, useQuery } from '@tanstack/react-query';
import type { NextSeoProps } from 'next-seo/lib/types';
import { arenaOptions } from '@dailydotdev/shared/src/features/agents/arena/queries';
import { computeRankings } from '@dailydotdev/shared/src/features/agents/arena/arenaMetrics';
import type { ArenaTab } from '@dailydotdev/shared/src/features/agents/arena/types';
import type { PostHighlight } from '@dailydotdev/shared/src/graphql/highlights';
import { POST_HIGHLIGHTS_QUERY } from '@dailydotdev/shared/src/graphql/highlights';
import {
  ANONYMOUS_FEED_QUERY,
  MOST_DISCUSSED_FEED_QUERY,
  MOST_UPVOTED_FEED_QUERY,
  RankingAlgorithm,
  type FeedData,
} from '@dailydotdev/shared/src/graphql/feed';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { sourceQueryOptions } from '@dailydotdev/shared/src/graphql/sources';
import {
  RequestKey,
  generateQueryKey,
  StaleTime,
} from '@dailydotdev/shared/src/lib/query';
import { useScrollRestoration } from '@dailydotdev/shared/src/hooks';
import { getLayout as getFooterNavBarLayout } from '../components/layouts/FooterNavBarLayout';
import { getLayout } from '../components/layouts/MainLayout';
import { ExploreNewsLayout } from '../components/explore/ExploreNewsLayout';
import { defaultOpenGraph } from '../next-seo';
import { getPageSeoTitles } from '../components/layouts/utils';

const HIGHLIGHTS_CHANNEL = 'vibes';
const STORIES_PER_SECTION = 8;
const UPVOTED_AND_DISCUSSED_PERIOD = 7;
const DEFAULT_EXPLORE_ARENA_TAB: ArenaTab = 'llms';

const HIGHLIGHTS_QUERY_KEY = generateQueryKey(
  RequestKey.PostHighlights,
  undefined,
  HIGHLIGHTS_CHANNEL,
);
const EXPLORE_LATEST_QUERY_KEY = ['explore', 'latest'] as const;
const EXPLORE_POPULAR_QUERY_KEY = ['explore', 'popular'] as const;
const EXPLORE_UPVOTED_QUERY_KEY = ['explore', 'upvoted'] as const;
const EXPLORE_DISCUSSED_QUERY_KEY = ['explore', 'discussed'] as const;

const getHighlightsQuery = () =>
  gqlClient.request<{ postHighlights: PostHighlight[] }>(
    POST_HIGHLIGHTS_QUERY,
    {
      channel: HIGHLIGHTS_CHANNEL,
    },
  );

const getLatestStoriesQuery = () =>
  gqlClient.request<FeedData>(ANONYMOUS_FEED_QUERY, {
    first: STORIES_PER_SECTION,
    ranking: RankingAlgorithm.Time,
  });

const getPopularStoriesQuery = () =>
  gqlClient.request<FeedData>(ANONYMOUS_FEED_QUERY, {
    first: STORIES_PER_SECTION,
    ranking: RankingAlgorithm.Popularity,
  });

const getUpvotedStoriesQuery = () =>
  gqlClient.request<FeedData>(MOST_UPVOTED_FEED_QUERY, {
    first: STORIES_PER_SECTION,
    period: UPVOTED_AND_DISCUSSED_PERIOD,
  });

const getDiscussedStoriesQuery = () =>
  gqlClient.request<FeedData>(MOST_DISCUSSED_FEED_QUERY, {
    first: STORIES_PER_SECTION,
    period: UPVOTED_AND_DISCUSSED_PERIOD,
  });

interface ExplorePageProps {
  dehydratedState: DehydratedState;
}

const seoTitles = getPageSeoTitles('Explore developer news');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: {
    ...defaultOpenGraph,
    ...seoTitles.openGraph,
    url: 'https://app.daily.dev/explore',
  },
  description:
    'Scan happening now updates, latest stories, and top developer news in one place on daily.dev.',
  canonical: 'https://app.daily.dev/explore',
};

const ExplorePage = (): ReactElement => {
  useScrollRestoration();
  const [arenaTab, setArenaTab] = useState<ArenaTab>(DEFAULT_EXPLORE_ARENA_TAB);

  const { data: highlightsData, isFetching: isFetchingHighlights } = useQuery({
    queryKey: HIGHLIGHTS_QUERY_KEY,
    queryFn: getHighlightsQuery,
    staleTime: StaleTime.Default,
  });
  const { data: digestSource } = useQuery(
    sourceQueryOptions({ sourceId: 'agents_digest' }),
  );
  const { data: arenaData, isFetching: isFetchingArena } = useQuery(
    arenaOptions({ groupId: arenaTab }),
  );

  const arenaRankings = useMemo(
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
  const isArenaLoading = isFetchingArena && !arenaData;

  const { data: latestStoriesData } = useQuery({
    queryKey: EXPLORE_LATEST_QUERY_KEY,
    queryFn: getLatestStoriesQuery,
    staleTime: StaleTime.Default,
  });
  const { data: popularStoriesData } = useQuery({
    queryKey: EXPLORE_POPULAR_QUERY_KEY,
    queryFn: getPopularStoriesQuery,
    staleTime: StaleTime.Default,
  });
  const { data: upvotedStoriesData } = useQuery({
    queryKey: EXPLORE_UPVOTED_QUERY_KEY,
    queryFn: getUpvotedStoriesQuery,
    staleTime: StaleTime.Default,
  });
  const { data: discussedStoriesData } = useQuery({
    queryKey: EXPLORE_DISCUSSED_QUERY_KEY,
    queryFn: getDiscussedStoriesQuery,
    staleTime: StaleTime.Default,
  });

  return (
    <ExploreNewsLayout
      highlights={highlightsData?.postHighlights ?? []}
      highlightsLoading={isFetchingHighlights && !highlightsData}
      digestSource={digestSource}
      latestStories={
        latestStoriesData?.page?.edges?.map((edge) => edge.node) ?? []
      }
      popularStories={
        popularStoriesData?.page?.edges?.map((edge) => edge.node) ?? []
      }
      upvotedStories={
        upvotedStoriesData?.page?.edges?.map((edge) => edge.node) ?? []
      }
      discussedStories={
        discussedStoriesData?.page?.edges?.map((edge) => edge.node) ?? []
      }
      arenaTools={arenaRankings}
      arenaLoading={isArenaLoading}
      arenaTab={arenaTab}
      onArenaTabChange={setArenaTab}
      arenaHighlightsItems={arenaData?.sentimentHighlights?.items ?? []}
    />
  );
};

const getExploreLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

ExplorePage.getLayout = getExploreLayout;
ExplorePage.layoutProps = {
  screenCentered: false,
  seo,
};

export default ExplorePage;

export async function getStaticProps(): Promise<
  GetStaticPropsResult<ExplorePageProps>
> {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: HIGHLIGHTS_QUERY_KEY,
      queryFn: getHighlightsQuery,
    }),
    queryClient.prefetchQuery(
      sourceQueryOptions({ sourceId: 'agents_digest' }),
    ),
    queryClient.prefetchQuery(arenaOptions({ groupId: DEFAULT_EXPLORE_ARENA_TAB })),
    queryClient.prefetchQuery(arenaOptions({ groupId: 'coding-agents' })),
    queryClient.prefetchQuery({
      queryKey: EXPLORE_LATEST_QUERY_KEY,
      queryFn: getLatestStoriesQuery,
    }),
    queryClient.prefetchQuery({
      queryKey: EXPLORE_POPULAR_QUERY_KEY,
      queryFn: getPopularStoriesQuery,
    }),
    queryClient.prefetchQuery({
      queryKey: EXPLORE_UPVOTED_QUERY_KEY,
      queryFn: getUpvotedStoriesQuery,
    }),
    queryClient.prefetchQuery({
      queryKey: EXPLORE_DISCUSSED_QUERY_KEY,
      queryFn: getDiscussedStoriesQuery,
    }),
  ]);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 600,
  };
}
