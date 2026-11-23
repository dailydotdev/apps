import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import defaultUser from '../../../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import type { Squad } from '../../../../graphql/sources';
import { SourceMemberRole } from '../../../../graphql/sources';
import { SquadPageContextProvider } from '../../SquadPageContext';
import { openCompanySupportChat } from '../../../messages/graphql';
import { SquadSupportWidget } from './SquadSupportWidget';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('../../../messages/transport', () => ({
  ...jest.requireActual('../../../messages/transport'),
  isDmAvailable: true,
}));
jest.mock('../../../messages/graphql', () => ({
  ...jest.requireActual('../../../messages/graphql'),
  openCompanySupportChat: jest.fn(),
}));

const push = jest.fn();

const makeSquad = ({
  company = true,
  role = SourceMemberRole.Admin,
}: { company?: boolean; role?: SourceMemberRole } = {}): Squad =>
  ({
    id: 'squad1',
    handle: 'acme',
    name: 'Acme',
    features: {},
    flags: { company },
    currentMember: { role, permissions: [] },
  }) as unknown as Squad;

const renderWidget = (squad: Squad) =>
  render(
    <TestBootProvider client={new QueryClient()} auth={{ user: defaultUser }}>
      <SquadPageContextProvider squad={squad} isViewerReady>
        <SquadSupportWidget />
      </SquadPageContextProvider>
    </TestBootProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useRouter).mockReturnValue({ push } as never);
});

it('should open the support chat for an admin of a company page', async () => {
  jest.mocked(openCompanySupportChat).mockResolvedValue({
    id: 'c1',
    jid: 'c1@conference.chat.daily.dev',
    unreadCount: 0,
    lastMessageAt: null,
    createdAt: '2026-11-23T10:00:00Z',
    source: {
      id: 'squad1',
      name: 'Acme',
      handle: 'acme',
      image: '',
      permalink: '',
    },
    members: [],
  });
  renderWidget(makeSquad());

  fireEvent.click(await screen.findByRole('button', { name: 'Support' }));

  await waitFor(() =>
    expect(push).toHaveBeenCalledWith(
      expect.stringMatching(/\/messages\/support\/c1\?origin=company\+page$/),
    ),
  );
  expect(openCompanySupportChat).toHaveBeenCalledWith('squad1');
});

it('should not show to a moderator', () => {
  renderWidget(makeSquad({ role: SourceMemberRole.Moderator }));

  expect(
    screen.queryByRole('button', { name: 'Support' }),
  ).not.toBeInTheDocument();
});

it('should not show on a regular squad', () => {
  renderWidget(makeSquad({ company: false }));

  expect(
    screen.queryByRole('button', { name: 'Support' }),
  ).not.toBeInTheDocument();
});
