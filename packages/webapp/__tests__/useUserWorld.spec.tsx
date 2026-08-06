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

jest.mock('../components/world/worldDevice', () => ({
  isHandheld: jest.fn(() => false),
}));

const request = gqlClient.request as jest.Mock;
const isHandheld = jest.requireMock('../components/world/worldDevice')
  .isHandheld as jest.Mock;

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
  >
    {children}
  </QueryClientProvider>
);

beforeEach(() => {
  request.mockReset();
  isHandheld.mockReturnValue(false);
});

const world = {
  userWorld: [
    {
      niche: { slug: 'ai_llm' },
      reads: 40,
      firstReadAt: '2024-01-01',
      lastReadAt: '2026-01-01',
      activeDays: 12,
    },
  ],
  userWorldSettings: null,
  // The timeline is a second query; this stub answers both.
  userWorldTimeline: [{ day: '2024-01-01', niche: 'ai_llm', reads: 3 }],
};

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

  it('still reports a real failure as one, after retrying it', async () => {
    jest.useFakeTimers();
    request.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useUserWorld('u1'), { wrapper });

    try {
      await waitFor(() => expect(result.current.error).toBeDefined(), {
        // Three retries on the default backoff before the failure is believed.
        timeout: 10000,
      });
    } finally {
      jest.useRealTimers();
    }
    expect(request).toHaveBeenCalledTimes(4);
    expect(result.current.isPrivate).toBe(false);
  });

  it('does not retry a refused world', async () => {
    request.mockRejectedValue({
      response: { errors: [{ extensions: { code: 'FORBIDDEN' } }] },
    });

    const { result } = renderHook(() => useUserWorld('u1'), { wrapper });

    await waitFor(() => expect(result.current.isPrivate).toBe(true));
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('asks for nothing without a reader', () => {
    renderHook(() => useUserWorld(undefined), { wrapper });

    expect(request).not.toHaveBeenCalled();
  });

  it('follows the world with its growth log', async () => {
    request.mockResolvedValue(world);

    const { result } = renderHook(() => useUserWorld('u1'), { wrapper });

    await waitFor(() =>
      expect(result.current.timeline).toEqual(world.userWorldTimeline),
    );
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('leaves the growth log on the server for a handheld', async () => {
    isHandheld.mockReturnValue(true);
    request.mockResolvedValue(world);

    const { result } = renderHook(() => useUserWorld('u1'), { wrapper });

    await waitFor(() => expect(result.current.districts).toBeDefined());
    // The log is years of one row a day, and the only thing that reads it is a
    // scrubber that is not on screen there.
    expect(request).toHaveBeenCalledTimes(1);
    expect(result.current.timeline).toBeUndefined();
    // A query that is never going to run must not be reported as one that is
    // about to: that flag holds the scrubber's place open.
    expect(result.current.isHistoryPending).toBe(false);
  });
});
