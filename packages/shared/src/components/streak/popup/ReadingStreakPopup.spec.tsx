import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ReadingStreakPopup } from './ReadingStreakPopup';
import type { UserStreak } from '../../../graphql/users';
import { DayOfWeek } from '../../../lib/date';
import { LogEvent, TargetId, TargetType } from '../../../lib/log';
import { LazyModal } from '../../modals/common/types';
import { FeedbackCategory } from '../../../graphql/feedback';

const mockCompleteAction = jest.fn();
const mockLogEvent = jest.fn();
const mockShowPrompt = jest.fn();
const mockUpdateFlag = jest.fn();
const mockOnTogglePermission = jest.fn();
const mockOpenModal = jest.fn();
let mockIsTimezoneOk = true;
let mockIsSoftBreakFlagOn = false;
let mockWhyBrokeEnabled = true;
let mockStreakGoalsEnabled = false;
let mockStreakGoal: number | null = null;
const getMockFeatureValue = (id: string, shouldEvaluate?: boolean) => {
  if (id === 'streak_why_broke') {
    return mockWhyBrokeEnabled;
  }

  const isOn = id === 'streak_goals' ? mockStreakGoalsEnabled : mockIsSoftBreakFlagOn;

  return shouldEvaluate !== false && isOn;
};
const mockUseConditionalFeature = jest.fn(
  ({
    feature,
    shouldEvaluate,
  }: {
    feature: { id: string };
    shouldEvaluate?: boolean;
  }) => ({
    value: getMockFeatureValue(feature.id, shouldEvaluate),
    isLoading: false,
  }),
);

jest.mock('../../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: (args: {
    feature: { id: string };
    shouldEvaluate?: boolean;
  }) => mockUseConditionalFeature(args),
}));

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('./DayStreak', () => ({
  DayStreak: () => <div data-testid="day-streak" />,
}));

jest.mock('./StreakFreezeRow', () => ({
  StreakFreezeRow: () => <div data-testid="streak-freeze-row" />,
}));

jest.mock('./StreakSection', () => ({
  StreakSection: ({ label }: { label: string }) => <div>{label}</div>,
}));

jest.mock('../../tooltip/Tooltip', () => ({
  Tooltip: ({
    children,
    content,
  }: {
    children: React.ReactNode;
    content: React.ReactNode;
  }) => (
    <div>
      <div data-testid="tooltip-content">{content}</div>
      {children}
    </div>
  ),
}));

jest.mock('../../../hooks', () => ({
  useActions: () => ({
    completeAction: mockCompleteAction,
  }),
  useViewSize: () => false,
  ViewSize: {
    MobileL: 'MobileL',
  },
}));

jest.mock('../../../hooks/streaks/useStreakDays', () => ({
  getStreak: () => 'pending',
  getStreakDays: () => [new Date('2026-09-01T00:00:00.000Z')],
  useReadingStreak30Days: () => [],
  useStreakFreezeDates: () => [],
}));

jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: () => ({
    user: {
      id: 'u1',
      timezone: 'America/Argentina/Buenos_Aires',
    },
  }),
}));

jest.mock('../../../hooks/streaks/useStreakTimezoneOk', () => ({
  useStreakTimezoneOk: () => mockIsTimezoneOk,
}));

jest.mock('../../../hooks/usePrompt', () => ({
  usePrompt: () => ({
    showPrompt: mockShowPrompt,
  }),
}));

jest.mock('../../../contexts/LogContext', () => ({
  useLogContext: () => ({
    logEvent: mockLogEvent,
  }),
}));

jest.mock('../../../contexts/SettingsContext', () => ({
  useSettingsContext: () => ({
    flags: {},
    updateFlag: mockUpdateFlag,
    loadedSettings: true,
    optOutReadingStreak: false,
    streakGoal: mockStreakGoal,
  }),
}));

jest.mock('../../../hooks/notifications', () => ({
  usePushNotificationMutation: () => ({
    onTogglePermission: mockOnTogglePermission,
    acceptedJustNow: false,
  }),
}));

jest.mock('../../../contexts/PushNotificationContext', () => ({
  usePushNotificationContext: () => ({
    isSubscribed: true,
    isInitialized: true,
    isPushSupported: true,
  }),
}));

jest.mock('../../../hooks/useLazyModal', () => ({
  useLazyModal: () => ({ openModal: mockOpenModal }),
}));

jest.mock('../../../hooks/usePersistentContext', () => ({
  __esModule: true,
  default: () => [false, jest.fn()],
  PersistentContextKeys: {
    StreakAlertPushKey: 'StreakAlertPushKey',
  },
}));

const streak: UserStreak = {
  current: 3,
  max: 7,
  total: 42,
  weekStart: DayOfWeek.Monday,
  lastViewAt: new Date('2026-09-01T00:00:00.000Z'),
  freezesAvailable: 0,
};

const brokenStreak: UserStreak = {
  ...streak,
  current: 0,
  lastReset: {
    missedDate: '2026-11-09',
    timezone: 'Europe/Amsterdam',
    at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
};

describe('ReadingStreakPopup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsTimezoneOk = true;
    mockIsSoftBreakFlagOn = false;
    mockWhyBrokeEnabled = true;
    mockStreakGoalsEnabled = false;
    mockStreakGoal = null;
  });

  it('renders the timezone tooltip as wrapping prose and truncates long timezone labels', () => {
    render(<ReadingStreakPopup streak={streak} />);

    const tooltipContent = screen.getByText(
      /We are showing your reading streak in your selected timezone/,
    );
    const timezoneLabel = screen.getByRole('link', {
      name: 'America/Argentina/Buenos_Aires',
    });

    expect(tooltipContent).toHaveClass('min-w-0', 'text-center');
    expect(tooltipContent).not.toHaveClass('flex');
    expect(timezoneLabel).toHaveClass('min-w-0', 'truncate');
  });

  it('logs the timezone label click and opens the mismatch prompt', () => {
    mockIsTimezoneOk = false;
    mockShowPrompt.mockResolvedValue(true);
    render(<ReadingStreakPopup streak={streak} />);

    const timezoneLabel = screen.getByRole('link', {
      name: 'Timezone mismatch',
    });

    fireEvent.click(timezoneLabel);

    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.Click,
        target_type: TargetId.StreakTimezoneLabel,
      }),
    );
    expect(mockShowPrompt).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Streak timezone mismatch' }),
    );
  });

  describe('soft break', () => {
    it('leads with the best streak and a way back when the streak reset', () => {
      mockIsSoftBreakFlagOn = true;
      render(<ReadingStreakPopup streak={{ ...streak, current: 0, max: 5 }} />);

      expect(screen.getByText('Your best: 5 days.')).toBeInTheDocument();
      expect(screen.getByText('Today can be day 1.')).toBeInTheDocument();
      expect(screen.queryByText('Current streak')).not.toBeInTheDocument();
      expect(screen.getByText('Longest streak 🏆')).toBeInTheDocument();
      expect(mockLogEvent).toHaveBeenCalledWith({
        event_name: LogEvent.Impression,
        target_type: TargetType.StreakSoftBreak,
      });

      fireEvent.click(screen.getByRole('link', { name: 'Start again' }));

      expect(mockLogEvent).toHaveBeenCalledWith({
        event_name: LogEvent.Click,
        target_type: TargetType.StreakSoftBreak,
      });
    });

    it('keeps the regular hero, without evaluating the flag, while the streak is live', () => {
      mockIsSoftBreakFlagOn = true;
      render(<ReadingStreakPopup streak={{ ...streak, current: 3 }} />);

      expect(screen.getByText('Current streak')).toBeInTheDocument();
      expect(screen.queryByText('Start again')).not.toBeInTheDocument();
      expect(mockUseConditionalFeature).toHaveBeenCalledWith(
        expect.objectContaining({ shouldEvaluate: false }),
      );
    });

    it('keeps the regular 0 hero for the control group', () => {
      render(<ReadingStreakPopup streak={{ ...streak, current: 0, max: 5 }} />);

      expect(screen.getByText('Current streak')).toBeInTheDocument();
      expect(screen.queryByText('Start again')).not.toBeInTheDocument();
      expect(mockUseConditionalFeature).toHaveBeenCalledWith(
        expect.objectContaining({ shouldEvaluate: true }),
      );
    });
  });

  describe('reset reason', () => {
    it('explains a recent reset and opens feedback from the link', () => {
      render(<ReadingStreakPopup streak={brokenStreak} />);

      expect(
        screen.getByText(
          'No read was recorded on Nov 9 in Europe/Amsterdam (UTC +1).',
        ),
      ).toBeInTheDocument();
      expect(mockLogEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event_name: LogEvent.Impression,
          target_type: TargetType.StreakResetReason,
          target_id: '2026-11-09',
        }),
      );

      fireEvent.click(
        screen.getByRole('button', { name: 'Think this is wrong? Tell us' }),
      );

      expect(mockLogEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event_name: LogEvent.Click,
          target_type: TargetType.StreakResetReason,
          target_id: '2026-11-09',
        }),
      );
      expect(mockOpenModal).toHaveBeenCalledWith(
        expect.objectContaining({
          type: LazyModal.Feedback,
          props: expect.objectContaining({
            initialCategory: FeedbackCategory.BugReport,
            initialDescription: expect.stringContaining('Nov 9'),
          }),
        }),
      );
    });

    it('stays hidden while the streak is running', () => {
      render(<ReadingStreakPopup streak={streak} />);

      expect(
        screen.queryByText(/No read was recorded/),
      ).not.toBeInTheDocument();
    });

    it('stays hidden when the flag is off', () => {
      mockWhyBrokeEnabled = false;
      render(<ReadingStreakPopup streak={brokenStreak} />);

      expect(
        screen.queryByText(/No read was recorded/),
      ).not.toBeInTheDocument();
    });
  });

  describe('streak goal', () => {
    it('shows how far the streak is towards the goal', () => {
      mockStreakGoalsEnabled = true;
      mockStreakGoal = 7;
      render(<ReadingStreakPopup streak={streak} />);

      expect(screen.getByText('3/7 to your goal')).toBeInTheDocument();
    });

    it('hides the progress without a goal or with the flag off', () => {
      mockStreakGoalsEnabled = true;
      const { unmount } = render(<ReadingStreakPopup streak={streak} />);
      expect(
        screen.queryByTestId('streak-goal-progress'),
      ).not.toBeInTheDocument();
      unmount();

      mockStreakGoalsEnabled = false;
      mockStreakGoal = 7;
      render(<ReadingStreakPopup streak={streak} />);
      expect(
        screen.queryByTestId('streak-goal-progress'),
      ).not.toBeInTheDocument();
    });
  });
});
