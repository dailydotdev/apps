import { act, renderHook } from '@testing-library/react';
import { LogEvent, NotificationPromptSource } from '../../lib/log';
import { SendType } from '../usePersonalizedDigest';
import { UserPersonalizedDigestType } from '../../graphql/users';
import { useReadingReminderHero } from './useReadingReminderHero';
import {
  featureReadingReminderHeroCopy,
  featureReadingReminderHeroVariant,
  ReadingReminderHeroVariant,
} from '../../lib/featureManagement';
import { ActionType } from '../../graphql/actions';
import { useConditionalFeature } from '../useConditionalFeature';

const mockUseAuthContext = jest.fn();
const mockUseLogContext = jest.fn();
const mockUsePersonalizedDigest = jest.fn();
const mockPersistentContext = jest.fn();
const mockUseViewSize = jest.fn();
const mockUsePushNotificationMutation = jest.fn();
const mockUsePushNotificationContext = jest.fn();
const mockUseActions = jest.fn();
const mockRequestPush = jest.fn();

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
  default: (...args: unknown[]) => mockPersistentContext(...args),
}));

jest.mock('../useViewSize', () => ({
  ViewSize: {
    MobileL: 767,
  },
  useViewSize: (...args: unknown[]) => mockUseViewSize(...args),
}));

jest.mock('./usePushNotificationMutation', () => ({
  usePushNotificationMutation: () => mockUsePushNotificationMutation(),
}));

jest.mock('./usePushPermissionOutcome', () => ({
  getPushPermissionOutcome: (isGranted: boolean) =>
    isGranted ? 'granted' : 'dismissed',
  usePushPermissionOutcome: () => ({ requestPush: mockRequestPush }),
}));

jest.mock('../../contexts/PushNotificationContext', () => ({
  usePushNotificationContext: () => mockUsePushNotificationContext(),
}));

jest.mock('../useActions', () => ({
  useActions: () => mockUseActions(),
}));

jest.mock('../useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));

describe('useReadingReminderHero', () => {
  const logEvent = jest.fn();
  const subscribePersonalizedDigest = jest.fn(() => Promise.resolve(null));
  const onEnablePush = jest.fn(() => Promise.resolve(true));
  const setLastSeen = jest.fn(() => Promise.resolve());
  const completeAction = jest.fn(() => Promise.resolve());
  const checkHasCompleted = jest.fn(() => false);
  let variant = ReadingReminderHeroVariant.Control;

  beforeEach(() => {
    variant = ReadingReminderHeroVariant.Control;
    jest.clearAllMocks();
    checkHasCompleted.mockReturnValue(false);

    mockUseAuthContext.mockReturnValue({
      isLoggedIn: true,
      user: { timezone: 'UTC' },
    });
    mockUseLogContext.mockReturnValue({ logEvent });
    (useConditionalFeature as jest.Mock).mockImplementation(
      ({ feature, shouldEvaluate }) => {
        if (feature.id === featureReadingReminderHeroCopy.id) {
          return {
            value: featureReadingReminderHeroCopy.defaultValue,
            isLoading: false,
          };
        }

        if (feature.id === featureReadingReminderHeroVariant.id) {
          return shouldEvaluate
            ? { value: variant, isLoading: false }
            : { value: feature.defaultValue, isLoading: true };
        }

        return {
          value: true,
          isLoading: false,
        };
      },
    );
    mockUsePersonalizedDigest.mockReturnValue({
      getPersonalizedDigest: jest.fn(() => null),
      isLoading: false,
      subscribePersonalizedDigest,
    });
    mockPersistentContext.mockReturnValue([null, setLastSeen, true]);
    mockUseViewSize.mockReturnValue(true);
    mockUsePushNotificationMutation.mockReturnValue({ onEnablePush });
    mockUsePushNotificationContext.mockReturnValue({
      isPushSupported: true,
      isInitialized: true,
      isSubscribed: false,
    });
    mockUseActions.mockReturnValue({
      checkHasCompleted,
      completeAction,
      isActionsFetched: true,
    });
    mockRequestPush.mockResolvedValue('granted');
  });

  it('should show for invalid persisted timestamps', () => {
    mockPersistentContext.mockReturnValue(['invalid-date', setLastSeen, true]);

    const { result } = renderHook(() => useReadingReminderHero());

    expect(result.current.shouldShow).toBe(true);
  });

  it("should not show on the user's registration day", () => {
    mockUseAuthContext.mockReturnValue({
      isLoggedIn: true,
      user: { timezone: 'UTC', createdAt: new Date().toISOString() },
    });

    const { result } = renderHook(() => useReadingReminderHero());

    expect(result.current.shouldShow).toBe(false);
    expect(setLastSeen).not.toHaveBeenCalled();
  });

  it('should not show while digest subscription data is loading', () => {
    mockUsePersonalizedDigest.mockReturnValue({
      getPersonalizedDigest: jest.fn(() => null),
      isLoading: true,
      subscribePersonalizedDigest,
    });

    const { result } = renderHook(() => useReadingReminderHero());

    expect(result.current.shouldShow).toBe(false);
    expect(setLastSeen).not.toHaveBeenCalled();
  });

  it('should not show when dismissed', () => {
    mockPersistentContext.mockReturnValue(['dismissed', setLastSeen, true]);

    const { result } = renderHook(() => useReadingReminderHero());

    expect(result.current.shouldShow).toBe(false);
    expect(setLastSeen).not.toHaveBeenCalled();
  });

  it('should persist seen time immediately when shown', () => {
    const { result } = renderHook(() => useReadingReminderHero());

    expect(result.current.shouldShow).toBe(true);
    expect(setLastSeen).toHaveBeenCalledTimes(1);
    expect(result.current.title).toBe('Never miss a learning day');
    expect(result.current.subtitle).toBe(
      'Turn on your daily reading reminder and keep your routine.',
    );
  });

  it('should not show on desktop', () => {
    mockUseViewSize.mockReturnValue(false);

    const { result } = renderHook(() => useReadingReminderHero());

    expect(result.current.shouldShow).toBe(false);
  });

  it('should show on desktop when mobile requirement is disabled', () => {
    mockUseViewSize.mockReturnValue(false);

    const { result } = renderHook(() =>
      useReadingReminderHero({ requireMobile: false }),
    );

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
      event_name: LogEvent.ReadingReminderPermission,
      extra: JSON.stringify({ outcome: 'granted', hour: 9, variant }),
    });
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.ScheduleReadingReminder,
      extra: JSON.stringify({ hour: 9, timezone: 'UTC' }),
    });
  });

  it('should persist dismissal', async () => {
    const { result } = renderHook(() => useReadingReminderHero());

    await act(async () => {
      await result.current.onDismiss();
    });

    expect(setLastSeen).toHaveBeenCalledWith('dismissed');
  });

  it('should not show where push cannot work', () => {
    mockUsePushNotificationContext.mockReturnValue({
      isPushSupported: false,
      isInitialized: true,
      isSubscribed: false,
    });

    const { result } = renderHook(() => useReadingReminderHero());

    expect(result.current.shouldShow).toBe(false);
    expect(setLastSeen).not.toHaveBeenCalled();
  });

  it('should carry a close on this device over to the account', () => {
    mockPersistentContext.mockReturnValue(['dismissed', setLastSeen, true]);

    renderHook(() => useReadingReminderHero());

    expect(completeAction).toHaveBeenCalledWith(
      ActionType.DismissReadingReminderHero,
    );
  });

  describe('habit variant', () => {
    beforeEach(() => {
      variant = ReadingReminderHeroVariant.Habit;
    });

    it('should wait for the account actions', () => {
      mockUseActions.mockReturnValue({
        checkHasCompleted,
        completeAction,
        isActionsFetched: false,
      });

      const { result } = renderHook(() => useReadingReminderHero());

      expect(result.current.shouldShow).toBe(false);
      expect(setLastSeen).not.toHaveBeenCalled();
    });

    it('should leave readers closed on another device out of the experiment', () => {
      checkHasCompleted.mockReturnValue(true);

      const { result } = renderHook(() => useReadingReminderHero());

      expect(useConditionalFeature).toHaveBeenCalledWith(
        expect.objectContaining({
          feature: featureReadingReminderHeroVariant,
          shouldEvaluate: false,
        }),
      );
      expect(result.current.variant).toBe(ReadingReminderHeroVariant.Control);
      expect(result.current.shouldShow).toBe(true);
    });

    it('should keep the arm once the reminder is saved', () => {
      const { result, rerender } = renderHook(() => useReadingReminderHero());
      mockUsePersonalizedDigest.mockReturnValue({
        getPersonalizedDigest: jest.fn(() => ({ preferredHour: 20 })),
        isLoading: false,
        subscribePersonalizedDigest,
      });

      rerender();

      expect(result.current.variant).toBe(variant);
    });

    it('should close on the account', async () => {
      const { result } = renderHook(() => useReadingReminderHero());

      await act(async () => {
        await result.current.onDismiss();
      });

      expect(setLastSeen).toHaveBeenCalledWith('dismissed');
      expect(completeAction).toHaveBeenCalledWith(
        ActionType.DismissReadingReminderHero,
      );
    });

    it('should save the reminder only once push is allowed', async () => {
      const { result } = renderHook(() => useReadingReminderHero());

      await act(async () => {
        await expect(result.current.onSchedule(20)).resolves.toBe('granted');
      });

      expect(onEnablePush).not.toHaveBeenCalled();
      expect(subscribePersonalizedDigest).toHaveBeenCalledWith({
        type: UserPersonalizedDigestType.ReadingReminder,
        sendType: SendType.Daily,
        hour: 20,
      });
      expect(logEvent).toHaveBeenCalledWith({
        event_name: LogEvent.ScheduleReadingReminder,
        extra: JSON.stringify({ hour: 20, timezone: 'UTC', variant }),
      });
    });

    it('should save nothing when push is refused', async () => {
      mockRequestPush.mockResolvedValue('denied');
      const { result } = renderHook(() => useReadingReminderHero());

      await act(async () => {
        await expect(result.current.onSchedule(20)).resolves.toBe('denied');
      });

      expect(subscribePersonalizedDigest).not.toHaveBeenCalled();
      expect(logEvent).toHaveBeenCalledWith({
        event_name: LogEvent.ReadingReminderPermission,
        extra: JSON.stringify({ outcome: 'denied', hour: 20, variant }),
      });
    });
  });
});
