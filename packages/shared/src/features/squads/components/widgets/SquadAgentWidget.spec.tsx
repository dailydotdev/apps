import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import defaultUser from '../../../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import type { Squad } from '../../../../graphql/sources';
import { SourceMemberRole } from '../../../../graphql/sources';
import { SquadPageContextProvider } from '../../SquadPageContext';
import { SquadAgentWidget } from './SquadAgentWidget';

const makeSquad = ({
  verified = true,
  role = SourceMemberRole.Admin,
  seat = true,
}: {
  verified?: boolean;
  role?: SourceMemberRole;
  seat?: boolean;
} = {}): Squad =>
  ({
    id: 'squad1',
    handle: 'acme',
    name: 'Acme',
    features: { verified },
    currentMember: { role, seat, permissions: [] },
  }) as unknown as Squad;

const renderWidget = (squad: Squad) =>
  render(
    <TestBootProvider client={new QueryClient()} auth={{ user: defaultUser }}>
      <SquadPageContextProvider squad={squad} isViewerReady>
        <SquadAgentWidget />
      </SquadPageContextProvider>
    </TestBootProvider>,
  );

beforeEach(() => {
  localStorage.clear();
});

it('should show the agent setup to a seat holding admin of a verified squad', async () => {
  renderWidget(makeSquad());

  expect(
    await screen.findByText('Run Acme from your agent'),
  ).toBeInTheDocument();
  expect(screen.queryByText('Give yourself a seat')).not.toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: 'Get an API token' }),
  ).toHaveAttribute('href', expect.stringContaining('settings/api'));

  fireEvent.click(screen.getByRole('button', { name: 'Connect your agent' }));

  expect(
    await screen.findByText(
      'claude mcp add --transport http daily-dev https://api.daily.dev/mcp',
    ),
  ).toBeInTheDocument();
});

it('should point an admin without a seat to the plan', async () => {
  renderWidget(makeSquad({ seat: false }));

  expect(await screen.findByText('Give yourself a seat')).toHaveAttribute(
    'href',
    expect.stringContaining('acme'),
  );
});

it('should not show to a moderator without a seat', () => {
  renderWidget(makeSquad({ role: SourceMemberRole.Moderator, seat: false }));

  expect(
    screen.queryByText('Run Acme from your agent'),
  ).not.toBeInTheDocument();
});

it('should not show on a squad that is not verified', () => {
  renderWidget(makeSquad({ verified: false }));

  expect(
    screen.queryByText('Run Acme from your agent'),
  ).not.toBeInTheDocument();
});

it('should not show to a member', () => {
  renderWidget(makeSquad({ role: SourceMemberRole.Member }));

  expect(
    screen.queryByText('Run Acme from your agent'),
  ).not.toBeInTheDocument();
});
