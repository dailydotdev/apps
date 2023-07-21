import { render, RenderResult, screen, waitFor } from '@testing-library/preact';
import { QueryClient, QueryClientProvider } from 'react-query';
import React from 'react';
import nock from 'nock';
import { IFlags } from 'flagsmith';
import { AuthContextProvider } from '../../contexts/AuthContext';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { generateTestSquad } from '../../../__tests__/fixture/squads';
import { FeaturesContextProvider } from '../../contexts/FeaturesContext';
import { SquadListingHeader } from './SquadListingHeader';
import { SquadsPublicWaitlist } from '../../lib/constants';
import { LazyModalElement } from '../modals/LazyModalElement';

let features: IFlags;

const defaultFeatures: IFlags = {
  squad: {
    enabled: true,
  },
};

beforeEach(async () => {
  nock.cleanAll();
  jest.clearAllMocks();
  features = defaultFeatures;
});

const squads = [generateTestSquad()];

const renderComponent = (isOwner = false): RenderResult => {
  const client = new QueryClient();

  return render(
    <QueryClientProvider client={client}>
      <FeaturesContextProvider flags={features}>
        <AuthContextProvider
          user={loggedUser}
          updateUser={jest.fn()}
          tokenRefreshed
          getRedirectUri={jest.fn()}
          loadingUser={false}
          loadedUserFromCache
          squads={squads}
        >
          <LazyModalElement />
          <SquadListingHeader isOwner={isOwner} />
        </AuthContextProvider>
      </FeaturesContextProvider>
    </QueryClientProvider>,
  );
};

it('should render the component as a squad user', async () => {
  renderComponent();

  const btn = await screen.findByText('Create new squad');
  btn.click();

  await waitFor(() => {
    expect(screen.getByText('Squads early access!')).toBeInTheDocument();
  });
});

it('should render the component and have a link to join waitlist when squad owner', async () => {
  renderComponent(true);

  await waitFor(async () => {
    const link = await screen.findByTestId('squad-directory-join-waitlist');
    expect(link).toHaveAttribute('href', SquadsPublicWaitlist);
  });
});
