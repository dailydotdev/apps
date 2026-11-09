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
 * A board's top rows and, where production can rank you, your row. A press
 * anywhere opens its top 50: in place as a popover from tablet up, in a
 * bottom sheet on phones. The full list is only asked for once it opens.
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
  const openList = () => {
    setOpen(true);
    logEvent(leaderboardBoardClickEvent(type, isPhone ? 'sheet' : 'popover'));
  };
  const [expanded, setExpanded] = useState(false);
  const popover = useRef<HTMLDivElement>(null);
  const tile = useRef<HTMLDivElement>(null);
  const isPopover = open && !isPhone;
  const { data: all, isPending } = useQuery({
    ...leaderboardBoardQueryOptions<T>(type, LEADERBOARD_TOP_LIMIT),
    enabled: open,
  });

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

  // Escape closes the popover, and so does a press anywhere outside it.
  useEffect(() => {
    if (!isPopover) {
      return undefined;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        tile.current?.focus();
      }
    };
    const onPress = (event: MouseEvent) => {
      if (!popover.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPress);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPress);
    };
  }, [isPopover]);

  const empty = items.length === 0;
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
  const allRows = isPending
    ? Array.from({ length: LEADERBOARD_LIST_LIMIT }, (_, index) => (
        <LeaderboardRowPlaceholder key={index} />
      ))
    : rows(all ?? []);
  const topRows = rows(
    items.slice(0, you ? LEADERBOARD_TILE_ROWS - 1 : LEADERBOARD_TILE_ROWS),
  );

  // An empty board is a plain card: nothing to open.
  const pressable = empty
    ? {}
    : {
        role: 'button',
        tabIndex: 0,
        'aria-label': `${title}, open ${listLabel.toLowerCase()}`,
        'aria-expanded': open,
        onClick: openList,
        onKeyDown: (event: React.KeyboardEvent) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openList();
          }
        },
      };

  return (
    <div className="relative">
      <div
        ref={tile}
        {...pressable}
        className={classNames(
          'flex h-full flex-col gap-1 rounded-16 border border-border-subtlest-tertiary p-3',
          !empty &&
            'cursor-pointer transition-colors hover:border-border-subtlest-secondary hover:bg-surface-hover',
        )}
      >
        <div className="flex items-start justify-between gap-2 px-1.5 pb-1">
          <span className="truncate font-bold typo-callout">{title}</span>
          {!empty && <LeaderboardTextLink>{listLabel}</LeaderboardTextLink>}
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
        <div
          ref={popover}
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
              onClick={() => {
                setOpen(false);
                tile.current?.focus();
              }}
            />
          </div>
          <ol
            className="flex min-h-0 shrink flex-col overflow-y-auto px-3"
            aria-busy={isPending || undefined}
          >
            {allRows}
          </ol>
          {you && (
            <ol className="border-t border-border-subtlest-tertiary p-3">
              {you}
            </ol>
          )}
        </div>
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
              aria-busy={isPending || undefined}
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
