import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import type { StreakRingInfo } from '../../../hooks/streaks/useStreakRingState';
import { useStreakRingState } from '../../../hooks/streaks/useStreakRingState';
import { DayOfWeek } from '../../../lib/date';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import { webappUrl } from '../../../lib/constants';
import { LazyModal } from '../../../components/modals/common/types';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { StreakWidget } from './StreakWidget';

const mockLogEvent = jest.fn();
let mockUser: { id: string; timezone?: string } | null = { id: 'u1' };

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

// These carry their own queries and are covered where they live.
jest.mock('../../../components/streak/popup/StreakMonthCalendar', () => ({
  StreakMonthCalendar: () => <div data-testid="streak-calendar" />,
}));

jest.mock('../../../components/quest/CompactQuestList', () => ({
  CompactQuestList: ({ period }: { period: string }) => (
    <div data-testid={`quest-list-${period}`} />
  ),
}));

let mockIsFreezeEnabled = true;
jest.mock('../../../components/streak/popup/StreakFreezeRow', () => ({
  useIsStreakFreezeEnabled: () => mockIsFreezeEnabled,
}));

jest.mock('../../../hooks/streaks/useStreakFreeze', () => ({
  STREAK_FREEZE_CAP: 5,
  useStreakFreeze: () => ({ freezesAvailable: 1 }),
}));

const mockOpenModal = jest.fn();
jest.mock('../../../hooks/useLazyModal', () => ({
  useLazyModal: () => ({ openModal: mockOpenModal }),
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
      onConfigChange={() => false}
      canConfigure={false}
      isConfiguring={false}
      onConfigureEnd={() => undefined}
    />,
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockUser = { id: 'u1' };
  mockIsFreezeEnabled = true;
  jest.mocked(useStreakRingState).mockReturnValue(ringState());
});

it('shows the current and longest streak and that today is done', () => {
  renderWidget(FeedWidgetSize.Small);

  expect(screen.getByText('12')).toBeInTheDocument();
  expect(screen.getByText('day streak · safe today')).toBeInTheDocument();
  expect(screen.getByText('40 longest · 230 total')).toBeInTheDocument();
});

it('nudges a reader who has not read today', () => {
  jest
    .mocked(useStreakRingState)
    .mockReturnValue(ringState({ state: 'pending', hasReadToday: false }));
  renderWidget(FeedWidgetSize.Tall);

  expect(
    screen.getByText('day streak · read a post to keep it'),
  ).toBeInTheDocument();
  expect(screen.getByText(/left to read$/)).toBeInTheDocument();
});

it('keeps Small to the count and calendar, adds the meters when taller and quests at Large', () => {
  const { unmount } = renderWidget(FeedWidgetSize.Small);
  expect(screen.getByTestId('streak-calendar')).toBeInTheDocument();
  expect(screen.queryByText('Today’s goal')).not.toBeInTheDocument();
  expect(screen.queryByTestId('quest-list-daily')).not.toBeInTheDocument();
  unmount();

  const view = renderWidget(FeedWidgetSize.Tall);
  expect(screen.getByText('Today’s goal')).toBeInTheDocument();
  expect(screen.getByText('Streak freezes')).toBeInTheDocument();
  expect(screen.queryByTestId('quest-list-daily')).not.toBeInTheDocument();
  view.unmount();

  renderWidget(FeedWidgetSize.Large);
  expect(screen.getByText('Today’s goal')).toBeInTheDocument();
  expect(screen.getByTestId('quest-list-daily')).toBeInTheDocument();
  expect(screen.getByTestId('quest-list-weekly')).toBeInTheDocument();
});

it('offers more freezes, and hides the meter where freezes are off', () => {
  const { unmount } = renderWidget(FeedWidgetSize.Tall);
  expect(screen.getByText('One left for a day off')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Buy more' }));
  expect(mockOpenModal).toHaveBeenCalledWith({
    type: LazyModal.StreakFreezePurchase,
  });
  unmount();

  mockIsFreezeEnabled = false;
  renderWidget(FeedWidgetSize.Tall);
  expect(screen.queryByText('Streak freezes')).not.toBeInTheDocument();
});

it("dates today and its countdown in the reader's timezone", () => {
  jest.useFakeTimers().setSystemTime(new Date('2026-10-22T12:30:00Z'));
  mockUser = { id: 'u1', timezone: 'Pacific/Kiritimati' };
  renderWidget(FeedWidgetSize.Tall);

  expect(screen.getByText('Today, Oct 23')).toBeInTheDocument();
  expect(screen.getByText('Resets in 21 hr 30 min')).toBeInTheDocument();
  jest.useRealTimers();
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
