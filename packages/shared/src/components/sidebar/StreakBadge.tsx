import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { HotIcon } from '../icons';
import { IconSize } from '../Icon';
import {
  countClassByState,
  fillClassByState,
  frameClassByState,
} from '../../hooks/streaks/useStreakRingState';
import type { StreakRingState } from '../../hooks/streaks/useStreakRingState';

interface StreakBadgeProps {
  state: StreakRingState;
  hasReadToday: boolean;
  // `sm` sits on the rail tab; `lg` leads the streak panel.
  size?: 'sm' | 'lg';
  className?: string;
}

// The reading-streak indicator without an avatar: the same state-driven ring
// (border dash/colour + fill + earn/at-risk/critical animations) and flame as
// StreakRing, but sized to stand on its own — on the sidebar rail tab (`sm`) or
// leading the streak panel (`lg`). All state visuals come from
// useStreakRingState's exported maps, so it tracks the rest of the streak UI
// exactly; it owns layout only and never calls the hook (stays provider-light).
export const StreakBadge = ({
  state,
  hasReadToday,
  size = 'sm',
  className,
}: StreakBadgeProps): ReactElement => {
  const isLarge = size === 'lg';
  return (
    <span
      className={classNames(
        'relative flex shrink-0 items-center justify-center',
        isLarge ? 'size-14' : 'size-7',
        className,
      )}
    >
      <span
        aria-hidden
        style={{ transformOrigin: '50% 50%' }}
        className={classNames(
          'pointer-events-none absolute inset-0 border transition-colors',
          isLarge ? 'rounded-16' : 'rounded-8',
          frameClassByState[state],
        )}
      />
      <span
        aria-hidden
        className={classNames(
          'pointer-events-none absolute inset-[3px] transition-colors',
          isLarge ? 'rounded-12' : 'rounded-6',
          fillClassByState[state],
        )}
      />
      <HotIcon
        secondary={hasReadToday || state === 'freeze'}
        size={isLarge ? IconSize.Large : IconSize.Small}
        className={classNames('relative', countClassByState[state])}
      />
    </span>
  );
};
