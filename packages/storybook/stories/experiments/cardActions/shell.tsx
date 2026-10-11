import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { BookmarkIcon } from '@dailydotdev/shared/src/components/icons/Bookmark';
import { HomeIcon } from '@dailydotdev/shared/src/components/icons/Home';
import { HotIcon } from '@dailydotdev/shared/src/components/icons/Hot';
import { SearchIcon } from '@dailydotdev/shared/src/components/icons/Search';
import { SquadIcon } from '@dailydotdev/shared/src/components/icons/Squad';
import { BellIcon } from '@dailydotdev/shared/src/components/icons/Bell';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { DailyIcon } from '@dailydotdev/shared/src/components/icons/DailyIcon';

/* ------------------------------------------------------------------------ */
/* Production geometry                                                       */
/* ------------------------------------------------------------------------ */

/**
 * Production v1 layout (layout v2 is behind `layout_v2_2`, off by default):
 * header `laptop:h-16`, sidebar `laptop:w-60` / `laptop:w-11`, feed gutter
 * `laptop:px-10` + `laptop:py-10`, grid `gap-8`. Header and collapsed sidebar
 * also measured on the live site, 2026-10-08.
 */
export const GEOMETRY = {
  header: 64,
  headerSmall: 56,
  sidebarClosed: 44,
  sidebarOpen: 240,
  sidebarTablet: 64,
  padding: 40,
  gap: 32,
};

const BREAKPOINTS: [number, number][] = [
  [1976, 6],
  [1668, 5],
  [1360, 4],
  [1020, 3],
  [656, 2],
  [0, 1],
];

export const isLaptop = (width: number): boolean => width >= 1020;

export const railWidth = (
  width: number,
  sidebar: 'open' | 'closed',
): number => {
  if (isLaptop(width)) {
    return sidebar === 'open' ? GEOMETRY.sidebarOpen : GEOMETRY.sidebarClosed;
  }
  return width >= 656 ? GEOMETRY.sidebarTablet : 0;
};

/**
 * FeedContext shifts its breakpoints by the sidebar's width, so the column
 * count is decided by what is left after the sidebar (`eco` setting).
 */
export const columnsForViewport = (
  width: number,
  sidebar: 'open' | 'closed' = 'open',
): number => {
  const left = width - (isLaptop(width) ? railWidth(width, sidebar) : 0);
  return BREAKPOINTS.find(([min]) => left >= min)?.[1] ?? 1;
};

/** The grid card width production renders at this viewport. */
export const cardWidthFor = (
  width: number,
  sidebar: 'open' | 'closed',
  gap = GEOMETRY.gap,
  side = GEOMETRY.padding,
): number => {
  const cols = columnsForViewport(width, sidebar);
  return (
    (width - railWidth(width, sidebar) - 2 * side - gap * (cols - 1)) / cols
  );
};

/* ------------------------------------------------------------------------ */
/* Shell                                                                     */
/* ------------------------------------------------------------------------ */

const RailItem = ({
  icon,
  label,
  open,
  active,
}: {
  icon: ReactElement;
  label: string;
  open: boolean;
  active?: boolean;
}) => (
  <div
    className={classNames(
      'flex h-9 items-center gap-3 rounded-10 px-2.5 typo-callout',
      active
        ? 'bg-surface-float text-text-primary'
        : 'text-text-tertiary hover:text-text-primary',
    )}
  >
    {React.cloneElement(icon, { size: IconSize.Small, secondary: active })}
    {open && <span className="truncate">{label}</span>}
  </div>
);

/**
 * A stand-in for the app chrome — header, left rail and feed padding at the
 * production sizes — so the feed sits where it really sits. The chrome is
 * drawn, not the real Header/Sidebar; only the cards are production code.
 */
export const FeedShell = ({
  width,
  sidebar,
  side = GEOMETRY.padding,
  children,
}: {
  width: number;
  sidebar: 'open' | 'closed';
  side?: number;
  children: ReactNode;
}): ReactElement => {
  const laptop = isLaptop(width);
  const open = laptop && sidebar === 'open';
  const rail = railWidth(width, sidebar);
  const header = laptop ? GEOMETRY.header : GEOMETRY.headerSmall;

  return (
    <div className="min-h-screen bg-background-default">
      <header
        className="sticky top-0 flex items-center gap-4 border-b border-border-subtlest-tertiary bg-background-default px-4"
        style={{ height: header, zIndex: 3 }}
      >
        <DailyIcon className="h-8 w-8 text-text-primary" />
        {laptop && (
          <div className="mx-auto flex h-10 w-full max-w-[32rem] items-center gap-2 rounded-12 bg-surface-float px-3 text-text-quaternary typo-callout">
            <SearchIcon size={IconSize.Small} />
            Search
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          <span className="flex h-10 items-center gap-1 rounded-12 bg-surface-float px-3 font-bold text-text-primary typo-callout">
            <PlusIcon size={IconSize.Small} />
            {laptop && 'New post'}
          </span>
          <BellIcon size={IconSize.Medium} className="text-text-tertiary" />
          <span className="h-8 w-8 rounded-10 bg-accent-cabbage-default" />
        </div>
      </header>
      <div className="flex">
        {rail > 0 && (
          <aside
            className="sticky flex shrink-0 flex-col gap-1 border-r border-border-subtlest-tertiary p-1"
            style={{
              width: rail,
              top: header,
              height: `calc(100vh - ${header}px)`,
            }}
          >
            <RailItem icon={<HomeIcon />} label="My feed" open={open} active />
            <RailItem icon={<HotIcon />} label="Popular" open={open} />
            <RailItem icon={<SquadIcon />} label="Squads" open={open} />
            <RailItem icon={<BookmarkIcon />} label="Bookmarks" open={open} />
          </aside>
        )}
        <main
          className="min-w-0 flex-1"
          style={{
            padding: laptop ? `${GEOMETRY.padding}px ${side}px 64px` : 0,
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
