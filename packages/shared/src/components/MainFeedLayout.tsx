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
import Feed, { FeedProps } from './Feed';
import AuthContext from '../contexts/AuthContext';
import { LoggedUser } from '../lib/user';
import { FeedPage, SharedFeedPage } from './utilities';
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
import { FeedContainerProps } from './feeds';

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

export interface MainFeedLayoutProps
  extends Pick<FeedContainerProps, 'shortcuts'> {
  feedName: string;
  isSearchOn: boolean;
  searchQuery?: string;
  children?: ReactNode;
  searchChildren: ReactNode;
  navChildren?: ReactNode;
  onFeedPageChanged: (page: SharedFeedPage) => void;
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
  shortcuts,
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
  const { shouldUseFeedLayoutV1 } = useFeedLayout({ feedName });
  const feedVersion = useFeature(feature.feedVersion);
  const searchVersion = useFeature(feature.search);
  const isV1Search = searchVersion === SearchExperiment.V1;
  const { isUpvoted, isSortableFeed } = useFeedName({ feedName, isSearchOn });

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
    const feedWithActions = isUpvoted || isSortableFeed;

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
      header: searchVersion === SearchExperiment.Control && !isSearchOn && (
        <SearchControlHeader {...searchProps} navChildren={navChildren} />
      ),
      actionButtons: isV1Search && feedWithActions && (
        <SearchControlHeader {...searchProps} />
      ),
      shortcuts,
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

  const isBothLayoutV1 = shouldUseFeedLayoutV1 && isV1Search && !isFinder;

  return (
    <FeedPage className="relative">
      {isV1Search && !isFinder && (
        <img
          className={classNames(
            'absolute top-0 w-full max-w-[58.75rem]',
            shouldUseFeedLayoutV1 ? 'left-1/2 -translate-x-1/2' : 'left-0',
          )}
          src={getImage()}
          alt="Gradient background"
        />
      )}
      {isSearchOn && search}
      {feedProps && (
        <Feed
          {...feedProps}
          className={isBothLayoutV1 && 'laptop:!max-w-[36.5rem]'}
        />
      )}
      {children}
    </FeedPage>
  );
}
