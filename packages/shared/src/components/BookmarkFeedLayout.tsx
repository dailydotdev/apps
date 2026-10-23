import type { ReactElement, ReactNode } from 'react';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { webappUrl } from '../lib/constants';
import {
  BookmarkSort,
  BOOKMARKS_FEED_QUERY,
  SEARCH_BOOKMARKS_QUERY,
  baseFeedSupportedTypes,
} from '../graphql/feed';
import { ClientQuestEventType } from '../graphql/quests';
import AuthContext from '../contexts/AuthContext';
import { CustomFeedHeader, FeedPageHeader } from './utilities';
import SearchEmptyScreen from './SearchEmptyScreen';
import type { FeedProps } from './Feed';
import Feed from './Feed';
import BookmarkEmptyScreen from './BookmarkEmptyScreen';
import { Button, ButtonSize, ButtonVariant } from './buttons/Button';
import { ShareIcon, SortIcon } from './icons';
import { generateQueryKey, OtherFeedPage, RequestKey } from '../lib/query';
import { useFeedLayout, useViewSize, ViewSize } from '../hooks';
import { useIsPhone } from '../hooks/useViewSize';
import { useLaptopLayout } from '../hooks/layout/useLaptopLayout';
import { PageHeader } from './layout/PageHeader';
import { BookmarkSection } from './sidebar/sections/BookmarkSection';
import { ShellPage } from './shell/ShellPageContext';
import { Segments, ShellRow } from './shell/ShellRow';
import { useBookmarkFolderList } from '../hooks/bookmark';
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
import { BookmarkFoldersStrip } from './plus/BookmarkFoldersStrip';
import { PlaceholderFeed } from './cards/placeholder/PlaceholderFeed';
import { v2FeedSideInsetClass } from './feeds/FeedContainer';
import { feedGutter } from './utilities/common';

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
  const router = useRouter();
  const { folders: bookmarkFolders } = useBookmarkFolderList();
  const bookmarkPath = (router.asPath ?? router.pathname ?? '').split('?')[0];
  const { shouldUseListFeedLayout, FeedPageLayoutComponent } = useFeedLayout();
  const { user, tokenRefreshed } = useContext(AuthContext);
  const [showSharedBookmarks, setShowSharedBookmarks] = useState(false);
  const [selectedSort, setSelectedSort, loadedSort] = usePersistentContext(
    BOOKMARK_SORT_KEY,
    DEFAULT_BOOKMARK_SORT_INDEX,
    [0, 1],
    DEFAULT_BOOKMARK_SORT_INDEX,
  );
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isPhone = useIsPhone();
  const isLaptopLayout = useLaptopLayout();
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
          supportedTypes: baseFeedSupportedTypes,
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
        supportedTypes: baseFeedSupportedTypes,
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

  const blockButtonClassName = isPhone
    ? 'shell-material !size-[2.375rem] !rounded-14 !p-0'
    : undefined;

  const sortDropdown = !isSearchResults && (
    <Dropdown
      className={{
        label: 'hidden',
        chevron: 'hidden',
        button: blockButtonClassName ?? (isLaptopLayout ? undefined : '!px-1'),
        container: isLaptopLayout || isPhone ? 'flex' : 'ml-4 flex',
      }}
      shouldIndicateSelected
      buttonAriaLabel="Sort"
      icon={
        <SortIcon size={isLaptopLayout ? IconSize.XSmall : IconSize.Medium} />
      }
      iconOnly
      selectedIndex={selectedSort}
      options={bookmarkSortOptionLabels}
      onChange={(_, index) => setSelectedSort(index)}
      buttonVariant={
        isLaptopLayout || isPhone ? ButtonVariant.Tertiary : ButtonVariant.Float
      }
      buttonSize={isLaptopLayout ? ButtonSize.Small : ButtonSize.Medium}
      drawerProps={{ displayCloseButton: true }}
    />
  );
  const shareButton = !isFolderPage && (
    <Button
      aria-label="Share bookmarks"
      className={
        blockButtonClassName ?? (isLaptopLayout ? undefined : 'ml-4 flex')
      }
      icon={
        <ShareIcon
          size={isLaptopLayout ? IconSize.XSmall : IconSize.Medium}
          secondary={showSharedBookmarks}
          aria-hidden
        />
      }
      onClick={() => setShowSharedBookmarks(true)}
      size={isLaptopLayout ? ButtonSize.Small : ButtonSize.Medium}
      variant={
        isLaptopLayout || isPhone
          ? ButtonVariant.Tertiary
          : ButtonVariant.Secondary
      }
    >
      {isLaptop ? <span>Share bookmarks</span> : null}
    </Button>
  );
  const folderMenu = folder && !isReminderOnly && (
    <BookmarkFolderContextMenu
      folder={folder}
      buttonProps={
        isLaptopLayout
          ? {
              className: 'flex',
              size: ButtonSize.Small,
              variant: ButtonVariant.Tertiary,
            }
          : undefined
      }
    />
  );
  const headerTitleSlot = isLaptopLayout ? (
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

  // The strip renders in the feed's top slot, not above the feed, so it
  // shares the feed's gutter and width. The slot is a sibling of the v2 grid,
  // so it repeats the grid's side inset (same as the feed hero), and the grid
  // already opens with its own top inset, so no bottom margin there.
  const isV2Grid = isLaptopLayout && !shouldUseListFeedLayout;
  const foldersStrip =
    !plusEntryBookmark && !isSearchResults && !isFolderPage ? (
      <BookmarkFoldersStrip
        feedQueryKey={feedQueryKey}
        className={isV2Grid ? classNames(v2FeedSideInsetClass, 'pt-6') : 'mb-6'}
      />
    ) : undefined;

  return (
    <>
      {/* v2 hoists the page-header strip OUT of FeedPageLayoutComponent
          so it spans the full floating-card width without being clamped
          by `FeedPageLayoutList`'s 680px laptop max-width. */}
      {isLaptopLayout && (
        <PageHeader title={headerTitleSlot}>
          {sortDropdown}
          {shareButton}
          {folderMenu}
        </PageHeader>
      )}
      <FeedPageLayoutComponent>
        {children}
        {/* FeedPage no longer pads the page sideways: the feed's inset is
            `feedGutter`, which MainFeedLayout passes to its feed. Without it
            here the header, the folder list and the cards all ran flush
            against the sidebar and the window edge. It resolves to zero
            inside the v2 floating card, so v2 is unchanged. */}
        {!isLaptopLayout && (
          <div className={classNames('flex w-full flex-col', feedGutter)}>
            <FeedPageHeader className="mb-5">
              <Typography
                bold
                type={TypographyType.Title3}
                tag={TypographyTag.H1}
              >
                {title}
              </Typography>
            </FeedPageHeader>
            {isPhone && searchChildren}
            <CustomFeedHeader className="mb-6 hidden tablet:flex">
              {!isPhone && searchChildren}
              {!isPhone && (
                <span className="hidden tablet:contents">
                  {sortDropdown}
                  {shareButton}
                  {folderMenu}
                </span>
              )}
            </CustomFeedHeader>
          </div>
        )}

        {showSharedBookmarks && (
          <SharedBookmarksModal
            isOpen={showSharedBookmarks}
            onRequestClose={() => setShowSharedBookmarks(false)}
          />
        )}
        <ShellPage
          title="Bookmarks"
          actions={
            <div className="flex items-center gap-2">
              {sortDropdown}
              {shareButton}
              {folderMenu}
            </div>
          }
          row={
            <ShellRow>
              <Segments
                items={[
                  {
                    key: 'quick-saves',
                    label: 'Quick saves',
                    href: `${webappUrl}bookmarks`,
                    active: bookmarkPath === '/bookmarks',
                    replace: true,
                  },
                  {
                    key: 'later',
                    label: 'Read it later',
                    href: `${webappUrl}bookmarks/later`,
                    active: bookmarkPath === '/bookmarks/later',
                    replace: true,
                  },
                  ...bookmarkFolders.map((list) => ({
                    key: list.id,
                    label: list.name,
                    href: `${webappUrl}bookmarks/${list.id}`,
                    active: bookmarkPath === `/bookmarks/${list.id}`,
                    replace: true,
                  })),
                ]}
              />
            </ShellRow>
          }
        />
        <div
          className={classNames(
            'relative mb-4 hidden w-full tablet:block laptop:hidden',
            feedGutter,
          )}
        >
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
        {tokenRefreshed && (isSearchResults || loadedSort) ? (
          <Feed
            {...feedProps}
            className={feedGutter}
            topContent={foldersStrip}
            onEmptyFeed={onEmptyFeed}
          />
        ) : (
          isPhone && <PlaceholderFeed className={feedGutter} />
        )}
      </FeedPageLayoutComponent>
    </>
  );
}
