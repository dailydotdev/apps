import { renderHook } from '@testing-library/react';
import { NotificationPromptSource } from '../../lib/log';
import { useEnableNotification } from './useEnableNotification';

const mockLogDismiss = jest.fn();
const mockLogClick = jest.fn();
const mockSetIsDismissed = jest.fn();
const mockOnEnablePush = jest.fn();
const mockShouldOpenPopup = jest.fn();

jest.mock('../../contexts/PushNotificationContext', () => ({
  usePushNotificationContext: () => ({
    isInitialized: true,
    isPushSupported: true,
    isSubscribed: false,
    shouldOpenPopup: () => mockShouldOpenPopup(),
  }),
}));

jest.mock('./usePushNotificationMutation', () => ({
  usePushNotificationMutation: () => ({
    hasPermissionCache: false,
    acceptedJustNow: false,
    onEnablePush: mockOnEnablePush,
  }),
}));

jest.mock('../usePersistentContext', () => ({
  __esModule: true,
  default: () => [false, mockSetIsDismissed, true],
}));

jest.mock('./useNotificationCtaAnalytics', () => ({
  useNotificationCtaAnalytics: () => ({
    logClick: mockLogClick,
    logDismiss: mockLogDismiss,
  }),
  useNotificationCtaImpression: jest.fn(),
}));

describe('useEnableNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockShouldOpenPopup.mockReturnValue(false);
  });

  const renderEnable = () =>
    renderHook(() =>
      useEnableNotification({ source: NotificationPromptSource.NewComment }),
    );

  it('should treat a refused permission as a dismissal', async () => {
    mockOnEnablePush.mockResolvedValue(false);

    const { result } = renderEnable();
    await result.current.onEnable();

    expect(mockSetIsDismissed).toHaveBeenCalledWith(true);
    expect(mockLogDismiss).toHaveBeenCalledWith(
      expect.objectContaining({ extra: { reason: 'permission_refused' } }),
    );
  });

  it('should keep the CTA when the permission popup takes over', async () => {
    mockShouldOpenPopup.mockReturnValue(true);
    mockOnEnablePush.mockResolvedValue(false);

    const { result } = renderEnable();
    await result.current.onEnable();

    expect(mockSetIsDismissed).not.toHaveBeenCalled();
  });

  it('should not dismiss once the permission is granted', async () => {
    mockOnEnablePush.mockResolvedValue(true);

    const { result } = renderEnable();
    await result.current.onEnable();

    expect(mockSetIsDismissed).not.toHaveBeenCalled();
  });
});
