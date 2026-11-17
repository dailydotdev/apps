import React from 'react';
import nock from 'nock';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import defaultUser from '../../../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../../../__tests__/helpers/graphql';
import type { Squad, SourceFeatures } from '../../../../graphql/sources';
import { SourceMemberRole } from '../../../../graphql/sources';
import { UPDATE_SQUAD_SETTINGS_MUTATION } from '../../../../graphql/squads';
import { SquadPageContextProvider } from '../../SquadPageContext';
import { SquadEnterpriseSettings } from './SquadEnterpriseSettings';

const renderSettings = (features: Partial<SourceFeatures>) => {
  const squad = {
    id: 'squad1',
    handle: 'acme',
    name: 'Acme',
    features,
    currentMember: { role: SourceMemberRole.Admin },
  } as unknown as Squad;

  render(
    <TestBootProvider client={new QueryClient()} auth={{ user: defaultUser }}>
      <SquadPageContextProvider squad={squad} isViewerReady>
        <SquadEnterpriseSettings />
      </SquadPageContextProvider>
    </TestBootProvider>,
  );
};

beforeEach(() => {
  nock.cleanAll();
});

describe('SquadEnterpriseSettings', () => {
  it('shows both settings locked to Enterprise when the plan has neither', () => {
    renderSettings({ products: true });

    expect(screen.queryAllByRole('switch')).toHaveLength(0);
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    expect(screen.getByText('Verified badge')).toBeInTheDocument();
    expect(screen.getByText('Ad-free')).toBeInTheDocument();
    expect(screen.getAllByText('Enterprise').length).toBeGreaterThan(1);
  });

  it('hides the verified badge when its switch is turned off', async () => {
    let saved = false;
    mockGraphQL({
      request: {
        query: UPDATE_SQUAD_SETTINGS_MUTATION,
        variables: { sourceId: 'squad1', showVerifiedBadge: false },
      },
      result: () => {
        saved = true;
        return {
          data: {
            updateSquadSettings: {
              id: 'squad1',
              features: { showVerifiedBadge: false, hideAds: true },
            },
          },
        };
      },
    });
    renderSettings({ verified: true, adFree: true });

    const badge = screen.getByLabelText('Verified badge');
    expect(badge).toBeChecked();
    expect(screen.getByLabelText('Ad-free')).toBeChecked();

    fireEvent.click(badge);

    await waitFor(() => expect(saved).toBe(true));
  });

  it('turns ads back on for an ad-free squad', async () => {
    let saved = false;
    mockGraphQL({
      request: {
        query: UPDATE_SQUAD_SETTINGS_MUTATION,
        variables: { sourceId: 'squad1', hideAds: false },
      },
      result: () => {
        saved = true;
        return {
          data: {
            updateSquadSettings: {
              id: 'squad1',
              features: { showVerifiedBadge: true, hideAds: false },
            },
          },
        };
      },
    });
    renderSettings({ verified: true, adFree: true, hideAds: true });

    fireEvent.click(screen.getByLabelText('Ad-free'));

    await waitFor(() => expect(saved).toBe(true));
  });
});
