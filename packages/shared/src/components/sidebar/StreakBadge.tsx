import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { HotIcon } from '../icons';
import { IconSize } from '../Icon';
import type { StreakRingState } from '../../hooks/streaks/useStreakRingState';

// StreakBadge owns its own state visuals (it no longer borrows StreakRing's
// shared maps) so the v2 rail badge can evolve independently:
// - Calm/neutral states (new/pending/read-today/rest day): a SUBTLE GRAY border
//   by default; it turns WHITE when the tab is hovered and PINK (the reading-
//   streak brand colour) when the tab is the selected one. Read-today also gets
//   a pink flame so it still reads as "read".
// - Just earned (`celebration`): the existing earn pop/wash animation (pink fill
//   washes in with a white flame), then settles into the read-today look.
// - Danger states (at-risk/critical) keep their amber/red colour + pulse so the
//   urgency still reads (they don't react to hover/selected).
const CALM_STATES = new Set<StreakRingState>([
  'none',
  'pending',
  'safe',
  'freeze',
]);

// Only the non-calm states have a fixed frame; calm states are computed from the
// hover/selected context below.
const fixedFrameByState: Partial<Record<StreakRingState, string>> = {
  celebration: 'animate-streak-earn-border border-accent-bacon-default',
  at_risk: 'border-dashed border-status-warning',
  critical: 'animate-streak-border-pulse border-dashed border-status-error',
};

const fillByState: Record<StreakRingState, string> = {
  none: 'bg-transparent',
  pending: 'bg-transparent',
  safe: 'bg-transparent',
  celebration: 'animate-streak-earn-fill',
  at_risk: 'animate-streak-fade bg-status-warning opacity-20',
  critical: 'animate-streak-pulse bg-status-error opacity-40',
  freeze: 'bg-accent-blueCheese-flat',
};

const flameByState: Record<StreakRingState, string> = {
  none: 'text-text-quaternary',
  pending: 'text-text-tertiary',
  // Read today: pink flame on the empty tile (the original, lighter look).
  safe: 'text-accent-bacon-default',
  // The earn celebration keeps a white flame during its pink fill-wash pop.
  celebration: 'text-white',
  at_risk: 'text-status-warning',
  critical: 'text-status-error',
  freeze: 'text-accent-blueCheese-default',
};

interface StreakBadgeProps {
  state: StreakRingState;
  hasReadToday: boolean;
  // When this is the selected rail tab, the calm-state border goes pink.
  selected?: boolean;
  className?: string;
}

// Small square reading-streak indicator for the rail tab — sized like the other
// tabs' glyph icons so it sits in the same icon+label rhythm. Presentational
// only; never calls the hook. The hover-white border relies on a
// `group/streaktab` on the tab button (see SidebarDesktopV2).
export const StreakBadge = ({
  state,
  hasReadToday,
  selected = false,
  className,
}: StreakBadgeProps): ReactElement => {
  const frameClass = CALM_STATES.has(state)
    ? classNames(
        state === 'none' && 'border-dashed',
        selected
          ? 'border-accent-bacon-default'
          : 'border-border-subtlest-tertiary group-hover/streaktab:border-text-primary',
      )
    : fixedFrameByState[state];

  return (
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
          frameClass,
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
};
