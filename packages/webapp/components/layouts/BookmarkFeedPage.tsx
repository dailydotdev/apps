import React, { ReactElement, ReactNode, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { MainLayoutProps } from '@dailydotdev/shared/src/components/MainLayout';
import BookmarkFeedLayout from '@dailydotdev/shared/src/components/BookmarkFeedLayout';
import { getLayout } from './FeedLayout';
import { MainFeedPageProps } from './MainFeedPage';

const PostsSearch = dynamic(
  () =>
    import(/* webpackChunkName: "routerPostsSearch" */ '../RouterPostsSearch'),
  {
    ssr: false,
  },
);

export default function BookmarkFeedPage({
  children,
}: MainFeedPageProps): ReactElement {
  const router = useRouter();
  const [isSearchOn, setIsSearchOn] = useState(
    router?.pathname === '/bookmarks/search',
  );

  useEffect(() => {
    if (router?.pathname === '/bookmarks/search') {
      setIsSearchOn(true);
    } else if (isSearchOn) {
      setIsSearchOn(false);
    }
  }, [router.pathname]);

  return (
    <BookmarkFeedLayout
      isSearchOn={isSearchOn}
      searchQuery={router.query?.q?.toString()}
      searchChildren={<PostsSearch />}
    >
      {children}
    </BookmarkFeedLayout>
  );
}

export function getBookmarkFeedLayout(
  page: ReactNode,
  pageProps: Record<string, unknown>,
  layoutProps: MainLayoutProps & MainFeedPageProps,
): ReactNode {
  return getLayout(
    <BookmarkFeedPage {...layoutProps}>{page}</BookmarkFeedPage>,
    pageProps,
    layoutProps,
  );
}

export const bookmarkFeedLayoutProps: MainLayoutProps = {
  responsive: false,
  showRank: true,
  greeting: true,
  mainPage: true,
};
