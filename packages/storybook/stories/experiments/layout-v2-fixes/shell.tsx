import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { pageHeaderClassName } from '@dailydotdev/shared/src/components/layout/PageHeader';
import {
  AlertColor,
  AlertDot,
} from '@dailydotdev/shared/src/components/AlertDot';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import { AnalyticsIcon } from '@dailydotdev/shared/src/components/icons/Analytics';
import { AppIcon } from '@dailydotdev/shared/src/components/icons/App';
import { BellIcon } from '@dailydotdev/shared/src/components/icons/Bell';
import { BookmarkIcon } from '@dailydotdev/shared/src/components/icons/Bookmark';
import { CompassIcon } from '@dailydotdev/shared/src/components/icons/Compass';
import { DevPlusIcon } from '@dailydotdev/shared/src/components/icons/DevPlus';
import { EarthIcon } from '@dailydotdev/shared/src/components/icons/Earth';
import { EditIcon } from '@dailydotdev/shared/src/components/icons/Edit';
import { EyeIcon } from '@dailydotdev/shared/src/components/icons/Eye';
import { FilterIcon } from '@dailydotdev/shared/src/components/icons/Filter';
import { HashtagIcon } from '@dailydotdev/shared/src/components/icons/Hashtag';
import { HelpIcon } from '@dailydotdev/shared/src/components/icons/Help';
import { HomeIcon } from '@dailydotdev/shared/src/components/icons/Home';
import { HotIcon } from '@dailydotdev/shared/src/components/icons/Hot';
import { InviteIcon } from '@dailydotdev/shared/src/components/icons/Invite';
import { MedalIcon } from '@dailydotdev/shared/src/components/icons/Medal';
import { MedalBadgeIcon } from '@dailydotdev/shared/src/components/icons/MedalBadge';
import { MegaphoneIcon } from '@dailydotdev/shared/src/components/icons/Megaphone';
import { MenuIcon } from '@dailydotdev/shared/src/components/icons/Menu';
import { NewPostIcon } from '@dailydotdev/shared/src/components/icons/NewPost';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { SearchIcon } from '@dailydotdev/shared/src/components/icons/Search';
import { SettingsIcon } from '@dailydotdev/shared/src/components/icons/Settings';
import { ShieldCheckIcon } from '@dailydotdev/shared/src/components/icons/ShieldCheck';
import { ShieldPlusIcon } from '@dailydotdev/shared/src/components/icons/ShieldPlus';
import { SignalIcon } from '@dailydotdev/shared/src/components/icons/Signal';
import { SortIcon } from '@dailydotdev/shared/src/components/icons/Sort';
import { SquadIcon } from '@dailydotdev/shared/src/components/icons/Squad';

// A drawn stand-in for the v2 desktop shell (SidebarDesktopV2, the v2 page
// header strip from SearchControlHeader, and optionally the feed widget rail
// behind `feed_widgets`), at production sizes: rail `w-20`, panel `w-60`, tab
// rows `railTabClass`, New post `!size-9`, header icon buttons `!size-8`.
// Only the chrome is drawn, so variants differ exactly where a proposal does.

export type ShellVariant = 'current' | 'proposed';
export type PanelId = 'explore' | 'you' | 'none';
export interface ShellProps {
  variant: ShellVariant;
  panel?: PanelId;
  isPlus?: boolean;
  // The feed widget rail (`feed_widgets`, off by default) above the grid.
  widgets?: boolean;
  // Viewport height. Below ~760px the current rail folds tabs into "More".
  height?: number;
  width?: number;
  showMarkers?: boolean;
}

// The number badges tie each change on the canvas to its row in the legend.
export const Marker = ({
  n,
  className,
}: {
  n: number;
  className?: string;
}): ReactElement => (
  <span
    aria-hidden
    className={classNames(
      'pointer-events-none absolute z-2 flex size-5 items-center justify-center rounded-full bg-accent-cabbage-default font-bold text-white shadow-2 ring-2 ring-background-default typo-caption2',
      className,
    )}
  >
    {n}
  </span>
);

const railTabClass =
  'relative flex w-full flex-col items-center gap-0.5 rounded-12 px-1 py-2 text-text-tertiary';
const railLabelClass = 'typo-caption2 leading-tight text-center';
const railButtonClass =
  'relative flex size-10 items-center justify-center rounded-12 text-text-tertiary';
const railDivider = 'my-1 h-px w-6 bg-border-subtlest-quaternary';
// SearchControlHeader's compact v2 button classes, verbatim.
const compactIconButtonClassName =
  '!size-8 !rounded-10 !border-transparent !bg-transparent !p-0 hover:!bg-surface-hover';
const compactTextButtonClassName =
  '!h-8 !rounded-10 !border-transparent !bg-transparent !px-3 hover:!bg-surface-hover';
// The page background v2 paints behind the rail, panel and floating card
// (MainLayout and SidebarDesktopV2 share it).
const v2PageBackground =
  'bg-[color-mix(in_srgb,var(--theme-surface-secondary)_3%,var(--theme-background-default))]';

const RailTab = ({
  icon,
  label,
  active,
  badge,
}: {
  icon: ReactElement;
  label: string;
  active?: boolean;
  badge?: ReactNode;
}): ReactElement => (
  <div
    className={classNames(
      railTabClass,
      active && 'bg-surface-hover !text-text-primary',
    )}
  >
    <span className="relative flex size-6 items-center justify-center">
      {React.cloneElement(icon, { size: IconSize.Small, secondary: active })}
      {badge}
    </span>
    <span className={railLabelClass}>{label}</span>
  </div>
);

const Avatar = ({ className }: { className?: string }): ReactElement => (
  <span
    className={classNames(
      'size-6 rounded-8 bg-gradient-to-br from-accent-cabbage-default to-accent-onion-default',
      className,
    )}
  />
);

// The rail's New post: a bare 36px primary chip, no label. Production puts it
// after the avatar; proposed keeps the chip as is and moves it under Search,
// into the fixed top block, so it never moves with the tab order or folds into
// "More". Same 36px + my-2 either way, so the overflow budget is unchanged.
const NewPostChip = ({
  showMarker,
}: {
  showMarker?: boolean;
}): ReactElement => (
  <div className="relative flex w-full justify-center">
    <Button
      type="button"
      variant={ButtonVariant.Primary}
      size={ButtonSize.Small}
      icon={<NewPostIcon />}
      aria-label="New post"
      className="my-2 !size-9 !rounded-12 [&_svg]:!size-6"
    />
    {showMarker && <Marker n={1} className="right-1 top-0" />}
  </div>
);

// Proposed: a second, labeled New post entry at the right end of the page
// header — where v1's header kept its "New post" button.
const NewPostHeaderButton = ({
  showMarker,
}: {
  showMarker?: boolean;
}): ReactElement => (
  <span className="relative ml-1 flex shrink-0">
    <Button
      type="button"
      variant={ButtonVariant.Primary}
      size={ButtonSize.Small}
      icon={<NewPostIcon />}
    >
      New post
    </Button>
    {showMarker && <Marker n={1} className="-right-2 -top-2" />}
  </span>
);

const ShortcutDots = (): ReactElement => (
  <div className="flex flex-col items-center gap-2 py-2">
    {[
      'bg-accent-blueCheese-default',
      'bg-accent-avocado-default',
      'bg-accent-bacon-default',
    ].map((color) => (
      <span key={color} className={classNames('size-7 rounded-10', color)} />
    ))}
    <span className="flex size-7 items-center justify-center text-text-quaternary">
      <MenuIcon size={IconSize.XSmall} />
    </span>
  </div>
);

type TabId = 'explore' | 'squads' | 'lfg' | 'notifications' | 'streak' | 'you';

const renderTab = (id: TabId, panel: PanelId): ReactElement => {
  switch (id) {
    case 'explore':
      return (
        <RailTab
          key={id}
          icon={<CompassIcon />}
          label="Explore"
          active={panel === 'explore'}
        />
      );
    case 'squads':
      return <RailTab key={id} icon={<SquadIcon />} label="Squads" />;
    case 'lfg':
      return <RailTab key={id} icon={<SignalIcon />} label="LFG" />;
    case 'notifications':
      return (
        <RailTab
          key={id}
          icon={<BellIcon />}
          label="Activity"
          badge={
            <span className="absolute -top-1 left-4 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-8 bg-accent-ketchup-default px-1 font-bold text-white typo-caption1">
              3
            </span>
          }
        />
      );
    case 'streak':
      return (
        <RailTab
          key={id}
          icon={<HotIcon className="text-accent-bacon-default" />}
          label="12 days"
        />
      );
    case 'you':
    default:
      return (
        <div
          key={id}
          className={classNames(
            railTabClass,
            panel === 'you' && 'bg-surface-hover !text-text-primary',
          )}
        >
          <span className="relative flex size-6 items-center justify-center">
            <Avatar />
          </span>
          <span className={railLabelClass}>You</span>
        </div>
      );
  }
};

// Mirrors the overflow budget in SidebarDesktopV2: everything below the fixed
// top block and above the utilities is the measured region. Tab rows are 58px
// + 2px gap; New post costs 36 + 16 + 2 wherever it sits; the dock wants ~3
// rows. Proposed moves New post out of the measured region into the top block,
// so both variants fold at exactly the same heights.
const TAB_ROW = 60;
const NEW_POST_ROW = 54;
const TOP_BLOCK = 13 + 10 + 40 + 2 + 40 + 2 + 40 + 10;
const UTILITIES = 10 + 40 * 3 + 6 + 12;
const MIN_DOCK = 25 + 3 * 42;

const foldTabs = ({
  height,
}: {
  height: number;
}): { inline: TabId[]; folded: TabId[]; showDock: boolean } => {
  const tabs: TabId[] = ['explore', 'squads', 'lfg', 'notifications', 'streak'];
  // The avatar is pinned in both variants.
  const available = height - TOP_BLOCK - NEW_POST_ROW - UTILITIES - TAB_ROW;
  if (available >= tabs.length * TAB_ROW + MIN_DOCK) {
    return { inline: tabs, folded: [], showDock: true };
  }
  const fit = Math.max(0, Math.floor((available - TAB_ROW) / TAB_ROW));
  return {
    inline: tabs.slice(0, fit),
    folded: tabs.slice(fit),
    showDock: false,
  };
};

const Rail = ({
  variant,
  panel,
  height,
  showMarkers,
}: Required<
  Omit<ShellProps, 'width' | 'widgets' | 'isPlus'>
>): ReactElement => {
  const isProposed = variant === 'proposed';
  const { inline, folded, showDock } = foldTabs({ height });

  return (
    <nav
      className={classNames(
        'flex h-full w-20 shrink-0 flex-col items-center gap-0.5 px-1.5 pb-3 pt-[13px]',
        panel !== 'none' && 'border-r border-border-subtlest-quaternary',
      )}
    >
      <div className="mt-2.5 flex size-10 items-center justify-center text-text-primary">
        <LogoIcon className={{ container: 'h-[1.125rem] w-auto' }} />
      </div>
      <span
        className={classNames(
          railButtonClass,
          panel === 'none' && '!text-text-primary',
        )}
      >
        <HomeIcon size={IconSize.Small} secondary={panel === 'none'} />
      </span>
      <span className={railButtonClass}>
        <SearchIcon size={IconSize.Small} />
      </span>
      {isProposed && <NewPostChip showMarker={showMarkers} />}
      <div className={railDivider} />
      <div className="flex w-full flex-1 flex-col items-center gap-0.5 overflow-hidden">
        {inline.map((id) => renderTab(id, panel))}
        {renderTab('you', panel)}
        {!isProposed && <NewPostChip />}
        {showDock && (
          <>
            <div className={classNames(railDivider, 'my-3')} />
            <ShortcutDots />
          </>
        )}
        {/* With shortcuts saved, More shows as soon as the dock can't fit:
            it then holds the shortcuts and any folded tabs. */}
        {!showDock && (
          <RailTab
            icon={<MenuIcon className="rotate-90" />}
            label={folded.length ? `More (${folded.length})` : 'More'}
          />
        )}
      </div>
      <div className={railDivider} />
      <span className={railButtonClass}>
        <InviteIcon size={IconSize.Small} />
      </span>
      <span className={railButtonClass}>
        <HelpIcon size={IconSize.Small} />
      </span>
      <span className={railButtonClass}>
        <SettingsIcon size={IconSize.Small} />
      </span>
    </nav>
  );
};

interface PanelRow {
  icon: ReactElement;
  label: string;
  active?: boolean;
  alert?: boolean;
  plus?: boolean;
  marker?: number;
  hint?: string;
}

const PanelRowItem = ({ row }: { row: PanelRow }): ReactElement => (
  <div
    className={classNames(
      'relative flex h-9 items-center gap-3 rounded-10 px-2 typo-callout',
      row.active
        ? 'bg-surface-hover font-bold text-text-primary'
        : 'text-text-tertiary',
      row.plus && '!text-action-plus-default',
    )}
  >
    <span className="relative flex size-5 items-center justify-center">
      {React.cloneElement(row.icon, {
        size: IconSize.Small,
        secondary: row.active,
      })}
      {row.alert && (
        <AlertDot className="-right-1 -top-1" color={AlertColor.Cabbage} />
      )}
    </span>
    <span className="min-w-0 flex-1 truncate">{row.label}</span>
    {row.hint && (
      <span className="shrink-0 rounded-6 bg-accent-cabbage-flat px-1.5 text-accent-cabbage-default typo-caption2">
        {row.hint}
      </span>
    )}
    {row.marker && <Marker n={row.marker} className="-left-3 top-2" />}
  </div>
);

const PanelHeading = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="mb-1 mt-4 px-2 text-text-quaternary typo-caption1">
    {children}
  </div>
);

const explorePanelRows = (
  variant: ShellVariant,
  showMarkers: boolean,
): PanelRow[] => {
  const explore: PanelRow = {
    icon: <CompassIcon />,
    label: 'Explore',
    active: true,
  };
  const happening: PanelRow = {
    icon: <MegaphoneIcon />,
    label: 'Happening Now',
  };
  const tags: PanelRow = { icon: <HashtagIcon />, label: 'Tags' };
  const sources: PanelRow = { icon: <EarthIcon />, label: 'Sources' };
  const leaderboard: PanelRow = { icon: <MedalIcon />, label: 'Leaderboard' };

  if (variant === 'current') {
    return [
      explore,
      happening,
      tags,
      sources,
      { icon: <AppIcon />, label: 'Marketplace', alert: true },
      leaderboard,
    ];
  }

  return [
    explore,
    happening,
    {
      icon: <AppIcon />,
      label: 'Marketplace',
      alert: true,
      hint: 'New',
      marker: showMarkers ? 3 : undefined,
    },
    tags,
    sources,
    leaderboard,
  ];
};

const youPanelRows = (showPlusRow: boolean): PanelRow[] =>
  [
    showPlusRow && { icon: <DevPlusIcon />, label: 'Get Plus', plus: true },
    { icon: <SquadIcon />, label: 'Following' },
    { icon: <EyeIcon />, label: 'History' },
    { icon: <AnalyticsIcon />, label: 'Analytics' },
    { icon: <FilterIcon />, label: 'Feed settings' },
  ].filter(Boolean) as PanelRow[];

const Panel = ({
  variant,
  panel,
  isPlus,
  showMarkers,
}: {
  variant: ShellVariant;
  panel: PanelId;
  isPlus: boolean;
  showMarkers: boolean;
}): ReactElement | null => {
  if (panel === 'none') {
    return null;
  }

  return (
    <section className="relative flex h-full w-60 shrink-0 flex-col overflow-hidden px-3">
      {/* pl-5 lines the title up with the rows' icons, as in production. */}
      <div className="-mx-3 pl-5 pr-3 pt-6">
        <div className="flex h-10 items-center font-bold text-text-primary typo-callout">
          {panel === 'explore' ? 'Explore' : 'You'}
        </div>
      </div>
      {panel === 'explore' && (
        <>
          <div className="mt-2 flex flex-col gap-0.5">
            {explorePanelRows(variant, showMarkers).map((row) => (
              <PanelRowItem key={row.label} row={row} />
            ))}
          </div>
          <PanelHeading>Recent</PanelHeading>
          {['#react', 'The Pragmatic Engineer', 'Frontend squad'].map(
            (label) => (
              <PanelRowItem key={label} row={{ icon: <HotIcon />, label }} />
            ),
          )}
        </>
      )}
      {panel === 'you' && (
        <>
          <div className="mb-4 mt-2 flex items-center gap-2 px-2">
            <Avatar className="!size-10 !rounded-10" />
            <span className="font-bold text-text-primary typo-subhead">
              Dev Dana
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            {youPanelRows(!isPlus).map((row) => (
              <PanelRowItem key={row.label} row={row} />
            ))}
          </div>
          <PanelHeading>Bookmarks</PanelHeading>
          {['Read later', 'System design'].map((label) => (
            <PanelRowItem key={label} row={{ icon: <BookmarkIcon />, label }} />
          ))}
        </>
      )}
      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-12 border border-border-subtlest-tertiary px-3 py-2 text-text-secondary">
        <span className="flex flex-col leading-tight">
          <span className="font-bold typo-callout">Feedback</span>
          <span className="typo-caption2">Real people reply</span>
        </span>
      </div>
    </section>
  );
};

// Clickbait Shield in the v2 strip (ToggleClickbaitShield): members get the
// on/off shield; everyone else gets the shield-plus and their free tries.
const ShieldButton = ({ isPlus }: { isPlus: boolean }): ReactElement =>
  isPlus ? (
    <Button
      type="button"
      variant={ButtonVariant.Tertiary}
      size={ButtonSize.Small}
      icon={
        <ShieldCheckIcon
          size={IconSize.XSmall}
          className="text-status-success"
        />
      }
      className={compactIconButtonClassName}
    />
  ) : (
    <Button
      type="button"
      variant={ButtonVariant.Tertiary}
      size={ButtonSize.Small}
      icon={<ShieldPlusIcon size={IconSize.XSmall} />}
      className={compactTextButtonClassName}
    >
      3/5
    </Button>
  );

const HeaderIconButton = ({ icon }: { icon: ReactElement }): ReactElement => (
  <Button
    type="button"
    variant={ButtonVariant.Tertiary}
    size={ButtonSize.Small}
    icon={icon}
    className={compactIconButtonClassName}
  />
);

// The v2 home page header: `pageHeaderClassName` with SearchControlHeader in
// it. The chips are ExploreChipsBar's compact tabs (the Squads directory tab:
// Float when active, Tertiary otherwise, a half-width underline on the strip's
// bottom border), then "New feed" and the fade; every action sits on the
// right as a compact icon button: feed settings, sort, Clickbait Shield, the
// achievement tracker.
const HomeHeader = ({
  variant,
  isPlus,
  showMarkers,
}: {
  variant: ShellVariant;
  isPlus: boolean;
  showMarkers: boolean;
}): ReactElement => {
  const isProposed = variant === 'proposed';
  const chips = [
    { label: 'For you', active: true },
    ...(isProposed
      ? [{ label: 'Following', marker: showMarkers ? 2 : undefined }]
      : []),
    { label: 'AI & agents' },
    { label: 'Rust' },
    { label: 'Frontend' },
  ];

  return (
    <header className={classNames(pageHeaderClassName, '!py-0')}>
      <div className="flex w-full items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pr-12">
            {chips.map((chip) => (
              <span
                key={chip.label}
                className={classNames(
                  'relative flex shrink-0 items-center py-3',
                  chip.active &&
                    'after:absolute after:inset-x-0 after:bottom-0 after:mx-auto after:w-1/2 after:border-b-2 after:border-text-primary',
                )}
              >
                <Button
                  type="button"
                  size={ButtonSize.Small}
                  pressed={chip.active}
                  variant={
                    chip.active ? ButtonVariant.Float : ButtonVariant.Tertiary
                  }
                >
                  {chip.label}
                </Button>
                {'marker' in chip && chip.marker && (
                  <Marker n={chip.marker} className="-right-2 top-1" />
                )}
              </span>
            ))}
            <span className="inline-flex h-8 shrink-0 items-center justify-center rounded-10 border border-transparent bg-background-subtle px-2.5 text-text-tertiary">
              <PlusIcon />
            </span>
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-r from-transparent to-background-default"
          />
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <HeaderIconButton icon={<FilterIcon size={IconSize.XSmall} />} />
          <HeaderIconButton icon={<SortIcon size={IconSize.XSmall} />} />
          <ShieldButton isPlus={isPlus} />
          <HeaderIconButton icon={<MedalBadgeIcon size={IconSize.XSmall} />} />
        </div>
        {isProposed && <NewPostHeaderButton showMarker={showMarkers} />}
      </div>
    </header>
  );
};

const CardPlaceholder = ({ seed }: { seed: number }): ReactElement => (
  <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4">
    <div className="flex items-center gap-2">
      <span className="size-6 rounded-full bg-surface-float" />
      <span className="h-3 w-20 rounded-4 bg-surface-float" />
    </div>
    <span className="h-4 w-full rounded-4 bg-surface-float" />
    <span
      className={classNames(
        'h-4 rounded-4 bg-surface-float',
        seed % 2 ? 'w-2/3' : 'w-4/5',
      )}
    />
    <span className="mt-2 aspect-video w-full rounded-12 bg-surface-float" />
    <div className="flex gap-4">
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-4 w-8 rounded-4 bg-surface-float" />
      ))}
    </div>
  </div>
);

const QuestRow = ({
  title,
  progress,
  total,
}: {
  title: string;
  progress: number;
  total: number;
}): ReactElement => (
  <div className="flex flex-col gap-1.5 rounded-12 px-2 py-2">
    <div className="flex items-center justify-between gap-2 typo-footnote">
      <span className="min-w-0 flex-1 truncate text-text-primary">{title}</span>
      <span className="text-text-tertiary">
        {progress}/{total}
      </span>
    </div>
    <span className="h-1 overflow-hidden rounded-4 bg-surface-float">
      <span
        className="block h-full rounded-4 bg-accent-bacon-default"
        style={{ width: `${(progress / total) * 100}%` }}
      />
    </span>
  </div>
);

// The feed widget rail (`feed_widgets`): a greeting row with Customize, then a
// row of widgets the reader arranges.
const WidgetRail = (): ReactElement => (
  <section className="flex flex-col gap-1 px-6 pt-4">
    <div className="flex min-h-12 items-center gap-2">
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-bold text-text-primary typo-title3">
          Good morning, Dana
        </span>
        <span className="truncate text-text-tertiary typo-footnote">
          Friday, October 23
        </span>
      </div>
      <span className="flex h-8 items-center gap-1 rounded-10 bg-surface-float px-3 font-bold text-text-primary typo-callout">
        <EditIcon size={IconSize.Small} />
        Customize
      </span>
    </div>
    <div className="grid h-52 grid-cols-3 gap-x-6">
      <div className="flex flex-col justify-end gap-2 rounded-16 bg-gradient-to-t from-surface-float to-background-subtle p-4">
        <span className="text-text-tertiary typo-caption1">Top story</span>
        <span className="font-bold text-text-primary typo-title3">
          The state of WebAssembly in 2026
        </span>
      </div>
      <div className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary p-4">
        <span className="flex items-center gap-1 font-bold text-text-primary typo-callout">
          <HotIcon
            size={IconSize.Small}
            secondary
            className="text-accent-bacon-default"
          />
          12-day streak
        </span>
        <QuestRow title="Read 5 posts" progress={3} total={5} />
        <QuestRow title="Upvote 2 posts" progress={1} total={2} />
      </div>
      <div className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary p-4">
        <span className="text-text-quaternary typo-caption2">Promoted</span>
        <span className="flex-1 rounded-12 bg-surface-float" />
        <span className="h-3 w-2/3 rounded-4 bg-surface-float" />
      </div>
    </div>
  </section>
);

export const V2Shell = ({
  variant,
  panel = 'explore',
  isPlus = false,
  widgets = false,
  height = 820,
  width = 1280,
  showMarkers = true,
}: ShellProps): ReactElement => (
  <div
    className={classNames(
      'relative flex overflow-hidden rounded-16 border border-border-subtlest-tertiary',
      v2PageBackground,
    )}
    style={{ width, height }}
  >
    <Rail
      variant={variant}
      panel={panel}
      height={height}
      showMarkers={showMarkers}
    />
    <Panel
      variant={variant}
      panel={panel}
      isPlus={isPlus}
      showMarkers={showMarkers}
    />
    {/* MainLayout's v2 floating card. */}
    <div className="my-3 ml-1 mr-3 flex min-w-0 flex-1 flex-col gap-3">
      <main className="relative flex min-h-0 flex-1 flex-col overflow-clip rounded-24 border border-border-subtlest-quaternary bg-background-default p-0.5">
        <HomeHeader
          variant={variant}
          isPlus={isPlus}
          showMarkers={showMarkers}
        />
        {widgets && <WidgetRail />}
        <div className="grid flex-1 grid-cols-3 gap-6 overflow-hidden p-6">
          {Array.from({ length: widgets ? 3 : 6 }, (_, i) => (
            <CardPlaceholder key={i} seed={i} />
          ))}
        </div>
      </main>
    </div>
  </div>
);
