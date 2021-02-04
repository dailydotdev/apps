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
import TertiaryButton from '../buttons/TertiaryButton';
import { useRouter } from 'next/router';
import Feed from '../Feed';
import AuthContext from '../AuthContext';
import { getLayout } from './FeedLayout';
import { FeedPage } from '../utilities';
import { getTagsSettingsQueryKey } from '../../lib/useMutateFilters';
import { useQuery } from 'react-query';
import { FeedSettingsData } from '../../graphql/feedSettings';
import { LoggedUser } from '../../lib/user';

const Nav = styled.nav`
  display: flex;
  align-items: center;
  margin: 0 0 ${sizeN(6)};
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

  return (
    <FeedPage>
      <Nav>
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
