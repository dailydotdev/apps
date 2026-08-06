import React from 'react';
import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { gqlClient } from '../../../graphql/common';
import type { PublicProfile } from '../../../lib/user';
import { useUserStack } from './useUserStack';
import { useHotTakes } from './useHotTakes';
import { useUserWorkspacePhotos } from './useUserWorkspacePhotos';
import { useGear } from './useGear';

jest.mock('../../../graphql/common', () => ({
  ...jest.requireActual('../../../graphql/common'),
  gqlClient: { request: jest.fn() },
}));

jest.mock('../../../hooks/profile/useProfilePreview', () => ({
  useProfilePreview: () => ({ isOwner: false }),
}));

jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: null }),
}));

jest.mock('../../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: jest.fn() }),
}));

const request = gqlClient.request as jest.Mock;

const user = { id: 'u1' } as PublicProfile;

const connection = <T,>(nodes: T[]) => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: { hasNextPage: false, endCursor: null },
});

const showcase = {
  userStack: connection([{ id: 's1', section: 'editor', position: 0 }]),
  hotTakes: connection([{ id: 'h1', title: 'Tabs' }]),
  userWorkspacePhotos: connection([{ id: 'p1', image: 'a.png' }]),
  gear: connection([{ id: 'g1', position: 0 }]),
};

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

describe('the profile showcase sections', () => {
  it('take one round trip between the four of them', async () => {
    request.mockResolvedValue(showcase);

    const { result } = renderHook(
      () => ({
        stack: useUserStack(user),
        hotTakes: useHotTakes(user),
        photos: useUserWorkspacePhotos(user),
        gear: useGear(user),
      }),
      { wrapper },
    );

    await waitFor(() =>
      expect(result.current.stack.stackItems).toHaveLength(1),
    );

    // The whole point: four sections that used to be four requests.
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('each hand back only their own slice', async () => {
    request.mockResolvedValue(showcase);

    const { result } = renderHook(
      () => ({
        stack: useUserStack(user),
        hotTakes: useHotTakes(user),
        photos: useUserWorkspacePhotos(user),
        gear: useGear(user),
      }),
      { wrapper },
    );

    await waitFor(() =>
      expect(result.current.stack.stackItems).toHaveLength(1),
    );
    expect(result.current.stack.stackItems[0].id).toBe('s1');
    expect(result.current.hotTakes.hotTakes[0].id).toBe('h1');
    expect(result.current.photos.photos[0].id).toBe('p1');
    expect(result.current.gear.gearItems[0].id).toBe('g1');
  });

  it('ask for nothing without a reader', () => {
    renderHook(() => useUserStack(null), { wrapper });

    expect(request).not.toHaveBeenCalled();
  });
});
