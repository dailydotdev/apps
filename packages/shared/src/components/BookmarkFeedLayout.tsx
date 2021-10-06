import React, { ReactElement, ReactNode, useContext, useState } from 'react';
import Link from 'next/link';
import Feed from './Feed';
import AuthContext from '../contexts/AuthContext';
import { Button } from './buttons/Button';
import { FeedPage } from './utilities';
import { headerHeight } from '@dailydotdev/shared/src/styles/sizes';
import sizeN from '@dailydotdev/shared/macros/sizeN.macro';
import { BOOKMARKS_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import BookmarkIcon from '@dailydotdev/shared/icons/bookmark.svg';

export type BookmarkFeedLayoutProps = {
  isSearchOn: boolean;
  searchQuery?: string;
  children?: ReactNode;
  onSearchButtonClick?: () => unknown;
};

export default function BookmarkFeedLayout({
  searchQuery,
  isSearchOn,
  children,
}: BookmarkFeedLayoutProps): ReactElement {
  const { user, tokenRefreshed } = useContext(AuthContext);

  const [showEmptyScreen, setShowEmptyScreen] = useState(false);
  if (showEmptyScreen) {
    return (
      <main
        className="fixed inset-0 flex flex-col items-center justify-center px-6 withNavBar text-theme-label-secondary"
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
      {tokenRefreshed && (
        <Feed
          feedQueryKey={['bookmarks', user?.id ?? 'anonymous']}
          query={BOOKMARKS_FEED_QUERY}
          onEmptyFeed={() => setShowEmptyScreen(true)}
          className="my-3"
        />
      )}
    </FeedPage>
  );
}
