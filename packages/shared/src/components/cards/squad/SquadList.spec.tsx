import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import { NextRouter, useRouter } from 'next/router';
import nock from 'nock';
import React from 'react';
import { mocked } from 'ts-jest/utils';

import loggedUser from '../../../../__tests__/fixture/loggedUser';
import {
  generateMembersList,
  generateTestAdmin,
  generateTestSquad,
} from '../../../../__tests__/fixture/squads';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';
import { waitForNock } from '../../../../__tests__/helpers/utilities';
import { AuthContextProvider } from '../../../contexts/AuthContext';
import { ActionType, COMPLETE_ACTION_MUTATION } from '../../../graphql/actions';
import { SQUAD_JOIN_MUTATION } from '../../../graphql/squads';
import { LazyModalElement } from '../../modals/LazyModalElement';
import { SquadList } from './SquadList';

const onClickTest = jest.fn();
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

const renderComponent = (
  isMember = false,
  setSource = false,
  setMembers = true,
  setImage = false,
  otherProps = {},
): RenderResult => {
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
        <SquadList
          action={{
            type: isMember ? 'link' : 'action',
            text: isMember ? 'View squad' : 'Test action',
            onClick: isMember ? undefined : onClickTest,
            href: isMember ? squads[0].permalink : undefined,
          }}
          squad={
            setSource && {
              ...admin.source,
              image: setImage ? admin.source.image : undefined,
              currentMember: setMembers ? admin.source.currentMember : null,
              members: {
                ...admin.source.members,
                edges: setMembers ? admin.source.members.edges : [],
              },
            }
          }
          icon={<div>icon</div>}
          {...otherProps}
        />
      </AuthContextProvider>
    </QueryClientProvider>,
  );
};

it('should render the component with basic props', async () => {
  renderComponent(false, true, false);

  expect(screen.getByText('Test')).toBeInTheDocument();
  expect(screen.getByText('icon')).toBeInTheDocument();
  expect(screen.getByText('@test')).toBeInTheDocument();
});

it('should render the component and call the onClick function when the action button is clicked', async () => {
  renderComponent();

  const button = await screen.findByText('Test action');

  fireEvent.click(button);
  expect(onClickTest).toHaveBeenCalledTimes(1);
});

it('should render the component with an image', () => {
  renderComponent(false, true, true, true);
  const img = screen.getByAltText('Test source');
  const icon = screen.queryByText('icon');

  expect(img).toHaveAttribute('src', admin.source.image);
  expect(icon).not.toBeInTheDocument();
});

it('should render the component and member count when members are provided and is not user squad', () => {
  renderComponent(false, true, true);

  const memberCount = screen.getByTestId('squad-members-count');

  expect(memberCount).toBeInTheDocument();
  expect(memberCount.innerHTML).toEqual(
    admin.source.members.edges.length.toString(),
  );
});

it('should NOT render the component and member count when members are provided and is user squad', () => {
  renderComponent(false, true, true, true, { isUserSquad: true });

  const memberCount = screen.queryByTestId('squad-members-count');

  expect(memberCount).not.toBeInTheDocument();
});

it('should render the component with a arrow and no action button', async () => {
  renderComponent(true, true, true, true, { isUserSquad: true });

  const link = screen.queryByTestId('source-action');
  const arrow = screen.queryByTestId('squad-list-arrow-icon');
  expect(link).not.toBeInTheDocument();
  expect(arrow).toBeInTheDocument();
});

it('should render the component with a view squad button', async () => {
  renderComponent(true);

  await waitFor(async () => {
    const link = await screen.findByTestId('source-action');
    expect(link).toHaveAttribute('href', squads[0].permalink);
  });
});

it('should render the component with a join squad button', async () => {
  mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/squads',
        push: routerReplace,
      } as unknown as NextRouter),
  );
  renderComponent(false, true, false);
  let queryCalled = false;
  mockGraphQL({
    request: {
      query: SQUAD_JOIN_MUTATION,
      variables: { sourceId: admin.source.id },
    },
    result: () => {
      queryCalled = true;
      return { data: { source: admin.source } };
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
