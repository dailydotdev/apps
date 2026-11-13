import React from 'react';
import { render, screen } from '@testing-library/react';
import type { StreakRingState } from '../../hooks/streaks/useStreakRingState';
import { GOAL_ARC_CIRCUMFERENCE, StreakBadge } from './StreakBadge';

const renderBadge = (
  props: Partial<React.ComponentProps<typeof StreakBadge>> = {},
) => render(<StreakBadge state="pending" hasReadToday={false} {...props} />);

const arcCircle = (): SVGCircleElement => {
  const circle = screen.getByTestId('streak-goal-arc').querySelector('circle');
  if (!circle) {
    throw new Error('goal arc circle missing');
  }
  return circle;
};

describe('StreakBadge goal arc', () => {
  it('draws half the ring for 0.5 progress, from the top', () => {
    renderBadge({ goalProgress: 0.5 });

    const circle = arcCircle();
    expect(Number(circle.getAttribute('stroke-dasharray'))).toBeCloseTo(
      GOAL_ARC_CIRCUMFERENCE,
    );
    expect(Number(circle.getAttribute('stroke-dashoffset'))).toBeCloseTo(
      GOAL_ARC_CIRCUMFERENCE / 2,
    );
    expect(circle).toHaveAttribute('transform', 'rotate(-90 12 12)');
    expect(circle).toHaveAttribute('stroke', 'currentColor');
    expect(screen.getByTestId('streak-goal-arc')).toHaveClass(
      'text-accent-bacon-default',
    );
  });

  it('takes the primary text colour over the pink read-today tile', () => {
    renderBadge({ state: 'safe', hasReadToday: true, goalProgress: 0.5 });

    expect(screen.getByTestId('streak-goal-arc')).toHaveClass(
      'text-text-primary',
    );
  });

  it('takes the selected label colour over the pink selected ring', () => {
    renderBadge({ selected: true, goalProgress: 0.5 });

    expect(screen.getByTestId('streak-goal-arc')).toHaveClass(
      'text-text-primary',
    );
  });

  it.each([undefined, 0, 1, 1.2])(
    'draws no arc for goalProgress %s',
    (goalProgress) => {
      renderBadge({ goalProgress });

      expect(screen.queryByTestId('streak-goal-arc')).not.toBeInTheDocument();
    },
  );

  it.each<StreakRingState>(['at_risk', 'critical', 'celebration'])(
    'draws no arc in the %s state',
    (state) => {
      renderBadge({ state, goalProgress: 0.5 });

      expect(screen.queryByTestId('streak-goal-arc')).not.toBeInTheDocument();
    },
  );
});
