import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import defaultUser from '../../../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import type { Squad } from '../../../../graphql/sources';
import { SourceMemberRole } from '../../../../graphql/sources';
import type { SquadIntelSettings } from '../../../../graphql/squadIntel';
import { squadIntelSettingsQueryOptions } from '../../../../graphql/squadIntel';
import type { SquadSubscription } from '../../../../graphql/squadSubscription';
import { squadSubscriptionQueryOptions } from '../../../../graphql/squadSubscription';
import { Origin } from '../../../../lib/log';
import { oauthConsentsQueryOptions } from '../../../../lib/oauthApps';
import { SquadPlan } from '../../lib/plans';
import { StartupsSetup, StartupsSetupPath } from './StartupsSetup';

const getSquad = (seat: boolean) =>
  ({
    id: 'squad1',
    handle: 'acme',
    name: 'Acme',
    currentMember: { role: SourceMemberRole.Admin, seat },
  }) as unknown as Squad;

const renderSetup = ({
  seat,
  settings,
  plan = SquadPlan.Starter,
  subscription,
  onEditRow = jest.fn(),
  isAgentSignedIn = false,
}: {
  seat: boolean;
  settings?: SquadIntelSettings;
  plan?: SquadPlan;
  subscription?: SquadSubscription;
  onEditRow?: jest.Mock;
  isAgentSignedIn?: boolean;
}) => {
  const client = new QueryClient();

  client.setQueryData(
    oauthConsentsQueryOptions().queryKey,
    isAgentSignedIn
      ? [
          {
            id: 'c1',
            clientId: 'claude-code',
            scopes: ['read', 'write'],
            createdAt: '2026-11-08T11:03:00.000Z',
            client: null,
            isClientDisabled: false,
          },
        ]
      : [],
  );

  if (subscription) {
    client.setQueryData(
      squadSubscriptionQueryOptions({ user: defaultUser, sourceId: 'squad1' })
        .queryKey,
      subscription,
    );
  }

  if (settings) {
    client.setQueryData(
      squadIntelSettingsQueryOptions({ user: defaultUser, sourceId: 'squad1' })
        .queryKey,
      settings,
    );
  }

  render(
    <TestBootProvider client={client} auth={{ user: defaultUser }}>
      <StartupsSetup
        squad={getSquad(seat)}
        plan={plan}
        origin={Origin.StartupsCheckout}
        initialPath={StartupsSetupPath.Manual}
        onEditRow={onEditRow}
      />
    </TestBootProvider>,
  );

  return { onEditRow };
};

const limits = { tags: 5, seniority: false, regions: false };
const nextIntelAt = '2026-11-09T00:00:00.000Z';

describe('StartupsSetup weekly intel row', () => {
  it('opens the intel settings in place for a paid seat', async () => {
    const { onEditRow } = renderSetup({
      seat: true,
      settings: { selection: null, limits, nextIntelAt },
    });

    expect(await screen.findByText('0 of 4 done')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Pick topics' }));

    expect(onEditRow).toHaveBeenCalledWith('intel');
  });

  it('counts the intel as done once it has topics', async () => {
    renderSetup({
      seat: true,
      settings: {
        selection: { tags: ['react'], seniority: null, regions: null },
        limits,
        nextIntelAt,
      },
    });

    expect(await screen.findByText('1 of 4 done')).toBeInTheDocument();
  });

  it('leaves the intel out of the count without a seat', async () => {
    renderSetup({ seat: false });

    expect(await screen.findByText('0 of 3 done')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Pick topics' }),
    ).not.toBeInTheDocument();
  });
});

describe('StartupsSetup team seats row', () => {
  it("doesn't count the seats for a founder who is the only seat", async () => {
    renderSetup({
      seat: true,
      settings: { selection: null, limits, nextIntelAt },
      plan: SquadPlan.Team,
      subscription: {
        plan: SquadPlan.Team,
        status: 'active',
        seatLimit: 5,
        seatsUsed: 1,
        ownerId: defaultUser.id,
        cashbackPercentage: 200,
        cashbackPromoEndsAt: null,
      },
    });

    expect(await screen.findByText('0 of 5 done')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Give seats' }),
    ).toBeInTheDocument();
  });
});

describe('StartupsSetup agent row', () => {
  const getAgentRow = () =>
    screen.getByText('Connect your agent').closest('li') as HTMLElement;

  it('ticks once an agent has signed in to daily.dev', async () => {
    renderSetup({ seat: false, isAgentSignedIn: true });

    expect(await screen.findByText('0 of 3 done')).toBeInTheDocument();
    expect(getAgentRow().querySelector('svg')).toBeInTheDocument();
  });

  it('stays open until an agent signs in', async () => {
    renderSetup({ seat: false });

    expect(await screen.findByText('0 of 3 done')).toBeInTheDocument();
    expect(getAgentRow().querySelector('svg')).not.toBeInTheDocument();
  });
});
