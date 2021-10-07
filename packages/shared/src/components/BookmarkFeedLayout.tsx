import React, {
  ReactElement,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';
import Link from 'next/link';
import MagnifyingIcon from '../../icons/magnifying.svg';
import BookmarkIcon from '../../icons/bookmark.svg';
import sizeN from '../../macros/sizeN.macro';
import { BOOKMARKS_FEED_QUERY, SEARCH_BOOKMARKS_QUERY } from '../graphql/feed';
import { headerHeight } from '../styles/sizes';
import AuthContext from '../contexts/AuthContext';
import { Button } from './buttons/Button';
import { CustomFeedHeader, FeedPage } from './utilities';
import SearchEmptyScreen from './SearchEmptyScreen';
import Feed, { FeedProps } from './Feed';

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
  }, [isSearchOn && searchQuery]);

  if (showEmptyScreen) {
    return (
      <main
        className="flex fixed inset-0 flex-col justify-center items-center px-6 withNavBar text-theme-label-secondary"
        style={{ marginTop: headerHeight }}
      >
        {children}
        <BookmarkIcon
          className="m-0 icon text-theme-label-tertiary"
          style={{ fontSize: sizeN(20) }}
        />
        <h1
          className="my-4 text-center text-theme-label-primary typo-title1"
          style={{ maxWidth: '32.5rem' }}
        >
          Your bookmark list is empty.
        </h1>
        <p className="mb-10 text-center" style={{ maxWidth: '32.5rem' }}>
          Go back to your feed and bookmark posts you’d like to keep or read
          later. Each post you bookmark will be stored here.
        </p>
        <Link href="/" passHref>
          <Button className="btn-primary" tag="a" buttonSize="large">
            Back to feed
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <FeedPage>
      {children}
      <CustomFeedHeader className="relative">
        {!isSearchOn && (
          <>
            <Link href="/bookmarks/search">
              <a className="flex relative flex-row justify-center items-center font-bold no-underline border cursor-pointer select-none shadow-none iconOnly small btn typo-callout focus-outline btn-tertiary">
                <MagnifyingIcon />
              </a>
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
