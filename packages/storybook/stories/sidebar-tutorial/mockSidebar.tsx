import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';

export type RailRegion = 'logo' | 'tabs' | 'profile' | 'newPost' | 'dock';

export const RAIL_TABS = ['Explore', 'You', 'Squads', 'Streak'] as const;

export const DOCK_PINS = [
  { id: 'tags', label: 'Tags', letter: 'T' },
  { id: 'sources', label: 'Sources', letter: 'S' },
  { id: 'bookmarks', label: 'Bookmarks', letter: 'B' },
] as const;

// Vertical anchor (px from stage top) for pointing overlays at each region.
export const REGION_ANCHORS: Record<RailRegion, number> = {
  logo: 28,
  tabs: 150,
  profile: 320,
  newPost: 370,
  dock: 470,
};

const glowClass = 'ring-2 ring-accent-cabbage-default';

interface RegionProps {
  region: RailRegion;
  glow?: RailRegion | null;
  className?: string;
  children: ReactNode;
}

const Region = ({
  region,
  glow,
  className,
  children,
}: RegionProps): JSX.Element => (
  <div
    data-region={region}
    className={classNames(
      'flex flex-col items-center rounded-10 p-1',
      glow === region && glowClass,
      className,
    )}
  >
    {children}
  </div>
);

const Glyph = ({ active }: { active?: boolean }): JSX.Element => (
  <span
    className={classNames(
      'size-5 rounded-6',
      active ? 'bg-accent-cabbage-default' : 'bg-text-quaternary',
    )}
  />
);

export interface MockRailProps {
  compact?: boolean;
  dockEmpty?: boolean;
  glow?: RailRegion | null;
  activeTab?: (typeof RAIL_TABS)[number];
  dockExtra?: ReactNode;
}

export const MockRail = ({
  compact = false,
  dockEmpty = false,
  glow = null,
  activeTab = 'Explore',
  dockExtra,
}: MockRailProps): JSX.Element => (
  <div className="flex h-full w-16 shrink-0 flex-col items-center gap-2 border-r border-border-subtlest-tertiary bg-background-default py-3">
    <Region region="logo" glow={glow}>
      <span className="flex size-8 items-center justify-center rounded-10 bg-accent-cabbage-default font-bold text-white typo-callout">
        d
      </span>
    </Region>

    <Region region="tabs" glow={glow} className="gap-1">
      {RAIL_TABS.map((tab) => (
        <span key={tab} className="flex flex-col items-center gap-0.5 p-1">
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
        </span>
      ))}
    </Region>

    <span className="h-px w-6 bg-border-subtlest-tertiary" />

    <Region region="profile" glow={glow}>
      <span className="size-7 rounded-full bg-accent-cheese-default" />
    </Region>

    <Region region="newPost" glow={glow}>
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

    <Region region="dock" glow={glow} className="gap-1.5">
      {dockEmpty
        ? [0, 1, 2].map((slot) => (
            <span
              key={slot}
              className="size-6 rounded-8 border border-dashed border-border-subtlest-tertiary"
            />
          ))
        : DOCK_PINS.map((pin) => (
            <span
              key={pin.id}
              title={pin.label}
              className="flex size-6 items-center justify-center rounded-8 bg-surface-float text-text-tertiary typo-caption1"
            >
              {pin.letter}
            </span>
          ))}
      {dockExtra}
      <span className="flex size-6 items-center justify-center rounded-8 text-text-quaternary typo-caption1">
        •••
      </span>
    </Region>
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

export interface DemoStageProps {
  rail?: MockRailProps;
  contentDim?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}

// The fake app frame every concept renders into. Overlays go in `children`
// and position themselves absolutely against this container, using
// REGION_ANCHORS for vertical alignment with rail regions.
export const DemoStage = ({
  rail,
  contentDim = false,
  children,
  style,
}: DemoStageProps): JSX.Element => (
  <div
    className="relative flex overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default"
    style={{ width: 860, height: 560, ...style }}
  >
    <MockRail {...rail} />
    <div className={classNames('flex flex-1', contentDim && 'opacity-30')}>
      <FeedSkeleton />
    </div>
    {children}
  </div>
);

export const Beacon = ({
  style,
  onClick,
}: {
  style?: CSSProperties;
  onClick?: () => void;
}): JSX.Element => (
  <button
    type="button"
    aria-label="Learn more"
    onClick={onClick}
    className="z-10 absolute flex size-5 items-center justify-center"
    style={style}
  >
    <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent-cabbage-default opacity-50" />
    <span className="relative inline-flex size-2.5 rounded-full bg-accent-cabbage-default" />
  </button>
);

export interface CoachCardProps {
  step?: string;
  title: string;
  body: string;
  actions?: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export const CoachCard = ({
  step,
  title,
  body,
  actions,
  style,
  className,
}: CoachCardProps): JSX.Element => (
  <div
    className={classNames(
      'z-20 absolute flex w-64 flex-col gap-2 rounded-14 border border-border-subtlest-tertiary bg-background-subtle p-4 shadow-2-black',
      className,
    )}
    style={style}
  >
    {step && (
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Quaternary}
      >
        {step}
      </Typography>
    )}
    <Typography bold type={TypographyType.Callout}>
      {title}
    </Typography>
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      {body}
    </Typography>
    {actions && <div className="mt-1 flex items-center gap-2">{actions}</div>}
  </div>
);
