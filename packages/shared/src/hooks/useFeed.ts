import { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import type {
  InfiniteData,
  QueryKey,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import type { ClientError } from 'graphql-request';
import { useRouter } from 'next/router';
import type { Ad, Post, PostsEngaged } from '../graphql/posts';
import { POSTS_ENGAGED_SUBSCRIPTION } from '../graphql/posts';
import type { FeedData, FeedItemData, FeedV2Data } from '../graphql/feed';
import { getFeedApiItemPost, normalizeFeedPage } from '../graphql/feed';
import type { PostHighlight } from '../graphql/highlights';
import AuthContext from '../contexts/AuthContext';
import useSubscription from './useSubscription';
import {
  findIndexOfPostInData,
  getNextPageParam,
  removeCachedPagePost,
  RequestKey,
  StaleTime,
  updateCachedPagePost,
} from '../lib/query';
import type { MarketingCta } from '../components/marketingCta/common';
import { FeedItemType } from '../components/cards/common/common';
import { GARMR_ERROR, gqlClient } from '../graphql/common';
import { usePlusSubscription } from './usePlusSubscription';
import { LogEvent } from '../lib/log';
import { useLogContext } from '../contexts/LogContext';
import type { FeedAdTemplate } from '../lib/feed';
import { featureFeedAdTemplate } from '../lib/featureManagement';
import { cloudinaryPostImageCoverPlaceholder } from '../lib/image';
import { AD_PLACEHOLDER_SOURCE_ID } from '../lib/constants';
import { AdPlacement } from '../lib/ads';
import { SharedFeedPage } from '../components/utilities';
import { useTranslation } from './translation/useTranslation';
import { useFetchAd } from '../features/monetization/useFetchAd';
import type { Squad } from '../graphql/sources';

interface FeedItemBase<T extends FeedItemType> {
  type: T;
  dataUpdatedAt: number;
}

export interface AdItem extends FeedItemBase<FeedItemType.Ad> {
  ad: Ad;
  index: number;
  updatedAt: number;
}

export interface AdPostItem extends AdItem {
  ad: Ad & { data: { post?: Post } };
}

export interface AdSquadItem extends AdItem {
  ad: Ad & { data: { source?: Squad } };
}

interface MarketingCtaItem extends FeedItemBase<FeedItemType.MarketingCta> {
  marketingCta: MarketingCta;
}

interface PlaceholderItem extends FeedItemBase<FeedItemType.Placeholder> {
  index?: number;
}

export interface PostItem extends FeedItemBase<FeedItemType.Post> {
  post: Post;
  page: number;
  index: number;
}

export interface HighlightItem extends FeedItemBase<FeedItemType.Highlight> {
  highlights: PostHighlight[];
  feedMeta: string | null;
  impressionStatus?: number;
}

interface PlusEntryItem extends FeedItemBase<FeedItemType.PlusEntry> {
  plusEntry: MarketingCta;
}

interface UserAcquisitionItem
  extends FeedItemBase<FeedItemType.UserAcquisition> {}

const createPlaceholderItem = (index?: number): PlaceholderItem => ({
  type: FeedItemType.Placeholder,
  dataUpdatedAt: Date.now(),
  ...(typeof index === 'number' ? { index } : {}),
});

export type FeedItem =
  | PostItem
  | HighlightItem
  | AdItem
  | AdSquadItem
  | MarketingCtaItem
  | PlaceholderItem
  | UserAcquisitionItem
  | PlusEntryItem;

export const isBoostedPostAd = (item: FeedItem): item is AdPostItem =>
  item?.type === FeedItemType.Ad && !!item.ad.data?.post;

export const isBoostedSquadAd = (item: FeedItem): item is AdSquadItem =>
  item?.type === FeedItemType.Ad && !!item.ad.data?.source;

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
  isPending: boolean;
  error?: ClientError;
};

type UseFeedSettingParams = {
  adPostLength?: number;
  disableAds?: boolean;
  showAcquisitionForm?: boolean;
  marketingCta?: MarketingCta;
  plusEntry?: MarketingCta;
  feedName?: string;
  staticAd?: { ad: Ad; index: number };
};

export interface UseFeedOptionalParams<T> {
  query?: string;
  variables?: T;
  options?: Pick<
    UseInfiniteQueryOptions<
      FeedItemData,
      ClientError,
      InfiniteData<FeedItemData, string>,
      QueryKey,
      string
    >,
    'refetchOnMount' | 'gcTime' | 'placeholderData' | 'staleTime'
  >;
  settings?: UseFeedSettingParams;
  onEmptyFeed?: () => void;
}

/* eslint-disable no-bitwise -- intentional bitwise ops for FNV-1a hash */
const hashSeed = (key: string, n: number): number => {
  let h = 2166136261 >>> 0;
  const s = `${key}:${n}`;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
};
/* eslint-enable no-bitwise */

export const getAdSlotIndex = ({
  index,
  adStart,
  adRepeat,
  adJitter = 0,
  seed,
}: {
  index: number;
  adStart: number;
  adRepeat: number;
  adJitter?: number;
  seed: string;
}): number | undefined => {
  if (adRepeat <= 0) {
    return undefined;
  }
  const safeJitter = Math.max(
    0,
    Math.min(adJitter, Math.floor((adRepeat - 1) / 2)),
  );
  if (index < adStart - safeJitter) {
    return undefined;
  }
  const n = Math.max(0, Math.round((index - adStart) / adRepeat));
  const offset =
    safeJitter === 0
      ? 0
      : (hashSeed(seed, n) % (safeJitter * 2 + 1)) - safeJitter;
  const pos = adStart + n * adRepeat + offset;
  return pos === index ? n : undefined;
};

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
  const { isPlus } = usePlusSubscription();
  const queryClient = useQueryClient();
  // Track if we're currently resetting due to stale cursor to prevent infinite loops
  const isResettingRef = useRef(false);
  const { fetchTranslations } = useTranslation({
    queryKey: feedQueryKey,
    queryType: 'feed',
  });
  const isFeedPreview = feedQueryKey?.[0] === RequestKey.FeedPreview;
  const avoidRetry =
    params?.settings?.feedName === SharedFeedPage.Custom && !isPlus;
  const feedQuery = useInfiniteQuery<
    FeedItemData,
    ClientError,
    InfiniteData<FeedItemData, string>,
    QueryKey,
    string
  >({
    queryKey: feedQueryKey,
    queryFn: async ({ pageParam }) => {
      if (!query) {
        throw new Error('useFeed query is required');
      }

      const rawResult = await gqlClient.request<
        FeedData | FeedItemData | FeedV2Data
      >(query, {
        ...variables,
        first: pageSize,
        after: pageParam,
        loggedIn: !!user,
      });
      const res = normalizeFeedPage(rawResult);

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
        res.page.edges.reduce<Post[]>((posts, { node }) => {
          const post = getFeedApiItemPost(node);

          if (post) {
            posts.push(post);
          }

          return posts;
        }, []),
      );

      return res;
    },
    refetchOnMount: false,
    gcTime: StaleTime.OneHour,
    ...options,
    enabled: !!query && tokenRefreshed,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: avoidRetry ? false : 3,
    initialPageParam: '',
    getNextPageParam: ({ page }) => getNextPageParam(page?.pageInfo),
  });

  // Reset feed when staleCursor is detected (feed cache regenerated mid-session)
  useEffect(() => {
    const pages = feedQuery.data?.pages;
    if (!pages?.length || isResettingRef.current) {
      return;
    }

    // Check if any page has staleCursor set
    const hasStaleCursor = pages.some((p) => p.page.pageInfo.staleCursor);
    if (hasStaleCursor) {
      isResettingRef.current = true;
      queryClient.resetQueries({ queryKey: feedQueryKey }).finally(() => {
        isResettingRef.current = false;
      });
    }
  }, [feedQuery.data?.pages, feedQueryKey, queryClient]);

  const clientError = feedQuery?.error as ClientError;
  const adPostLength = settings?.adPostLength;

  const isAdsQueryEnabled = Boolean(
    !isPlus &&
      query &&
      tokenRefreshed &&
      !isFeedPreview &&
      (!adPostLength ||
        (feedQuery.data?.pages[0]?.page.edges.length ?? 0) > adPostLength) &&
      !settings?.disableAds,
  );

  const { fetchAd } = useFetchAd();
  const adsQuery = useInfiniteQuery<
    Ad,
    ClientError,
    InfiniteData<Ad, string | number>,
    QueryKey,
    string | number
  >({
    queryKey: [RequestKey.Ads, ...feedQueryKey],
    queryFn: async ({ pageParam }) => {
      const ad = await fetchAd({
        placement: AdPlacement.Feed,
        active: !!pageParam,
      });

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
    ({ index }: { index: number }): AdItem | PlaceholderItem | undefined => {
      if (!isAdsQueryEnabled) {
        return undefined;
      }

      const adStart =
        adTemplate?.adStart ??
        featureFeedAdTemplate.defaultValue.default.adStart;
      const adRepeat = adTemplate?.adRepeat ?? pageSize + 1;
      const adJitter = adTemplate?.adJitter ?? 0;

      const adPage = getAdSlotIndex({
        index,
        adStart,
        adRepeat,
        adJitter,
        seed: JSON.stringify(feedQueryKey),
      });

      if (adPage === undefined) {
        return undefined;
      }

      if (isLoading) {
        return createPlaceholderItem(adPage);
      }

      const nextAd = adsData?.pages[adPage];

      if (!nextAd) {
        fetchNextAd({ cancelRefetch: false });

        return createPlaceholderItem(adPage);
      }

      // for now we return placeholder when no ad is available
      // this can be replace with some local replacements in the future
      if (nextAd.source === AD_PLACEHOLDER_SOURCE_ID) {
        return createPlaceholderItem(adPage);
      }

      return {
        type: FeedItemType.Ad,
        ad: nextAd,
        index: adPage,
        updatedAt: adsUpdatedAt,
      } as AdItem;
    },
    [
      adsData,
      fetchNextAd,
      isAdsQueryEnabled,
      isLoading,
      adTemplate?.adStart,
      adTemplate?.adRepeat,
      adTemplate?.adJitter,
      adsUpdatedAt,
      pageSize,
      feedQueryKey,
    ],
  );

  const items = useMemo(() => {
    let newItems: FeedItem[] = [];

    // Check if marketing CTA should be shown as first card
    const marketingCta = settings?.marketingCta;
    const marketingCtaAsFirstCard = marketingCta?.flags?.asFirstCard;
    const plusEntry = settings?.plusEntry;
    const plusEntryAsFirstCard = plusEntry?.flags?.asFirstCard;
    const showAcquisitionForm = settings?.showAcquisitionForm ?? false;

    if (feedQuery.data) {
      const seenPostIds = new Set<string>();
      newItems = feedQuery.data.pages.reduce<FeedItem[]>(
        (acc, { page }, pageIndex) => {
          page.edges.forEach(({ node }, index: number) => {
            if (node.itemType === 'highlight') {
              if (!node.highlights.length) {
                return;
              }

              acc.push({
                type: FeedItemType.Highlight,
                highlights: node.highlights,
                feedMeta: node.feedMeta ?? null,
                dataUpdatedAt: feedQuery.dataUpdatedAt,
              });

              return;
            }

            const { post } = node;

            if (seenPostIds.has(post.id)) {
              return;
            }
            seenPostIds.add(post.id);

            const adIndex = acc.length;
            const adItem = getAd({ index: adIndex });

            if (adItem) {
              const withFirstIndex = (condition: boolean) =>
                pageIndex === 0 && adItem.index === 0 && condition;

              // Skip ad slot if marketing CTA is shown as first card
              const shouldSkipAdForMarketingCta = withFirstIndex(
                (marketingCtaAsFirstCard ?? false) ||
                  (plusEntryAsFirstCard ?? false),
              );

              if (shouldSkipAdForMarketingCta) {
                // Don't push anything - marketing CTA is already at the top
              } else if (plusEntry && withFirstIndex(true)) {
                acc.push({
                  type: FeedItemType.PlusEntry,
                  plusEntry,
                  dataUpdatedAt: feedQuery.dataUpdatedAt,
                });
              } else if (marketingCta && withFirstIndex(true)) {
                acc.push({
                  type: FeedItemType.MarketingCta,
                  marketingCta,
                  dataUpdatedAt: feedQuery.dataUpdatedAt,
                });
              } else if (withFirstIndex(showAcquisitionForm)) {
                acc.push({
                  type: FeedItemType.UserAcquisition,
                  dataUpdatedAt: feedQuery.dataUpdatedAt,
                });
              } else {
                acc.push(adItem);
              }
            }

            acc.push({
              type: FeedItemType.Post,
              post,
              page: pageIndex,
              index,
              dataUpdatedAt: feedQuery.dataUpdatedAt,
            });
          });

          return acc;
        },
        [],
      );

      // Prepend marketing CTA as first card if configured
      if (plusEntryAsFirstCard && plusEntry) {
        newItems.unshift({
          type: FeedItemType.PlusEntry,
          plusEntry,
          dataUpdatedAt: feedQuery.dataUpdatedAt,
        });
      } else if (marketingCtaAsFirstCard && marketingCta) {
        newItems.unshift({
          type: FeedItemType.MarketingCta,
          marketingCta,
          dataUpdatedAt: feedQuery.dataUpdatedAt,
        });
      }
    }
    if (feedQuery.isFetching) {
      newItems.push(
        ...Array.from({ length: Math.max(0, placeholdersPerPage) }, () =>
          createPlaceholderItem(),
        ),
      );
    }

    if (settings?.staticAd && feedQuery.data && newItems.length > 0) {
      const insertAt = Math.min(settings.staticAd.index, newItems.length);
      newItems.splice(insertAt, 0, {
        type: FeedItemType.Ad,
        ad: settings.staticAd.ad,
        index: 0,
        updatedAt: Date.now(),
        dataUpdatedAt: Date.now(),
      } as AdItem);
    }

    return newItems;
  }, [
    feedQuery.data,
    feedQuery.isFetching,
    feedQuery.dataUpdatedAt,
    settings?.marketingCta,
    settings?.showAcquisitionForm,
    placeholdersPerPage,
    getAd,
    settings?.plusEntry,
    settings?.staticAd,
  ]);

  const updatePost = updateCachedPagePost(feedQueryKey, queryClient);

  useSubscription(
    () => ({
      query: POSTS_ENGAGED_SUBSCRIPTION,
    }),
    {
      next: (data: PostsEngaged) => {
        if (!feedQuery.data) {
          return;
        }

        const { pageIndex, index } = findIndexOfPostInData(
          feedQuery.data,
          data.postsEngaged.id,
        );
        if (index > -1) {
          const currentPost = getFeedApiItemPost(
            feedQuery.data.pages[pageIndex].page.edges[index].node,
          );

          if (!currentPost) {
            throw new Error(
              `Missing post-backed feed item at page ${pageIndex} index ${index}`,
            );
          }

          updatePost(pageIndex, index, {
            ...currentPost,
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
    isPending: feedQuery.isPending,
    error: clientError,
  };
}
