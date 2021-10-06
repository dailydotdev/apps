import React, { ReactElement, ReactNode, useState, useEffect } from 'react';
import { MainLayoutProps } from '@dailydotdev/shared/src/components/MainLayout';
import { getLayout } from './FeedLayout';
import { useRouter } from 'next/router';
import { MainFeedPageProps } from './MainFeedPage';
import BookmarkFeedLayout from '@dailydotdev/shared/src/components/BookmarkFeedLayout';
import dynamic from 'next/dynamic';

const PostsSearch = dynamic(
  () =>
    import(
      /* webpackChunkName: "routerPostsSearch" */ '../../components/RouterPostsSearch'
    ),
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
    } else {
      if (isSearchOn) {
        setIsSearchOn(false);
      }
    }
  }, [router.pathname]);

  console.log(`search on: ${isSearchOn}`);
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
