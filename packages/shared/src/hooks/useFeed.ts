import { useContext, useEffect, useMemo } from 'react';
import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { ClientError } from 'graphql-request';
import {
  Ad,
  FeedData,
  Post,
  POSTS_ENGAGED_SUBSCRIPTION,
  PostsEngaged,
} from '../graphql/posts';
import AuthContext from '../contexts/AuthContext';
import useSubscription from './useSubscription';
import {
  getNextPageParam,
  removeCachedPagePost,
  RequestKey,
  updateCachedPagePost,
} from '../lib/query';
import { MarketingCta } from '../components/marketingCta/common';
import { FeedItemType } from '../components/cards/common/common';
import { GARMR_ERROR, gqlClient } from '../graphql/common';
import { usePlusSubscription } from './usePlusSubscription';
import { fetchAd } from '../lib/ads';
import { LogEvent } from '../lib/log';
import { useLogContext } from '../contexts/LogContext';

interface FeedItemBase<T extends FeedItemType> {
  type: T;
}

interface AdItem extends FeedItemBase<FeedItemType.Ad> {
  ad: Ad;
  index: number;
  updatedAt: number;
}

interface MarketingCtaItem extends FeedItemBase<FeedItemType.MarketingCta> {
  marketingCta: MarketingCta;
}

export interface PostItem extends FeedItemBase<FeedItemType.Post> {
  post: Post;
  page: number;
  index: number;
}

export type FeedItem =
  | PostItem
  | AdItem
  | MarketingCtaItem
  | FeedItemBase<FeedItemType.Placeholder>
  | FeedItemBase<FeedItemType.UserAcquisition>;

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
  isError: boolean;
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
  feedName?: string;
};

export interface UseFeedOptionalParams<T> {
  query?: string;
  variables?: T;
  options?: Pick<
    UseInfiniteQueryOptions<FeedData>,
    'refetchOnMount' | 'gcTime' | 'placeholderData' | 'staleTime'
  >;
  settings?: UseFeedSettingParams;
  onEmptyFeed?: () => void;
}

export default function useFeed<T>(
  feedQueryKey: unknown[],
  pageSize: number,
  adSpot: number,
  placeholdersPerPage: number,
  params: UseFeedOptionalParams<T> = {},
): FeedReturnType {
  const { logEvent } = useLogContext();
  const { query, variables, options = {}, settings, onEmptyFeed } = params;
  const { user, tokenRefreshed } = useContext(AuthContext);
  const { isPlus } = usePlusSubscription();
  const queryClient = useQueryClient();
  const isFeedPreview = feedQueryKey?.[0] === RequestKey.FeedPreview;

  const feedQuery = useInfiniteQuery<FeedData>({
    queryKey: feedQueryKey,
    queryFn: async ({ pageParam }) => {
      const res = await gqlClient.request(query, {
        ...variables,
        first: pageSize,
        after: pageParam,
        loggedIn: !!user,
      });

      const isEmpty =
        !feedQuery?.data?.pages[0]?.page.edges.length &&
        !res?.page?.edges?.length;

      if (isEmpty) {
        logEvent({
          event_name: LogEvent.FeedEmpty,
          target_id: params?.settings?.feedName,
          extra: params?.variables
            ? JSON.stringify({ ...params?.variables })
            : undefined,
        });
        if (onEmptyFeed) {
          onEmptyFeed();
        }
      }

      return res;
    },
    refetchOnMount: false,
    ...options,
    enabled: query && tokenRefreshed,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    initialPageParam: '',
    getNextPageParam: ({ page }) => getNextPageParam(page?.pageInfo),
  });

  const clientError = feedQuery?.error as ClientError;

  const isAdsQueryEnabled =
    !isPlus &&
    query &&
    tokenRefreshed &&
    !isFeedPreview &&
    (!settings?.adPostLength ||
      feedQuery.data?.pages[0]?.page.edges.length > settings?.adPostLength) &&
    !settings?.disableAds;

  const adsQuery = useInfiniteQuery<Ad>({
    queryKey: [RequestKey.Ads, ...feedQueryKey],
    queryFn: async ({ pageParam }) => fetchAd(!!pageParam),
    initialPageParam: '',
    getNextPageParam: () => Date.now(),
    enabled: isAdsQueryEnabled,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

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
            type: FeedItemType.Post,
            post: node,
            page: pageIndex,
            index,
          }));

          const withFirstIndex = (condition: boolean) =>
            pageIndex === 0 && condition;

          if (isAdsQueryEnabled) {
            if (withFirstIndex(!!settings.marketingCta)) {
              posts.splice(adSpot, 0, {
                type: FeedItemType.MarketingCta,
                marketingCta: settings.marketingCta,
              });
            } else if (withFirstIndex(settings.showAcquisitionForm)) {
              posts.splice(adSpot, 0, { type: FeedItemType.UserAcquisition });
            } else if (adsQuery.data?.pages[pageIndex]) {
              posts.splice(adSpot, 0, {
                type: FeedItemType.Ad,
                ad: adsQuery.data?.pages[pageIndex],
                index: pageIndex,
                updatedAt: adsQuery.dataUpdatedAt,
              });
            } else {
              posts.splice(adSpot, 0, { type: FeedItemType.Placeholder });
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
  }, [
    feedQuery.data,
    feedQuery.isFetching,
    settings.marketingCta,
    settings.showAcquisitionForm,
    isAdsQueryEnabled,
    adSpot,
    adsQuery.data?.pages,
    placeholdersPerPage,
    adsQuery.dataUpdatedAt,
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
    isError:
      clientError?.response?.errors?.[0]?.extensions?.code === GARMR_ERROR,
    isLoading: feedQuery.isLoading,
    isFetching: feedQuery.isFetching,
    isInitialLoading: feedQuery.isInitialLoading,
  };
}
