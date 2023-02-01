import { OnboardingMode } from '@dailydotdev/shared/src/graphql/feed';
import nock from 'nock';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import React from 'react';
import { render, RenderResult, screen } from '@testing-library/preact';
import { QueryClient, QueryClientProvider } from 'react-query';
import { defaultTestSettings } from '@dailydotdev/shared/__tests__/fixture/settings';
import { NextRouter } from 'next/router';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import {
  defaultSquadToken,
  generateTestMember,
  generateTestOwner,
} from '@dailydotdev/shared/__tests__/fixture/squads';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '@dailydotdev/shared/__tests__/helpers/graphql';
import { waitForNock } from '@dailydotdev/shared/__tests__/helpers/utilities';
import OnboardingContext from '@dailydotdev/shared/src/contexts/OnboardingContext';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import {
  SquadInvitation,
  SquadMember,
  SQUAD_INVITATION_QUERY,
  SQUAD_JOIN_MUTATION,
} from '@dailydotdev/shared/src/graphql/squads';
import { BOOT_QUERY_KEY } from '@dailydotdev/shared/src/contexts/common';
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
  member: SquadMember = generateTestOwner(),
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
            <SquadPage {...props} />
          </OnboardingContext.Provider>
        </SettingsContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

describe('inviter', () => {
  const member = generateTestOwner();
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
  const member = generateTestOwner();
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
    const owner = generateTestOwner();
    const newMember = generateTestMember('u1');
    owner.source.members.edges.push({ node: newMember });
    renderComponent([createInvitationMock(defaultToken, owner)]);
    await waitForNock();
    const label = `${owner.user.name} and ${newMember.user.name} are waiting for you inside. Join them now`;
    const text = await screen.findByTestId('waiting-users');
    expect(text).toHaveTextContent(label);
  });

  it('should show accurate waiting label when there is 3 or more members', async () => {
    const owner = generateTestOwner();
    const members = [generateTestMember('u1'), generateTestMember('u2')];
    owner.source.members.edges.push({ node: members[0] }, { node: members[1] });
    renderComponent([createInvitationMock(defaultToken, owner)]);
    await waitForNock();
    const label = `${owner.user.name} and 2 others are waiting for you inside. Join them now`;
    const text = await screen.findByTestId('waiting-users');
    expect(text).toHaveTextContent(label);
    const result = await Promise.all(
      members.map(({ user }) =>
        screen.findByAltText(`${user.username}'s profile`),
      ),
    );
    expect(result.length).toEqual(members.length);
  });

  it('should join squad', async () => {
    client.setQueryData(BOOT_QUERY_KEY, { squads: [] });
    const owner = generateTestOwner();
    renderComponent([createInvitationMock(defaultToken, owner)]);
    await waitForNock();
    mockGraphQL({
      request: {
        query: SQUAD_JOIN_MUTATION,
        variables: { token: owner.referralToken, sourceId: owner.source.id },
      },
      result: () => ({ data: { source: owner.source } }),
    });
    const btn = await screen.findByText('Join Squad');
    btn.click();
    await waitForNock();
    expect(replaced).toEqual(owner.source.permalink);
  });
});

describe('invalid token', () => {
  it('should redirect to home page when source id is not found', async () => {
    renderComponent([createInvitationMock(defaultToken, null)]);
    await waitForNock();
    expect(replaced).toEqual(webappUrl);
  });

  it('should redirect to home page when invitation source id does not match route squad id', async () => {
    const owner = generateTestOwner();
    renderComponent([createInvitationMock(defaultToken, owner)], {
      handle: 'not your squad',
      token: defaultToken,
    });
    await waitForNock();
    expect(replaced).toEqual(webappUrl);
  });

  it('should redirect to squads page when member is already part of the squad', async () => {
    const owner = generateTestOwner();
    const member = generateTestMember(1);
    member.user.id = defaultUser.id;
    owner.source.members.edges.push({ node: member });
    renderComponent([createInvitationMock(defaultToken, owner)]);
    await waitForNock();
    expect(replaced).toEqual(`/squads/${owner.source.handle}`);
  });
});
