import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useShareCelebrations } from './useShareCelebrations';
import loggedUser from '../../__tests__/fixture/loggedUser';
import { AuthContextProvider } from '../contexts/AuthContext';
import type { FeaturesReadyContextValue } from '../components/GrowthBookProvider';
import {
  FeaturesReadyContext,
  GrowthBookProvider,
} from '../components/GrowthBookProvider';
import { BootApp } from '../lib/boot';

const client = new QueryClient();

const createWrapper = (features: Record<string, { defaultValue: boolean }>) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>
      <AuthContextProvider
        user={loggedUser}
        updateUser={jest.fn()}
        tokenRefreshed
        getRedirectUri={jest.fn()}
        loadingUser={false}
        loadedUserFromCache
        squads={[]}
      >
        <FeaturesReadyContext.Provider
          value={{ ready: true } as FeaturesReadyContextValue}
        >
          <GrowthBookProvider
            app={BootApp.Test}
            user={loggedUser}
            deviceId="123"
            experimentation={{ f: '{}', e: [], a: [], features }}
          >
            {children}
          </GrowthBookProvider>
        </FeaturesReadyContext.Provider>
      </AuthContextProvider>
    </QueryClientProvider>
  );

  return Wrapper;
};

describe('useShareCelebrations', () => {
  beforeEach(() => client.clear());

  it('is off when both flags are off', async () => {
    const { result } = renderHook(() => useShareCelebrations(), {
      wrapper: createWrapper({
        sharing_visibility: { defaultValue: false },
        share_celebrations: { defaultValue: false },
      }),
    });

    await waitFor(() => expect(result.current).toBe(false));
  });

  it('is off when only the per-topic flag is on', async () => {
    const { result } = renderHook(() => useShareCelebrations(), {
      wrapper: createWrapper({
        sharing_visibility: { defaultValue: false },
        share_celebrations: { defaultValue: true },
      }),
    });

    await waitFor(() => expect(result.current).toBe(false));
  });

  it('is off when only the master kill-switch is on', async () => {
    const { result } = renderHook(() => useShareCelebrations(), {
      wrapper: createWrapper({
        sharing_visibility: { defaultValue: true },
        share_celebrations: { defaultValue: false },
      }),
    });

    await waitFor(() => expect(result.current).toBe(false));
  });

  it('is on only when both flags are on', async () => {
    const { result } = renderHook(() => useShareCelebrations(), {
      wrapper: createWrapper({
        sharing_visibility: { defaultValue: true },
        share_celebrations: { defaultValue: true },
      }),
    });

    await waitFor(() => expect(result.current).toBe(true));
  });

  it('stays off when the surface opts out of evaluation', async () => {
    const { result } = renderHook(() => useShareCelebrations(false), {
      wrapper: createWrapper({
        sharing_visibility: { defaultValue: true },
        share_celebrations: { defaultValue: true },
      }),
    });

    await waitFor(() => expect(result.current).toBe(false));
  });
});
