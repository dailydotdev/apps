import React, { ReactElement, ReactNode, useEffect, useContext } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
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
  const { user, tokenRefreshed } = useContext(AuthContext);

  useEffect(() => {
    if (!user && tokenRefreshed) {
      router.replace('/');
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenRefreshed, user]);

  return (
    <BookmarkFeedLayout
      searchQuery={router.query?.q?.toString()}
      searchChildren={
        user && (
          <PostsSearch
            autoFocus={false}
            placeholder="Search bookmarks"
            suggestionType="searchBookmarksSuggestions"
          />
        )
      }
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
  mainPage: true,
  screenCentered: false,
};
