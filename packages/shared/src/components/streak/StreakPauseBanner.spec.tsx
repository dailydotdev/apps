import React from 'react';
import { render, screen } from '@testing-library/react';
import type { UserStreak, UserStreakPause } from '../../graphql/users';
import { DayOfWeek } from '../../lib/date';
import { StreakPauseBanner } from './StreakPauseBanner';

let mockIsFlagOn = true;

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: { id: 'u1', timezone: 'Etc/UTC' } }),
}));

jest.mock('../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: ({
    shouldEvaluate,
  }: {
    shouldEvaluate?: boolean;
  }) => ({
    value: shouldEvaluate !== false && mockIsFlagOn,
    isLoading: false,
  }),
}));

const streakWith = (pause: UserStreakPause | null): UserStreak => ({
  max: 10,
  total: 10,
  current: 10,
  weekStart: DayOfWeek.Monday,
  lastViewAt: new Date(),
  freezesAvailable: 0,
  pause,
});

describe('StreakPauseBanner', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-12T12:00:00.000Z'));
    mockIsFlagOn = true;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows while the pause covers today', () => {
    render(
      <StreakPauseBanner
        streak={streakWith({ start: '2026-11-10', end: '2026-11-15' })}
      />,
    );

    expect(screen.getByText('Paused until Nov 15')).toBeInTheDocument();
  });

  it('stays hidden for a pause that has not started yet', () => {
    render(
      <StreakPauseBanner
        streak={streakWith({ start: '2026-11-13', end: '2026-11-15' })}
      />,
    );

    expect(screen.queryByText(/Paused until/)).not.toBeInTheDocument();
  });

  it('stays hidden while the flag is off', () => {
    mockIsFlagOn = false;
    render(
      <StreakPauseBanner
        streak={streakWith({ start: '2026-11-10', end: '2026-11-15' })}
      />,
    );

    expect(screen.queryByText(/Paused until/)).not.toBeInTheDocument();
  });
});
