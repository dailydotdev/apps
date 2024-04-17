import {
  fireEvent,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import nock from 'nock';
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
import { SourceCard, SourceCardBorderColor } from './SourceCard';
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
import { cloudinary } from '../../lib/image';
import { ActionType, COMPLETE_ACTION_MUTATION } from '../../graphql/actions';

const onClickTest = jest.fn();
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
  const trigger = await screen.findByLabelText('Members list');
  trigger.click();
  await screen.findByText('Squad members');
  return members;
};

beforeEach(async () => {
  nock.cleanAll();
  jest.clearAllMocks();
});

const renderComponent = (
  isMember = false,
  customStyle = false,
  setSource = false,
  setMembers = true,
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
        <SourceCard
          title="title"
          subtitle="subtitle"
          icon={<div>icon</div>}
          action={{
            type: isMember ? 'link' : 'action',
            text: isMember ? 'View squad' : 'Test action',
            onClick: isMember ? undefined : onClickTest,
            href: isMember ? squads[0].permalink : undefined,
          }}
          banner={customStyle ? 'banner-image.jpg' : undefined}
          borderColor={customStyle ? SourceCardBorderColor.Onion : undefined}
          source={
            setSource && {
              ...admin.source,
              currentMember: setMembers ? admin.source.currentMember : null,
              members: {
                ...admin.source.members,
                edges: setMembers ? admin.source.members.edges : [],
              },
            }
          }
          // source={
          //   hasMembers && {
          //     ...admin.source,
          //     image: 'test-image.jpg',
          //     membersCount: hasMembers ? squads[0].membersCount : undefined,
          //   }
          // }
        />
      </AuthContextProvider>
    </QueryClientProvider>,
  );
};

it('should render the component with basic props', async () => {
  renderComponent();
  const element = screen.getByRole('article');
  const img = screen.getByAltText('Banner image for source');

  expect(screen.getByText('title')).toBeInTheDocument();
  expect(screen.getByText('icon')).toBeInTheDocument();
  expect(element).toHaveClass('!border-accent-avocado-default');
  expect(img).toHaveAttribute(
    'src',
    cloudinary.squads.directory.cardBannerDefault,
  );
});

it('should render the component with basic props and custom border and banner', async () => {
  renderComponent(false, true, false);
  const element = screen.getByRole('article');
  const img = screen.getByAltText('Banner image for source');

  expect(screen.getByText('title')).toBeInTheDocument();
  expect(screen.getByText('icon')).toBeInTheDocument();
  expect(element).toHaveClass('!border-accent-onion-default');
  expect(img).toHaveAttribute('src', 'banner-image.jpg');
});

it('should render the component and call the onClick function when the action button is clicked', async () => {
  renderComponent();

  const button = await screen.findByText('Test action');

  fireEvent.click(button);
  expect(onClickTest).toHaveBeenCalledTimes(1);
});

it('should render the component with an image', () => {
  renderComponent(false, false, true);
  const img = screen.getByAltText('title source');
  const icon = screen.queryByText('icon');

  expect(img).toHaveAttribute('src', admin.source.image);
  expect(icon).not.toBeInTheDocument();
});

it('should render the component and member short list when members are provided', () => {
  renderComponent(false, false, true);

  const memberCount = screen.getByLabelText('squad-members-count');

  expect(memberCount).toBeInTheDocument();
  expect(memberCount.innerHTML).toEqual(
    admin.source.members.edges.length.toString(),
  );
});

it('should show the admin on top of the list', async () => {
  renderComponent(false, false, true);
  const membersList = await openedMembersModal();
  expect(membersList[0].node.user.name).toEqual('Eliz Kılıç');
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
  renderComponent(false, true, true, false);
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
