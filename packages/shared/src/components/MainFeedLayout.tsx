import React, {
  ReactElement,
  ReactNode,
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
import { generateQueryKey, RequestKey } from '../lib/query';
import SettingsContext from '../contexts/SettingsContext';
import usePersistentContext from '../hooks/usePersistentContext';
import AlertContext from '../contexts/AlertContext';
import { useFeature, useFeaturesReadyContext } from './GrowthBookProvider';
import {
  algorithms,
  algorithmsList,
  DEFAULT_ALGORITHM_INDEX,
  DEFAULT_ALGORITHM_KEY,
  LayoutHeader,
  periods,
  SearchControlHeader,
} from './layout/common';
import { useFeedName } from '../hooks/feed/useFeedName';
import {
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
import { ExploreTabs, FeedExploreHeader, urlToTab } from './header';
import { Dropdown } from './fields/Dropdown';
import { QueryStateKeys, useQueryState } from '../hooks/utils/useQueryState';

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

const propsByFeed: Record<SharedFeedPage, FeedQueryProps> = {
  'my-feed': {
    query: ANONYMOUS_FEED_QUERY,
    queryIfLogged: FEED_QUERY,
  },
  popular: {
    query: ANONYMOUS_FEED_QUERY,
  },
  explore: {
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
  [SharedFeedPage.ExploreLatest]: {
    query: ANONYMOUS_FEED_QUERY,
  },
  [SharedFeedPage.ExploreUpvoted]: {
    query: MOST_UPVOTED_FEED_QUERY,
  },
  [SharedFeedPage.ExploreDiscussed]: {
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
}: MainFeedLayoutProps): ReactElement {
  useScrollRestoration();
  const { sortingEnabled, loadedSettings } = useContext(SettingsContext);
  const { user, tokenRefreshed } = useContext(AuthContext);
  const { getFeatureValue } = useFeaturesReadyContext();
  const { alerts } = useContext(AlertContext);
  const router = useRouter();
  const [tab, setTab] = useState(ExploreTabs.Popular);
  const isSearchPage = !!router.pathname?.startsWith('/search');
  const feedName = getFeedName(feedNameProp, {
    hasFiltered: !alerts?.filter,
    hasUser: !!user,
  });
  const isLaptop = useViewSize(ViewSize.Laptop);
  const feedVersion = useFeature(feature.feedVersion);
  const {
    isUpvoted,
    isPopular,
    isAnyExplore,
    isExplorePopular,
    isExploreLatest,
    isSortableFeed,
    isCustomFeed,
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
        const finalAlgo = isLaptop ? laptopValue : selectedAlgo;
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
    const mobileExploreActions = !isLaptop &&
      (isExplorePopular || isExploreLatest) && (
        <Dropdown
          className={{ container: 'mx-4 mb-2 !w-56' }}
          selectedIndex={selectedAlgo}
          options={algorithmsList}
          onChange={(_, index) => setSelectedAlgo(index)}
        />
      );
    const controlFeedActions = feedWithActions && (
      <SearchControlHeader
        algoState={[selectedAlgo, setSelectedAlgo]}
        feedName={feedName}
      />
    );

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
      actionButtons: isAnyExplore ? mobileExploreActions : controlFeedActions,
    };
  }, [
    isUpvoted,
    isPopular,
    isSortableFeed,
    isCustomFeed,
    isSearchOn,
    searchQuery,
    config.query,
    config.variables,
    isAnyExplore,
    feedName,
    user,
    isLaptop,
    isExplorePopular,
    isExploreLatest,
    selectedAlgo,
    getFeatureValue,
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

  return (
    <FeedPageLayoutComponent
      className={classNames('relative', disableTopPadding && '!pt-0')}
    >
      {isAnyExplore && isLaptop && (
        <FeedExploreHeader tab={tab} setTab={setTab} />
      )}
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
