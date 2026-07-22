import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import React from 'react';
import nock from 'nock';
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
import { PaymentContextProvider } from '../../../contexts/payment';
import {
  CONTENT_PREFERENCE_STATUS_QUERY,
  ContentPreferenceType,
} from '../../../graphql/contentPreference';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import {
  featureSharingVisibility,
  featureShareSquadDirectory,
} from '../../../lib/featureManagement';

const squads = [generateTestSquad()];
const members = generateMembersList();
const admin = generateTestAdmin();
admin.source.members!.edges = members;
admin.source.membersCount = members.length;
const defaultSquad = generateTestSquad();

const createSourceMembersMock = (
  result = generateMembersResult(),
  variables: Record<string, unknown> = { id: defaultSquad.id, first: 5 },
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
        <PaymentContextProvider>
          <LazyModalElement />
          <SquadGrid source={admin.source} />
        </PaymentContextProvider>
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
    admin.source.members!.edges.length.toString(),
  );
});

it('should show the admin on top of the list', async () => {
  renderComponent();
  const membersList = await openedMembersModal();
  expect(membersList[0].node.user.name).toEqual('Eliz Kılıç');
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

  renderComponent();

  await waitFor(async () => {
    const button = await screen.findByTestId('squad-action');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Leave');
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
    await waitFor(() => expect(queryCalled).toBeTruthy());
  });
});

describe('squad directory share', () => {
  const mockContentPreference = () =>
    mockGraphQL({
      request: {
        query: CONTENT_PREFERENCE_STATUS_QUERY,
        variables: {
          id: admin.source.id,
          entity: ContentPreferenceType.Source,
        },
      },
      result: { data: { contentPreferenceStatus: null } },
    });

  const renderWithSharing = (enabled: boolean): RenderResult => {
    const gb = new GrowthBook();
    gb.setFeatures({
      [featureSharingVisibility.id]: { defaultValue: enabled },
      [featureShareSquadDirectory.id]: { defaultValue: enabled },
    });

    return render(
      <TestBootProvider
        client={new QueryClient()}
        auth={{ user: loggedUser, squads }}
        gb={gb}
      >
        <SquadGrid source={admin.source} />
      </TestBootProvider>,
    );
  };

  it('flag off: keeps the original full-width join button and no share control', async () => {
    mockContentPreference();
    renderWithSharing(false);

    const button = await screen.findByTestId('squad-action');
    expect(screen.queryByLabelText('Share Squad')).not.toBeInTheDocument();
    expect(button).toHaveClass('w-full');
    expect(button).not.toHaveClass('flex-1');
    // No wrapper row is added: the button stays a direct child of the
    // original column, with the exact original class list.
    expect(button.parentElement!.className).toBe(
      'flex flex-1 flex-col justify-between',
    );
  });

  it('flag on: narrows the join button and adds the copy-link control', async () => {
    mockContentPreference();
    renderWithSharing(true);

    const button = await screen.findByTestId('squad-action');
    expect(screen.getByLabelText('Share Squad')).toBeInTheDocument();
    expect(button).toHaveClass('flex-1');
    expect(button).not.toHaveClass('w-full');
    expect(button.parentElement!.className).toBe(
      'z-0 flex w-full flex-row items-center gap-2',
    );
  });

  it('flag on: joining the squad still works', async () => {
    const currentMember = { ...admin.source.currentMember };
    delete admin.source.currentMember;

    mockContentPreference();
    renderWithSharing(true);

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
      result: () => ({ data: { _: null } }),
    });

    const btn = await screen.findByText('Join Squad');
    btn.click();
    await waitForNock();
    await waitFor(() => expect(queryCalled).toBeTruthy());
  });
});
