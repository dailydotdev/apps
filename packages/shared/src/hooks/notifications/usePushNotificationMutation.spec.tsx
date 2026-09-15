import type { ReactNode } from 'react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { usePushNotificationMutation } from './usePushNotificationMutation';
import { useActions } from '../useActions';
import { ActionType, completeUserAction } from '../../graphql/actions';
import { NotificationPromptSource } from '../../lib/log';

const mockUseAuthContext = jest.fn();
const mockUsePushNotificationContext = jest.fn();
const mockSetPermissionCache = jest.fn(() => Promise.resolve());

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

jest.mock('../../contexts/PushNotificationContext', () => ({
  usePushNotificationContext: () => mockUsePushNotificationContext(),
}));

jest.mock('../../graphql/actions', () => ({
  ...jest.requireActual('../../graphql/actions'),
  getUserActions: jest.fn(),
  completeUserAction: jest.fn(),
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

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getUserActions } = jest.requireMock('../../graphql/actions');

describe('usePushNotificationMutation', () => {
  const user = { id: 'u1' };
  const subscribe = jest.fn(() => Promise.resolve(true));

  const renderPushHook = () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    return renderHook(
      () => ({
        push: usePushNotificationMutation(),
        actions: useActions(),
      }),
      { wrapper },
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthContext.mockReturnValue({ user });
    mockUsePushNotificationContext.mockReturnValue({
      isSubscribed: false,
      shouldOpenPopup: () => false,
      subscribe,
      unsubscribe: jest.fn(),
    });
    // The user enabled push long ago, so the action is already recorded: the
    // case where the notifications intro quest gets stuck.
    getUserActions.mockResolvedValue([
      {
        userId: user.id,
        type: ActionType.EnableNotification,
        completedAt: new Date('2026-01-01'),
      },
    ]);
  });

  it('should send the notification action on grant even when it is already completed', async () => {
    const { result } = renderPushHook();

    // The guard only bites once the completed action is in the cache.
    await waitFor(() =>
      expect(
        result.current.actions.checkHasCompleted(ActionType.EnableNotification),
      ).toBe(true),
    );

    await act(async () => {
      await result.current.push.onEnablePush(
        NotificationPromptSource.NotificationsPage,
      );
    });

    expect(completeUserAction).toHaveBeenCalledWith(
      ActionType.EnableNotification,
    );
  });

  it('should not send the notification action when the permission is refused', async () => {
    subscribe.mockResolvedValueOnce(false);
    const { result } = renderPushHook();

    await waitFor(() =>
      expect(
        result.current.actions.checkHasCompleted(ActionType.EnableNotification),
      ).toBe(true),
    );

    await act(async () => {
      await result.current.push.onEnablePush(
        NotificationPromptSource.NotificationsPage,
      );
    });

    expect(completeUserAction).not.toHaveBeenCalled();
  });
});
