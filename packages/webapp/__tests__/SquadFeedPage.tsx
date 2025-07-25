import type { FeedData } from '@dailydotdev/shared/src/graphql/posts';
import {
  SOURCE_FEED_QUERY,
  supportedTypesForPrivateSources,
} from '@dailydotdev/shared/src/graphql/feed';
import nock from 'nock';
import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import type { NextRouter } from 'next/router';
import ad from '@dailydotdev/shared/__tests__/fixture/ad';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import defaultFeedPage from '@dailydotdev/shared/__tests__/fixture/feed';
import type {
  GraphQLResult,
  MockedGraphQLResponse,
} from '@dailydotdev/shared/__tests__/helpers/graphql';
import { mockGraphQL } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { waitForNock } from '@dailydotdev/shared/__tests__/helpers/utilities';
import {
  generateBasicMembersResult,
  generateForbiddenSquadResult,
  generateMembersList,
  generateMembersResult,
  generateNotFoundSquadResult,
  generateTestSquad,
} from '@dailydotdev/shared/__tests__/fixture/squads';
import type {
  BasicSourceMembersData,
  SquadData,
  SquadEdgesData,
} from '@dailydotdev/shared/src/graphql/squads';
import {
  BASIC_SQUAD_MEMBERS_QUERY,
  SQUAD_MEMBERS_QUERY,
  SQUAD_QUERY,
} from '@dailydotdev/shared/src/graphql/squads';
import type { Squad } from '@dailydotdev/shared/src/graphql/sources';
import {
  SourceMemberRole,
  SourcePermissions,
} from '@dailydotdev/shared/src/graphql/sources';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import {
  ActionType,
  COMPLETE_ACTION_MUTATION,
} from '@dailydotdev/shared/src/graphql/actions';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import { InteractiveFeedProvider } from '@dailydotdev/shared/src/contexts/InteractiveFeedContext';
import {
  CONTENT_PREFERENCE_STATUS_QUERY,
  ContentPreferenceType,
} from '@dailydotdev/shared/src/graphql/contentPreference';
import SquadPage from '../pages/squads/[handle]';

const defaultSquad: Squad = {
  ...generateTestSquad(),
  public: false,
};
let requestedSquad: Partial<Squad> = {};

jest.mock('next/router', () => ({
  useRouter: jest.fn().mockImplementation(
    () =>
      ({
        pathname: '/',
        isFallback: false,
        query: {},
      } as unknown as NextRouter),
  ),
}));

beforeEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  nock.cleanAll();
  requestedSquad = {};
});

const createFeedMock = (
  page = defaultFeedPage,
  query: string = SOURCE_FEED_QUERY,
  variables: unknown = {
    first: 7,
    after: '',
    loggedIn: true,
    source: defaultSquad.id,
    ranking: 'TIME',
    supportedTypes: supportedTypesForPrivateSources,
  },
): MockedGraphQLResponse<FeedData> => ({
  request: {
    query,
    variables,
  },
  result: {
    data: {
      page,
    },
  },
});

const createSourceMock = (
  handle = 'sample',
  request: Partial<Squad> = {},
  result: GraphQLResult<SquadData> = {
    data: {
      source: generateTestSquad({
        public: false,
        ...request,
        ...requestedSquad,
        handle,
      }),
    },
  },
): MockedGraphQLResponse<SquadData> => ({
  request: {
    query: SQUAD_QUERY,
    variables: { handle },
  },
  result,
});

const copyToClipboard = jest.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: copyToClipboard,
  },
});

const createSourceMembersMock = (
  result = generateMembersResult(),
  variables: unknown = { id: defaultSquad.id, first: 5 },
): MockedGraphQLResponse<SquadEdgesData> => ({
  request: { query: SQUAD_MEMBERS_QUERY, variables },
  result: { data: result },
});

const createBasicSourceMembersMock = (
  result = generateBasicMembersResult(),
  variables: unknown = { id: defaultSquad.id, first: 5 },
): MockedGraphQLResponse<BasicSourceMembersData> => ({
  request: { query: BASIC_SQUAD_MEMBERS_QUERY, variables },
  result: { data: result },
});

const createContentPreferenceStatusMock = (
  id: string = defaultSquad.id,
  entity: ContentPreferenceType = ContentPreferenceType.Source,
): MockedGraphQLResponse => ({
  request: {
    query: CONTENT_PREFERENCE_STATUS_QUERY,
    variables: { id, entity },
  },
  result: {
    data: {
      contentPreferenceStatus: null,
    },
  },
});

let client: QueryClient;

const renderComponent = (
  handle = defaultSquad.handle,
  mocks: MockedGraphQLResponse[] = [
    createSourceMock(handle),
    createFeedMock(),
    createBasicSourceMembersMock(),
  ],
  user: LoggedUser = defaultUser,
  squads = [defaultSquad],
): RenderResult => {
  client = new QueryClient();

  mocks.forEach(mockGraphQL);
  nock('http://localhost:3000').get('/v1/a?active=false').reply(200, [ad]);

  return render(
    <TestBootProvider
      client={client}
      auth={{ user, squads }}
      notification={{
        app: BootApp.Webapp,
        isNotificationsReady: true,
        unreadCount: 0,
      }}
    >
      <InteractiveFeedProvider>
        {SquadPage.getLayout(
          <SquadPage handle={handle} />,
          {},
          SquadPage.layoutProps,
        )}
      </InteractiveFeedProvider>
    </TestBootProvider>,
  );
};

describe('squad page', () => {
  it('should request source feed', async () => {
    renderComponent();
    await waitForNock();
    await waitFor(async () => {
      const elements = await screen.findAllByTestId('postItem');
      expect(elements.length).toBeTruthy();
    });
  });

  it('should show forbidden access if not a member of the squad', async () => {
    const handle = 'sample';
    const forbidden = generateForbiddenSquadResult();
    renderComponent(handle, [createSourceMock(handle, {}, forbidden)]);
    await screen.findByText('Oops! This link leads to a private discussion');
  });

  it('should show not-found if squad does not exist', async () => {
    const handle = 'sample';
    const notfound = generateNotFoundSquadResult();
    renderComponent(handle, [createSourceMock(handle, {}, notfound)]);
    await screen.findByText('Why are you here?');
  });
});

describe('squad page header', () => {
  it('should show squad name', async () => {
    renderComponent();
    await screen.findByText(defaultSquad.name);
  });

  it('should show squad handle', async () => {
    renderComponent();
    await screen.findByText(`@${defaultSquad.handle}`);
  });

  it('should show squad description', async () => {
    renderComponent();
    await screen.findByText(defaultSquad.description);
  });

  it('should show squad image', async () => {
    renderComponent();
    const alt = `${defaultSquad.handle}'s logo`;
    await screen.findByAltText(alt);
  });
});

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe('squad header bar', () => {
  it('should show five of the squad member images', async () => {
    Object.defineProperty(global, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: true,
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
    });
    const source = generateBasicMembersResult();
    const members = source.sourceMembers.edges.slice(0, 5);
    renderComponent();
    const list = await screen.findByLabelText(
      `View ${defaultSquad.membersCount} squad members`,
    );
    const result = await Promise.all(
      members.map(async ({ node: { user } }) => {
        const elements = await screen.findAllByAltText(
          `${user.name}'s profile`,
        );
        return expect(elements.length).toEqual(1);
      }),
    );
    const COUNTER_ELEMENT = 1;
    expect(result.length).toEqual(5);
    expect(list.childNodes.length).toEqual(result.length + COUNTER_ELEMENT);
    Object.defineProperty(global, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: false,
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
    });
  });

  it('should show three of the squad member images when sidebar is not rendered', async () => {
    const members = generateBasicMembersResult().sourceMembers.edges.slice(
      0,
      3,
    );
    renderComponent();
    const result = await Promise.all(
      members.map(({ node: { user } }) =>
        screen.findByAltText(`${user.name}'s profile`),
      ),
    );
    const COUNTER_ELEMENT = 1;
    expect(result.length).toEqual(3);
    const list = await screen.findByLabelText(
      `View ${defaultSquad.membersCount} squad members`,
    );
    expect(list.childNodes.length).toEqual(result.length + COUNTER_ELEMENT);
  });

  it('should show total members count', async () => {
    renderComponent();
    const membersCount = defaultSquad.membersCount.toString();
    const count = await screen.findByLabelText(
      `View ${membersCount} squad members`,
    );
    expect(count).toHaveTextContent(defaultSquad.membersCount.toString());
  });

  it('should show options menu button', async () => {
    renderComponent();
    await screen.findByLabelText('Squad options');
  });

  it('should copy invitation link', async () => {
    requestedSquad.public = false;
    requestedSquad.currentMember = {
      ...defaultSquad.currentMember,
      permissions: [SourcePermissions.Invite],
    };
    renderComponent();
    const invite = await screen.findByText('Invitation link');

    mockGraphQL({
      request: {
        query: COMPLETE_ACTION_MUTATION,
        variables: { type: ActionType.SquadInvite },
      },
      result: { data: { _: true } },
    });
    fireEvent.click(invite);
    await new Promise(process.nextTick);

    const invitation = `https://app.daily.dev/squads/webteam/3ZvloDmEbgiCKLF_eDg72JKLRPgp6MOpGDkh6qTRFr8`;
    await waitFor(() =>
      expect(window.navigator.clipboard.writeText).toBeCalledWith(invitation),
    );
  });

  it('should copy invitation link for public squad', async () => {
    requestedSquad.public = true;
    requestedSquad.currentMember = {
      ...defaultSquad.currentMember,
      permissions: [SourcePermissions.Invite],
    };
    renderComponent();
    const invite = await screen.findByText('Invitation link');

    mockGraphQL({
      request: {
        query: COMPLETE_ACTION_MUTATION,
        variables: { type: ActionType.SquadInvite },
      },
      result: { data: { _: true } },
    });
    fireEvent.click(invite);
    await new Promise(process.nextTick);

    const invitation = `https://app.daily.dev/squads/webteam?cid=squad&userid=u1`;
    await waitFor(() =>
      expect(window.navigator.clipboard.writeText).toBeCalledWith(invitation),
    );
  });

  it('should not copy invitation link when member does not have invite permission', async () => {
    requestedSquad.currentMember = {
      ...defaultSquad.currentMember,
      permissions: [],
    };
    renderComponent();

    await expect(async () => {
      await screen.findByText('Copy invitation link');
    }).rejects.toThrow();
  });

  it('should show join squad button for open squad', async () => {
    requestedSquad.public = true;
    requestedSquad.currentMember = undefined;

    const withContentPrefStatusMock = [
      createSourceMock(defaultSquad.handle),
      createFeedMock(),
      createBasicSourceMembersMock(),
      createContentPreferenceStatusMock(
        defaultSquad.id,
        ContentPreferenceType.Source,
      ),
    ];

    renderComponent(
      defaultSquad.handle,
      withContentPrefStatusMock,
      undefined,
      [],
    );

    await waitForNock();
    expect(await screen.findByText('Join Squad')).toBeInTheDocument();
  });

  it('should not show join squad button for private squad', async () => {
    renderComponent();

    expect(screen.queryByText('Join Squad')).not.toBeInTheDocument();
  });
});

describe('squad members modal', () => {
  const COPY_ITEM = 1;
  const openedMembersModal = async (members = generateMembersList()) => {
    renderComponent();
    const result = generateMembersResult(members);
    mockGraphQL(
      createSourceMembersMock(result, {
        id: defaultSquad.id,
        role: null,
        after: '',
      }),
    );
    const trigger = await screen.findByLabelText(
      `View ${defaultSquad.membersCount} squad members`,
    );
    trigger.click();
    await screen.findByText('Squad members');
    return members;
  };

  it('should show the admin on top of the list', async () => {
    const fullMembers = await openedMembersModal();
    const [first] = fullMembers;
    expect(first.node.role).toEqual(SourceMemberRole.Admin);
  });

  it('should show all members of the squad', async () => {
    await openedMembersModal();
    const list = await screen.findByLabelText('users-list');
    expect(list.childNodes.length).toBeGreaterThan(
      defaultSquad.membersCount + COPY_ITEM,
    );
  });

  it('should show not show blocked members tab when only a member', async () => {
    await openedMembersModal();
    const list = await screen.findByLabelText('users-list');
    expect(list.childNodes.length).toBeGreaterThan(
      defaultSquad.membersCount + COPY_ITEM,
    );
    const blocked = screen.queryByText('Blocked members');
    expect(blocked).not.toBeInTheDocument();
  });

  it('should show all blocked members of the squad when privileged', async () => {
    requestedSquad.currentMember = {
      role: SourceMemberRole.Admin,
      permissions: [SourcePermissions.ViewBlockedMembers],
    };
    await openedMembersModal();
    const list = await screen.findByLabelText('users-list');
    expect(list.childNodes.length).toBeGreaterThan(
      defaultSquad.membersCount + COPY_ITEM,
    );
    const members = generateMembersList();
    const role = SourceMemberRole.Blocked;
    members.forEach((member) => {
      // eslint-disable-next-line no-param-reassign
      member.node.role = role;
    });
    const result = generateMembersResult(members);
    mockGraphQL(
      createSourceMembersMock(result, { id: defaultSquad.id, role, after: '' }),
    );
    const blocked = await screen.findByText('Blocked members');
    blocked.click();
    const unblocks = await screen.findAllByLabelText('Unblock');
    expect(unblocks.length).toEqual(members.length);
  });
});
