import type { CSSProperties, DragEvent, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/Button';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  HelpIcon,
  MenuIcon,
  PinIcon,
} from '@dailydotdev/shared/src/components/icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';

export type FinalRailRegion =
  | 'logo'
  | 'tabs'
  | 'streak'
  | 'profile'
  | 'newPost'
  | 'dock'
  | 'help';

export const RAIL_TABS = ['Explore', 'You', 'Squads', 'Streak'] as const;

export type RailTab = (typeof RAIL_TABS)[number];

export const DOCK_PINS = [
  { id: 'tags', label: 'Tags', letter: 'T' },
  { id: 'sources', label: 'Sources', letter: 'S' },
  { id: 'bookmarks', label: 'Bookmarks', letter: 'B' },
] as const;

export const STAGE_WIDTH = 860;
export const STAGE_HEIGHT = 560;
export const RAIL_WIDTH = 64;

// Geometry of the rail below, in stage pixels. Every overlay in this folder
// positions itself against these instead of measuring the DOM: the rail is a
// static mock, so its boxes are known and stable.
export const TABS_TOP = 49;
export const TAB_PITCH = 46;
export const TAB_HEIGHT = 42;
export const DOCK_TOP = 334;
export const DOCK_PITCH = 28;
export const DOCK_HEIGHT = 116;
export const PANEL_WIDTH = 232;
export const PANEL_TOP_OFFSET = 8;

export const tabTop = (tab: RailTab): number =>
  TABS_TOP + RAIL_TABS.indexOf(tab) * TAB_PITCH;

export const dockDotsTop = (extraPins = 0): number =>
  DOCK_TOP + 4 + (DOCK_PINS.length + extraPins) * DOCK_PITCH;

// Vertical center of each region, measured off the rendered rail. Overlays
// point at these; cards center themselves on them.
export const FINAL_ANCHORS: Record<FinalRailRegion, number> = {
  logo: 23,
  tabs: 139,
  streak: tabTop('Streak') + TAB_HEIGHT / 2,
  profile: 253,
  newPost: 299,
  dock: DOCK_TOP + DOCK_HEIGHT / 2,
  help: 539,
};

const glowClass = 'ring-2 ring-accent-cabbage-default';

interface RegionProps {
  region: FinalRailRegion;
  glow?: FinalRailRegion | null;
  className?: string;
  children: ReactNode;
}

const Region = ({
  region,
  glow,
  className = '',
  children,
}: RegionProps): JSX.Element => (
  <div
    data-region={region}
    className={`flex flex-col items-center rounded-10 ${
      glow === region ? glowClass : ''
    } ${className}`}
  >
    {children}
  </div>
);

const Glyph = ({ active }: { active?: boolean }): JSX.Element => (
  <span
    className={`size-5 rounded-6 ${
      active ? 'bg-accent-cabbage-default' : 'bg-text-quaternary'
    }`}
  />
);

export interface FinalRailProps {
  compact?: boolean;
  glow?: FinalRailRegion | null;
  activeTab?: RailTab;
  dockExtra?: ReactNode;
  onDotsHover?: () => void;
  onDotsClick?: () => void;
  onHelpClick?: () => void;
  streakPanel?: ReactNode;
}

export const FinalRail = ({
  compact = false,
  glow = null,
  activeTab = 'Explore',
  dockExtra,
  onDotsHover,
  onDotsClick,
  onHelpClick,
  streakPanel,
}: FinalRailProps): JSX.Element => (
  <div className="relative flex h-full w-16 shrink-0 flex-col items-center gap-1 border-r border-border-subtlest-tertiary bg-background-default py-1">
    <Region region="logo" glow={glow} className="p-0.5">
      <span className="flex size-8 items-center justify-center rounded-10 bg-accent-cabbage-default font-bold text-white typo-callout">
        d
      </span>
    </Region>

    <Region region="tabs" glow={glow} className="gap-1 p-1">
      {RAIL_TABS.map((tab) => (
        <div
          key={tab}
          data-region={tab === 'Streak' ? 'streak' : undefined}
          className={`flex flex-col items-center gap-0.5 rounded-8 p-0.5 ${
            tab === 'Streak' && glow === 'streak' ? glowClass : ''
          }`}
        >
          <Glyph active={tab === activeTab} />
          {!compact && (
            <Typography
              type={TypographyType.Caption2}
              color={
                tab === activeTab
                  ? TypographyColor.Primary
                  : TypographyColor.Quaternary
              }
            >
              {tab}
            </Typography>
          )}
        </div>
      ))}
    </Region>

    <Region region="profile" glow={glow} className="p-0.5">
      <span className="size-7 rounded-full bg-accent-cheese-default" />
    </Region>

    <Region region="newPost" glow={glow} className="p-0.5">
      <span className="flex size-8 items-center justify-center rounded-10 bg-surface-float text-text-secondary typo-title3">
        +
      </span>
      {!compact && (
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Quaternary}
        >
          Post
        </Typography>
      )}
    </Region>

    <span className="h-px w-6 bg-border-subtlest-tertiary" />

    <Region region="dock" glow={glow} className="gap-1 p-1">
      {DOCK_PINS.map((pin) => (
        <span
          key={pin.id}
          title={pin.label}
          className="flex size-6 items-center justify-center rounded-8 bg-surface-float text-text-tertiary typo-caption1"
        >
          {pin.letter}
        </span>
      ))}
      {dockExtra}
      <button
        type="button"
        aria-label="Manage your shortcuts"
        onMouseEnter={onDotsHover}
        onFocus={onDotsHover}
        onClick={onDotsClick}
        className="flex size-6 items-center justify-center rounded-8 text-text-quaternary hover:bg-surface-float hover:text-text-tertiary"
      >
        <MenuIcon size={IconSize.XSmall} />
      </button>
    </Region>

    <Region
      region="help"
      glow={glow}
      className="absolute inset-x-0 bottom-1 p-0.5"
    >
      <button
        type="button"
        aria-label="Support and help"
        onClick={onHelpClick}
        className="flex size-7 items-center justify-center rounded-8 text-text-quaternary hover:bg-surface-float hover:text-text-tertiary"
      >
        <HelpIcon size={IconSize.Size16} />
      </button>
    </Region>

    {streakPanel}
  </div>
);

const FeedSkeleton = (): JSX.Element => (
  <div className="grid flex-1 grid-cols-3 gap-4 p-6">
    {Array.from({ length: 6 }, (_, card) => (
      <div
        key={card}
        className="flex flex-col gap-2 rounded-14 border border-border-subtlest-tertiary p-3"
      >
        <span className="h-16 rounded-8 bg-surface-float" />
        <span className="h-2 w-4/5 rounded-2 bg-surface-float" />
        <span className="h-2 w-3/5 rounded-2 bg-surface-float" />
      </div>
    ))}
  </div>
);

export interface FinalStageProps {
  rail?: FinalRailProps;
  spotlight?: boolean;
  children?: ReactNode;
}

export const FinalStage = ({
  rail,
  spotlight = false,
  children,
}: FinalStageProps): JSX.Element => (
  <div
    className="relative flex overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default"
    style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT }}
  >
    <div className={`relative flex h-full shrink-0 ${spotlight ? 'z-2' : ''}`}>
      <FinalRail {...rail} />
    </div>
    <div className="flex flex-1">
      <FeedSkeleton />
    </div>
    {spotlight && (
      <div
        aria-hidden
        className="absolute inset-0 z-1 bg-overlay-primary-pepper"
      />
    )}
    {children}
  </div>
);

export interface CoachCardProps {
  message: string;
  dots?: { total: number; active: number };
  control?: ReactNode;
  actions?: ReactNode;
  onClose?: () => void;
  closeLabel?: string;
  pointerTop?: number;
  style?: CSSProperties;
}

export const CoachCard = ({
  message,
  dots,
  control,
  actions,
  onClose,
  closeLabel = 'Dismiss',
  pointerTop,
  style,
}: CoachCardProps): JSX.Element => (
  <div
    className="animate-rail-popup-in absolute z-3 flex w-80 flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4 shadow-3-black"
    style={style}
  >
    {pointerTop !== undefined && (
      <span
        aria-hidden
        className="absolute size-2 rotate-45 border-b border-l border-border-subtlest-tertiary bg-background-subtle"
        style={{ left: -5, top: pointerTop - 4 }}
      />
    )}

    {(dots || onClose) && (
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1">
          {dots &&
            Array.from({ length: dots.total }, (_, index) => index).map(
              (dot) => (
                <span
                  key={dot}
                  className={
                    dot === dots.active
                      ? 'h-1.5 w-4 rounded-full bg-accent-cabbage-default'
                      : 'size-1.5 rounded-full bg-text-quaternary'
                  }
                />
              ),
            )}
        </span>
        {onClose && (
          <CloseButton
            size={ButtonSize.Small}
            aria-label={closeLabel}
            onClick={onClose}
          />
        )}
      </div>
    )}

    <Typography type={TypographyType.Body} color={TypographyColor.Primary}>
      {message}
    </Typography>

    {control}

    {actions && (
      <div className="flex items-center justify-between gap-3">{actions}</div>
    )}
  </div>
);

export interface PanelRow {
  id: string;
  label: string;
  letter: string;
}

export const SQUAD_ROWS: PanelRow[] = [
  { id: 'watercooler', label: 'watercooler', letter: 'W' },
  { id: 'devrel', label: 'devrel', letter: 'D' },
  { id: 'frontend', label: 'frontend', letter: 'F' },
];

export const YOU_ROWS: PanelRow[] = [
  { id: 'bookmarks', label: 'Bookmarks', letter: 'B' },
  { id: 'history', label: 'History', letter: 'H' },
  { id: 'analytics', label: 'Analytics', letter: 'A' },
];

export const PANEL_ROW_ONE_OFFSET = 36;
export const PANEL_ROW_HEIGHT = 40;

export interface RailPanelProps {
  title: string;
  rows: PanelRow[];
  pinnedIds: string[];
  onPin: (rowId: string) => void;
  onDragStart: (rowId: string) => void;
  onDragEnd: () => void;
}

export const RailPanel = ({
  title,
  rows,
  pinnedIds,
  onPin,
  onDragStart,
  onDragEnd,
}: RailPanelProps): JSX.Element => {
  const startDrag = (event: DragEvent<HTMLDivElement>, rowId: string) => {
    event.dataTransfer.setData('text/plain', rowId);
    onDragStart(rowId);
  };

  return (
    <div
      className="absolute flex flex-col gap-1 rounded-r-14 border border-border-subtlest-tertiary bg-background-subtle p-3 shadow-2-black"
      style={{
        left: RAIL_WIDTH,
        top: -PANEL_TOP_OFFSET,
        width: PANEL_WIDTH,
      }}
    >
      <Typography bold type={TypographyType.Callout}>
        {title}
      </Typography>
      {rows.map((row) => {
        const isPinned = pinnedIds.includes(row.id);

        return (
          <div
            key={row.id}
            draggable={!isPinned}
            onDragStart={(event) => startDrag(event, row.id)}
            onDragEnd={onDragEnd}
            className={`group flex items-center gap-2 rounded-10 p-2 ${
              isPinned ? 'opacity-60' : 'cursor-grab hover:bg-surface-float'
            }`}
          >
            <span className="flex size-6 items-center justify-center rounded-8 bg-surface-float text-text-tertiary typo-caption1">
              {row.letter}
            </span>
            <Typography
              className="flex-1"
              type={TypographyType.Footnote}
              color={TypographyColor.Secondary}
            >
              {row.label}
            </Typography>
            {isPinned ? (
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Quaternary}
              >
                Pinned
              </Typography>
            ) : (
              <button
                type="button"
                aria-label={`Pin ${row.label} to your dock`}
                onClick={() => onPin(row.id)}
                className="flex size-6 items-center justify-center rounded-8 text-text-quaternary opacity-0 transition-opacity hover:bg-surface-float hover:text-text-primary group-hover:opacity-100"
              >
                <PinIcon size={IconSize.XSmall} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export interface DockDropTargetProps {
  isTargeted: boolean;
  extraPins?: number;
  onTarget: (isTargeted: boolean) => void;
  onDrop: (rowId: string) => void;
}

export const DockDropTarget = ({
  isTargeted,
  extraPins = 0,
  onTarget,
  onDrop,
}: DockDropTargetProps): JSX.Element => (
  <div
    onDragOver={(event) => {
      event.preventDefault();
      onTarget(true);
    }}
    onDragLeave={() => onTarget(false)}
    onDrop={(event) => {
      event.preventDefault();
      onDrop(event.dataTransfer.getData('text/plain'));
    }}
    className={`absolute z-1 rounded-10 border border-dashed transition-colors ${
      isTargeted
        ? 'border-accent-cabbage-default bg-accent-cabbage-flat'
        : 'border-transparent'
    }`}
    style={{
      left: 0,
      top: DOCK_TOP,
      width: RAIL_WIDTH,
      height: DOCK_HEIGHT + extraPins * DOCK_PITCH,
    }}
  />
);

export const DockChip = ({ row }: { row: PanelRow }): JSX.Element => {
  const [isPoppedIn, setIsPoppedIn] = useState(false);

  useEffect(() => {
    setIsPoppedIn(true);
  }, []);

  return (
    <span
      title={row.label}
      className={`flex size-6 items-center justify-center rounded-8 bg-accent-cabbage-flat text-accent-cabbage-default transition-transform duration-300 typo-caption1 ${
        isPoppedIn ? 'scale-100' : 'scale-0'
      }`}
    >
      {row.letter}
    </span>
  );
};

export interface SupportMenuItem {
  id: string;
  label: string;
  onClick?: () => void;
}

export interface SupportMenuProps {
  items: SupportMenuItem[];
  highlightedId?: string;
}

export const SupportMenu = ({
  items,
  highlightedId,
}: SupportMenuProps): JSX.Element => (
  <div
    className="absolute z-3 flex w-56 flex-col gap-1 rounded-14 border border-border-subtlest-tertiary bg-background-subtle p-2 shadow-3-black"
    style={{ left: RAIL_WIDTH + 8, bottom: 12 }}
  >
    <Typography
      className="px-2 py-1"
      type={TypographyType.Caption1}
      color={TypographyColor.Quaternary}
    >
      Support
    </Typography>
    {items.map((item) => (
      <button
        key={item.id}
        type="button"
        onClick={item.onClick}
        className={`rounded-10 px-2 py-1.5 text-left typo-footnote hover:bg-surface-float ${
          item.id === highlightedId
            ? 'bg-accent-cabbage-flat text-accent-cabbage-default'
            : 'text-text-secondary'
        }`}
      >
        {item.label}
      </button>
    ))}
  </div>
);
