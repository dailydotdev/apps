import { useInfiniteQuery } from '@tanstack/react-query';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import {
  generateQueryKey,
  RequestKey,
  StaleTime,
} from '@dailydotdev/shared/src/lib/query';
import type {
  UserWorldDistrictFeedData,
  WorldDistrictPost,
} from '../../graphql/world';
import { USER_WORLD_DISTRICT_FEED_QUERY } from '../../graphql/world';

/** Enough to fill the panel twice over without a second round trip. */
const PAGE_SIZE = 20;

export interface WorldDistrictFeedResult {
  posts: WorldDistrictPost[];
  isPending: boolean;
  isError: boolean;
  canFetchMore: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => Promise<unknown>;
}

/**
 * The upvotes behind one district: what this reader marked as worth keeping in
 * that niche, newest vote first.
 *
 * Keyed by slug rather than held per district, so walking back into a town you
 * already opened reads the cache instead of the wire, and the panel opens
 * populated. Nothing is prefetched: a realm holds up to fourteen towns and only
 * the one that was clicked is worth a request.
 */
export const useWorldDistrictFeed = (
  userId: string,
  slug?: string,
): WorldDistrictFeedResult => {
  const query = useInfiniteQuery({
    queryKey: generateQueryKey(RequestKey.UserWorldDistrictFeed, undefined, {
      id: userId,
      slug,
    }),
    queryFn: ({ pageParam }) =>
      gqlClient.request<UserWorldDistrictFeedData>(
        USER_WORLD_DISTRICT_FEED_QUERY,
        {
          id: userId,
          niches: [slug],
          first: PAGE_SIZE,
          after: pageParam,
        },
      ),
    enabled: !!userId && !!slug,
    staleTime: StaleTime.Default,
    initialPageParam: '',
    getNextPageParam: ({ page }) =>
      page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null,
  });

  return {
    posts:
      query.data?.pages.flatMap(({ page }) =>
        page.edges.map(({ node }) => node),
      ) ?? [],
    /* A query that has not been enabled yet reports itself as pending, and this
       one is only ever mounted with a slug in hand, so that never surfaces. */
    isPending: query.isPending,
    isError: query.isError,
    canFetchMore: !!query.hasNextPage && !query.isFetchingNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
  };
};
