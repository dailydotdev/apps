import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import type { QueryClient } from '@tanstack/react-query';
import { useQueries, useQuery } from '@tanstack/react-query';
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
  TAG_FEED_QUERY,
  type FeedData,
} from '@dailydotdev/shared/src/graphql/feed';
import { PostType } from '@dailydotdev/shared/src/types';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { sourceQueryOptions } from '@dailydotdev/shared/src/graphql/sources';
import {
  RequestKey,
  StaleTime,
  generateQueryKey,
} from '@dailydotdev/shared/src/lib/query';
import { useScrollRestoration } from '@dailydotdev/shared/src/hooks';
import { ExploreNewsLayout } from './ExploreNewsLayout';
import type { ExploreCategoryId } from './exploreCategories';
import { EXPLORE_CATEGORIES, getExploreCategoryById } from './exploreCategories';

const TOPIC_CLUSTER_CATEGORY_IDS = (() => {
  const agenticIndex = EXPLORE_CATEGORIES.findIndex(
    (category) => category.id === 'agentic',
  );

  return EXPLORE_CATEGORIES.slice(agenticIndex + 1).map(
    (category) => category.id,
  ) as ExploreCategoryId[];
})();

const HIGHLIGHTS_CHANNEL = 'vibes';
const STORIES_PER_SECTION = 8;
const UPVOTED_AND_DISCUSSED_PERIOD = 7;
const DEFAULT_EXPLORE_ARENA_TAB: ArenaTab = 'llms';
const VIDEO_SUPPORTED_TYPES = [PostType.VideoYouTube];

const HIGHLIGHTS_QUERY_KEY = generateQueryKey(
  RequestKey.PostHighlights,
  undefined,
  HIGHLIGHTS_CHANNEL,
);

const getFeedQueryKey = (
  categoryId: ExploreCategoryId,
  section: 'latest' | 'popular' | 'upvoted' | 'discussed',
) => ['explore', categoryId, section] as const;

const getHighlightsQuery = () =>
  gqlClient.request<{ postHighlights: PostHighlight[] }>(
    POST_HIGHLIGHTS_QUERY,
    {
      channel: HIGHLIGHTS_CHANNEL,
    },
  );

const getLatestStoriesQuery = ({
  tag,
  supportedTypes,
}: {
  tag?: string;
  supportedTypes?: PostType[];
}) => {
  if (tag) {
    return () =>
      gqlClient.request<FeedData>(TAG_FEED_QUERY, {
        tag,
        first: STORIES_PER_SECTION,
        ranking: RankingAlgorithm.Time,
        supportedTypes,
      });
  }

  return () =>
    gqlClient.request<FeedData>(ANONYMOUS_FEED_QUERY, {
      first: STORIES_PER_SECTION,
      ranking: RankingAlgorithm.Time,
      supportedTypes,
    });
};

const getPopularStoriesQuery = ({
  tag,
  supportedTypes,
}: {
  tag?: string;
  supportedTypes?: PostType[];
}) => {
  if (tag) {
    return () =>
      gqlClient.request<FeedData>(TAG_FEED_QUERY, {
        tag,
        first: STORIES_PER_SECTION,
        ranking: RankingAlgorithm.Popularity,
        supportedTypes,
      });
  }

  return () =>
    gqlClient.request<FeedData>(ANONYMOUS_FEED_QUERY, {
      first: STORIES_PER_SECTION,
      ranking: RankingAlgorithm.Popularity,
      supportedTypes,
    });
};

const getUpvotedStoriesQuery =
  ({ tag, supportedTypes }: { tag?: string; supportedTypes?: PostType[] }) =>
  () =>
    gqlClient.request<FeedData>(MOST_UPVOTED_FEED_QUERY, {
      first: STORIES_PER_SECTION,
      period: UPVOTED_AND_DISCUSSED_PERIOD,
      tag,
      supportedTypes,
    });

const getDiscussedStoriesQuery =
  ({ tag, supportedTypes }: { tag?: string; supportedTypes?: PostType[] }) =>
  () =>
    gqlClient.request<FeedData>(MOST_DISCUSSED_FEED_QUERY, {
      first: STORIES_PER_SECTION,
      period: UPVOTED_AND_DISCUSSED_PERIOD,
      tag,
      supportedTypes,
    });

const getFeedQueriesForCategory = (categoryId: ExploreCategoryId) => {
  const category = getExploreCategoryById(categoryId);
  const isVideosCategory =
    !!category && 'isVideos' in category && !!category.isVideos;
  const tag = category && 'tag' in category ? category.tag : undefined;
  const supportedTypes = isVideosCategory ? VIDEO_SUPPORTED_TYPES : undefined;

  return {
    latest: getLatestStoriesQuery({ tag, supportedTypes }),
    popular: getPopularStoriesQuery({ tag, supportedTypes }),
    upvoted: getUpvotedStoriesQuery({ tag, supportedTypes }),
    discussed: getDiscussedStoriesQuery({ tag, supportedTypes }),
  };
};

export const prefetchExplorePageData = async ({
  queryClient,
  categoryId,
}: {
  queryClient: QueryClient;
  categoryId: ExploreCategoryId;
}): Promise<void> => {
  const feedQueries = getFeedQueriesForCategory(categoryId);

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: HIGHLIGHTS_QUERY_KEY,
      queryFn: getHighlightsQuery,
    }),
    queryClient.prefetchQuery(
      sourceQueryOptions({ sourceId: 'agents_digest' }),
    ),
    queryClient.prefetchQuery(
      arenaOptions({ groupId: DEFAULT_EXPLORE_ARENA_TAB }),
    ),
    queryClient.prefetchQuery(arenaOptions({ groupId: 'coding-agents' })),
    queryClient.prefetchQuery({
      queryKey: getFeedQueryKey(categoryId, 'latest'),
      queryFn: feedQueries.latest,
    }),
    queryClient.prefetchQuery({
      queryKey: getFeedQueryKey(categoryId, 'popular'),
      queryFn: feedQueries.popular,
    }),
    queryClient.prefetchQuery({
      queryKey: getFeedQueryKey(categoryId, 'upvoted'),
      queryFn: feedQueries.upvoted,
    }),
    queryClient.prefetchQuery({
      queryKey: getFeedQueryKey(categoryId, 'discussed'),
      queryFn: feedQueries.discussed,
    }),
  ]);
};

export const ExplorePageContent = ({
  activeCategoryId,
}: {
  activeCategoryId: ExploreCategoryId;
}): ReactElement => {
  useScrollRestoration();
  const [arenaTab, setArenaTab] = useState<ArenaTab>(DEFAULT_EXPLORE_ARENA_TAB);
  const feedQueries = useMemo(
    () => getFeedQueriesForCategory(activeCategoryId),
    [activeCategoryId],
  );
  const isVideosCategory = activeCategoryId === 'videos';
  const isExploreCategory = activeCategoryId === 'explore';

  const { data: highlightsData, isFetching: isFetchingHighlights } = useQuery({
    queryKey: HIGHLIGHTS_QUERY_KEY,
    queryFn: getHighlightsQuery,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000,
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
    queryKey: getFeedQueryKey(activeCategoryId, 'latest'),
    queryFn: feedQueries.latest,
    staleTime: StaleTime.Default,
  });
  const { data: popularStoriesData } = useQuery({
    queryKey: getFeedQueryKey(activeCategoryId, 'popular'),
    queryFn: feedQueries.popular,
    staleTime: StaleTime.Default,
  });
  const { data: upvotedStoriesData } = useQuery({
    queryKey: getFeedQueryKey(activeCategoryId, 'upvoted'),
    queryFn: feedQueries.upvoted,
    staleTime: StaleTime.Default,
  });
  const { data: discussedStoriesData } = useQuery({
    queryKey: getFeedQueryKey(activeCategoryId, 'discussed'),
    queryFn: feedQueries.discussed,
    staleTime: StaleTime.Default,
  });
  const topicClusterStoriesQueries = useQueries({
    queries: TOPIC_CLUSTER_CATEGORY_IDS.map((categoryId) => ({
      queryKey: getFeedQueryKey(categoryId, 'latest'),
      queryFn: getFeedQueriesForCategory(categoryId).latest,
      staleTime: StaleTime.Default,
      enabled: isExploreCategory,
    })),
  });

  const latestStories =
    latestStoriesData?.page?.edges?.map((edge) => edge.node) ?? [];
  const popularStories =
    popularStoriesData?.page?.edges?.map((edge) => edge.node) ?? [];
  const upvotedStories =
    upvotedStoriesData?.page?.edges?.map((edge) => edge.node) ?? [];
  const discussedStories =
    discussedStoriesData?.page?.edges?.map((edge) => edge.node) ?? [];
  const sortedHighlights = useMemo(
    () =>
      [...(highlightsData?.postHighlights ?? [])].sort(
        (a, b) =>
          new Date(b.highlightedAt).getTime() -
          new Date(a.highlightedAt).getTime(),
      ),
    [highlightsData?.postHighlights],
  );
  const topicClusterStoriesByCategory = useMemo(
    () =>
      TOPIC_CLUSTER_CATEGORY_IDS.reduce<
        Partial<Record<ExploreCategoryId, typeof latestStories>>
      >((acc, categoryId, index) => {
        const categoryStories =
          topicClusterStoriesQueries[index]?.data?.page?.edges?.map(
            (edge) => edge.node,
          ) ?? [];

        acc[categoryId] = categoryStories;
        return acc;
      }, {}),
    [topicClusterStoriesQueries],
  );

  return (
    <ExploreNewsLayout
      activeTabId={activeCategoryId}
      highlights={sortedHighlights}
      highlightsLoading={isFetchingHighlights && !highlightsData}
      digestSource={digestSource}
      latestStories={isVideosCategory ? [] : latestStories}
      popularStories={isVideosCategory ? [] : popularStories}
      upvotedStories={isVideosCategory ? [] : upvotedStories}
      discussedStories={isVideosCategory ? [] : discussedStories}
      videoLatestStories={isVideosCategory ? latestStories : []}
      videoPopularStories={isVideosCategory ? popularStories : []}
      videoUpvotedStories={isVideosCategory ? upvotedStories : []}
      videoDiscussedStories={isVideosCategory ? discussedStories : []}
      arenaTools={arenaRankings}
      arenaLoading={isArenaLoading}
      arenaTab={arenaTab}
      onArenaTabChange={setArenaTab}
      arenaHighlightsItems={arenaData?.sentimentHighlights?.items ?? []}
      categoryClusterStories={topicClusterStoriesByCategory}
    />
  );
};
