import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import type { StreakRingInfo } from '../../../hooks/streaks/useStreakRingState';
import { useStreakRingState } from '../../../hooks/streaks/useStreakRingState';
import { DayOfWeek } from '../../../lib/date';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import { webappUrl } from '../../../lib/constants';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { StreakWidget } from './StreakWidget';

const mockLogEvent = jest.fn();
let mockUser: { id: string } | null = { id: 'u1' };

jest.mock('../../../hooks/streaks/useStreakRingState', () => ({
  ...jest.requireActual('../../../hooks/streaks/useStreakRingState'),
  useStreakRingState: jest.fn(),
}));

jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: mockUser }),
}));

jest.mock('../../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

// Both carry their own queries and are covered where they live.
jest.mock('../../../components/streak/popup/StreakMonthCalendar', () => ({
  StreakMonthCalendar: () => <div data-testid="streak-calendar" />,
}));

jest.mock('../../../components/streak/popup/StreakFreezeRow', () => ({
  StreakFreezeRow: () => <div data-testid="streak-freeze-row" />,
}));

const ringState = (
  overrides: Partial<StreakRingInfo> = {},
): StreakRingInfo => ({
  isEnabled: true,
  isLoading: false,
  streak: {
    current: 12,
    max: 40,
    total: 230,
    weekStart: DayOfWeek.Monday,
    lastViewAt: new Date(),
    freezesAvailable: 2,
  },
  state: 'safe',
  frameClassName: '',
  fillClassName: '',
  countClassName: '',
  count: 12,
  hasReadToday: true,
  copy: '12-day reading streak.',
  ...overrides,
});

const renderWidget = (size: FeedWidgetSize) =>
  render(
    <StreakWidget
      widget={{ id: 'w1', kind: FeedWidgetKind.Streak, size }}
      size={size}
      isEditing={false}
    />,
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockUser = { id: 'u1' };
  jest.mocked(useStreakRingState).mockReturnValue(ringState());
});

it('shows the current and longest streak and that today is done', () => {
  renderWidget(FeedWidgetSize.Small);

  expect(screen.getByText('12')).toBeInTheDocument();
  expect(screen.getByText('40 Longest · 230 Total')).toBeInTheDocument();
  expect(
    screen.getByText('Read today, your streak is safe.'),
  ).toBeInTheDocument();
});

it('nudges a reader who has not read today', () => {
  jest.mocked(useStreakRingState).mockReturnValue(
    ringState({
      state: 'pending',
      hasReadToday: false,
      copy: "You haven't read today — keep your 12-day streak going.",
    }),
  );
  renderWidget(FeedWidgetSize.Small);

  expect(
    screen.getByText("You haven't read today — keep your 12-day streak going."),
  ).toBeInTheDocument();
});

it('keeps Small to the summary and adds the calendar and freezes when taller', () => {
  const { unmount } = renderWidget(FeedWidgetSize.Small);
  expect(screen.queryByTestId('streak-calendar')).not.toBeInTheDocument();
  expect(screen.queryByTestId('streak-freeze-row')).not.toBeInTheDocument();
  unmount();

  [FeedWidgetSize.Tall, FeedWidgetSize.Large].forEach((size) => {
    const view = renderWidget(size);
    expect(screen.getByTestId('streak-calendar')).toBeInTheDocument();
    expect(screen.getByTestId('streak-freeze-row')).toBeInTheDocument();
    view.unmount();
  });
});

it('opens Game Center and logs the click', () => {
  renderWidget(FeedWidgetSize.Tall);

  const link = screen.getByRole('link', { name: /12-day reading streak/ });
  expect(link).toHaveAttribute('href', `${webappUrl}game-center`);
  fireEvent.click(link);
  expect(mockLogEvent).toHaveBeenCalledWith({
    event_name: LogEvent.Click,
    target_type: TargetType.FeedWidget,
    target_id: FeedWidgetKind.Streak,
    extra: JSON.stringify({
      origin: Origin.FeedWidgets,
      size: FeedWidgetSize.Tall,
    }),
  });
});

it('says so when the reader turned streaks off', () => {
  jest
    .mocked(useStreakRingState)
    .mockReturnValue(ringState({ isEnabled: false, streak: undefined }));
  renderWidget(FeedWidgetSize.Small);

  expect(
    screen.getByText('Reading streaks are turned off.'),
  ).toBeInTheDocument();
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
});

it('asks a logged-out reader to log in', () => {
  mockUser = null;
  jest
    .mocked(useStreakRingState)
    .mockReturnValue(ringState({ isEnabled: false, streak: undefined }));
  renderWidget(FeedWidgetSize.Small);

  expect(
    screen.getByText('Log in to keep a reading streak.'),
  ).toBeInTheDocument();
});
