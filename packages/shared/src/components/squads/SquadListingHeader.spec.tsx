import { render, RenderResult, screen } from '@testing-library/preact';
import { QueryClient, QueryClientProvider } from 'react-query';
import React from 'react';
import nock from 'nock';
import { IFlags } from 'flagsmith';
import { AuthContextProvider } from '../../contexts/AuthContext';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { generateTestSquad } from '../../../__tests__/fixture/squads';
import { FeaturesContextProvider } from '../../contexts/FeaturesContext';
import { SquadListingHeader } from './SquadListingHeader';

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
          <SquadListingHeader isOwner={isOwner} />
        </AuthContextProvider>
      </FeaturesContextProvider>
    </QueryClientProvider>,
  );
};

it('should render the component as a squad user', async () => {
  renderComponent();
  const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

  const btn = await screen.findByText('Create new squad');
  btn.click();

  expect(alertMock).toHaveBeenCalledWith('Create new squad...');
  alertMock.mockRestore();
});

it('should render the component as a squad owner', async () => {
  renderComponent(true);
  const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

  const btn = await screen.findByText('Join waitlist');
  btn.click();

  expect(alertMock).toHaveBeenCalledWith('Join waitlist...');
  alertMock.mockRestore();
});
