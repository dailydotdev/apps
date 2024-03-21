import React, {
  ReactElement,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import {
  BOOKMARKS_FEED_QUERY,
  SEARCH_BOOKMARKS_QUERY,
  supportedTypesForPrivateSources,
} from '../graphql/feed';
import AuthContext from '../contexts/AuthContext';
import { CustomFeedHeader, FeedPage, FeedPageHeader } from './utilities';
import SearchEmptyScreen from './SearchEmptyScreen';
import Feed, { FeedProps } from './Feed';
import BookmarkEmptyScreen from './BookmarkEmptyScreen';
import { Button, ButtonVariant } from './buttons/Button';
import { ShareIcon } from './icons';
import { generateQueryKey, OtherFeedPage, RequestKey } from '../lib/query';
import GenericFeedItemComponent from './feed/feedItemComponent/GenericFeedItemComponent';

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
  const { user, tokenRefreshed } = useContext(AuthContext);
  const [showEmptyScreen, setShowEmptyScreen] = useState(false);
  const [showSharedBookmarks, setShowSharedBookmarks] = useState(false);
  const defaultKey = generateQueryKey(RequestKey.Bookmarks, user);
  const feedProps = useMemo<FeedProps<unknown>>(() => {
    if (searchQuery) {
      return {
        feedItemComponent: GenericFeedItemComponent,
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
      feedItemComponent: GenericFeedItemComponent,
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
    <FeedPage>
      {children}
      <FeedPageHeader className="mb-5">
        <h3 className="font-bold typo-callout">Bookmarks</h3>
      </FeedPageHeader>
      <CustomFeedHeader className="mb-6 flex">
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
    </FeedPage>
  );
}
