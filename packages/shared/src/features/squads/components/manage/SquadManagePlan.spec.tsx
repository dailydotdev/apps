import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import defaultUser from '../../../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import { mockDesktop } from '../../../../../__tests__/helpers/media';
import {
  completeActionMock,
  mockGraphQL,
} from '../../../../../__tests__/helpers/graphql';
import { ActionType } from '../../../../graphql/actions';
import type { Squad } from '../../../../graphql/sources';
import { SourceMemberRole } from '../../../../graphql/sources';
import type { SquadSubscription } from '../../../../graphql/squadSubscription';
import {
  CHANGE_SQUAD_PLAN_MUTATION,
  SQUAD_PLAN_CHANGE_PREVIEW_QUERY,
  squadSeatMembersQueryOptions,
  squadSubscriptionBalanceQueryOptions,
  squadSubscriptionQueryOptions,
} from '../../../../graphql/squadSubscription';
import { SOURCE_REFERRAL_URL_QUERY } from '../../../../graphql/squads';
import { SquadPageContextProvider } from '../../SquadPageContext';
import { SquadManagePlan } from './SquadManagePlan';
import { PromptElement } from '../../../../components/modals/Prompt';

const squad = {
  id: 'squad1',
  handle: 'acme',
  name: 'Acme',
  currentMember: { role: SourceMemberRole.Admin, seat: true },
} as unknown as Squad;

const renderPlan = (
  subscription: SquadSubscription,
  currentSquad: Squad = squad,
) => {
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
      <SquadPageContextProvider squad={currentSquad} isViewerReady>
        <SquadManagePlan />
        <PromptElement />
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

  const team = {
    plan: 'team',
    status: 'active',
    seatLimit: 5,
    seatsUsed: 1,
    ownerId: 'payer',
  } as unknown as SquadSubscription;

  it('offers the invite link to an admin with a seat', async () => {
    const link = 'https://dly.to/invite';
    mockGraphQL({
      request: {
        query: SOURCE_REFERRAL_URL_QUERY,
        variables: { id: squad.id },
      },
      result: { data: { source: { referralUrl: link } } },
    });
    mockGraphQL(completeActionMock({ action: ActionType.SquadInvite }));
    Object.assign(navigator, { clipboard: { writeText: jest.fn() } });
    renderPlan(team);

    fireEvent.click(await screen.findByText('Copy invite link'));

    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(link),
    );
  });

  it('hides the invite link from an admin without a seat', async () => {
    renderPlan(team, {
      ...squad,
      currentMember: { role: SourceMemberRole.Admin, seat: false },
    } as unknown as Squad);

    expect(await screen.findByText('Seats')).toBeInTheDocument();
    expect(screen.queryByText('Copy invite link')).not.toBeInTheDocument();
  });

  describe('plan switch', () => {
    const starter = {
      plan: 'starter',
      status: 'active',
      seatLimit: 1,
      seatsUsed: 1,
      ownerId: defaultUser.id,
      cashbackPercentage: 100,
      cashbackPromoEndsAt: null,
      renewsAt: '2026-12-04T10:00:00.000Z',
      scheduledPlan: null,
      downgradeAvailableAt: null,
    } as unknown as SquadSubscription;

    it('upgrades after showing the charge and the top-up', async () => {
      mockGraphQL({
        request: {
          query: SQUAD_PLAN_CHANGE_PREVIEW_QUERY,
          variables: { sourceId: squad.id, plan: 'team' },
        },
        result: {
          data: {
            squadPlanChangePreview: {
              dueNow: '$103.47',
              renewal: '$199.00',
              creditsTopUp: 34900,
            },
          },
        },
      });
      let changed = false;
      mockGraphQL({
        request: {
          query: CHANGE_SQUAD_PLAN_MUTATION,
          variables: { sourceId: squad.id, plan: 'team' },
        },
        result: () => {
          changed = true;
          return { data: { changeSquadPlan: { _: true } } };
        },
      });
      renderPlan(starter);

      fireEvent.click(await screen.findByText('Switch to Team'));

      expect(
        await screen.findByText(/Today you pay \$103.47/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/We add \$349 to your wallet now/),
      ).toBeInTheDocument();
      const [, confirm] = screen.getAllByRole('button', {
        name: 'Switch to Team',
      });
      fireEvent.click(confirm);

      await waitFor(() => expect(changed).toBe(true));
    });

    it('holds a downgrade until the first renewal after an upgrade', async () => {
      renderPlan({
        ...starter,
        plan: 'team',
        seatLimit: 5,
        downgradeAvailableAt: '2026-12-04T10:00:00.000Z',
      } as unknown as SquadSubscription);

      expect(
        await screen.findByText(/after your first Team renewal/),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Switch to Starter' }),
      ).toBeDisabled();
    });
  });
});
