import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import nock from 'nock';
import { NextRouter, useRouter } from 'next/router';
import { mocked } from 'ts-jest/utils';
import { AuthContextProvider } from '../../../contexts/AuthContext';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import {
  generateMembersList,
  generateTestAdmin,
  generateTestSquad,
} from '../../../../__tests__/fixture/squads';
import { LazyModalElement } from '../../modals/LazyModalElement';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';
import { SQUAD_JOIN_MUTATION } from '../../../graphql/squads';
import { waitForNock } from '../../../../__tests__/helpers/utilities';
import { ActionType, COMPLETE_ACTION_MUTATION } from '../../../graphql/actions';
import { UnfeaturedSquadGrid } from './UnfeaturedSquadGrid';

const routerReplace = jest.fn();
const squads = [generateTestSquad()];
const members = generateMembersList();
const admin = generateTestAdmin();
admin.source.members.edges = members;
admin.source.membersCount = members.length;

beforeEach(async () => {
  nock.cleanAll();
  jest.clearAllMocks();
});

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
        <UnfeaturedSquadGrid source={admin.source} />
      </AuthContextProvider>
    </QueryClientProvider>,
  );
};

it('should render the component with basic props', async () => {
  renderComponent();

  expect(screen.getByText(admin.source.name)).toBeInTheDocument();
});

it('should render the component with an image', () => {
  renderComponent();
  const img = screen.getByAltText(`${admin.source.name} source`);

  expect(img).toHaveAttribute('src', admin.source.image);
});

it('should render the component and member count when members are provided', () => {
  renderComponent();

  const memberCount = screen.getByTestId('squad-members-count');
  const { length } = admin.source.members.edges;

  expect(memberCount).toBeInTheDocument();
  expect(memberCount.innerHTML).toEqual(`${length} members`);
});

it('should render the component with a view squad button', async () => {
  renderComponent();

  await waitFor(async () => {
    const link = await screen.findByTestId('squad-action');
    expect(link).toHaveAttribute('href', admin.source.permalink);
  });
});

it('should render the component with a join squad button', async () => {
  const currentMember = { ...admin.source.currentMember };
  delete admin.source.currentMember;
  mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/squads',
        push: routerReplace,
      } as unknown as NextRouter),
  );
  renderComponent();
  let queryCalled = false;
  mockGraphQL({
    request: {
      query: SQUAD_JOIN_MUTATION,
      variables: { sourceId: admin.source.id },
    },
    result: () => {
      queryCalled = true;
      return { data: { source: { ...admin.source, currentMember } } };
    },
  });

  mockGraphQL({
    request: {
      query: COMPLETE_ACTION_MUTATION,
      variables: { type: ActionType.JoinSquad },
    },
    result: () => {
      return { data: { _: null } };
    },
  });

  const btn = await screen.findByText('Test action');
  btn.click();
  await waitForNock();
  await waitFor(async () => {
    expect(routerReplace).toBeCalledWith(admin.source.permalink);
    await waitFor(() => expect(queryCalled).toBeTruthy());
  });
});
