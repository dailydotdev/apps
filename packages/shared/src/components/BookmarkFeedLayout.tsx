import type { ReactElement, ReactNode } from 'react';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { webappUrl } from '../lib/constants';
import {
  BookmarkSort,
  BookmarkStatus,
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
import { useLayoutVariant } from '../hooks/layout/useLayoutVariant';
import { PageHeader } from './layout/PageHeader';
import { BookmarkSection } from './sidebar/sections/BookmarkSection';
import { ShellPage } from './shell/ShellPageContext';
import { Segments, ShellRow } from './shell/ShellRow';
import { useBookmarkFolderList } from '../hooks/bookmark';
import { bookmarkFacetsQueryOptions } from '../graphql/bookmarks';
import { BookmarkFilters } from './bookmark/BookmarkFilters';
import { useLogContext } from '../contexts/LogContext';
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
import { LogEvent, TargetType } from '../lib/log';
import usePlusEntry from '../hooks/usePlusEntry';
import usePersistentContext from '../hooks/usePersistentContext';
import { useTrackQuestClientEvent } from '../hooks/useTrackQuestClientEvent';
import { Dropdown } from './fields/Dropdown';
import { IconSize } from './Icon';
import { BookmarkFoldersStrip } from './plus/BookmarkFoldersStrip';
import { PlaceholderFeed } from './cards/placeholder/PlaceholderFeed';

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
  { label: 'Title A-Z', value: BookmarkSort.TitleAsc },
  { label: 'Shortest read', value: BookmarkSort.ReadTimeAsc },
];
const bookmarkSortOptionLabels = bookmarkSortOptions.map(({ label }) => label);
const bookmarkSortIndexes = bookmarkSortOptions.map((_, index) => index);

const BOOKMARK_SORT_KEY = 'bookmark:sort';
const DEFAULT_BOOKMARK_SORT_INDEX = 0;

const toggleInList = (list: string[], value: string): string[] =>
  list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];

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
    bookmarkSortIndexes,
    DEFAULT_BOOKMARK_SORT_INDEX,
  );
  const { logEvent } = useLogContext();
  const [status, setStatus] = useState<BookmarkStatus>(BookmarkStatus.All);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isPhone = useIsPhone();
  const { isV2 } = useLayoutVariant();
  const isV2Laptop = isV2;
  const isSearchResults = !!searchQuery;
  const isFolderPage = !!folder || isReminderOnly;
  const listId = folder?.id;
  const selectedSortValue =
    bookmarkSortOptions[selectedSort]?.value ?? BookmarkSort.TimeDesc;
  // Filters belong to one view: moving to another folder starts clean
  const canFilter = !isSearchResults && !isReminderOnly;
  const hasFilters = selectedTags.length > 0 || selectedSources.length > 0;
  const isFiltered = hasFilters || status !== BookmarkStatus.All;
  const { data: facets } = useQuery({
    ...bookmarkFacetsQueryOptions({ user, listId, status }),
    enabled: !!user && canFilter,
  });

  useEffect(() => {
    setStatus(BookmarkStatus.All);
    setSelectedTags([]);
    setSelectedSources([]);
  }, [listId, isReminderOnly]);

  const logFilter = useCallback(
    (extra: Record<string, unknown>) =>
      logEvent({
        event_name: LogEvent.FilterBookmarks,
        extra: JSON.stringify(extra),
      }),
    [logEvent],
  );
  const onStatusChange = useCallback(
    (value: BookmarkStatus) => {
      setStatus(value);
      logFilter({ status: value });
    },
    [logFilter],
  );
  const onToggleTag = useCallback(
    (tag: string) => {
      setSelectedTags((list) => toggleInList(list, tag));
      logFilter({ tag });
    },
    [logFilter],
  );
  const onToggleSource = useCallback(
    (sourceId: string) => {
      setSelectedSources((list) => toggleInList(list, sourceId));
      logFilter({ source: sourceId });
    },
    [logFilter],
  );
  const onClearFilters = useCallback(() => {
    setSelectedTags([]);
    setSelectedSources([]);
  }, []);
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
        ...(canFilter &&
          status !== BookmarkStatus.All && {
            status,
          }),
        ...(canFilter && selectedTags.length > 0 && { tags: selectedTags }),
        ...(canFilter &&
          selectedSources.length > 0 && { sources: selectedSources }),
      }),
    [
      user,
      listId,
      isReminderOnly,
      searchQuery,
      selectedSortValue,
      isSearchResults,
      canFilter,
      status,
      selectedTags,
      selectedSources,
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

    const isArchiveView = status === BookmarkStatus.Archived && !hasFilters;
    let emptyScreen: ReactNode;
    if (isFiltered) {
      emptyScreen = (
        <BookmarkEmptyScreen
          title={
            isArchiveView
              ? 'Nothing archived yet'
              : 'Nothing matches these filters'
          }
          description={
            isArchiveView
              ? 'Archive bookmarks you are done with and they will wait here, out of the way.'
              : 'Try another status, tag or source, or clear the filters to see everything you saved.'
          }
        />
      );
    } else if (isReminderOnly) {
      emptyScreen = (
        <BookmarkEmptyScreen
          image={cloudinaryCharmReadLater}
          imageAlt="daily.dev charm kicking back to read posts later"
          title="Nothing to read later yet"
          description="Save posts to read later and they’ll be waiting for you right here."
        />
      );
    } else {
      emptyScreen = (
        <BookmarkEmptyScreen
          {...(listId && {
            title: 'Your folder is feeling a little empty',
            description:
              'Start saving bookmarks to keep everything you need, right where you want it.',
          })}
        />
      );
    }

    return {
      feedName,
      feedQueryKey,
      query: BOOKMARKS_FEED_QUERY,
      variables: {
        ...(listId && { listId }),
        reminderOnly: isReminderOnly,
        sort: selectedSortValue,
        ...(canFilter && status !== BookmarkStatus.All && { status }),
        ...(canFilter && selectedTags.length > 0 && { tags: selectedTags }),
        ...(canFilter &&
          selectedSources.length > 0 && { sources: selectedSources }),
        supportedTypes: baseFeedSupportedTypes,
      },
      emptyScreen,
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
    canFilter,
    status,
    selectedTags,
    selectedSources,
    isFiltered,
    hasFilters,
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
        button: blockButtonClassName ?? (isV2Laptop ? undefined : '!px-1'),
        container: isV2Laptop || isPhone ? 'flex' : 'ml-4 flex',
      }}
      shouldIndicateSelected
      buttonAriaLabel="Sort"
      icon={<SortIcon size={isV2Laptop ? IconSize.XSmall : IconSize.Medium} />}
      iconOnly
      selectedIndex={selectedSort}
      options={bookmarkSortOptionLabels}
      onChange={(_, index) => setSelectedSort(index)}
      buttonVariant={
        isV2Laptop || isPhone ? ButtonVariant.Tertiary : ButtonVariant.Float
      }
      buttonSize={isV2Laptop ? ButtonSize.Small : ButtonSize.Medium}
      drawerProps={{ displayCloseButton: true }}
    />
  );
  const shareButton = !isFolderPage && (
    <Button
      aria-label="Share bookmarks"
      className={blockButtonClassName ?? (isV2Laptop ? undefined : 'ml-4 flex')}
      icon={
        <ShareIcon
          size={isV2Laptop ? IconSize.XSmall : IconSize.Medium}
          secondary={showSharedBookmarks}
          aria-hidden
        />
      }
      onClick={() => setShowSharedBookmarks(true)}
      size={isV2Laptop ? ButtonSize.Small : ButtonSize.Medium}
      variant={
        isV2Laptop || isPhone ? ButtonVariant.Tertiary : ButtonVariant.Secondary
      }
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
            {isPhone && searchChildren}
            <CustomFeedHeader
              className={classNames(
                'mb-6 hidden tablet:flex',
                shouldUseListFeedLayout && !shouldUseListMode && 'px-4',
              )}
            >
              {!isPhone && searchChildren}
              {!isPhone && (
                <span className="hidden tablet:contents">
                  {sortDropdown}
                  {shareButton}
                  {folderMenu}
                </span>
              )}
            </CustomFeedHeader>
          </>
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
        <div className="relative mb-4 hidden tablet:block laptop:hidden">
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
        {!plusEntryBookmark && !isSearchResults && !isFolderPage && (
          <BookmarkFoldersStrip feedQueryKey={feedQueryKey} />
        )}
        {canFilter && (
          <BookmarkFilters
            className={classNames(
              'mb-4',
              shouldUseListFeedLayout && !shouldUseListMode && 'px-4',
            )}
            status={status}
            onStatusChange={onStatusChange}
            facets={facets}
            selectedTags={selectedTags}
            selectedSources={selectedSources}
            onToggleTag={onToggleTag}
            onToggleSource={onToggleSource}
            onClear={onClearFilters}
          />
        )}
        {tokenRefreshed && (isSearchResults || loadedSort) ? (
          <Feed {...feedProps} onEmptyFeed={onEmptyFeed} />
        ) : (
          isPhone && <PlaceholderFeed />
        )}
      </FeedPageLayoutComponent>
    </>
  );
}
