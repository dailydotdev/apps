import { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import type {
  InfiniteData,
  QueryKey,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import type { ClientError } from 'graphql-request';
import { useRouter } from 'next/router';
import type { Ad, Post, PostsEngaged, PostType } from '../graphql/posts';
import { POSTS_ENGAGED_SUBSCRIPTION } from '../graphql/posts';
import type { FeedData, FeedItemData, FeedV2Data } from '../graphql/feed';
import { getFeedApiItemPost, normalizeFeedPage } from '../graphql/feed';
import type { PostHighlight } from '../graphql/highlights';
import AuthContext from '../contexts/AuthContext';
import FeedContext from '../contexts/FeedContext';
import useSubscription from './useSubscription';
import {
  findIndexOfPostInData,
  getNextPageParam,
  OtherFeedPage,
  removeCachedPagePost,
  RequestKey,
  StaleTime,
  updateCachedPagePost,
} from '../lib/query';
import type { AllFeedPages } from '../lib/query';
import { FeedItemType } from '../components/cards/common/common';
import { PHONE_FEED_PLACEHOLDER_ROWS } from '../components/cards/placeholder/PlaceholderFeed';
import type { ApiErrorResult } from '../graphql/common';
import {
  ApiError,
  GARMR_ERROR,
  getApiError,
  gqlClient,
} from '../graphql/common';
import { usePlusSubscription } from './usePlusSubscription';
import { LogEvent } from '../lib/log';
import { useLogContext } from '../contexts/LogContext';
import type { FeedAdTemplate } from '../lib/feed';
import { getAdSlotIndex } from '../lib/feed';
import { searchResultsLogEvent } from '../lib/searchLog';
import { SearchProviderEnum } from '../graphql/search';
import {
  briefFeedEntrypointPage,
  featureFeedAdTemplate,
  featureHeroCards,
} from '../lib/featureManagement';
import { useConditionalFeature } from './useConditionalFeature';
import { useReadingReminderFeedHero } from './notifications/useReadingReminderFeedHero';
import {
  SUPPORTED_WIDE_POST_TYPES,
  computeAdClamp,
  computePlacements,
  createPlacementBuilder,
  deriveAdCadence,
  isHeroEligiblePost,
} from '../lib/feedHighlightColSpan';
import type { FeedItemPlacement } from '../lib/feedHighlightColSpan';
import type { HeroCardsConfig } from '../types';
import { useIsPhone, useViewSize, ViewSize } from './useViewSize';
import { useFeedLayout } from './useFeedLayout';
import { useSettingsBooleanFlag } from './useSettingsBooleanFlag';
import { cloudinaryPostImageCoverPlaceholder } from '../lib/image';
import { AD_PLACEHOLDER_SOURCE_ID } from '../lib/constants';
import { AdPlacement } from '../lib/ads';
import { SharedFeedPage } from '../components/utilities';
import { useTranslation } from './translation/useTranslation';
import { useFetchAd } from '../features/monetization/useFetchAd';
import type { Squad } from '../graphql/sources';
import { useCachedTokenRecovery } from './useCachedTokenRecovery';

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
  ad: Ad & { data: { source: Squad } };
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

const createPlaceholderItem = (index?: number): PlaceholderItem => ({
  type: FeedItemType.Placeholder,
  dataUpdatedAt: Date.now(),
  ...(typeof index === 'number' ? { index } : {}),
});

export const HERO_ELIGIBLE_FEEDS = new Set<AllFeedPages>([
  SharedFeedPage.MyFeed,
  SharedFeedPage.Popular,
  SharedFeedPage.Upvoted,
  SharedFeedPage.Custom,
  OtherFeedPage.Following,
  OtherFeedPage.Explore,
  OtherFeedPage.ExploreLatest,
  OtherFeedPage.ExploreDiscussed,
  OtherFeedPage.ExploreUpvoted,
  OtherFeedPage.Tag,
  OtherFeedPage.Tags,
  OtherFeedPage.TagPage,
  OtherFeedPage.TagsTopPosts,
  OtherFeedPage.TagsMostUpvoted,
  OtherFeedPage.TagsBestDiscussed,
  OtherFeedPage.TagArchive,
  OtherFeedPage.Source,
  OtherFeedPage.Sources,
  OtherFeedPage.SourcePage,
  OtherFeedPage.SourceMostUpvoted,
  OtherFeedPage.SourceBestDiscussed,
  OtherFeedPage.SourceArchive,
]);

export type FeedItem =
  | PostItem
  | HighlightItem
  | AdItem
  | AdSquadItem
  | PlaceholderItem;

// Skadi marks a boost by what it carries: the post or the squad, no creative.
export const isBoostedPostCreative = (
  ad: Ad,
): ad is Ad & { data: { post: Post } } => !!ad.data?.post;

export const isBoostedSquadCreative = (ad: Ad): ad is AdSquadItem['ad'] =>
  !!ad.data?.source;

export const isBoostedPostAd = (item: FeedItem): item is AdPostItem =>
  item?.type === FeedItemType.Ad && isBoostedPostCreative(item.ad);

export const isBoostedSquadAd = (item: FeedItem): item is AdSquadItem =>
  item?.type === FeedItemType.Ad && isBoostedSquadCreative(item.ad);

export type UpdateFeedPost = (page: number, index: number, post: Post) => void;

export type FeedBannerInsertions = {
  /**
   * Indices where a full-row banner is rendered BEFORE the item at that
   * index. Used both by the placement builder inside `useFeed` to compute
   * banner-aware visual cells (correct ad cadence) and by the renderer to
   * place the actual banner element in DOM order.
   */
  fullRowInsertionBeforeIndex: ReadonlySet<number>;
  briefBannerPage: number;
  showPromoBanner: boolean;
  indexWhenShowingPromoBanner: number;
  hero: {
    shouldShowTopHero: boolean;
    title: string;
    subtitle: string;
    ctaLabel?: string;
    onEnable: () => Promise<void>;
    onDismiss: () => Promise<void>;
  };
};

export type FeedReturnType = {
  items: FeedItem[];
  /**
   * One placement per `items` entry — colSpan + visual row/column —
   * computed banner-aware and ad-cadence-aware so callers can render and
   * log analytics from a single source of truth.
   */
  placements: FeedItemPlacement[];
  heroCardsConfig: HeroCardsConfig;
  bannerInsertions: FeedBannerInsertions;
  /**
   * True when a first-slot card is eligible (per `firstSlotOffset` input)
   * AND enough posts have loaded to justify the visual slot (respects
   * `adPostLength` on squad feeds). Callers should gate their card
   * rendering on this so the visual and placement math stay in sync.
   */
  hasFirstSlotCard: boolean;
  fetchPage: () => Promise<void>;
  updatePost: UpdateFeedPost;
  removePost: (page: number, index: number) => void;
  /** What a loaded page was asked with, which keys the feed service's cache. */
  getPageRequest: (page: number) => FeedPageRequest | undefined;
  canFetchMore: boolean;
  emptyFeed: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isInitialLoading: boolean;
  isError: boolean;
  isPending: boolean;
  error?: ClientError;
};

export interface FeedPageRequest {
  first: number;
  /** The page's own cursor, as the request for the next page sends it. */
  cursor?: string;
}

type UseFeedSettingParams = {
  adPostLength?: number;
  disableAds?: boolean;
  /** The surface shows the highlights itself, so keep them out of the grid. */
  disableHighlightCards?: boolean;
  /** The surface shows an ad above the feed, so drop the grid's first slot. */
  skipFirstAd?: boolean;
  /** The surface leads with a featured card, so keep wide ones out of row one. */
  deferWideCards?: boolean;
  feedName?: string;
  /** Posts a surface above the feed already shows, kept out of the grid. */
  excludedPostIds?: string[];
  staticAd?: { ad: Ad; index: number };
  /** Set on search feeds so every fetch can be logged as a search execution. */
  searchId?: string;
  searchVersion?: number;
};

const searchFeedNames = new Set<string>([
  SharedFeedPage.Search,
  OtherFeedPage.SearchSquad,
]);

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
  /**
   * Eligibility for the brief banner promo (true when the user is not Plus
   * AND on My Feed). Gates the evaluation of the `briefFeedEntrypointPage`
   * feature flag.
   */
  isBriefBannerEligible?: boolean;
  /**
   * Number of fixed "first slot" cards (e.g. profile completion / brief
   * card) rendered ABOVE the feed grid. Used to shift banner indices so
   * they land at visually predictable positions.
   */
  firstSlotOffset?: number;
  /**
   * Suppress the top-hero placement entirely (including its impression
   * event). Used when a parent layout owns the top hero.
   */
  disableTopHero?: boolean;
  /**
   * True for horizontal carousel feeds (e.g. the source/tag page strips).
   * Wide hero cards use `gridColumn: span N`, which in a `grid-flow-col`
   * carousel stretches the card to N slots wide instead of highlighting a
   * row, so hero placement is disabled entirely.
   */
  isHorizontal?: boolean;
  /**
   * Drop pinned posts from the feed. `sourceFeed` always orders pinned posts
   * first and offers no way to opt out server-side,
   * so single-squad feeds that don't want them filter here.
   */
  excludePinnedPosts?: boolean;
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
  const {
    query,
    variables,
    options = {},
    settings,
    onEmptyFeed,
    isBriefBannerEligible = false,
    firstSlotOffset = 0,
    disableTopHero = false,
    isHorizontal = false,
    excludePinnedPosts = false,
  } = params;
  const { numCards: numCardsBySpaciness } = useContext(FeedContext);
  const numCards = numCardsBySpaciness.eco;
  const { user, isTokenValid } = useContext(AuthContext);
  const { isPlus } = usePlusSubscription();
  const queryClient = useQueryClient();
  const isTabletViewport = useViewSize(ViewSize.Tablet);
  const isMobileViewport = !isTabletViewport;
  const isPhone = useIsPhone();
  const { isListMode, shouldUseListFeedLayout } = useFeedLayout();
  const useList = isListMode && numCards > 1;
  const isListContext = useList || shouldUseListFeedLayout;
  const virtualizedNumCards = useList ? 1 : numCards;
  const canRenderHighlightCards =
    !isMobileViewport &&
    !isListContext &&
    !isHorizontal &&
    virtualizedNumCards > 1 &&
    HERO_ELIGIBLE_FEEDS.has(settings?.feedName as AllFeedPages);
  const { value: isHighlightCardsOptedOut } = useSettingsBooleanFlag(
    'highlightCardsOptOut',
  );
  const { fetchTranslations } = useTranslation({
    queryKey: feedQueryKey,
    queryType: 'feed',
  });
  const isFeedPreview = feedQueryKey?.[0] === RequestKey.FeedPreview;
  const avoidRetry =
    params?.settings?.feedName === SharedFeedPage.Custom && !isPlus;
  const isFeedQueryEnabled = !!query && isTokenValid;
  // An excluded post never renders, so pages holding only excluded posts
  // are empty once no page follows them.
  const hasNoShownPosts = (pages: FeedItemData['page'][] = []): boolean => {
    if (!pages.some((page) => page?.edges?.length)) {
      return true;
    }
    const excluded = new Set(settings?.excludedPostIds);
    const hasShownPost = pages.some((page) =>
      page?.edges?.some(({ node }) => {
        const post = getFeedApiItemPost(node);
        return !post || !excluded.has(post.id);
      }),
    );
    return !hasShownPost && !pages[pages.length - 1]?.pageInfo?.hasNextPage;
  };

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

      const requestStartedAt = performance.now();
      const rawResult = await gqlClient.request<
        FeedData | FeedItemData | FeedV2Data
      >(query, {
        ...variables,
        first: pageSize,
        after: pageParam,
        loggedIn: !!user,
        columns: virtualizedNumCards,
      });
      const requestLatencyMs = Math.round(performance.now() - requestStartedAt);
      const res = normalizeFeedPage(rawResult);

      const isEmpty = hasNoShownPosts([
        ...(feedQuery?.data?.pages ?? []).map(({ page }) => page),
        res?.page,
      ]);

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

      // Only the first page counts as a search execution; pagination reuses the
      // same `search_id` through the feed engagement events instead.
      if (
        !pageParam &&
        settings?.feedName &&
        searchFeedNames.has(settings.feedName)
      ) {
        const searchVariables = (variables ?? {}) as {
          query?: string;
          time?: string;
          contentCuration?: string[];
          postTypes?: string[];
        };

        logEvent(
          searchResultsLogEvent({
            searchId: settings?.searchId,
            query: searchVariables.query ?? '',
            provider: SearchProviderEnum.Posts,
            searchVersion: settings?.searchVersion,
            resultCount: res.page.edges.length,
            latencyMs: requestLatencyMs,
            filters: {
              time: searchVariables.time,
              content_curation: searchVariables.contentCuration,
              post_types: searchVariables.postTypes,
            },
          }),
        );
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

      return { ...res, first: pageSize };
    },
    refetchOnMount: false,
    gcTime: StaleTime.OneHour,
    ...options,
    enabled: isFeedQueryEnabled,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: avoidRetry ? false : 3,
    initialPageParam: '',
    getNextPageParam: ({ page }) => getNextPageParam(page?.pageInfo),
  });

  const clientError = feedQuery?.error as ClientError;
  useCachedTokenRecovery({
    queryKey: feedQueryKey,
    enabled: isFeedQueryEnabled,
    isUnauthenticated: !!getApiError(
      feedQuery.error as ApiErrorResult,
      ApiError.Unauthenticated,
    ),
  });

  const adPostLength = settings?.adPostLength;
  const firstPagePostsCount = feedQuery.data?.pages[0]?.page.edges.length ?? 0;
  const meetsAdPostLength = !adPostLength || firstPagePostsCount > adPostLength;
  const effectiveFirstSlotOffset = meetsAdPostLength ? firstSlotOffset : 0;
  const hasFirstSlotCard = effectiveFirstSlotOffset > 0;

  const isAdsQueryEnabled = Boolean(
    !isPlus &&
      query &&
      isTokenValid &&
      !isFeedPreview &&
      (!adPostLength ||
        (feedQuery.data?.pages[0]?.page.edges.length ?? 0) > adPostLength) &&
      !settings?.disableAds,
  );

  const shouldEvaluateHighlightCards = useMemo(() => {
    if (!canRenderHighlightCards || isHighlightCardsOptedOut) {
      return false;
    }

    return (
      feedQuery.data?.pages.some(({ page }) =>
        page.edges.some(
          ({ node }) =>
            node.itemType !== 'highlight' && isHeroEligiblePost(node.post),
        ),
      ) ?? false
    );
  }, [
    canRenderHighlightCards,
    isHighlightCardsOptedOut,
    feedQuery.data?.pages,
  ]);
  const { value: heroCardsConfig } = useConditionalFeature({
    feature: featureHeroCards,
    shouldEvaluate: shouldEvaluateHighlightCards,
  });
  const widenableTypes = useMemo(() => {
    const allowed = heroCardsConfig.allowedPostTypes ?? {};
    return new Set<PostType>(
      [...SUPPORTED_WIDE_POST_TYPES].filter((type) => allowed[type] === true),
    );
  }, [heroCardsConfig.allowedPostTypes]);

  const { value: briefBannerPage } = useConditionalFeature({
    feature: briefFeedEntrypointPage,
    shouldEvaluate: isBriefBannerEligible,
  });

  const heroFeedHero = useReadingReminderFeedHero({
    disableTopHero,
  });

  const showPromoBanner = !!briefBannerPage;
  const columnsDiffWithPage = pageSize % virtualizedNumCards;
  const indexWhenShowingPromoBanner =
    pageSize * Number(briefBannerPage) -
    columnsDiffWithPage * Number(briefBannerPage) -
    effectiveFirstSlotOffset;

  const fullRowInsertionBeforeIndex = useMemo(() => {
    const set = new Set<number>();
    if (showPromoBanner) {
      set.add(indexWhenShowingPromoBanner);
    }
    return set;
  }, [showPromoBanner, indexWhenShowingPromoBanner]);

  const { fetchAd, isAdConsentReady } = useFetchAd(isAdsQueryEnabled);
  // Per-mount random seed for ad jitter. Stable across re-renders/pagination
  // (so ads don't visibly jump as new pages load) but varies across mounts and
  // sessions, so the same user doesn't see ads in the same spots every visit.
  const adJitterSeedRef = useRef<string>();
  if (!adJitterSeedRef.current) {
    adJitterSeedRef.current = Math.random().toString(36).slice(2);
  }
  const adsQueryKey = [RequestKey.Ads, ...feedQueryKey];
  useCachedTokenRecovery({
    queryKey: adsQueryKey,
    enabled: isAdsQueryEnabled && isAdConsentReady,
  });
  const adsQuery = useInfiniteQuery<
    Ad,
    ClientError,
    InfiniteData<Ad, string | number>,
    QueryKey,
    string | number
  >({
    queryKey: adsQueryKey,
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
    enabled: isAdsQueryEnabled && isAdConsentReady,
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

      const slot = getAdSlotIndex({
        index,
        adStart,
        adRepeat,
        adJitter,
        seed: adJitterSeedRef.current ?? '',
      });

      if (slot === undefined) {
        return undefined;
      }

      // Shifted rather than skipped, so the creative the first slot would have
      // shown moves down to the second instead of being fetched and discarded.
      const adPage = settings?.skipFirstAd ? slot - 1 : slot;

      if (adPage < 0) {
        return undefined;
      }

      if (isLoading || (!isAdConsentReady && !adsData?.pages[adPage])) {
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
      isAdConsentReady,
      isLoading,
      adTemplate?.adStart,
      adTemplate?.adRepeat,
      adTemplate?.adJitter,
      adsUpdatedAt,
      pageSize,
      settings?.skipFirstAd,
    ],
  );

  const cadence = useMemo(
    () =>
      deriveAdCadence({
        isPlus,
        isFeedPreview,
        disableAds: settings?.disableAds,
        adStart:
          adTemplate?.adStart ??
          featureFeedAdTemplate.defaultValue.default.adStart,
        adRepeat: adTemplate?.adRepeat ?? pageSize + 1,
      }),
    [
      isPlus,
      isFeedPreview,
      settings?.disableAds,
      adTemplate?.adStart,
      adTemplate?.adRepeat,
      pageSize,
    ],
  );

  // The posts the grid last rendered. An exclusion that arrives once a post
  // is already in the grid leaves it where it is: the surface above the feed
  // may learn its post late (a first visit), and nothing on screen moves.
  const renderedPostIds = useRef(new Set<string>());

  const items = useMemo(() => {
    const newItems: FeedItem[] = [];

    if (feedQuery.data) {
      // Track visual cells (not logical items) for ad cadence so wide
      // cards consume their full visual width against the ad schedule.
      // The builder returns colSpan=1 when the layout is disabled
      // (mobile/list/single-col), so we never need to special-case those.
      const seenPostIds = new Set<string>();
      const excludedPostIds = new Set<string>(settings?.excludedPostIds);
      let visualCellsSoFar = 0;

      const placementBuilder = createPlacementBuilder({
        numCards: virtualizedNumCards,
        isMobile: isMobileViewport,
        isList: isListContext,
        isEnabled: heroCardsConfig.enabled,
        minSpacing: heroCardsConfig.minSpacing,
        startIndex: heroCardsConfig.startIndex,
        widenableTypes,
        firstSlotOffset: effectiveFirstSlotOffset,
        minWideCardRow: settings?.deferWideCards ? 1 : 0,
      });

      const staticAd = settings?.staticAd;
      let staticAdInserted = !staticAd;

      const pushAndAdvance = (item: FeedItem): void => {
        if (
          staticAd &&
          !staticAdInserted &&
          newItems.length === staticAd.index
        ) {
          staticAdInserted = true;
          pushAndAdvance({
            type: FeedItemType.Ad,
            ad: staticAd.ad,
            index: 0,
            updatedAt: Date.now(),
            dataUpdatedAt: Date.now(),
          } as AdItem);
        }
        newItems.push(item);
        const idx = newItems.length - 1;
        const fullRowBefore = fullRowInsertionBeforeIndex.has(idx);
        const placement = placementBuilder.next(item, {
          fullRowBefore,
          maxColSpan: computeAdClamp(visualCellsSoFar, cadence),
        });
        visualCellsSoFar += placement.colSpan;
      };

      feedQuery.data.pages.forEach(({ page }, pageIndex) => {
        page.edges.forEach(({ node }, index: number) => {
          // Bail before the ad slot is claimed, otherwise dropping the post
          // would leave an ad stranded in a slot with nothing after it.
          if (excludePinnedPosts && getFeedApiItemPost(node)?.pinnedAt) {
            return;
          }
          // Shown above the feed already, so it never claims a slot either.
          const nodePost = getFeedApiItemPost(node);
          if (
            nodePost &&
            excludedPostIds.has(nodePost.id) &&
            !renderedPostIds.current.has(nodePost.id)
          ) {
            return;
          }

          const adItem = getAd({ index: visualCellsSoFar });

          if (adItem) {
            pushAndAdvance(adItem);
          }

          if (node.itemType === 'highlight') {
            if (!node.highlights.length || settings?.disableHighlightCards) {
              return;
            }
            pushAndAdvance({
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

          pushAndAdvance({
            type: FeedItemType.Post,
            post,
            page: pageIndex,
            index,
            dataUpdatedAt: feedQuery.dataUpdatedAt,
          });
        });
      });

      if (staticAd && !staticAdInserted && newItems.length > 0) {
        newItems.push({
          type: FeedItemType.Ad,
          ad: staticAd.ad,
          index: 0,
          updatedAt: Date.now(),
          dataUpdatedAt: Date.now(),
        } as AdItem);
      }
    }
    if (feedQuery.isFetching) {
      const placeholders =
        !feedQuery.data && isPhone && isListContext
          ? PHONE_FEED_PLACEHOLDER_ROWS
          : placeholdersPerPage;
      newItems.push(
        ...Array.from({ length: Math.max(0, placeholders) }, () =>
          createPlaceholderItem(),
        ),
      );
    }

    return newItems;
  }, [
    feedQuery.data,
    feedQuery.isFetching,
    feedQuery.dataUpdatedAt,
    placeholdersPerPage,
    getAd,
    settings?.disableHighlightCards,
    settings?.excludedPostIds,
    settings?.staticAd,
    heroCardsConfig,
    virtualizedNumCards,
    isMobileViewport,
    isPhone,
    isListContext,
    fullRowInsertionBeforeIndex,
    cadence,
    widenableTypes,
    excludePinnedPosts,
    effectiveFirstSlotOffset,
    settings?.deferWideCards,
  ]);

  useEffect(() => {
    renderedPostIds.current = new Set(
      items.flatMap((item) =>
        item.type === FeedItemType.Post ? [item.post.id] : [],
      ),
    );
  }, [items]);

  const placements = useMemo(
    () =>
      computePlacements(items, {
        numCards: virtualizedNumCards,
        isMobile: isMobileViewport,
        isList: isListContext,
        isEnabled: heroCardsConfig.enabled,
        minSpacing: heroCardsConfig.minSpacing,
        startIndex: heroCardsConfig.startIndex,
        widenableTypes,
        fullRowInsertionBeforeIndex,
        cadence,
        firstSlotOffset: effectiveFirstSlotOffset,
        minWideCardRow: settings?.deferWideCards ? 1 : 0,
      }),
    [
      items,
      virtualizedNumCards,
      isMobileViewport,
      isListContext,
      heroCardsConfig,
      fullRowInsertionBeforeIndex,
      cadence,
      widenableTypes,
      effectiveFirstSlotOffset,
      settings?.deferWideCards,
    ],
  );

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

  const bannerInsertions: FeedBannerInsertions = {
    fullRowInsertionBeforeIndex,
    briefBannerPage: Number(briefBannerPage),
    showPromoBanner,
    indexWhenShowingPromoBanner,
    hero: {
      shouldShowTopHero: heroFeedHero.shouldShowTopHero,
      title: heroFeedHero.title,
      subtitle: heroFeedHero.subtitle,
      ctaLabel: heroFeedHero.ctaLabel,
      onEnable: heroFeedHero.onEnableHero,
      onDismiss: heroFeedHero.onDismissHero,
    },
  };

  const getPageRequest = useCallback(
    (page: number): FeedPageRequest | undefined => {
      const data = feedQuery.data?.pages[page];
      return data?.first
        ? {
            first: data.first,
            cursor: data.page.pageInfo.endCursor ?? undefined,
          }
        : undefined;
    },
    [feedQuery.data],
  );

  return {
    items,
    placements,
    heroCardsConfig,
    bannerInsertions,
    hasFirstSlotCard,
    getPageRequest,
    fetchPage: async () => {
      await feedQuery.fetchNextPage();
    },
    updatePost,
    removePost: removeCachedPagePost(feedQueryKey, queryClient),
    canFetchMore: feedQuery.hasNextPage,
    emptyFeed:
      (hasNoShownPosts(feedQuery?.data?.pages.map(({ page }) => page)) &&
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
