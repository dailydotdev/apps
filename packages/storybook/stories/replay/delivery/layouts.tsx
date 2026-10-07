import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import LogoText from '@dailydotdev/shared/src/svg/LogoText';
import { BellIcon } from '@dailydotdev/shared/src/components/icons/Bell';
import { BookmarkIcon } from '@dailydotdev/shared/src/components/icons/Bookmark';
import { DiscussIcon } from '@dailydotdev/shared/src/components/icons/Discuss';
import { EarthIcon } from '@dailydotdev/shared/src/components/icons/Earth';
import { FilterIcon } from '@dailydotdev/shared/src/components/icons/Filter';
import { HelpIcon } from '@dailydotdev/shared/src/components/icons/Help';
import { HomeIcon } from '@dailydotdev/shared/src/components/icons/Home';
import { HotIcon } from '@dailydotdev/shared/src/components/icons/Hot';
import { InviteIcon } from '@dailydotdev/shared/src/components/icons/Invite';
import { LayoutIcon } from '@dailydotdev/shared/src/components/icons/Layout';
import { MenuIcon } from '@dailydotdev/shared/src/components/icons/Menu';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { SearchIcon } from '@dailydotdev/shared/src/components/icons/Search';
import { SettingsIcon } from '@dailydotdev/shared/src/components/icons/Settings';
import { SquadIcon } from '@dailydotdev/shared/src/components/icons/Squad';
import { UserIcon } from '@dailydotdev/shared/src/components/icons/User';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Avatar, ME } from '../people';
import { Post } from './product';

/**
 * The two real layouts, drawn from the code rather than from memory.
 *
 * v2 (SidebarDesktopV2): the sidebar owns the header. A 64px icon rail with
 * the logo, Home and Search fixed at the top; the reorderable tabs (Explore,
 * Squads, Notifications, Streak, the You avatar with its streak chip, New
 * post); the shortcuts dock; Invite, Support and Settings fixed at the foot.
 * The page carries a 56px header strip (the feed heading on the left, the
 * feed's action buttons on the right) and then the grid.
 *
 * Classic (MainLayoutHeader + SidebarDesktop + FeedNav): a top header with the
 * logo, the search panel and the header buttons (quest, reading streak, bell,
 * profile); a 240px sidebar of sections; the FeedNav tab strip with its
 * actions on the right; then the grid.
 */

const railTab =
  'flex w-14 flex-col items-center gap-0.5 rounded-10 py-1.5 text-text-tertiary hover:bg-surface-float hover:text-text-primary';

export const RailTab = ({ icon, label, active = false, children, compact = false }: { icon?: ReactNode; label: string; active?: boolean; children?: ReactNode; compact?: boolean }): ReactElement => (
  <div className={classNames(railTab, active && 'bg-surface-float text-text-primary')} title={label}>
    {children ?? icon}
    {!compact && <span className={classNames('typo-caption2', active ? 'text-text-primary' : 'text-text-quaternary')}>{label}</span>}
  </div>
);

const StreakTile = (): ReactElement => (
  <span className="flex h-7 w-7 items-center justify-center rounded-8 border border-accent-bacon-default bg-accent-bacon-default text-white">
    <HotIcon size={IconSize.Small} secondary />
  </span>
);

const YouAvatar = (): ReactElement => (
  <span className="relative mb-2 block">
    <Avatar person={ME} size={30} />
    <span className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-8 bg-background-default px-1.5 py-0.5 font-bold text-accent-bacon-default typo-caption2">
      <HotIcon size={IconSize.XXSmall} secondary />
      37
    </span>
  </span>
);

export interface RailSlots {
  /** A tab injected after the tab whose label is given (or first if empty). */
  tabAfter?: { after: 'Explore' | 'Squads' | 'Notifications' | 'Streak' | 'You' | 'Post'; node: ReactNode };
  /** A pinned shortcut in the dock. */
  dockExtra?: ReactNode;
  /** Something above the foot (Invite/Support/Settings). */
  aboveFoot?: ReactNode;
  /** Replaces the You avatar. */
  youOverride?: ReactNode;
}

export const RailV2 = ({ compact = false, slots = {}, active = 'Explore' }: { compact?: boolean; slots?: RailSlots; active?: string }): ReactElement => {
  const tabs: { label: string; node: ReactNode }[] = [
    { label: 'Explore', node: <EarthIcon size={IconSize.Medium} secondary={active === 'Explore'} /> },
    { label: 'Squads', node: <SquadIcon size={IconSize.Medium} /> },
    { label: 'Notifications', node: <span className="relative"><BellIcon size={IconSize.Medium} /><span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-[999px] bg-accent-cabbage-default" /></span> },
    { label: 'Streak', node: <StreakTile /> },
    { label: 'You', node: slots.youOverride ?? <YouAvatar /> },
    { label: 'Post', node: <span className="flex h-7 w-7 items-center justify-center rounded-8 bg-surface-float text-text-secondary"><PlusIcon size={IconSize.Small} /></span> },
  ];
  return (
    <aside className="flex h-full w-16 shrink-0 flex-col items-center gap-0.5 border-r border-border-subtlest-tertiary py-2" style={{ background: 'color-mix(in srgb, var(--theme-surface-secondary) 3%, var(--theme-background-default))' }}>
      <span className="mb-1 flex h-8 w-8 items-center justify-center rounded-10 text-text-primary [&_svg]:h-6 [&_svg]:w-6">
        <LogoIcon />
      </span>
      <RailTab icon={<HomeIcon size={IconSize.Medium} secondary />} label="Home" compact={compact} active />
      <RailTab icon={<SearchIcon size={IconSize.Medium} />} label="Search" compact={compact} />
      <span className="my-1 h-px w-8 bg-border-subtlest-tertiary" />
      {tabs.map((tab) => (
        <React.Fragment key={tab.label}>
          <RailTab label={tab.label} compact={compact} active={tab.label === active}>
            {tab.node}
          </RailTab>
          {slots.tabAfter?.after === tab.label && slots.tabAfter.node}
        </React.Fragment>
      ))}
      <span className="my-1 h-px w-8 bg-border-subtlest-tertiary" />
      <div className="flex flex-col items-center gap-1">
        {['T', 'S', 'B'].map((letter) => (
          <span key={letter} className="flex h-6 w-6 items-center justify-center rounded-8 bg-surface-float text-text-tertiary typo-caption1">
            {letter}
          </span>
        ))}
        {slots.dockExtra}
        <span className="flex h-6 w-6 items-center justify-center rounded-8 text-text-quaternary">
          <MenuIcon size={IconSize.XSmall} />
        </span>
      </div>
      <span className="flex-1" />
      {slots.aboveFoot}
      <div className="flex flex-col items-center gap-1 text-text-quaternary">
        <span className="flex h-7 w-7 items-center justify-center rounded-8"><InviteIcon size={IconSize.Small} /></span>
        <span className="flex h-7 w-7 items-center justify-center rounded-8"><HelpIcon size={IconSize.Small} /></span>
        <span className="flex h-7 w-7 items-center justify-center rounded-8"><SettingsIcon size={IconSize.Small} /></span>
      </div>
    </aside>
  );
};

export const V2Shell = ({
  slots,
  headerRight,
  heading = 'For you',
  count = 6,
  width = 1180,
  compact = false,
  overlay,
  cols = 3,
  content,
  stickyTop,
  height,
}: {
  slots?: RailSlots;
  headerRight?: ReactNode;
  heading?: string;
  count?: number;
  width?: number;
  compact?: boolean;
  overlay?: ReactNode;
  cols?: number;
  /** Replaces the grid inside the page card. */
  content?: ReactNode;
  /** A row above the page header, inside the page card. */
  stickyTop?: ReactNode;
  height?: number;
}): ReactElement => (
  <div className="relative flex overflow-hidden rounded-20 border border-border-subtlest-tertiary" style={{ width, maxWidth: '100%', height, background: 'color-mix(in srgb, var(--theme-surface-secondary) 3%, var(--theme-background-default))' }}>
    <RailV2 slots={slots} compact={compact} />
    <div className="flex min-w-0 flex-1 flex-col p-3">
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default">
        {stickyTop}
        <header className="flex min-h-14 w-full items-center gap-2 border-b border-border-subtlest-quaternary px-6 py-3">
          <strong className="min-w-0 flex-1 truncate typo-callout">{heading}</strong>
          <span className="flex items-center gap-2">
            {headerRight}
            <span className="flex h-8 w-8 items-center justify-center rounded-10 text-text-tertiary"><FilterIcon size={IconSize.Small} /></span>
            <span className="flex h-8 w-8 items-center justify-center rounded-10 text-text-tertiary"><LayoutIcon size={IconSize.Small} /></span>
          </span>
        </header>
        {content ?? (
          <div className="grid gap-4 p-5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
            {Array.from({ length: count }).map((_, index) => (
              <Post key={index} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
    {overlay && <div className="pointer-events-none absolute inset-0 [&>*]:pointer-events-auto">{overlay}</div>}
  </div>
);

/* -------------------------------------------------------------------------- */
/* Classic                                                                     */
/* -------------------------------------------------------------------------- */

const SIDEBAR: { title?: string; items: { label: string; icon?: ReactNode; active?: boolean }[] }[] = [
  { items: [{ label: 'For you', icon: <HomeIcon size={IconSize.Small} secondary />, active: true }, { label: 'Following', icon: <UserIcon size={IconSize.Small} /> }, { label: 'Explore', icon: <EarthIcon size={IconSize.Small} /> }, { label: 'Discussions', icon: <DiscussIcon size={IconSize.Small} /> }] },
  { title: 'Feeds', items: [{ label: 'Infra digest' }, { label: 'Rust only' }] },
  { title: 'Squads', items: [{ label: 'Kubernetes', icon: <SquadIcon size={IconSize.Small} /> }, { label: 'Rustaceans', icon: <SquadIcon size={IconSize.Small} /> }] },
  { title: 'Saved', items: [{ label: 'Bookmarks', icon: <BookmarkIcon size={IconSize.Small} /> }, { label: 'History' }] },
];

export const ClassicShell = ({
  headerExtra,
  headerBefore,
  sidebarExtra,
  navRight,
  navFirst,
  count = 6,
  width = 1180,
  overlay,
  cols = 3,
  content,
  stickyTop,
  height,
  sidebar = true,
}: {
  cols?: number;
  /** Replaces the grid. */
  content?: ReactNode;
  /** A row above the feed nav. */
  stickyTop?: ReactNode;
  height?: number;
  sidebar?: boolean;
  /** Between the streak button and the bell. */
  headerExtra?: ReactNode;
  /** Before the quest button, right after the search. */
  headerBefore?: ReactNode;
  /** An item under the main sidebar section. */
  sidebarExtra?: ReactNode;
  /** In the FeedNav actions on the right. */
  navRight?: ReactNode;
  /** Before the first tab. */
  navFirst?: ReactNode;
  count?: number;
  width?: number;
  overlay?: ReactNode;
}): ReactElement => (
  <div className="relative flex flex-col overflow-hidden rounded-20 border border-border-subtlest-tertiary bg-background-default" style={{ width, maxWidth: '100%', height }}>
    <header className="flex h-14 items-center gap-3 border-b border-border-subtlest-tertiary px-4">
      <span className="flex items-center gap-1.5 text-text-primary">
        <span className="flex h-6 w-6 [&_svg]:h-full [&_svg]:w-full"><LogoIcon /></span>
        <span className="flex h-4 [&_svg]:h-full [&_svg]:w-auto"><LogoText /></span>
      </span>
      <span className="ml-8 flex h-9 w-[22rem] items-center gap-2 rounded-12 border border-border-subtlest-tertiary bg-surface-float px-3 text-text-quaternary typo-callout">
        <SearchIcon size={IconSize.Small} />
        Search
      </span>
      <span className="ml-auto flex items-center gap-2">
        {headerBefore}
        <span className="flex h-9 items-center gap-1.5 rounded-10 border border-border-subtlest-tertiary px-2.5 text-text-tertiary typo-footnote">
          <span className="h-4 w-4 rounded-[999px] bg-accent-cheese-default" />
          Quest
        </span>
        <span className="flex h-9 items-center gap-1 rounded-10 px-2 font-bold text-accent-bacon-default typo-callout">
          <HotIcon size={IconSize.Small} secondary />
          37
        </span>
        {headerExtra}
        <span className="relative flex h-9 w-9 items-center justify-center rounded-10 text-text-tertiary">
          <BellIcon size={IconSize.Small} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-[999px] bg-accent-cabbage-default" />
        </span>
        <Avatar person={ME} size={30} />
      </span>
    </header>
    <div className="flex min-h-0 flex-1">
      {sidebar && <aside className="flex w-60 shrink-0 flex-col gap-4 border-r border-border-subtlest-tertiary px-3 py-4">
        {SIDEBAR.map((section, index) => (
          <div key={section.title ?? 'main'} className="flex flex-col gap-0.5">
            {section.title && <span className="px-3 pb-1 text-text-quaternary typo-caption1">{section.title}</span>}
            {section.items.map((item) => (
              <span key={item.label} className={classNames('flex items-center gap-3 rounded-10 px-3 py-1.5 typo-callout', item.active ? 'bg-surface-float font-bold text-text-primary' : 'text-text-tertiary')}>
                {item.icon ?? <span className="h-4 w-4 rounded-4 bg-surface-hover" />}
                {item.label}
              </span>
            ))}
            {index === 0 && sidebarExtra}
          </div>
        ))}
      </aside>}
      <div className="flex min-w-0 flex-1 flex-col">
        {stickyTop}
        <div className="flex items-center border-b border-border-subtlest-tertiary px-4">
          {navFirst}
          {['For you', 'Popular', 'Following', 'Discussions', 'Bookmarks'].map((tab, index) => (
            <span key={tab} className={classNames('border-b-2 px-3 py-3.5 typo-callout', index === 0 ? 'border-text-primary font-bold text-text-primary' : 'border-transparent text-text-tertiary')}>
              {tab}
            </span>
          ))}
          <span className="ml-auto flex items-center gap-1 py-2 text-text-tertiary">
            {navRight}
            <span className="flex h-8 w-8 items-center justify-center rounded-10"><FilterIcon size={IconSize.Small} /></span>
            <span className="flex h-8 w-8 items-center justify-center rounded-10"><LayoutIcon size={IconSize.Small} /></span>
          </span>
        </div>
        {content ?? (
          <div className="grid gap-4 p-5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
            {Array.from({ length: count }).map((_, index) => (
              <Post key={index} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
    {overlay && <div className="pointer-events-none absolute inset-0 [&>*]:pointer-events-auto">{overlay}</div>}
  </div>
);

/** The mobile top: the chip row from UnifiedMobileFeedNav and its actions. */
export const MobileTop = ({ first, actions }: { first?: ReactNode; actions?: ReactNode }): ReactElement => (
  <div className="flex w-full flex-col">
    <div className="flex h-12 items-center gap-3 border-b border-border-subtlest-tertiary px-3">
      <span className="flex h-6 w-6 text-text-primary [&_svg]:h-full [&_svg]:w-full"><LogoIcon /></span>
      <span className="ml-auto flex items-center gap-2">
        <span className="flex items-center gap-1 font-bold text-accent-bacon-default typo-caption1"><HotIcon size={IconSize.XSmall} secondary />37</span>
        <span className="relative flex h-8 w-8 items-center justify-center text-text-tertiary"><BellIcon size={IconSize.Small} /><span className="absolute right-1 top-1 h-2 w-2 rounded-[999px] bg-accent-cabbage-default" /></span>
        <Avatar person={ME} size={26} />
      </span>
    </div>
    <div className="flex items-center border-b border-border-subtlest-tertiary">
      <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto px-3 py-3">
        {first}
        {['For you', 'Popular', 'Following', 'Bookmarks'].map((chip, index) => (
          <span key={chip} className={classNames('shrink-0 rounded-10 px-2.5 py-1.5 typo-footnote', index === 0 ? 'bg-text-primary font-bold text-surface-invert' : 'bg-surface-float text-text-tertiary')}>
            {chip}
          </span>
        ))}
      </div>
      <div className="flex shrink-0 items-center gap-1 py-2 pl-1 pr-3 text-text-tertiary">
        {actions}
        <span className="flex h-8 w-8 items-center justify-center"><FilterIcon size={IconSize.Small} /></span>
      </div>
    </div>
  </div>
);
