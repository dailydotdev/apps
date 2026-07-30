import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  railCountBubbleClass,
  railTabClass,
  railTabLabelClass,
  RAIL_ICON_SIZE,
} from '@dailydotdev/shared/src/components/sidebar/common';
import { StreakBadge } from '@dailydotdev/shared/src/components/sidebar/StreakBadge';
import { Bubble } from '@dailydotdev/shared/src/components/tooltips/utils';
import {
  BellIcon,
  HomeIcon,
  HotIcon,
  MagicIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { StreakRingState } from '@dailydotdev/shared/src/hooks/streaks/useStreakRingState';

// Shared scaffolding for the rail gamification-tab explorations, so the two
// story pages draw the same geometry instead of each re-deriving it.

// ─── the signal every variant renders from ───────────────────────────────────

export interface RailSignal {
  streakState: StreakRingState;
  hasReadToday: boolean;
  days: number;
  // Quests finished out of today's set.
  done: number;
  total: number;
  // Finished quests whose reward has not been collected yet.
  claimable: number;
}

export const DEFAULT_SIGNAL: RailSignal = {
  streakState: 'safe',
  hasReadToday: true,
  days: 73,
  done: 2,
  total: 3,
  claimable: 1,
};

export const progressOf = ({ done, total }: RailSignal): number =>
  total ? Math.min(100, (done / total) * 100) : 0;

export const STREAK_STATES: StreakRingState[] = [
  'none',
  'pending',
  'safe',
  'at_risk',
  'critical',
  'freeze',
];

// Which states mean "already read today", so `hasReadToday` stays consistent
// with the state being previewed.
export const isReadState = (state: StreakRingState): boolean =>
  state === 'safe' || state === 'freeze' || state === 'celebration';

// ─── geometry ────────────────────────────────────────────────────────────────

// The rail's glyph box. Every variant must fit inside this, or say that it doesn't.
export const GLYPH = 26;
// The streak disc inside that box (StreakBadge insets its ring by 1.5px).
export const DISC = 23;
export const DISC_RADIUS = DISC / 2;
// The radius of the ring's STROKE CENTRE LINE — 1.5px inset, then half of the
// 1.5px border. Anything meant to sit *on* the ring is placed at this radius,
// not at the disc edge, or it reads as floating just outside it.
export const RING_PATH_RADIUS = DISC_RADIUS - 0.75;

// Below the smallest typo step (caption2 is 11px) — what a numeral has to be to
// sit inside a 26px glyph without pushing its own box around.
export const microNumeral = 'text-[0.5625rem] font-bold leading-none tabular-nums';

export const GlyphBox = ({
  children,
  size = GLYPH,
}: {
  children: ReactNode;
  size?: number;
}): ReactElement => (
  <span
    className="relative flex items-center justify-center"
    style={{ width: size, height: size }}
  >
    {children}
  </span>
);

// ─── streak colours, mirroring StreakBadge ───────────────────────────────────

export const ringColorByState: Partial<Record<StreakRingState, string>> = {
  none: 'border-text-quaternary',
  pending: 'border-text-tertiary',
  safe: 'border-accent-bacon-default',
  celebration: 'border-accent-bacon-default',
  at_risk: 'border-status-warning',
  critical: 'border-status-error',
  freeze: 'border-accent-blueCheese-default',
};

export const discFillByState: Partial<Record<StreakRingState, string>> = {
  safe: 'bg-accent-bacon-default',
  celebration: 'bg-accent-bacon-default',
  freeze: 'bg-accent-blueCheese-flat',
};

export const flameColorByState: Partial<Record<StreakRingState, string>> = {
  none: 'text-text-quaternary',
  pending: 'text-text-tertiary',
  safe: 'text-accent-bacon-default',
  celebration: 'text-accent-bacon-default',
  at_risk: 'text-status-warning',
  critical: 'text-status-error',
  freeze: 'text-accent-blueCheese-default',
};

// The streak disc WITHOUT its flame — ring + fill only. For variants that
// compose their own contents inside the disc and so cannot nest the real badge
// (it would draw a second flame behind theirs).
export const StreakDisc = ({
  signal,
  showRing = true,
  showFill = true,
  children,
}: {
  signal: RailSignal;
  showRing?: boolean;
  showFill?: boolean;
  children?: ReactNode;
}): ReactElement => (
  <>
    {showFill && (
      <span
        aria-hidden
        className={classNames(
          'absolute inset-[1.5px] rounded-full',
          discFillByState[signal.streakState] ?? 'bg-transparent',
        )}
      />
    )}
    {showRing && (
      <span
        aria-hidden
        className={classNames(
          'absolute inset-[1.5px] rounded-full border-[1.5px]',
          signal.streakState === 'none' && 'border-dashed',
          ringColorByState[signal.streakState] ?? 'border-text-tertiary',
        )}
      />
    )}
    {children}
  </>
);

export const Flame = ({
  signal,
  size = IconSize.Size16,
  // On a filled disc the flame has to invert, exactly as StreakBadge does.
  onFill = false,
  className,
}: {
  signal: RailSignal;
  size?: IconSize;
  onFill?: boolean;
  className?: string;
}): ReactElement => (
  <HotIcon
    secondary={signal.hasReadToday || signal.streakState === 'freeze'}
    size={size}
    className={classNames(
      'relative',
      onFill && discFillByState[signal.streakState]
        ? 'text-white'
        : flameColorByState[signal.streakState] ?? 'text-text-tertiary',
      className,
    )}
  />
);

// ─── tab chrome ──────────────────────────────────────────────────────────────

// One rail tab at the real geometry: 68px column, railTabClass, glyph + label.
// `group/streaktab` is the hook StreakBadge's hover styles rely on, so hovering
// these behaves exactly like hovering the tab in the app.
export const RailTab = ({
  glyph,
  label,
  under,
  selected = false,
}: {
  glyph: ReactNode;
  label: ReactNode;
  under?: ReactNode;
  selected?: boolean;
}): ReactElement => (
  <span
    className={classNames(
      railTabClass,
      'group/streaktab w-[68px]',
      selected && '!text-text-primary',
    )}
  >
    <span className="relative flex items-center justify-center">{glyph}</span>
    {under}
    <span className={railTabLabelClass}>{label}</span>
  </span>
);

// A swatch of dark rail behind a tab, so hover/selected surfaces read correctly.
export const OnRail = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="inline-block rounded-12 bg-background-default p-1">
    {children}
  </span>
);

// TODAY — the control: streak badge with a floating count bubble in the corner.
export const TodayBaseline = ({
  signal,
}: {
  signal: RailSignal;
}): ReactElement => (
  <RailTab
    label={signal.days}
    glyph={
      <GlyphBox>
        <StreakBadge
          state={signal.streakState}
          hasReadToday={signal.hasReadToday}
        />
        {signal.claimable > 0 && (
          <Bubble className="-right-2 -top-2 px-1">{signal.claimable}</Bubble>
        )}
      </GlyphBox>
    }
  />
);

// In situ. A rail tab never appears alone — the Activity bell sits right above it
// with its own purple bubble, which is the collision any mark that overflows the
// glyph box has to survive.
export const MiniRail = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <div className="flex w-20 flex-col items-center gap-1 rounded-16 bg-background-default px-1.5 pb-3 pt-[13px]">
    <span className="mb-2.5 flex size-10 items-center justify-center text-text-primary">
      <HomeIcon secondary size={RAIL_ICON_SIZE} />
    </span>
    <RailTab
      label="Activity"
      glyph={
        <>
          <BellIcon size={RAIL_ICON_SIZE} aria-hidden />
          <Bubble className={railCountBubbleClass}>3</Bubble>
        </>
      }
    />
    {children}
    <RailTab
      label="You"
      glyph={<MagicIcon size={RAIL_ICON_SIZE} aria-hidden />}
    />
  </div>
);

// ─── page furniture ──────────────────────────────────────────────────────────

export const Legend = (): ReactElement => (
  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-12 bg-surface-float px-4 py-3">
    {[
      { color: 'bg-accent-bacon-default', text: 'reading streak' },
      { color: 'bg-accent-cabbage-default', text: 'reward ready to claim' },
    ].map(({ color, text }) => (
      <span key={text} className="flex items-center gap-2">
        <span className={classNames('size-3 rounded-full', color)} />
        <span className="text-text-secondary typo-caption1">{text}</span>
      </span>
    ))}
  </div>
);

export const SectionHeading = ({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-1">
    {eyebrow && (
      <span className="font-bold uppercase text-text-quaternary typo-caption2">
        {eyebrow}
      </span>
    )}
    <h2 className="font-bold text-text-primary typo-title3">{title}</h2>
    {children && (
      <p className="max-w-3xl text-text-tertiary typo-callout">{children}</p>
    )}
  </div>
);

// A single labelled variant cell.
export const Variant = ({
  code,
  title,
  note,
  children,
}: {
  code: string;
  title: string;
  note?: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex w-[200px] flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-3">
    <div className="flex items-baseline gap-2">
      <span className="font-bold text-text-quaternary typo-caption1 tabular-nums">
        {code}
      </span>
      <span className="font-bold text-text-primary typo-caption1">{title}</span>
    </div>
    <div className="flex flex-wrap items-start gap-2">{children}</div>
    {note && (
      <p className="text-text-tertiary typo-caption2">{note}</p>
    )}
  </div>
);
