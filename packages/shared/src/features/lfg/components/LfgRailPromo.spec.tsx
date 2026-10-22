import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LfgRailPromo } from './LfgRailPromo';
import { useAuthContext } from '../../../contexts/AuthContext';
import { Origin } from '../../../lib/log';
import { useLfgEnabled } from '../hooks/useLfgEnabled';
import { getMyLfgPost } from '../graphql';
import type { LfgPost } from '../types';

jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));
jest.mock('../hooks/useLfgEnabled', () => ({
  useLfgEnabled: jest.fn(),
}));
jest.mock('../graphql', () => ({
  ...jest.requireActual('../graphql'),
  getMyLfgPost: jest.fn(),
}));

const renderPromo = () =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <LfgRailPromo origin={Origin.ArticlePage} />
    </QueryClientProvider>,
  );

const mockLfgEnabled = (isEnabled: boolean) =>
  jest.mocked(useLfgEnabled).mockReturnValue({
    isEnabled,
    isGatedOut: !isEnabled,
    isLaunched: isEnabled,
    isLaunchKnown: isEnabled,
  });

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useAuthContext).mockReturnValue({
    user: { id: 'me' },
  } as ReturnType<typeof useAuthContext>);
  mockLfgEnabled(true);
  jest.mocked(getMyLfgPost).mockResolvedValue(null);
});

describe('LfgRailPromo', () => {
  it('sends someone without a post to the board', async () => {
    renderPromo();

    const link = await screen.findByRole('link', {
      name: 'Find your people',
    });
    expect(link).toHaveAttribute('href', expect.stringMatching(/\/lfg$/));
  });

  it('stays hidden for someone who already has a post', async () => {
    jest.mocked(getMyLfgPost).mockResolvedValue({ id: 'post-1' } as LfgPost);

    renderPromo();

    await waitFor(() => expect(getMyLfgPost).toHaveBeenCalled());
    expect(screen.queryByText('Looking for group')).not.toBeInTheDocument();
  });

  it('stays hidden outside the Looking for group rollout', () => {
    mockLfgEnabled(false);

    renderPromo();

    expect(screen.queryByText('Looking for group')).not.toBeInTheDocument();
    expect(getMyLfgPost).not.toHaveBeenCalled();
  });
});
