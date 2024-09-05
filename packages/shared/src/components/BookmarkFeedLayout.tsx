import classNames from 'classnames';
import dynamic from 'next/dynamic';
import React, {
  ReactElement,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';

import AuthContext from '../contexts/AuthContext';
import {
  BOOKMARKS_FEED_QUERY,
  SEARCH_BOOKMARKS_QUERY,
  supportedTypesForPrivateSources,
} from '../graphql/feed';
import { useFeedLayout } from '../hooks';
import { generateQueryKey, OtherFeedPage, RequestKey } from '../lib/query';
import BookmarkEmptyScreen from './BookmarkEmptyScreen';
import { Button, ButtonVariant } from './buttons/Button';
import Feed, { FeedProps } from './Feed';
import { ShareIcon } from './icons';
import SearchEmptyScreen from './SearchEmptyScreen';
import { CustomFeedHeader, FeedPageHeader } from './utilities';

export type BookmarkFeedLayoutProps = {
  searchQuery?: string;
  children?: ReactNode;
  searchChildren: ReactNode;
  onSearchButtonClick?: () => unknown;
};

const SharedBookmarksModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "sharedBookmarksModal" */ './modals/SharedBookmarksModal'
    ),
);

export default function BookmarkFeedLayout({
  searchQuery,
  searchChildren,
  children,
}: BookmarkFeedLayoutProps): ReactElement {
  const {
    shouldUseListFeedLayout,
    FeedPageLayoutComponent,
    shouldUseListMode,
  } = useFeedLayout();
  const { user, tokenRefreshed } = useContext(AuthContext);
  const [showEmptyScreen, setShowEmptyScreen] = useState(false);
  const [showSharedBookmarks, setShowSharedBookmarks] = useState(false);
  const defaultKey = generateQueryKey(RequestKey.Bookmarks, user);
  const feedProps = useMemo<FeedProps<unknown>>(() => {
    if (searchQuery) {
      return {
        feedName: OtherFeedPage.SearchBookmarks,
        feedQueryKey: defaultKey.concat(searchQuery),
        query: SEARCH_BOOKMARKS_QUERY,
        variables: {
          query: searchQuery,
          supportedTypes: supportedTypesForPrivateSources,
        },
        emptyScreen: <SearchEmptyScreen />,
      };
    }
    return {
      feedName: OtherFeedPage.Bookmarks,
      feedQueryKey: defaultKey,
      query: BOOKMARKS_FEED_QUERY,
      variables: {
        supportedTypes: supportedTypesForPrivateSources,
      },
      onEmptyFeed: () => setShowEmptyScreen(true),
      options: { refetchOnMount: true },
    };
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, user]);

  if (showEmptyScreen) {
    return <BookmarkEmptyScreen />;
  }

  const shareBookmarksButton = (style: string, text?: string) => (
    <Button
      className={style}
      variant={ButtonVariant.Secondary}
      icon={<ShareIcon secondary={showSharedBookmarks} />}
      onClick={() => setShowSharedBookmarks(true)}
    >
      {text}
    </Button>
  );

  return (
    <FeedPageLayoutComponent>
      {children}
      <FeedPageHeader className="mb-5">
        <h1 className="font-bold typo-callout">Bookmarks</h1>
      </FeedPageHeader>
      <CustomFeedHeader
        className={classNames(
          'mb-6',
          shouldUseListFeedLayout && !shouldUseListMode && 'px-4',
        )}
      >
        {searchChildren}
        {shareBookmarksButton('hidden laptop:flex ml-4', 'Share bookmarks')}
        {shareBookmarksButton('flex laptop:hidden ml-4')}
      </CustomFeedHeader>

      {showSharedBookmarks && (
        <SharedBookmarksModal
          isOpen={showSharedBookmarks}
          onRequestClose={() => setShowSharedBookmarks(false)}
        />
      )}
      {tokenRefreshed && <Feed {...feedProps} />}
    </FeedPageLayoutComponent>
  );
}
