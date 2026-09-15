import { act, renderHook } from '@testing-library/react';
import { usePushNotificationMutation } from './usePushNotificationMutation';
import { ActionType } from '../../graphql/actions';
import { NotificationPromptSource } from '../../lib/log';

const mockUseAuthContext = jest.fn();
const mockUsePushNotificationContext = jest.fn();
const mockUseActions = jest.fn();
const mockSetPermissionCache = jest.fn(() => Promise.resolve());

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

jest.mock('../../contexts/PushNotificationContext', () => ({
  usePushNotificationContext: () => mockUsePushNotificationContext(),
}));

jest.mock('../useActions', () => ({
  useActions: () => mockUseActions(),
}));

jest.mock('../usePersistentContext', () => ({
  __esModule: true,
  default: () => ['default', mockSetPermissionCache],
}));

jest.mock('../useNotificationPermissionPopup', () => ({
  ENABLE_NOTIFICATION_WINDOW_KEY: 'enable_notification',
  useNotificationPermissionPopup: () => ({ onOpenPopup: jest.fn() }),
}));

jest.mock('../useEventListener', () => ({
  useEventListener: jest.fn(),
}));

describe('usePushNotificationMutation', () => {
  const completeAction = jest.fn(() => Promise.resolve());
  const subscribe = jest.fn(() => Promise.resolve(true));

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthContext.mockReturnValue({ user: { id: 'u1' } });
    mockUsePushNotificationContext.mockReturnValue({
      isSubscribed: false,
      shouldOpenPopup: () => false,
      subscribe,
      unsubscribe: jest.fn(),
    });
    mockUseActions.mockReturnValue({
      completeAction,
      checkHasCompleted: () => true,
    });
  });

  it('should complete the notification action on grant even when it is already completed', async () => {
    const { result } = renderHook(() => usePushNotificationMutation());

    await act(async () => {
      await result.current.onEnablePush(
        NotificationPromptSource.NotificationsPage,
      );
    });

    expect(completeAction).toHaveBeenCalledWith(ActionType.EnableNotification);
  });

  it('should not complete the action when the permission is refused', async () => {
    subscribe.mockResolvedValueOnce(false);
    const { result } = renderHook(() => usePushNotificationMutation());

    await act(async () => {
      await result.current.onEnablePush(
        NotificationPromptSource.NotificationsPage,
      );
    });

    expect(completeAction).not.toHaveBeenCalled();
  });
});
