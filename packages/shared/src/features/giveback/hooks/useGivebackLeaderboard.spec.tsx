import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React, { type ReactNode } from 'react';
import { useAuthContext } from '../../../contexts/AuthContext';
import { gqlClient } from '../../../graphql/common';
import { useGivebackLeaderboard } from './useGivebackLeaderboard';

jest.mock('../../../contexts/AuthContext');
jest.mock('../../../graphql/common', () => ({
  gqlClient: { request: jest.fn() },
}));

const mockAuth = useAuthContext as jest.MockedFunction<typeof useAuthContext>;
const mockRequest = jest.mocked(gqlClient.request);

const wrapper = ({ children }: { children: ReactNode }) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

beforeEach(() => {
  jest.clearAllMocks();
});

it('uses the API rankings and appends the current user outside the top results', async () => {
  mockAuth.mockReturnValue({
    isAuthReady: true,
    user: {
      id: 'viewer',
      name: 'Viewer',
      username: 'viewer',
      image: 'https://example.com/viewer.png',
    },
  } as unknown as ReturnType<typeof useAuthContext>);
  mockRequest.mockResolvedValue({
    contributionLeaderboard: {
      edges: [
        {
          node: {
            user: {
              id: 'first',
              name: 'First contributor',
              username: 'first',
              image: null,
            },
            points: 300,
            rank: 1,
          },
        },
      ],
    },
    contributionUserRank: { points: 120, rank: 7 },
  });

  const { result } = renderHook(() => useGivebackLeaderboard(), { wrapper });

  await waitFor(() => expect(result.current.leaderboard).toHaveLength(2));

  expect(result.current.leaderboard).toEqual([
    expect.objectContaining({
      id: 'first',
      rank: 1,
      contributionAmount: 300,
      isCurrentUser: false,
    }),
    expect.objectContaining({
      id: 'viewer',
      rank: 7,
      contributionAmount: 120,
      isCurrentUser: true,
    }),
  ]);
  expect(mockRequest).toHaveBeenCalledWith(expect.any(String), {
    first: 5,
    withViewerRank: true,
  });
});

it('loads public rankings without requesting an authenticated viewer rank', async () => {
  mockAuth.mockReturnValue({
    isAuthReady: true,
    user: null,
  } as unknown as ReturnType<typeof useAuthContext>);
  mockRequest.mockResolvedValue({
    contributionLeaderboard: {
      edges: [
        {
          node: {
            user: {
              id: 'first',
              name: null,
              username: 'first',
              image: null,
            },
            points: 300,
            rank: 1,
          },
        },
      ],
    },
  });

  const { result } = renderHook(() => useGivebackLeaderboard(), { wrapper });

  await waitFor(() => expect(result.current.leaderboard).toHaveLength(1));

  expect(result.current.leaderboard[0]).toEqual(
    expect.objectContaining({ name: 'first', isCurrentUser: false }),
  );
  expect(mockRequest).toHaveBeenCalledWith(expect.any(String), {
    first: 5,
    withViewerRank: false,
  });
});
