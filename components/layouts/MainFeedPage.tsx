import React, {
  DependencyList,
  ReactElement,
  useContext,
  useEffect,
  useState,
} from 'react';
import { MainLayoutProps } from './MainLayout';
import styled from '@emotion/styled';
import Link from 'next/link';
import sizeN from '../../macros/sizeN.macro';
import rem from '../../macros/rem.macro';
import TertiaryButton from '../buttons/TertiaryButton';
import { useRouter } from 'next/router';
import Feed from '../Feed';
import AuthContext from '../../contexts/AuthContext';
import { getLayout } from './FeedLayout';
import { FeedPage, noScrollbars } from '../utilities';
import { getTagsSettingsQueryKey } from '../../hooks/useMutateFilters';
import { useQuery } from 'react-query';
import { FeedSettingsData } from '../../graphql/feedSettings';
import { LoggedUser } from '../../lib/user';
import OnboardingContext from '../../contexts/OnboardingContext';
import classNames from 'classnames';
import { typoCallout } from '../../styles/typography';
import MagnifyingIcon from '../../icons/magnifying.svg';
import SearchField from '../fields/SearchField';

const PostsSearch = styled(SearchField)`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  width: 100%;
`;

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
  const [initialQuery, setInitialQuery] = useState<string>();

  useEffect(() => {
    if (!initialQuery) {
      setInitialQuery(router.query.q?.toString());
    }
  }, [router.query]);

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
          <TertiaryButton
            tag="a"
            buttonSize="small"
            icon={<MagnifyingIcon />}
          />
        </Link>
        {tabs.map((tab) => (
          <Link href={tab.path} passHref prefetch={false} key={tab.path}>
            <TertiaryButton
              tag="a"
              buttonSize="small"
              pressed={
                tab.path === router?.pathname ||
                (tab.default && router?.pathname === '/')
              }
            >
              {tab.title}
            </TertiaryButton>
          </Link>
        ))}
        {isSearch && (
          <PostsSearch
            className="compact"
            inputId="posts-search"
            autoFocus
            value={initialQuery}
            valueChanged={(value) =>
              router.replace({ pathname: '/search', query: { q: value } })
            }
            onBlur={() => {
              if (!router.query.q?.toString().length) {
                router.push('/');
              }
            }}
          />
        )}
      </Nav>
      <Feed query={finalQuery} variables={variables} dep={feedDeps} />
    </FeedPage>
  );
}

export const getMainFeedLayout = getLayout;
export const mainFeedLayoutProps: MainLayoutProps = {
  responsive: false,
  showRank: true,
};
