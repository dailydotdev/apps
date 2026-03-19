import type { PropsWithChildren, ReactElement, ReactNode } from 'react';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import classNames from 'classnames';
import {
  BookmarkSort,
  BOOKMARKS_FEED_QUERY,
  SEARCH_BOOKMARKS_QUERY,
  supportedTypesForPrivateSources,
} from '../graphql/feed';
import { ClientQuestEventType } from '../graphql/quests';
import AuthContext from '../contexts/AuthContext';
import { CustomFeedHeader, FeedPageHeader } from './utilities';
import SearchEmptyScreen from './SearchEmptyScreen';
import type { FeedProps } from './Feed';
import Feed from './Feed';
import BookmarkEmptyScreen from './BookmarkEmptyScreen';
import type { ButtonProps } from './buttons/Button';
import { Button, ButtonSize, ButtonVariant } from './buttons/Button';
import { ShareIcon, SortIcon } from './icons';
import { generateQueryKey, OtherFeedPage, RequestKey } from '../lib/query';
import { useFeedLayout, useViewSize, ViewSize } from '../hooks';
import { BookmarkSection } from './sidebar/sections/BookmarkSection';
import PlusMobileEntryBanner from './banners/PlusMobileEntryBanner';
import { DigestBookmarkBanner } from './notifications/DigestBookmarkBanner';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from './typography/Typography';
import type { BookmarkFolder } from '../graphql/bookmarks';
import { BookmarkFolderContextMenu } from './bookmark/BookmarkFolderContextMenu';
import { TargetType } from '../lib/log';
import usePlusEntry from '../hooks/usePlusEntry';
import usePersistentContext from '../hooks/usePersistentContext';
import { useTrackQuestClientEvent } from '../hooks/useTrackQuestClientEvent';
import { Dropdown } from './fields/Dropdown';
import { IconSize } from './Icon';

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

const bookmarkSortOptions = [
  { label: 'Newest first', value: BookmarkSort.TimeDesc },
  { label: 'Oldest first', value: BookmarkSort.TimeAsc },
];
const bookmarkSortOptionLabels = bookmarkSortOptions.map(({ label }) => label);

const BOOKMARK_SORT_KEY = 'bookmark:sort';
const DEFAULT_BOOKMARK_SORT_INDEX = 0;

export default function BookmarkFeedLayout({
  searchQuery,
  searchChildren,
  children,
  folder,
  title = 'Bookmarks',
  isReminderOnly,
}: BookmarkFeedLayoutProps): ReactElement {
  const [isHydrated, setIsHydrated] = useState(false);
  const {
    shouldUseListFeedLayout,
    FeedPageLayoutComponent,
    shouldUseListMode,
  } = useFeedLayout();
  const { user, tokenRefreshed } = useContext(AuthContext);
  const [showSharedBookmarks, setShowSharedBookmarks] = useState(false);
  const [selectedSort, setSelectedSort, loadedSort] = usePersistentContext(
    BOOKMARK_SORT_KEY,
    DEFAULT_BOOKMARK_SORT_INDEX,
    [0, 1],
    DEFAULT_BOOKMARK_SORT_INDEX,
  );
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isSearchResults = !!searchQuery;
  const isFolderPage = !!folder || isReminderOnly;
  const listId = folder?.id;
  const selectedSortValue =
    bookmarkSortOptions[selectedSort]?.value ?? BookmarkSort.TimeDesc;
  useTrackQuestClientEvent({
    eventType: ClientQuestEventType.VisitReadItLaterPage,
    enabled: !!isReminderOnly && !isSearchResults,
  });
  const feedQueryKey = useMemo(
    () =>
      generateQueryKey(RequestKey.Bookmarks, user, {
        listId,
        isReminderOnly,
        searchQuery,
        ...(!isSearchResults && { sort: selectedSortValue }),
      }),
    [
      user,
      listId,
      isReminderOnly,
      searchQuery,
      selectedSortValue,
      isSearchResults,
    ],
  );
  const { plusEntryBookmark } = usePlusEntry();
  const [isEmptyFeed, setIsEmptyFeed] = useState(false);
  const onEmptyFeed = useCallback(() => setIsEmptyFeed(true), []);
  const feedProps = useMemo<FeedProps<unknown>>(() => {
    if (isSearchResults) {
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
        sort: selectedSortValue,
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
  }, [
    isSearchResults,
    searchQuery,
    feedQueryKey,
    listId,
    isReminderOnly,
    isFolderPage,
    selectedSortValue,
  ]);

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
        className={classNames(
          'mb-6',
          shouldUseListFeedLayout && !shouldUseListMode && 'px-4',
        )}
      >
        {searchChildren}
        {!isSearchResults && (
          <Dropdown
            className={{
              label: 'hidden',
              chevron: 'hidden',
              button: '!px-1',
              container: 'ml-4 flex',
            }}
            shouldIndicateSelected
            icon={<SortIcon size={IconSize.Medium} />}
            iconOnly
            selectedIndex={selectedSort}
            options={bookmarkSortOptionLabels}
            onChange={(_, index) => setSelectedSort(index)}
            buttonVariant={ButtonVariant.Float}
            buttonSize={ButtonSize.Medium}
            drawerProps={{ displayCloseButton: true }}
          />
        )}
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
      <div className="relative mb-4 laptop:hidden">
        <BookmarkSection
          isItemsButton={false}
          sidebarExpanded
          shouldShowLabel
          activePage=""
        />
        {plusEntryBookmark && (
          <PlusMobileEntryBanner
            arrow
            targetType={TargetType.PlusEntryBookmarkTab}
            {...plusEntryBookmark}
          />
        )}
      </div>
      {/* Digest upsell only shown when bookmarks are empty to engage new/inactive users */}
      {!plusEntryBookmark && isEmptyFeed && <DigestBookmarkBanner />}
      {tokenRefreshed && (isSearchResults || loadedSort) && (
        <Feed {...feedProps} onEmptyFeed={onEmptyFeed} />
      )}
    </FeedPageLayoutComponent>
  );
}
