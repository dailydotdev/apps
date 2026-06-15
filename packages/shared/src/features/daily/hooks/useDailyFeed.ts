import { useContext, useMemo } from 'react';
import type { ClientError } from 'graphql-request';
import type { InfiniteData, QueryKey } from '@tanstack/react-query';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { FeedData, FeedItemData } from '../../../graphql/feed';
import {
  DAILY_FEED_QUERY,
  getFeedApiItemPost,
  normalizeFeedPage,
} from '../../../graphql/feed';
import type { Post } from '../../../graphql/posts';
import { gqlClient } from '../../../graphql/common';
import AuthContext from '../../../contexts/AuthContext';
import { getNextPageParam, RequestKey, StaleTime } from '../../../lib/query';

const PAGE_SIZE = 10;

interface UseDailyFeed {
  posts: Post[];
  fetchNextPage: () => Promise<void>;
  canFetchMore: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  isError: boolean;
}

export const useDailyFeed = (): UseDailyFeed => {
  const { user, tokenRefreshed } = useContext(AuthContext);

  const feedQuery = useInfiniteQuery<
    FeedItemData,
    ClientError,
    InfiniteData<FeedItemData, string>,
    QueryKey,
    string
  >({
    queryKey: [RequestKey.DailyFeed, user?.id ?? 'anonymous'],
    queryFn: async ({ pageParam }) => {
      const rawResult = await gqlClient.request<FeedData>(DAILY_FEED_QUERY, {
        first: PAGE_SIZE,
        after: pageParam,
        loggedIn: !!user,
      });

      return normalizeFeedPage(rawResult);
    },
    enabled: tokenRefreshed,
    staleTime: StaleTime.Default,
    initialPageParam: '',
    getNextPageParam: ({ page }) => getNextPageParam(page?.pageInfo),
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const posts = useMemo<Post[]>(
    () =>
      feedQuery.data?.pages.reduce<Post[]>((acc, { page }) => {
        page.edges.forEach(({ node }) => {
          const post = getFeedApiItemPost(node);
          if (post) {
            acc.push(post);
          }
        });
        return acc;
      }, []) ?? [],
    [feedQuery.data?.pages],
  );

  return {
    posts,
    fetchNextPage: async () => {
      await feedQuery.fetchNextPage();
    },
    canFetchMore: !!feedQuery.hasNextPage,
    isFetchingNextPage: feedQuery.isFetchingNextPage,
    isLoading: feedQuery.isLoading,
    isError: feedQuery.isError,
  };
};
