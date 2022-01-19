import React, {
  ReactElement,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';
import { BOOKMARKS_FEED_QUERY, SEARCH_BOOKMARKS_QUERY } from '../graphql/feed';
import AuthContext from '../contexts/AuthContext';
import { CustomFeedHeader, FeedPage, FeedPageHeader } from './utilities';
import SearchEmptyScreen from './SearchEmptyScreen';
import Feed, { FeedProps } from './Feed';
import BookmarkEmptyScreen from './BookmarkEmptyScreen';

export type BookmarkFeedLayoutProps = {
  searchQuery?: string;
  children?: ReactNode;
  searchChildren: ReactNode;
  onSearchButtonClick?: () => unknown;
};

export default function BookmarkFeedLayout({
  searchQuery,
  searchChildren,
  children,
}: BookmarkFeedLayoutProps): ReactElement {
  const { user, tokenRefreshed } = useContext(AuthContext);
  const [showEmptyScreen, setShowEmptyScreen] = useState(false);

  const feedProps = useMemo<FeedProps<unknown>>(() => {
    if (searchQuery) {
      return {
        feedName: 'search-bookmarks',
        feedQueryKey: ['bookmarks', user?.id ?? 'anonymous', searchQuery],
        query: SEARCH_BOOKMARKS_QUERY,
        variables: { query: searchQuery },
        emptyScreen: <SearchEmptyScreen />,
      };
    }
    return {
      feedName: 'bookmarks',
      feedQueryKey: ['bookmarks', user?.id ?? 'anonymous'],
      query: BOOKMARKS_FEED_QUERY,
      onEmptyFeed: () => setShowEmptyScreen(true),
    };
  }, [searchQuery, user]);

  if (showEmptyScreen) {
    return <BookmarkEmptyScreen />;
  }

  return (
    <FeedPage>
      {children}
      <FeedPageHeader className="mb-5">
        <h3 className="font-bold typo-callout">Bookmarks</h3>
      </FeedPageHeader>
      <CustomFeedHeader className="relative mb-6">
        {searchChildren}
      </CustomFeedHeader>
      {tokenRefreshed && <Feed {...feedProps} />}
    </FeedPage>
  );
}
