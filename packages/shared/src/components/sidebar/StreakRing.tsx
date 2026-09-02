import type { MouseEventHandler, ReactElement, ReactNode, Ref } from 'react';
import React from 'react';
import classNames from 'classnames';
import { HotIcon } from '../icons';
import { IconSize } from '../Icon';
import { Tooltip } from '../tooltip/Tooltip';
import { Typography, TypographyType } from '../typography/Typography';
import { ElementPlaceholder } from '../ElementPlaceholder';
import { largeNumberFormat } from '../../lib/numberFormat';
import {
  countClassByState,
  fillClassByState,
  frameClassByState,
} from '../../hooks/streaks/useStreakRingState';
import type { StreakRingState } from '../../hooks/streaks/useStreakRingState';

// Overrides the shared Tooltip's baked-in `collisionPadding={{ top: 75 }}` (a
// leftover from the old top-header layout) so the chip tooltip sits snug.
const TOOLTIP_COLLISION_PADDING = 4;

// The exact v2 rail/page tint (the same color-mix the rail and MainLayout use)
// so the chip masks the bottom border seamlessly against the sidebar.
const railTintBg =
  'bg-[color-mix(in_srgb,var(--theme-surface-secondary)_3%,var(--theme-background-default))]';
// Chip hover background per state: at rest the chip stays the neutral rail tint
// (masking the border); on hover it picks up the same colour sitting behind the
// avatar (the fill) — the coloured states use the matching opaque `-flat` tint
// (freeze is the exact same token as its fill), calm states get a subtle
// surface-hover.
const chipHoverBgClassByState: Record<StreakRingState, string> = {
  none: 'hover:bg-surface-hover',
  pending: 'hover:bg-surface-hover',
  safe: 'hover:bg-surface-hover',
  celebration: 'hover:bg-accent-bacon-flat',
  at_risk: 'hover:bg-accent-bun-flat',
  critical: 'hover:bg-accent-ketchup-flat',
  freeze: 'hover:bg-accent-blueCheese-flat',
};
// Shared chip position/shape — used by both the real chip and the loading
// skeleton so they occupy the identical spot (no layout shift on load).
const chipBaseClass =
  'absolute -bottom-[8px] left-1/2 z-2 flex -translate-x-1/2 items-center gap-0.5 rounded-8 px-1.5 py-0.5';

export interface StreakRingProps {
  state: StreakRingState;
  count: number;
  hasReadToday: boolean;
  // While the streak data is still being fetched, render a same-size skeleton
  // (neutral border + placeholder flame/number) so the component never shifts
  // in once the real values arrive.
  isLoading?: boolean;
  // The avatar (a 40px square — a button in the rail, an image in Storybook).
  // StreakRing positions it inside the top ring.
  avatar: ReactNode;
  chipRef?: Ref<HTMLButtonElement>;
  chipAriaLabel?: string;
  chipAriaExpanded?: boolean;
  onChipClick?: MouseEventHandler<HTMLButtonElement>;
  // When provided, the chip shows a right-side tooltip with this content.
  chipTooltip?: ReactNode;
  chipTooltipOpen?: boolean;
  // Fired when the user hovers the streak — used to dismiss the auto-opened
  // urgency tooltip.
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
}

// Presentational streak indicator ("border legend" layout): a bordered box
// wraps the avatar, and the flame + count sit on the bottom border and break
// through it. The chip's background is the v2 rail tint so it masks the line
// seamlessly, and a long number just opens a wider gap. All state visuals
// (border dashes/colour, fill, number colour, animations) come from
// useStreakRingState's exported maps, so the live rail and Storybook render
// identically. This component owns only the layout; it takes `state` as a prop
// and never calls the hook, so it stays provider-light.
export const StreakRing = ({
  state,
  count,
  hasReadToday,
  isLoading,
  avatar,
  chipRef,
  chipAriaLabel,
  chipAriaExpanded,
  onChipClick,
  chipTooltip,
  chipTooltipOpen,
  onMouseEnter,
}: StreakRingProps): ReactElement => {
  // Loading: a neutral calm border + transparent fill keep the box stable while
  // the data resolves.
  const frameClassName = isLoading
    ? 'border-border-subtlest-tertiary'
    : frameClassByState[state];
  const fillClassName = isLoading ? 'bg-transparent' : fillClassByState[state];

  const chip = isLoading ? (
    <div className={classNames(chipBaseClass, railTintBg)} aria-hidden>
      <ElementPlaceholder className="size-4 rounded-full" />
      <ElementPlaceholder className="h-3 w-4 rounded-4" />
    </div>
  ) : (
    <button
      ref={chipRef}
      type="button"
      aria-label={chipAriaLabel}
      aria-expanded={chipAriaExpanded}
      onClick={onChipClick}
      className={classNames(
        'focus-outline transition-[transform,background-color] hover:scale-110',
        chipBaseClass,
        railTintBg,
        chipHoverBgClassByState[state],
      )}
    >
      <HotIcon
        secondary={hasReadToday || state === 'freeze'}
        size={IconSize.Size16}
        className={countClassByState[state]}
      />
      <Typography
        type={TypographyType.Caption1}
        bold
        className={classNames(
          'whitespace-nowrap tabular-nums',
          countClassByState[state],
        )}
      >
        {largeNumberFormat(count) ?? count}
      </Typography>
    </button>
  );

  return (
    <div className="relative h-[62px] w-[54px]" onMouseEnter={onMouseEnter}>
      {/* Surround = frame (dashed/solid coloured border) + a separate fill
          layer. `transition-colors` makes state colour changes — and the
          earn-pop's settle back to the calm look — fade smoothly. The earn pop
          scales the frame only (see streak-earn-border), so the fill never
          changes size. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ transformOrigin: '50% 35%' }}
      >
        <span
          className={classNames(
            'absolute inset-0 rounded-[16px] border transition-colors',
            frameClassName,
          )}
        />
        <span
          className={classNames(
            'absolute inset-[3px] rounded-[13px] transition-colors',
            fillClassName,
          )}
        />
      </div>
      <div className="absolute left-[7px] top-[7px] z-1 size-10">{avatar}</div>
      {!isLoading && chipTooltip ? (
        <Tooltip
          side="right"
          content={chipTooltip}
          open={chipTooltipOpen || undefined}
          collisionPadding={TOOLTIP_COLLISION_PADDING}
        >
          {chip}
        </Tooltip>
      ) : (
        chip
      )}
    </div>
  );
};
