import type {
  CSSProperties,
  ReactElement,
  ReactNode,
  SetStateAction,
} from 'react';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import type { QueryKey } from '@tanstack/react-query';
import type { FeedProps } from './Feed';
import Feed from './Feed';
import { feedGutter, feedWidth } from './utilities/common';
import { PlaceholderFeed } from './cards/placeholder/PlaceholderFeed';
import { SponsorStrip } from '../features/monetization/sponsorStrip/SponsorStrip';
import { useSponsorStrip } from '../features/monetization/sponsorStrip/useSponsorStrip';
import { ExploreChipsBar } from './feeds/ExploreChipsBar';
import { buildPersonalizedCategories } from './feeds/exploreCategories';
import { useFeeds } from '../hooks/feed/useFeeds';
import { WebappShortcutsRow } from '../features/shortcuts/components/WebappShortcutsRow';
import { AskSearchBanner } from './marketing/banners/AskSearchBanner';
import {
  PublicPageSignupBanner,
  usePublicPageSignupBannerGate,
} from './auth/PublicPageSignupBanner';
import FeedContext from '../contexts/FeedContext';
import AuthContext from '../contexts/AuthContext';
import type { LoggedUser } from '../lib/user';
import { SharedFeedPage } from './utilities';
import {
  FEED_V2_HIGHLIGHTS_LIMIT,
  ANONYMOUS_FEED_QUERY,
  CUSTOM_FEED_QUERY,
  feedV2SupportedTypes,
  FEED_V2_EXPLAIN_QUERY,
  FEED_V2_QUERY,
  FOLLOWING_FEED_QUERY,
  MOST_DISCUSSED_FEED_QUERY,
  MOST_UPVOTED_FEED_QUERY,
  SEARCH_POSTS_QUERY,
} from '../graphql/feed';
import type { RequestKey } from '../lib/query';
import { generateQueryKey, OtherFeedPage } from '../lib/query';
import SettingsContext from '../contexts/SettingsContext';
import usePersistentContext from '../hooks/usePersistentContext';
import AlertContext from '../contexts/AlertContext';
import { useFeature, useFeaturesReadyContext } from './GrowthBookProvider';
import {
  algorithms,
  DEFAULT_ALGORITHM_INDEX,
  DEFAULT_ALGORITHM_KEY,
  LayoutHeader,
  periods,
  SearchControlHeader,
} from './layout/common';
import { useFeedName } from '../hooks/feed/useFeedName';
import {
  useConditionalFeature,
  useFeedLayout,
  useViewSize,
  ViewSize,
} from '../hooks';
import { useIsPhone } from '../hooks/useViewSize';
import { feedNameToHeading, v2FeedSideInsetClass } from './feeds/FeedContainer';
import { pageHeaderClassName } from './layout/PageHeader';
import {
  customFeedVersion,
  discussedFeedVersion,
  feature,
  featureFeedChips,
  featureFeedHero,
  FeedChipsVariant,
  followingFeedVersion,
  latestFeedVersion,
  popularFeedVersion,
  upvotedFeedVersion,
} from '../lib/featureManagement';
import type { FeedContainerProps } from './feeds';
import { FeedHero } from './feeds/hero/FeedHero';
import {
  useFeedWidgetFeedState,
  useFeedWidgetRailState,
  useFeedWidgetsOptOut,
} from '../features/feedWidgets/feedState';
import { FeedWidgetRailLoading } from '../features/feedWidgets/FeedWidgetRailFrame';
import { HomeFeedTabs } from '../features/feedWidgets/HomeFeedTabs';
import { getFeedName } from '../lib/feed';
import { ClientQuestEventType } from '../graphql/quests';
import { ExploreTabs, tabToUrl, urlToTab } from './header';
import { FeedExploreTabs } from './header/FeedExploreTabs';
import { QueryStateKeys, useQueryState } from '../hooks/utils/useQueryState';
import { useSearchResultsLayout } from '../hooks/search/useSearchResultsLayout';
import { useSearchId } from '../hooks/search/useSearchId';
import useCustomDefaultFeed from '../hooks/feed/useCustomDefaultFeed';
import { useSearchContextProvider } from '../contexts/search/SearchContext';
import { isDevelopment, isProductionAPI, webappUrl } from '../lib/constants';
import { checkIsExtension } from '../lib/func';
import { useTrackQuestClientEvent } from '../hooks/useTrackQuestClientEvent';
import { useLaptopLayout } from '../hooks/layout/useLaptopLayout';
import SearchMobileFiltersButton from './search/SearchMobileFiltersButton';

import { ExploreSortMenu } from './shell/ExploreSortMenu';
import { isRootView, ShellRoot } from './shell/shellNav';
import { ShellPage } from './shell/ShellPageContext';
import { getSearchPageProvider, SearchProviderEnum } from '../graphql/search';
import {
  SearchProviderNavbar,
  SearchProviderSegments,
} from './search/SearchResults/SearchProviderTabs';
import { useFeedExplainMode } from '../features/feedExplain/useFeedExplainMode';
import { useFeedTuneState } from '../features/feedExplain/useFeedTune';
import { FeedTuneProvider } from '../features/feedExplain/FeedTuneContext';
import { FeedTunePanel } from '../features/feedExplain/components/FeedTunePanel';
import { FeedExplainBar } from '../features/feedExplain/components/FeedExplainBar';

// Its own chunk, so readers without the rail never download it; the skeleton
// holds the rail's exact height while it loads.
const FeedWidgetRail = dynamic(
  () =>
    import(
      /* webpackChunkName: "feedWidgetRail" */ '../features/feedWidgets/FeedWidgetRail'
    ).then((mod) => mod.FeedWidgetRail),
  { loading: () => <FeedWidgetRailLoading /> },
);

const SpotlightField = dynamic(() =>
  import(
    /* webpackChunkName: "spotlightTrigger" */ './spotlight/SpotlightTrigger'
  ).then((mod) => mod.SpotlightField),
);

const FeedExploreHeader = dynamic(
  () =>
    import(/* webpackChunkName: "feedExploreHeader" */ './header').then(
      (mod) => mod.FeedExploreHeader,
    ),
  {
    ssr: false,
  },
);

const SearchEmptyScreen = dynamic(
  () =>
    import(/* webpackChunkName: "searchEmptyScreen" */ './SearchEmptyScreen'),
);

const SearchProviderResults = dynamic(() =>
  import(
    /* webpackChunkName: "searchProviderResults" */ './search/SearchResults/SearchProviderResults'
  ).then((mod) => mod.SearchProviderResults),
);

const FeedEmptyScreen = dynamic(
  () => import(/* webpackChunkName: "feedEmptyScreen" */ './FeedEmptyScreen'),
);
const FollowingFeedEmptyScreen = dynamic(
  () =>
    import(
      /* webpackChunkName: "followingFeedEmptyScreen" */ './FollowingFeedEmptyScreen'
    ),
);

const CustomFeedEmptyScreen = dynamic(() =>
  import(
    /* webpackChunkName: "customFeedEmptyScreen" */ './CustomFeedEmptyScreen'
  ).then((mod) => mod.CustomFeedEmptyScreen),
);

type FeedQueryProps = {
  query: string;
  queryIfLogged?: string;
  variables?: Record<string, unknown>;
  requestKey?: RequestKey | SharedFeedPage | OtherFeedPage;
  emptyScreen?: ReactNode;
};

type FeedConfigPage = SharedFeedPage | OtherFeedPage;

const propsByFeed: Partial<Record<FeedConfigPage, FeedQueryProps>> = {
  'my-feed': {
    query: ANONYMOUS_FEED_QUERY,
    queryIfLogged: FEED_V2_QUERY,
  },
  popular: {
    query: ANONYMOUS_FEED_QUERY,
  },
  posts: {
    query: ANONYMOUS_FEED_QUERY,
  },
  search: {
    query: ANONYMOUS_FEED_QUERY,
    queryIfLogged: FEED_V2_QUERY,
  },
  upvoted: {
    query: MOST_UPVOTED_FEED_QUERY,
  },
  [OtherFeedPage.ExploreLatest]: {
    query: ANONYMOUS_FEED_QUERY,
  },
  [OtherFeedPage.ExploreUpvoted]: {
    query: MOST_UPVOTED_FEED_QUERY,
  },
  [OtherFeedPage.ExploreDiscussed]: {
    query: MOST_DISCUSSED_FEED_QUERY,
  },
  [SharedFeedPage.Custom]: {
    query: CUSTOM_FEED_QUERY,
    emptyScreen: <CustomFeedEmptyScreen />,
  },
  [SharedFeedPage.CustomForm]: {
    requestKey: SharedFeedPage.Custom,
    query: CUSTOM_FEED_QUERY,
    emptyScreen: <CustomFeedEmptyScreen />,
  },
  [OtherFeedPage.Following]: {
    query: FOLLOWING_FEED_QUERY,
    emptyScreen: <FollowingFeedEmptyScreen />,
  },
};

export interface MainFeedLayoutProps
  extends Pick<FeedContainerProps, 'shortcuts'> {
  feedName: string;
  isSearchOn: boolean;
  searchQuery?: string;
  children?: ReactNode;
  searchChildren?: ReactNode;
  navChildren?: ReactNode;
  isFinder?: boolean;
  onNavTabClick?: (tab: string) => void;
  // Laptop only: replaces the feed's page-header content (feed actions or
  // heading), e.g. the extension's sign-in CTAs for anonymous visitors.
  pageHeaderContent?: ReactNode;
}

const getQueryBasedOnLogin = (
  isTokenValid: boolean,
  user: LoggedUser | null,
  query: string,
  queryIfLogged: string | null,
): string | null => {
  if (isTokenValid) {
    if (user && queryIfLogged) {
      return queryIfLogged;
    }
    return query;
  }
  return null;
};

// The feed's own width: full width normally, and clamped + centered to the
// same card-based max-width as the grid on wide screens (desktopL). The CSS
// vars feed the `styles.container` max-width calc (grid gap is 2rem).
const feedWidthClassName = classNames('relative flex flex-col', feedWidth);

const feedWithDateRange = [
  ExploreTabs.MostUpvoted,
  ExploreTabs.BestDiscussions,
];

export default function MainFeedLayout({
  feedName: feedNameProp,
  searchQuery,
  isSearchOn,
  children,
  searchChildren,
  shortcuts,
  navChildren,
  isFinder,
  onNavTabClick,
  pageHeaderContent,
}: MainFeedLayoutProps): ReactElement {
  const { sortingEnabled, loadedSettings } = useContext(SettingsContext);
  const { user, isTokenValid } = useContext(AuthContext);
  const { alerts } = useContext(AlertContext);
  const { numCards: feedSpacinessCards } = useContext(FeedContext);
  const feedWidthStyle = {
    '--num-cards': feedSpacinessCards.eco,
    '--feed-gap': '2rem',
  } as CSSProperties;
  const router = useRouter();
  const [tab, setTab] = useState(ExploreTabs.Popular);
  const feedName = getFeedName(feedNameProp, {
    hasFiltered: !alerts?.filter,
    hasUser: !!user,
  });
  const { isCustomDefaultFeed, defaultFeedId } = useCustomDefaultFeed();
  const isLaptop = useViewSize(ViewSize.Laptop);
  // Explore's hub is in the server HTML for phones, shown by CSS: the
  // server cannot know the screen, so it and the first client render emit
  // it, and wider screens drop it once they have mounted.
  const [hasMounted, setHasMounted] = useState(false);
  const isPhoneWidth = useViewSize(ViewSize.MobileL) && !isLaptop;
  useEffect(() => {
    setHasMounted(true);
  }, []);
  const isPhone = useIsPhone();
  const isLaptopLayout = useLaptopLayout();
  const feedVersion = useFeature(feature.feedVersion);
  const { time, contentCurationFilter, postTypesFilter } =
    useSearchContextProvider();
  const isExtension = checkIsExtension();
  const isExploreRoot =
    !isExtension && isRootView(ShellRoot.Explore, router?.pathname ?? '');
  const isHomePage = router.pathname === webappUrl;
  const {
    isUpvoted,
    isPopular,
    isAnyExplore,
    isExploreLatest,
    isSortableFeed,
    isCustomFeed,
    isSearch: isSearchPage,
  } = useFeedName({
    feedName,
  });
  useTrackQuestClientEvent({
    eventType: ClientQuestEventType.VisitExplorePage,
    enabled: feedName === OtherFeedPage.Explore,
  });
  const { shouldUseListFeedLayout, FeedPageLayoutComponent } = useFeedLayout();

  const { value: myFeedV } = useConditionalFeature({
    feature: feature.feedVersion,
    shouldEvaluate: feedName === SharedFeedPage.MyFeed,
  });
  const { value: followingFeedV } = useConditionalFeature({
    feature: followingFeedVersion,
    shouldEvaluate: feedName === OtherFeedPage.Following,
  });
  const { value: exploreFeedV } = useConditionalFeature({
    feature: popularFeedVersion,
    shouldEvaluate: feedName === OtherFeedPage.Explore,
  });
  const { value: exploreUpvotedFeedV } = useConditionalFeature({
    feature: upvotedFeedVersion,
    shouldEvaluate: feedName === OtherFeedPage.ExploreUpvoted,
  });
  const { value: exploreDiscussedFeedV } = useConditionalFeature({
    feature: discussedFeedVersion,
    shouldEvaluate: feedName === OtherFeedPage.ExploreDiscussed,
  });
  const { value: exploreLatestFeedV } = useConditionalFeature({
    feature: latestFeedVersion,
    shouldEvaluate: feedName === OtherFeedPage.ExploreLatest,
  });
  const { value: customFeedV } = useConditionalFeature({
    feature: customFeedVersion,
    shouldEvaluate: feedName === SharedFeedPage.Custom,
  });

  const searchProvider = getSearchPageProvider(router.query?.provider);
  const isProviderSearch =
    isSearchOn && !!searchQuery && searchProvider !== SearchProviderEnum.Posts;
  const isPostSearch = isSearchOn && !!searchQuery && !isProviderSearch;
  const searchProviderSegments = useMemo(
    () =>
      searchQuery ? (
        <SearchProviderSegments query={searchQuery} provider={searchProvider} />
      ) : undefined,
    [searchQuery, searchProvider],
  );
  const { value: searchVersion } = useConditionalFeature({
    feature: feature.searchVersion,
    shouldEvaluate: isPostSearch,
  });
  const searchId = useSearchId(
    isPostSearch
      ? [
          searchQuery,
          searchVersion,
          contentCurationFilter.join(','),
          postTypesFilter.join(','),
          time,
        ].join('|')
      : '',
  );

  const isChipStripPage =
    router.pathname === '/' ||
    router.pathname === '/my-feed' ||
    router.pathname === '/feeds/[slugOrId]' ||
    router.pathname === '/feeds/[slugOrId]/edit';
  const { value: feedChipsVariant } = useConditionalFeature({
    feature: featureFeedChips,
    shouldEvaluate: !!user && isLaptop && isChipStripPage,
  });
  const isFeedChipsEnabled = feedChipsVariant !== FeedChipsVariant.None;
  const showExploreChips =
    !!user && isLaptop && isChipStripPage && isFeedChipsEnabled;
  const { feeds } = useFeeds();
  const exploreCategories = useMemo(
    () =>
      buildPersonalizedCategories(feeds?.edges ?? [], {
        defaultFeedId,
        isCustomDefaultFeed,
      }),
    [feeds?.edges, defaultFeedId, isCustomDefaultFeed],
  );
  const chipsNode = useMemo(
    () =>
      showExploreChips ? (
        <ExploreChipsBar categories={exploreCategories} isPending={!feeds} />
      ) : null,
    [showExploreChips, exploreCategories, feeds],
  );

  const isMainFeedPage =
    feedName === SharedFeedPage.MyFeed || feedName === SharedFeedPage.Popular;
  const { isFlagOn: isFeedWidgetsFlagOn, isEnabled: isFeedWidgetsEnabled } =
    useFeedWidgetRailState(feedName);
  const { hide: hideFeedWidgets } = useFeedWidgetsOptOut();
  const { value: isFeedHeroFlagOn } = useConditionalFeature({
    feature: featureFeedHero,
    shouldEvaluate: isMainFeedPage && !isFeedWidgetsFlagOn,
  });
  // A first visit learns its flags with the boot, a commit after its settings.
  // Until then the rail may or may not come, so nothing of the feed paints
  // that it could push down.
  const { settled: areFeaturesSettled } = useFeaturesReadyContext();
  const isAwaitingFeatures = isMainFeedPage && !areFeaturesSettled;
  // The rail is the hero's successor: where it is on, the hero yields, and a
  // reader who turned the rail off gets the plain feed, not the hero back.
  const isFeedHeroEnabled = isFeedHeroFlagOn && !isFeedWidgetsFlagOn;
  // What the grid must not repeat, known before it paints and never waiting
  // on the rail's own code or data, so the grid never moves when it lands.
  const widgetFeedState = useFeedWidgetFeedState({
    enabled: isFeedWidgetsEnabled,
  });
  // The hero reports back rather than being asked: it only has a placement once
  // its column exists and an ad has come back for it, and it renders nothing at
  // all until its headlines resolve.
  const [isHeroAdVisible, setIsHeroAdVisible] = useState(false);
  const [isHeroRendered, setIsHeroRendered] = useState(false);

  const { isSearchPageLaptop } = useSearchResultsLayout();

  const config = useMemo(() => {
    if (!feedName) {
      return { query: null };
    }

    const dynamicPropsByFeed: Partial<
      Record<FeedConfigPage, Partial<FeedQueryProps>>
    > = {
      [SharedFeedPage.Custom]: {
        variables: {
          feedId: router.query?.slugOrId as string,
        },
      },
      [SharedFeedPage.CustomForm]: {
        // when editing main feed load feed query
        queryIfLogged:
          router.query?.slugOrId === user?.id
            ? FEED_V2_QUERY
            : CUSTOM_FEED_QUERY,
        variables: {
          feedId: (router.query?.slugOrId as string) || user?.id,
        },
      },
    };

    /**
     * Various feeds can have different feed versions based on feature flag
     */
    const dynamicFeedVersionByFeed: Partial<Record<FeedConfigPage, number>> = {
      [SharedFeedPage.MyFeed]: myFeedV,
      [OtherFeedPage.Following]: followingFeedV,
      [OtherFeedPage.Explore]: exploreFeedV,
      [OtherFeedPage.ExploreUpvoted]: exploreUpvotedFeedV,
      [OtherFeedPage.ExploreDiscussed]: exploreDiscussedFeedV,
      [OtherFeedPage.ExploreLatest]: exploreLatestFeedV,
      [SharedFeedPage.Custom]: customFeedV,
    };

    const feedConfig = propsByFeed[feedName];
    const dynamicFeedConfig =
      feedName in dynamicPropsByFeed
        ? dynamicPropsByFeed[feedName as SharedFeedPage]
        : undefined;

    // do not show feed in background on new page
    if (router.pathname === '/feeds/new' || !feedConfig) {
      return {
        query: null,
      };
    }

    const query = getQueryBasedOnLogin(
      isTokenValid,
      user ?? null,
      dynamicFeedConfig?.query || feedConfig.query,
      dynamicFeedConfig?.queryIfLogged || feedConfig.queryIfLogged || null,
    );
    const shouldRequestFeedV2Highlights = query === FEED_V2_QUERY;

    return {
      requestKey: feedConfig.requestKey,
      query,
      variables: {
        ...feedConfig.variables,
        ...dynamicFeedConfig?.variables,
        ...(shouldRequestFeedV2Highlights
          ? {
              supportedTypes: feedV2SupportedTypes,
              highlightsLimit: FEED_V2_HIGHLIGHTS_LIMIT,
            }
          : {}),
        version:
          isDevelopment && !isProductionAPI
            ? 1
            : dynamicFeedVersionByFeed[feedName] || feedVersion,
      },
    };
  }, [
    feedName,
    router.query?.slugOrId,
    router.pathname,
    user,
    myFeedV,
    followingFeedV,
    exploreFeedV,
    exploreUpvotedFeedV,
    exploreDiscussedFeedV,
    exploreLatestFeedV,
    customFeedV,
    isTokenValid,
    feedVersion,
  ]);

  const [selectedAlgo, setSelectedAlgo, loadedAlgo] = usePersistentContext(
    DEFAULT_ALGORITHM_KEY,
    DEFAULT_ALGORITHM_INDEX,
    [0, 1],
    DEFAULT_ALGORITHM_INDEX,
  );

  const [selectedPeriod] = useQueryState({
    key: [QueryStateKeys.FeedPeriod],
    defaultValue: 0,
  });
  // Debug mode lays an explanation over every card, so only then does For You
  // ask for one per card, under its own query key. Otherwise the post menu's
  // Why am I seeing this? asks for its post's when opened.
  const {
    isAvailable: canExplain,
    isExplaining,
    version: explainVersion,
  } = useFeedExplainMode({
    isRecommended: selectedAlgo === DEFAULT_ALGORITHM_INDEX,
  });
  const canExplainPosts =
    canExplain &&
    feedName === SharedFeedPage.MyFeed &&
    config.query === FEED_V2_QUERY;
  const isExplainFeed = canExplainPosts && isExplaining;
  // Tune ranks the feed with its draft, beside it, in Debug mode.
  const tune = useFeedTuneState();
  const isTuning = isExplainFeed && tune.isOpen;
  const tuneDraft = isTuning && tune.hasChanges ? tune.draft : undefined;
  const { isOpen: isTuneOpen, close: closeTune } = tune;
  useEffect(() => {
    if (
      isTuneOpen &&
      ((canExplain && !isExplaining) ||
        (!!feedName && feedName !== SharedFeedPage.MyFeed))
    ) {
      closeTune();
    }
  }, [isTuneOpen, canExplain, isExplaining, feedName, closeTune]);

  const hasSearchContent = !!navChildren || (isSearchOn && !!searchChildren);
  const search = useMemo(
    () =>
      hasSearchContent ? (
        <LayoutHeader
          className={isSearchPage ? 'mt-16 laptop:mt-0' : undefined}
        >
          {navChildren}
          {isSearchOn && searchChildren ? searchChildren : undefined}
        </LayoutHeader>
      ) : null,
    [hasSearchContent, isSearchOn, isSearchPage, navChildren, searchChildren],
  );

  const handleSelectedAlgoChange = useCallback(
    (value: SetStateAction<number>) => {
      const nextValue =
        typeof value === 'function' ? value(selectedAlgo) : value;
      setSelectedAlgo(nextValue).catch(() => undefined);
    },
    [selectedAlgo, setSelectedAlgo],
  );

  const feedProps = useMemo<FeedProps<unknown> | null>(() => {
    const feedWithActions =
      isUpvoted || isPopular || isSortableFeed || isCustomFeed;
    // in list search by default we do not show any results but empty state
    // so returning false so feed does not do any requests
    if ((isSearchOn && !searchQuery) || isProviderSearch) {
      return null;
    }

    // Wait for both algorithm (from IndexedDB) and a valid token (cached or from boot)
    // to load before making sortable feed requests to prevent double queries
    if (isSortableFeed && (!loadedAlgo || !isTokenValid)) {
      return null;
    }

    const emptyScreen = propsByFeed[feedName]?.emptyScreen || (
      <FeedEmptyScreen />
    );

    if (feedNameProp === 'default' && isCustomDefaultFeed) {
      if (!defaultFeedId) {
        return null;
      }

      return {
        feedName: SharedFeedPage.Custom,
        feedQueryKey: generateQueryKey(
          SharedFeedPage.Custom,
          user,
          defaultFeedId,
        ),
        query: CUSTOM_FEED_QUERY,
        variables: {
          feedId: defaultFeedId,
          feedName: SharedFeedPage.Custom,
        },
        emptyScreen,
        actionButtons: feedWithActions && !isFeedWidgetsEnabled && (
          <SearchControlHeader
            algoState={[selectedAlgo, handleSelectedAlgoChange]}
            // On `/` with a custom default feed the rendered feed is the
            // custom feed (not MyFeed) — pass `Custom` so derived flags
            // (isSortableFeed, etc.) reflect that, not the outer 'default'.
            feedName={SharedFeedPage.Custom}
            chips={shouldUseListFeedLayout ? undefined : chipsNode}
          />
        ),
      };
    }

    if (isSearchOn && searchQuery) {
      return {
        feedName: SharedFeedPage.Search,
        feedQueryKey: generateQueryKey(
          SharedFeedPage.Search,
          user,
          searchQuery,
          contentCurationFilter,
          postTypesFilter,
          time,
        ),
        query: SEARCH_POSTS_QUERY,
        variables: {
          query: searchQuery,
          version: searchVersion,
          contentCuration: contentCurationFilter,
          postTypes: postTypesFilter,
          time,
        },
        searchId,
        searchVersion,
        emptyScreen: <SearchEmptyScreen />,
      };
    }

    if (!config.query) {
      return null;
    }

    const getVariables = () => {
      if (
        isUpvoted ||
        feedWithDateRange.includes(tab) ||
        feedWithDateRange.includes(urlToTab[router.pathname])
      ) {
        return { ...config.variables, period: periods[selectedPeriod].value };
      }

      if (isAnyExplore) {
        const laptopValue =
          tab === ExploreTabs.ByDate || isExploreLatest ? 1 : 0;
        const mobileValue =
          urlToTab[router.pathname] === ExploreTabs.ByDate ? 1 : 0;
        const finalAlgo = isLaptop ? laptopValue : mobileValue;

        return {
          ...config.variables,
          ranking: algorithms[finalAlgo].value,
        };
      }

      if (isSortableFeed) {
        return {
          ...config.variables,
          ranking: algorithms[selectedAlgo].value,
        };
      }

      return config.variables;
    };

    // The draft goes last, so the feed's own key is this one without it.
    const feedVariables = getVariables();
    const variables = isExplainFeed
      ? {
          ...feedVariables,
          explain: true,
          ...(tuneDraft && { draft: tuneDraft }),
        }
      : feedVariables;
    const feedRequestKey = config.requestKey || feedName;
    // Debug and Tune only add to the feed's own key, so a key that starts
    // with it is the same feed. Switching between them keeps the cards on
    // screen until the other one loads, instead of an empty feed.
    const ownKey = generateQueryKey(
      feedRequestKey,
      user,
      ...Object.values(feedVariables ?? {}),
    );
    const isSameFeedKey = (key: QueryKey): boolean =>
      JSON.stringify(key.slice(0, ownKey.length)) === JSON.stringify(ownKey);

    return {
      feedName,
      feedQueryKey: generateQueryKey(
        feedRequestKey,
        user,
        ...Object.values(variables ?? {}),
      ),
      query: isExplainFeed ? FEED_V2_EXPLAIN_QUERY : config.query,
      variables,
      ...(canExplainPosts && {
        options: {
          placeholderData: (previousData, previousQuery) =>
            previousQuery && isSameFeedKey(previousQuery.queryKey)
              ? previousData
              : undefined,
        },
      }),
      isExplaining: isExplainFeed,
      canExplainPosts,
      emptyScreen,
      actionButtons: feedWithActions && !isFeedWidgetsEnabled && (
        <SearchControlHeader
          algoState={[selectedAlgo, handleSelectedAlgoChange]}
          feedName={feedName}
          chips={shouldUseListFeedLayout ? undefined : chipsNode}
        />
      ),
    };
  }, [
    chipsNode,
    shouldUseListFeedLayout,
    isUpvoted,
    isPopular,
    isSortableFeed,
    isCustomFeed,
    isSearchOn,
    searchQuery,
    isProviderSearch,
    feedNameProp,
    isCustomDefaultFeed,
    config.query,
    config.requestKey,
    config.variables,
    feedName,
    user,
    selectedAlgo,
    handleSelectedAlgoChange,
    defaultFeedId,
    searchId,
    searchVersion,
    contentCurationFilter,
    postTypesFilter,
    time,
    tab,
    router.pathname,
    isAnyExplore,
    selectedPeriod,
    isExploreLatest,
    isLaptop,
    loadedAlgo,
    isTokenValid,
    isFeedWidgetsEnabled,
    canExplainPosts,
    isExplainFeed,
    tuneDraft,
  ]);

  // The gates above that hold `feedProps` back until the session can ask for
  // the feed; the main shows the feed's skeleton meanwhile.
  const isFeedPending =
    !feedProps &&
    !isProviderSearch &&
    !(isSearchOn && !searchQuery) &&
    (!isTokenValid || (isSortableFeed && !loadedAlgo));

  useEffect(() => {
    if (!sortingEnabled && selectedAlgo > 0 && loadedSettings && loadedAlgo) {
      setSelectedAlgo(0);
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortingEnabled, selectedAlgo, loadedSettings, loadedAlgo]);

  // Explore keeps the page's top padding in both layouts. It renders a
  // breadcrumb and tab header above the feed, and zeroing the padding
  // leaves that header jammed under the site header — while
  // `shouldUseListFeedLayout` flips between first paint and mount
  // (see `enableSsrSafeLayout`), so keying the spacing to it made the
  // gap change size on navigation and settle differently on reload.
  const disableTopPadding =
    isFinder || (shouldUseListFeedLayout && (!isAnyExplore || isPhone));
  const onTabChange = useCallback(
    (clickedTab: ExploreTabs) => {
      if (clickedTab === ExploreTabs.BestOf && isExtension) {
        window.open(`${webappUrl}posts/best-of`, '_blank', 'noopener');
        return;
      }

      if (onNavTabClick) {
        onNavTabClick(tabToUrl[clickedTab]);
      }

      setTab(clickedTab);
    },
    [isExtension, onNavTabClick],
  );

  const FeedExploreComponent = useCallback(() => {
    return (
      <FeedExploreHeader
        tab={tab}
        setTab={onTabChange}
        className={{
          container: classNames(
            'z-header w-full border-b border-border-subtlest-tertiary bg-background-default tablet:sticky tablet:top-[4.5rem]',
            feedGutter,
          ),
          tabBarHeader: 'no-scrollbar overflow-x-auto',
          tabBarContainer: 'min-w-0 flex-1',
        }}
      />
    );
  }, [onTabChange, tab]);

  // v2 reaches the Explore hub sections (Explore, Tags, Sources, Leaderboard,
  // Discussions) from the sidebar's Explore panel, so the page header no longer
  // carries a section-tab strip. The header now only hosts the Explore sort
  // dropdown, so it's gated on isAnyExplore.
  const showExploreV2PageHeader = isAnyExplore && isLaptopLayout;

  // v2 also hoists the regular page-header strip up here, OUTSIDE
  // `FeedPageLayoutComponent`, so it can span the full floating-card
  // width without being clamped by `FeedPageLayoutList`'s 680px max
  // (which keeps list cards at a comfortable reading width).
  const { feeds: customFeedsData } = useFeeds();
  const feedHeading = useMemo(() => {
    if (feedName === SharedFeedPage.Custom) {
      const customFeed = customFeedsData?.edges.find(
        ({ node }) =>
          node.id === router.query.slugOrId ||
          node.slug === router.query.slugOrId,
      )?.node;
      if (customFeed?.flags?.name) {
        return customFeed.flags.name;
      }
    }
    if (feedName && feedName in feedNameToHeading) {
      return feedNameToHeading[feedName as keyof typeof feedNameToHeading];
    }
    // Extension new tab passes `feedName='default'`; fall through to
    // the user's default feed so the v2 header isn't suppressed.
    if ((feedName as string) === 'default') {
      return feedNameToHeading[SharedFeedPage.MyFeed];
    }
    return '';
  }, [customFeedsData, feedName, router.query.slugOrId]);
  const chipsTopContent =
    shouldUseListFeedLayout && chipsNode ? (
      <div
        className={classNames('mb-8 w-full', shouldUseListFeedLayout && 'mt-8')}
      >
        {chipsNode}
      </div>
    ) : undefined;
  // The hero is a sibling of the v2 grid, so it repeats the grid's inset and
  // card border rules. No bottom margin from `tablet` up, where the grid
  // already opens with that inset; mobile keeps one as the only separator.
  const isV2Grid = isLaptopLayout && !shouldUseListFeedLayout;
  const heroInsetClassName = classNames(
    'w-full',
    isV2Grid &&
      classNames(
        v2FeedSideInsetClass,
        '[&_article:hover]:!border-border-subtlest-tertiary [&_article]:!border-border-subtlest-quaternary',
      ),
  );
  const heroClassName = classNames(
    heroInsetClassName,
    'tablet:pt-6',
    isV2Grid ? 'mb-8 tablet:mb-0' : 'mb-8',
  );
  // The feed's tabs follow the rail, so they carry the gap to the feed.
  const railClassName = classNames(
    heroInsetClassName,
    'tablet:pt-4',
    !isV2Grid && 'mb-2',
  );
  const feedTabs = isFeedWidgetsEnabled && (
    <HomeFeedTabs
      feedName={
        feedNameProp === 'default' && isCustomDefaultFeed
          ? SharedFeedPage.Custom
          : feedName
      }
      heading={feedHeading}
      hasChips={showExploreChips}
      categories={exploreCategories}
      isChipsPending={!feeds}
    />
  );
  // Left undefined when neither is on so `Feed` keeps its own top slot.
  let topContent = chipsTopContent;
  if (isFeedWidgetsEnabled) {
    topContent = (
      <>
        {/* The wrapper carries the insets, so the skeleton the lazy rail
            shows while it loads sits exactly where the rail lands. */}
        <div className={railClassName}>
          <FeedWidgetRail feedName={feedName} onHide={hideFeedWidgets} />
        </div>
        {feedTabs}
      </>
    );
  } else if (isFeedHeroEnabled) {
    topContent = (
      <>
        <FeedHero
          feedName={feedName}
          className={heroClassName}
          onAdVisibleChange={setIsHeroAdVisible}
          onRenderedChange={setIsHeroRendered}
        />
        {chipsTopContent}
      </>
    );
  }

  // Both pin to the window's bottom edge, so an anonymous visitor gets the
  // signup banner or the sponsor dock, never both. Auth unknown counts as
  // "banner may show": the boot cache readies GrowthBook before the remote
  // boot answers, and the dock must not enroll a visitor it is about to
  // leave.
  const signupBannerGate = usePublicPageSignupBannerGate();
  const hasSignupBannerSlot = !isExtension && isAnyExplore;
  const mayShowSignupBanner = hasSignupBannerSlot && signupBannerGate.mayShow;
  const showSignupBanner = hasSignupBannerSlot && signupBannerGate.shouldShow;
  // Read here rather than inside the strip: this is the one place that owns
  // both bottom surfaces, so the signup banner and dock stay mutually
  // exclusive.
  const isSponsorStripEnabled = useSponsorStrip({
    feedName,
    disableAds: feedProps?.disableAds,
    suppressed: mayShowSignupBanner,
  });
  const v2ActionButtons = feedProps?.actionButtons;
  const showFeedV2PageHeader =
    isLaptopLayout &&
    !showExploreV2PageHeader &&
    !isSearchPageLaptop &&
    (!!pageHeaderContent ||
      (!isFeedWidgetsEnabled && (!!v2ActionButtons || !!feedHeading)));

  const tunePreviewKey = tuneDraft ? feedProps?.feedQueryKey : undefined;

  return (
    <FeedTuneProvider
      baseQueryKey={
        tunePreviewKey ? tunePreviewKey.slice(0, -1) : feedProps?.feedQueryKey
      }
      previewQueryKey={tunePreviewKey}
    >
      {showExploreV2PageHeader && (
        <header className={classNames(pageHeaderClassName, '!py-0')}>
          {/* Sort options as pill tabs — same navbar as the Tags / Squad
              directory pages, not the underlined TabContainer. `tab`/
              `onTabChange` are the same pair tablet hands FeedExploreHeader, so
              the extension switches the feed in place here too. */}
          <FeedExploreTabs tab={tab} setTab={onTabChange} />
        </header>
      )}
      {isProviderSearch && searchQuery && (
        <header
          className={classNames(
            pageHeaderClassName,
            'hidden !py-0 tablet:flex',
          )}
        >
          <SearchProviderNavbar query={searchQuery} provider={searchProvider} />
        </header>
      )}
      {showFeedV2PageHeader && (
        <header
          className={classNames(
            pageHeaderClassName,
            '!py-0',
            // The floating card clips with `overflow-clip`, so a sticky
            // descendant pins to the viewport under the fixed chrome.
            !!pageHeaderContent &&
              'sticky top-[var(--sticky-header-offset)] z-3 bg-background-default',
          )}
        >
          {pageHeaderContent || v2ActionButtons || (
            <strong className="min-w-0 flex-1 truncate typo-callout">
              {feedHeading}
            </strong>
          )}
        </header>
      )}
      <FeedPageLayoutComponent
        className={classNames(
          'relative',
          disableTopPadding && '!pt-0',
          // Room for Tune beside the feed, or under it on a phone.
          isTuning && (isLaptop ? 'pr-[28rem]' : 'pb-[60vh]'),
        )}
      >
        {isExploreRoot && (!hasMounted || isPhoneWidth) && (
          <div className="tablet:hidden">
            <ExploreSortMenu />
            <SpotlightField />
          </div>
        )}
        {isAnyExplore && !showExploreV2PageHeader && !isPhone && (
          <div className="hidden tablet:contents">
            <FeedExploreComponent />
          </div>
        )}
        {isSearchOn && !isSearchPageLaptop && search}
        {isSearchOn && !isSearchPageLaptop && isPhone && (
          <>
            <ShellPage
              title={searchQuery || 'Search'}
              actions={
                !isProviderSearch && <SearchMobileFiltersButton square />
              }
              row={searchProviderSegments}
            />
            <SpotlightField query={searchQuery || undefined} />
          </>
        )}
        {isSearchOn && !isSearchPageLaptop && !isPhone && !isProviderSearch && (
          <div
            className={classNames(
              'mb-3 hidden justify-end px-4 tablet:flex',
              feedWidthClassName,
            )}
            style={feedWidthStyle}
          >
            <SearchMobileFiltersButton />
          </div>
        )}
        {isSearchOn && isFinder && !isSearchPageLaptop && !isProviderSearch && (
          <AskSearchBanner className="mx-4 mb-4" />
        )}
        {!isExtension && isHomePage && (
          <WebappShortcutsRow className="px-4 pb-2" />
        )}
        {isProviderSearch && searchQuery && (
          <SearchProviderResults
            key={searchProvider}
            provider={searchProvider}
            query={searchQuery}
          />
        )}
        {feedProps && (
          <Feed
            {...feedProps}
            shortcuts={shortcuts}
            topContent={topContent}
            // The flag, not the hero's render: this placement logs an
            // impression, so it has to be suppressed from the first paint
            // rather than flickering in and out as the hero resolves.
            disableTopHero={isFeedHeroEnabled}
            keepTopHero={isFeedWidgetsEnabled}
            // The render, so a hero that finds no headlines hands the
            // highlights card and row one back to the grid.
            disableHighlightCards={
              isHeroRendered || widgetFeedState.hasHappeningNow
            }
            skipFirstAd={isHeroAdVisible || widgetFeedState.isAdVisible}
            deferWideCards={isHeroRendered || widgetFeedState.hasTopStory}
            excludedPostIds={widgetFeedState.excludedPostIds}
            className={classNames(
              !isFinder && feedGutter,
              isAwaitingFeatures && 'invisible',
            )}
          />
        )}
        {isExplainFeed && !isTuning && <FeedExplainBar />}
        {isFeedPending && isPhone && (
          <>
            {/* Where the rail lands once the feed can render, so the
                placeholders below it stay put. */}
            {isFeedWidgetsEnabled && (
              <>
                <div className={railClassName}>
                  <FeedWidgetRailLoading />
                </div>
                {feedTabs}
              </>
            )}
            <PlaceholderFeed
              className={classNames(
                !isFinder && feedGutter,
                isFeedWidgetsEnabled && '!mt-0',
                isAwaitingFeatures && 'invisible',
              )}
            />
          </>
        )}
        {children}
        {showSignupBanner && <PublicPageSignupBanner />}
      </FeedPageLayoutComponent>
      {/* Docked outside the page container so it spans the feed column and
          pins to the window, and mounted here rather than in each app's
          MainFeedPage because this is the one component both the webapp and
          the extension new tab render — and the only place the feed name is
          already resolved from `default` to the reader's own feed. */}
      {isSponsorStripEnabled && <SponsorStrip />}
      {isTuning && (
        <FeedTunePanel version={explainVersion} isSheet={!isLaptop} />
      )}
    </FeedTuneProvider>
  );
}
