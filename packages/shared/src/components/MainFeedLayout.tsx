import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from 'react-query';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { requestIdleCallback } from 'next/dist/client/request-idle-callback';
import Feed, { FeedProps } from './Feed';
import AuthContext from '../contexts/AuthContext';
import {
  getSourcesSettingsQueryKey,
  getTagsSettingsQueryKey,
} from '../hooks/useMutateFilters';
import { FeedSettingsData } from '../graphql/feedSettings';
import { LoggedUser } from '../lib/user';
import OnboardingContext from '../contexts/OnboardingContext';
import MagnifyingIcon from '../../icons/magnifying.svg';
import { Dropdown, DropdownProps } from './fields/Dropdown';
import { Button, ButtonProps } from './buttons/Button';
import { FeedPage } from './utilities';
import utilitiesStyles from './utilities.module.css';
import styles from './MainFeedLayout.module.css';
import CalendarIcon from '../../icons/calendar.svg';
import {
  ANONYMOUS_FEED_QUERY,
  FEED_QUERY,
  MOST_DISCUSSED_FEED_QUERY,
  MOST_UPVOTED_FEED_QUERY,
  SEARCH_POSTS_QUERY,
} from '../graphql/feed';
import usePersistentState from '../hooks/usePersistentState';

const SearchEmptyScreen = dynamic(
  () => import(/* webpackChunkName: "emptySearch" */ './SearchEmptyScreen'),
);

export type Tab = {
  name: string;
  path: string;
  title: string;
  default?: boolean;
};
export const tabs: Tab[] = [
  {
    name: 'popular',
    path: '/popular',
    title: 'Popular',
    default: true,
  },
  {
    name: 'upvoted',
    path: `/upvoted`,
    title: 'Upvoted',
  },
  {
    name: 'discussed',
    path: `/discussed`,
    title: 'Discussed',
  },
  {
    name: 'recent',
    path: `/recent`,
    title: 'Recent',
  },
];

type FeedQueryProps = {
  query: string;
  queryIfLogged?: string;
  variables?: Record<string, unknown>;
};

const propsByFeed: Record<string, FeedQueryProps> = {
  popular: {
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

export type MainFeedLayoutProps = {
  feedName: string;
  isSearchOn: boolean;
  searchQuery?: string;
  children?: ReactNode;
  useNavButtonsNotLinks?: boolean;
  onNavTabClick?: (tab: Tab) => unknown;
  onSearchButtonClick?: () => unknown;
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

const generateFeedQueryKey = (
  feedName: string,
  user: LoggedUser | null,
  ...additional: unknown[]
): unknown[] => {
  return [feedName, user?.id ?? 'anonymous', ...additional];
};

function ButtonOrLink({
  asLink,
  href,
  ...props
}: { asLink: boolean; href: string } & ButtonProps<'button'>) {
  if (asLink) {
    return (
      <Link href={href} passHref prefetch={false}>
        <Button {...props} tag="a" />
      </Link>
    );
  }
  return <Button {...props} />;
}

export default function MainFeedLayout({
  feedName: feedNameProp,
  searchQuery,
  isSearchOn,
  children,
  useNavButtonsNotLinks,
  onNavTabClick,
  onSearchButtonClick,
  searchChildren,
  navChildren,
}: MainFeedLayoutProps): ReactElement {
  const queryClient = useQueryClient();
  const { user, tokenRefreshed } = useContext(AuthContext);
  const { onboardingStep, onboardingReady } = useContext(OnboardingContext);
  const [defaultFeed, setDefaultFeed] = usePersistentState(
    'defaultFeed',
    null,
    'popular',
  );
  const showWelcome = onboardingStep === 1;

  const feedName = feedNameProp === 'default' ? defaultFeed : feedNameProp;
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
      variables: propsByFeed[feedName].variables,
    };
  } else {
    query = { query: null };
  }

  const [loadedTagsSettings, setLoadedTagsSettings] = useState(false);
  const [loadedSourcesSettings, setLoadedSourcesSettings] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(0);

  const tagsQueryKey = getTagsSettingsQueryKey(user);
  const { data: tagsSettings } = useQuery<FeedSettingsData>(
    tagsQueryKey,
    () => ({ feedSettings: { includeTags: [] } }),
    {
      enabled: false,
    },
  );
  const sourcesQueryKey = getSourcesSettingsQueryKey(user);
  const { data: sourcesSettings } = useQuery<FeedSettingsData>(
    sourcesQueryKey,
    () => ({ feedSettings: { excludeSources: [] } }),
    {
      enabled: false,
    },
  );

  const feedProps = useMemo<FeedProps<unknown>>(() => {
    if (isSearchOn && searchQuery) {
      return {
        feedQueryKey: generateFeedQueryKey('search', user, searchQuery),
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
      feedQueryKey: generateFeedQueryKey(
        feedName,
        user,
        ...Object.values(variables ?? {}),
      ),
      query: query.query,
      variables,
    };
  }, [
    isSearchOn && searchQuery,
    query.query,
    query.variables,
    isUpvoted && selectedPeriod,
  ]);

  const refreshFeed = () =>
    requestIdleCallback(() =>
      queryClient.invalidateQueries(feedProps?.feedQueryKey),
    );

  useEffect(() => {
    if (tagsSettings) {
      if (loadedTagsSettings) {
        refreshFeed();
      } else {
        setLoadedTagsSettings(true);
      }
    }
  }, [tagsSettings]);

  useEffect(() => {
    if (sourcesSettings) {
      if (loadedSourcesSettings) {
        refreshFeed();
      } else {
        setLoadedSourcesSettings(true);
      }
    }
  }, [sourcesSettings]);

  const tabClassNames = isSearchOn ? 'btn-tertiary invisible' : 'btn-tertiary';
  const periodDropdownProps: DropdownProps = {
    style: { width: '11rem' },
    buttonSize: 'medium',
    icon: <CalendarIcon />,
    selectedIndex: selectedPeriod,
    options: periodTexts,
    onChange: (value, index) => {
      setSelectedPeriod(index);
    },
  };

  const onTabClick = (tab: Tab) => {
    setDefaultFeed(tab.name);
    onNavTabClick?.(tab);
  };

  return (
    <FeedPage
      className={classNames({
        [utilitiesStyles.notReady]: !onboardingReady,
      })}
    >
      {showWelcome && (
        <div
          role="status"
          className={`self-stretch -mt-1 mb-12 mx-auto py-3 px-6 text-theme-label-secondary rounded-2xl border border-theme-divider-secondary text-center typo-callout ${styles.welcome}`}
        >
          Dear developer, our mission is to serve all the best programming news
          you’ll ever need. Ready?
        </div>
      )}
      <nav className="relative h-11 flex self-stretch items-center mb-6 overflow-x-auto no-scrollbar">
        <ButtonOrLink
          asLink={!useNavButtonsNotLinks}
          href="/search"
          buttonSize="small"
          icon={<MagnifyingIcon />}
          className={tabClassNames}
          title="Search"
          onClick={onSearchButtonClick}
        />
        {tabs.map((tab) => (
          <ButtonOrLink
            asLink={!useNavButtonsNotLinks}
            href={tab.path}
            key={tab.path}
            buttonSize="small"
            pressed={tab.name === feedName}
            className={tabClassNames}
            onClick={() => onTabClick(tab)}
          >
            {tab.title}
          </ButtonOrLink>
        ))}
        <div className="flex-1" />
        {navChildren}
        {isUpvoted && (
          <Dropdown
            className={classNames(
              'hidden laptop:block mr-px',
              navChildren && 'ml-4',
            )}
            {...periodDropdownProps}
          />
        )}
        {isSearchOn ? searchChildren : undefined}
      </nav>
      {isUpvoted && (
        <Dropdown className="laptop:hidden mb-6" {...periodDropdownProps} />
      )}
      {feedProps && <Feed {...feedProps} />}
      {children}
    </FeedPage>
  );
}
