import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import type { MainLayoutProps } from '@dailydotdev/shared/src/components/MainLayout';
import type { BookmarkFeedLayoutProps } from '@dailydotdev/shared/src/components/BookmarkFeedLayout';
import BookmarkFeedLayout from '@dailydotdev/shared/src/components/BookmarkFeedLayout';
import { getLayout } from './FeedLayout';
import type { MainFeedPageProps } from './MainFeedPage';

type BookmarkFeedPageProps = MainFeedPageProps &
  Pick<BookmarkFeedLayoutProps, 'title' | 'folder' | 'isReminderOnly'>;

export default function BookmarkFeedPage({
  children,
  folder,
  isReminderOnly,
  ...props
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
      {...props}
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
};
