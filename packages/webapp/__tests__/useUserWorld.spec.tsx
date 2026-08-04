import React from 'react';
import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { useUserWorld } from '../components/world/useUserWorld';

jest.mock('@dailydotdev/shared/src/graphql/common', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/graphql/common'),
  gqlClient: { request: jest.fn() },
}));

const request = gqlClient.request as jest.Mock;

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
  >
    {children}
  </QueryClientProvider>
);

beforeEach(() => {
  request.mockReset();
});

describe('useUserWorld', () => {
  it('raises the world and its dressing off one round trip', async () => {
    const districts = [
      {
        niche: { slug: 'ai_llm' },
        reads: 40,
        firstReadAt: '2024-01-01',
        lastReadAt: '2026-01-01',
        activeDays: 12,
      },
    ];
    const settings = {
      name: 'The quiet scholar',
      sky: null,
      crest: null,
      look: null,
      private: false,
    };
    request.mockResolvedValue({
      userWorld: districts,
      userWorldSettings: settings,
      // The timeline is a second query; this stub answers both.
      userWorldTimeline: [],
    });

    const { result } = renderHook(() => useUserWorld('u1'), { wrapper });

    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.districts).toEqual(districts);
    expect(result.current.settings).toEqual(settings);
    expect(result.current.isPrivate).toBe(false);
  });

  it('reads a refused world as private rather than as broken', async () => {
    request.mockRejectedValue({
      response: { errors: [{ extensions: { code: 'FORBIDDEN' } }] },
    });

    const { result } = renderHook(() => useUserWorld('u1'), { wrapper });

    await waitFor(() => expect(result.current.isPrivate).toBe(true));
    // A hidden world is not a failed one: "could not be loaded" would be a lie
    // about a decision somebody made deliberately.
    expect(result.current.error).toBeUndefined();
    expect(result.current.districts).toBeUndefined();
  });

  it('still reports a real failure as one', async () => {
    request.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useUserWorld('u1'), { wrapper });

    await waitFor(() => expect(result.current.error).toBeDefined());
    expect(result.current.isPrivate).toBe(false);
  });

  it('asks for nothing without a reader', () => {
    renderHook(() => useUserWorld(undefined), { wrapper });

    expect(request).not.toHaveBeenCalled();
  });
});
