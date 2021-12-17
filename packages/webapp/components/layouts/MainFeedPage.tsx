import React, { ReactElement, ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { MainLayoutProps } from '@dailydotdev/shared/src/components/MainLayout';
import MainFeedLayout, {
  tabs,
} from '@dailydotdev/shared/src/components/MainFeedLayout';
import dynamic from 'next/dynamic';
import { getLayout } from './FeedLayout';

const PostsSearch = dynamic(
  () => import(/* webpackChunkName: "search" */ '../RouterPostsSearch'),
  { ssr: false },
);

export type MainFeedPageProps = {
  children?: ReactNode;
};

const getFeedName = (path: string): string => {
  if (path === '/') {
    return 'default';
  }
  return tabs.find((tab) => path === tab.path)?.name;
};

export default function MainFeedPage({
  children,
}: MainFeedPageProps): ReactElement {
  const router = useRouter();
  const [feedName, setFeedName] = useState(getFeedName(router?.pathname));
  const [isSearchOn, setIsSearchOn] = useState(router?.pathname === '/search');

  useEffect(() => {
    if (router?.pathname === '/search') {
      setIsSearchOn(true);
      if (!feedName) {
        setFeedName('popular');
      }
    } else {
      const newFeed = getFeedName(router?.pathname);
      if (isSearchOn) {
        setIsSearchOn(false);
      }
      if (newFeed) {
        if (feedName !== newFeed) {
          setFeedName(newFeed);
        }
      }
    }
  }, [router.pathname]);

  if (!feedName) {
    return <></>;
  }

  return (
    <MainFeedLayout
      feedName={feedName}
      isSearchOn={isSearchOn}
      searchQuery={router.query?.q?.toString()}
      searchChildren={<PostsSearch placeholder="Search articles" />}
    >
      {children}
    </MainFeedLayout>
  );
}

export function getMainFeedLayout(
  page: ReactNode,
  pageProps: Record<string, unknown>,
  layoutProps: MainLayoutProps & MainFeedPageProps,
): ReactNode {
  return getLayout(
    <MainFeedPage {...layoutProps}>{page}</MainFeedPage>,
    pageProps,
    layoutProps,
  );
}

export const mainFeedLayoutProps: MainLayoutProps = {
  greeting: true,
  mainPage: true,
};
