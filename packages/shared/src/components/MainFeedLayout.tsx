import type { ReactElement, ReactNode, SetStateAction } from 'react';
import React, {
  cloneElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import type { FeedProps } from './Feed';
import Feed from './Feed';
import { FeedPageLayoutMobile } from './utilities/common';
import { ExploreChipsBar } from './feeds/ExploreChipsBar';
import { buildPersonalizedCategories } from './feeds/exploreCategories';
import { useFeeds } from '../hooks/feed/useFeeds';
import ReadingReminderHero from './marketing/banners/ReadingReminderHero';
import { WebappShortcutsRow } from '../features/shortcuts/components/WebappShortcutsRow';
import { LiveStandupsStrip } from './liveRooms/LiveStandupsStrip';
import { AskSearchBanner } from './marketing/banners/AskSearchBanner';
import AuthContext from '../contexts/AuthContext';
import type { LoggedUser } from '../lib/user';
import { SharedFeedPage } from './utilities';
import {
  FEED_V2_HIGHLIGHTS_LIMIT,
  ANONYMOUS_FEED_QUERY,
  baseFeedSupportedTypes,
  CUSTOM_FEED_QUERY,
  feedV2SupportedTypes,
  FEED_BY_TAGS_QUERY,
  FEED_V2_QUERY,
  FOLLOWING_FEED_QUERY,
  MOST_DISCUSSED_FEED_QUERY,
  MOST_UPVOTED_FEED_QUERY,
  SEARCH_POSTS_QUERY,
} from '../graphql/feed';
import { generateQueryKey, OtherFeedPage, RequestKey } from '../lib/query';
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
  useScrollRestoration,
  useViewSize,
  ViewSize,
} from '../hooks';
import { feedNameToHeading } from './feeds/FeedContainer';
import { pageHeaderClassName } from './layout/PageHeader';
import {
  customFeedVersion,
  discussedFeedVersion,
  feature,
  featureFeedChips,
  FeedChipsVariant,
  followingFeedVersion,
  latestFeedVersion,
  popularFeedVersion,
  upvotedFeedVersion,
} from '../lib/featureManagement';
import type { FeedContainerProps } from './feeds';
import { getFeedName } from '../lib/feed';
import CommentFeed from './CommentFeed';
import { COMMENT_FEED_QUERY } from '../graphql/comments';
import { ClientQuestEventType } from '../graphql/quests';
import { ProfileEmptyScreen } from './profile/ProfileEmptyScreen';
import { Origin } from '../lib/log';
import { ExploreTabs, tabToUrl, urlToTab } from './header';
import { QueryStateKeys, useQueryState } from '../hooks/utils/useQueryState';
import { useSearchResultsLayout } from '../hooks/search/useSearchResultsLayout';
import useCustomDefaultFeed from '../hooks/feed/useCustomDefaultFeed';
import { useSearchContextProvider } from '../contexts/search/SearchContext';
import { isDevelopment, isProductionAPI, webappUrl } from '../lib/constants';
import { checkIsExtension } from '../lib/func';
import { useReadingReminderHero } from '../hooks/notifications/useReadingReminderHero';
import { useTrackQuestClientEvent } from '../hooks/useTrackQuestClientEvent';
import { useReadingReminderVariation } from '../hooks/notifications/useReadingReminderVariation';
import { useLayoutVariant } from '../hooks/layout/useLayoutVariant';

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
  discussed: {
    query: MOST_DISCUSSED_FEED_QUERY,
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
  [OtherFeedPage.ExploreTag]: {
    query: FEED_BY_TAGS_QUERY,
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
}

const getQueryBasedOnLogin = (
  tokenRefreshed: boolean,
  user: LoggedUser | null,
  query: string,
  queryIfLogged: string | null,
): string | null => {
  if (tokenRefreshed) {
    if (user && queryIfLogged) {
      return queryIfLogged;
    }
    return query;
  }
  return null;
};

const commentClassName = {
  container: 'rounded-none border-0 border-b tablet:border-x',
  commentBox: {
    container: 'relative border-0 rounded-none',
  },
};

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
}: MainFeedLayoutProps): ReactElement {
  useScrollRestoration();
  const { sortingEnabled, loadedSettings } = useContext(SettingsContext);
  const { user, tokenRefreshed } = useContext(AuthContext);
  const { alerts } = useContext(AlertContext);
  const router = useRouter();
  const [tab, setTab] = useState(ExploreTabs.Popular);
  const { getFeatureValue } = useFeaturesReadyContext();
  const feedName = getFeedName(feedNameProp, {
    hasFiltered: !alerts?.filter,
    hasUser: !!user,
  });
  const { isCustomDefaultFeed, defaultFeedId } = useCustomDefaultFeed();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { isV2 } = useLayoutVariant();
  const feedVersion = useFeature(feature.feedVersion);
  const { time, contentCurationFilter } = useSearchContextProvider();
  const {
    shouldShow: shouldShowReadingReminder,
    title: readingReminderTitle,
    subtitle: readingReminderSubtitle,
    onEnable,
    onDismiss,
  } = useReadingReminderHero();
  const isExtension = checkIsExtension();
  const isHomePage = router.pathname === webappUrl;
  const shouldEvaluateReminderPlacement =
    isHomePage && shouldShowReadingReminder;
  const { isControl: isControlVariation } = useReadingReminderVariation({
    shouldEvaluate: shouldEvaluateReminderPlacement,
  });
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
  useTrackQuestClientEvent({
    eventType: ClientQuestEventType.VisitDiscussionsPage,
    enabled: feedName === OtherFeedPage.Discussed,
  });
  const {
    shouldUseListFeedLayout: shouldUseListFeedLayoutRaw,
    shouldUseCommentFeedLayout,
    FeedPageLayoutComponent: FeedPageLayoutComponentRaw,
  } = useFeedLayout();

  // SSR renders /explore/[tag] with FeedPageLayoutMobile. On client hydration with
  // a laptop viewport the layout swaps to FeedPage, which causes a hydration
  // Done just for explore tag for now to avoid impact other pages
  const isExploreTag = feedName === OtherFeedPage.ExploreTag;
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  const enableSsrSafeLayout = isExploreTag && !hasMounted;
  const FeedPageLayoutComponent = enableSsrSafeLayout
    ? FeedPageLayoutMobile
    : FeedPageLayoutComponentRaw;
  const shouldUseListFeedLayout = enableSsrSafeLayout
    ? true
    : shouldUseListFeedLayoutRaw;

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

  const isChipStripPage =
    router.pathname === '/' ||
    router.pathname === '/my-feed' ||
    router.pathname === '/explore/[tag]' ||
    router.pathname === '/feeds/[slugOrId]' ||
    router.pathname === '/feeds/[slugOrId]/edit';
  const { value: feedChipsVariant } = useConditionalFeature({
    feature: featureFeedChips,
    shouldEvaluate: !!user && isLaptop && isChipStripPage,
  });
  const isFeedChipsEnabled = feedChipsVariant === FeedChipsVariant.V2;
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
        <ExploreChipsBar
          categories={exploreCategories}
          isPending={!feeds}
          compact={isV2}
        />
      ) : null,
    [showExploreChips, exploreCategories, feeds, isV2],
  );

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
      [OtherFeedPage.ExploreTag]: {
        variables: {
          tags: router.query?.tag ? [router.query.tag as string] : [],
          supportedTypes: baseFeedSupportedTypes,
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
      tokenRefreshed,
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
    router.query?.tag,
    router.pathname,
    user,
    myFeedV,
    followingFeedV,
    exploreFeedV,
    exploreUpvotedFeedV,
    exploreDiscussedFeedV,
    exploreLatestFeedV,
    customFeedV,
    tokenRefreshed,
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
    const isExploreTagFeed = feedName === OtherFeedPage.ExploreTag;
    const feedWithActions =
      isUpvoted ||
      isPopular ||
      isSortableFeed ||
      isCustomFeed ||
      isExploreTagFeed;
    // in list search by default we do not show any results but empty state
    // so returning false so feed does not do any requests
    if (isSearchOn && !searchQuery) {
      return null;
    }

    // Wait for both algorithm (from IndexedDB) and tokenRefreshed (from boot) to load
    // before making sortable feed requests to prevent double queries
    if (isSortableFeed && (!loadedAlgo || !tokenRefreshed)) {
      return null;
    }

    const baseEmptyScreen = propsByFeed[feedName]?.emptyScreen || (
      <FeedEmptyScreen />
    );
    const emptyScreenWithChips = cloneElement(
      baseEmptyScreen as ReactElement<{ chips?: ReactNode }>,
      { chips: chipsNode },
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
        emptyScreen: emptyScreenWithChips,
        actionButtons: feedWithActions && (
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
      const searchVersion = getFeatureValue(feature.searchVersion);
      return {
        feedName: SharedFeedPage.Search,
        feedQueryKey: generateQueryKey(
          SharedFeedPage.Search,
          user,
          searchQuery,
          contentCurationFilter,
          time,
        ),
        query: SEARCH_POSTS_QUERY,
        variables: {
          query: searchQuery,
          version: searchVersion,
          contentCuration: contentCurationFilter,
          time,
        },
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

    const variables = getVariables();

    return {
      feedName,
      feedQueryKey: generateQueryKey(
        config.requestKey || feedName,
        user,
        ...Object.values(variables ?? {}),
      ),
      query: config.query,
      variables,
      emptyScreen: emptyScreenWithChips,
      actionButtons: feedWithActions && (
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
    getFeatureValue,
    contentCurationFilter,
    time,
    tab,
    router.pathname,
    isAnyExplore,
    selectedPeriod,
    isExploreLatest,
    isLaptop,
    loadedAlgo,
    tokenRefreshed,
  ]);

  useEffect(() => {
    if (!sortingEnabled && selectedAlgo > 0 && loadedSettings && loadedAlgo) {
      setSelectedAlgo(0);
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortingEnabled, selectedAlgo, loadedSettings, loadedAlgo]);

  const disableTopPadding = isFinder || shouldUseListFeedLayout;
  const shouldShowReadingReminderOnHomepage =
    shouldEvaluateReminderPlacement && isControlVariation;

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
    if (isLaptop) {
      return (
        <FeedExploreHeader
          tab={tab}
          setTab={onTabChange}
          className={{ tabWrapper: 'my-4' }}
        />
      );
    }

    return (
      <FeedExploreHeader
        tab={tab}
        setTab={onTabChange}
        showBreadcrumbs={false}
        className={{
          container:
            'sticky top-[4.5rem] z-header w-full border-b border-border-subtlest-tertiary bg-background-default',
          tabBarHeader: 'no-scrollbar overflow-x-auto',
          tabBarContainer: 'min-w-0 flex-1',
        }}
      />
    );
  }, [isLaptop, onTabChange, tab]);

  // v2 hoists the explore section tabs into the floating card's
  // page-header strip (matching the SquadDirectoryLayout pattern). The
  // inline FeedExploreComponent is suppressed below to avoid showing
  // the same tabs twice.
  const showExploreV2PageHeader = isAnyExplore && isV2;

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
  const v2ActionButtons = feedProps?.actionButtons;
  const showFeedV2PageHeader =
    isV2 &&
    !showExploreV2PageHeader &&
    !isSearchPageLaptop &&
    (!!v2ActionButtons || !!feedHeading);

  return (
    <>
      {showExploreV2PageHeader && (
        <header className={classNames(pageHeaderClassName, '!py-0')}>
          <FeedExploreHeader
            tab={tab}
            setTab={onTabChange}
            showBreadcrumbs={false}
            className={{
              container: 'min-w-0 flex-1',
              tabBarHeader: '!border-0',
            }}
          />
        </header>
      )}
      {showFeedV2PageHeader && (
        <header className={pageHeaderClassName}>
          {v2ActionButtons || (
            <strong className="min-w-0 flex-1 truncate typo-callout">
              {feedHeading}
            </strong>
          )}
        </header>
      )}
      <FeedPageLayoutComponent
        className={classNames('relative', disableTopPadding && '!pt-0')}
      >
        {isAnyExplore && !showExploreV2PageHeader && <FeedExploreComponent />}
        {isSearchOn && !isSearchPageLaptop && search}
        {isSearchOn && isFinder && !isSearchPageLaptop && (
          <AskSearchBanner className="mx-4 mb-4" />
        )}
        {shouldShowReadingReminderOnHomepage && (
          <ReadingReminderHero
            className="px-4 pb-2"
            title={readingReminderTitle}
            subtitle={readingReminderSubtitle}
            onEnable={onEnable}
            onDismiss={onDismiss}
          />
        )}
        {isHomePage && (
          <LiveStandupsStrip className="mx-0 mb-3 tablet:mx-2 laptop:mx-0" />
        )}
        {!isExtension && isHomePage && (
          <WebappShortcutsRow className="px-4 pb-2" />
        )}
        {shouldUseCommentFeedLayout ? (
          <CommentFeed
            isMainFeed
            feedQueryKey={generateQueryKey(RequestKey.CommentFeed, undefined)}
            query={COMMENT_FEED_QUERY}
            logOrigin={Origin.CommentFeed}
            emptyScreen={
              <ProfileEmptyScreen
                title="Nobody has replied to any post yet"
                text="You could be the first you know?"
              />
            }
            commentClassName={commentClassName}
          />
        ) : (
          feedProps && (
            <Feed
              {...feedProps}
              shortcuts={shortcuts}
              topContent={
                (isExploreTag || shouldUseListFeedLayout) && chipsNode ? (
                  <div
                    className={classNames(
                      'mb-8 w-full',
                      shouldUseListFeedLayout && 'mt-8',
                    )}
                  >
                    {chipsNode}
                  </div>
                ) : undefined
              }
              className={classNames(
                shouldUseListFeedLayout && !isFinder && 'laptop:px-6',
              )}
            />
          )
        )}
        {children}
      </FeedPageLayoutComponent>
    </>
  );
}
