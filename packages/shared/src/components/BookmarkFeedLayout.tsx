import type { PropsWithChildren, ReactElement, ReactNode } from 'react';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  BOOKMARKS_FEED_QUERY,
  SEARCH_BOOKMARKS_QUERY,
  supportedTypesForPrivateSources,
} from '../graphql/feed';
import AuthContext from '../contexts/AuthContext';
import { CustomFeedHeader, FeedPageHeader } from './utilities';
import SearchEmptyScreen from './SearchEmptyScreen';
import type { FeedProps } from './Feed';
import Feed from './Feed';
import BookmarkEmptyScreen from './BookmarkEmptyScreen';
import type { ButtonProps } from './buttons/Button';
import { Button, ButtonVariant } from './buttons/Button';
import { ShareIcon } from './icons';
import { generateQueryKey, OtherFeedPage, RequestKey } from '../lib/query';
import {
  useFeedLayout,
  usePlusSubscription,
  useViewSize,
  ViewSize,
} from '../hooks';
import { BookmarkSection } from './sidebar/sections/BookmarkSection';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from './typography/Typography';
import type { BookmarkFolder } from '../graphql/bookmarks';
import { BookmarkFolderContextMenu } from './bookmark/BookmarkFolderContextMenu';

export type BookmarkFeedLayoutProps = {
  isReminderOnly?: boolean;
  searchQuery?: string;
  children?: ReactNode;
  searchChildren: ReactNode;
  onSearchButtonClick?: () => unknown;
  folder?: BookmarkFolder;
  title?: string;
};

const SharedBookmarksModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "sharedBookmarksModal" */ './modals/SharedBookmarksModal'
    ),
);

const ShareBookmarksButton = ({
  children,
  ...props
}: PropsWithChildren<
  Pick<ButtonProps<'button'>, 'className' | 'onClick' | 'icon'>
>) => (
  <Button variant={ButtonVariant.Secondary} {...props}>
    {children}
  </Button>
);

export default function BookmarkFeedLayout({
  searchQuery,
  searchChildren,
  children,
  folder,
  title = 'Bookmarks',
  isReminderOnly,
}: BookmarkFeedLayoutProps): ReactElement {
  const {
    shouldUseListFeedLayout,
    FeedPageLayoutComponent,
    shouldUseListMode,
  } = useFeedLayout();
  const [isHydrated, setIsHydrated] = useState(false);
  const { showPlusSubscription } = usePlusSubscription();
  const { user, tokenRefreshed } = useContext(AuthContext);
  const [showSharedBookmarks, setShowSharedBookmarks] = useState(false);
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isFolderPage = !!folder || isReminderOnly;
  const listId = folder?.id;
  const feedQueryKey = useMemo(
    () =>
      generateQueryKey(RequestKey.Bookmarks, user, {
        listId,
        isReminderOnly,
        searchQuery,
      }),
    [user, listId, isReminderOnly, searchQuery],
  );

  const feedProps = useMemo<FeedProps<unknown>>(() => {
    if (searchQuery) {
      return {
        feedName: OtherFeedPage.SearchBookmarks,
        feedQueryKey,
        query: SEARCH_BOOKMARKS_QUERY,
        variables: {
          query: searchQuery,
          supportedTypes: supportedTypesForPrivateSources,
        },
        emptyScreen: <SearchEmptyScreen />,
      };
    }

    const folderFeed = isReminderOnly
      ? OtherFeedPage.BookmarkLater
      : OtherFeedPage.BookmarkFolder;
    const feedName = isFolderPage ? folderFeed : OtherFeedPage.Bookmarks;

    return {
      feedName,
      feedQueryKey,
      query: BOOKMARKS_FEED_QUERY,
      variables: {
        ...(listId && { listId }),
        reminderOnly: isReminderOnly,
        supportedTypes: supportedTypesForPrivateSources,
      },
      emptyScreen: (
        <BookmarkEmptyScreen
          {...(listId && {
            title: 'Your folder is feeling a little empty',
            description:
              'Start saving bookmarks to keep everything you need, right where you want it.',
          })}
        />
      ),
      options: { refetchOnMount: true },
    };
  }, [searchQuery, feedQueryKey, listId, isReminderOnly, isFolderPage]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null;
  }

  return (
    <FeedPageLayoutComponent>
      {children}
      <FeedPageHeader className="mb-5">
        <Typography bold type={TypographyType.Title3} tag={TypographyTag.H1}>
          {title}
        </Typography>
      </FeedPageHeader>
      <CustomFeedHeader
        className={shouldUseListFeedLayout && !shouldUseListMode && 'px-4'}
      >
        {searchChildren}
        {!isFolderPage && (
          <ShareBookmarksButton
            aria-label="Share bookmarks"
            className="ml-4 flex"
            icon={<ShareIcon secondary={showSharedBookmarks} aria-hidden />}
            onClick={() => setShowSharedBookmarks(true)}
          >
            {isLaptop ? <span>Share bookmarks</span> : null}
          </ShareBookmarksButton>
        )}
        {isFolderPage && !isReminderOnly && (
          <BookmarkFolderContextMenu folder={folder} />
        )}
      </CustomFeedHeader>

      {showSharedBookmarks && (
        <SharedBookmarksModal
          isOpen={showSharedBookmarks}
          onRequestClose={() => setShowSharedBookmarks(false)}
        />
      )}
      {showPlusSubscription && (
        <div className="mb-4 laptop:hidden">
          <BookmarkSection
            isItemsButton={false}
            sidebarExpanded
            shouldShowLabel
            activePage=""
          />
        </div>
      )}
      {tokenRefreshed && <Feed {...feedProps} />}
    </FeedPageLayoutComponent>
  );
}
