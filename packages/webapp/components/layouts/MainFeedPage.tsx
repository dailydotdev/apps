import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import { MainLayoutProps } from '@dailydotdev/shared/src/components/MainLayout';
import type { MainFeedLayoutProps } from '@dailydotdev/shared/src/components/MainFeedLayout';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { getShouldRedirect } from '@dailydotdev/shared/src/components/utilities';
import {
  type GetDefaultFeedProps,
  getFeedName,
} from '@dailydotdev/shared/src/lib/feed';
import dynamic from 'next/dynamic';
import { getLayout } from './FeedLayout';

const MainFeedLayout = dynamic(
  () =>
    import(
      /* webpackChunkName: "mainFeedLayout" */ '@dailydotdev/shared/src/components/MainFeedLayout'
    ),
  { ssr: true },
);

export type MainFeedPageProps = {
  children?: ReactNode;
  isFinder?: boolean;
} & Pick<MainFeedLayoutProps, 'searchChildren'>;

const getInternalFeedName = (
  path: string,
  options?: GetDefaultFeedProps,
): string => {
  if (path === '/') {
    return 'default';
  }

  if (path.startsWith('/search')) {
    return 'search';
  }

  if (path.startsWith('/feeds/')) {
    return getFeedName(path, options);
  }

  return path.replace(/^\/+/, '');
};

export default function MainFeedPage({
  children,
  isFinder,
  searchChildren,
}: MainFeedPageProps): ReactElement {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const isFinderPage = router?.pathname === '/search/posts' || isFinder;
  const isMyFeedURL = router?.query?.slugOrId === user?.id;
  const [feedName, setFeedName] = useState(
    getInternalFeedName(router?.pathname, { isMyFeed: isMyFeedURL }),
  );
  const [isSearchOn, setIsSearchOn] = useState(isFinderPage);
  useEffect(() => {
    const isMyFeed = router?.pathname === '/my-feed';
    if (getShouldRedirect(isMyFeed, !!user)) {
      router.replace('/');
    } else if (isFinderPage) {
      setIsSearchOn(true);
      setFeedName('search');
    } else {
      const newFeed = getInternalFeedName(router?.pathname, {
        isMyFeed: isMyFeedURL,
      });
      if (isSearchOn) {
        setIsSearchOn(false);
      }
      if (newFeed) {
        if (feedName !== newFeed) {
          setFeedName(newFeed);
        }
      }
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname]);

  if (!feedName) {
    return <></>;
  }

  return (
    <MainFeedLayout
      feedName={feedName}
      isSearchOn={isSearchOn}
      searchQuery={router.query?.q?.toString()}
      isFinder={isFinder}
      searchChildren={searchChildren}
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
  mainPage: true,
  screenCentered: false,
};
