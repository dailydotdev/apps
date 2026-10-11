import { act, renderHook } from '@testing-library/react';
import { useFeedPatchyReminder } from './useFeedPatchyReminder';
import {
  LogEvent,
  NotificationPromptSource,
  TargetType,
} from '../../../lib/log';
import { UserPersonalizedDigestType } from '../../../graphql/users';

const mockLogEvent = jest.fn();
const mockOnEnablePush = jest.fn<
  Promise<boolean>,
  [NotificationPromptSource]
>();
const mockSubscribe = jest.fn();
const mockIsSubscribed = jest.fn(() => false);

jest.mock('../../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));
jest.mock('../../../contexts/PushNotificationContext', () => ({
  usePushNotificationContext: () => ({ isSubscribed: mockIsSubscribed() }),
}));
jest.mock('../../../hooks/notifications/usePushNotificationMutation', () => ({
  usePushNotificationMutation: () => ({ onEnablePush: mockOnEnablePush }),
}));
jest.mock('../../../hooks/usePersonalizedDigest', () => ({
  usePersonalizedDigest: () => ({ subscribePersonalizedDigest: mockSubscribe }),
}));

const setPermission = (permission: NotificationPermission) => {
  Object.defineProperty(globalThis, 'Notification', {
    configurable: true,
    value: { permission },
  });
};

const events = () =>
  mockLogEvent.mock.calls.map(([event]) => ({
    ...event,
    extra: event.extra && JSON.parse(event.extra),
  }));

describe('useFeedPatchyReminder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsSubscribed.mockReturnValue(false);
    setPermission('default');
  });

  it('logs the reading reminder impression once, tagged with the variant', () => {
    const { rerender } = renderHook(() => useFeedPatchyReminder());
    rerender();

    expect(events()).toEqual([
      {
        event_name: LogEvent.Impression,
        target_type: TargetType.ReadingReminder,
        extra: { variant: 'feed_patchy' },
      },
    ]);
  });

  it('logs the commitment and a skip', () => {
    const { result } = renderHook(() => useFeedPatchyReminder());

    result.current.onCommit('drag');
    result.current.onSkip();

    expect(events().slice(1)).toEqual([
      {
        event_name: LogEvent.CommitOnboarding,
        extra: { method: 'drag', variant: 'feed_patchy' },
      },
      {
        event_name: LogEvent.SkipReadingReminder,
        extra: { variant: 'feed_patchy' },
      },
    ]);
  });

  it('saves the time, asks for push and logs the answer', async () => {
    mockOnEnablePush.mockResolvedValue(true);
    const { result } = renderHook(() => useFeedPatchyReminder());

    let outcome;
    await act(async () => {
      outcome = await result.current.onSchedule(12, 'Europe/London');
    });

    expect(outcome).toBe('granted');
    expect(mockSubscribe).toHaveBeenCalledWith({
      hour: 12,
      type: UserPersonalizedDigestType.ReadingReminder,
    });
    expect(mockOnEnablePush).toHaveBeenCalledWith(
      NotificationPromptSource.ReadingReminder,
    );
    expect(events().slice(1)).toEqual([
      {
        event_name: LogEvent.ScheduleReadingReminder,
        extra: { hour: 12, timezone: 'Europe/London', variant: 'feed_patchy' },
      },
      {
        event_name: LogEvent.ReadingReminderPermission,
        extra: { outcome: 'granted', variant: 'feed_patchy' },
      },
    ]);
  });

  it('tells a refusal from a prompt closed without an answer', async () => {
    mockOnEnablePush.mockImplementation(async () => {
      setPermission('denied');
      return false;
    });
    const { result } = renderHook(() => useFeedPatchyReminder());

    await expect(result.current.onSchedule(9, 'UTC')).resolves.toBe('denied');

    setPermission('default');
    mockOnEnablePush.mockResolvedValue(false);

    await expect(result.current.onSchedule(9, 'UTC')).resolves.toBe(
      'dismissed',
    );
  });

  it('does not prompt when the browser already blocks notifications', async () => {
    setPermission('denied');
    const { result } = renderHook(() => useFeedPatchyReminder());

    await expect(result.current.onSchedule(9, 'UTC')).resolves.toBe('denied');
    expect(mockOnEnablePush).not.toHaveBeenCalled();
    expect(mockSubscribe).toHaveBeenCalled();
  });
});
