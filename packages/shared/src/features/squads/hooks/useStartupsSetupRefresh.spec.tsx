import type { ReactNode } from 'react';
import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import defaultUser from '../../../../__tests__/fixture/loggedUser';
import { AuthContextProvider } from '../../../contexts/AuthContext';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import {
  STARTUPS_SETUP_REFRESH_MS,
  useStartupsSetupRefresh,
} from './useStartupsSetupRefresh';

const squad = { id: 'squad1', handle: 'acme' };

const setup = (enabled = true) => {
  const client = new QueryClient();
  const invalidate = jest.spyOn(client, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <AuthContextProvider
        user={defaultUser}
        updateUser={jest.fn()}
        tokenRefreshed
        getRedirectUri={jest.fn()}
        loadingUser={false}
        loadedUserFromCache
      >
        {children}
      </AuthContextProvider>
    </QueryClientProvider>
  );
  const { unmount } = renderHook(
    () => useStartupsSetupRefresh({ squad, enabled }),
    {
      wrapper,
    },
  );
  const refetchedKeys = () =>
    invalidate.mock.calls.map(([filters]) => filters?.queryKey);

  return { unmount, invalidate, refetchedKeys };
};

describe('useStartupsSetupRefresh', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('refetches the page, plan, seats, intel settings and agent sign-ins every 30 seconds', () => {
    const { refetchedKeys } = setup();
    expect(refetchedKeys()).toHaveLength(0);

    act(() => {
      jest.advanceTimersByTime(STARTUPS_SETUP_REFRESH_MS);
    });

    expect(refetchedKeys()).toEqual([
      generateQueryKey(RequestKey.Squad, defaultUser, 'acme'),
      generateQueryKey(RequestKey.SquadSubscription, defaultUser, 'squad1'),
      generateQueryKey(RequestKey.SquadSeats, defaultUser, 'squad1'),
      generateQueryKey(
        RequestKey.SquadIntel,
        defaultUser,
        'squad1',
        'settings',
      ),
      generateQueryKey(RequestKey.OAuthConsents),
      generateQueryKey(RequestKey.PersonalAccessTokens),
    ]);
  });

  it('refetches when the window gets focus back', () => {
    const { invalidate } = setup();

    act(() => {
      window.dispatchEvent(new Event('focus'));
    });

    expect(invalidate).toHaveBeenCalledTimes(6);
  });

  it('stops when disabled or unmounted', () => {
    const disabled = setup(false);
    act(() => {
      window.dispatchEvent(new Event('focus'));
      jest.advanceTimersByTime(STARTUPS_SETUP_REFRESH_MS);
    });
    expect(disabled.invalidate).not.toHaveBeenCalled();

    const mounted = setup();
    mounted.unmount();
    act(() => {
      jest.advanceTimersByTime(STARTUPS_SETUP_REFRESH_MS);
    });
    expect(mounted.invalidate).not.toHaveBeenCalled();
  });
});
