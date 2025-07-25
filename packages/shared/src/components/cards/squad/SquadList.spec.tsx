import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import nock from 'nock';
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
import { SquadList } from './SquadList';
import type { Squad } from '../../../graphql/sources';
import {
  CONTENT_PREFERENCE_STATUS_QUERY,
  ContentPreferenceType,
} from '../../../graphql/contentPreference';

const squadsList = [generateTestSquad()];
const members = generateMembersList();
const admin = generateTestAdmin();
admin.source.members.edges = members;
admin.source.membersCount = members.length;

beforeEach(async () => {
  nock.cleanAll();
  jest.clearAllMocks();
});

interface RenderComponent {
  shouldShowCount?: boolean;
  squads?: Squad[];
}

const renderComponent = ({
  shouldShowCount,
  squads = squadsList,
}: RenderComponent = {}): RenderResult => {
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
        <SquadList squad={admin.source} shouldShowCount={shouldShowCount} />
      </AuthContextProvider>
    </QueryClientProvider>,
  );
};

it('should render the component with basic props', async () => {
  renderComponent();

  expect(screen.getByText('Test')).toBeInTheDocument();
  expect(screen.getByText('@test')).toBeInTheDocument();
  const img = `${admin.source.name} source`;
  expect(screen.getByAltText(img)).toBeInTheDocument();
});

it('should render the component and member count when members are provided', () => {
  renderComponent();

  const memberCount = screen.getByTestId('squad-members-count');
  const { length } = admin.source.members.edges;

  expect(memberCount).toBeInTheDocument();
  expect(memberCount.innerHTML).toEqual(`${length} members`);
});

it('should render the component with a view squad button', async () => {
  mockGraphQL({
    request: {
      query: CONTENT_PREFERENCE_STATUS_QUERY,
      variables: { id: admin.source.id, entity: ContentPreferenceType.Source },
    },
    result: {
      data: { contentPreferenceStatus: null },
    },
  });

  renderComponent({ squads: squadsList.concat(admin.source) });

  await waitFor(async () => {
    const button = await screen.findByTestId('squad-action');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Leave Squad');
  });
});

it('should render the component with a join squad button', async () => {
  const currentMember = { ...admin.source.currentMember };
  delete admin.source.currentMember;

  mockGraphQL({
    request: {
      query: CONTENT_PREFERENCE_STATUS_QUERY,
      variables: { id: admin.source.id, entity: ContentPreferenceType.Source },
    },
    result: {
      data: { contentPreferenceStatus: null },
    },
  });

  renderComponent({ squads: [] });

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

  const btn = await screen.findByText('Join');
  btn.click();
  await waitForNock();
  await waitFor(async () => {
    await waitFor(() => expect(queryCalled).toBeTruthy());
  });
});
