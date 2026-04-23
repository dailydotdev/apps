import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import type { QueryClient } from '@tanstack/react-query';
import { useQueries, useQuery } from '@tanstack/react-query';
import { arenaOptions } from '@dailydotdev/shared/src/features/agents/arena/queries';
import { computeRankings } from '@dailydotdev/shared/src/features/agents/arena/arenaMetrics';
import type { ArenaTab } from '@dailydotdev/shared/src/features/agents/arena/types';
import type { PostHighlight } from '@dailydotdev/shared/src/graphql/highlights';
import { POST_HIGHLIGHTS_QUERY } from '@dailydotdev/shared/src/graphql/highlights';
import {
  ANONYMOUS_FEED_QUERY,
  FEED_QUERY,
  MOST_DISCUSSED_FEED_QUERY,
  MOST_UPVOTED_FEED_QUERY,
  RankingAlgorithm,
  TAG_FEED_QUERY,
  type FeedData,
} from '@dailydotdev/shared/src/graphql/feed';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { PostType } from '@dailydotdev/shared/src/types';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { sourceQueryOptions } from '@dailydotdev/shared/src/graphql/sources';
import {
  RequestKey,
  StaleTime,
  generateQueryKey,
} from '@dailydotdev/shared/src/lib/query';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { useScrollRestoration } from '@dailydotdev/shared/src/hooks';
import {
  ExploreLayoutPreference,
  getExploreLayoutPreference,
} from '@dailydotdev/shared/src/lib/exploreLayoutPreference';
import { getPageSeoTitles } from '../layouts/utils';
import { defaultOpenGraph } from '../../next-seo';
import { ExploreNewsLayout } from './ExploreNewsLayout';
import type { ExploreCategoryId } from './exploreCategories';
import {
  EXPLORE_TOPIC_CLUSTER_CATEGORY_IDS,
  getExploreCategoryById,
} from './exploreCategories';
import { useExploreFeedTranslations } from './useExploreFeedTranslations';

const HIGHLIGHTS_CHANNEL = 'vibes';
const STORIES_PER_SECTION = 12;
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
  isLoggedIn: boolean,
) =>
  ['explore', isLoggedIn ? 'logged-in' : 'anonymous', categoryId, section] as const;

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
  isLoggedIn,
}: {
  tag?: string;
  supportedTypes?: PostType[];
  isLoggedIn: boolean;
}) => {
  if (tag) {
    return () =>
      gqlClient.request<FeedData>(TAG_FEED_QUERY, {
        loggedIn: isLoggedIn,
        tag,
        first: STORIES_PER_SECTION,
        ranking: RankingAlgorithm.Time,
        supportedTypes,
      });
  }

  const feedQuery = isLoggedIn ? FEED_QUERY : ANONYMOUS_FEED_QUERY;

  return () =>
    gqlClient.request<FeedData>(feedQuery, {
      loggedIn: isLoggedIn,
      first: STORIES_PER_SECTION,
      ranking: RankingAlgorithm.Time,
      supportedTypes,
    });
};

const getPopularStoriesQuery = ({
  tag,
  supportedTypes,
  isLoggedIn,
}: {
  tag?: string;
  supportedTypes?: PostType[];
  isLoggedIn: boolean;
}) => {
  if (tag) {
    return () =>
      gqlClient.request<FeedData>(TAG_FEED_QUERY, {
        loggedIn: isLoggedIn,
        tag,
        first: STORIES_PER_SECTION,
        ranking: RankingAlgorithm.Popularity,
        supportedTypes,
      });
  }

  const feedQuery = isLoggedIn ? FEED_QUERY : ANONYMOUS_FEED_QUERY;

  return () =>
    gqlClient.request<FeedData>(feedQuery, {
      loggedIn: isLoggedIn,
      first: STORIES_PER_SECTION,
      ranking: RankingAlgorithm.Popularity,
      supportedTypes,
    });
};

const getUpvotedStoriesQuery =
  ({
    tag,
    supportedTypes,
    isLoggedIn,
  }: {
    tag?: string;
    supportedTypes?: PostType[];
    isLoggedIn: boolean;
  }) =>
  () =>
    gqlClient.request<FeedData>(MOST_UPVOTED_FEED_QUERY, {
      loggedIn: isLoggedIn,
      first: STORIES_PER_SECTION,
      period: UPVOTED_AND_DISCUSSED_PERIOD,
      tag,
      supportedTypes,
    });

const getDiscussedStoriesQuery =
  ({
    tag,
    supportedTypes,
    isLoggedIn,
  }: {
    tag?: string;
    supportedTypes?: PostType[];
    isLoggedIn: boolean;
  }) =>
  () =>
    gqlClient.request<FeedData>(MOST_DISCUSSED_FEED_QUERY, {
      loggedIn: isLoggedIn,
      first: STORIES_PER_SECTION,
      period: UPVOTED_AND_DISCUSSED_PERIOD,
      tag,
      supportedTypes,
    });

const getFeedQueriesForCategory = (
  categoryId: ExploreCategoryId,
  isLoggedIn: boolean,
) => {
  const category = getExploreCategoryById(categoryId);
  const isVideosCategory =
    !!category && 'isVideos' in category && !!category.isVideos;
  const tag = category && 'tag' in category ? category.tag : undefined;
  const supportedTypes = isVideosCategory ? VIDEO_SUPPORTED_TYPES : undefined;

  return {
    latest: getLatestStoriesQuery({ tag, supportedTypes, isLoggedIn }),
    popular: getPopularStoriesQuery({ tag, supportedTypes, isLoggedIn }),
    upvoted: getUpvotedStoriesQuery({ tag, supportedTypes, isLoggedIn }),
    discussed: getDiscussedStoriesQuery({ tag, supportedTypes, isLoggedIn }),
  };
};

export const prefetchExplorePageData = async ({
  queryClient,
  categoryId,
}: {
  queryClient: QueryClient;
  categoryId: ExploreCategoryId;
}): Promise<void> => {
  const isLoggedIn = false;
  const feedQueries = getFeedQueriesForCategory(categoryId, isLoggedIn);

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
      queryKey: getFeedQueryKey(categoryId, 'latest', isLoggedIn),
      queryFn: feedQueries.latest,
    }),
    queryClient.prefetchQuery({
      queryKey: getFeedQueryKey(categoryId, 'popular', isLoggedIn),
      queryFn: feedQueries.popular,
    }),
    queryClient.prefetchQuery({
      queryKey: getFeedQueryKey(categoryId, 'upvoted', isLoggedIn),
      queryFn: feedQueries.upvoted,
    }),
    queryClient.prefetchQuery({
      queryKey: getFeedQueryKey(categoryId, 'discussed', isLoggedIn),
      queryFn: feedQueries.discussed,
    }),
  ]);
};

export const ExplorePageContent = ({
  activeCategoryId,
}: {
  activeCategoryId: ExploreCategoryId;
}): ReactElement => {
  const router = useRouter();
  const { isLoggedIn } = useAuthContext();
  useScrollRestoration();
  const [arenaTab, setArenaTab] = useState<ArenaTab>(DEFAULT_EXPLORE_ARENA_TAB);

  useEffect(() => {
    if (getExploreLayoutPreference() !== ExploreLayoutPreference.Cards) {
      return;
    }

    router.replace('/posts');
  }, [router]);
  const feedQueries = useMemo(
    () => getFeedQueriesForCategory(activeCategoryId, isLoggedIn),
    [activeCategoryId, isLoggedIn],
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

  const latestQueryKey = useMemo(
    () => getFeedQueryKey(activeCategoryId, 'latest', isLoggedIn),
    [activeCategoryId, isLoggedIn],
  );
  const popularQueryKey = useMemo(
    () => getFeedQueryKey(activeCategoryId, 'popular', isLoggedIn),
    [activeCategoryId, isLoggedIn],
  );
  const upvotedQueryKey = useMemo(
    () => getFeedQueryKey(activeCategoryId, 'upvoted', isLoggedIn),
    [activeCategoryId, isLoggedIn],
  );
  const discussedQueryKey = useMemo(
    () => getFeedQueryKey(activeCategoryId, 'discussed', isLoggedIn),
    [activeCategoryId, isLoggedIn],
  );

  const { data: latestStoriesData } = useQuery({
    queryKey: latestQueryKey,
    queryFn: feedQueries.latest,
    staleTime: StaleTime.Default,
  });
  const { data: popularStoriesData } = useQuery({
    queryKey: popularQueryKey,
    queryFn: feedQueries.popular,
    staleTime: StaleTime.Default,
  });
  const { data: upvotedStoriesData } = useQuery({
    queryKey: upvotedQueryKey,
    queryFn: feedQueries.upvoted,
    staleTime: StaleTime.Default,
  });
  const { data: discussedStoriesData } = useQuery({
    queryKey: discussedQueryKey,
    queryFn: feedQueries.discussed,
    staleTime: StaleTime.Default,
  });
  const topicClusterQueryKeys = useMemo(
    () =>
      EXPLORE_TOPIC_CLUSTER_CATEGORY_IDS.map((categoryId) =>
        getFeedQueryKey(categoryId, 'latest', isLoggedIn),
      ),
    [isLoggedIn],
  );
  const topicClusterStoriesQueries = useQueries({
    queries: EXPLORE_TOPIC_CLUSTER_CATEGORY_IDS.map((categoryId, index) => ({
      queryKey: topicClusterQueryKeys[index],
      queryFn: getFeedQueriesForCategory(categoryId, isLoggedIn).latest,
      staleTime: StaleTime.Default,
      enabled: isExploreCategory,
    })),
  });

  const translationSections = useMemo(
    () => [
      { data: latestStoriesData, queryKey: latestQueryKey },
      { data: popularStoriesData, queryKey: popularQueryKey },
      { data: upvotedStoriesData, queryKey: upvotedQueryKey },
      { data: discussedStoriesData, queryKey: discussedQueryKey },
      ...EXPLORE_TOPIC_CLUSTER_CATEGORY_IDS.map((_, index) => ({
        data: topicClusterStoriesQueries[index]?.data,
        queryKey: topicClusterQueryKeys[index],
      })),
    ],
    [
      latestStoriesData,
      popularStoriesData,
      upvotedStoriesData,
      discussedStoriesData,
      latestQueryKey,
      popularQueryKey,
      upvotedQueryKey,
      discussedQueryKey,
      topicClusterStoriesQueries,
      topicClusterQueryKeys,
    ],
  );

  useExploreFeedTranslations(translationSections);

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
      EXPLORE_TOPIC_CLUSTER_CATEGORY_IDS.reduce<
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

  const exploreCategorySeo = useMemo(() => {
    const category = getExploreCategoryById(activeCategoryId);
    const titleBase =
      activeCategoryId === 'explore' || !category
        ? 'Explore developer news'
        : `${category.label} developer news`;

    return getPageSeoTitles(titleBase);
  }, [activeCategoryId]);

  const exploreCanonicalUrl = useMemo(() => {
    const category = getExploreCategoryById(activeCategoryId);
    if (!category) {
      return undefined;
    }

    const base = webappUrl.endsWith('/') ? webappUrl.slice(0, -1) : webappUrl;
    return `${base}${category.path}`;
  }, [activeCategoryId]);

  return (
    <>
      <NextSeo
        title={exploreCategorySeo.title}
        canonical={exploreCanonicalUrl}
        openGraph={{
          ...defaultOpenGraph,
          ...exploreCategorySeo.openGraph,
        }}
      />
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
    </>
  );
};
