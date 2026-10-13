import type { KeyboardEvent, ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { Timeline } from '../timeline';
import { PostPage } from '../postPage';
import {
  Highlight,
  MatchNote,
  NoResults,
  RowActions,
  SearchBox,
  Thumb,
  useHistory,
} from '../kit';
import { KindChips, useFilters } from '../controls';

// Mail-style split in production's squads discover frame: the history in
// the widget column, moved to the left, and the real post page for the
// selected read as the main card, with the live actions on its source line. Arrow keys move, Enter opens, Delete
// removes. Answers "is this the one?" without opening five tabs.

export const Reader = (): ReactElement => {
  const { remove } = useHistory();
  const state = useFilters();
  const [selected, setSelected] = useState<string | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const current =
    state.results.find((item) => item.key === selected) ?? state.results[0];

  // Scrolls the list only; scrollIntoView would scroll the page around it.
  useEffect(() => {
    const box = list.current;
    const node = box?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!box || !node || !selected) {
      return;
    }
    const top = node.offsetTop - box.offsetTop;
    if (top < box.scrollTop + 40) {
      box.scrollTop = top - 40;
    } else if (top + node.offsetHeight > box.scrollTop + box.clientHeight) {
      box.scrollTop = top + node.offsetHeight - box.clientHeight;
    }
  }, [current?.key, selected]);

  const onKeyDown = (event: KeyboardEvent) => {
    const index = state.results.findIndex((item) => item.key === current?.key);
    if (event.key === 'ArrowDown' || event.key === 'j') {
      event.preventDefault();
      setSelected(
        state.results[Math.min(index + 1, state.results.length - 1)]?.key,
      );
    }
    if (event.key === 'ArrowUp' || event.key === 'k') {
      event.preventDefault();
      setSelected(state.results[Math.max(index - 1, 0)]?.key);
    }
    if ((event.key === 'Delete' || event.key === 'Backspace') && current) {
      setSelected(state.results[index + 1]?.key ?? null);
      remove([current.key]);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Production's squads discover frame, mirrored: the widget column
          holds the history on the left, the post page is the main card. */}
      <div className="mx-auto flex min-h-0 w-full flex-1 gap-4 p-4 pb-6 laptop:max-w-5xl laptopL:max-w-6xl">
        <aside className="flex w-80 shrink-0 flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary">
          <div className="flex flex-col gap-3 border-b border-border-subtlest-tertiary p-4">
            <SearchBox
              value={state.filters.query}
              onChange={(query) => state.set({ query })}
            />
            <div className="flex gap-1.5">
              <KindChips
                state={state}
                kinds={['article', 'video', 'bookmarked']}
              />
            </div>
          </div>
          <div
            ref={list}
            role="listbox"
            tabIndex={0}
            aria-label="History"
            onKeyDown={onKeyDown}
            className="hx-scroll flex min-h-0 flex-1 flex-col overflow-y-auto p-2 outline-none"
          >
            <Timeline
              items={state.results}
              compact
              renderItem={(item) => (
                <button
                  key={item.key}
                  type="button"
                  role="option"
                  aria-selected={item.key === current?.key}
                  onClick={() => setSelected(item.key)}
                  className={classNames(
                    'flex items-center gap-3 rounded-14 p-2 text-left',
                    item.key === current?.key
                      ? 'bg-surface-float'
                      : 'hover:bg-surface-hover',
                  )}
                >
                  <Thumb item={item} className="h-10 w-14 rounded-10" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="line-clamp-2 font-bold typo-footnote">
                      <Highlight
                        text={item.title}
                        query={state.filters.query}
                      />
                    </span>
                    <span className="flex items-center gap-1 truncate text-text-quaternary typo-caption1">
                      {item.source.name}
                      <MatchNote item={item} query={state.filters.query} />
                    </span>
                  </span>
                </button>
              )}
            />
            {!state.results.length && <NoResults onReset={state.reset} />}
          </div>
        </aside>
        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary">
          {current && (
            <>
              <PostPage key={current.key} item={current} />
              {/* The post page hides its header actions below laptop, so the
                  history's own sit on the source line, always shown. */}
              <div className="absolute right-6 top-[1.125rem] z-2 rounded-12 bg-background-default">
                <RowActions item={current} bookmark />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
