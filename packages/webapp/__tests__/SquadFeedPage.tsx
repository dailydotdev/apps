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
  generateTestSquad,
  generateForbiddenSquadResult,
  generateNotFoundSquadResult,
  generateMembersResult,
  generateMembersList,
} from '@dailydotdev/shared/__tests__/fixture/squads';
import {
  Squad,
  SquadData,
  SquadEdgesData,
  SquadMemberRole,
  SQUAD_MEMBERS_QUERY,
  SQUAD_QUERY,
} from '@dailydotdev/shared/src/graphql/squads';
import { NotificationsContextProvider } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import SquadPage from '../pages/squads/[handle]';

const showLogin = jest.fn();
const defaultSquad = generateTestSquad();

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
});

const createFeedMock = (
  page = defaultFeedPage,
  query: string = SOURCE_FEED_QUERY,
  variables: unknown = {
    first: 7,
    loggedIn: true,
    source: defaultSquad.id,
    unreadOnly: false,
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
    data: { source: generateTestSquad({ ...request, handle }) },
  },
): MockedGraphQLResponse<SquadData> => ({
  request: {
    query: SQUAD_QUERY,
    variables: { handle },
  },
  result,
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

it('should show not found if squad does not exist', async () => {
  const handle = 'sample';
  const notfound = generateNotFoundSquadResult();
  renderComponent(handle, [createSourceMock(handle, {}, notfound)]);
  await waitForNock();
  await screen.findByText('Oops, this page couldn’t be found');
});

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

it('should show five of the squad member images', async () => {
  const members = generateMembersResult().sourceMembers.edges;
  renderComponent();
  const count = await screen.findByLabelText('squad-members-count');
  expect(count).toHaveTextContent(defaultSquad.membersCount.toString());
  const result = await Promise.all(
    members.map(({ node: { user } }) =>
      screen.findByAltText(`${user.username}'s profile`),
    ),
  );
  expect(result.length).toEqual(5);
  const list = await screen.findByLabelText('squad-members-short-list');
  expect(list.childNodes.length).toEqual(5);
});

it('should show all members of the squad and list the owner first', async () => {
  renderComponent();
  const count = await screen.findByLabelText('squad-members-count');
  expect(count).toHaveTextContent(defaultSquad.membersCount.toString());

  const fullMembers = generateMembersList();
  const [first] = fullMembers;
  const result = generateMembersResult(fullMembers);
  mockGraphQL(createSourceMembersMock(result, { id: defaultSquad.id }));
  const btn = await screen.findByLabelText('Members list');
  btn.click();

  await screen.findByText('Squad members');
  expect(first.node.role).toEqual(SquadMemberRole.Owner);
  const list = await screen.findByLabelText('users-list');
  expect(list.childNodes.length).toBeGreaterThan(defaultSquad.membersCount);
});

const copyToClipboard = jest.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: copyToClipboard,
  },
});

it('should show invitation modal and allow to copy link', async () => {
  renderComponent();
  const trigger = await screen.findByLabelText('Invite a new member');
  trigger.click();
  await screen.findByText('Invite more members to join');
  const input = await screen.findByRole('textbox');
  const token = defaultSquad.currentMember.referralToken;
  const invitation = `${defaultSquad?.permalink}/${token}`;
  expect(input).toHaveValue(invitation);

  const copy = await screen.findByText('Copy invitation link');
  copy.click();
  expect(copyToClipboard).toHaveBeenCalledWith(invitation);
});
