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
import { FeedPage, FeedPageLayoutV1, SharedFeedPage } from './utilities';
import {
  ANONYMOUS_FEED_QUERY,
  FEED_QUERY,
  MOST_DISCUSSED_FEED_QUERY,
  MOST_UPVOTED_FEED_QUERY,
  PREVIEW_FEED_QUERY,
  SEARCH_POSTS_QUERY,
} from '../graphql/feed';
import { OtherFeedPage, RequestKey, generateQueryKey } from '../lib/query';
import SettingsContext from '../contexts/SettingsContext';
import usePersistentContext from '../hooks/usePersistentContext';
import AlertContext from '../contexts/AlertContext';
import { useFeature } from './GrowthBookProvider';
import { OnboardingV4dot5 } from '../lib/featureValues';
import {
  algorithms,
  LayoutHeader,
  periods,
  SearchControlHeader,
  SearchControlHeaderProps,
} from './layout/common';
import { useFeedName } from '../hooks/feed/useFeedName';
import { useFeedLayout, useScrollRestoration } from '../hooks';
import { feature } from '../lib/featureManagement';
import { isDevelopment } from '../lib/constants';
import { FeedContainerProps } from './feeds';
import { getFeedName } from '../lib/feed';
import useFeedSettings from '../hooks/useFeedSettings';
import { OnboardingFeedHeader } from './onboarding/OnboardingFeedHeader';
import { REQUIRED_TAGS_THRESHOLD } from './onboarding/common';

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

const DEFAULT_ALGORITHM_KEY = 'feed:algorithm';

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
  const { alerts } = useContext(AlertContext);
  const feedName = getFeedName(feedNameProp, {
    hasFiltered: !alerts?.filter,
    hasUser: !!user,
  });
  const feedVersion = useFeature(feature.feedVersion);
  const onboardingV4dot5 = useFeature(feature.onboardingV4dot5);
  const isOnboardingV4dot5 = onboardingV4dot5 === OnboardingV4dot5.V4dot5;
  const { isUpvoted, isSortableFeed } = useFeedName({ feedName });
  const { shouldUseFeedLayoutV1 } = useFeedLayout();
  const { feedSettings } = useFeedSettings();

  const isOnboardingFeed =
    isOnboardingV4dot5 && alerts?.filter && feedName === SharedFeedPage.MyFeed;

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
  };
  const search = (
    <LayoutHeader>
      {navChildren}
      {isSearchOn && searchChildren ? searchChildren : undefined}
    </LayoutHeader>
  );

  const feedProps = useMemo<FeedProps<unknown>>(() => {
    const feedWithActions = isUpvoted || isSortableFeed;
    // in v1 search by default we do not show any results but empty state
    // so returning false so feed does not do any requests
    if (isSearchOn && !searchQuery) {
      return null;
    }

    if (isOnboardingFeed) {
      return {
        feedName: OtherFeedPage.Preview,
        feedQueryKey: [RequestKey.FeedPreview, user?.id],
        query: PREVIEW_FEED_QUERY,
        forceCardMode: true,
        showSearch: false,
        options: { refetchOnMount: true },
      };
    }

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
      header: null,
      actionButtons: feedWithActions && (
        <SearchControlHeader {...searchProps} />
      ),
      shortcuts,
    };
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    shouldUseFeedLayoutV1,
    isSearchOn,
    searchQuery,
    query.query,
    query.variables,
    isUpvoted,
    selectedPeriod,
  ]);

  useEffect(() => {
    if (!sortingEnabled && selectedAlgo > 0 && loadedSettings && loadedAlgo) {
      setSelectedAlgo(0);
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortingEnabled, selectedAlgo, loadedSettings, loadedAlgo]);

  const FeedPageComponent = shouldUseFeedLayoutV1 ? FeedPageLayoutV1 : FeedPage;

  const disableTopPadding = isFinder || shouldUseFeedLayoutV1;

  const tagsCount = feedSettings?.includeTags?.length || 0;
  const isFeedPreviewEnabled = tagsCount >= REQUIRED_TAGS_THRESHOLD;
  const [isPreviewFeedVisible, setPreviewFeedVisible] = useState(false);

  return (
    <FeedPageComponent
      className={classNames(
        'relative',
        disableTopPadding && '!pt-0',
        isOnboardingFeed && '!p-0',
      )}
    >
      {isOnboardingFeed && (
        <OnboardingFeedHeader
          isPreviewFeedVisible={isPreviewFeedVisible}
          setPreviewFeedVisible={setPreviewFeedVisible}
          isFeedPreviewEnabled={isFeedPreviewEnabled}
          tagsCount={tagsCount}
        />
      )}
      {isSearchOn && search}
      {(isOnboardingFeed
        ? isFeedPreviewEnabled && isPreviewFeedVisible
        : feedProps) && (
        <Feed
          {...feedProps}
          className={classNames(
            shouldUseFeedLayoutV1 && !isFinder && 'laptop:px-6',
            isOnboardingFeed && 'px-6 laptop:px-16',
          )}
        />
      )}
      {children}
    </FeedPageComponent>
  );
}
