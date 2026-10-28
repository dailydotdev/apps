import type { ReactNode } from 'react';
import React from 'react';
import { act, renderHook } from '@testing-library/react';
import {
  PUSH_PERMISSION_TIMEOUT_MS,
  useReadingReminder,
} from './useReadingReminder';
import type { NotificationPromptSource } from '../../lib/log';
import AuthContext from '../../contexts/AuthContext';
import type { AuthContextData } from '../../contexts/AuthContext';

const mockOnEnablePush = jest.fn<
  Promise<boolean>,
  [NotificationPromptSource]
>();

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: jest.fn() }),
}));
jest.mock('../../hooks/notifications/usePushNotificationMutation', () => ({
  usePushNotificationMutation: () => ({ onEnablePush: mockOnEnablePush }),
}));
jest.mock('../../hooks/usePersonalizedDigest', () => ({
  usePersonalizedDigest: () => ({ subscribePersonalizedDigest: jest.fn() }),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthContext.Provider
    value={{ user: { timezone: 'UTC' } } as unknown as AuthContextData}
  >
    {children}
  </AuthContext.Provider>
);

const renderReminder = () => {
  const onClickNext = jest.fn();
  const { result } = renderHook(() => useReadingReminder({ onClickNext }), {
    wrapper,
  });

  return { result, onClickNext };
};

describe('useReadingReminder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('moves on once the push prompt is answered', async () => {
    mockOnEnablePush.mockResolvedValue(true);
    const { result, onClickNext } = renderReminder();

    await act(() => result.current.onSubmit());

    expect(onClickNext).toHaveBeenCalledTimes(1);
    expect(result.current.loading).toBe(false);
  });

  it('moves on when enabling push fails', async () => {
    mockOnEnablePush.mockRejectedValue(new Error('push failed'));
    const { result, onClickNext } = renderReminder();

    await act(() => result.current.onSubmit());

    expect(onClickNext).toHaveBeenCalledTimes(1);
    expect(result.current.loading).toBe(false);
  });

  it('moves on when the push prompt never settles', async () => {
    mockOnEnablePush.mockReturnValue(new Promise(() => undefined));
    const { result, onClickNext } = renderReminder();

    let submitted: Promise<void>;
    act(() => {
      submitted = result.current.onSubmit();
    });
    expect(onClickNext).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(PUSH_PERMISSION_TIMEOUT_MS);
      await submitted;
    });

    expect(onClickNext).toHaveBeenCalledTimes(1);
    expect(result.current.loading).toBe(false);
  });
});
