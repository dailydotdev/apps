import React, {
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import Feed, { FeedProps } from './Feed';
import AuthContext from '../contexts/AuthContext';
import { LoggedUser } from '../lib/user';
import { SharedFeedPage } from './utilities';
import {
  ANONYMOUS_FEED_QUERY,
  CUSTOM_FEED_QUERY,
  FEED_QUERY,
  MOST_DISCUSSED_FEED_QUERY,
  MOST_UPVOTED_FEED_QUERY,
  PREVIEW_FEED_QUERY,
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
import { feature } from '../lib/featureManagement';
import { isDevelopment } from '../lib/constants';
import { FeedContainerProps } from './feeds';
import { getFeedName } from '../lib/feed';
import CommentFeed from './CommentFeed';
import { COMMENT_FEED_QUERY } from '../graphql/comments';
import { ProfileEmptyScreen } from './profile/ProfileEmptyScreen';
import { Origin } from '../lib/log';
import { ExploreTabs, FeedExploreHeader, tabToUrl, urlToTab } from './header';
import { QueryStateKeys, useQueryState } from '../hooks/utils/useQueryState';
import { FeedExploreDropdown } from './header/FeedExploreDropdown';

const SearchEmptyScreen = dynamic(
  () =>
    import(/* webpackChunkName: "searchEmptyScreen" */ './SearchEmptyScreen'),
);

const FeedEmptyScreen = dynamic(
  () => import(/* webpackChunkName: "feedEmptyScreen" */ './FeedEmptyScreen'),
);

type FeedQueryProps = {
  query: string;
  queryIfLogged?: string;
  variables?: Record<string, unknown>;
};

const propsByFeed: Record<SharedFeedPage & OtherFeedPage, FeedQueryProps> = {
  'my-feed': {
    query: ANONYMOUS_FEED_QUERY,
    queryIfLogged: FEED_QUERY,
  },
  popular: {
    query: ANONYMOUS_FEED_QUERY,
  },
  posts: {
    query: ANONYMOUS_FEED_QUERY,
  },
  search: {
    query: ANONYMOUS_FEED_QUERY,
    queryIfLogged: FEED_QUERY,
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
  },
  [SharedFeedPage.CustomForm]: {
    query: PREVIEW_FEED_QUERY,
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
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { value: mobileExploreTab } = useConditionalFeature({
    feature: feature.mobileExploreTab,
    shouldEvaluate: !isLaptop,
  });
  const feedVersion = useFeature(feature.feedVersion);
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
  const {
    shouldUseListFeedLayout,
    shouldUseCommentFeedLayout,
    FeedPageLayoutComponent,
  } = useFeedLayout();

  const config = useMemo(() => {
    if (!feedName) {
      return { query: null };
    }

    const dynamicPropsByFeed: Partial<
      Record<SharedFeedPage, Partial<FeedQueryProps>>
    > = {
      [SharedFeedPage.Custom]: {
        variables: {
          feedId: router.query?.slugOrId as string,
        },
      },
    };

    return {
      query: getQueryBasedOnLogin(
        tokenRefreshed,
        user,
        propsByFeed[feedName].query,
        propsByFeed[feedName].queryIfLogged,
      ),
      variables: {
        ...propsByFeed[feedName].variables,
        ...dynamicPropsByFeed[feedName]?.variables,
        version: isDevelopment ? 1 : feedVersion,
      },
    };
  }, [feedName, feedVersion, router.query?.slugOrId, tokenRefreshed, user]);

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

  const search = (
    <LayoutHeader className={isSearchPage && 'mt-16 laptop:mt-0'}>
      {navChildren}
      {isSearchOn && searchChildren ? searchChildren : undefined}
    </LayoutHeader>
  );

  const feedProps = useMemo<FeedProps<unknown>>(() => {
    const feedWithActions =
      isUpvoted || isPopular || isSortableFeed || isCustomFeed;
    // in list search by default we do not show any results but empty state
    // so returning false so feed does not do any requests
    if (isSearchOn && !searchQuery) {
      return null;
    }

    if (isSearchOn && searchQuery) {
      const searchVersion = getFeatureValue(feature.searchVersion);
      return {
        feedName: SharedFeedPage.Search,
        feedQueryKey: generateQueryKey(
          SharedFeedPage.Search,
          user,
          searchQuery,
        ),
        query: SEARCH_POSTS_QUERY,
        variables: { query: searchQuery, version: searchVersion },
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
        feedName,
        user,
        ...Object.values(variables ?? {}),
      ),
      query: config.query,
      variables,
      emptyScreen: <FeedEmptyScreen />,
      actionButtons: feedWithActions && (
        <SearchControlHeader
          algoState={[selectedAlgo, setSelectedAlgo]}
          feedName={feedName}
        />
      ),
    };
  }, [
    isUpvoted,
    isPopular,
    isSortableFeed,
    getFeatureValue,
    isCustomFeed,
    isSearchOn,
    searchQuery,
    config.query,
    config.variables,
    isAnyExplore,
    feedName,
    user,
    isLaptop,
    isExploreLatest,
    selectedAlgo,
    tab,
    selectedPeriod,
    setSelectedAlgo,
    router.pathname,
  ]);

  useEffect(() => {
    if (!sortingEnabled && selectedAlgo > 0 && loadedSettings && loadedAlgo) {
      setSelectedAlgo(0);
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortingEnabled, selectedAlgo, loadedSettings, loadedAlgo]);

  const disableTopPadding =
    isFinder || shouldUseListFeedLayout || shouldUseCommentFeedLayout;

  const onTabChange = useCallback(
    (clickedTab: ExploreTabs) => {
      if (onNavTabClick) {
        onNavTabClick(tabToUrl[clickedTab]);
      }

      setTab(clickedTab);
    },
    [onNavTabClick],
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

    if (mobileExploreTab) {
      return (
        <FeedExploreHeader
          tab={tab}
          setTab={onTabChange}
          showBreadcrumbs={false}
          showDropdown={false}
          className={{
            container:
              'sticky top-[7.5rem] z-header w-full border-b border-border-subtlest-tertiary bg-background-default',
            tabBarHeader: 'no-scrollbar overflow-x-auto',
            tabBarContainer: 'w-full',
          }}
        />
      );
    }

    return <FeedExploreDropdown />;
  }, [isLaptop, mobileExploreTab, onTabChange, tab]);

  return (
    <FeedPageLayoutComponent
      className={classNames('relative', disableTopPadding && '!pt-0')}
    >
      {isAnyExplore && <FeedExploreComponent />}
      {isSearchOn && search}
      {shouldUseCommentFeedLayout ? (
        <CommentFeed
          isMainFeed
          feedQueryKey={generateQueryKey(RequestKey.CommentFeed, null)}
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
            className={classNames(
              shouldUseListFeedLayout && !isFinder && 'laptop:px-6',
            )}
          />
        )
      )}
      {children}
    </FeedPageLayoutComponent>
  );
}
