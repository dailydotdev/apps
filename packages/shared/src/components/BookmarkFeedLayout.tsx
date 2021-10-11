import React, {
  ReactElement,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';
import Link from 'next/link';
import MagnifyingIcon from '../../icons/magnifying.svg';
import { BOOKMARKS_FEED_QUERY, SEARCH_BOOKMARKS_QUERY } from '../graphql/feed';
import AuthContext from '../contexts/AuthContext';
import { CustomFeedHeader, FeedPage } from './utilities';
import SearchEmptyScreen from './SearchEmptyScreen';
import Feed, { FeedProps } from './Feed';
import BookmarkEmptyScreen from './BookmarkEmptyScreen';
import { Button } from './buttons/Button';

export type BookmarkFeedLayoutProps = {
  isSearchOn: boolean;
  searchQuery?: string;
  children?: ReactNode;
  searchChildren: ReactNode;
  onSearchButtonClick?: () => unknown;
};

export default function BookmarkFeedLayout({
  searchQuery,
  isSearchOn,
  searchChildren,
  children,
}: BookmarkFeedLayoutProps): ReactElement {
  const { user, tokenRefreshed } = useContext(AuthContext);
  const [showEmptyScreen, setShowEmptyScreen] = useState(false);

  const feedProps = useMemo<FeedProps<unknown>>(() => {
    if (isSearchOn && searchQuery) {
      return {
        feedQueryKey: ['bookmarks', user?.id ?? 'anonymous', searchQuery],
        query: SEARCH_BOOKMARKS_QUERY,
        variables: { query: searchQuery },
        emptyScreen: <SearchEmptyScreen />,
        className: 'my-3',
      };
    }
    return {
      feedQueryKey: ['bookmarks', user?.id ?? 'anonymous'],
      query: BOOKMARKS_FEED_QUERY,
      className: 'my-3',
      onEmptyFeed: () => setShowEmptyScreen(true),
    };
  }, [isSearchOn && searchQuery, user]);

  if (showEmptyScreen) {
    return <BookmarkEmptyScreen />;
  }

  return (
    <FeedPage>
      {children}
      <CustomFeedHeader className="relative">
        {!isSearchOn && (
          <>
            <Link href="/bookmarks/search">
              <Button aria-label="Search bookmarks" icon={<MagnifyingIcon />} />
            </Link>
            <div className="mx-4 w-px h-full bg-theme-bg-tertiary">&nbsp;</div>
            <span className="font-bold typo-callout">Bookmarks</span>
          </>
        )}
        {isSearchOn ? searchChildren : undefined}
      </CustomFeedHeader>
      {tokenRefreshed && <Feed {...feedProps} />}
    </FeedPage>
  );
}
