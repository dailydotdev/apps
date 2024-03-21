import { useContext, useEffect, useMemo } from 'react';
import request from 'graphql-request';
import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useQueryClient,
} from '@tanstack/react-query';
import {
  Ad,
  FeedData,
  Post,
  POSTS_ENGAGED_SUBSCRIPTION,
  PostsEngaged,
} from '../graphql/posts';
import AuthContext from '../contexts/AuthContext';
import { apiUrl, graphqlUrl } from '../lib/config';
import useSubscription from './useSubscription';
import {
  RequestKey,
  removeCachedPagePost,
  updateCachedPagePost,
} from '../lib/query';
import { getShouldRefreshFeed } from '../lib/refreshFeed';
import { MarketingCta } from '../components/cards/MarketingCta/common';

export type PostItem = {
  type: 'post';
  post: Post;
  page: number;
  index: number;
};
export type AdItem = { type: 'ad'; ad: Ad };
export type PlaceholderItem = { type: 'placeholder' };
export type UserAcquisitionItem = { type: 'userAcquisition' };
export type MarketingCtaItem = {
  type: 'marketingCta';
  marketingCta: MarketingCta;
};
export type FeedItem =
  | PostItem
  | AdItem
  | PlaceholderItem
  | UserAcquisitionItem
  | MarketingCtaItem;

export type UpdateFeedPost = (page: number, index: number, post: Post) => void;

export type FeedReturnType = {
  items: FeedItem[];
  fetchPage: () => Promise<void>;
  updatePost: UpdateFeedPost;
  removePost: (page: number, index: number) => void;
  canFetchMore: boolean;
  emptyFeed: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isInitialLoading: boolean;
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

type UseFeedSettingParams = {
  adPostLength?: number;
  disableAds?: boolean;
  showAcquisitionForm?: boolean;
  marketingCta?: MarketingCta;
};

export interface UseFeedOptionalParams<T> {
  query?: string;
  variables?: T;
  options?: UseInfiniteQueryOptions<FeedData>;
  settings?: UseFeedSettingParams;
}

export default function useFeed<T>(
  feedQueryKey: unknown[],
  pageSize: number,
  adSpot: number,
  placeholdersPerPage: number,
  params: UseFeedOptionalParams<T> = {},
): FeedReturnType {
  const { query, variables, options = {}, settings } = params;
  const { user, tokenRefreshed } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const isFeedPreview = feedQueryKey?.[0] === RequestKey.FeedPreview;

  const feedQuery = useInfiniteQuery<FeedData>(
    feedQueryKey,
    ({ pageParam }) =>
      request(graphqlUrl, query, {
        ...variables,
        ...(getShouldRefreshFeed() && { refresh: true }),
        first: pageSize,
        after: pageParam,
        loggedIn: !!user,
      }),
    {
      refetchOnMount: false,
      ...options,
      enabled: query && tokenRefreshed,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      getNextPageParam: (lastPage) =>
        lastPage.page.pageInfo.hasNextPage && lastPage.page.pageInfo.endCursor,
    },
  );

  const isAdsQueryEnabled =
    query &&
    tokenRefreshed &&
    !isFeedPreview &&
    (!settings?.adPostLength ||
      feedQuery.data?.pages[0]?.page.edges.length > settings?.adPostLength) &&
    !settings?.disableAds;
  const adsQuery = useInfiniteQuery<Ad>(
    ['ads', ...feedQueryKey],
    async ({ pageParam }) => {
      const res = await fetch(`${apiUrl}/v1/a?active=${!!pageParam}`);
      const ads: Ad[] = await res.json();
      return ads[0];
    },
    {
      getNextPageParam: () => Date.now(),
      enabled: isAdsQueryEnabled,
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
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

          if (pageIndex === 0 && !!settings.marketingCta) {
            posts.splice(adSpot, 0, {
              type: 'marketingCta',
              marketingCta: settings.marketingCta,
            });
          } else if (pageIndex === 0 && settings.showAcquisitionForm) {
            posts.splice(adSpot, 0, { type: 'userAcquisition' });
          } else if (isAdsQueryEnabled) {
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
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    feedQuery.data,
    feedQuery.isFetching,
    adsQuery.data,
    adsQuery.isFetching,
    settings.showAcquisitionForm,
    settings.marketingCta,
  ]);

  const updatePost = updateCachedPagePost(feedQueryKey, queryClient);

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
    removePost: removeCachedPagePost(feedQueryKey, queryClient),
    canFetchMore: feedQuery.hasNextPage,
    emptyFeed:
      !feedQuery?.data?.pages[0]?.page.edges.length && !feedQuery.isFetching,
    isLoading: feedQuery.isLoading,
    isFetching: feedQuery.isFetching,
    isInitialLoading: feedQuery.isInitialLoading,
  };
}
