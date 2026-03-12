import { act, renderHook } from '@testing-library/react';
import { LogEvent, NotificationPromptSource } from '../../lib/log';
import { SendType } from '../usePersonalizedDigest';
import { UserPersonalizedDigestType } from '../../graphql/users';
import { useReadingReminderHero } from './useReadingReminderHero';

const mockUseAuthContext = jest.fn();
const mockUseLogContext = jest.fn();
const mockUsePersonalizedDigest = jest.fn();
const mockPersistentContext = jest.fn();
const mockUseViewSize = jest.fn();
const mockUsePushNotificationMutation = jest.fn();

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => mockUseLogContext(),
}));

jest.mock('../usePersonalizedDigest', () => ({
  SendType: {
    Weekly: 'weekly',
    Workdays: 'workdays',
    Daily: 'daily',
  },
  usePersonalizedDigest: () => mockUsePersonalizedDigest(),
}));

jest.mock('../usePersistentContext', () => ({
  __esModule: true,
  PersistentContextKeys: {
    ReadingReminderLastSeen: 'reading_reminder_last_seen',
  },
  default: (...args) => mockPersistentContext(...args),
}));

jest.mock('../useViewSize', () => ({
  ViewSize: {
    MobileL: 767,
  },
  useViewSize: (...args) => mockUseViewSize(...args),
}));

jest.mock('./usePushNotificationMutation', () => ({
  usePushNotificationMutation: () => mockUsePushNotificationMutation(),
}));

describe('useReadingReminderHero', () => {
  const logEvent = jest.fn();
  const subscribePersonalizedDigest = jest.fn(() => Promise.resolve(null));
  const onEnablePush = jest.fn(() => Promise.resolve(true));
  const setLastSeen = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuthContext.mockReturnValue({
      isLoggedIn: true,
      user: { timezone: 'UTC' },
    });
    mockUseLogContext.mockReturnValue({ logEvent });
    mockUsePersonalizedDigest.mockReturnValue({
      getPersonalizedDigest: jest.fn(() => null),
      isLoading: false,
      subscribePersonalizedDigest,
    });
    mockPersistentContext.mockReturnValue([null, setLastSeen, true]);
    mockUseViewSize.mockReturnValue(true);
    mockUsePushNotificationMutation.mockReturnValue({ onEnablePush });
  });

  it('should show for invalid persisted timestamps', () => {
    mockPersistentContext.mockReturnValue(['invalid-date', setLastSeen, true]);

    const { result } = renderHook(() => useReadingReminderHero());

    expect(result.current.shouldShow).toBe(true);
  });

  it("should still show on mobile on the user's registration day", () => {
    mockUseAuthContext.mockReturnValue({
      isLoggedIn: true,
      user: { timezone: 'UTC', createdAt: new Date().toISOString() },
    });

    const { result } = renderHook(() => useReadingReminderHero());

    expect(result.current.shouldShow).toBe(true);
    expect(setLastSeen).not.toHaveBeenCalled();
  });

  it('should still show on mobile while digest subscription data is loading', () => {
    mockUsePersonalizedDigest.mockReturnValue({
      getPersonalizedDigest: jest.fn(() => null),
      isLoading: true,
      subscribePersonalizedDigest,
    });

    const { result } = renderHook(() => useReadingReminderHero());

    expect(result.current.shouldShow).toBe(true);
    expect(setLastSeen).not.toHaveBeenCalled();
  });

  it('should persist seen time immediately when shown', () => {
    const { result } = renderHook(() => useReadingReminderHero());

    expect(result.current.shouldShow).toBe(true);
    expect(setLastSeen).toHaveBeenCalledTimes(1);
  });

  it('should show on desktop for logged in users', () => {
    mockUseViewSize.mockReturnValue(false);

    const { result } = renderHook(() => useReadingReminderHero());

    expect(result.current.shouldShow).toBe(true);
  });

  it('should enable reminder and log schedule event', async () => {
    const { result } = renderHook(() => useReadingReminderHero());

    await act(async () => {
      await result.current.onEnable();
    });

    expect(subscribePersonalizedDigest).toHaveBeenCalledWith({
      type: UserPersonalizedDigestType.ReadingReminder,
      sendType: SendType.Daily,
      hour: 9,
    });
    expect(onEnablePush).toHaveBeenCalledWith(
      NotificationPromptSource.ReadingReminder,
    );
    expect(setLastSeen).toHaveBeenCalledTimes(2);
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.ScheduleReadingReminder,
      extra: JSON.stringify({ hour: 9, timezone: 'UTC' }),
    });
  });
});
