import { act, renderHook } from '@testing-library/react';
import * as React from 'react';
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

type DismissedMap = Partial<Record<NotificationPromptSource, boolean>>;

let dismissedStore: DismissedMap = {};
const setIsDismissed = jest.fn();

describe('useEnableNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    dismissedStore = {};

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

    mockPersistentContext.mockImplementation(() => {
      const [value, setValue] = React.useState<DismissedMap>(dismissedStore);
      const persistentSetter = (next: DismissedMap) => {
        dismissedStore = next;
        setIsDismissed(next);
        setValue(next);
      };
      return [value, persistentSetter, true];
    });
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

  it('should write the dismissed source flag to persistent storage', () => {
    const { result } = renderHook(() =>
      useEnableNotification({
        source: NotificationPromptSource.NewComment,
      }),
    );

    act(() => {
      result.current.onDismiss();
    });

    expect(setIsDismissed).toHaveBeenCalledWith(
      expect.objectContaining({
        [NotificationPromptSource.NewComment]: true,
      }),
    );
  });

  it('should keep CTA hidden for NewComment source after remount', () => {
    const { result, unmount } = renderHook(() =>
      useEnableNotification({
        source: NotificationPromptSource.NewComment,
      }),
    );

    act(() => {
      result.current.onDismiss();
    });

    expect(result.current.shouldShowCta).toBe(false);
    unmount();

    const { result: resultAfterRemount } = renderHook(() =>
      useEnableNotification({
        source: NotificationPromptSource.NewComment,
      }),
    );

    expect(resultAfterRemount.current.shouldShowCta).toBe(false);
  });

  it('should not affect other sources when one source is dismissed', () => {
    const { result: newCommentResult } = renderHook(() =>
      useEnableNotification({
        source: NotificationPromptSource.NewComment,
      }),
    );

    act(() => {
      newCommentResult.current.onDismiss();
    });

    expect(newCommentResult.current.shouldShowCta).toBe(false);

    const { result: notificationsPageResult } = renderHook(() =>
      useEnableNotification({
        source: NotificationPromptSource.NotificationsPage,
      }),
    );

    expect(notificationsPageResult.current.shouldShowCta).toBe(true);
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

  it('should hide CTA for NotificationsPage when its persistent flag is true', () => {
    dismissedStore = { [NotificationPromptSource.NotificationsPage]: true };

    const { result } = renderHook(() =>
      useEnableNotification({
        source: NotificationPromptSource.NotificationsPage,
      }),
    );

    expect(result.current.shouldShowCta).toBe(false);
  });
});
