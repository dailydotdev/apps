import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import defaultUser from '../../../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import { mockDesktop } from '../../../../../__tests__/helpers/media';
import type { Squad } from '../../../../graphql/sources';
import { SourceMemberRole } from '../../../../graphql/sources';
import type { SquadSubscription } from '../../../../graphql/squadSubscription';
import {
  squadSeatMembersQueryOptions,
  squadSubscriptionBalanceQueryOptions,
  squadSubscriptionQueryOptions,
} from '../../../../graphql/squadSubscription';
import { SquadPageContextProvider } from '../../SquadPageContext';
import { SquadManagePlan } from './SquadManagePlan';

const squad = {
  id: 'squad1',
  handle: 'acme',
  name: 'Acme',
  currentMember: { role: SourceMemberRole.Admin, seat: true },
} as unknown as Squad;

const renderPlan = (subscription: SquadSubscription) => {
  const client = new QueryClient();
  const options = { user: defaultUser, sourceId: squad.id };
  client.setQueryData(
    squadSubscriptionQueryOptions(options).queryKey,
    subscription,
  );
  client.setQueryData(
    squadSubscriptionBalanceQueryOptions(options).queryKey,
    0,
  );
  client.setQueryData(squadSeatMembersQueryOptions(options).queryKey, []);

  render(
    <TestBootProvider client={client} auth={{ user: defaultUser }}>
      <SquadPageContextProvider squad={squad} isViewerReady>
        <SquadManagePlan />
      </SquadPageContextProvider>
    </TestBootProvider>,
  );
};

beforeEach(() => {
  mockDesktop();
});

describe('SquadManagePlan', () => {
  it('shows an Enterprise contract without a price or billing', async () => {
    renderPlan({
      plan: 'enterprise',
      status: 'active',
      seatLimit: 5,
      seatsUsed: 1,
      ownerId: defaultUser.id,
    } as unknown as SquadSubscription);

    expect(await screen.findByText('Enterprise')).toBeInTheDocument();
    expect(
      screen.getByText('Billed through your daily.dev contract.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Manage billing')).not.toBeInTheDocument();
  });
});
