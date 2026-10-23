import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LfgMessagesPromo } from './LfgMessagesPromo';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useActions } from '../../../../hooks/useActions';
import { ActionType } from '../../../../graphql/actions';
import { useLfgEnabled } from '../../hooks/useLfgEnabled';
import { getMyLfgPost } from '../../graphql';
import type { LfgPost } from '../../types';

jest.mock('../../../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));
jest.mock('../../../../hooks/useActions', () => ({
  useActions: jest.fn(),
}));
jest.mock('../../hooks/useLfgEnabled', () => ({
  useLfgEnabled: jest.fn(),
}));
jest.mock('../../graphql', () => ({
  ...jest.requireActual('../../graphql'),
  getMyLfgPost: jest.fn(),
}));

const completeAction = jest.fn();

const renderPromo = () =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <LfgMessagesPromo />
    </QueryClientProvider>,
  );

const mockActions = (completed: ActionType[] = []) =>
  jest.mocked(useActions).mockReturnValue({
    checkHasCompleted: (type: ActionType) => completed.includes(type),
    completeAction,
    isActionsFetched: true,
  } as unknown as ReturnType<typeof useActions>);

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useAuthContext).mockReturnValue({
    user: { id: 'me' },
  } as ReturnType<typeof useAuthContext>);
  jest.mocked(useLfgEnabled).mockReturnValue({
    isEnabled: true,
    isGatedOut: false,
    isLaunched: true,
    isLaunchKnown: true,
  });
  jest.mocked(getMyLfgPost).mockResolvedValue(null);
  mockActions();
});

describe('LfgMessagesPromo', () => {
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

  it('records a dismissal so it stays gone', async () => {
    renderPromo();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Dismiss Looking for group' }),
    );

    expect(completeAction).toHaveBeenCalledWith(
      ActionType.DismissLfgMessagesPromo,
    );
  });

  it('stays hidden once dismissed', () => {
    mockActions([ActionType.DismissLfgMessagesPromo]);

    renderPromo();

    expect(screen.queryByText('Looking for group')).not.toBeInTheDocument();
    expect(getMyLfgPost).not.toHaveBeenCalled();
  });
});
