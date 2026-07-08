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
import type { MarketingCta } from '../components/marketing/cta/common';
import { FeedItemType } from '../components/cards/common/common';
import { GARMR_ERROR, gqlClient } from '../graphql/common';
import { usePlusSubscription } from './usePlusSubscription';
import { LogEvent } from '../lib/log';
import { useLogContext } from '../contexts/LogContext';
import { useEngagementAdsContext } from '../contexts/EngagementAdsContext';
import type { ResolvedCreative } from '../lib/engagementAds';
import { EngagementPlacement } from '../lib/engagementAds';
import type { FeedAdTemplate } from '../lib/feed';
import { getAdSlotIndex } from '../lib/feed';
import {
  briefFeedEntrypointPage,
  featureFeedAdTemplate,
  featureHeroCards,
} from '../lib/featureManagement';
import { useConditionalFeature } from './useConditionalFeature';
import { useReadingReminderFeedHero } from './notifications/useReadingReminderFeedHero';
import {
  computeAdClamp,
  computePlacements,
  createPlacementBuilder,
  deriveAdCadence,
  isHeroEligiblePost,
} from '../lib/feedHighlightColSpan';
import type { FeedItemPlacement } from '../lib/feedHighlightColSpan';
import type { HeroCardsConfig } from '../types';
import { useViewSize, ViewSize } from './useViewSize';
import { useFeedLayout } from './useFeedLayout';
import { useSettingsBooleanFlag } from './useSettingsBooleanFlag';
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

export const HERO_ELIGIBLE_FEEDS = new Set<AllFeedPages>([
  SharedFeedPage.MyFeed,
  SharedFeedPage.Popular,
  SharedFeedPage.Upvoted,
  SharedFeedPage.Custom,
  OtherFeedPage.Following,
  OtherFeedPage.Discussed,
  OtherFeedPage.Explore,
  OtherFeedPage.ExploreLatest,
  OtherFeedPage.ExploreDiscussed,
  OtherFeedPage.ExploreUpvoted,
  OtherFeedPage.ExploreTag,
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
  | MarketingCtaItem
  | PlaceholderItem
  | UserAcquisitionItem
  | PlusEntryItem;

export const isBoostedPostAd = (item: FeedItem): item is AdPostItem =>
  item?.type === FeedItemType.Ad && !!item.ad.data?.post;

export const isBoostedSquadAd = (item: FeedItem): item is AdSquadItem =>
  item?.type === FeedItemType.Ad && !!item.ad.data?.source;

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
  // Campaign-specific engagement strip: a full-row, brand-gradient promo
  // rendered mid-feed when a creative opted into the feed-strip placement.
  showEngagementStrip: boolean;
  indexWhenShowingEngagementStrip: number;
  engagementStripCreative: ResolvedCreative | null;
  hero: {
    shouldShowTopHero: boolean;
    title: string;
    subtitle: string;
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

// 0-based grid row where the campaign-specific engagement strip breaks the
// feed. Picking a whole row (not an item index) keeps the row above it full.
const ENGAGEMENT_STRIP_ROW = 4;

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
   * Whether the current feed may show the campaign-specific engagement strip
   * (the right feed page and not a horizontal carousel). The strip only
   * renders when this is true AND a creative opted into the placement.
   */
  engagementStripEligible?: boolean;
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
    engagementStripEligible = false,
    firstSlotOffset = 0,
    disableTopHero = false,
  } = params;
  const { numCards: numCardsBySpaciness } = useContext(FeedContext);
  const numCards = numCardsBySpaciness.eco;
  const { user, tokenRefreshed } = useContext(AuthContext);
  const { isPlus } = usePlusSubscription();
  const queryClient = useQueryClient();
  const isTabletViewport = useViewSize(ViewSize.Tablet);
  const isMobileViewport = !isTabletViewport;
  const { isListMode, shouldUseListFeedLayout } = useFeedLayout();
  const useList = isListMode && numCards > 1;
  const isListContext = useList || shouldUseListFeedLayout;
  const virtualizedNumCards = useList ? 1 : numCards;
  const canRenderHighlightCards =
    !isMobileViewport &&
    !isListContext &&
    virtualizedNumCards > 1 &&
    HERO_ELIGIBLE_FEEDS.has(settings?.feedName as AllFeedPages);
  const { value: isHighlightCardsOptedOut } = useSettingsBooleanFlag(
    'highlightCardsOptOut',
  );
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
        columns: virtualizedNumCards,
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
      (Object.keys(allowed) as PostType[]).filter(
        (type) => allowed[type] === true,
      ),
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
    firstSlotOffset;

  const { getCreativeForPlacement } = useEngagementAdsContext();
  const engagementStripCreative = engagementStripEligible
    ? getCreativeForPlacement(EngagementPlacement.FeedStrip)
    : null;
  const showEngagementStrip = !!engagementStripCreative;
  // Break the feed a few rows in. Multiplying the row by the column count
  // gives the item index at the start of that row; the full-row insertion
  // machinery pads the row above so the strip always begins a clean row (in
  // grid) and just slots inline (in list, where virtualizedNumCards === 1).
  const indexWhenShowingEngagementStrip =
    ENGAGEMENT_STRIP_ROW * virtualizedNumCards - firstSlotOffset;

  const fullRowInsertionBeforeIndex = useMemo(() => {
    const set = new Set<number>();
    if (showPromoBanner) {
      set.add(indexWhenShowingPromoBanner);
    }
    if (showEngagementStrip) {
      set.add(indexWhenShowingEngagementStrip);
    }
    return set;
  }, [
    showPromoBanner,
    indexWhenShowingPromoBanner,
    showEngagementStrip,
    indexWhenShowingEngagementStrip,
  ]);

  const { fetchAd } = useFetchAd();
  // Per-mount random seed for ad jitter. Stable across re-renders/pagination
  // (so ads don't visibly jump as new pages load) but varies across mounts and
  // sessions, so the same user doesn't see ads in the same spots every visit.
  const adJitterSeedRef = useRef<string>();
  if (!adJitterSeedRef.current) {
    adJitterSeedRef.current = Math.random().toString(36).slice(2);
  }
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
        seed: adJitterSeedRef.current ?? '',
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

  const items = useMemo(() => {
    const newItems: FeedItem[] = [];

    // Check if marketing CTA should be shown as first card
    const marketingCta = settings?.marketingCta;
    const marketingCtaAsFirstCard = marketingCta?.flags?.asFirstCard;
    const plusEntry = settings?.plusEntry;
    const plusEntryAsFirstCard = plusEntry?.flags?.asFirstCard;
    const showAcquisitionForm = settings?.showAcquisitionForm ?? false;

    if (feedQuery.data) {
      // Track visual cells (not logical items) for ad cadence so wide
      // cards consume their full visual width against the ad schedule.
      // The builder returns colSpan=1 when the layout is disabled
      // (mobile/list/single-col), so we never need to special-case those.
      const seenPostIds = new Set<string>();
      let visualCellsSoFar = 0;

      const placementBuilder = createPlacementBuilder({
        numCards: virtualizedNumCards,
        isMobile: isMobileViewport,
        isList: isListContext,
        isEnabled: heroCardsConfig.enabled,
        minSpacing: heroCardsConfig.minSpacing,
        startIndex: heroCardsConfig.startIndex,
        widenableTypes,
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

      if (plusEntryAsFirstCard && plusEntry) {
        pushAndAdvance({
          type: FeedItemType.PlusEntry,
          plusEntry,
          dataUpdatedAt: feedQuery.dataUpdatedAt,
        });
      } else if (marketingCtaAsFirstCard && marketingCta) {
        pushAndAdvance({
          type: FeedItemType.MarketingCta,
          marketingCta,
          dataUpdatedAt: feedQuery.dataUpdatedAt,
        });
      }

      feedQuery.data.pages.forEach(({ page }, pageIndex) => {
        page.edges.forEach(({ node }, index: number) => {
          const adItem = getAd({ index: visualCellsSoFar });

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
              pushAndAdvance({
                type: FeedItemType.PlusEntry,
                plusEntry,
                dataUpdatedAt: feedQuery.dataUpdatedAt,
              });
            } else if (marketingCta && withFirstIndex(true)) {
              pushAndAdvance({
                type: FeedItemType.MarketingCta,
                marketingCta,
                dataUpdatedAt: feedQuery.dataUpdatedAt,
              });
            } else if (withFirstIndex(showAcquisitionForm)) {
              pushAndAdvance({
                type: FeedItemType.UserAcquisition,
                dataUpdatedAt: feedQuery.dataUpdatedAt,
              });
            } else {
              pushAndAdvance(adItem);
            }
          }

          if (node.itemType === 'highlight') {
            if (!node.highlights.length) {
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
      newItems.push(
        ...Array.from({ length: Math.max(0, placeholdersPerPage) }, () =>
          createPlaceholderItem(),
        ),
      );
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
    heroCardsConfig,
    virtualizedNumCards,
    isMobileViewport,
    isListContext,
    fullRowInsertionBeforeIndex,
    cadence,
    widenableTypes,
  ]);

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
    showEngagementStrip,
    indexWhenShowingEngagementStrip,
    engagementStripCreative,
    hero: {
      shouldShowTopHero: heroFeedHero.shouldShowTopHero,
      title: heroFeedHero.title,
      subtitle: heroFeedHero.subtitle,
      onEnable: heroFeedHero.onEnableHero,
      onDismiss: heroFeedHero.onDismissHero,
    },
  };

  return {
    items,
    placements,
    heroCardsConfig,
    bannerInsertions,
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
