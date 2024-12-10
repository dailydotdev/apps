import React, { ReactElement, ReactNode, useEffect, useContext } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { MainLayoutProps } from '@dailydotdev/shared/src/components/MainLayout';
import BookmarkFeedLayout from '@dailydotdev/shared/src/components/BookmarkFeedLayout';
import { BookmarkFolder } from '@dailydotdev/shared/src/graphql/bookmarks';
import { getLayout } from './FeedLayout';
import { MainFeedPageProps } from './MainFeedPage';

const PostsSearch = dynamic(
  () =>
    import(/* webpackChunkName: "routerPostsSearch" */ '../RouterPostsSearch'),
  {
    ssr: false,
  },
);

interface BookmarkFeedPageProps extends MainFeedPageProps {
  folder?: BookmarkFolder;
  isReminderOnly?: boolean;
}

export default function BookmarkFeedPage({
  children,
  folder,
  isReminderOnly,
}: BookmarkFeedPageProps): ReactElement {
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
      folder={folder}
      isReminderOnly={isReminderOnly}
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
  layoutProps: BookmarkFeedPageProps,
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
