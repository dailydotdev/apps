import React, {
  ReactElement,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import { BOOKMARKS_FEED_QUERY, SEARCH_BOOKMARKS_QUERY } from '../graphql/feed';
import AuthContext from '../contexts/AuthContext';
import { CustomFeedHeader, FeedPage, FeedPageHeader } from './utilities';
import SearchEmptyScreen from './SearchEmptyScreen';
import Feed, { FeedProps } from './Feed';
import BookmarkEmptyScreen from './BookmarkEmptyScreen';
import { Button } from './buttons/Button';
import SourceIcon from '../../icons/source_outline.svg';

export type BookmarkFeedLayoutProps = {
  searchQuery?: string;
  children?: ReactNode;
  searchChildren: ReactNode;
  onSearchButtonClick?: () => unknown;
};

const SharedBookmarksModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "accountDetailsModal" */ './modals/SharedBookmarksModal'
    ),
);

export default function BookmarkFeedLayout({
  searchQuery,
  searchChildren,
  children,
}: BookmarkFeedLayoutProps): ReactElement {
  const { user, tokenRefreshed } = useContext(AuthContext);
  const [showEmptyScreen, setShowEmptyScreen] = useState(false);
  const [showSharedBookmarks, setShowSharedBookmarks] = useState(false);

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
      <CustomFeedHeader className="flex mb-6">
        {searchChildren}

        <Button
          className="ml-4 btn-secondary hidden laptop:flex"
          icon={<SourceIcon />}
          onClick={() => setShowSharedBookmarks(true)}
        >
          Share bookmarks
        </Button>
        <Button
          className="ml-4 btn-secondary flex laptop:hidden"
          icon={<SourceIcon />}
          onClick={() => setShowSharedBookmarks(true)}
          iconOnly
        />
      </CustomFeedHeader>

      {showSharedBookmarks && (
        <SharedBookmarksModal
          isOpen={showSharedBookmarks}
          onRequestClose={() => setShowSharedBookmarks(false)}
        />
      )}
      {tokenRefreshed && <Feed {...feedProps} />}
    </FeedPage>
  );
}
