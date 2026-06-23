import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { HotIcon } from '../icons';
import { IconSize } from '../Icon';
import type { StreakRingState } from '../../hooks/streaks/useStreakRingState';

// StreakBadge owns its own state visuals (it no longer borrows StreakRing's
// shared maps) so the v2 rail badge can evolve independently:
// - Read today (`safe`): a SOLID pink tile with a WHITE flame.
// - Just earned (`celebration`): the same read-today look (pink + white flame)
//   plus the existing earn pop/wash animation; it settles into `safe` after.
// - Calm/neutral states (new/pending/rest day): a WHITE border — the same
//   lighter, "selected"-style border we use on the avatar — keeping each
//   state's dashed/solid pattern.
// - Danger states (at-risk/critical) keep their amber/red colour + pulse so the
//   urgency still reads.
const frameByState: Record<StreakRingState, string> = {
  none: 'border-dashed border-text-primary',
  pending: 'border-text-primary',
  // Solid pink tile: pink border + pink bg on this layer removes the 1px gap to
  // the inset fill so the whole square reads as one pink block.
  safe: 'border-accent-bacon-default bg-accent-bacon-default',
  celebration: 'animate-streak-earn-border border-accent-bacon-default',
  at_risk: 'border-dashed border-status-warning',
  critical: 'animate-streak-border-pulse border-dashed border-status-error',
  freeze: 'border-text-primary',
};

const fillByState: Record<StreakRingState, string> = {
  none: 'bg-transparent',
  pending: 'bg-transparent',
  safe: 'bg-accent-bacon-default',
  celebration: 'animate-streak-earn-fill',
  at_risk: 'animate-streak-fade bg-status-warning opacity-20',
  critical: 'animate-streak-pulse bg-status-error opacity-40',
  freeze: 'bg-accent-blueCheese-flat',
};

const flameByState: Record<StreakRingState, string> = {
  none: 'text-text-quaternary',
  pending: 'text-text-tertiary',
  // White flame on the pink read-today tile (and through the earn celebration).
  safe: 'text-white',
  celebration: 'text-white',
  at_risk: 'text-status-warning',
  critical: 'text-status-error',
  freeze: 'text-accent-blueCheese-default',
};

interface StreakBadgeProps {
  state: StreakRingState;
  hasReadToday: boolean;
  className?: string;
}

// Small square reading-streak indicator for the rail tab — sized like the other
// tabs' glyph icons so it sits in the same icon+label rhythm. Presentational
// only; never calls the hook.
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
        frameByState[state],
      )}
    />
    <span
      aria-hidden
      className={classNames(
        'absolute inset-[2px] rounded-6 transition-colors',
        fillByState[state],
      )}
    />
    <HotIcon
      secondary={hasReadToday || state === 'freeze'}
      size={IconSize.XSmall}
      className={classNames('relative', flameByState[state])}
    />
  </span>
);
