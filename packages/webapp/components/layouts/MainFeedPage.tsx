import React, { ReactElement, ReactNode, useMemo } from 'react';
import { useRouter } from 'next/router';
import { getLayout } from './FeedLayout';
import { SEARCH_POSTS_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import { MainLayoutProps } from '@dailydotdev/shared/src/components/MainLayout';
import MainFeedLayout, {
  MainFeedLayoutProps,
  tabs,
} from '@dailydotdev/shared/src/components/MainFeedLayout';
import dynamic from 'next/dynamic';

const PostsSearch = dynamic(
  () => import(/* webpackChunkName: "search" */ '../RouterPostsSearch'),
  { ssr: false },
);

export type MainFeedPageProps<T> = {
  query: string;
  queryIfLogged?: string;
  variables?: T;
  children?: ReactNode;
};

const getFeedName = (path: string): string => {
  if (path === '/search') {
    return 'search';
  }
  return (
    tabs.find((tab) => (tab.default && path === '/') || path === tab.path)
      ?.name ?? ''
  );
};

export default function MainFeedPage<T>({
  query,
  queryIfLogged,
  variables,
  children,
}: MainFeedPageProps<T>): ReactElement {
  const router = useRouter();
  const feedName = getFeedName(router?.pathname);
  const layoutProps = useMemo<MainFeedLayoutProps<unknown>>(() => {
    const baseProps = {
      feedName,
      searchChildren: <PostsSearch />,
    };
    if (feedName === 'search' && 'q' in router.query) {
      return {
        query: SEARCH_POSTS_QUERY,
        variables: { query: router.query.q },
        ...baseProps,
      };
    } else {
      return {
        query,
        queryIfLogged,
        variables,
        ...baseProps,
      };
    }
  }, [router?.pathname, router.query, query, queryIfLogged, variables]);

  return <MainFeedLayout {...layoutProps}>{children}</MainFeedLayout>;
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
