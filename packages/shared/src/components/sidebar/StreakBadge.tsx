import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { HotIcon } from '../icons';
import { IconSize } from '../Icon';
import type { StreakRingState } from '../../hooks/streaks/useStreakRingState';

// StreakBadge owns its own state visuals (it no longer borrows StreakRing's
// shared maps) so the v2 rail badge can evolve independently:
// - Calm/neutral states (new/pending/read-today/rest day): the ring always takes
//   the colour of the flame inside it — grey before you've read today, blue on a
//   frozen rest day. Ring AND flame turn WHITE together when the tab is hovered,
//   and the ring goes PINK (the reading-streak brand colour) when the tab is the
//   selected one. Read-today fills pink with a white flame so it reads as "done".
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
  // Read today: the whole tile fills pink so "done" reads at a glance —
  // unread days stay grey outlines (tile border + outline flame).
  safe: 'bg-accent-bacon-default',
  celebration: 'animate-streak-earn-fill',
  at_risk: 'animate-streak-fade bg-status-warning opacity-20',
  critical: 'animate-streak-pulse bg-status-error opacity-40',
  freeze: 'bg-accent-blueCheese-flat',
};

// Calm-state rings mirror the flame colour inside them, so the badge always
// reads as a single unit: grey before you've read today, blue on a rest day.
const calmRingByState: Partial<Record<StreakRingState, string>> = {
  none: 'border-text-quaternary',
  pending: 'border-text-tertiary',
  freeze: 'border-accent-blueCheese-default',
};

const flameByState: Record<StreakRingState, string> = {
  none: 'text-text-quaternary',
  pending: 'text-text-tertiary',
  // Read today: white filled flame over the pink-filled tile.
  safe: 'text-white',
  // The earn celebration keeps a white flame during its pink fill-wash pop.
  celebration: 'text-white',
  at_risk: 'text-status-warning',
  critical: 'text-status-error',
  freeze: 'text-accent-blueCheese-default',
};

// Goal progress arc (streak_goals). It traces the ring itself: the badge box is
// a 24-unit viewBox and the ring is inset 1.5 with a 1.5 border, so the stroke
// centre sits at radius 12 - 1.5 - 0.75 = 9.75 with the same 1.5 width.
const GOAL_ARC_CENTER = 12;
const GOAL_ARC_RADIUS = 9.75;
const GOAL_ARC_STROKE = 1.5;
export const GOAL_ARC_CIRCUMFERENCE = 2 * Math.PI * GOAL_ARC_RADIUS;

// The arc only shows in calm states. Danger states keep their dashed
// amber/red ring as the one message, and the earn pop owns the ring while it
// plays (the arc returns, one step longer, once it settles into read-today).
const GOAL_ARC_STATES = new Set<StreakRingState>([
  'none',
  'pending',
  'safe',
  'freeze',
]);

interface StreakBadgeProps {
  state: StreakRingState;
  hasReadToday: boolean;
  // 0..1 towards the streak goal; drawn as an arc on the ring while the goal
  // is set but not yet hit.
  goalProgress?: number;
  // When this is the selected rail tab, the calm-state border goes pink.
  selected?: boolean;
  className?: string;
}

// Small circular reading-streak indicator for the rail tab — sized like the other
// tabs' glyph icons so it sits in the same icon+label rhythm. Presentational
// only; never calls the hook. The hover-white border relies on a
// `group/streaktab` on the tab button (see SidebarDesktopV2).
export const StreakBadge = ({
  state,
  hasReadToday,
  selected = false,
  goalProgress,
  className,
}: StreakBadgeProps): ReactElement => {
  const showGoalArc =
    goalProgress !== undefined &&
    goalProgress > 0 &&
    goalProgress < 1 &&
    GOAL_ARC_STATES.has(state);
  const goalArcColor = (): string => {
    // The ring is pink when read today (tile filled pink too) or when the tab
    // is selected, so the arc takes the primary text colour (white in dark
    // mode, near-black in light) to stay visible. A white arc vanished against
    // the light page and read as a bite out of the tile. On read-today hover
    // the ring itself turns text-primary, so the arc flips back to pink.
    if (state === 'safe') {
      return 'text-text-primary group-hover/streaktab:text-accent-bacon-default';
    }
    if (selected) {
      return 'text-text-primary';
    }
    return 'text-accent-bacon-default';
  };
  // "Not read yet": the calm states with no fill of their own.
  const isUnreadCalm = state === 'none' || state === 'pending';
  const calmBorder = (): string => {
    // Read today: the border merges with the pink fill (hover still
    // brightens it).
    if (state === 'safe') {
      return 'border-accent-bacon-default group-hover/streaktab:border-text-primary';
    }
    if (selected) {
      return 'border-accent-bacon-default';
    }
    // The ring takes the flame's own colour (rather than the subtler border
    // token) so the badge reads as one unit, and still brightens on hover like
    // every other rail tab.
    return classNames(
      calmRingByState[state] ?? 'border-text-tertiary',
      'group-hover/streaktab:border-text-primary',
    );
  };
  const frameClass = CALM_STATES.has(state)
    ? classNames(state === 'none' && 'border-dashed', calmBorder())
    : fixedFrameByState[state];

  return (
    <span
      className={classNames(
        // Matches the shared rail glyph box, so the ring is never wider than
        // the icons beside it (see railGlyphBoxClass).
        'relative flex size-6 items-center justify-center',
        className,
      )}
    >
      <span
        aria-hidden
        className={classNames(
          // Same inset as the ring, NOT a smaller one: the ring's opaque border
          // paints over this fill's edge, so the two can't disagree. Insetting
          // the fill further left a fractional gap between them that rounded
          // unevenly per device pixel and read as an off-centre crescent.
          'absolute inset-[1.5px] rounded-full transition-colors',
          fillByState[state],
        )}
      />
      <span
        aria-hidden
        className={classNames(
          // A circle, not a rounded square: the reading streak's own visual
          // language (rings/flames) is round.
          // The ring is inset inside the shared glyph box (rather than filling
          // it) so its diameter matches the compass's drawn circle — measured at
          // ~22px ink, against a full-box ring's 26px. The box itself is
          // untouched, so the tab's height still matches its neighbours.
          // border-[1.5px] matches the icon set's own stroke weight — measured
          // at ~1.33-2px on the bell/compass/squads glyphs, against which a
          // hairline 1px ring read as a different family.
          'absolute inset-[1.5px] rounded-full border-[1.5px] transition-colors',
          frameClass,
        )}
      />
      {showGoalArc && (
        <svg
          aria-hidden
          data-testid="streak-goal-arc"
          viewBox="0 0 24 24"
          fill="none"
          className={classNames(
            'absolute inset-0 size-full transition-colors motion-reduce:transition-none',
            goalArcColor(),
          )}
        >
          <circle
            cx={GOAL_ARC_CENTER}
            cy={GOAL_ARC_CENTER}
            r={GOAL_ARC_RADIUS}
            stroke="currentColor"
            strokeWidth={GOAL_ARC_STROKE}
            strokeLinecap="round"
            strokeDasharray={GOAL_ARC_CIRCUMFERENCE}
            strokeDashoffset={GOAL_ARC_CIRCUMFERENCE * (1 - goalProgress)}
            // SVG circles start at 3 o'clock; turn back a quarter so the arc
            // grows clockwise from the top.
            transform={`rotate(-90 ${GOAL_ARC_CENTER} ${GOAL_ARC_CENTER})`}
          />
        </svg>
      )}
      <HotIcon
        secondary={hasReadToday || state === 'freeze'}
        size={IconSize.XSmall}
        className={classNames(
          // No nudge offsets here on purpose. Both flame SVGs are already
          // symmetric in their 24x24 viewBox (ink margins 4.8/4.8 and 3.0/3.0),
          // so flex centring lands the ink exactly on the disc's centre. A
          // previous attempt to "optically" centre the flame's centre of mass
          // shifted it 0.8px up, which showed as a cramped tip (clearance 2.2
          // top vs 3.8 bottom) and read as misaligned.
          'relative transition-colors',
          flameByState[state],
          // Unread states brighten with the ring on hover, matching the other
          // rail tabs' icons. Read/danger states own their colour.
          isUnreadCalm && 'group-hover/streaktab:text-text-primary',
        )}
      />
    </span>
  );
};
