import { act, renderHook } from '@testing-library/react';
import {
  LogEvent,
  NotificationCtaKind,
  NotificationCtaPlacement,
  NotificationPromptSource,
  TargetType,
} from '../../lib/log';
import { useReadingReminderPushPrompt } from './useReadingReminderPushPrompt';

const mockUseLogContext = jest.fn();
const mockUsePersonalizedDigest = jest.fn();
const mockUsePushNotificationContext = jest.fn();
const mockUsePushNotificationMutation = jest.fn();

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => mockUseLogContext(),
}));

jest.mock('../usePersonalizedDigest', () => ({
  usePersonalizedDigest: () => mockUsePersonalizedDigest(),
}));

jest.mock('../../contexts/PushNotificationContext', () => ({
  usePushNotificationContext: () => mockUsePushNotificationContext(),
}));

jest.mock('./usePushNotificationMutation', () => ({
  usePushNotificationMutation: () => mockUsePushNotificationMutation(),
}));

describe('useReadingReminderPushPrompt', () => {
  const logEvent = jest.fn();
  const onEnablePush = jest.fn(() => Promise.resolve(true));
  const ctaEvent = {
    target_type: TargetType.ReadingReminder,
    extra: JSON.stringify({
      kind: NotificationCtaKind.PushCta,
      placement: NotificationCtaPlacement.NotificationSettings,
      origin: NotificationPromptSource.ReadingReminderPaused,
    }),
  };

  const renderPrompt = () =>
    renderHook(() =>
      useReadingReminderPushPrompt({
        placement: NotificationCtaPlacement.NotificationSettings,
      }),
    );

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseLogContext.mockReturnValue({ logEvent });
    mockUsePersonalizedDigest.mockReturnValue({
      getPersonalizedDigest: () => ({ deliveryPaused: true }),
    });
    mockUsePushNotificationContext.mockReturnValue({
      isPushSupported: true,
      isInitialized: true,
      isSubscribed: false,
    });
    mockUsePushNotificationMutation.mockReturnValue({
      onEnablePush,
      acceptedJustNow: false,
    });
  });

  it('should ask a paused reminder holder to turn on push', async () => {
    const { result } = renderPrompt();

    expect(result.current.shouldShow).toBe(true);
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.ImpressionNotificationCta,
      ...ctaEvent,
    });

    await act(async () => {
      await result.current.onEnable();
    });

    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.ClickNotificationCta,
      ...ctaEvent,
    });
    expect(onEnablePush).toHaveBeenCalledWith(
      NotificationPromptSource.ReadingReminderPaused,
    );
  });

  it('should not show the prompt when this device already has push', () => {
    mockUsePushNotificationContext.mockReturnValue({
      isPushSupported: true,
      isInitialized: true,
      isSubscribed: true,
    });

    const { result } = renderPrompt();

    expect(result.current.shouldShow).toBe(false);
    expect(logEvent).not.toHaveBeenCalled();
  });
});
