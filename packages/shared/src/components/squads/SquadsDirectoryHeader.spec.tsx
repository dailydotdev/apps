import { render, RenderResult, screen, waitFor } from '@testing-library/preact';
import { QueryClient, QueryClientProvider } from 'react-query';
import React from 'react';
import nock from 'nock';
import { NextRouter, useRouter } from 'next/router';
import { mocked } from 'ts-jest/utils';
import { AuthContextProvider } from '../../contexts/AuthContext';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { generateTestSquad } from '../../../__tests__/fixture/squads';
import { SquadsDirectoryHeader } from '.';
import { squadsPublicWaitlist } from '../../lib/constants';
import { LazyModalElement } from '../modals/LazyModalElement';
import { Origin } from '../../lib/analytics';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import { COMPLETED_USER_ACTIONS } from '../../graphql/actions';

const routerReplace = jest.fn();

beforeEach(async () => {
  nock.cleanAll();
  jest.clearAllMocks();
});

const squads = [generateTestSquad()];

const renderComponent = (): RenderResult => {
  const client = new QueryClient();

  return render(
    <QueryClientProvider client={client}>
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
        <SquadsDirectoryHeader />
      </AuthContextProvider>
    </QueryClientProvider>,
  );
};

it('should render the component as a squad user', async () => {
  mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/squads',
        push: routerReplace,
      } as unknown as NextRouter),
  );
  renderComponent();

  const btn = await screen.findByTestId('squad-directory-join-waitlist');
  btn.click();

  await waitFor(() => {
    expect(routerReplace).toBeCalledWith(
      `/squads/new?origin=${Origin.SquadDirectory}`,
    );
  });
});

it('should render the component and have a link to join waitlist when squad owner', async () => {
  mockGraphQL({
    request: {
      query: COMPLETED_USER_ACTIONS,
    },
    result: {
      data: {
        actions: [
          {
            type: 'create_squad',
            completedAt: '2023-07-27T10:01:08.459Z',
          },
        ],
      },
    },
  });

  renderComponent();

  await waitFor(async () => {
    const link = await screen.findByTestId('squad-directory-join-waitlist');
    expect(link).toHaveAttribute('href', squadsPublicWaitlist);
  });
});
