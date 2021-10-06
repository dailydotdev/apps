import React, { ReactElement, ReactNode, useState } from 'react';
import { MainLayoutProps } from '@dailydotdev/shared/src/components/MainLayout';
import { getLayout } from './FeedLayout';
import { useRouter } from 'next/router';
import { MainFeedPageProps } from './MainFeedPage';
import BookmarkFeedLayout from '@dailydotdev/shared/src/components/BookmarkFeedLayout';

export default function BookmarkFeedPage({
  children,
}: MainFeedPageProps): ReactElement {
  const router = useRouter();
  const [isSearchOn, setIsSearchOn] = useState(router?.pathname === '/search');

  return (
    <BookmarkFeedLayout
      isSearchOn={isSearchOn}
      searchQuery={router.query?.q?.toString()}
    >
      {children}
    </BookmarkFeedLayout>
  );
}

export function getMainFeedLayout(
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

export const mainFeedLayoutProps: MainLayoutProps = {
  responsive: false,
  showRank: true,
  greeting: true,
  mainPage: true,
};
