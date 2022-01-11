import React, { ReactElement, ReactNode, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { MainLayoutProps } from '@dailydotdev/shared/src/components/MainLayout';
import MainFeedLayout from '@dailydotdev/shared/src/components/MainFeedLayout';
import dynamic from 'next/dynamic';
import { getLayout } from './FeedLayout';
import {
  Features,
  getFeatureValue,
} from '@dailydotdev/shared/src/lib/featureManagement';
import FeaturesContext from '@dailydotdev/shared/src/contexts/FeaturesContext';

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
  return path.replace(/^\/+/, '');
};

export default function MainFeedPage({
  children,
}: MainFeedPageProps): ReactElement {
  const router = useRouter();
  const [feedName, setFeedName] = useState(getFeedName(router?.pathname));
  const [isSearchOn, setIsSearchOn] = useState(router?.pathname === '/search');
  const { flags } = useContext(FeaturesContext);
  const feedNameCopy = getFeatureValue(
    Features.SidebarPopularFeedCopy,
    flags,
  );

  useEffect(() => {
    if (router?.pathname === '/search') {
      setIsSearchOn(true);
      if (!feedName) {
        setFeedName(feedNameCopy);
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
