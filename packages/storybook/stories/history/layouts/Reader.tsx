import type { KeyboardEvent, MouseEvent, ReactElement } from 'react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import ReadingHistoryPlaceholder from '@dailydotdev/shared/src/components/history/ReadingHistoryPlaceholder';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from '@dailydotdev/shared/src/components/charm/CharmEmptyState';
import { cloudinaryCharmSomethingWentWrong } from '@dailydotdev/shared/src/lib/image';
import {
  BodyTextPlaceholder,
  TextPlaceholder,
} from '@dailydotdev/shared/src/components/widgets/common';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import {
  ArrowIcon,
  SearchIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import type { HistoryItem, Kind } from '../data';
import { Timeline } from '../timeline';
import { PostPage } from '../postPage';
import {
  Highlight,
  MatchNote,
  Meta,
  NoResults,
  OptionsMenu,
  RowActions,
  SearchBox,
  SharePrompt,
  StateMarks,
  Thumb,
  useHistory,
} from '../kit';
import type { FilterState } from '../controls';
import { KindChips, useFilters } from '../controls';
import { useDeviceUrl, useIsLaptop } from '../device';
import { aboveBar, BAR, PhoneBlock } from '../shell';

// The Reader pane, at every width.
//
// Laptop and up: production's squads discover frame, mirrored. The history
// is the left column, the real post page for the selected read is the main
// card, with the live actions on its source line. A click selects; a
// modified or middle click opens the post in a new tab, since every row is
// a real link to the post's canonical URL. Arrow keys move, Enter opens,
// Delete removes.
//
// Tablet and phone: no split. The list fills the page, every action lives
// in the row's ⋯, and a tap opens the post page as production does today,
// with back returning to the same place in the list. Phones follow the
// shell's step 3: the page block, chips under it, the search field above
// the bar, and the post's actions in a capsule.

export interface ReaderPreview {
  /** Index in the results to select at start (laptop). */
  selected?: number;
  query?: string;
  kind?: Kind;
  /** The first page, or the next one under the list. */
  loading?: 'initial' | 'more';
  /** Below laptop: the post page is open over the list. */
  opened?: boolean;
  /** The selected post was deleted by its author or source. */
  unavailable?: boolean;
}

/** /posts/<slug>, the post's canonical path, from its permalink. */
export const postPath = (item: HistoryItem): string =>
  `/posts/${item.permalink.split('/').pop()}`;

const isModified = (event: MouseEvent): boolean =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1;

/* -------------------------------------------------------------- toolbar */

/** Articles, Videos and Bookmarked: one at a time, a second tap clears. */
const Chips = ({ state }: { state: FilterState }): ReactElement => (
  <KindChips state={state} />
);

/**
 * Production's ShellField on a page that filters its own list: an input
 * floating 8px above the bar on the 16px gutter, 52px tall.
 */
const PhoneSearchField = ({ state }: { state: FilterState }): ReactElement => (
  <div
    className="pointer-events-none fixed inset-x-0 z-3 px-4 tablet:hidden"
    style={{ bottom: aboveBar }}
  >
    <label
      className="shell-material shell-material-action pointer-events-auto flex w-full items-center gap-2 rounded-[1.375rem] px-3"
      style={{ height: BAR.field }}
    >
      <SearchIcon
        size={IconSize.Small}
        className="shrink-0 text-text-tertiary"
      />
      <input
        value={state.filters.query}
        onChange={(event) => state.set({ query: event.target.value })}
        placeholder="Search history"
        aria-label="Search history"
        className="min-w-0 flex-1 bg-transparent text-text-primary outline-none typo-callout placeholder:text-text-quaternary"
      />
    </label>
  </div>
);

/* ----------------------------------------------------------------- rows */

/** Laptop: a compact row that selects on click, a real link otherwise. */
const SelectRow = ({
  item,
  query,
  selected,
  onSelect,
  onFocusRow,
}: {
  item: HistoryItem;
  query: string;
  selected: boolean;
  onSelect: () => void;
  onFocusRow: () => void;
}): ReactElement => (
  <a
    href={postPath(item)}
    aria-current={selected ? 'true' : undefined}
    data-key={item.key}
    // Focus is selection, as in a mail list: Tab and the arrows land on
    // the read the keys act on.
    onFocus={onFocusRow}
    onClick={(event) => {
      if (!isModified(event)) {
        event.preventDefault();
        onSelect();
      }
    }}
    className={classNames(
      'focus-outline flex items-center gap-3 rounded-14 p-2 text-left',
      selected ? 'bg-surface-float' : 'hover:bg-surface-hover',
    )}
  >
    <Thumb item={item} className="h-10 w-14 rounded-10" />
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="line-clamp-2 font-bold typo-footnote">
        <Highlight text={item.title} query={query} />
      </span>
      <span className="flex items-center gap-1 truncate text-text-quaternary typo-caption1">
        {item.source.name}
        <MatchNote item={item} query={query} />
      </span>
    </span>
  </a>
);

/**
 * Tablet and phone: production's row (image, title, source, read time,
 * upvotes) with every action in its ⋯, since there is no hover to show
 * them. A tap opens the post.
 */
const TouchRow = ({
  item,
  query,
  onOpen,
}: {
  item: HistoryItem;
  query: string;
  onOpen: () => void;
}): ReactElement => {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col">
      <div className="relative flex items-center rounded-16 hover:bg-surface-hover">
        <a
          href={postPath(item)}
          onClick={(event) => {
            if (!isModified(event)) {
              event.preventDefault();
              onOpen();
            }
          }}
          className="focus-outline flex min-w-0 flex-1 items-center gap-3 py-3 pl-3 tablet:gap-4"
        >
          <Thumb
            item={item}
            className="h-14 w-20 rounded-12 tablet:h-16 tablet:w-24"
          />
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="line-clamp-2 break-words font-bold typo-callout tablet:typo-body">
              <Highlight text={item.title} query={query} />
            </span>
            <Meta
              item={item}
              className="flex-wrap gap-y-0.5"
              extra={
                <>
                  <StateMarks item={item} />
                  {query && <MatchNote item={item} query={query} />}
                </>
              }
            />
          </span>
        </a>
        <div className="shrink-0 px-1">
          <OptionsMenu item={item} open={open} onOpenChange={setOpen} full />
        </div>
      </div>
      <SharePrompt item={item} className="ml-3 flex-wrap" />
    </div>
  );
};

/* ------------------------------------------------------------ post card */

const PostSkeleton = (): ReactElement => (
  <div className="flex flex-col gap-4 p-6" aria-busy>
    <TextPlaceholder className="w-24" />
    <ElementPlaceholder className="h-8 w-3/4 rounded-12" />
    <BodyTextPlaceholder className="w-full" />
    <BodyTextPlaceholder className="w-5/6" />
    <BodyTextPlaceholder className="w-2/3" />
    <ElementPlaceholder className="mt-2 aspect-video w-full max-w-[32rem] rounded-16" />
  </div>
);

const Unavailable = ({ item }: { item: HistoryItem }): ReactElement => {
  const { remove } = useHistory();
  return (
    <CharmEmptyState
      placement={CharmEmptyStatePlacement.Inline}
      className="my-auto"
      image={cloudinaryCharmSomethingWentWrong}
      imageAlt="daily.dev charm looking for a post that isn't there"
      title="This post is no longer available"
      description="Its author or source removed it. It stays in your history until you remove it."
      action={{
        label: 'Remove from history',
        onClick: () => remove([item.key]),
      }}
    />
  );
};

/** The selected post, with the history's actions on its source line. */
const PostCard = ({
  item,
  loading,
  unavailable,
}: {
  item?: HistoryItem;
  loading: boolean;
  unavailable: boolean;
}): ReactElement => (
  <section
    aria-label={item ? `Selected post: ${item.title}` : 'Selected post'}
    className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary"
  >
    {loading && <PostSkeleton />}
    {!loading && item && unavailable && <Unavailable item={item} />}
    {!loading && item && !unavailable && (
      <>
        <PostPage key={item.key} item={item} />
        {/* The post page hides its header actions below laptop, so the
            history's own sit on the source line, always shown. */}
        <div className="absolute right-6 top-[1.125rem] z-2 rounded-12 bg-background-default">
          <RowActions item={item} bookmark />
        </div>
        <SharePrompt
          item={item}
          className="absolute right-6 top-16 z-2 !m-0 w-[34rem] max-w-[calc(100%-3rem)] bg-background-default shadow-2"
        />
      </>
    )}
    {!loading && !item && (
      <p className="m-auto text-text-tertiary typo-callout">
        Pick a post on the left to read it here.
      </p>
    )}
  </section>
);

/**
 * Below laptop, the post page a tap opens: production's post page at the
 * device's width, under a back row on tablets and the page block on
 * phones, with the actions in the phone's capsule above the bar.
 */
const PostView = ({
  item,
  unavailable,
  onBack,
}: {
  item: HistoryItem;
  unavailable: boolean;
  onBack: () => void;
}): ReactElement => (
  <div className="flex h-screen flex-col">
    <PhoneBlock title={item.source.name} onBack={onBack} />
    <div className="hidden h-14 shrink-0 items-center gap-2 border-b border-border-subtlest-tertiary px-4 tablet:flex">
      <Button
        type="button"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        icon={<ArrowIcon className="-rotate-90" />}
        onClick={onBack}
      >
        History
      </Button>
      <span className="flex-1" />
      {!unavailable && <RowActions item={item} bookmark />}
    </div>
    {unavailable ? (
      <Unavailable item={item} />
    ) : (
      <PostPage key={item.key} item={item} />
    )}
    {!unavailable && (
      <div
        className="fixed inset-x-4 z-3 tablet:hidden"
        style={{ bottom: aboveBar }}
      >
        <div
          className="shell-material shell-material-action flex items-center justify-center rounded-[1.375rem] px-2 [&_.hx-actions]:w-full [&_.hx-actions]:justify-between"
          style={{ height: BAR.field }}
        >
          <RowActions item={item} bookmark className="w-full" />
        </div>
      </div>
    )}
  </div>
);

/* --------------------------------------------------------------- reader */

export const Reader = ({
  preview = {},
}: {
  preview?: ReaderPreview;
}): ReactElement => {
  const { items, remove } = useHistory();
  const state = useFilters({
    query: preview.query ?? '',
    kind: preview.kind ?? 'all',
  });
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const isLaptop = useIsLaptop(root);
  const setUrl = useDeviceUrl();
  const [selected, setSelected] = useState<string | null>(
    preview.selected ? (state.results[preview.selected]?.key ?? null) : null,
  );
  const [opened, setOpened] = useState<string | null>(
    preview.opened ? (state.results[preview.selected ?? 0]?.key ?? null) : null,
  );
  const lastIndex = useRef(0);
  const listScroll = useRef(0);
  const restoring = useRef(false);

  // A removed selection moves to the read after it, not back to the top.
  const current =
    state.results.find((item) => item.key === selected) ??
    state.results[Math.min(lastIndex.current, state.results.length - 1)];
  const index = state.results.findIndex((item) => item.key === current?.key);
  if (index >= 0) {
    lastIndex.current = index;
  }
  const openedItem = items.find((item) => item.key === opened);
  const loadingFirst = preview.loading === 'initial';

  // The URL the page would be on: the post's own page once a phone or
  // tablet opens it, /history otherwise, with the search and the read in
  // view so back, reload and sharing a link keep them. /history stays
  // noindex; the posts keep their canonical URLs.
  useEffect(() => {
    if (openedItem) {
      setUrl(postPath(openedItem));
      return;
    }
    const params = new URLSearchParams();
    if (state.filters.query) {
      params.set('q', state.filters.query);
    }
    if (isLaptop && selected && current) {
      params.set('post', postPath(current).split('/').pop() as string);
    }
    const search = params.toString();
    setUrl(`/history${search ? `?${search}` : ''}`);
  }, [openedItem, state.filters.query, isLaptop, selected, current, setUrl]);

  // Keeps the selected row in view inside the list, not the page.
  useEffect(() => {
    const box = list.current;
    const node = box?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!isLaptop || !box || !node || !selected) {
      return;
    }
    const top = node.offsetTop - box.offsetTop;
    if (top < box.scrollTop + 40) {
      box.scrollTop = top - 40;
    } else if (top + node.offsetHeight > box.scrollTop + box.clientHeight) {
      box.scrollTop = top + node.offsetHeight - box.clientHeight;
    }
  }, [current?.key, selected, isLaptop]);

  const select = (key?: string) => {
    if (!key) {
      return;
    }
    setSelected(key);
    list.current
      ?.querySelector<HTMLElement>(`[data-key="${key}"]`)
      ?.focus({ preventScroll: true });
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'j') {
      event.preventDefault();
      select(state.results[Math.min(index + 1, state.results.length - 1)]?.key);
    }
    if (event.key === 'ArrowUp' || event.key === 'k') {
      event.preventDefault();
      select(state.results[Math.max(index - 1, 0)]?.key);
    }
    if ((event.key === 'Delete' || event.key === 'Backspace') && current) {
      event.preventDefault();
      // Focus follows the selection to the next read, so the keyboard
      // never lands on the page body.
      const next =
        state.results[index + 1]?.key ?? state.results[index - 1]?.key;
      remove([current.key]);
      setTimeout(() => select(next));
    }
  };

  const view = root.current?.ownerDocument.defaultView;
  const open = (item: HistoryItem) => {
    listScroll.current = view?.scrollY ?? 0;
    setOpened(item.key);
    view?.scrollTo(0, 0);
  };
  const back = () => {
    restoring.current = true;
    setOpened(null);
  };

  // Back lands on the same place in the list, as production restores it.
  useLayoutEffect(() => {
    if (!opened && restoring.current) {
      restoring.current = false;
      root.current?.ownerDocument.defaultView?.scrollTo(0, listScroll.current);
    }
  }, [opened]);

  if (!items.length && !loadingFirst) {
    return (
      <div ref={root} className="flex flex-col">
        <PhoneBlock title="History" />
        <NoResults />
      </div>
    );
  }

  const listBody = loadingFirst ? (
    <ReadingHistoryPlaceholder amount={isLaptop ? 9 : 6} withDateHeader />
  ) : (
    <>
      <Timeline
        items={state.results}
        compact={isLaptop}
        renderItem={(item) =>
          isLaptop ? (
            <SelectRow
              key={item.key}
              item={item}
              query={state.filters.query}
              selected={item.key === current?.key}
              onSelect={() => select(item.key)}
              onFocusRow={() => setSelected(item.key)}
            />
          ) : (
            <TouchRow
              key={item.key}
              item={item}
              query={state.filters.query}
              onOpen={() => open(item)}
            />
          )
        }
      />
      {preview.loading === 'more' && <ReadingHistoryPlaceholder amount={2} />}
      {!state.results.length && <NoResults onReset={state.reset} />}
    </>
  );

  return (
    <div ref={root} className="flex flex-col laptop:h-full">
      {openedItem && !isLaptop && (
        <PostView
          item={openedItem}
          unavailable={!!preview.unavailable}
          onBack={back}
        />
      )}
      <div
        className={classNames(
          'flex flex-col laptop:h-full',
          openedItem && !isLaptop && 'hidden',
        )}
      >
        <PhoneBlock title="History" />
        {/* Phones: the chips under the block, the search above the bar. */}
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 pb-2 pt-1 tablet:hidden">
          <Chips state={state} />
        </div>
        <PhoneSearchField state={state} />
        <div className="mx-auto flex w-full flex-col laptop:min-h-0 laptop:flex-1 laptop:flex-row laptop:gap-4 laptop:p-4 laptop:pb-6 laptop:max-w-5xl laptopL:max-w-6xl">
          <aside className="flex w-full flex-col laptop:w-80 laptop:shrink-0 laptop:overflow-hidden laptop:rounded-16 laptop:border laptop:border-border-subtlest-tertiary">
            <div className="hidden flex-col gap-3 px-6 pt-6 tablet:flex laptop:border-b laptop:border-border-subtlest-tertiary laptop:p-4">
              <SearchBox
                value={state.filters.query}
                onChange={(query) => state.set({ query })}
              />
              <div className="flex flex-wrap gap-1.5">
                <Chips state={state} />
              </div>
            </div>
            <nav
              ref={list}
              aria-label="Reading history"
              aria-busy={loadingFirst}
              onKeyDown={isLaptop ? onKeyDown : undefined}
              className="hx-scroll flex flex-col px-4 pb-40 pt-2 tablet:px-6 tablet:pb-10 tablet:pt-4 laptop:min-h-0 laptop:flex-1 laptop:overflow-y-auto laptop:p-2"
            >
              {listBody}
            </nav>
          </aside>
          {isLaptop && (
            <PostCard
              item={current}
              loading={loadingFirst}
              unavailable={!!preview.unavailable}
            />
          )}
        </div>
      </div>
    </div>
  );
};
