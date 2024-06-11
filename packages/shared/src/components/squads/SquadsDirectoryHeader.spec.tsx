import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import nock from 'nock';
import { NextRouter, useRouter } from 'next/router';
import { mocked } from 'ts-jest/utils';
import { AuthContextProvider } from '../../contexts/AuthContext';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { generateTestSquad } from '../../../__tests__/fixture/squads';
import { SquadsDirectoryHeader } from '.';
import { LazyModalElement } from '../modals/LazyModalElement';
import { Origin } from '../../lib/log';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import { COMPLETED_USER_ACTIONS } from '../../graphql/actions';

const routerReplace = jest.fn();

beforeEach(async () => {
  mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/squads',
        push: routerReplace,
      } as unknown as NextRouter),
  );
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
  renderComponent();

  const btn = await screen.findByTestId('squad-directory-join-waitlist');
  btn.click();

  await waitFor(() => {
    expect(routerReplace).toBeCalledWith(
      `/squads/new?origin=${Origin.SquadDirectory}`,
    );
  });
});

it('should render the component and have a link to new suqad when squad owner', async () => {
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

  const btn = await screen.findByTestId('squad-directory-join-waitlist');
  btn.click();

  await waitFor(() => {
    expect(routerReplace).toBeCalledWith(
      `/squads/new?origin=${Origin.SquadDirectory}`,
    );
  });
});
