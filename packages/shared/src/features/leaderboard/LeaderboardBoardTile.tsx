import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../components/buttons/common';
import { Drawer } from '../../components/drawers/Drawer';
import { MiniCloseIcon } from '../../components/icons/MiniClose';
import { RootPortal } from '../../components/tooltips/Portal';
import type {
  CompanyLeaderboard,
  LeaderboardType,
  UserLeaderboard,
} from '../../graphql/leaderboard';
import {
  LEADERBOARD_LIST_LIMIT,
  LEADERBOARD_TOP_LIMIT,
  leaderboardBoardQueryOptions,
} from '../../graphql/leaderboard';
import { useIsPhone } from '../../hooks/useViewSize';
import { useLogContext } from '../../contexts/LogContext';
import { leaderboardBoardClickEvent } from './leaderboardLog';
import { LEADERBOARD_TILE_ROWS } from './boards';
import {
  LeaderboardEmptyBoard,
  LeaderboardRowPlaceholder,
  LeaderboardTextLink,
} from './LeaderboardRows';

const EXPAND_MS = 220;

export interface LeaderboardBoardTileProps<
  T extends UserLeaderboard | CompanyLeaderboard,
> {
  type: LeaderboardType;
  title: string;
  /** The page's rows for the board, up to LEADERBOARD_LIST_LIMIT. */
  items: T[];
  renderRow: (item: T, rank: number) => ReactNode;
  /** Your own row, pinned under the top rows and under the full list. */
  you?: ReactNode;
}

/**
 * A board's top rows and, where production can rank you, your row. The
 * header's cue is the board page's link; a press on it opens the top 50 in
 * place instead: as a popover from tablet up, in a bottom sheet on phones.
 * The rows stay links of their own, so people and crawlers reach the
 * profiles from here. The full list is only asked for once it opens.
 */
export function LeaderboardBoardTile<
  T extends UserLeaderboard | CompanyLeaderboard,
>({
  type,
  title,
  items,
  renderRow,
  you,
}: LeaderboardBoardTileProps<T>): ReactElement {
  const isPhone = useIsPhone();
  const { logEvent } = useLogContext();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const cue = useRef<HTMLSpanElement>(null);
  const isPopover = open && !isPhone;
  const {
    data: all,
    isPending,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    ...leaderboardBoardQueryOptions<T>(type, LEADERBOARD_TOP_LIMIT),
    enabled: open,
  });
  const openList = () => {
    setOpen(true);
    logEvent(leaderboardBoardClickEvent(type, isPhone ? 'sheet' : 'popover'));
  };
  const close = () => {
    setOpen(false);
    cue.current?.querySelector('a')?.focus();
  };

  // The popover grows out of the tile: mounted first at the tile's size,
  // then its full size a frame later so the transition has somewhere to go.
  useEffect(() => {
    if (!isPopover) {
      setExpanded(false);
      return undefined;
    }
    const frame = requestAnimationFrame(() => setExpanded(true));
    return () => cancelAnimationFrame(frame);
  }, [isPopover]);

  // Escape closes the popover, like the modals; the scrim takes the presses
  // beside it. Portaled hover cards sit above the scrim, so a press in one
  // keeps the popover up.
  useEffect(() => {
    if (!isPopover) {
      return undefined;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // close only reads refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPopover]);

  const empty = items.length === 0;
  // The failed fetch falls back to the page's own rows.
  const list = all ?? (isError ? items : undefined);
  // A board shorter than the list's limit says how many it has instead. The
  // page's rows only tell once they run short of their own limit.
  const known = all ?? (items.length < LEADERBOARD_LIST_LIMIT ? items : null);
  const listLabel =
    known && known.length < LEADERBOARD_TOP_LIMIT
      ? `All ${known.length}`
      : `Top ${LEADERBOARD_TOP_LIMIT}`;
  const sheetTitle = `${title} · ${listLabel}`;
  const rows = (entries: T[]) =>
    entries.map((item, index) => renderRow(item, index + 1));
  const allRows = (
    <>
      {isError && !all && (
        <li className="flex items-center justify-between gap-2 px-1.5 py-1 text-text-tertiary typo-footnote">
          Couldn’t load the full list.
          <Button
            type="button"
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Tertiary}
            disabled={isFetching}
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </li>
      )}
      {list
        ? rows(list)
        : Array.from({ length: LEADERBOARD_LIST_LIMIT }, (_, index) => (
            <LeaderboardRowPlaceholder key={index} />
          ))}
    </>
  );
  const topRows = rows(
    items.slice(0, you ? LEADERBOARD_TILE_ROWS - 1 : LEADERBOARD_TILE_ROWS),
  );

  return (
    <div className="relative">
      <div className="flex h-full flex-col gap-1 rounded-16 border border-border-subtlest-tertiary p-3">
        <div className="flex items-start justify-between gap-2 px-1.5 pb-1">
          <span className="truncate font-bold typo-callout">{title}</span>
          {!empty && (
            <span ref={cue} className="flex shrink-0">
              <LeaderboardTextLink
                href={`/users/${type}`}
                ariaLabel={`${title}, open ${listLabel.toLowerCase()}`}
                ariaExpanded={open}
                onClick={(event) => {
                  // A plain press opens the list here; a modifier or middle
                  // press keeps the board page's link.
                  if (
                    event.button !== 0 ||
                    event.metaKey ||
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.altKey
                  ) {
                    return;
                  }
                  event.preventDefault();
                  openList();
                }}
              >
                {listLabel}
              </LeaderboardTextLink>
            </span>
          )}
        </div>
        {empty ? (
          <LeaderboardEmptyBoard />
        ) : (
          <ol className="flex flex-col">
            {topRows}
            {you && (
              <>
                <li
                  aria-hidden
                  className="my-1 h-px bg-border-subtlest-tertiary"
                />
                {you}
              </>
            )}
          </ol>
        )}
      </div>
      {isPopover && (
        <>
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
          <div aria-hidden className="fixed inset-0 z-2" onClick={close} />
          <div
            role="dialog"
            aria-label={sheetTitle}
            style={{ transitionDuration: `${EXPAND_MS}ms` }}
            className={classNames(
              'absolute z-3 flex flex-col overflow-hidden rounded-20 border border-border-subtlest-secondary bg-background-popover shadow-2 transition-all ease-out',
              expanded
                ? '-inset-x-3 -top-3 max-h-[30rem] opacity-100'
                : 'inset-x-0 top-0 max-h-[13rem] opacity-64',
            )}
          >
            <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-4">
              <span className="flex flex-col">
                <span className="font-bold typo-body">{title}</span>
                <span className="text-text-tertiary typo-caption1">
                  {listLabel}
                </span>
              </span>
              <Button
                type="button"
                size={ButtonSize.XSmall}
                variant={ButtonVariant.Tertiary}
                icon={<MiniCloseIcon />}
                aria-label="Close"
                autoFocus
                onClick={close}
              />
            </div>
            <ol
              className="flex min-h-0 shrink flex-col overflow-y-auto px-3"
              aria-busy={(isPending && !isError) || undefined}
            >
              {allRows}
            </ol>
            {you && (
              <ol className="border-t border-border-subtlest-tertiary p-3">
                {you}
              </ol>
            )}
          </div>
        </>
      )}
      {isPhone && (
        <RootPortal>
          <Drawer
            isOpen={open}
            onClose={() => setOpen(false)}
            title={sheetTitle}
            className={{ drawer: 'py-1' }}
          >
            <ol
              className="flex flex-col px-3"
              aria-busy={(isPending && !isError) || undefined}
            >
              {allRows}
            </ol>
            {you && (
              <ol className="sticky bottom-0 border-t border-border-subtlest-tertiary bg-background-default p-3">
                {you}
              </ol>
            )}
          </Drawer>
        </RootPortal>
      )}
    </div>
  );
}
