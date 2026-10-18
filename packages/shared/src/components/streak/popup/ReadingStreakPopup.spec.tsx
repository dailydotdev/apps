import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ReadingStreakPopup } from './ReadingStreakPopup';
import type { UserStreak } from '../../../graphql/users';
import { DayOfWeek } from '../../../lib/date';
import { LogEvent, TargetId } from '../../../lib/log';

const mockCompleteAction = jest.fn();
const mockLogEvent = jest.fn();
const mockShowPrompt = jest.fn();
const mockUpdateFlag = jest.fn();
const mockOnTogglePermission = jest.fn();
let mockIsTimezoneOk = true;

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

describe('ReadingStreakPopup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsTimezoneOk = true;
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
});
