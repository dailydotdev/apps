import { useContext, useEffect, useMemo } from 'react';
import request from 'graphql-request';
import {
  InfiniteData,
  QueryClient,
  useInfiniteQuery,
  useQueryClient,
} from 'react-query';
import cloneDeep from 'lodash.clonedeep';
import {
  Ad,
  FeedData,
  Post,
  POSTS_ENGAGED_SUBSCRIPTION,
  PostsEngaged,
} from '../graphql/posts';
import AuthContext from '../contexts/AuthContext';
import { apiUrl } from '../lib/config';
import useSubscription from './useSubscription';
import { Connection } from '../graphql/common';

export type PostItem = {
  type: 'post';
  post: Post;
  page: number;
  index: number;
};
export type AdItem = { type: 'ad'; ad: Ad };
export type PlaceholderItem = { type: 'placeholder' };
export type FeedItem = PostItem | AdItem | PlaceholderItem;

export type FeedReturnType = {
  items: FeedItem[];
  fetchPage: () => Promise<void>;
  updatePost: (page: number, index: number, post: Post) => void;
  removePost: (page: number, index: number) => void;
  canFetchMore: boolean;
  emptyFeed: boolean;
};

const updateCachedPage = (
  feedQueryKey: unknown[],
  queryClient: QueryClient,
  pageIndex: number,
  manipulate: (page: Connection<Post>) => Connection<Post>,
): void => {
  queryClient.setQueryData<InfiniteData<FeedData>>(
    feedQueryKey,
    (currentData) => {
      const { pages } = currentData;
      const currentPage = cloneDeep(pages[pageIndex]);
      currentPage.page = manipulate(currentPage.page);
      const newPages = [
        ...pages.slice(0, pageIndex),
        currentPage,
        ...pages.slice(pageIndex + 1),
      ];
      return { pages: newPages, pageParams: currentData.pageParams };
    },
  );
};

const updateCachedPost =
  (feedQueryKey: unknown[], queryClient: QueryClient) =>
  (pageIndex: number, index: number, post: Post) => {
    updateCachedPage(feedQueryKey, queryClient, pageIndex, (page) => {
      // eslint-disable-next-line no-param-reassign
      page.edges[index].node = post;
      return page;
    });
  };

const removeCachedPost =
  (feedQueryKey: unknown[], queryClient: QueryClient) =>
  (pageIndex: number, index: number) => {
    updateCachedPage(feedQueryKey, queryClient, pageIndex, (page) => {
      // eslint-disable-next-line no-param-reassign
      page.edges.splice(index, 1);
      return page;
    });
  };

const findIndexOfPostInData = (
  data: InfiniteData<FeedData>,
  id: string,
): { pageIndex: number; index: number } => {
  for (let pageIndex = 0; pageIndex < data.pages.length; pageIndex += 1) {
    const page = data.pages[pageIndex];
    for (let index = 0; index < page.page.edges.length; index += 1) {
      const item = page.page.edges[index];
      if (item.node.id === id) {
        return { pageIndex, index };
      }
    }
  }
  return { pageIndex: -1, index: -1 };
};

export default function useFeed<T>(
  feedQueryKey: unknown[],
  pageSize: number,
  adSpot: number,
  placeholdersPerPage: number,
  showOnlyUnreadPosts: boolean,
  query?: string,
  variables?: T,
): FeedReturnType {
  const { user, tokenRefreshed } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const feedQuery = useInfiniteQuery<FeedData>(
    feedQueryKey,
    ({ pageParam }) =>
      request(`${apiUrl}/graphql`, query, {
        ...variables,
        first: pageSize,
        after: pageParam,
        loggedIn: !!user,
        unreadOnly: showOnlyUnreadPosts,
      }),
    {
      enabled: query && tokenRefreshed,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      getNextPageParam: (lastPage) =>
        lastPage.page.pageInfo.hasNextPage && lastPage.page.pageInfo.endCursor,
    },
  );

  const adsQuery = useInfiniteQuery<Ad>(
    ['ads', ...feedQueryKey],
    async ({ pageParam }) => {
      const res = await fetch(`${apiUrl}/v1/a?active=${!!pageParam}`);
      const ads: Ad[] = await res.json();
      return ads[0];
    },
    {
      getNextPageParam: () => Date.now(),
      enabled: query && tokenRefreshed,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    if (
      !adsQuery.isFetching &&
      adsQuery.data?.pages?.length < feedQuery.data?.pages?.length
    ) {
      adsQuery.fetchNextPage();
    }
  }, [adsQuery.data, feedQuery.data, adsQuery.isFetching]);

  const items = useMemo(() => {
    let newItems: FeedItem[] = [];
    if (feedQuery.data) {
      newItems = feedQuery.data.pages.flatMap(
        ({ page }, pageIndex): FeedItem[] => {
          const posts: FeedItem[] = page.edges.map(({ node }, index) => ({
            type: 'post',
            post: node,
            page: pageIndex,
            index,
          }));
          if (adsQuery.data?.pages[pageIndex]) {
            posts.splice(adSpot, 0, {
              type: 'ad',
              ad: adsQuery.data?.pages[pageIndex],
            });
          } else {
            posts.splice(adSpot, 0, {
              type: 'placeholder',
            });
          }
          return posts;
        },
      );
    }
    if (feedQuery.isFetching) {
      newItems.push(
        ...Array(placeholdersPerPage).fill({ type: 'placeholder' }),
      );
    }
    return newItems;
  }, [
    feedQuery.data,
    feedQuery.isFetching,
    adsQuery.data,
    adsQuery.isFetching,
  ]);

  const updatePost = updateCachedPost(feedQueryKey, queryClient);

  useSubscription(
    () => ({
      query: POSTS_ENGAGED_SUBSCRIPTION,
    }),
    {
      next: (data: PostsEngaged) => {
        const { pageIndex, index } = findIndexOfPostInData(
          feedQuery.data,
          data.postsEngaged.id,
        );
        if (index > -1) {
          updatePost(pageIndex, index, {
            ...feedQuery.data.pages[pageIndex].page.edges[index].node,
            ...data.postsEngaged,
          });
        }
      },
    },
  );

  return {
    items,
    fetchPage: async () => {
      const adPromise = adsQuery.fetchNextPage();
      await feedQuery.fetchNextPage();
      await adPromise;
    },
    updatePost,
    removePost: removeCachedPost(feedQueryKey, queryClient),
    canFetchMore: feedQuery.hasNextPage,
    emptyFeed:
      !feedQuery?.data?.pages[0]?.page.edges.length && !feedQuery.isFetching,
  };
}
