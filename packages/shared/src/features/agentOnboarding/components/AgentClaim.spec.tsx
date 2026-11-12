import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import type { LoggedUser } from '../../../lib/user';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { AgentClaim } from './AgentClaim';

jest.mock('../../../components/auth/AuthOptions', () => ({
  __esModule: true,
  default: ({
    onSuccessfulRegistration,
  }: {
    onSuccessfulRegistration: () => void;
  }) => (
    <button type="button" onClick={onSuccessfulRegistration}>
      Sign up
    </button>
  ),
}));

const fetchMock = jest.fn();
const pendingClaim = {
  status: 'pending',
  userCode: 'K7Q-2MX',
  client: 'claude-code',
};

const jsonResponse = (body: unknown, ok = true) => ({
  ok,
  json: () => Promise.resolve(body),
});

const mockApi = (claim: unknown = pendingClaim) =>
  fetchMock.mockImplementation((_url: string, init?: RequestInit) =>
    Promise.resolve(
      jsonResponse(init?.method === 'POST' ? { status: 'claimed' } : claim),
    ),
  );

const getClaimCalls = () =>
  fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST');

const renderClaim = (user?: LoggedUser) => {
  const client = new QueryClient();
  const tree = (current?: LoggedUser) => (
    <TestBootProvider client={client} auth={{ user: current }}>
      <AgentClaim code="abc" />
    </TestBootProvider>
  );
  const view = render(tree(user));

  return { rerender: (next?: LoggedUser) => view.rerender(tree(next)) };
};

beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock;
});

describe('AgentClaim', () => {
  it('grants nothing to a logged in user before they confirm', async () => {
    mockApi();
    renderClaim({ ...loggedUser, infoConfirmed: true });

    const connect = await screen.findByRole('button', { name: 'Connect' });
    expect(screen.getByText('K7Q-2MX')).toBeInTheDocument();
    expect(getClaimCalls()).toHaveLength(0);

    await userEvent.click(connect);

    expect(await screen.findByText("You're all set")).toBeInTheDocument();
    expect(getClaimCalls()).toHaveLength(1);
  });

  it('claims for a new account once its profile is complete', async () => {
    mockApi();
    const { rerender } = renderClaim();

    await userEvent.click(
      await screen.findByRole('button', { name: 'Sign up' }),
    );
    rerender({ ...loggedUser, infoConfirmed: false });
    expect(getClaimCalls()).toHaveLength(0);

    rerender({ ...loggedUser, infoConfirmed: true });

    expect(await screen.findByText("You're all set")).toBeInTheDocument();
    expect(getClaimCalls()).toHaveLength(1);
  });

  it('shows why a claim was refused', async () => {
    fetchMock.mockImplementation((_url: string, init?: RequestInit) =>
      Promise.resolve(
        init?.method === 'POST'
          ? jsonResponse(
              { error: 'token_limit', message: 'Revoke a token first.' },
              false,
            )
          : jsonResponse(pendingClaim),
      ),
    );
    renderClaim({ ...loggedUser, infoConfirmed: true });

    await userEvent.click(
      await screen.findByRole('button', { name: 'Connect' }),
    );

    expect(
      await screen.findByText('Revoke a token first.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Manage API tokens' }),
    ).toBeInTheDocument();
  });

  it('asks for a new link when the code has expired', async () => {
    mockApi({ status: 'expired' });
    renderClaim();

    await waitFor(() =>
      expect(screen.getByText('This link has expired')).toBeInTheDocument(),
    );
  });
});
