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
import dynamic from 'next/dynamic';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { getShouldRedirect } from '@dailydotdev/shared/src/components/utilities';
import GenericFeedItemComponent from '@dailydotdev/shared/src/components/feed/feedItemComponent/genericFeedItemComponent';
import { getLayout } from './FeedLayout';

const PostsSearch = dynamic(
  () =>
    import(/* webpackChunkName: "routerPostsSearch" */ '../RouterPostsSearch'),
  { ssr: false },
);

export type MainFeedPageProps = {
  children?: ReactNode;
  isFinder?: boolean;
};

const getFeedName = (path: string): string => {
  if (path === '/') {
    return 'default';
  }

  if (path === '/posts/finder') {
    return 'search';
  }

  return path.replace(/^\/+/, '');
};

export default function MainFeedPage({
  children,
  isFinder,
  ...props
}: MainFeedPageProps): ReactElement {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const isFinderPage = router?.pathname === '/search' || isFinder;
  const [feedName, setFeedName] = useState(getFeedName(router?.pathname));
  const [isSearchOn, setIsSearchOn] = useState(isFinderPage);
  useEffect(() => {
    const isMyFeed = router?.pathname === '/my-feed';
    if (getShouldRedirect(isMyFeed, !!user)) {
      router.replace('/');
    } else if (isFinderPage) {
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
      onFeedPageChanged={(page) => router.replace(`/${page}`)}
      searchQuery={router.query?.q?.toString()}
      searchChildren={<PostsSearch />}
      isFinder={isFinder}
      feedItemComponent={props.feedItemComponent}
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
  feedItemComponent: GenericFeedItemComponent,
  greeting: true,
  mainPage: true,
  screenCentered: false,
};
