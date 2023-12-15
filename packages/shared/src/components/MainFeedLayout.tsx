import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import Feed, { FeedProps } from './Feed';
import AuthContext from '../contexts/AuthContext';
import { LoggedUser } from '../lib/user';
import { FeedPage, FeedPageLayoutV1, SharedFeedPage } from './utilities';
import {
  ANONYMOUS_FEED_QUERY,
  FEED_QUERY,
  MOST_DISCUSSED_FEED_QUERY,
  MOST_UPVOTED_FEED_QUERY,
  SEARCH_POSTS_QUERY,
} from '../graphql/feed';
import { generateQueryKey } from '../lib/query';
import SettingsContext from '../contexts/SettingsContext';
import usePersistentContext from '../hooks/usePersistentContext';
import AlertContext from '../contexts/AlertContext';
import { useFeature } from './GrowthBookProvider';
import { SearchExperiment } from '../lib/featureValues';
import {
  algorithms,
  LayoutHeader,
  periods,
  SearchControlHeader,
  SearchControlHeaderProps,
} from './layout/common';
import { useFeedName } from '../hooks/feed/useFeedName';
import { cloudinary } from '../lib/image';
import { useFeedLayout, useViewSize, ViewSize } from '../hooks';
import { feature } from '../lib/featureManagement';
import { isDevelopment } from '../lib/constants';

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
};

export type MainFeedLayoutProps = {
  feedName: string;
  isSearchOn: boolean;
  searchQuery?: string;
  children?: ReactNode;
  searchChildren: ReactNode;
  besideSearch?: ReactNode;
  navChildren?: ReactNode;
  onFeedPageChanged: (page: SharedFeedPage) => void;
  isFinder?: boolean;
};

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

const DEFAULT_ALGORITHM_KEY = 'feed:algorithm';

interface GetDefaultFeedProps {
  hasFiltered?: boolean;
  hasUser?: boolean;
}

const getDefaultFeed = ({ hasUser }: GetDefaultFeedProps): SharedFeedPage => {
  if (!hasUser) {
    return SharedFeedPage.Popular;
  }

  return SharedFeedPage.MyFeed;
};

const defaultFeedConditions = [null, 'default', '/', ''];

export const getFeedName = (
  path: string,
  options: GetDefaultFeedProps = {},
): SharedFeedPage => {
  const feed = path?.replaceAll?.('/', '') || '';

  if (defaultFeedConditions.some((condition) => condition === feed)) {
    return getDefaultFeed(options);
  }

  const [page] = feed.split('?');

  return page.replace(/^\/+/, '') as SharedFeedPage;
};

export default function MainFeedLayout({
  feedName: feedNameProp,
  searchQuery,
  isSearchOn,
  children,
  searchChildren,
  besideSearch,
  onFeedPageChanged,
  navChildren,
  isFinder,
}: MainFeedLayoutProps): ReactElement {
  const { sortingEnabled, loadedSettings } = useContext(SettingsContext);
  const { user, tokenRefreshed } = useContext(AuthContext);
  const { alerts } = useContext(AlertContext);
  const feedName = getFeedName(feedNameProp, {
    hasFiltered: !alerts?.filter,
    hasUser: !!user,
  });
  const feedVersion = useFeature(feature.feedVersion);
  const searchVersion = useFeature(feature.search);
  const { isUpvoted, isSortableFeed } = useFeedName({ feedName, isSearchOn });
  // TODO: seems like in a lot of places we are not aware of the feed context as that is initiated on the Feed...should we move context higher up? or get rid of using it in the hook?
  const { shouldUseFeedLayoutV1 } = useFeedLayout({ feedName });

  let query: { query: string; variables?: Record<string, unknown> };
  if (feedName) {
    query = {
      query: getQueryBasedOnLogin(
        tokenRefreshed,
        user,
        propsByFeed[feedName].query,
        propsByFeed[feedName].queryIfLogged,
      ),
      variables: {
        ...propsByFeed[feedName].variables,
        version: isDevelopment ? 1 : feedVersion,
      },
    };
  } else {
    query = { query: null };
  }

  const [selectedAlgo, setSelectedAlgo, loadedAlgo] = usePersistentContext(
    DEFAULT_ALGORITHM_KEY,
    0,
    [0, 1],
    0,
  );
  const periodState = useState(0);
  const [selectedPeriod] = periodState;
  const searchProps: SearchControlHeaderProps = {
    algoState: [selectedAlgo, setSelectedAlgo],
    periodState,
    feedName,
    onFeedPageChanged,
    isSearchOn,
  };
  const search = (
    <LayoutHeader>
      {navChildren}
      {isSearchOn ? searchChildren : undefined}
    </LayoutHeader>
  );

  const feedProps = useMemo<FeedProps<unknown>>(() => {
    if (isSearchOn && searchQuery) {
      return {
        feedName: SharedFeedPage.Search,
        feedQueryKey: generateQueryKey(
          SharedFeedPage.Search,
          user,
          searchQuery,
        ),
        query: SEARCH_POSTS_QUERY,
        variables: { query: searchQuery },
        emptyScreen: <SearchEmptyScreen />,
      };
    }
    if (!query.query) {
      return null;
    }

    const getVariables = () => {
      if (isUpvoted) {
        return { ...query.variables, period: periods[selectedPeriod].value };
      }

      if (isSortableFeed) {
        return {
          ...query.variables,
          ranking: algorithms[selectedAlgo].value,
        };
      }

      return query.variables;
    };

    const variables = getVariables();

    return {
      feedName,
      feedQueryKey: generateQueryKey(
        feedName,
        user,
        ...Object.values(variables ?? {}),
      ),
      query: query.query,
      variables,
      emptyScreen: <FeedEmptyScreen />,
      header:
        searchVersion === SearchExperiment.Control && !isSearchOn ? (
          <SearchControlHeader {...searchProps} navChildren={navChildren} />
        ) : null,
      actionButtons:
        searchVersion === SearchExperiment.V1 &&
        (isUpvoted || isSortableFeed) ? (
          <SearchControlHeader {...searchProps} />
        ) : null,
      besideSearch,
    };
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchVersion,
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
    isSearchOn && searchQuery,
    query.query,
    query.variables,
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
    isUpvoted && selectedPeriod,
  ]);

  useEffect(() => {
    if (!sortingEnabled && selectedAlgo > 0 && loadedSettings && loadedAlgo) {
      setSelectedAlgo(0);
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortingEnabled, selectedAlgo, loadedSettings, loadedAlgo]);

  const isMobile = useViewSize(ViewSize.MobileL);
  const isLaptop = useViewSize(ViewSize.Laptop);

  const getImage = () => {
    if (isMobile) {
      return cloudinary.feed.bg.mobile;
    }

    return isLaptop ? cloudinary.feed.bg.laptop : cloudinary.feed.bg.tablet;
  };

  const FeedPageComponent = shouldUseFeedLayoutV1 ? FeedPageLayoutV1 : FeedPage;

  return (
    <FeedPageComponent className="relative">
      {searchVersion === SearchExperiment.V1 && !isFinder && (
        <img
          className="absolute top-0 left-0 w-full max-w-[58.75rem]"
          src={getImage()}
          alt="Gradient background"
        />
      )}
      {isSearchOn && search}
      {feedProps && <Feed {...feedProps} />}
      {children}
    </FeedPageComponent>
  );
}
