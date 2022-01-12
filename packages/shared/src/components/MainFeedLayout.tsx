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
import { Dropdown, DropdownProps } from './fields/Dropdown';
import { FeedPage } from './utilities';
import CalendarIcon from '../../icons/calendar.svg';
import {
  ANONYMOUS_FEED_QUERY,
  FEED_QUERY,
  MOST_DISCUSSED_FEED_QUERY,
  MOST_UPVOTED_FEED_QUERY,
  SEARCH_POSTS_QUERY,
} from '../graphql/feed';
import FeaturesContext from '../contexts/FeaturesContext';
import { generateQueryKey } from '../lib/query';
import { Features, getFeatureValue } from '../lib/featureManagement';
import classed from '../lib/classed';
import usePersistentContext from '../hooks/usePersistentContext';
import { useMyFeed } from '../hooks/useMyFeed';

const SearchEmptyScreen = dynamic(
  () => import(/* webpackChunkName: "emptySearch" */ './SearchEmptyScreen'),
);

const feedTitles = {
  popular: 'Popular',
  upvoted: 'Most upvoted',
  discussed: 'Best discussions',
};

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
    recent: {
      query: ANONYMOUS_FEED_QUERY,
      queryIfLogged: FEED_QUERY,
      variables: { ranking: 'TIME' },
    },
  };
};

const LayoutHeader = classed(
  'header',
  'flex overflow-x-auto relative items-center self-stretch mb-6 h-11 no-scrollbar',
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
  const [defaultFeed, updateDefaultFeed] = usePersistentContext(
    'defaultFeed',
    'popular',
  );
  const { user, tokenRefreshed } = useContext(AuthContext);
  const { flags } = useContext(FeaturesContext);
  const { shouldShowMyFeed } = useMyFeed();
  const feedVersion = parseInt(
    getFeatureValue(Features.FeedVersion, flags),
    10,
  );
  const feedName = feedNameProp === 'default' ? defaultFeed : feedNameProp;
  const propsByFeed = getPropsByFeed({ shouldShowMyFeed });

  useEffect(() => {
    if (defaultFeed !== null && feedName !== null && feedName !== defaultFeed) {
      updateDefaultFeed(feedName);
    }
  }, [defaultFeed, feedName]);

  const isUpvoted = !isSearchOn && feedName === 'upvoted';

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

  const [selectedPeriod, setSelectedPeriod] = useState(0);

  const periodDropdownProps: DropdownProps = {
    style: { width: '11rem' },
    buttonSize: 'medium',
    icon: <CalendarIcon />,
    selectedIndex: selectedPeriod,
    options: periodTexts,
    onChange: (_, index) => setSelectedPeriod(index),
  };

  const search = (
    <LayoutHeader>
      {navChildren}
      {isSearchOn ? searchChildren : undefined}
    </LayoutHeader>
  );

  const header = (
    <LayoutHeader>
      {!isSearchOn && <h3 className="typo-headline">{feedTitles[feedName]}</h3>}
      <div className="flex-1" />
      {navChildren}
      {isUpvoted && (
        <>
          <Dropdown
            className={classNames(
              'hidden laptop:block mr-px',
              navChildren && 'ml-4',
            )}
            {...periodDropdownProps}
          />
          <Dropdown className="laptop:hidden mb-6" {...periodDropdownProps} />
        </>
      )}
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
    const variables = isUpvoted
      ? { ...query.variables, period: periods[selectedPeriod].value }
      : query.variables;
    return {
      feedName,
      feedQueryKey: generateQueryKey(
        feedName,
        user,
        ...Object.values(variables ?? {}),
      ),
      query: query.query,
      variables,
      header: !isSearchOn && header,
    };
  }, [
    isSearchOn && searchQuery,
    query.query,
    query.variables,
    isUpvoted && selectedPeriod,
  ]);

  return (
    <FeedPage>
      {isSearchOn && search}
      {feedProps && <Feed {...feedProps} />}
      {children}
    </FeedPage>
  );
}
