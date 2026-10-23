import type { KeyboardEvent, ReactElement, ReactNode } from 'react';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import type { Post } from '../graphql/posts';
import AuthContext from '../contexts/AuthContext';
import { ActiveFeedContext } from '../contexts/ActiveFeedContext';
import { useLogContext } from '../contexts/LogContext';
import SearchEmptyScreen from './SearchEmptyScreen';
import BookmarkEmptyScreen from './BookmarkEmptyScreen';
import { Button, ButtonSize, ButtonVariant } from './buttons/Button';
import { ShareIcon, SortIcon } from './icons';
import { IconSize } from './Icon';
import {
  generateQueryKey,
  OtherFeedPage,
  RequestKey,
  updatePostCache,
} from '../lib/query';
import { LogEvent, Origin, TargetType } from '../lib/log';
import { SearchProviderEnum } from '../graphql/search';
import { getPostPath } from '../lib/links';
import { defaultSearchDebounceMs } from '../lib/func';
import {
  cloudinaryCharmBookmarks,
  cloudinaryCharmReadLater,
} from '../lib/image';
import useFeed from '../hooks/useFeed';
import type { PostItem } from '../hooks/useFeed';
import useFeedInfiniteScroll, {
  InfiniteScrollScreenOffset,
} from '../hooks/feed/useFeedInfiniteScroll';
import useDebounceFn from '../hooks/useDebounceFn';
import { useBookmarkPost } from '../hooks/useBookmarkPost';
import { useBookmarkFolderList } from '../hooks/bookmark';
import usePlusEntry from '../hooks/usePlusEntry';
import usePersistentContext from '../hooks/usePersistentContext';
import { useTrackQuestClientEvent } from '../hooks/useTrackQuestClientEvent';
import { useIsPhone } from '../hooks/useViewSize';
import { useLaptopLayout } from '../hooks/layout/useLaptopLayout';
import { FeedItemType } from './cards/common/common';
import { BookmarkSection } from './sidebar/sections/BookmarkSection';
import { ShellPage } from './shell/ShellPageContext';
import { ShellField } from './shell/ShellField';
import { Segments, ShellRow } from './shell/ShellRow';
import { SearchField } from './fields/SearchField';
import { Dropdown } from './fields/Dropdown';
import { bookmarkFacetsQueryOptions } from '../graphql/bookmarks';
import type { BookmarkFolder } from '../graphql/bookmarks';
import { BookmarkFilters } from './bookmark/BookmarkFilters';
import { BookmarkRow } from './bookmark/BookmarkRow';
import { BookmarkFolderContextMenu } from './bookmark/BookmarkFolderContextMenu';
import { PostPane } from './post/PostPane';
import { PageHeader } from './layout/PageHeader';
import { BookmarkPaneSheet } from './bookmark/BookmarkPaneSheet';
import PlusMobileEntryBanner from './marketing/banners/PlusMobileEntryBanner';
import { DigestBookmarkBanner } from './marketing/banners/DigestBookmarkBanner';
import { BookmarkFoldersStrip } from './plus/BookmarkFoldersStrip';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from './typography/Typography';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from './charm/CharmEmptyState';
import { ReadingHistoryListPlaceholder } from './history/ReadingHistoryListPlaceholder';

export type BookmarkFeedLayoutProps = {
  isReminderOnly?: boolean;
  children?: ReactNode;
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
// Rows are short, so a page is longer than the card grid's.
const PAGE_SIZE = 20;

const toggleInList = (list: string[], value: string): string[] =>
  list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];

/**
 * The bookmarks page in the reader-pane frame: the saved posts are a column
 * of rows beside the selected post on a laptop, and a plain list that opens
 * the post page below that. Search, read status and the tag, source and
 * squad filters all narrow the same list.
 */
export default function BookmarkFeedLayout({
  children,
  folder,
  title = 'Bookmarks',
  isReminderOnly,
}: BookmarkFeedLayoutProps): ReactElement | null {
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
  const client = useQueryClient();
  const { folders: bookmarkFolders } = useBookmarkFolderList();
  const bookmarkPath = (router.asPath ?? router.pathname ?? '').split('?')[0];
  const { user } = useContext(AuthContext);
  const { logEvent } = useLogContext();
  const isPhone = useIsPhone();
  const showPane = useLaptopLayout();
  const [showSharedBookmarks, setShowSharedBookmarks] = useState(false);
  const [selectedSort, setSelectedSort, loadedSort] = usePersistentContext(
    BOOKMARK_SORT_KEY,
    DEFAULT_BOOKMARK_SORT_INDEX,
    bookmarkSortIndexes,
    DEFAULT_BOOKMARK_SORT_INDEX,
  );
  const [status, setStatus] = useState<BookmarkStatus>(BookmarkStatus.All);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  // The selected post stays in the pane while a search or filter leaves it
  // out of the list, until another row is picked.
  const [selectedPost, setSelectedPost] = useState<Post>();
  const currentRef = useRef<Post>();
  const listRef = useRef<HTMLElement>(null);

  const searchQuery = router.query?.q?.toString()?.trim() ?? '';
  const queryPostId = router.query?.post?.toString();
  const [draft, setDraft] = useState(searchQuery);
  const isSearchResults = !!searchQuery;
  const isFolderPage = !!folder || isReminderOnly;
  const listId = folder?.id;
  const selectedSortValue =
    bookmarkSortOptions[selectedSort]?.value ?? BookmarkSort.TimeDesc;
  // Search runs over titles, so the tag and source filters step aside
  const canFilter = !isSearchResults;
  const activeTags = useMemo(
    () => (canFilter ? selectedTags : []),
    [canFilter, selectedTags],
  );
  const activeSources = useMemo(
    () => (canFilter ? selectedSources : []),
    [canFilter, selectedSources],
  );
  const hasFilters = activeTags.length > 0 || activeSources.length > 0;
  const isFiltered =
    hasFilters || status !== BookmarkStatus.All || isSearchResults;

  const { data: facets } = useQuery({
    ...bookmarkFacetsQueryOptions({
      user,
      listId,
      status,
      reminderOnly: !!isReminderOnly,
    }),
    enabled: !!user && canFilter,
  });

  // Filters belong to one view: moving to another folder starts clean
  useEffect(() => {
    setStatus(BookmarkStatus.All);
    setSelectedTags([]);
    setSelectedSources([]);
    setSelectedId(undefined);
    setSelectedPost(undefined);
  }, [listId, isReminderOnly]);

  useEffect(() => {
    setDraft((value) => (value.trim() === searchQuery ? value : searchQuery));
  }, [searchQuery]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useTrackQuestClientEvent({
    eventType: ClientQuestEventType.VisitReadItLaterPage,
    enabled: !!isReminderOnly && !isSearchResults,
  });

  const replaceQuery = useCallback(
    (query: Record<string, string | undefined>) => {
      const next = { ...router.query, ...query };
      Object.keys(next).forEach((param) => {
        if (!next[param]) {
          delete next[param];
        }
      });

      return router.replace(
        { pathname: router.pathname, query: next },
        undefined,
        { shallow: true, scroll: false },
      );
    },
    [router],
  );

  const [onSearch] = useDebounceFn<string>((value) => {
    const query = value?.trim() ?? '';
    if (query === searchQuery) {
      return;
    }

    if (query) {
      logEvent({
        event_name: LogEvent.SubmitSearch,
        extra: JSON.stringify({
          query,
          provider: SearchProviderEnum.Posts,
          origin: Origin.Bookmarks,
        }),
      });
    }

    replaceQuery({ q: query || undefined });
  }, defaultSearchDebounceMs);

  const keepCurrent = useCallback(() => {
    const post = currentRef.current;
    if (showPane && post) {
      setSelectedId(post.id);
      setSelectedPost(post);
    }
  }, [showPane]);

  const onSearchChange = (value: string) => {
    keepCurrent();
    setDraft(value);
    onSearch(value);
  };

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
      keepCurrent();
      setStatus(value);
      logFilter({ status: value });
    },
    [keepCurrent, logFilter],
  );
  const onToggleTag = useCallback(
    (tag: string) => {
      keepCurrent();
      logFilter({ tag, selected: !selectedTags.includes(tag) });
      setSelectedTags((list) => toggleInList(list, tag));
    },
    [keepCurrent, logFilter, selectedTags],
  );
  const onToggleSource = useCallback(
    (sourceId: string) => {
      keepCurrent();
      logFilter({
        source: sourceId,
        selected: !selectedSources.includes(sourceId),
      });
      setSelectedSources((list) => toggleInList(list, sourceId));
    },
    [keepCurrent, logFilter, selectedSources],
  );
  const onClearFilters = useCallback(() => {
    keepCurrent();
    logFilter({ clear: true });
    setSelectedTags([]);
    setSelectedSources([]);
  }, [keepCurrent, logFilter]);

  const feedQueryKey = useMemo(
    () =>
      generateQueryKey(RequestKey.Bookmarks, user, {
        listId,
        isReminderOnly,
        searchQuery,
        ...(!isSearchResults && { sort: selectedSortValue }),
        ...(status !== BookmarkStatus.All && { status }),
        ...(activeTags.length > 0 && { tags: activeTags }),
        ...(activeSources.length > 0 && { sources: activeSources }),
      }),
    [
      user,
      listId,
      isReminderOnly,
      searchQuery,
      selectedSortValue,
      isSearchResults,
      status,
      activeTags,
      activeSources,
    ],
  );
  const feedName = useMemo(() => {
    if (isSearchResults) {
      return OtherFeedPage.SearchBookmarks;
    }
    if (isReminderOnly) {
      return OtherFeedPage.BookmarkLater;
    }

    return folder ? OtherFeedPage.BookmarkFolder : OtherFeedPage.Bookmarks;
  }, [isSearchResults, isReminderOnly, folder]);
  const feedQuery = useMemo(() => {
    if (isSearchResults) {
      return {
        query: SEARCH_BOOKMARKS_QUERY,
        variables: {
          query: searchQuery,
          ...(listId && { listId }),
          ...(status !== BookmarkStatus.All && { status }),
          supportedTypes: baseFeedSupportedTypes,
        },
      };
    }

    return {
      query: BOOKMARKS_FEED_QUERY,
      variables: {
        ...(listId && { listId }),
        reminderOnly: isReminderOnly,
        sort: selectedSortValue,
        ...(status !== BookmarkStatus.All && { status }),
        ...(activeTags.length > 0 && { tags: activeTags }),
        ...(activeSources.length > 0 && { sources: activeSources }),
        supportedTypes: baseFeedSupportedTypes,
      },
    };
  }, [
    isSearchResults,
    searchQuery,
    listId,
    isReminderOnly,
    selectedSortValue,
    status,
    activeTags,
    activeSources,
  ]);

  const {
    items,
    updatePost,
    removePost,
    fetchPage,
    canFetchMore,
    emptyFeed,
    isFetching,
    isInitialLoading,
  } = useFeed(feedQueryKey, PAGE_SIZE, { adStart: 0 }, 1, {
    // The persisted sort decides the first key, so the request waits for it
    query: loadedSort || isSearchResults ? feedQuery.query : undefined,
    variables: feedQuery.variables,
    options: { refetchOnMount: true },
    settings: { disableAds: true, disableHighlightCards: true, feedName },
  });
  const infiniteScrollRef = useFeedInfiniteScroll({ fetchPage, canFetchMore });
  const posts = useMemo(
    () =>
      items.flatMap((item) =>
        item.type === FeedItemType.Post ? [item.post] : [],
      ),
    [items],
  );
  const isLoading = isInitialLoading || (isFetching && canFetchMore);

  const findItem = useCallback(
    (postId: string) =>
      items.find(
        (item): item is PostItem =>
          item.type === FeedItemType.Post && item.post.id === postId,
      ),
    [items],
  );
  const onRemovePost = useCallback(
    (index: number) => {
      const item = items[index];
      if (item?.type === FeedItemType.Post) {
        removePost(item.page, item.index);
      }
    },
    [items, removePost],
  );
  const feedContextValue = useMemo(
    () => ({
      queryKey: feedQueryKey,
      items,
      logOpts: { columns: 1 },
      origin: Origin.Bookmarks,
      onRemovePost,
    }),
    [feedQueryKey, items, onRemovePost],
  );

  const { toggleBookmark } = useBookmarkPost({
    onMutate: ({ id }) => {
      if (!id) {
        return undefined;
      }

      updatePostCache(client, id, { bookmarked: false });
      const item = findItem(id);
      if (item) {
        removePost(item.page, item.index);
      }

      return () => client.invalidateQueries({ queryKey: feedQueryKey });
    },
  });

  const selected =
    posts.find((post) => post.id === selectedId) ??
    selectedPost ??
    (queryPostId && !selectedId
      ? posts.find((post) => post.id === queryPostId)
      : undefined);
  const current = selected ?? (queryPostId ? undefined : posts[0]);
  const currentId = current?.id;
  const currentIndex = current ? posts.indexOf(current) : -1;
  currentRef.current = current;

  // Keeps the selected row in view inside the column, not the page.
  useEffect(() => {
    const list = listRef.current;
    const row = list?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!showPane || !list || !row) {
      return;
    }

    const listTop = list.getBoundingClientRect().top;
    const top = row.getBoundingClientRect().top - listTop + list.scrollTop;
    if (top < list.scrollTop) {
      list.scrollTop = top;
    } else if (top + row.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = top + row.offsetHeight - list.clientHeight;
    }
  }, [currentId, showPane]);

  const focusRow = (postId: string) =>
    listRef.current
      ?.querySelector<HTMLElement>(`[data-post-id="${postId}"]`)
      ?.focus({ preventScroll: true });

  const select = (post?: Post, { focus = true } = {}) => {
    if (!post) {
      return;
    }

    if (post.id !== currentId && window.scrollY > 0) {
      // A new post starts at the top, as a new page does.
      window.scrollTo(0, 0);
    }
    setSelectedId(post.id);
    setSelectedPost(post);
    if (post.id !== queryPostId) {
      replaceQuery({ post: post.id });
    }
    if (focus) {
      focusRow(post.id);
    }
  };

  // Taking the selected post out of the list moves the pane to its neighbor
  const moveSelectionFrom = (post: Post) => {
    if (!showPane || post.id !== currentId) {
      return;
    }

    const neighbor =
      posts.find(
        (entry, index) => entry.id !== post.id && index >= currentIndex,
      ) ?? posts[currentIndex - 1];
    if (neighbor) {
      select(neighbor, { focus: false });
    } else {
      setSelectedId(undefined);
      setSelectedPost(undefined);
      replaceQuery({ post: undefined });
    }
  };

  const removeBookmark = (post: Post) => {
    moveSelectionFrom(post);
    return toggleBookmark({ post, origin: Origin.BookmarksContextMenu });
  };

  // Reads, votes and bookmark changes made in the pane reach the row, and
  // the pane's copy stays the selection once an action takes the row out of
  // the list (read in the Unread view, say), so the sheet follows it.
  const onPaneChange = (post: Post) => {
    if (post.id === selectedId) {
      setSelectedPost(post);
    }

    const item = findItem(post.id);
    if (!item) {
      return;
    }

    if (post.bookmarked === false) {
      moveSelectionFrom(post);
      removePost(item.page, item.index);
      return;
    }

    updatePost(item.page, item.index, {
      ...item.post,
      read: post.read ?? item.post.read,
      numUpvotes: post.numUpvotes ?? item.post.numUpvotes,
      numComments: post.numComments ?? item.post.numComments,
      userState: post.userState ?? item.post.userState,
      bookmark: post.bookmark ?? item.post.bookmark,
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>, post: Post) => {
    if (event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    const index = posts.indexOf(post);

    if (event.key === 'ArrowDown' || event.key === 'j') {
      event.preventDefault();
      select(posts[Math.min(index + 1, posts.length - 1)]);
      return;
    }

    if (event.key === 'ArrowUp' || event.key === 'k') {
      event.preventDefault();
      select(posts[Math.max(index - 1, 0)]);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      router.push(getPostPath(post));
      return;
    }

    if (event.key === 'Delete') {
      event.preventDefault();
      const next = posts[index + 1] ?? posts[index - 1];
      removeBookmark(post);
      if (next) {
        // The row is focused once the list has re-rendered without the post.
        setTimeout(() => focusRow(next.id));
      }
    }
  };

  const { plusEntryBookmark } = usePlusEntry();

  if (!isHydrated) {
    return null;
  }

  const blockButtonClassName = isPhone
    ? 'shell-material !size-[2.375rem] !rounded-14 !p-0'
    : undefined;
  // The page-header strip keeps its actions quiet, as every laptop page does
  const actionVariant =
    isPhone || showPane ? ButtonVariant.Tertiary : ButtonVariant.Float;
  const actionIconSize = showPane ? IconSize.XSmall : IconSize.Small;
  const sortDropdown = !isSearchResults && (
    <Dropdown
      className={{
        label: 'hidden',
        chevron: 'hidden',
        button: blockButtonClassName,
        container: 'flex',
      }}
      shouldIndicateSelected
      buttonAriaLabel="Sort"
      icon={<SortIcon size={actionIconSize} />}
      iconOnly
      selectedIndex={selectedSort}
      options={bookmarkSortOptionLabels}
      onChange={(_, index) => setSelectedSort(index)}
      buttonVariant={actionVariant}
      buttonSize={ButtonSize.Small}
      drawerProps={{ displayCloseButton: true }}
    />
  );
  const shareButton = !isFolderPage && (
    <Button
      aria-label="Share bookmarks"
      className={blockButtonClassName}
      icon={
        <ShareIcon
          size={actionIconSize}
          secondary={showSharedBookmarks}
          aria-hidden
        />
      }
      onClick={() => setShowSharedBookmarks(true)}
      size={ButtonSize.Small}
      variant={actionVariant}
    />
  );
  const folderMenu = folder && !isReminderOnly && (
    <BookmarkFolderContextMenu
      folder={folder}
      buttonProps={{
        className: blockButtonClassName ?? 'flex',
        size: ButtonSize.Small,
        variant: actionVariant,
      }}
    />
  );
  const actions = (
    <>
      {sortDropdown}
      {shareButton}
      {folderMenu}
    </>
  );

  const shell = (
    <ShellPage
      title="Bookmarks"
      actions={<div className="flex items-center gap-2">{actions}</div>}
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
  );
  const tabletFolders = (
    <div className="relative hidden px-6 pt-4 tablet:block laptop:hidden">
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
  );

  const isEmptyList = !isLoading && posts.length === 0;
  const isEmptyBookmarks = isEmptyList && !isFiltered && emptyFeed;
  const showFoldersStrip =
    !plusEntryBookmark && !isSearchResults && !isFolderPage;

  const searchField = (
    <SearchField
      inputId="search-bookmarks"
      fieldSize="medium"
      placeholder="Search bookmarks"
      aria-label="Search bookmarks"
      value={draft}
      valueChanged={onSearchChange}
      isFloating
    />
  );
  // The floating card frames the page on a laptop, so the title, the search
  // and the actions take the page-header strip every laptop page opens with,
  // and the list and the pane split the card under it edge to edge.
  const pageHeader = showPane && (
    <PageHeader
      title={
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
          {!isEmptyBookmarks && (
            <div className="min-w-0 max-w-[20rem] flex-1">{searchField}</div>
          )}
        </div>
      }
    >
      {actions}
    </PageHeader>
  );

  if (isEmptyBookmarks) {
    return (
      <>
        {shell}
        {children}
        {pageHeader}
        {tabletFolders}
        <div className="mx-auto flex w-full max-w-3xl flex-col px-4 pt-4 tablet:px-6">
          {!showPane && (
            <div className="flex min-h-14 items-center gap-2 py-3">
              <Typography
                bold
                type={TypographyType.Title3}
                tag={TypographyTag.H1}
                truncate
                className="min-w-0 flex-1"
              >
                {title}
              </Typography>
              {!isPhone && actions}
            </div>
          )}
          {/* Digest upsell only shown when bookmarks are empty to engage new/inactive users */}
          {!plusEntryBookmark && <DigestBookmarkBanner />}
          {isReminderOnly ? (
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
          )}
        </div>
        {showSharedBookmarks && (
          <SharedBookmarksModal
            isOpen={showSharedBookmarks}
            onRequestClose={() => setShowSharedBookmarks(false)}
          />
        )}
      </>
    );
  }

  const renderListEmpty = () => {
    if (isSearchResults) {
      return <SearchEmptyScreen />;
    }

    const isArchiveView = status === BookmarkStatus.Archived && !hasFilters;

    return (
      <CharmEmptyState
        placement={CharmEmptyStatePlacement.Inline}
        image={cloudinaryCharmBookmarks}
        imageAlt="daily.dev charm holding a bookmark"
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
  };

  const filters = (
    <BookmarkFilters
      status={status}
      onStatusChange={onStatusChange}
      facets={canFilter ? facets : undefined}
      selectedTags={activeTags}
      selectedSources={activeSources}
      onToggleTag={onToggleTag}
      onToggleSource={onToggleSource}
      onClear={onClearFilters}
    />
  );

  return (
    <ActiveFeedContext.Provider value={feedContextValue}>
      {shell}
      {children}
      <div
        className={classNames(
          'flex w-full flex-col',
          // The strip and the split together fill the card's content box, so
          // the list and the pane scroll on their own and the page never does
          showPane && 'h-[var(--layout-card-height,auto)]',
        )}
      >
        {pageHeader}
        {isPhone && (
          <ShellField
            placeholder="Search bookmarks"
            value={draft}
            onChange={onSearchChange}
            onSubmit={(value) => {
              setDraft(value);
              replaceQuery({ q: value.trim() || undefined });
            }}
          />
        )}
        {tabletFolders}
        {showPane && showFoldersStrip && (
          <BookmarkFoldersStrip
            feedQueryKey={feedQueryKey}
            className="px-4 pt-4"
          />
        )}
        <div
          className={classNames(
            'flex w-full',
            showPane ? 'min-h-0 flex-1 flex-row' : 'flex-col',
          )}
          aria-busy={isLoading}
          data-testid="bookmarks-container"
        >
          {!showPane && showFoldersStrip && (
            <div className="px-4 pt-4 tablet:px-6">
              <BookmarkFoldersStrip feedQueryKey={feedQueryKey} />
            </div>
          )}
          <aside
            className={classNames(
              'flex flex-col',
              showPane
                ? 'h-full w-96 shrink-0 border-r border-border-subtlest-tertiary'
                : 'w-full',
            )}
          >
            <div
              className={classNames(
                'flex flex-col gap-3',
                showPane
                  ? 'border-b border-border-subtlest-tertiary p-4'
                  : 'px-4 pb-2 pt-4 tablet:px-6',
              )}
            >
              {!isPhone && !showPane && (
                <>
                  <div className="flex items-center gap-2">
                    <Typography
                      bold
                      type={TypographyType.Title3}
                      tag={TypographyTag.H1}
                      truncate
                      className="min-w-0 flex-1"
                    >
                      {title}
                    </Typography>
                    {actions}
                  </div>
                  {searchField}
                </>
              )}
              {filters}
            </div>
            <nav
              ref={listRef}
              aria-label={title}
              className={classNames(
                'flex flex-col gap-1',
                showPane
                  ? 'min-h-0 flex-1 overflow-y-auto py-2 pl-2 pr-1'
                  : 'px-2 pb-6 pt-2 tablet:px-4',
              )}
            >
              {posts.map((post) => (
                <BookmarkRow
                  key={post.id}
                  post={post}
                  onRemove={() => removeBookmark(post)}
                  onSelect={
                    showPane ? () => select(post, { focus: false }) : undefined
                  }
                  isSelected={showPane && post.id === currentId}
                  onKeyDown={
                    showPane ? (event) => onKeyDown(event, post) : undefined
                  }
                />
              ))}
              {isLoading && (
                <ReadingHistoryListPlaceholder
                  amount={isInitialLoading ? 10 : 2}
                  isColumn={showPane}
                />
              )}
              {isEmptyList && (
                <div className="flex flex-col items-center gap-4 py-6">
                  {renderListEmpty()}
                  <Button
                    type="button"
                    variant={ButtonVariant.Float}
                    size={ButtonSize.Small}
                    onClick={() => {
                      setStatus(BookmarkStatus.All);
                      setSelectedTags([]);
                      setSelectedSources([]);
                      setDraft('');
                      replaceQuery({ q: undefined });
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              )}
              <InfiniteScrollScreenOffset ref={infiniteScrollRef} />
            </nav>
          </aside>
          {showPane && (
            <PostPane
              postId={current ? current.id : queryPostId}
              isLoading={isInitialLoading}
              fallbackTitle={current?.title}
              origin={Origin.Bookmarks}
              emptyLabel={
                isEmptyList
                  ? 'Nothing here matches. Clear the filters to see every bookmark.'
                  : undefined
              }
              unavailable={{
                description: 'It stays in your bookmarks until you remove it.',
                action: current
                  ? {
                      label: 'Remove bookmark',
                      onClick: () => removeBookmark(current),
                    }
                  : undefined,
              }}
              onPostChange={onPaneChange}
              scrollInside
              fill
              header={
                current?.bookmark && (
                  <BookmarkPaneSheet
                    post={current}
                    onRemove={() => removeBookmark(current)}
                  />
                )
              }
            />
          )}
        </div>
      </div>
      {showSharedBookmarks && (
        <SharedBookmarksModal
          isOpen={showSharedBookmarks}
          onRequestClose={() => setShowSharedBookmarks(false)}
        />
      )}
    </ActiveFeedContext.Provider>
  );
}
