import { useCallback, useContext, useMemo } from 'react';
import type { QueryKey, UseInfiniteQueryOptions } from '@tanstack/react-query';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import type { ClientError } from 'graphql-request';
import { useRouter } from 'next/router';
import type { Ad, FeedData, Post, PostsEngaged } from '../graphql/posts';
import { POSTS_ENGAGED_SUBSCRIPTION } from '../graphql/posts';
import AuthContext from '../contexts/AuthContext';
import useSubscription from './useSubscription';
import {
  findIndexOfPostInData,
  getNextPageParam,
  removeCachedPagePost,
  RequestKey,
  updateCachedPagePost,
} from '../lib/query';
import type { MarketingCta } from '../components/marketingCta/common';
import { FeedItemType } from '../components/cards/common/common';
import { GARMR_ERROR, gqlClient2 } from '../graphql/common';
import { usePlusSubscription } from './usePlusSubscription';
import { fetchAd } from '../lib/ads';
import { LogEvent } from '../lib/log';
import { useLogContext } from '../contexts/LogContext';
import type { FeedAdTemplate } from '../lib/feed';
import { featureFeedAdTemplate } from '../lib/featureManagement';
import { cloudinaryPostImageCoverPlaceholder } from '../lib/image';
import { AD_PLACEHOLDER_SOURCE_ID } from '../lib/constants';
import { SharedFeedPage } from '../components/utilities';
import { useTranslation } from './translation/useTranslation';

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
  feedQueryKey: QueryKey,
  pageSize: number,
  adTemplate: FeedAdTemplate,
  placeholdersPerPage: number,
  params: UseFeedOptionalParams<T> = {},
): FeedReturnType {
  const router = useRouter();
  const { logEvent } = useLogContext();
  const { query, variables, options = {}, settings, onEmptyFeed } = params;
  const { user, tokenRefreshed } = useContext(AuthContext);
  const { showPlusSubscription, isPlus } = usePlusSubscription();
  const queryClient = useQueryClient();
  const { fetchTranslations } = useTranslation({
    queryKey: feedQueryKey,
    queryType: 'feed',
  });
  const isFeedPreview = feedQueryKey?.[0] === RequestKey.FeedPreview;
  const avoidRetry =
    params?.settings?.feedName === SharedFeedPage.Custom &&
    showPlusSubscription &&
    !isPlus;

  const feedQuery = useInfiniteQuery<FeedData>({
    queryKey: feedQueryKey,
    queryFn: async ({ pageParam }) => {
      const res = await gqlClient2.request<FeedData>(query, {
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

      fetchTranslations(
        res.page.edges
          .filter(({ node }) => !node?.translation?.title)
          .map(({ node }) => (node?.title ? node.id : node?.sharedPost.id)),
      );

      return res;
    },
    refetchOnMount: false,
    ...options,
    enabled: query && tokenRefreshed,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: avoidRetry ? false : 3,
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
    queryFn: async ({ pageParam }) => {
      const ad = await fetchAd(!!pageParam);

      if (!ad) {
        return {
          source: AD_PLACEHOLDER_SOURCE_ID,
          link: 'https://daily.dev',
          company: 'daily.dev',
          description: 'daily.dev',
          image: cloudinaryPostImageCoverPlaceholder,
        };
      }

      return ad;
    },
    initialPageParam: '',
    getNextPageParam: () => Date.now(),
    enabled: isAdsQueryEnabled,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
  const {
    data: adsData,
    fetchNextPage: fetchNextAd,
    isLoading,
    dataUpdatedAt: adsUpdatedAt,
  } = adsQuery;

  const getAd = useCallback(
    ({ index }: { index: number }) => {
      if (!isAdsQueryEnabled) {
        return undefined;
      }

      const adStart =
        adTemplate?.adStart ??
        featureFeedAdTemplate.defaultValue.default.adStart;
      const adRepeat = adTemplate?.adRepeat ?? pageSize + 1;

      const adIndex = index - adStart; // 0-based index from adStart

      // if adIndex is negative, it means we are not supposed to show ads yet based on adStart
      if (adIndex < 0) {
        return undefined;
      }

      const adMatch = adIndex % adRepeat === 0; // should ad be shown at this index based on adRepeat

      if (!adMatch) {
        return undefined;
      }

      const adPage = adIndex / adRepeat; // page number for ad

      if (isLoading) {
        return {
          type: FeedItemType.Placeholder,
          index: adPage,
        };
      }

      const nextAd = adsData?.pages[adPage];

      if (!nextAd) {
        fetchNextAd({ cancelRefetch: false });

        return {
          type: FeedItemType.Placeholder,
          index: adPage,
        };
      }

      // for now we return placeholder when no ad is available
      // this can be replace with some local replacements in the future
      if (nextAd.source === AD_PLACEHOLDER_SOURCE_ID) {
        return {
          type: FeedItemType.Placeholder,
          index: adPage,
        };
      }

      return {
        type: FeedItemType.Ad,
        ad: nextAd,
        index: adPage,
        updatedAt: adsUpdatedAt,
      };
    },
    [
      adsData,
      fetchNextAd,
      isAdsQueryEnabled,
      isLoading,
      adTemplate?.adStart,
      adTemplate?.adRepeat,
      adsUpdatedAt,
      pageSize,
    ],
  );

  const items = useMemo(() => {
    let newItems: FeedItem[] = [];
    if (feedQuery.data) {
      newItems = feedQuery.data.pages.reduce((acc, { page }, pageIndex) => {
        page.edges.forEach(({ node }, index) => {
          const adIndex = acc.length;
          const adItem = getAd({ index: adIndex });

          if (adItem) {
            const withFirstIndex = (condition: boolean) =>
              pageIndex === 0 && adItem.index === 0 && condition;

            if (withFirstIndex(!!settings.marketingCta)) {
              acc.push({
                type: FeedItemType.MarketingCta,
                marketingCta: settings.marketingCta,
              });
            } else if (withFirstIndex(settings.showAcquisitionForm)) {
              acc.push({ type: FeedItemType.UserAcquisition });
            } else {
              acc.push(adItem);
            }
          }

          acc.push({
            type: FeedItemType.Post,
            post: node,
            page: pageIndex,
            index,
          });
        });

        return acc;
      }, []);
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
    placeholdersPerPage,
    getAd,
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

  const didJustCreateFeed = router.query?.created === '1';

  return {
    items,
    fetchPage: async () => {
      await feedQuery.fetchNextPage();
    },
    updatePost,
    removePost: removeCachedPagePost(feedQueryKey, queryClient),
    canFetchMore: feedQuery.hasNextPage,
    emptyFeed:
      (!feedQuery?.data?.pages[0]?.page.edges.length &&
        !feedQuery.isFetching) ||
      didJustCreateFeed,
    isError:
      clientError?.response?.errors?.[0]?.extensions?.code === GARMR_ERROR,
    isLoading: feedQuery.isLoading,
    isFetching: feedQuery.isFetching,
    isInitialLoading: feedQuery.isInitialLoading,
  };
}
