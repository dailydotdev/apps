import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import nock from 'nock';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { mocked } from 'ts-jest/utils';
import { AuthContextProvider } from '../../../contexts/AuthContext';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import {
  generateMembersList,
  generateMembersResult,
  generateTestAdmin,
  generateTestSquad,
} from '../../../../__tests__/fixture/squads';
import { SquadGrid } from './SquadGrid';
import { LazyModalElement } from '../../modals/LazyModalElement';
import type { MockedGraphQLResponse } from '../../../../__tests__/helpers/graphql';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';
import type { SquadEdgesData } from '../../../graphql/squads';
import {
  SQUAD_JOIN_MUTATION,
  SQUAD_MEMBERS_QUERY,
} from '../../../graphql/squads';
import { waitForNock } from '../../../../__tests__/helpers/utilities';
import { cloudinarySquadsDirectoryCardBannerDefault } from '../../../lib/image';
import { ActionType, COMPLETE_ACTION_MUTATION } from '../../../graphql/actions';

const routerReplace = jest.fn();
const squads = [generateTestSquad()];
const members = generateMembersList();
const admin = generateTestAdmin();
admin.source.members.edges = members;
admin.source.membersCount = members.length;
const defaultSquad = generateTestSquad();

const createSourceMembersMock = (
  result = generateMembersResult(),
  variables: unknown = { id: defaultSquad.id, first: 5 },
): MockedGraphQLResponse<SquadEdgesData> => ({
  request: { query: SQUAD_MEMBERS_QUERY, variables },
  result: { data: result },
});

const openedMembersModal = async () => {
  const result = generateMembersResult(members);
  mockGraphQL(
    createSourceMembersMock(result, { id: defaultSquad.id, role: null }),
  );
  const membersCount = result.sourceMembers.edges.length;
  const trigger = await screen.findByLabelText(
    `View ${membersCount} squad members`,
  );
  trigger.click();
  await screen.findByText('Squad members');
  return members;
};

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
        <SquadGrid source={admin.source} />
      </AuthContextProvider>
    </QueryClientProvider>,
  );
};

it('should render the component with basic props', async () => {
  renderComponent();
  const element = screen.getByRole('article');
  const banner = screen.getByAltText('Banner image for source');
  const avatar = screen.getByAltText(`${admin.source.name} source`);

  expect(screen.getByText(admin.source.name)).toBeInTheDocument();
  expect(element).toHaveClass('!border-accent-avocado-default');
  expect(avatar).toHaveAttribute('src', admin.source.image);
  expect(banner).toHaveAttribute(
    'src',
    cloudinarySquadsDirectoryCardBannerDefault,
  );
});

it('should render the component with basic props with border and banner', async () => {
  renderComponent();
  admin.source.color = '!border-accent-avocado-default';
  const element = screen.getByRole('article');

  expect(screen.getByText(admin.source.name)).toBeInTheDocument();
  expect(element).toHaveClass(admin.source.color);
});

it('should render the component with an image', () => {
  renderComponent();
  const avatar = screen.getByAltText(`${admin.source.name} source`);

  expect(screen.getByText(admin.source.name)).toBeInTheDocument();
  expect(avatar).toHaveAttribute('src', admin.source.image);
});

it('should render the component and member short list when members are provided', async () => {
  renderComponent();

  const { membersCount } = admin.source;
  const memberCount = await screen.findByLabelText(
    `View ${membersCount} squad members`,
  );
  expect(memberCount).toHaveTextContent(
    admin.source.members.edges.length.toString(),
  );
});

it('should show the admin on top of the list', async () => {
  renderComponent();
  const membersList = await openedMembersModal();
  expect(membersList[0].node.user.name).toEqual('Eliz Kılıç');
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

  const btn = await screen.findByText('Join Squad');
  btn.click();
  await waitForNock();
  await waitFor(async () => {
    expect(routerReplace).toBeCalledWith(admin.source.permalink);
    await waitFor(() => expect(queryCalled).toBeTruthy());
  });
});
