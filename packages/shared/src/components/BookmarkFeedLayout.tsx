import type { ReactElement, ReactNode } from 'react';
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
import { CustomFeedHeader, FeedPageHeader } from './utilities/common';
import SearchEmptyScreen from './SearchEmptyScreen';
import type { FeedProps } from './Feed';
import Feed from './Feed';
import BookmarkEmptyScreen from './BookmarkEmptyScreen';
import { Button, ButtonSize, ButtonVariant } from './buttons/Button';
import { ShareIcon, SortIcon } from './icons';
import { generateQueryKey, OtherFeedPage, RequestKey } from '../lib/query';
import { useFeedLayout } from '../hooks/useFeedLayout';
import { useViewSize, ViewSize } from '../hooks/useViewSize';
import { useLayoutVariant } from '../hooks/layout/useLayoutVariant';
import { PageHeader } from './layout/PageHeader';
import { BookmarkSection } from './sidebar/sections/BookmarkSection';
import PlusMobileEntryBanner from './marketing/banners/PlusMobileEntryBanner';
import { DigestBookmarkBanner } from './marketing/banners/DigestBookmarkBanner';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from './typography/Typography';
import type { BookmarkFolder } from '../graphql/bookmarks';
import { cloudinaryCharmReadLater } from '../lib/image';
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
}: BookmarkFeedLayoutProps): ReactElement | null {
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
  const { isV2 } = useLayoutVariant();
  const isV2Laptop = isV2;
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
      emptyScreen: isReminderOnly ? (
        <BookmarkEmptyScreen
          image={cloudinaryCharmReadLater}
          imageAlt="daily.dev charm kicking back to read posts later"
          title="Nothing to read later yet"
          description="Save posts to read later and they’ll be waiting for you right here."
        />
      ) : (
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

  const sortDropdown = !isSearchResults && (
    <Dropdown
      className={{
        label: 'hidden',
        chevron: 'hidden',
        button: isV2Laptop ? undefined : '!px-1',
        container: isV2Laptop ? 'flex' : 'ml-4 flex',
      }}
      shouldIndicateSelected
      icon={<SortIcon size={isV2Laptop ? IconSize.XSmall : IconSize.Medium} />}
      iconOnly
      selectedIndex={selectedSort}
      options={bookmarkSortOptionLabels}
      onChange={(_, index) => setSelectedSort(index)}
      buttonVariant={isV2Laptop ? ButtonVariant.Tertiary : ButtonVariant.Float}
      buttonSize={isV2Laptop ? ButtonSize.Small : ButtonSize.Medium}
      drawerProps={{ displayCloseButton: true }}
    />
  );
  const shareButton = !isFolderPage && (
    <Button
      aria-label="Share bookmarks"
      className={isV2Laptop ? undefined : 'ml-4 flex'}
      icon={
        <ShareIcon
          size={isV2Laptop ? IconSize.XSmall : IconSize.Medium}
          secondary={showSharedBookmarks}
          aria-hidden
        />
      }
      onClick={() => setShowSharedBookmarks(true)}
      size={isV2Laptop ? ButtonSize.Small : ButtonSize.Medium}
      variant={isV2Laptop ? ButtonVariant.Tertiary : ButtonVariant.Secondary}
    >
      {isLaptop ? <span>Share bookmarks</span> : null}
    </Button>
  );
  const folderMenu = folder && !isReminderOnly && (
    <BookmarkFolderContextMenu
      folder={folder}
      buttonProps={
        isV2Laptop
          ? {
              className: 'flex',
              size: ButtonSize.Small,
              variant: ButtonVariant.Tertiary,
            }
          : undefined
      }
    />
  );
  const headerTitleSlot = isV2Laptop ? (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <Typography
        bold
        type={TypographyType.Callout}
        tag={TypographyTag.H1}
        truncate
        className="min-w-0 shrink"
      >
        {title}
      </Typography>
      {searchChildren && (
        <div className="min-w-0 max-w-[20rem] flex-1">{searchChildren}</div>
      )}
    </div>
  ) : (
    title
  );

  return (
    <>
      {/* v2 hoists the page-header strip OUT of FeedPageLayoutComponent
          so it spans the full floating-card width without being clamped
          by `FeedPageLayoutList`'s 680px laptop max-width. */}
      {isV2Laptop && (
        <PageHeader title={headerTitleSlot}>
          {sortDropdown}
          {shareButton}
          {folderMenu}
        </PageHeader>
      )}
      <FeedPageLayoutComponent>
        {children}
        {!isV2Laptop && (
          <>
            <FeedPageHeader className="mb-5">
              <Typography
                bold
                type={TypographyType.Title3}
                tag={TypographyTag.H1}
              >
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
              {sortDropdown}
              {shareButton}
              {folderMenu}
            </CustomFeedHeader>
          </>
        )}

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
    </>
  );
}
