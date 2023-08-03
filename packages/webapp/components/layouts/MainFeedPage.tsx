import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import { MainLayoutProps } from '@dailydotdev/shared/src/components/MainLayout';
import MainFeedLayout from '@dailydotdev/shared/src/components/MainFeedLayout';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { getShouldRedirect } from '@dailydotdev/shared/src/components/utilities';
import { getLayout } from './FeedLayout';

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
  const { user } = useContext(AuthContext);
  const [feedName, setFeedName] = useState(getFeedName(router?.pathname));

  useEffect(() => {
    const isMyFeed = router?.pathname === '/my-feed';
    if (getShouldRedirect(isMyFeed, !!user)) {
      router.replace('/');
    } else if (router?.pathname === '/search') {
      if (!feedName) {
        setFeedName('popular');
      }
    } else {
      const newFeed = getFeedName(router?.pathname);
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
      onFeedPageChanged={(page) => router.replace(`/${page}`)}
      searchQuery={router.query?.q?.toString()}
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
  screenCentered: false,
};
