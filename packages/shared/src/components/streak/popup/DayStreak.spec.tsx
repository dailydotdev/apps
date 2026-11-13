import React from 'react';
import { render, screen } from '@testing-library/react';
import { DayStreak, missedDayLabel, pausedDayLabel, Streak } from './DayStreak';

jest.mock('next/router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: { id: 'u1', timezone: 'Etc/UTC' } }),
}));

jest.mock('../../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: () => ({ value: false, isLoading: false }),
}));

jest.mock('../../tooltip/Tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('DayStreak', () => {
  it('labels the missed day that reset the streak', () => {
    render(
      <DayStreak
        streak={Streak.Missed}
        date={new Date('2026-11-10T12:00:00.000Z')}
      />,
    );

    expect(
      screen.getByRole('img', { name: missedDayLabel }),
    ).toBeInTheDocument();
  });

  it('labels a paused day', () => {
    render(
      <DayStreak
        streak={Streak.Paused}
        date={new Date('2026-11-14T12:00:00.000Z')}
      />,
    );

    expect(
      screen.getByRole('img', { name: pausedDayLabel }),
    ).toBeInTheDocument();
  });

  it('does not label ordinary days', () => {
    render(
      <DayStreak
        streak={Streak.Upcoming}
        date={new Date('2026-11-13T12:00:00.000Z')}
      />,
    );

    expect(
      screen.queryByRole('img', { name: missedDayLabel }),
    ).not.toBeInTheDocument();
  });
});
