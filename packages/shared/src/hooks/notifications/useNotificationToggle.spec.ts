import { act, renderHook } from '@testing-library/react';
import { NotificationPromptSource } from '../../lib/log';
import { useNotificationToggle } from './useNotificationToggle';

const mockOnEnable = jest.fn();
const mockOnDismiss = jest.fn();
const mockShouldOpenPopup = jest.fn();
const mockShouldShowCta = jest.fn();

jest.mock('./useEnableNotification', () => ({
  useEnableNotification: () => ({
    shouldShowCta: mockShouldShowCta(),
    onEnable: mockOnEnable,
    onDismiss: mockOnDismiss,
  }),
}));

jest.mock('../../contexts/PushNotificationContext', () => ({
  usePushNotificationContext: () => ({
    shouldOpenPopup: () => mockShouldOpenPopup(),
  }),
}));

describe('useNotificationToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockShouldShowCta.mockReturnValue(true);
    mockShouldOpenPopup.mockReturnValue(false);
    mockOnEnable.mockResolvedValue(true);
  });

  const renderToggle = () =>
    renderHook(() =>
      useNotificationToggle({ source: NotificationPromptSource.NewComment }),
    );

  it('should ask for the permission when the toggle is left on', async () => {
    const { result } = renderToggle();
    await act(() => result.current.onSubmitted());

    expect(mockOnEnable).toHaveBeenCalled();
    expect(mockOnDismiss).not.toHaveBeenCalled();
  });

  it('should dismiss when the toggle is turned off', async () => {
    const { result } = renderToggle();
    act(() => result.current.onToggle());
    await act(() => result.current.onSubmitted());

    expect(mockOnEnable).not.toHaveBeenCalled();
    expect(mockOnDismiss).toHaveBeenCalled();
  });

  it('should dismiss instead of opening the popup when the browser blocked notifications', async () => {
    mockShouldOpenPopup.mockReturnValue(true);

    const { result } = renderToggle();
    await act(() => result.current.onSubmitted());

    expect(mockOnEnable).not.toHaveBeenCalled();
    expect(mockOnDismiss).toHaveBeenCalled();
  });

  it('should do nothing when the CTA is not due', async () => {
    mockShouldShowCta.mockReturnValue(false);

    const { result } = renderToggle();
    await act(() => result.current.onSubmitted());

    expect(mockOnEnable).not.toHaveBeenCalled();
    expect(mockOnDismiss).not.toHaveBeenCalled();
  });
});
