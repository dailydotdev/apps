import type { MouseEventHandler, ReactElement, ReactNode, Ref } from 'react';
import React from 'react';
import classNames from 'classnames';
import { HotIcon } from '../icons';
import { IconSize } from '../Icon';
import { Tooltip } from '../tooltip/Tooltip';
import { Typography, TypographyType } from '../typography/Typography';
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

export interface StreakRingProps {
  state: StreakRingState;
  count: number;
  hasReadToday: boolean;
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
}

// Presentational streak indicator ("border legend" layout): a bordered box
// wraps the avatar, and the flame + count sit on the bottom border and break
// through it — the chip's background is the exact v2 rail/page tint
// (surface-secondary 3% over background-default, the same color-mix the rail
// and MainLayout use) so it masks the line seamlessly, and a long number just
// opens a wider gap.
// All state visuals (border dashes/colour, fill, number colour, animations)
// come from useStreakRingState's exported maps, so the live rail and Storybook
// render identically. This component owns only the layout; it takes `state` as
// a prop and never calls the hook, so it stays provider-light.
export const StreakRing = ({
  state,
  count,
  hasReadToday,
  avatar,
  chipRef,
  chipAriaLabel,
  chipAriaExpanded,
  onChipClick,
  chipTooltip,
  chipTooltipOpen,
}: StreakRingProps): ReactElement => {
  const chip = (
    <button
      ref={chipRef}
      type="button"
      aria-label={chipAriaLabel}
      aria-expanded={chipAriaExpanded}
      onClick={onChipClick}
      className="focus-outline absolute -bottom-[8px] left-1/2 z-2 flex -translate-x-1/2 items-center gap-0.5 rounded-8 bg-[color-mix(in_srgb,var(--theme-surface-secondary)_3%,var(--theme-background-default))] px-1.5 py-0.5 transition-transform hover:scale-110"
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
    <div className="relative h-[62px] w-[54px]">
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
            frameClassByState[state],
          )}
        />
        <span
          className={classNames(
            'absolute inset-[3px] rounded-[13px] transition-colors',
            fillClassByState[state],
          )}
        />
      </div>
      <div className="absolute left-[7px] top-[7px] z-1 size-10">{avatar}</div>
      {chipTooltip ? (
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
