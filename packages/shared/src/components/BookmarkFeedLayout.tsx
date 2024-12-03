import React, {
  ReactElement,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import classNames from 'classnames';
import {
  BOOKMARKS_FEED_QUERY,
  SEARCH_BOOKMARKS_QUERY,
  supportedTypesForPrivateSources,
} from '../graphql/feed';
import AuthContext from '../contexts/AuthContext';
import { CustomFeedHeader, FeedPageHeader } from './utilities';
import SearchEmptyScreen from './SearchEmptyScreen';
import Feed, { FeedProps } from './Feed';
import BookmarkEmptyScreen from './BookmarkEmptyScreen';
import { Button, ButtonVariant } from './buttons/Button';
import { PlusIcon, ShareIcon } from './icons';
import { generateQueryKey, OtherFeedPage, RequestKey } from '../lib/query';
import { useFeedLayout, usePlusSubscription } from '../hooks';
import { useLazyModal } from '../hooks/useLazyModal';
import { LazyModal } from './modals/common/types';
import { IconSize } from './Icon';

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
  const { openModal } = useLazyModal();
  const { showPlusSubscription } = usePlusSubscription();
  const { user, tokenRefreshed } = useContext(AuthContext);
  const [showEmptyScreen, setShowEmptyScreen] = useState(false);
  const [showSharedBookmarks, setShowSharedBookmarks] = useState(false);
  const defaultKey = useMemo(
    () => generateQueryKey(RequestKey.Bookmarks, user),
    [user],
  );
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
  }, [defaultKey, searchQuery]);

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
      {showPlusSubscription && (
        <div className="mb-4 px-4 tablet:hidden">
          <Button
            className="w-full"
            variant={ButtonVariant.Tertiary}
            onClick={() => {
              openModal({
                type: LazyModal.BookmarkFolderSoon,
                props: {},
              });
            }}
          >
            <div className="flex items-center justify-center rounded-6 bg-background-subtle">
              <PlusIcon size={IconSize.Small} />
            </div>
            <div className="w-full pl-4 text-left">New folder</div>
          </Button>
        </div>
      )}
      {tokenRefreshed && <Feed {...feedProps} />}
    </FeedPageLayoutComponent>
  );
}
