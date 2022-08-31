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
import { Dropdown } from './fields/Dropdown';
import { FeedPage } from './utilities';
import CalendarIcon from './icons/Calendar';
import {
  ANONYMOUS_FEED_QUERY,
  FEED_QUERY,
  MOST_DISCUSSED_FEED_QUERY,
  MOST_UPVOTED_FEED_QUERY,
  MyFeedMode,
  RankingAlgorithm,
  SEARCH_POSTS_QUERY,
} from '../graphql/feed';
import FeaturesContext from '../contexts/FeaturesContext';
import { generateQueryKey } from '../lib/query';
import { Features, getFeatureValue } from '../lib/featureManagement';
import classed from '../lib/classed';
import { useMyFeed } from '../hooks/useMyFeed';
import useDefaultFeed from '../hooks/useDefaultFeed';
import SettingsContext from '../contexts/SettingsContext';
import usePersistentContext from '../hooks/usePersistentContext';
import CreateMyFeedButton from './CreateMyFeedButton';
import { useDynamicLoadedAnimation } from '../hooks/useDynamicLoadAnimated';
import FeedFilters from './filters/FeedFilters';
import AlertContext from '../contexts/AlertContext';
import CreateMyFeedModal from './modals/CreateMyFeedModal';
import AnalyticsContext from '../contexts/AnalyticsContext';

const SearchEmptyScreen = dynamic(
  () => import(/* webpackChunkName: "emptySearch" */ './SearchEmptyScreen'),
);
const FeedEmptyScreen = dynamic(
  () => import(/* webpackChunkName: "feedEmpty" */ './FeedEmptyScreen'),
);

type FeedQueryProps = {
  query: string;
  queryIfLogged?: string;
  variables?: Record<string, unknown>;
};

interface FeedOptionalParams {
  shouldShowMyFeed?: boolean;
}

const getPropsByFeed = ({
  shouldShowMyFeed = false,
}: FeedOptionalParams = {}): Record<string, FeedQueryProps> => {
  return {
    'my-feed': {
      query: ANONYMOUS_FEED_QUERY,
      queryIfLogged: FEED_QUERY,
    },
    popular: {
      query: ANONYMOUS_FEED_QUERY,
      queryIfLogged: shouldShowMyFeed ? ANONYMOUS_FEED_QUERY : FEED_QUERY,
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
};

const LayoutHeader = classed(
  'header',
  'flex justify-between items-center overflow-x-auto relative justify-between mb-6 min-h-14 w-full no-scrollbar',
);

export const getShouldRedirect = (
  isOnMyFeed: boolean,
  isLoggedIn: boolean,
): boolean => {
  if (!isOnMyFeed) {
    return false;
  }

  if (!isLoggedIn) {
    return true;
  }

  return false;
};

export type MainFeedLayoutProps = {
  feedName: string;
  isSearchOn: boolean;
  searchQuery?: string;
  children?: ReactNode;
  searchChildren: ReactNode;
  navChildren?: ReactNode;
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

const algorithms = [
  { value: RankingAlgorithm.Popularity, text: 'Recommended' },
  { value: RankingAlgorithm.Time, text: 'By date' },
];
const algorithmsList = algorithms.map((algo) => algo.text);
const DEFAULT_ALGORITHM_KEY = 'feed:algorithm';
const FIRST_TIME_SESSION = 'firstTimeSession';

const periods = [
  { value: 7, text: 'Last week' },
  { value: 30, text: 'Last month' },
  { value: 365, text: 'Last year' },
];
const periodTexts = periods.map((period) => period.text);

export default function MainFeedLayout({
  feedName: feedNameProp,
  searchQuery,
  isSearchOn,
  children,
  searchChildren,
  navChildren,
}: MainFeedLayoutProps): ReactElement {
  const { shouldShowMyFeed } = useMyFeed();
  const [defaultFeed, updateDefaultFeed] = useDefaultFeed(shouldShowMyFeed);
  const { sortingEnabled, loadedSettings } = useContext(SettingsContext);
  const { user, tokenRefreshed, isFirstVisit } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const { flags } = useContext(FeaturesContext);
  const { alerts } = useContext(AlertContext);
  const popularFeedCopy = getFeatureValue(Features.PopularFeedCopy, flags);
  const {
    isLoaded,
    isAnimated,
    setLoaded: openFeedFilters,
    setHidden,
  } = useDynamicLoadedAnimation();
  const [createMyFeed, setCreateMyFeed] = useState(false);
  const [myFeedMode, setMyFeedMode] = useState<MyFeedMode>(MyFeedMode.Manual);

  const feedTitles = {
    'my-feed': 'My feed',
    popular: popularFeedCopy,
    upvoted: 'Most upvoted',
    discussed: 'Best discussions',
  };
  const feedVersion = parseInt(
    getFeatureValue(Features.FeedVersion, flags),
    10,
  );
  const myFeedOnboardingVersion = getFeatureValue(
    Features.MyFeedOnboardingVersion,
    flags,
  );
  const feedName = feedNameProp === 'default' ? defaultFeed : feedNameProp;
  const isMyFeed = feedName === 'my-feed';
  const propsByFeed = getPropsByFeed({ shouldShowMyFeed });

  const [isFirstSession, setIsFirstSession, isSessionLoaded] =
    usePersistentContext(FIRST_TIME_SESSION, isFirstVisit);

  useEffect(() => {
    if (user) {
      setCreateMyFeed(false);
      setIsFirstSession(false);
      setMyFeedMode(MyFeedMode.Manual);
    } else if (
      isFirstSession &&
      isSessionLoaded &&
      myFeedOnboardingVersion !== 'control'
    ) {
      setIsFirstSession(true);
      setMyFeedMode(MyFeedMode.Auto);
      setCreateMyFeed(true);
    }
  }, [isSessionLoaded, user]);

  useEffect(() => {
    if (
      defaultFeed !== null &&
      feedName !== null &&
      feedName !== defaultFeed &&
      !getShouldRedirect(isMyFeed, !!user)
    ) {
      updateDefaultFeed(feedName);
    }
  }, [defaultFeed, feedName, shouldShowMyFeed]);

  const closeCreateMyFeedModal = () => {
    if (myFeedMode === MyFeedMode.Auto) {
      trackEvent({
        event_name: 'my feed onboarding skip',
      });
    }
    setIsFirstSession(false);
    setCreateMyFeed(false);
  };

  const isUpvoted = !isSearchOn && feedName === 'upvoted';
  const isSortableFeed =
    !isSearchOn && (feedName === 'popular' || feedName === 'my-feed');

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
        version: feedVersion,
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
  const [selectedPeriod, setSelectedPeriod] = useState(0);
  const search = (
    <LayoutHeader>
      {navChildren}
      {isSearchOn ? searchChildren : undefined}
    </LayoutHeader>
  );

  const header = (
    <LayoutHeader className="flex-col">
      {shouldShowMyFeed && alerts?.filter && (
        <CreateMyFeedButton
          action={() => setCreateMyFeed(true)}
          flags={flags}
        />
      )}
      <div className="flex flex-row flex-wrap gap-4 items-center mr-px w-full h-[3.125rem]">
        <h3 className="flex flex-1 typo-headline">{feedTitles[feedName]}</h3>
        {navChildren}
        {isUpvoted && (
          <Dropdown
            className="w-44"
            buttonSize="large"
            icon={<CalendarIcon className="mr-2" />}
            selectedIndex={selectedPeriod}
            options={periodTexts}
            onChange={(_, index) => setSelectedPeriod(index)}
          />
        )}
        {sortingEnabled && isSortableFeed && (
          <Dropdown
            className="w-44"
            buttonSize="large"
            selectedIndex={selectedAlgo}
            options={algorithmsList}
            onChange={(_, index) => setSelectedAlgo(index)}
          />
        )}
      </div>
    </LayoutHeader>
  );

  const feedProps = useMemo<FeedProps<unknown>>(() => {
    if (isSearchOn && searchQuery) {
      return {
        feedName: 'search',
        feedQueryKey: generateQueryKey('search', user, searchQuery),
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
      emptyScreen: <FeedEmptyScreen openFeedFilters={openFeedFilters} />,
      header: !isSearchOn && header,
    };
  }, [
    isSearchOn && searchQuery,
    query.query,
    query.variables,
    isUpvoted && selectedPeriod,
  ]);

  useEffect(() => {
    if (!sortingEnabled && selectedAlgo > 0 && loadedSettings && loadedAlgo) {
      setSelectedAlgo(0);
    }
  }, [sortingEnabled, selectedAlgo, loadedSettings, loadedAlgo]);

  return (
    <>
      <FeedPage>
        {isSearchOn && search}
        {feedProps && <Feed {...feedProps} />}
        {children}
      </FeedPage>
      {isLoaded && (
        <FeedFilters
          isOpen={isAnimated}
          onBack={setHidden}
          directlyOpenedTab="Manage tags"
        />
      )}
      {createMyFeed && (
        <CreateMyFeedModal
          version={myFeedOnboardingVersion}
          mode={myFeedMode}
          isOpen={createMyFeed}
          onRequestClose={closeCreateMyFeedModal}
        />
      )}
    </>
  );
}
