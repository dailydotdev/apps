import { FeedData } from '@dailydotdev/shared/src/graphql/posts';
import {
  OnboardingMode,
  SOURCE_FEED_QUERY,
} from '@dailydotdev/shared/src/graphql/feed';
import nock from 'nock';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/preact';
import { QueryClient, QueryClientProvider } from 'react-query';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { NextRouter } from 'next/router';
import SettingsContext, {
  SettingsContextData,
} from '@dailydotdev/shared/src/contexts/SettingsContext';
import ad from '@dailydotdev/shared/__tests__/fixture/ad';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import defaultFeedPage from '@dailydotdev/shared/__tests__/fixture/feed';
import {
  GraphQLResult,
  MockedGraphQLResponse,
  mockGraphQL,
} from '@dailydotdev/shared/__tests__/helpers/graphql';
import { waitForNock } from '@dailydotdev/shared/__tests__/helpers/utilities';
import OnboardingContext from '@dailydotdev/shared/src/contexts/OnboardingContext';
import { createTestSettings } from '@dailydotdev/shared/__tests__/fixture/settings';
import {
  generateForbiddenSquadResult,
  generateMembersList,
  generateMembersResult,
  generateNotFoundSquadResult,
  generateTestSquad,
} from '@dailydotdev/shared/__tests__/fixture/squads';
import {
  SQUAD_MEMBERS_QUERY,
  SQUAD_QUERY,
  SquadData,
  SquadEdgesData,
} from '@dailydotdev/shared/src/graphql/squads';
import {
  SourceMemberRole,
  SourcePermissions,
  Squad,
} from '@dailydotdev/shared/src/graphql/sources';
import { NotificationsContextProvider } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { squadFeedback } from '@dailydotdev/shared/src/lib/constants';
import SquadPage from '../pages/squads/[handle]';

const showLogin = jest.fn();
const defaultSquad = generateTestSquad();
let requestedSquad: Partial<Squad> = {};

jest.mock('next/router', () => ({
  useRouter: jest.fn().mockImplementation(
    () =>
      ({
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
    loggedIn: true,
    source: defaultSquad.id,
    ranking: 'TIME',
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
      source: generateTestSquad({ ...request, ...requestedSquad, handle }),
    },
  },
): MockedGraphQLResponse<SquadData> => ({
  request: {
    query: SQUAD_QUERY,
    variables: { handle },
  },
  result,
});

const feedbackLink = `${squadFeedback}#user_id=${defaultUser.id}&squad_id=${defaultSquad.id}`;
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

let client: QueryClient;

const settingsContext: SettingsContextData = createTestSettings();
const renderComponent = (
  handle = defaultSquad.handle,
  mocks: MockedGraphQLResponse[] = [
    createSourceMock(handle),
    createSourceMembersMock(),
    createFeedMock(),
  ],
  user: LoggedUser = defaultUser,
): RenderResult => {
  client = new QueryClient();

  mocks.forEach(mockGraphQL);
  nock('http://localhost:3000').get('/v1/a').reply(200, [ad]);

  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{
          user,
          shouldShowLogin: false,
          showLogin,
          logout: jest.fn(),
          updateUser: jest.fn(),
          tokenRefreshed: true,
          getRedirectUri: jest.fn(),
          closeLogin: jest.fn(),
          isFetched: true,
        }}
      >
        <SettingsContext.Provider value={settingsContext}>
          <OnboardingContext.Provider
            value={{
              myFeedMode: OnboardingMode.Manual,
              isOnboardingOpen: false,
              onCloseOnboardingModal: jest.fn(),
              onInitializeOnboarding: jest.fn(),
              onShouldUpdateFilters: jest.fn(),
              onStartArticleOnboarding: jest.fn(),
            }}
          >
            <NotificationsContextProvider
              app={BootApp.Webapp}
              isNotificationsReady
              unreadCount={0}
            >
              {SquadPage.getLayout(
                <SquadPage handle={handle} />,
                {},
                SquadPage.layoutProps,
              )}
            </NotificationsContextProvider>
          </OnboardingContext.Provider>
        </SettingsContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>,
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
    await waitForNock();
    await screen.findByText('Oops! This link leads to a private discussion');
  });

  it('should show not-found if squad does not exist', async () => {
    const handle = 'sample';
    const notfound = generateNotFoundSquadResult();
    renderComponent(handle, [createSourceMock(handle, {}, notfound)]);
    await waitForNock();
    await screen.findByText('Oops, this page couldn’t be found');
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

  it('should show feedback icon', async () => {
    renderComponent();
    const feedback = await screen.findByLabelText('Feedback');
    expect(feedback).toHaveAttribute('href', feedbackLink);
  });
});

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe('squad header bar', () => {
  it('should show five of the squad member images', async () => {
    const members = generateMembersResult().sourceMembers.edges;
    renderComponent();
    const result = await Promise.all(
      members.map(({ node: { user } }) =>
        screen.findByAltText(`${user.username}'s profile`),
      ),
    );
    const COUNTER_ELEMENT = 1;
    expect(result.length).toEqual(5);
    const list = await screen.findByLabelText('Members list');
    expect(list.childNodes.length).toEqual(result.length + COUNTER_ELEMENT);
  });

  it('should show total members count', async () => {
    renderComponent();
    const count = await screen.findByLabelText('squad-members-count');
    expect(count).toHaveTextContent(defaultSquad.membersCount.toString());
  });

  it('should show options menu button', async () => {
    renderComponent();
    await screen.findByLabelText('Squad options');
  });

  it('should copy invitation link', async () => {
    renderComponent();
    const invite = await screen.findByText('Copy invitation link');
    invite.click();
    const invitation = `https://app.daily.dev/squads/webteam/3ZvloDmEbgiCKLF_eDg72JKLRPgp6MOpGDkh6qTRFr8`;
    await waitFor(() =>
      expect(window.navigator.clipboard.writeText).toBeCalledWith(invitation),
    );
  });
});

describe('squad members modal', () => {
  const COPY_ITEM = 1;
  const openedMembersModal = async (members = generateMembersList()) => {
    renderComponent();
    const result = generateMembersResult(members);
    mockGraphQL(
      createSourceMembersMock(result, { id: defaultSquad.id, role: null }),
    );
    const trigger = await screen.findByLabelText('Members list');
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
    mockGraphQL(createSourceMembersMock(result, { id: defaultSquad.id, role }));
    const blocked = await screen.findByText('Blocked members');
    blocked.click();
    const unblocks = await screen.findAllByLabelText('Unblock');
    expect(unblocks.length).toEqual(members.length);
  });

  it('should show options button to all members', async () => {
    await openedMembersModal();
    const options = await screen.findAllByLabelText('Member options');
    expect(options.length).toEqual(defaultSquad.membersCount + COPY_ITEM);
  });
});
