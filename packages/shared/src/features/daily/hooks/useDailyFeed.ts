import { useCallback, useContext, useMemo } from 'react';
import type { ClientError } from 'graphql-request';
import type { InfiniteData, QueryKey } from '@tanstack/react-query';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { FeedData, FeedItemData } from '../../../graphql/feed';
import {
  DAILY_FEED_QUERY,
  getFeedApiItemPost,
  isFeedApiPostItem,
  normalizeFeedPage,
} from '../../../graphql/feed';
import type { Post } from '../../../graphql/posts';
import { gqlClient } from '../../../graphql/common';
import AuthContext from '../../../contexts/AuthContext';
import {
  generateQueryKey,
  getNextPageParam,
  RequestKey,
  StaleTime,
} from '../../../lib/query';
import { useUpdateQuery } from '../../../hooks/useUpdateQuery';
import type { UpdateDailyPost } from '../optimisticMutations';

// Picks shows a fixed set of 5 posts (no pagination).
const PAGE_SIZE = 5;

interface UseDailyFeed {
  posts: Post[];
  fetchNextPage: () => Promise<void>;
  canFetchMore: boolean;
  isFetchingNextPage: boolean;
  isPending: boolean;
  isError: boolean;
  updatePost: UpdateDailyPost;
}

export const useDailyFeed = (): UseDailyFeed => {
  const { user, tokenRefreshed } = useContext(AuthContext);
  const queryKey = useMemo(
    () => generateQueryKey(RequestKey.DailyFeed, user),
    [user],
  );
  const [getFeedData, setFeedData] = useUpdateQuery<InfiniteData<FeedItemData>>(
    { queryKey },
  );

  const feedQuery = useInfiniteQuery<
    FeedItemData,
    ClientError,
    InfiniteData<FeedItemData, string>,
    QueryKey,
    string
  >({
    queryKey,
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

  const updatePost = useCallback<UpdateDailyPost>(
    (postId, manipulate) => {
      const current = getFeedData();

      if (!current) {
        return;
      }

      current.pages.forEach((feedPage) => {
        feedPage.page.edges.forEach((edge) => {
          if (isFeedApiPostItem(edge.node) && edge.node.post.id === postId) {
            Object.assign(edge.node.post, manipulate(edge.node.post));
          }
        });
      });

      setFeedData(current);
    },
    [getFeedData, setFeedData],
  );

  return {
    posts,
    fetchNextPage: async () => {
      await feedQuery.fetchNextPage();
    },
    canFetchMore: !!feedQuery.hasNextPage,
    isFetchingNextPage: feedQuery.isFetchingNextPage,
    isPending: feedQuery.isPending,
    isError: feedQuery.isError,
    updatePost,
  };
};
