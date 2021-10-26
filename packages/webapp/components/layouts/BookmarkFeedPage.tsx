import React, {
  ReactElement,
  ReactNode,
  useState,
  useEffect,
  useContext,
} from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { MainLayoutProps } from '@dailydotdev/shared/src/components/MainLayout';
import BookmarkFeedLayout from '@dailydotdev/shared/src/components/BookmarkFeedLayout';
import { getLayout } from './FeedLayout';
import { MainFeedPageProps } from './MainFeedPage';

const BOOKMARK_SEARCH_URL = '/bookmarks/search';
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
  const { user, tokenRefreshed, loadingUser } = useContext(AuthContext);
  const [isSearchOn, setIsSearchOn] = useState(
    router?.pathname === BOOKMARK_SEARCH_URL,
  );

  useEffect(() => {
    if (!user && tokenRefreshed && !loadingUser) {
      router.replace('/');
    }
  }, [tokenRefreshed, user, loadingUser]);

  useEffect(() => {
    if (router?.pathname === BOOKMARK_SEARCH_URL) {
      setIsSearchOn(true);
    } else if (isSearchOn) {
      setIsSearchOn(false);
    }
  }, [router.pathname]);

  return (
    <BookmarkFeedLayout
      isSearchOn={isSearchOn}
      searchQuery={router.query?.q?.toString()}
      searchChildren={
        <PostsSearch suggestionType="searchBookmarksSuggestions" />
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
  responsive: false,
  showRank: true,
  greeting: true,
  mainPage: true,
};
