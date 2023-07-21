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
import { SQUAD_MEMBERS_QUERY, SquadEdgesData } from '../../graphql/squads';

const onClickTest = jest.fn();
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
            action={
              !isMember
                ? {
                    text: 'Test action',
                    onClick: onClickTest,
                  }
                : undefined
            }
            link={
              isMember
                ? {
                    text: 'View squad',
                    href: squads[0].permalink,
                  }
                : undefined
            }
            members={admin.source.members}
            membersCount={hasMembers ? squads[0].membersCount : undefined}
          />
        </AuthContextProvider>
      </FeaturesContextProvider>
    </QueryClientProvider>,
  );
};

// Renders the source card with all basic props
it('should render the component with basic text and an icon', async () => {
  renderComponent(false, false);

  expect(screen.getByText('title')).toBeInTheDocument();
  expect(screen.getByText('icon')).toBeInTheDocument();
});

it('should render the component with an image', () => {
  renderComponent(true, false);
  const img = screen.getByRole('img');
  const icon = screen.queryByText('icon');

  expect(img).toHaveAttribute('src', 'test-image.jpg');
  expect(icon).not.toBeInTheDocument();
});

it('should render the component and call the onClick function when the action button is clicked', () => {
  renderComponent(false, false);

  const button = screen.getByText('Test action');

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
    const link = await screen.findByTestId('source-link');
    expect(link).toHaveAttribute('href', squads[0].permalink);
  });
});

// TODO: Complete this test
// it('should render the component with a join squad button', () => {
//   renderComponent(true, true);
// });
