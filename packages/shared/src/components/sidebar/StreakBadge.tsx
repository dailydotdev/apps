import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { HotIcon } from '../icons';
import { IconSize } from '../Icon';
import { Typography, TypographyType } from '../typography/Typography';
import { largeNumberFormat } from '../../lib/numberFormat';
import {
  countClassByState,
  fillClassByState,
  frameClassByState,
} from '../../hooks/streaks/useStreakRingState';
import type { StreakRingState } from '../../hooks/streaks/useStreakRingState';

interface StreakBadgeProps {
  state: StreakRingState;
  count: number;
  hasReadToday: boolean;
  // The flame+count chip that breaks through the bottom border. Turn off when
  // the count is shown elsewhere (e.g. the panel's "Current streak" stat).
  showChip?: boolean;
  className?: string;
}

// The reading-streak "ring" without an avatar: the exact StreakRing visual
// language — dashed/solid state border, fill, and the earn/at-risk/critical
// animations — wrapping a flame instead of a profile picture, with a count chip
// breaking through the bottom border. All state visuals come from
// useStreakRingState's exported maps, so it tracks the rest of the streak UI.
// Presentational only (no interactive chip button), so it can sit inside the
// rail tab's <button>.
export const StreakBadge = ({
  state,
  count,
  hasReadToday,
  showChip = true,
  className,
}: StreakBadgeProps): ReactElement => (
  <span className={classNames('relative block h-[62px] w-[54px]', className)}>
    <span
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
    </span>
    <span className="absolute left-[7px] top-[7px] z-1 flex size-10 items-center justify-center">
      <HotIcon
        secondary={hasReadToday || state === 'freeze'}
        size={IconSize.Large}
        className={countClassByState[state]}
      />
    </span>
    {showChip && (
      <span className="absolute -bottom-[8px] left-1/2 z-2 flex -translate-x-1/2 items-center rounded-8 bg-background-default px-1.5 py-0.5">
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
      </span>
    )}
  </span>
);
