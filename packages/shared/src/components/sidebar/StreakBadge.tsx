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
  className?: string;
}

// Small square reading-streak indicator for the rail tab — sized like the other
// tabs' glyph icons so it sits in the same icon+label rhythm. Keeps StreakRing's
// state-driven visuals (dashed/solid border + earn/at-risk/critical animations,
// flame filled once read today) via useStreakRingState's exported maps.
// Presentational only; never calls the hook.
export const StreakBadge = ({
  state,
  hasReadToday,
  className,
}: StreakBadgeProps): ReactElement => (
  <span
    className={classNames(
      'relative flex size-7 items-center justify-center',
      className,
    )}
  >
    <span
      aria-hidden
      className={classNames(
        'absolute inset-0 rounded-8 border transition-colors',
        frameClassByState[state],
      )}
    />
    <span
      aria-hidden
      className={classNames(
        'absolute inset-[2px] rounded-6 transition-colors',
        fillClassByState[state],
      )}
    />
    <HotIcon
      secondary={hasReadToday || state === 'freeze'}
      size={IconSize.XSmall}
      className={classNames('relative', countClassByState[state])}
    />
  </span>
);
