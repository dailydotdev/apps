import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import Feed, { FeedProps } from './Feed';
import AuthContext from '../contexts/AuthContext';
import { LoggedUser } from '../lib/user';
import { Dropdown } from './fields/Dropdown';
import { FeedHeading, FeedPage, MainFeedPage } from './utilities';
import CalendarIcon from './icons/Calendar';
import {
  ANONYMOUS_FEED_QUERY,
  FEED_QUERY,
  MOST_DISCUSSED_FEED_QUERY,
  MOST_UPVOTED_FEED_QUERY,
  RankingAlgorithm,
  SEARCH_POSTS_QUERY,
} from '../graphql/feed';
import FeaturesContext from '../contexts/FeaturesContext';
import { generateQueryKey } from '../lib/query';
import { Features, getFeatureValue } from '../lib/featureManagement';
import classed from '../lib/classed';
import SettingsContext from '../contexts/SettingsContext';
import usePersistentContext from '../hooks/usePersistentContext';
import CreateMyFeedButton from './CreateMyFeedButton';
import AlertContext from '../contexts/AlertContext';
import useSidebarRendered from '../hooks/useSidebarRendered';
import MyFeedHeading from './filters/MyFeedHeading';
import SortIcon from './icons/Sort';
import OnboardingContext from '../contexts/OnboardingContext';

const SearchEmptyScreen = dynamic(
  () =>
    import(/* webpackChunkName: "searchEmptyScreen" */ './SearchEmptyScreen'),
);

const FeedEmptyScreen = dynamic(
  () => import(/* webpackChunkName: "feedEmptyScreen" */ './FeedEmptyScreen'),
);

const FeedFilters = dynamic(
  () => import(/* webpackChunkName: "feedFilters" */ './filters/FeedFilters'),
);

type FeedQueryProps = {
  query: string;
  queryIfLogged?: string;
  variables?: Record<string, unknown>;
};

const propsByFeed: Record<MainFeedPage, FeedQueryProps> = {
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

const LayoutHeader = classed(
  'header',
  'flex justify-between items-center overflow-x-auto relative justify-between mb-6 min-h-14 w-full no-scrollbar',
);

export type MainFeedLayoutProps = {
  feedName: string;
  isSearchOn: boolean;
  searchQuery?: string;
  children?: ReactNode;
  searchChildren: ReactNode;
  navChildren?: ReactNode;
  onFeedPageChanged: (page: MainFeedPage) => void;
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

const periods = [
  { value: 7, text: 'Last week' },
  { value: 30, text: 'Last month' },
  { value: 365, text: 'Last year' },
];
const periodTexts = periods.map((period) => period.text);

interface GetDefaultFeedProps {
  hasFiltered?: boolean;
  hasUser?: boolean;
}

const getDefaultFeed = ({
  hasFiltered,
  hasUser,
}: GetDefaultFeedProps): string => {
  if (!hasUser || !hasFiltered) {
    return MainFeedPage.Popular;
  }

  return MainFeedPage.MyFeed;
};

const defaultFeedConditions = [null, 'default', '/', ''];

export const getFeedName = (
  path: string,
  options: GetDefaultFeedProps = {},
): string => {
  const feed = path?.replaceAll?.('/', '') || '';

  if (defaultFeedConditions.some((condition) => condition === feed)) {
    return getDefaultFeed(options);
  }

  const [page] = feed.split('?');

  return page.replace(/^\/+/, '');
};

export default function MainFeedLayout({
  feedName: feedNameProp,
  searchQuery,
  isSearchOn,
  children,
  searchChildren,
  navChildren,
  onFeedPageChanged,
}: MainFeedLayoutProps): ReactElement {
  const { sidebarRendered } = useSidebarRendered();
  const { updateAlerts } = useContext(AlertContext);
  const { sortingEnabled, loadedSettings } = useContext(SettingsContext);
  const { user, tokenRefreshed } = useContext(AuthContext);
  const { alerts } = useContext(AlertContext);
  const { onInitializeOnboarding } = useContext(OnboardingContext);
  const feedName = getFeedName(feedNameProp, {
    hasFiltered: !alerts?.filter,
    hasUser: !!user,
  });
  const { flags, popularFeedCopy } = useContext(FeaturesContext);
  const [isFeedFiltersOpen, setIsFeedFiltersOpen] = useState(false);
  const feedVersion = parseInt(
    getFeatureValue(Features.FeedVersion, flags),
    10,
  );
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

  const hasFiltered = feedName === MainFeedPage.MyFeed && !alerts?.filter;

  /* eslint-disable react/no-children-prop */
  const feedHeading = {
    [MainFeedPage.MyFeed]: (
      <MyFeedHeading
        hasFiltered={hasFiltered}
        isAlertDisabled={!alerts.myFeed}
        sidebarRendered={sidebarRendered}
        onOpenFeedFilters={() => setIsFeedFiltersOpen(true)}
        onUpdateAlerts={() => updateAlerts({ myFeed: null })}
      />
    ),
    [MainFeedPage.Popular]: <FeedHeading children={popularFeedCopy} />,
    [MainFeedPage.Upvoted]: <FeedHeading children="Most upvoted" />,
    [MainFeedPage.Discussed]: <FeedHeading children="Best discussions" />,
  };

  const header = (
    <LayoutHeader className="flex-col">
      {alerts?.filter && (
        <CreateMyFeedButton
          action={() => onInitializeOnboarding(onFeedPageChanged)}
          flags={flags}
        />
      )}
      <div
        className={classNames(
          'flex flex-row flex-wrap gap-4 items-center mr-px w-full',
          alerts.filter || !alerts.myFeed ? 'h-14' : 'h-32 laptop:h-16',
          !sidebarRendered && alerts.myFeed && 'content-start',
        )}
      >
        {feedHeading[feedName]}
        {navChildren}
        {isUpvoted && (
          <Dropdown
            className={{ container: 'w-44' }}
            buttonSize="large"
            icon={<CalendarIcon className="mr-2" />}
            selectedIndex={selectedPeriod}
            options={periodTexts}
            onChange={(_, index) => setSelectedPeriod(index)}
          />
        )}
        {sortingEnabled && isSortableFeed && (
          <Dropdown
            className={{
              container: 'w-12 tablet:w-44',
              indicator: 'flex tablet:hidden',
              chevron: 'hidden tablet:flex',
              label: 'hidden tablet:flex',
              menu: 'w-44',
            }}
            dynamicMenuWidth
            shouldIndicateSelected
            buttonSize="large"
            selectedIndex={selectedAlgo}
            options={algorithmsList}
            icon={<SortIcon size="medium" className="flex tablet:hidden" />}
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
      emptyScreen: (
        <FeedEmptyScreen openFeedFilters={() => setIsFeedFiltersOpen(true)} />
      ),
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
      {isFeedFiltersOpen && (
        <FeedFilters
          isOpen
          onRequestClose={() => setIsFeedFiltersOpen(false)}
        />
      )}
    </>
  );
}
