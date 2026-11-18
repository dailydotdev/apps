import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { HotIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
import type { StreakRingState } from '../../hooks/streaks/useStreakRingState';
import type { PatchyFace } from './patchyConfig';
import { getPatchyConfig } from './patchyConfig';

// The ring keeps the streak tab's state language: pink once read (or
// selected), amber/red when the day is at risk, blue on a rest day.
const ringByState: Record<StreakRingState, string> = {
  none: 'border-border-subtlest-secondary',
  pending: 'border-border-subtlest-secondary',
  safe: 'border-accent-bacon-default',
  celebration: 'border-accent-bacon-default',
  at_risk: 'border-status-warning',
  critical: 'border-status-error',
  freeze: 'border-accent-blueCheese-default',
};

const flameByState: Record<StreakRingState, string> = {
  none: 'text-text-quaternary',
  pending: 'text-text-tertiary',
  safe: 'text-accent-bacon-default',
  celebration: 'text-accent-bacon-default',
  at_risk: 'text-status-warning',
  critical: 'text-status-error',
  freeze: 'text-accent-blueCheese-default',
};

interface PatchyRailIconProps {
  face: PatchyFace;
  state: StreakRingState;
  hasReadToday: boolean;
  selected?: boolean;
  // Changes on every reaction; each change replays a small hop.
  bump?: number;
}

// Patchy's face in the Streak tab, in place of the flame badge. The glyph box
// stays the shared 24px so the tab keeps its height; the face overflows it a
// little, like an avatar would.
export const PatchyRailIcon = ({
  face,
  state,
  hasReadToday,
  selected = false,
  bump = 0,
}: PatchyRailIconProps): ReactElement => (
  <span className="relative flex size-6 items-center justify-center">
    <span
      aria-hidden
      // A new key restarts the hop animation.
      key={bump}
      className={classNames(
        bump > 0 && 'motion-safe:animate-patchy-bump',
        'absolute -inset-1 overflow-hidden rounded-full border-2 bg-surface-float transition-colors',
        selected && (state === 'none' || state === 'pending')
          ? 'border-accent-bacon-default'
          : ringByState[state],
        state === 'celebration' && 'animate-streak-earn-border',
      )}
    >
      <img
        src={getPatchyConfig().faceImage[face]}
        alt=""
        className="size-full object-cover"
        draggable={false}
      />
    </span>
    <span
      aria-hidden
      className="absolute -bottom-2 -right-2 flex size-4 items-center justify-center rounded-full bg-background-default"
    >
      <HotIcon
        secondary={hasReadToday || state === 'freeze'}
        size={IconSize.Size16}
        className={classNames('size-3', flameByState[state])}
      />
    </span>
  </span>
);
