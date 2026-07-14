import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { GivebackLeaderboard } from './GivebackLeaderboard';
import { useGivebackLeaderboard } from '../hooks/useGivebackLeaderboard';

jest.mock('../hooks/useGivebackLeaderboard');

const mockLeaderboard = jest.mocked(useGivebackLeaderboard);

beforeEach(() => {
  mockLeaderboard.mockReturnValue({
    leaderboard: [
      {
        id: 'first',
        rank: 1,
        name: 'First contributor',
        image: 'https://example.com/first.png',
        contributionAmount: 300,
        currency: 'USD',
      },
      {
        id: 'viewer',
        rank: 7,
        name: 'Viewer',
        image: 'https://example.com/viewer.png',
        contributionAmount: 120,
        currency: 'USD',
        isCurrentUser: true,
      },
    ],
    isPending: false,
  });
});

it('does not claim the viewer is first when the row above is outside the page', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <GivebackLeaderboard onTakeAction={jest.fn()} />
    </QueryClientProvider>,
  );

  expect(screen.getByText('Your rank')).toBeInTheDocument();
  expect(screen.queryByText(/hold the crown/i)).not.toBeInTheDocument();
});
