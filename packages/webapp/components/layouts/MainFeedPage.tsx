import React, {
  DependencyList,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { MainLayoutProps } from './MainLayout';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import Feed, { FeedProps } from '../Feed';
import AuthContext from '../../contexts/AuthContext';
import { getLayout } from './FeedLayout';
import { FeedPage } from '../utilities';
import {
  getSourcesSettingsQueryKey,
  getTagsSettingsQueryKey,
} from '../../hooks/useMutateFilters';
import { FeedSettingsData } from '../../graphql/feedSettings';
import { LoggedUser } from '../../lib/user';
import OnboardingContext from '../../contexts/OnboardingContext';
import MagnifyingIcon from '@dailydotdev/shared/icons/magnifying.svg';
import { SEARCH_POSTS_QUERY } from '../../graphql/feed';
import { Button } from '@dailydotdev/shared';
import utilitiesStyles from '../../styles/utilities.module.css';
import styles from '../../styles/mainFeed.module.css';
import Dropdown, { DropdownProps } from '../dropdown/Dropdown';
import CalendarIcon from '@dailydotdev/shared/icons/calendar.svg';

const PostsSearch = dynamic(
  () => import(/* webpackChunkName: "search" */ '../PostsSearch'),
  { ssr: false },
);

const SearchEmptyScreen = dynamic(
  () => import(/* webpackChunkName: "emptySearch" */ '../SearchEmptyScreen'),
);

export type Tab = { path: string; title: string; default?: boolean };
export const tabs: Tab[] = [
  {
    path: '/popular',
    title: 'Popular',
    default: true,
  },
  {
    path: `/upvoted`,
    title: 'Upvoted',
  },
  {
    path: `/discussed`,
    title: 'Discussed',
  },
  {
    path: `/recent`,
    title: 'Recent',
  },
];

export type MainFeedPageProps<T> = {
  query: string;
  queryIfLogged?: string;
  variables?: T;
  children?: ReactNode;
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
    } else {
      return query;
    }
  }
  return null;
};

const periods = [
  { value: 7, text: 'Last week' },
  { value: 30, text: 'Last month' },
  { value: 365, text: 'Last year' },
];
const periodTexts = periods.map((period) => period.text);

export default function MainFeedPage<T>({
  query,
  queryIfLogged,
  variables,
  children,
}: MainFeedPageProps<T>): ReactElement {
  const router = useRouter();
  const { user, tokenRefreshed } = useContext(AuthContext);
  const { onboardingStep, onboardingReady } = useContext(OnboardingContext);
  const showWelcome = onboardingStep === 1;
  const finalQuery = getQueryBasedOnLogin(
    tokenRefreshed,
    user,
    query,
    queryIfLogged,
  );
  const [loadedTagsSettings, setLoadedTagsSettings] = useState(false);
  const [loadedSourcesSettings, setLoadedSourcesSettings] = useState(false);
  const [feedDeps, setFeedDeps] = useState<DependencyList>([0]);
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
  useEffect(() => {
    if (tagsSettings) {
      if (loadedTagsSettings) {
        setFeedDeps([feedDeps[0] + 1]);
      } else {
        setLoadedTagsSettings(true);
      }
    }
  }, [tagsSettings]);

  useEffect(() => {
    if (sourcesSettings) {
      if (loadedSourcesSettings) {
        setFeedDeps([feedDeps[0] + 1]);
      } else {
        setLoadedSourcesSettings(true);
      }
    }
  }, [sourcesSettings]);

  const isSearch = '/search' === router?.pathname;
  const isUpvoted = '/upvoted' === router?.pathname;

  const feedProps = useMemo<FeedProps<unknown>>(() => {
    if (isSearch && 'q' in router.query) {
      return {
        query: SEARCH_POSTS_QUERY,
        variables: { query: router.query.q },
        emptyScreen: <SearchEmptyScreen />,
      };
    } else {
      return {
        query: finalQuery,
        variables: isUpvoted
          ? { ...variables, period: periods[selectedPeriod].value }
          : variables,
        dep: feedDeps,
      };
    }
  }, [isSearch, router.query, finalQuery, variables, feedDeps]);

  const tabClassNames = isSearch ? 'btn-tertiary invisible' : 'btn-tertiary';
  const periodDropdownProps: DropdownProps = {
    style: { width: '11rem' },
    buttonSize: 'medium',
    icon: <CalendarIcon />,
    selectedIndex: selectedPeriod,
    options: periodTexts,
    onChange: (value, index) => {
      setSelectedPeriod(index);
      setFeedDeps([feedDeps[0] + 1]);
    },
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
        <Link href="/search" passHref prefetch={false}>
          <Button
            tag="a"
            buttonSize="small"
            icon={<MagnifyingIcon />}
            className={tabClassNames}
            title="Search"
          />
        </Link>
        {tabs.map((tab) => (
          <Link href={tab.path} passHref prefetch={false} key={tab.path}>
            <Button
              tag="a"
              buttonSize="small"
              pressed={
                tab.path === router?.pathname ||
                (tab.default && router?.pathname === '/')
              }
              className={tabClassNames}
            >
              {tab.title}
            </Button>
          </Link>
        ))}
        {isUpvoted && (
          <Dropdown
            className="hidden laptop:block ml-auto mr-px"
            {...periodDropdownProps}
          />
        )}
        {isSearch && <PostsSearch />}
      </nav>
      {isUpvoted && (
        <Dropdown className="laptop:hidden mb-6" {...periodDropdownProps} />
      )}
      <Feed {...feedProps} />
      {children}
    </FeedPage>
  );
}

export function getMainFeedLayout<T>(
  page: ReactNode,
  pageProps: Record<string, unknown>,
  layoutProps: MainLayoutProps & MainFeedPageProps<T>,
): ReactNode {
  return getLayout(
    <MainFeedPage {...layoutProps}>{page}</MainFeedPage>,
    pageProps,
    layoutProps,
  );
}

export const mainFeedLayoutProps: MainLayoutProps = {
  responsive: false,
  showRank: true,
  greeting: true,
  mainPage: true,
};

export function generateMainFeedLayoutProps<T>(
  props: MainFeedPageProps<T>,
): MainLayoutProps & MainFeedPageProps<T> {
  return {
    ...props,
    ...mainFeedLayoutProps,
  };
}
