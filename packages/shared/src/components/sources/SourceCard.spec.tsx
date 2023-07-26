import {
  fireEvent,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/preact';
import { QueryClient, QueryClientProvider } from 'react-query';
import React from 'react';
import nock from 'nock';
import { IFlags } from 'flagsmith';
import { NextRouter, useRouter } from 'next/router';
import { mocked } from 'ts-jest/utils';
import { AuthContextProvider } from '../../contexts/AuthContext';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import {
  generateMembersList,
  generateMembersResult,
  generateTestAdmin,
  generateTestSquad,
} from '../../../__tests__/fixture/squads';
import { FeaturesContextProvider } from '../../contexts/FeaturesContext';
import { SourceCard } from './SourceCard';
import { LazyModalElement } from '../modals/LazyModalElement';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '../../../__tests__/helpers/graphql';
import {
  SQUAD_JOIN_MUTATION,
  SQUAD_MEMBERS_QUERY,
  SquadEdgesData,
} from '../../graphql/squads';
import { waitForNock } from '../../../__tests__/helpers/utilities';
import { SourceType } from '../../graphql/sources';

const onClickTest = jest.fn();
const routerReplace = jest.fn();
let features: IFlags;
const defaultFeatures: IFlags = {
  squad: {
    enabled: true,
  },
};
const squads = [generateTestSquad()];
const members = generateMembersList();
const admin = generateTestAdmin();
admin.source.members.edges = members;
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
  const trigger = await screen.findByLabelText('Members list');
  trigger.click();
  await screen.findByText('Squad members');
  return members;
};

beforeEach(async () => {
  nock.cleanAll();
  jest.clearAllMocks();
  features = defaultFeatures;
});

const renderComponent = (
  hasImage = true,
  hasMembers = true,
  isMember = true,
): RenderResult => {
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
          <SourceCard
            title="title"
            subtitle="subtitle"
            icon={<div>icon</div>}
            image={hasImage ? 'test-image.jpg' : undefined}
            description="description"
            type={hasMembers ? SourceType.Squad : SourceType.Machine}
            id={admin.source.id}
            permalink={admin.source.permalink}
            handle={admin.source.handle}
            action={{
              type: isMember ? 'link' : 'action',
              text: isMember ? 'View squad' : 'Test action',
              onClick: isMember ? undefined : onClickTest,
              href: isMember ? squads[0].permalink : undefined,
            }}
            // action={
            //   !isMember
            //     ? {
            //         text: 'Test action',
            //         onClick: onClickTest,
            //       }
            //     : undefined
            // }
            // link={
            //   isMember
            //     ? {
            //         text: 'View squad',
            //         href: squads[0].permalink,
            //       }
            //     : undefined
            // }
            members={admin.source.members}
            membersCount={hasMembers ? squads[0].membersCount : undefined}
          />
        </AuthContextProvider>
      </FeaturesContextProvider>
    </QueryClientProvider>,
  );
};

// TODO: Fix this test
it('should render the component with basic text and an icon', async () => {
  renderComponent(false, false);

  expect(screen.getByText('title')).toBeInTheDocument();
  expect(screen.getByText('icon')).toBeInTheDocument();
});

it('should render the component with an image', () => {
  renderComponent(true, false);
  const img = screen.getByAltText('title source');
  const icon = screen.queryByText('icon');

  expect(img).toHaveAttribute('src', 'test-image.jpg');
  expect(icon).not.toBeInTheDocument();
});

it('should render the component and call the onClick function when the action button is clicked', async () => {
  renderComponent(false, false, false);

  const button = await screen.findByText('Test action');

  fireEvent.click(button);
  expect(onClickTest).toHaveBeenCalledTimes(1);
});

it('should render the component and member short list when members are provided', () => {
  renderComponent(true, true);

  const memberCount = screen.getByLabelText('squad-members-count');

  expect(memberCount).toBeInTheDocument();
  expect(memberCount.innerHTML).toEqual((members.length - 1).toString());
});

it('should show the admin on top of the list', async () => {
  renderComponent(true, true);
  const membersList = await openedMembersModal();
  expect(membersList[0].node.user.name).toEqual('Eliz Kılıç');
});

it('should render the component with a view squad button', async () => {
  renderComponent(true, true);

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
  renderComponent(true, true, false);
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

  const btn = await screen.findByText('Test action');
  btn.click();
  await waitForNock();
  await waitFor(async () => {
    expect(routerReplace).toBeCalledWith(admin.source.permalink);
    await waitFor(() => expect(queryCalled).toBeTruthy());
  });
});
