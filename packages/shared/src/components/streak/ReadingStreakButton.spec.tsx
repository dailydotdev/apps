import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReadingStreakButton } from './ReadingStreakButton';
import type { UserStreak } from '../../graphql/users';
import { LogEvent } from '../../lib/log';
import { useIsPhone } from '../../hooks/useViewSize';

const mockLogEvent = jest.fn();
let mockIsMobile = true;

jest.mock('../../hooks', () => ({
  useViewSize: (size: string) => size === 'mobileL' && mockIsMobile,
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

jest.mock('../../hooks/layout/useLaptopLayout', () => ({
  useLaptopLayout: () => false,
}));

// The real tooltip only mounts its content once tippy loads, which jsdom never
// does, so this renders the popover whenever it is controlled open.
jest.mock('../tooltips', () => ({
  SimpleTooltip: ({
    children,
    content,
    visible,
  }: {
    children: React.ReactNode;
    content: React.ReactNode;
    visible?: boolean;
  }) => (
    <>
      {children}
      {visible && content}
    </>
  ),
}));

jest.mock('../sidebar/sections/StreakQuestsSection', () => ({
  StreakQuestsSection: ({ onClose }: { onClose?: () => void }) => (
    <div data-testid="streak-quests-section">
      <button type="button" onClick={onClose}>
        Start again
      </button>
    </div>
  ),
}));

jest.mock('./popup/ReadingStreakPopup', () => ({
  ReadingStreakPopup: ({ onClose }: { onClose?: () => void }) => (
    <div data-testid="reading-streak-popup">
      <button type="button" onClick={onClose}>
        Start again
      </button>
    </div>
  ),
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
  fireEvent.click(screen.getByRole('button', { name: /^(7|Current streak)$/ }));
};

beforeEach(() => {
  jest.clearAllMocks();
  mockIsMobile = true;
  jest.mocked(useIsPhone).mockReturnValue(true);
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

it('closes the desktop popover when the soft break starts again', async () => {
  mockIsMobile = false;
  jest.mocked(useIsPhone).mockReturnValue(false);
  openStreak();

  const popup = screen.getByTestId('reading-streak-popup');
  fireEvent.click(within(popup).getByRole('button', { name: 'Start again' }));

  await waitFor(() =>
    expect(
      screen.queryByTestId('reading-streak-popup'),
    ).not.toBeInTheDocument(),
  );
});

it('closes the phone sheet when the soft break starts again', async () => {
  openStreak();

  fireEvent.click(screen.getByRole('button', { name: 'Start again' }));

  await waitFor(() =>
    expect(
      screen.queryByRole('dialog', { name: 'Current Streak' }),
    ).not.toBeInTheDocument(),
  );
});
