import { act, renderHook } from '@testing-library/react';
import { useRefreshToken } from './useRefreshToken';
import type { AccessToken } from '../lib/boot';
import { ONE_MINUTE } from '../lib/time';

const TOKEN_LIFETIME = ONE_MINUTE * 15;

const createToken = (token: string): AccessToken => ({
  token,
  expiresIn: new Date(Date.now() + TOKEN_LIFETIME).toISOString(),
});

describe('useRefreshToken', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should refresh two minutes before the token expires', () => {
    const refresh = jest.fn().mockResolvedValue(undefined);
    renderHook(() => useRefreshToken(createToken('a'), refresh));

    act(() => {
      jest.advanceTimersByTime(ONE_MINUTE * 13 - 1);
    });
    expect(refresh).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('should keep refreshing every token it receives', () => {
    const refresh = jest.fn().mockResolvedValue(undefined);
    const { rerender } = renderHook(
      ({ accessToken }) => useRefreshToken(accessToken, refresh),
      { initialProps: { accessToken: createToken('a') } },
    );

    act(() => {
      jest.advanceTimersByTime(ONE_MINUTE * 13);
    });
    expect(refresh).toHaveBeenCalledTimes(1);

    rerender({ accessToken: createToken('b') });
    act(() => {
      jest.advanceTimersByTime(ONE_MINUTE * 13);
    });
    expect(refresh).toHaveBeenCalledTimes(2);

    rerender({ accessToken: createToken('c') });
    act(() => {
      jest.advanceTimersByTime(ONE_MINUTE * 13);
    });
    expect(refresh).toHaveBeenCalledTimes(3);
  });

  it('should wait at least a minute between refreshes of short-lived tokens', () => {
    const refresh = jest.fn().mockResolvedValue(undefined);
    const expired = (token: string): AccessToken => ({
      token,
      expiresIn: new Date(Date.now() - ONE_MINUTE).toISOString(),
    });
    const { rerender } = renderHook(
      ({ accessToken }) => useRefreshToken(accessToken, refresh),
      { initialProps: { accessToken: expired('a') } },
    );

    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(refresh).toHaveBeenCalledTimes(1);

    rerender({ accessToken: expired('b') });
    act(() => {
      jest.advanceTimersByTime(ONE_MINUTE - 1);
    });
    expect(refresh).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(refresh).toHaveBeenCalledTimes(2);
  });
});
