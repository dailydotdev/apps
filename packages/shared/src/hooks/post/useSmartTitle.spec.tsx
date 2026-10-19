import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { useSmartTitle } from './useSmartTitle';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useToastNotification } from '../useToastNotification';
import { usePlusSubscription } from '../usePlusSubscription';
import { useActions } from '../useActions';
import { useTranslation } from '../translation/useTranslation';
import { gqlClient } from '../../graphql/common';
import post from '../../../__tests__/fixture/post';
import loggedUser from '../../../__tests__/fixture/loggedUser';

jest.mock('../../contexts/AuthContext', () => ({
  ...(jest.requireActual('../../contexts/AuthContext') as Iterable<unknown>),
  useAuthContext: jest.fn(),
}));

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: jest.fn(),
}));

jest.mock('../../contexts/SettingsContext', () => ({
  ...(jest.requireActual(
    '../../contexts/SettingsContext',
  ) as Iterable<unknown>),
  useSettingsContext: jest.fn(),
}));

jest.mock('../useToastNotification', () => ({
  useToastNotification: jest.fn(),
}));

jest.mock('../usePlusSubscription', () => ({
  usePlusSubscription: jest.fn(),
}));

jest.mock('../useActions', () => ({
  useActions: jest.fn(),
}));

jest.mock('../translation/useTranslation', () => ({
  ...(jest.requireActual('../translation/useTranslation') as Iterable<unknown>),
  useTranslation: jest.fn(),
}));

const smartTitle = 'A clearer title';

describe('useSmartTitle', () => {
  const displayToast = jest.fn();
  const updateUser = jest.fn();
  let client: QueryClient;
  let requestSpy: jest.SpyInstance;

  const wrapper = ({ children }: React.PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  const toggleTitle = (current: ReturnType<typeof useSmartTitle>) =>
    act(async () => {
      await current.fetchSmartTitle();
      await new Promise((resolve) => setTimeout(resolve));
    });

  const mockAuth = (isLoggedIn: boolean) =>
    jest.mocked(useAuthContext).mockReturnValue({
      user: isLoggedIn ? loggedUser : undefined,
      isLoggedIn,
      updateUser,
    } as unknown as ReturnType<typeof useAuthContext>);

  beforeEach(() => {
    client = new QueryClient();
    jest.clearAllMocks();
    requestSpy = jest.spyOn(gqlClient, 'request');

    mockAuth(true);
    jest.mocked(useToastNotification).mockReturnValue({
      displayToast,
    } as unknown as ReturnType<typeof useToastNotification>);
    jest.mocked(useLogContext).mockReturnValue({
      logEvent: jest.fn(),
    } as unknown as ReturnType<typeof useLogContext>);
    jest.mocked(useSettingsContext).mockReturnValue({
      flags: { clickbaitShieldEnabled: false },
    } as unknown as ReturnType<typeof useSettingsContext>);
    jest.mocked(usePlusSubscription).mockReturnValue({
      isPlus: false,
    } as ReturnType<typeof usePlusSubscription>);
    jest.mocked(useActions).mockReturnValue({
      completeAction: jest.fn(),
    } as unknown as ReturnType<typeof useActions>);
    jest.mocked(useTranslation).mockReturnValue({
      fetchTranslations: jest.fn().mockResolvedValue([]),
    });
  });

  afterEach(() => {
    requestSpy.mockRestore();
  });

  it('should not request or show an optimized title when logged out', async () => {
    mockAuth(false);
    const { result } = renderHook(() => useSmartTitle(post), { wrapper });

    await toggleTitle(result.current);

    expect(requestSpy).not.toHaveBeenCalled();
    expect(result.current.fetchedSmartTitle).toBe(false);
    expect(result.current.title).toBe(post.title);
  });

  it('should not show an optimized title when the request fails', async () => {
    requestSpy.mockRejectedValueOnce(new Error('failed'));
    const { result } = renderHook(() => useSmartTitle(post), { wrapper });

    await toggleTitle(result.current);

    expect(displayToast).toHaveBeenCalled();
    expect(updateUser).not.toHaveBeenCalled();
    expect(result.current.fetchedSmartTitle).toBe(false);
    expect(result.current.title).toBe(post.title);
  });

  it('should fetch and count the smart title once when toggling back and forth', async () => {
    requestSpy.mockResolvedValue({
      fetchSmartTitle: { title: smartTitle, translation: {} },
    });
    const { result } = renderHook(() => useSmartTitle(post), { wrapper });

    await toggleTitle(result.current);
    expect(result.current.title).toBe(smartTitle);

    await toggleTitle(result.current);
    expect(result.current.title).toBe(post.title);

    await toggleTitle(result.current);
    expect(result.current.title).toBe(smartTitle);

    expect(requestSpy).toHaveBeenCalledTimes(1);
    expect(updateUser).toHaveBeenCalledTimes(1);
  });
});
