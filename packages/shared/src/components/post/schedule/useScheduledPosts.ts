import { useCallback } from 'react';
import type {
  InfiniteData,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { Connection } from '../../../graphql/common';
import { gqlClient } from '../../../graphql/common';
import type { ScheduledPost } from '../../../graphql/posts';
import {
  SCHEDULED_POSTS_PER_PAGE_DEFAULT,
  SCHEDULED_POSTS_QUERY,
} from '../../../graphql/posts';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
  generateQueryKey,
  getNextPageParam,
  RequestKey,
  StaleTime,
} from '../../../lib/query';

type ScheduledPostsData = Connection<ScheduledPost>;

export interface UseScheduledPosts {
  posts: ScheduledPost[];
  isLoading: boolean;
  isFetched: boolean;
  hasNextPage: boolean;
  fetchNextPage: UseInfiniteQueryResult['fetchNextPage'];
  isFetchingNextPage: boolean;
}

export const useScheduledPosts = (): UseScheduledPosts => {
  const { user } = useAuthContext();

  const {
    data,
    isPending,
    isFetched,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: generateQueryKey(RequestKey.ScheduledPosts, user),
    queryFn: async ({ pageParam }) => {
      const result = await gqlClient.request<{
        scheduledPosts: ScheduledPostsData;
      }>(SCHEDULED_POSTS_QUERY, {
        first: SCHEDULED_POSTS_PER_PAGE_DEFAULT,
        after: pageParam,
      });

      return result.scheduledPosts;
    },
    initialPageParam: '',
    enabled: !!user,
    getNextPageParam: (lastPage) => getNextPageParam(lastPage?.pageInfo),
    select: useCallback((result: InfiniteData<ScheduledPostsData>) => {
      if (!result) {
        return undefined;
      }

      return {
        ...result,
        pages: result.pages.filter((page) => !!page?.edges.length),
      };
    }, []),
    staleTime: StaleTime.Default,
  });

  const posts =
    data?.pages.flatMap((page) => page.edges.map((edge) => edge.node)) ?? [];

  return {
    posts,
    isLoading: isPending,
    isFetched,
    hasNextPage: !!hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  };
};
