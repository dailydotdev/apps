import React, { ReactElement, useContext } from 'react';
import { MainLayoutProps } from './MainLayout';
import styled from 'styled-components/macro';
import Link from 'next/link';
import { size3, size6, sizeN } from '../../styles/sizes';
import TertiaryButton from '../buttons/TertiaryButton';
import { useRouter } from 'next/router';
import Feed from '../Feed';
import AuthContext from '../AuthContext';
import { laptop } from '../../styles/media';
import { getLayout } from './FeedLayout';

const Container = styled.main`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: ${size3} ${size6};

  ${laptop} {
    padding-left: ${sizeN(16)};
    padding-right: ${sizeN(16)};
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  margin-bottom: ${size6};
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

export default function MainFeedPage<T>({
  query,
  queryIfLogged,
  variables,
}: MainFeedPageProps<T>): ReactElement {
  const router = useRouter();
  const { user, tokenRefreshed } = useContext(AuthContext);
  let finalQuery: string | null = null;
  if (tokenRefreshed) {
    if (user && queryIfLogged) {
      finalQuery = queryIfLogged;
    } else {
      finalQuery = query;
    }
  }

  return (
    <Container>
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
      <Feed query={finalQuery} variables={variables} />
    </Container>
  );
}

export const getMainFeedLayout = getLayout;
export const mainFeedLayoutProps: MainLayoutProps = {
  responsive: false,
};
