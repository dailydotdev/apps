import React from 'react';
import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { gqlClient } from '../../../graphql/common';
import type { PublicProfile } from '../../../lib/user';
import { useUserStack } from './useUserStack';

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

describe('the profile showcase', () => {
  it('loads the stack slice in one round trip', async () => {
    request.mockResolvedValue(showcase);

    const { result } = renderHook(() => useUserStack(user), { wrapper });

    await waitFor(() => expect(result.current.stackItems).toHaveLength(1));
    expect(result.current.stackItems[0].id).toBe('s1');
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('asks for nothing without a reader', () => {
    renderHook(() => useUserStack(null), { wrapper });

    expect(request).not.toHaveBeenCalled();
  });
});
