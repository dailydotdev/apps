import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
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
import { LockIcon } from '@dailydotdev/shared/src/components/icons/Lock';
import { MedalIcon } from '@dailydotdev/shared/src/components/icons/Medal';
import { MedalBadgeIcon } from '@dailydotdev/shared/src/components/icons/MedalBadge';
import { MegaphoneIcon } from '@dailydotdev/shared/src/components/icons/Megaphone';
import { MenuIcon } from '@dailydotdev/shared/src/components/icons/Menu';
import { NewPostIcon } from '@dailydotdev/shared/src/components/icons/NewPost';
import { SearchIcon } from '@dailydotdev/shared/src/components/icons/Search';
import { SettingsIcon } from '@dailydotdev/shared/src/components/icons/Settings';
import { ShieldCheckIcon } from '@dailydotdev/shared/src/components/icons/ShieldCheck';
import { ShieldPlusIcon } from '@dailydotdev/shared/src/components/icons/ShieldPlus';
import { SignalIcon } from '@dailydotdev/shared/src/components/icons/Signal';
import { SortIcon } from '@dailydotdev/shared/src/components/icons/Sort';
import { SparkleIcon } from '@dailydotdev/shared/src/components/icons/Sparkle';
import { SquadIcon } from '@dailydotdev/shared/src/components/icons/Squad';
import { VIcon } from '@dailydotdev/shared/src/components/icons/V';
import { PlusTile } from '@dailydotdev/shared/src/components/plus/PlusPreview';
import { plusPreviewPerks } from '@dailydotdev/shared/src/components/plus/PlusList';

// A drawn stand-in for the v2 desktop shell (SidebarDesktopV2, the v2 page
// header strip from SearchControlHeader, and optionally the feed widget rail
// behind `feed_widgets`), at production sizes: rail `w-20`, panel `w-60`, tab
// rows `railTabClass`, New post `!size-9`, header icon buttons `!size-8`.
// Only the chrome is drawn, so variants differ exactly where a proposal does.

export type ShellVariant = 'current' | 'proposed';
export type PanelId = 'explore' | 'you' | 'streak' | 'none';
// Where a non-member meets Plus. `panel-card` is the first proposal; the rest
// are the alternatives in the "Plus placements" stories.
export type PlusPlacement =
  | 'panel-card'
  | 'rail'
  | 'avatar'
  | 'shield'
  | 'widget'
  | 'quests';

export interface ShellProps {
  variant: ShellVariant;
  panel?: PanelId;
  isPlus?: boolean;
  plus?: PlusPlacement;
  // Draws the open/hover state of the Plus placement, where it has one.
  plusOpen?: boolean;
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
// SearchControlHeader's compact v2 buttons.
const headerIconButtonClass =
  'relative flex size-8 items-center justify-center rounded-10 text-text-tertiary';
const headerTextButtonClass =
  'relative flex h-8 items-center gap-1 rounded-10 px-3 text-text-tertiary typo-callout';
const getPlusButtonClass =
  'flex h-8 items-center justify-center gap-1 rounded-10 bg-accent-bacon-default px-3 font-bold text-white typo-callout';

const RailTab = ({
  icon,
  label,
  active,
  badge,
  className,
}: {
  icon: ReactElement;
  label: string;
  active?: boolean;
  badge?: ReactNode;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      railTabClass,
      active && 'bg-surface-hover !text-text-primary',
      className,
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

const GetPlusButton = ({
  label = 'Get Plus',
  className,
}: {
  label?: string;
  className?: string;
}): ReactElement => (
  <span className={classNames(getPlusButtonClass, className)}>
    <DevPlusIcon size={IconSize.Small} secondary />
    {label}
  </span>
);

// The Plus preview card (`PlusPreviewCard`): tile, tagline, perks, CTA.
const PlusPreview = ({
  perks = 3,
  className,
  children,
}: {
  perks?: number;
  className?: string;
  children?: ReactNode;
}): ReactElement => (
  <div
    className={classNames(
      'flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-accent-pepper-subtlest p-3',
      className,
    )}
  >
    <div className="flex items-center gap-2">
      <PlusTile />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="font-bold text-text-primary typo-callout">
          daily.dev Plus
        </span>
        <span className="text-text-tertiary typo-caption1">
          On top of everything in Free
        </span>
      </div>
    </div>
    {children}
    <ul className="flex flex-col gap-1">
      {plusPreviewPerks.slice(0, perks).map((perk) => (
        <li
          key={perk}
          className="flex items-center gap-2 text-text-secondary typo-footnote"
        >
          <VIcon size={IconSize.Size16} className="text-action-plus-default" />
          <span className="min-w-0 flex-1 truncate">{perk}</span>
        </li>
      ))}
    </ul>
    <GetPlusButton />
  </div>
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
    <span className="my-2 flex size-9 items-center justify-center rounded-12 bg-text-primary text-surface-invert">
      <NewPostIcon size={IconSize.Small} />
    </span>
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
  <span className="relative ml-1 flex h-8 shrink-0 items-center gap-1 rounded-10 bg-text-primary px-3 font-bold text-surface-invert typo-callout">
    <NewPostIcon size={IconSize.Small} />
    New post
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

interface TabOptions {
  panel: PanelId;
  // Plus placement "avatar": a Plus notch on the avatar for non-members, a
  // Plus ring for members.
  avatarPlus?: 'notch' | 'ring';
  // Plus placement "quests": a finished Plus quest waiting to be claimed.
  questWaiting?: boolean;
}

const renderTab = (id: TabId, options: TabOptions): ReactElement => {
  const { panel } = options;
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
          active={panel === 'streak'}
          badge={
            options.questWaiting && (
              <span className="absolute -top-1 left-4 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-8 bg-action-plus-default px-1 text-white">
                <LockIcon size={IconSize.XXSmall} secondary />
              </span>
            )
          }
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
            <Avatar
              className={classNames(
                options.avatarPlus === 'ring' &&
                  'ring-2 ring-action-plus-default ring-offset-2 ring-offset-background-default',
              )}
            />
            {options.avatarPlus === 'notch' && (
              <span className="absolute -bottom-1 -right-1.5 flex size-4 items-center justify-center rounded-6 bg-action-plus-default text-white ring-2 ring-background-default">
                <DevPlusIcon size={IconSize.XXSmall} secondary />
              </span>
            )}
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

// Plus placement "rail": Plus takes the Invite slot in the utility trio, so it
// costs no height (any added rail row folds the Streak tab at 820px). Invite
// moves into the Support menu.
const PlusRailButton = ({
  isOpen,
  showMarker,
}: {
  isOpen: boolean;
  showMarker: boolean;
}): ReactElement => (
  <span
    className={classNames(
      railButtonClass,
      '!text-action-plus-default',
      'bg-action-plus-float',
    )}
  >
    <DevPlusIcon size={IconSize.Small} secondary={isOpen} />
    {showMarker && <Marker n={2} className="-right-2 -top-2" />}
  </span>
);

const Rail = ({
  variant,
  panel,
  height,
  isPlus,
  plus,
  plusOpen,
  showMarkers,
}: Required<Omit<ShellProps, 'width' | 'widgets'>>): ReactElement => {
  const isProposed = variant === 'proposed';
  const { inline, folded, showDock } = foldTabs({ height });
  const isPlusRail = isProposed && plus === 'rail' && !isPlus;
  let avatarPlus: TabOptions['avatarPlus'];
  if (isProposed && plus === 'avatar') {
    avatarPlus = isPlus ? 'ring' : 'notch';
  }
  const tabOptions: TabOptions = {
    panel,
    avatarPlus,
    questWaiting: isProposed && plus === 'quests' && !isPlus,
  };

  return (
    <nav className="flex h-full w-20 shrink-0 flex-col items-center gap-0.5 px-1.5 pb-3 pt-[13px]">
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
        {inline.map((id) => renderTab(id, tabOptions))}
        <div className="relative w-full">
          {renderTab('you', tabOptions)}
          {avatarPlus && showMarkers && (
            <Marker n={2} className="-right-1 top-0" />
          )}
        </div>
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
      {isPlusRail ? (
        <PlusRailButton isOpen={plusOpen} showMarker={showMarkers} />
      ) : (
        <span className={railButtonClass}>
          <InviteIcon size={IconSize.Small} />
        </span>
      )}
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
      marker: showMarkers ? 4 : undefined,
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

// Plus placement "avatar": the You panel's identity block names your plan, the
// way account menus name the plan you're on, with the upgrade beside it.
const PlanIdentity = ({
  isPlus,
  showMarker,
}: {
  isPlus: boolean;
  showMarker: boolean;
}): ReactElement => (
  <div className="relative mb-4 mt-2 flex flex-col gap-3 rounded-16 bg-surface-float p-3">
    <div className="flex items-center gap-2">
      <Avatar
        className={classNames(
          '!size-10 !rounded-10',
          isPlus &&
            'ring-2 ring-action-plus-default ring-offset-2 ring-offset-background-default',
        )}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="font-bold text-text-primary typo-subhead">
          Dev Dana
        </span>
        {isPlus ? (
          <span className="flex items-center gap-1 font-bold text-action-plus-default typo-caption1">
            <DevPlusIcon size={IconSize.XXSmall} secondary />
            Plus member
          </span>
        ) : (
          <span className="text-text-tertiary typo-caption1">Free plan</span>
        )}
      </div>
    </div>
    {!isPlus && (
      <div className="flex items-center justify-between gap-2 rounded-10 bg-action-plus-float px-2 py-1.5">
        <span className="min-w-0 flex-1 truncate text-text-secondary typo-caption1">
          Go ad-free with Plus
        </span>
        <span className="shrink-0 font-bold text-action-plus-default typo-caption1">
          Upgrade
        </span>
      </div>
    )}
    {showMarker && <Marker n={2} className="-right-2 -top-2" />}
  </div>
);

// The Streak tab panel: the streak, then the daily quests (CompactQuestList).
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

// Plus placement "quests": production already lists Plus quests and turns a
// finished one into "Claim with Plus" (CompactQuestList, #6968). This raises
// that moment to the rail — the lock badge on the Streak tab — and gives the
// row the reward it is holding.
const LockedQuestRow = ({
  showMarker,
}: {
  showMarker: boolean;
}): ReactElement => (
  <div className="relative flex flex-col gap-2 rounded-12 bg-action-plus-float p-2">
    <div className="flex items-center justify-between gap-2 typo-footnote">
      <span className="flex min-w-0 flex-1 items-center gap-1 truncate font-bold text-text-primary">
        <DevPlusIcon
          size={IconSize.Size16}
          secondary
          className="text-action-plus-default"
        />
        Explore a new tag
      </span>
      <span className="text-text-tertiary">3/3</span>
    </div>
    <span className="flex items-center gap-1 text-text-secondary typo-caption1">
      <SparkleIcon
        size={IconSize.Size16}
        className="text-action-plus-default"
      />
      Done. Your reward is waiting.
    </span>
    <span className="flex h-7 items-center justify-center gap-1 rounded-8 bg-accent-bacon-default font-bold text-white typo-caption1">
      <LockIcon size={IconSize.XXSmall} secondary />
      Claim with Plus
    </span>
    {showMarker && <Marker n={2} className="-right-2 -top-2" />}
  </div>
);

const StreakPanelContent = ({
  showLockedQuest,
  showMarker,
}: {
  showLockedQuest: boolean;
  showMarker: boolean;
}): ReactElement => (
  <>
    <div className="mt-2 flex flex-col gap-2 rounded-16 bg-surface-float p-3">
      <div className="flex items-center gap-2">
        <HotIcon
          size={IconSize.Medium}
          secondary
          className="text-accent-bacon-default"
        />
        <span className="font-bold text-text-primary typo-title3">12 days</span>
      </div>
      <div className="flex justify-between">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
          <span
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className={classNames(
              'flex size-6 items-center justify-center rounded-full typo-caption2',
              i < 5
                ? 'bg-accent-bacon-default text-white'
                : 'bg-surface-float text-text-tertiary',
            )}
          >
            {day}
          </span>
        ))}
      </div>
    </div>
    <PanelHeading>Daily quests</PanelHeading>
    <div className="flex flex-col gap-1">
      <QuestRow title="Read 5 posts" progress={3} total={5} />
      <QuestRow title="Upvote 2 posts" progress={1} total={2} />
      {showLockedQuest && <LockedQuestRow showMarker={showMarker} />}
    </div>
  </>
);

const Panel = ({
  variant,
  panel,
  isPlus,
  plus,
  showMarkers,
}: {
  variant: ShellVariant;
  panel: PanelId;
  isPlus: boolean;
  plus: PlusPlacement;
  showMarkers: boolean;
}): ReactElement | null => {
  if (panel === 'none') {
    return null;
  }

  const isProposed = variant === 'proposed';
  const titles: Record<Exclude<PanelId, 'none'>, string> = {
    explore: 'Explore',
    you: 'You',
    streak: 'Streak',
  };
  // The "Get Plus" row is the current entry; placements that bring Plus into
  // this panel in another form replace it.
  const showPlusRow =
    !isPlus && (!isProposed || (plus !== 'panel-card' && plus !== 'avatar'));

  return (
    <section className="flex h-full w-60 shrink-0 flex-col overflow-hidden border-l border-border-subtlest-quaternary px-3 pt-6">
      <div className="flex h-10 items-center px-2 font-bold text-text-primary typo-title3">
        {titles[panel]}
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
          {isProposed && plus === 'avatar' ? (
            <PlanIdentity isPlus={isPlus} showMarker={showMarkers} />
          ) : (
            <div className="mb-4 mt-2 flex items-center gap-2 px-2">
              <Avatar className="!size-10 !rounded-10" />
              <span className="font-bold text-text-primary typo-subhead">
                Dev Dana
              </span>
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            {youPanelRows(showPlusRow).map((row) => (
              <PanelRowItem key={row.label} row={row} />
            ))}
          </div>
          <PanelHeading>Bookmarks</PanelHeading>
          {['Read later', 'System design'].map((label) => (
            <PanelRowItem key={label} row={{ icon: <BookmarkIcon />, label }} />
          ))}
        </>
      )}
      {panel === 'streak' && (
        <StreakPanelContent
          showLockedQuest={!isPlus && (!isProposed || plus === 'quests')}
          showMarker={isProposed && plus === 'quests' && showMarkers}
        />
      )}
      {isProposed && plus === 'panel-card' && !isPlus && (
        <div className="relative mb-3 mt-auto">
          <PlusPreview />
          {showMarkers && <Marker n={2} className="-right-2 -top-2" />}
        </div>
      )}
    </section>
  );
};

// Clickbait Shield in the v2 strip (ToggleClickbaitShield): members get the
// on/off shield; everyone else gets the shield-plus and their free tries.
// Plus placement "shield" opens it into a pill that names what it does.
const ShieldButton = ({
  isPlus,
  expanded,
  showMarker,
}: {
  isPlus: boolean;
  expanded: boolean;
  showMarker: boolean;
}): ReactElement => {
  if (isPlus) {
    return (
      <span className={headerIconButtonClass}>
        <ShieldCheckIcon
          size={IconSize.XSmall}
          className="text-status-success"
        />
      </span>
    );
  }
  if (expanded) {
    return (
      <span className="relative flex h-8 items-center gap-1.5 rounded-10 bg-action-plus-float px-2.5 font-bold text-action-plus-default typo-callout">
        <ShieldPlusIcon size={IconSize.XSmall} />
        Clean titles
        <span className="rounded-6 bg-background-default px-1 text-text-secondary typo-caption2">
          3/5
        </span>
        {showMarker && <Marker n={2} className="-right-2 -top-2" />}
      </span>
    );
  }
  return (
    <span className={headerTextButtonClass}>
      <ShieldPlusIcon size={IconSize.XSmall} />
      3/5
    </span>
  );
};

// The v2 home page header: SearchControlHeader in the strip. With chips, the
// chips fill the left and every action sits on the right as an icon button:
// feed settings, sort, Clickbait Shield, the achievement tracker.
const HomeHeader = ({
  variant,
  isPlus,
  plus,
  showMarkers,
}: {
  variant: ShellVariant;
  isPlus: boolean;
  plus: PlusPlacement;
  showMarkers: boolean;
}): ReactElement => {
  const isProposed = variant === 'proposed';
  const chips = [
    { label: 'For you', active: true },
    ...(isProposed
      ? [{ label: 'Following', marker: showMarkers ? 3 : undefined }]
      : []),
    { label: 'AI & agents' },
    { label: 'Rust' },
    { label: 'Frontend' },
  ];

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border-subtlest-quaternary px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {chips.map((chip) => (
          <span
            key={chip.label}
            className={classNames(
              'relative flex h-8 shrink-0 items-center rounded-10 px-2.5 typo-callout',
              chip.active
                ? 'bg-text-primary font-bold text-surface-invert'
                : 'bg-surface-float text-text-secondary',
            )}
          >
            {chip.label}
            {'marker' in chip && chip.marker && (
              <Marker n={chip.marker} className="-right-2 -top-2" />
            )}
          </span>
        ))}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <span className={headerIconButtonClass}>
          <FilterIcon size={IconSize.XSmall} />
        </span>
        <span className={headerIconButtonClass}>
          <SortIcon size={IconSize.XSmall} />
        </span>
        <ShieldButton
          isPlus={isPlus}
          expanded={isProposed && plus === 'shield'}
          showMarker={showMarkers}
        />
        <span className={headerIconButtonClass}>
          <MedalBadgeIcon size={IconSize.XSmall} />
        </span>
      </div>
      {isProposed && <NewPostHeaderButton showMarker={showMarkers} />}
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

// Plus placement "shield": the shield's rewrite shown on a card you are about
// to read — the original crossed out, the clean title in its place.
const CleanTitleCard = (): ReactElement => (
  <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4">
    <div className="flex items-center gap-2">
      <span className="size-6 rounded-full bg-surface-float" />
      <span className="h-3 w-20 rounded-4 bg-surface-float" />
      <span className="ml-auto flex items-center gap-1 rounded-6 bg-action-plus-float px-1.5 font-bold text-action-plus-default typo-caption2">
        <ShieldPlusIcon size={IconSize.XXSmall} />
        Clean title
      </span>
    </div>
    <span className="text-text-quaternary line-through typo-footnote">
      You won&apos;t believe what this one Rust change does to your builds
    </span>
    <span className="font-bold text-text-primary typo-body">
      Rust nightly adds parallel front-end compilation behind a flag
    </span>
    <span className="mt-1 aspect-video w-full rounded-12 bg-surface-float" />
    <div className="flex items-center gap-2 text-text-tertiary typo-caption1">
      <span className="min-w-0 flex-1 truncate">
        3 of 5 free tries left this month
      </span>
      <span className="font-bold text-action-plus-default">Keep it on</span>
    </div>
  </div>
);

// The Plus preview, anchored under the shield or beside the rail slot.
const ShieldPopover = (): ReactElement => (
  <div className="absolute right-24 top-14 z-3 w-72 shadow-2">
    <PlusPreview perks={2}>
      <p className="text-text-secondary typo-footnote">
        Clickbait Shield rewrote 4 titles in your feed today. Plus keeps it on
        for every post, with no monthly limit.
      </p>
    </PlusPreview>
  </div>
);

const RailPlusPopover = (): ReactElement => (
  <div className="absolute bottom-24 left-[5.5rem] z-3 w-72 shadow-2">
    <PlusPreview perks={4} />
  </div>
);

// The feed widget rail (`feed_widgets`): a greeting row with Customize, then a
// row of widgets the reader arranges. Plus placement "widget" fills the slot
// the rail keeps for an ad (FeedWidgetAdSlot, tips over it since #7004).
const WidgetRail = ({
  plusWidget,
  showMarker,
}: {
  plusWidget: boolean;
  showMarker: boolean;
}): ReactElement => (
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
      {plusWidget ? (
        <div className="relative flex flex-col gap-2 overflow-hidden rounded-16 bg-gradient-to-br from-action-plus-float to-background-subtle p-4">
          <div className="flex items-center gap-2">
            <PlusTile />
            <span className="font-bold text-text-primary typo-callout">
              This spot runs an ad
            </span>
          </div>
          <p className="text-text-secondary typo-footnote">
            On Plus it doesn&apos;t. Neither does the rest of your feed. You
            also get clean titles and bookmark folders.
          </p>
          <GetPlusButton label="Go ad-free" className="mt-auto" />
          <span className="absolute right-3 top-3 text-text-quaternary typo-caption2">
            Instead of an ad
          </span>
          {showMarker && <Marker n={2} className="right-2 top-10" />}
        </div>
      ) : (
        <div className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary p-4">
          <span className="text-text-quaternary typo-caption2">Promoted</span>
          <span className="flex-1 rounded-12 bg-surface-float" />
          <span className="h-3 w-2/3 rounded-4 bg-surface-float" />
        </div>
      )}
    </div>
  </section>
);

export const V2Shell = ({
  variant,
  panel = 'explore',
  isPlus = false,
  plus = 'panel-card',
  plusOpen = false,
  widgets = false,
  height = 820,
  width = 1280,
  showMarkers = true,
}: ShellProps): ReactElement => {
  const isProposed = variant === 'proposed';
  const plusFor = (placement: PlusPlacement): boolean =>
    isProposed && !isPlus && plus === placement;
  const cardCount = widgets || plusFor('widget') ? 3 : 6;

  return (
    <div
      className="relative flex overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default"
      style={{ width, height }}
    >
      <Rail
        variant={variant}
        panel={panel}
        height={height}
        isPlus={isPlus}
        plus={plus}
        plusOpen={plusOpen}
        showMarkers={showMarkers}
      />
      <Panel
        variant={variant}
        panel={panel}
        isPlus={isPlus}
        plus={plus}
        showMarkers={showMarkers}
      />
      <main className="relative flex min-w-0 flex-1 flex-col border-l border-border-subtlest-quaternary">
        <HomeHeader
          variant={variant}
          isPlus={isPlus}
          plus={plus}
          showMarkers={showMarkers}
        />
        {(widgets || plusFor('widget')) && (
          <WidgetRail plusWidget={plusFor('widget')} showMarker={showMarkers} />
        )}
        <div className="grid flex-1 grid-cols-3 gap-6 overflow-hidden p-6">
          {Array.from({ length: cardCount }, (_, i) =>
            i === 1 && plusFor('shield') ? (
              <CleanTitleCard key={i} />
            ) : (
              <CardPlaceholder key={i} seed={i} />
            ),
          )}
        </div>
        {plusFor('shield') && plusOpen && <ShieldPopover />}
      </main>
      {plusFor('rail') && plusOpen && <RailPlusPopover />}
    </div>
  );
};
