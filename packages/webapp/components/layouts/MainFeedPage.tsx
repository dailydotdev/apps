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
import { getFeedName as getFeedNameLib } from '@dailydotdev/shared/src/lib/feed';
import dynamic from 'next/dynamic';
import { getLayout } from './FeedLayout';

const MainFeedLayout = dynamic(
  () =>
    import(
      /* webpackChunkName: "goBackHeaderMobile" */ '@dailydotdev/shared/src/components/MainFeedLayout'
    ),
  { ssr: false },
);

export type MainFeedPageProps = {
  children?: ReactNode;
  isFinder?: boolean;
} & Pick<MainFeedLayoutProps, 'searchChildren'>;

const getFeedName = (path: string): string => {
  if (path === '/') {
    return 'default';
  }

  if (path.startsWith('/search')) {
    return 'search';
  }

  if (path.startsWith('/feeds/')) {
    return getFeedNameLib(path);
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
  const [feedName, setFeedName] = useState(getFeedName(router?.pathname));
  const [isSearchOn, setIsSearchOn] = useState(isFinderPage);
  useEffect(() => {
    const isMyFeed = router?.pathname === '/my-feed';
    if (getShouldRedirect(isMyFeed, !!user)) {
      router.replace('/');
    } else if (isFinderPage) {
      setIsSearchOn(true);
      setFeedName('search');
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
