import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { UserStreak, UserStreakPause } from '../../graphql/users';
import { userStreakPauseQueryOptions } from '../../graphql/streakPause';
import { DayOfWeek } from '../../lib/date';
import { StreakPauseBanner } from './StreakPauseBanner';

const mockUser = { id: 'u1', timezone: 'Etc/UTC' };

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: mockUser, isLoggedIn: true }),
}));

const streak: UserStreak = {
  max: 10,
  total: 10,
  current: 10,
  weekStart: DayOfWeek.Monday,
  lastViewAt: new Date(),
  freezesAvailable: 0,
};

const renderBanner = (pause: UserStreakPause | null) => {
  const client = new QueryClient();
  client.setQueryData(userStreakPauseQueryOptions(mockUser).queryKey, pause);

  render(
    <QueryClientProvider client={client}>
      <StreakPauseBanner streak={streak} />
    </QueryClientProvider>,
  );
};

describe('StreakPauseBanner', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-12T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows while the pause covers today', () => {
    renderBanner({ start: '2026-11-10', end: '2026-11-15' });

    expect(screen.getByText('Paused until Nov 15')).toBeInTheDocument();
  });

  it('stays hidden for a pause that has not started yet', () => {
    renderBanner({ start: '2026-11-13', end: '2026-11-15' });

    expect(screen.queryByText(/Paused until/)).not.toBeInTheDocument();
  });

  it('stays hidden without a pause', () => {
    renderBanner(null);

    expect(screen.queryByText(/Paused until/)).not.toBeInTheDocument();
  });
});
