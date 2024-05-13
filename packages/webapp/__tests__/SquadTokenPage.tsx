import { OnboardingMode } from '@dailydotdev/shared/src/graphql/feed';
import nock from 'nock';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import React from 'react';
import {
  fireEvent,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { defaultTestSettings } from '@dailydotdev/shared/__tests__/fixture/settings';
import { NextRouter } from 'next/router';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import {
  defaultSquadToken,
  generateTestMember,
  generateTestAdmin,
} from '@dailydotdev/shared/__tests__/fixture/squads';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '@dailydotdev/shared/__tests__/helpers/graphql';
import { waitForNock } from '@dailydotdev/shared/__tests__/helpers/utilities';
import OnboardingContext from '@dailydotdev/shared/src/contexts/OnboardingContext';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import {
  SQUAD_INVITATION_QUERY,
  SQUAD_JOIN_MUTATION,
  SquadInvitation,
} from '@dailydotdev/shared/src/graphql/squads';
import {
  SourceMember,
  SourceMemberRole,
} from '@dailydotdev/shared/src/graphql/sources';
import { BOOT_QUERY_KEY } from '@dailydotdev/shared/src/contexts/common';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import { labels } from '@dailydotdev/shared/src/lib';
import {
  ActionType,
  COMPLETE_ACTION_MUTATION,
} from '@dailydotdev/shared/src/graphql/actions';
import SquadPage, {
  SquadReferralProps,
} from '../pages/squads/[handle]/[token]';

const showLogin = jest.fn();
let replaced = '';
jest.mock('next/router', () => ({
  useRouter: jest.fn().mockImplementation(
    () =>
      ({
        isFallback: false,
        // eslint-disable-next-line no-return-assign
        replace: (path: string) => (replaced = path),
      } as unknown as NextRouter),
  ),
}));

beforeEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  nock.cleanAll();
  replaced = '';
});

let client: QueryClient;

const createInvitationMock = (
  token: string = defaultSquadToken,
  member: SourceMember = generateTestAdmin(),
): MockedGraphQLResponse<SquadInvitation> => ({
  request: {
    query: SQUAD_INVITATION_QUERY,
    variables: { token },
  },
  result: {
    data: { member },
  },
});

const defaultToken = defaultSquadToken;
const renderComponent = (
  mocks = [createInvitationMock(defaultToken)],
  props: SquadReferralProps = { token: defaultToken, handle: 'test' },
  user: LoggedUser = defaultUser,
): RenderResult => {
  client = new QueryClient();
  mocks.map(mockGraphQL);
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
          squads: [],
        }}
      >
        <SettingsContext.Provider value={defaultTestSettings}>
          <OnboardingContext.Provider
            value={{
              myFeedMode: OnboardingMode.Manual,
              isOnboardingOpen: false,
              onCloseOnboardingModal: jest.fn(),
              onInitializeOnboarding: jest.fn(),
              onShouldUpdateFilters: jest.fn(),
            }}
          >
            <Toast autoDismissNotifications={false} />
            <SquadPage {...props} />
          </OnboardingContext.Provider>
        </SettingsContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

describe('inviter', () => {
  const member = generateTestAdmin();
  it('should show profile image', async () => {
    renderComponent();
    await waitForNock();
    const alt = `${member.user.username}'s profile`;
    await screen.findByAltText(alt);
  });

  it('should show inviter name', async () => {
    renderComponent();
    await waitForNock();
    await screen.findByText(member.user.name);
  });

  it('should show inviter handle', async () => {
    renderComponent();
    await waitForNock();
    await screen.findByText(`(@${member.user.username})`);
  });
});

describe('squad details', () => {
  const member = generateTestAdmin();
  it('should show page heading that includes squad name', async () => {
    renderComponent();
    await waitForNock();
    const text = `You are invited to join ${member.source.name}`;
    await screen.findByText(text);
  });

  it('should show squad image', async () => {
    renderComponent();
    await waitForNock();
    const alt = `${member.source.handle}'s profile`;
    await screen.findByAltText(alt);
  });

  it('should show squad handle', async () => {
    renderComponent();
    await waitForNock();
    await screen.findByText(`@${member.source.handle}`);
  });

  it('should show accurate waiting label when there is 1 member', async () => {
    renderComponent();
    await waitForNock();
    const label = `${member.user.name} is waiting for you inside. Join them now`;
    const text = await screen.findByTestId('waiting-users');
    expect(text).toHaveTextContent(label);
  });

  it('should show accurate waiting label when there is 2 members', async () => {
    const admin = generateTestAdmin();
    const newMember = generateTestMember('u1');
    admin.source.members.edges.push({ node: newMember });
    renderComponent([createInvitationMock(defaultToken, admin)]);
    await waitForNock();
    const label = `${admin.user.name} and ${newMember.user.name} are waiting for you inside. Join them now`;
    const text = await screen.findByTestId('waiting-users');
    expect(text).toHaveTextContent(label);
  });

  it('should show accurate waiting label when there is 3 or more members', async () => {
    const admin = generateTestAdmin();
    const members = [generateTestMember('u1'), generateTestMember('u2')];
    admin.source.members.edges.push({ node: members[0] }, { node: members[1] });
    admin.source.membersCount = 3;
    renderComponent([createInvitationMock(defaultToken, admin)]);
    await waitForNock();
    const label = `${admin.user.name} and 2 others are waiting for you inside. Join them now`;
    const text = await screen.findByTestId('waiting-users');
    expect(text).toHaveTextContent(label);
    const result = await Promise.all(
      members.map(({ user }) =>
        screen.findByAltText(`${user.username}'s profile`),
      ),
    );
    expect(result.length).toEqual(members.length);
  });

  it('should join squad on button click', async () => {
    const admin = generateTestAdmin();
    renderComponent([createInvitationMock(defaultToken, admin)]);
    client.setQueryData(BOOT_QUERY_KEY, { squads: [] });
    await waitForNock();
    mockGraphQL({
      request: {
        query: SQUAD_JOIN_MUTATION,
        variables: { token: admin.referralToken, sourceId: admin.source.id },
      },
      result: () => ({ data: { source: admin.source } }),
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
    const button = await screen.findByText('Join Squad');
    fireEvent.click(button);
    await waitForNock();
    expect(replaced).toEqual(admin.source.permalink);
  });

  it('should have join squad button', async () => {
    const admin = generateTestAdmin();
    renderComponent([createInvitationMock(defaultToken, admin)]);
    client.setQueryData(BOOT_QUERY_KEY, { squads: [] });
    await waitFor(() => screen.findAllByText('Join Squad'));
  });
});

describe('invalid token', () => {
  it('should redirect to home page when source id is not found', async () => {
    renderComponent([createInvitationMock(defaultToken, null)]);
    await waitForNock();
    expect(replaced).toEqual(webappUrl);
  });

  it('should redirect to home page when invitation source id does not match route squad id', async () => {
    const admin = generateTestAdmin();
    renderComponent([createInvitationMock(defaultToken, admin)], {
      handle: 'not your squad',
      token: defaultToken,
    });
    await waitForNock();
    expect(replaced).toEqual(webappUrl);
  });

  it('should redirect to squads page when member is already part of the squad', async () => {
    const admin = generateTestAdmin();
    const member = generateTestMember(1);
    member.user.id = defaultUser.id;
    admin.source.currentMember = member;
    renderComponent([createInvitationMock(defaultToken, admin)]);
    await waitForNock();
    expect(replaced).toEqual(`/squads/${admin.source.handle}`);
  });

  it('should show toast is blocked user tries to join', async () => {
    const admin = generateTestAdmin();
    const member = generateTestMember(1);
    member.role = SourceMemberRole.Blocked;
    member.user.id = defaultUser.id;
    admin.source.currentMember = member;
    renderComponent([createInvitationMock(defaultToken, admin)]);
    await waitForNock();
    const button = await screen.findByText('Join Squad');
    fireEvent.click(button);
    await screen.findByText(labels.squads.forbidden);
  });
});
