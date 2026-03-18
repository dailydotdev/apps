import { act, renderHook } from '@testing-library/react';
import { NotificationPromptSource } from '../../lib/log';
import { useEnableNotification } from './useEnableNotification';

const mockUseLogContext = jest.fn();
const mockPersistentContext = jest.fn();
const mockUsePushNotificationMutation = jest.fn();
const mockUsePushNotificationContext = jest.fn();
const mockUseNotificationCtaExperiment = jest.fn();

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => mockUseLogContext(),
}));

jest.mock('../usePersistentContext', () => ({
  __esModule: true,
  default: (...args) => mockPersistentContext(...args),
}));

jest.mock('./usePushNotificationMutation', () => ({
  usePushNotificationMutation: (args) => mockUsePushNotificationMutation(args),
}));

jest.mock('../../contexts/PushNotificationContext', () => ({
  usePushNotificationContext: () => mockUsePushNotificationContext(),
}));

jest.mock('./useNotificationCtaExperiment', () => ({
  useNotificationCtaExperiment: () => mockUseNotificationCtaExperiment(),
}));

describe('useEnableNotification', () => {
  let popupGrantedHandler: (() => void) | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    popupGrantedHandler = undefined;

    mockUseLogContext.mockReturnValue({ logEvent: jest.fn() });
    mockPersistentContext.mockReturnValue([false, jest.fn(), true]);
    mockUsePushNotificationMutation.mockImplementation(
      ({ onPopupGranted } = {}) => {
        popupGrantedHandler = onPopupGranted;

        return {
          hasPermissionCache: false,
          acceptedJustNow: false,
          onEnablePush: jest.fn(),
        };
      },
    );
    mockUsePushNotificationContext.mockReturnValue({
      isInitialized: true,
      isPushSupported: true,
      isSubscribed: false,
      shouldOpenPopup: () => false,
    });
    mockUseNotificationCtaExperiment.mockReturnValue({
      isEnabled: false,
      isPreviewActive: false,
    });
  });

  it('should hide rollout-only comment upvote CTA when the experiment is off', () => {
    const { result } = renderHook(() =>
      useEnableNotification({
        source: NotificationPromptSource.CommentUpvote,
      }),
    );

    expect(result.current.shouldShowCta).toBe(false);
  });

  it('should force-show the CTA while preview mode is active', () => {
    mockPersistentContext.mockReturnValue([true, jest.fn(), true]);
    mockUsePushNotificationContext.mockReturnValue({
      isInitialized: true,
      isPushSupported: true,
      isSubscribed: true,
      shouldOpenPopup: () => false,
    });
    mockUseNotificationCtaExperiment.mockReturnValue({
      isEnabled: true,
      isPreviewActive: true,
    });

    const { result } = renderHook(() =>
      useEnableNotification({
        source: NotificationPromptSource.NotificationsPage,
      }),
    );

    expect(result.current.shouldShowCta).toBe(true);
  });

  it('should run onEnableAction after direct permission enable succeeds', async () => {
    const onEnableAction = jest.fn().mockResolvedValue(undefined);
    const onEnablePush = jest.fn().mockResolvedValue(true);

    mockUsePushNotificationMutation.mockImplementation(
      ({ onPopupGranted } = {}) => {
        popupGrantedHandler = onPopupGranted;

        return {
          hasPermissionCache: false,
          acceptedJustNow: true,
          onEnablePush,
        };
      },
    );

    const { result } = renderHook(() =>
      useEnableNotification({
        source: NotificationPromptSource.CommentUpvote,
        onEnableAction,
      }),
    );

    await act(async () => {
      await result.current.onEnable();
    });

    expect(onEnablePush).toHaveBeenCalledWith(
      NotificationPromptSource.CommentUpvote,
    );
    expect(onEnableAction).toHaveBeenCalledTimes(1);
    expect(result.current.acceptedJustNow).toBe(true);
  });

  it('should run onEnableAction after popup permission is granted', async () => {
    const onEnableAction = jest.fn().mockResolvedValue(undefined);

    mockUsePushNotificationMutation.mockImplementation(
      ({ onPopupGranted } = {}) => {
        popupGrantedHandler = onPopupGranted;

        return {
          hasPermissionCache: false,
          acceptedJustNow: true,
          onEnablePush: jest.fn().mockResolvedValue(false),
        };
      },
    );

    const { result } = renderHook(() =>
      useEnableNotification({
        source: NotificationPromptSource.CommentUpvote,
        onEnableAction,
      }),
    );

    await act(async () => {
      await result.current.onEnable();
    });

    expect(onEnableAction).not.toHaveBeenCalled();

    await act(async () => {
      await popupGrantedHandler?.();
    });

    expect(onEnableAction).toHaveBeenCalledTimes(1);
    expect(result.current.acceptedJustNow).toBe(true);
  });
});
