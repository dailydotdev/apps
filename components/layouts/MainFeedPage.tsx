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
import styled from '@emotion/styled';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import sizeN from '../../macros/sizeN.macro';
import rem from '../../macros/rem.macro';
import Feed, { FeedProps } from '../Feed';
import AuthContext from '../../contexts/AuthContext';
import { getLayout } from './FeedLayout';
import { FeedPage, noScrollbars } from '../utilities';
import { getTagsSettingsQueryKey } from '../../hooks/useMutateFilters';
import { FeedSettingsData } from '../../graphql/feedSettings';
import { LoggedUser } from '../../lib/user';
import OnboardingContext from '../../contexts/OnboardingContext';
import { typoCallout } from '../../styles/typography';
import MagnifyingIcon from '../../icons/magnifying.svg';
import { SEARCH_POSTS_QUERY } from '../../graphql/feed';
import Button from '../buttons/Button';

const PostsSearch = dynamic(
  () => import(/* webpackChunkName: "search" */ '../PostsSearch'),
);

const SearchEmptyScreen = dynamic(
  () => import(/* webpackChunkName: "emptySearch" */ '../SearchEmptyScreen'),
);

const Nav = styled.nav`
  position: relative;
  height: ${sizeN(10)};
  display: flex;
  align-self: stretch;
  align-items: center;
  margin: 0 0 ${sizeN(6)};
  overflow-x: auto;
  ${noScrollbars}

  &.hide-tabs > a {
    visibility: hidden;
  }
`;

const Welcome = styled.div`
  align-self: stretch;
  max-width: ${rem(368)};
  margin: ${sizeN(-1)} auto ${sizeN(12)};
  padding: ${sizeN(3)} ${sizeN(6)};
  color: var(--theme-label-secondary);
  border-radius: ${sizeN(4)};
  border: ${rem(1)} solid var(--theme-divider-secondary);
  text-align: center;
  ${typoCallout}
`;

export type Tab = { path: string; title: string; default?: boolean };
export const tabs: Tab[] = [
  {
    path: '/popular',
    title: 'Popular',
    default: true,
  },
  {
    path: `/upvoted`,
    title: 'Most Upvoted',
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

export default function MainFeedPage<T>({
  query,
  queryIfLogged,
  variables,
  children,
}: MainFeedPageProps<T>): ReactElement {
  const router = useRouter();
  const { user, tokenRefreshed } = useContext(AuthContext);
  const { showWelcome, onboardingReady } = useContext(OnboardingContext);
  const finalQuery = getQueryBasedOnLogin(
    tokenRefreshed,
    user,
    query,
    queryIfLogged,
  );
  const [loadedFeedSettings, setLoadedFeedSettings] = useState(false);
  const [feedDeps, setFeedDeps] = useState<DependencyList>([0]);

  const queryKey = getTagsSettingsQueryKey(user);
  const { data: feedSettings } = useQuery<FeedSettingsData>(
    queryKey,
    () => ({ feedSettings: { includeTags: [] } }),
    {
      enabled: false,
    },
  );
  useEffect(() => {
    if (feedSettings) {
      if (loadedFeedSettings) {
        setFeedDeps([feedSettings.feedSettings.includeTags.length]);
      } else {
        setLoadedFeedSettings(true);
      }
    }
  }, [feedSettings]);

  const isSearch = '/search' === router?.pathname;

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
        variables,
        dep: feedDeps,
      };
    }
  }, [isSearch, router.query, finalQuery, variables, feedDeps]);

  return (
    <FeedPage className={classNames({ notReady: !onboardingReady })}>
      {showWelcome && (
        <Welcome role="status">
          Dear developer, our mission is to serve all the best programming news
          you’ll ever need. Ready?
        </Welcome>
      )}
      <Nav className={classNames({ 'hide-tabs': isSearch })}>
        <Link href="/search" passHref prefetch={false}>
          <Button
            tag="a"
            buttonSize="small"
            icon={<MagnifyingIcon />}
            className="btn-tertiary"
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
              className="btn-tertiary"
            >
              {tab.title}
            </Button>
          </Link>
        ))}
        {isSearch && <PostsSearch />}
      </Nav>
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
};

export function generateMainFeedLayoutProps<T>(
  props: MainFeedPageProps<T>,
): MainLayoutProps & MainFeedPageProps<T> {
  return {
    ...props,
    ...mainFeedLayoutProps,
  };
}
