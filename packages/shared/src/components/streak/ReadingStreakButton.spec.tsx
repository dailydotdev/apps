import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReadingStreakButton } from './ReadingStreakButton';
import type { UserStreak } from '../../graphql/users';
import { LogEvent } from '../../lib/log';
import { useIsPhone } from '../../hooks/useViewSize';

const mockLogEvent = jest.fn();

jest.mock('../../hooks', () => ({
  useViewSize: (size: string) => size === 'mobileL',
  ViewSize: { Laptop: 'laptop', MobileL: 'mobileL' },
}));

jest.mock('../../hooks/useViewSize', () => ({
  useIsPhone: jest.fn(() => true),
}));

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: { id: 'u1', timezone: 'UTC' } }),
}));

jest.mock('../../hooks/streaks/useStreakTimezoneOk', () => ({
  useStreakTimezoneOk: () => true,
}));

jest.mock('../../hooks/layout/useLayoutVariant', () => ({
  useLayoutVariant: () => ({ isV2: false }),
}));

jest.mock('../sidebar/sections/StreakQuestsSection', () => ({
  StreakQuestsSection: () => <div data-testid="streak-quests-section" />,
}));

jest.mock('./popup/ReadingStreakPopup', () => ({
  ReadingStreakPopup: () => <div data-testid="reading-streak-popup" />,
}));

const streak = {
  current: 7,
  max: 12,
  total: 40,
  lastViewAt: new Date(),
} as unknown as UserStreak;

const openStreak = () => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ReadingStreakButton streak={streak} isLoading={false} compact />
    </QueryClientProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: /7/ }));
};

beforeEach(() => {
  jest.clearAllMocks();
});

it('opens the v2 streak panel as a sheet on phones', () => {
  openStreak();

  expect(
    screen.getByRole('dialog', { name: 'Current Streak' }),
  ).toBeInTheDocument();
  expect(screen.getByTestId('streak-quests-section')).toBeInTheDocument();
  expect(screen.queryByTestId('reading-streak-popup')).not.toBeInTheDocument();
  expect(mockLogEvent).toHaveBeenCalledWith({
    event_name: LogEvent.OpenStreaks,
  });
});

it('keeps the streak popup below tablet outside the phone shell', () => {
  jest.mocked(useIsPhone).mockReturnValue(false);
  openStreak();

  expect(screen.getByTestId('reading-streak-popup')).toBeInTheDocument();
  expect(screen.queryByTestId('streak-quests-section')).not.toBeInTheDocument();
});
