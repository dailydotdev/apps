import { act, renderHook } from '@testing-library/react';
import { NotificationPromptSource } from '../../lib/log';
import { useEnableNotification } from './useEnableNotification';

const mockLogDismiss = jest.fn();
const mockLogClick = jest.fn();
const mockPersistentContext = jest.fn();
const mockUsePushNotificationMutation = jest.fn();
const mockUsePushNotificationContext = jest.fn();

jest.mock('../../contexts/PushNotificationContext', () => ({
  usePushNotificationContext: () => mockUsePushNotificationContext(),
}));

jest.mock('./usePushNotificationMutation', () => ({
  usePushNotificationMutation: () => mockUsePushNotificationMutation(),
}));

jest.mock('../usePersistentContext', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockPersistentContext(...args),
}));

jest.mock('./useNotificationCtaAnalytics', () => ({
  useNotificationCtaAnalytics: () => ({
    logClick: mockLogClick,
    logDismiss: mockLogDismiss,
  }),
  useNotificationCtaImpression: jest.fn(),
}));

jest.mock('../../lib/func', () => ({
  checkIsExtension: () => false,
}));

describe('useEnableNotification', () => {
  const setIsDismissed = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUsePushNotificationContext.mockReturnValue({
      isInitialized: true,
      isPushSupported: true,
      isSubscribed: false,
      shouldOpenPopup: () => false,
    });

    mockUsePushNotificationMutation.mockReturnValue({
      hasPermissionCache: false,
      acceptedJustNow: false,
      onEnablePush: jest.fn(() => Promise.resolve(true)),
    });

    mockPersistentContext.mockReturnValue([false, setIsDismissed, true]);
  });

  it('should show CTA for NewComment source when not dismissed', () => {
    const { result } = renderHook(() =>
      useEnableNotification({
        source: NotificationPromptSource.NewComment,
      }),
    );

    expect(result.current.shouldShowCta).toBe(true);
  });

  it('should hide CTA for NewComment source after onDismiss is called', () => {
    const { result } = renderHook(() =>
      useEnableNotification({
        source: NotificationPromptSource.NewComment,
      }),
    );

    expect(result.current.shouldShowCta).toBe(true);

    act(() => {
      result.current.onDismiss();
    });

    expect(result.current.shouldShowCta).toBe(false);
  });

  it('should call logDismiss analytics when dismissed', () => {
    const { result } = renderHook(() =>
      useEnableNotification({
        source: NotificationPromptSource.NewComment,
      }),
    );

    act(() => {
      result.current.onDismiss();
    });

    expect(mockLogDismiss).toHaveBeenCalledTimes(1);
    expect(mockLogDismiss).toHaveBeenCalledWith(
      expect.objectContaining({
        source: NotificationPromptSource.NewComment,
      }),
    );
  });

  it('should still write to persistent storage when dismissed for NewComment', () => {
    const { result } = renderHook(() =>
      useEnableNotification({
        source: NotificationPromptSource.NewComment,
      }),
    );

    act(() => {
      result.current.onDismiss();
    });

    expect(setIsDismissed).toHaveBeenCalledWith(true);
  });

  it('should hide CTA for SquadPage source after onDismiss is called', () => {
    const { result } = renderHook(() =>
      useEnableNotification({
        source: NotificationPromptSource.SquadPage,
      }),
    );

    expect(result.current.shouldShowCta).toBe(true);

    act(() => {
      result.current.onDismiss();
    });

    expect(result.current.shouldShowCta).toBe(false);
  });

  it('should hide CTA for NotificationsPage when persistent dismiss is true', () => {
    mockPersistentContext.mockReturnValue([true, setIsDismissed, true]);

    const { result } = renderHook(() =>
      useEnableNotification({
        source: NotificationPromptSource.NotificationsPage,
      }),
    );

    expect(result.current.shouldShowCta).toBe(false);
  });
});
