import React from 'react';
import { render, screen } from '@testing-library/react';
import { AgentsLeaderboardEntrypointButton } from './AgentsLeaderboardEntrypointButton';
import { useAgentsLeaderboardEntrypoint } from '../../features/agents/leaderboard/useAgentsLeaderboardEntrypoint';

jest.mock(
  '../../features/agents/leaderboard/useAgentsLeaderboardEntrypoint',
  () => ({
    useAgentsLeaderboardEntrypoint: jest.fn(),
  }),
);

const mockUseAgentsLeaderboardEntrypoint =
  useAgentsLeaderboardEntrypoint as jest.Mock;

describe('AgentsLeaderboardEntrypointButton', () => {
  beforeEach(() => {
    mockUseAgentsLeaderboardEntrypoint.mockReturnValue({
      topEntity: null,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('links to the llms arena tab', () => {
    render(<AgentsLeaderboardEntrypointButton />);

    expect(
      screen.getByRole('link', { name: 'Open agents arena' }),
    ).toHaveAttribute('href', '/agents/arena?tab=llms');
  });
});
