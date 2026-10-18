import type { KeyboardEvent, ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  READING_HISTORY_QUERY,
  SEARCH_READING_HISTORY_QUERY,
} from '@dailydotdev/shared/src/graphql/users';
import useReadingHistory from '@dailydotdev/shared/src/hooks/useReadingHistory';
import useInfiniteReadingHistory from '@dailydotdev/shared/src/hooks/useInfiniteReadingHistory';
import SearchEmptyScreen from '@dailydotdev/shared/src/components/SearchEmptyScreen';
import ReadingHistoryEmptyScreen from '@dailydotdev/shared/src/components/history/ReadingHistoryEmptyScreen';
import { ReadingHistoryListPlaceholder } from '@dailydotdev/shared/src/components/history/ReadingHistoryListPlaceholder';
import {
  getReadingHistoryItemKey,
  ReadingHistoryRow,
} from '@dailydotdev/shared/src/components/history/ReadingHistoryRow';
import { ReadingHistoryPostPane } from '@dailydotdev/shared/src/components/history/ReadingHistoryPostPane';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import type { PostItem } from '@dailydotdev/shared/src/graphql/posts';
import { isVideoPost, PostType } from '@dailydotdev/shared/src/graphql/posts';
import {
  isDateOnlyEqual,
  getReadHistoryDateFormat,
} from '@dailydotdev/shared/src/lib/dateFormat';
import { InfiniteScrollScreenOffset } from '@dailydotdev/shared/src/hooks/feed/useFeedInfiniteScroll';
import {
  useIsPhone,
  useViewSizeClient,
  ViewSize,
} from '@dailydotdev/shared/src/hooks/useViewSize';
import { SearchField } from '@dailydotdev/shared/src/components/fields/SearchField';
import { ShellField } from '@dailydotdev/shared/src/components/shell/ShellField';
import { ShellDockedRow } from '@dailydotdev/shared/src/components/shell/ShellPageContext';
import {
  Segments,
  ShellRow,
} from '@dailydotdev/shared/src/components/shell/ShellRow';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import useDebounceFn from '@dailydotdev/shared/src/hooks/useDebounceFn';
import { defaultSearchDebounceMs } from '@dailydotdev/shared/src/lib/func';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import { SearchProviderEnum } from '@dailydotdev/shared/src/graphql/search';
import { getPostPath } from '@dailydotdev/shared/src/lib/links';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';

enum HistoryFilter {
  All = 'All',
  Articles = 'Articles',
  Videos = 'Videos',
}

const filterMatchers: Record<HistoryFilter, (item: PostItem) => boolean> = {
  [HistoryFilter.All]: () => true,
  [HistoryFilter.Articles]: ({ post }) =>
    post.type === PostType.Article ||
    (post.type === PostType.Share &&
      post.sharedPost?.type === PostType.Article),
  [HistoryFilter.Videos]: ({ post }) => isVideoPost(post),
};

interface HistoryDay {
  label: string;
  items: PostItem[];
}

const groupByDay = (items: PostItem[]): HistoryDay[] =>
  items.reduce<HistoryDay[]>((days, item) => {
    const date = new Date(item.timestamp as Date);
    const last = days[days.length - 1];
    const lastDate = last && new Date(last.items[0].timestamp as Date);

    if (last && isDateOnlyEqual(lastDate, date)) {
      last.items.push(item);
    } else {
      days.push({ label: getReadHistoryDateFormat(date), items: [item] });
    }

    return days;
  }, []);

export function ReadingHistory(): ReactElement {
  const router = useRouter();
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const isLaptop = useViewSizeClient(ViewSize.Laptop);
  const isPhone = useIsPhone();
  const searchQuery = router.query?.q?.toString() ?? '';
  const queryPostId = router.query?.post?.toString();
  const [draft, setDraft] = useState(searchQuery);
  const [filter, setFilter] = useState(HistoryFilter.All);
  const [selectedKey, setSelectedKey] = useState<string>();
  // The selected read stays in the pane while a search or filter leaves it
  // out of the list, until another row is picked.
  const [selectedItem, setSelectedItem] = useState<PostItem>();
  const listRef = useRef<HTMLElement>(null);

  const key = generateQueryKey(RequestKey.ReadingHistory, user);
  const queryProps = useMemo(() => {
    if (searchQuery) {
      return {
        key: [...key, searchQuery],
        query: SEARCH_READING_HISTORY_QUERY,
        variables: { query: searchQuery },
      };
    }

    return { key, query: READING_HISTORY_QUERY };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, user?.id]);

  const { hideReadHistory } = useReadingHistory();
  const { data, isLoading, isInitialLoading, infiniteScrollRef } =
    useInfiniteReadingHistory(queryProps);

  const allItems = useMemo(
    () =>
      data?.pages.flatMap((page) =>
        page.readHistory.edges.map(({ node }) => node),
      ) ?? [],
    [data],
  );
  const items = useMemo(
    () => allItems.filter(filterMatchers[filter]),
    [allItems, filter],
  );
  const days = useMemo(() => groupByDay(items), [items]);
  const isFiltered = !!searchQuery || filter !== HistoryFilter.All;

  useEffect(() => {
    setDraft(searchQuery);
  }, [searchQuery]);

  const replaceQuery = (query: Record<string, string | undefined>) => {
    const next = { ...router.query, ...query };
    Object.keys(next).forEach((param) => {
      if (!next[param]) {
        delete next[param];
      }
    });

    return router.replace(
      { pathname: router.pathname, query: next },
      undefined,
      {
        shallow: true,
        scroll: false,
      },
    );
  };

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
          origin: 'history',
        }),
      });
    }

    replaceQuery({ q: query || undefined });
  }, defaultSearchDebounceMs);

  const selected =
    items.find((item) => getReadingHistoryItemKey(item) === selectedKey) ??
    selectedItem ??
    (queryPostId && !selectedKey
      ? items.find(({ post }) => post.id === queryPostId)
      : undefined);
  const current = selected ?? (queryPostId ? undefined : items[0]);
  const currentKey = current ? getReadingHistoryItemKey(current) : undefined;
  const currentIndex = current ? items.indexOf(current) : -1;
  const showPane = isLaptop === true;

  const keepCurrent = () => {
    if (showPane && current && !selectedItem) {
      setSelectedKey(currentKey);
      setSelectedItem(current);
    }
  };

  const onSearchChange = (value: string) => {
    keepCurrent();
    setDraft(value);
    onSearch(value);
  };

  // Keeps the selected row in view inside the column, not the page.
  useEffect(() => {
    const list = listRef.current;
    const row = list?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!isLaptop || !list || !row) {
      return;
    }

    const listTop = list.getBoundingClientRect().top;
    const top = row.getBoundingClientRect().top - listTop + list.scrollTop;
    if (top < list.scrollTop) {
      list.scrollTop = top;
    } else if (top + row.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = top + row.offsetHeight - list.clientHeight;
    }
  }, [currentKey, isLaptop]);

  const focusRow = (itemKey: string) =>
    listRef.current
      ?.querySelector<HTMLElement>(`[data-post-key="${itemKey}"]`)
      ?.focus({ preventScroll: true });

  const select = (item?: PostItem, { focus = true } = {}) => {
    if (!item) {
      return;
    }

    const itemKey = getReadingHistoryItemKey(item);
    if (itemKey !== currentKey && window.scrollY > 0) {
      // A new read starts at the top of its post, as a new page does.
      window.scrollTo(0, 0);
    }
    setSelectedKey(itemKey);
    setSelectedItem(item);
    if (item.post.id !== queryPostId) {
      replaceQuery({ post: item.post.id });
    }
    if (focus) {
      focusRow(itemKey);
    }
  };

  const onHide = (item: PostItem) => {
    if (!item.timestampDb) {
      return Promise.resolve();
    }

    if (showPane && current && item === current) {
      const next = items.find(
        (entry, index) => entry !== item && index >= currentIndex,
      );
      const neighbor = next ?? items[currentIndex - 1];
      if (neighbor) {
        select(neighbor, { focus: false });
      } else {
        setSelectedKey(undefined);
        setSelectedItem(undefined);
        replaceQuery({ post: undefined });
      }
    }

    return hideReadHistory({
      postId: item.post.id,
      timestamp: item.timestampDb,
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!current) {
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'j') {
      event.preventDefault();
      select(items[Math.min(currentIndex + 1, items.length - 1)]);
      return;
    }

    if (event.key === 'ArrowUp' || event.key === 'k') {
      event.preventDefault();
      select(items[Math.max(currentIndex - 1, 0)]);
      return;
    }

    if (event.key === 'Enter' && !event.metaKey && !event.ctrlKey) {
      event.preventDefault();
      router.push(getPostPath(current.post));
      return;
    }

    if (event.key === 'Delete') {
      event.preventDefault();
      const next = items[currentIndex + 1] ?? items[currentIndex - 1];
      onHide(current);
      if (next) {
        // The row is focused once the list has re-rendered without the read.
        setTimeout(() => focusRow(getReadingHistoryItemKey(next)));
      }
    }
  };

  const filterItems = Object.values(HistoryFilter).map((item) => ({
    key: item,
    label: item,
    active: filter === item,
    onClick: () => {
      keepCurrent();
      setFilter(item);
    },
  }));

  if (!isLoading && !isFiltered && !allItems.length) {
    return <ReadingHistoryEmptyScreen />;
  }

  return (
    <div
      className="mx-auto flex w-full flex-col laptop:max-w-5xl laptop:flex-row laptop:items-start laptop:gap-4 laptop:p-4 laptop:pb-6 laptopL:max-w-6xl"
      aria-busy={isLoading}
      data-testid="reading-history-container"
    >
      {isPhone && (
        <>
          <ShellDockedRow>
            <ShellRow>
              <Segments items={filterItems} />
            </ShellRow>
          </ShellDockedRow>
          <ShellField
            placeholder="Search history"
            value={draft}
            onChange={onSearchChange}
          />
        </>
      )}
      <aside className="flex w-full flex-col laptop:sticky laptop:top-[calc(var(--sticky-header-offset,0px)+1rem)] laptop:h-[calc(100vh-var(--sticky-header-offset,0px)-2.5rem)] laptop:w-96 laptop:shrink-0 laptop:overflow-hidden laptop:rounded-16 laptop:border laptop:border-border-subtlest-tertiary laptop:bg-background-default">
        {!isPhone && (
          <div className="flex flex-col gap-3 px-4 pb-2 pt-4 tablet:px-6 laptop:border-b laptop:border-border-subtlest-tertiary laptop:p-4">
            <SearchField
              inputId="search-history"
              fieldSize="medium"
              placeholder="Search history"
              aria-label="Search history"
              value={draft}
              valueChanged={onSearchChange}
              isFloating
            />
            <div
              role="group"
              aria-label="Filter history"
              className="flex items-center gap-1"
            >
              <Segments items={filterItems} />
            </div>
          </div>
        )}
        <nav
          ref={listRef}
          aria-label="Reading history"
          className="flex flex-col px-2 pb-6 pt-2 tablet:px-4 laptop:min-h-0 laptop:flex-1 laptop:overflow-y-auto laptop:pb-2 laptop:pl-2 laptop:pr-1 laptop:pt-0"
        >
          {days.map((day) => (
            <section key={day.label} className="flex flex-col gap-1">
              <Typography
                tag={TypographyTag.H2}
                type={TypographyType.Callout}
                color={TypographyColor.Primary}
                bold
                className="px-2 pb-2 pt-4"
              >
                {day.label}
              </Typography>
              {day.items.map((item) => {
                const itemKey = getReadingHistoryItemKey(item);

                return (
                  <ReadingHistoryRow
                    key={itemKey}
                    item={item}
                    onHide={() => onHide(item)}
                    onSelect={
                      showPane
                        ? () => select(item, { focus: false })
                        : undefined
                    }
                    isSelected={showPane && itemKey === currentKey}
                    onKeyDown={showPane ? onKeyDown : undefined}
                  />
                );
              })}
            </section>
          ))}
          {isLoading && (
            <ReadingHistoryListPlaceholder
              amount={isInitialLoading ? 10 : 2}
              withDateHeader={isInitialLoading}
              isColumn={showPane}
            />
          )}
          {!isLoading && !items.length && (
            <div className="flex flex-col items-center gap-4 py-10">
              <SearchEmptyScreen />
              <Button
                type="button"
                variant={ButtonVariant.Float}
                size={ButtonSize.Small}
                onClick={() => {
                  setFilter(HistoryFilter.All);
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
        <ReadingHistoryPostPane
          item={current}
          postId={current ? undefined : queryPostId}
          isLoading={isLoading}
          emptyLabel={
            isFiltered && !items.length
              ? 'Nothing here matches. Clear the filters to see every read.'
              : undefined
          }
          onHide={current ? () => onHide(current) : undefined}
        />
      )}
    </div>
  );
}
