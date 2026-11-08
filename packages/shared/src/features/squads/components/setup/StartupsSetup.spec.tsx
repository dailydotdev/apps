import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import defaultUser from '../../../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import type { Squad } from '../../../../graphql/sources';
import { SourceMemberRole } from '../../../../graphql/sources';
import type { SquadIntelSettings } from '../../../../graphql/squadIntel';
import { squadIntelSettingsQueryOptions } from '../../../../graphql/squadIntel';
import { Origin } from '../../../../lib/log';
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
  onEditRow = jest.fn(),
}: {
  seat: boolean;
  settings?: SquadIntelSettings;
  onEditRow?: jest.Mock;
}) => {
  const client = new QueryClient();

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
        plan={SquadPlan.Starter}
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
