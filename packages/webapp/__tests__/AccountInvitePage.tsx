import React from 'react';
import nock from 'nock';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import type { RenderResult } from '@testing-library/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockGraphQL } from '@dailydotdev/shared/__tests__/helpers/graphql';
import type { Visit } from '@dailydotdev/shared/src/lib/boot';
import {
  REFERRAL_CAMPAIGN_QUERY,
  REFERRED_USERS_QUERY,
} from '@dailydotdev/shared/src/graphql/users';
import type { Feature } from '@dailydotdev/shared/src/lib/featureManagement';
import { featureGiveback } from '@dailydotdev/shared/src/lib/featureManagement';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';

import AccountInvitePage from '../pages/settings/invite';

const LogContext = getLogContextStatic();

jest.mock('next/router', () => ({
  useRouter() {
    return {
      isFallback: false,
      pathname: '/settings/invite',
      query: {},
      push: jest.fn(),
      replace: jest.fn(),
      events: { on: jest.fn(), off: jest.fn() },
    };
  },
}));

// The page gates the giveback section on `featureGiveback`; other features in
// the tree should keep their defaults, so the mock resolves per feature.
const mockedFeatures = new Map<Feature<unknown>, unknown>();
jest.mock('@dailydotdev/shared/src/hooks/useConditionalFeature', () => ({
  useConditionalFeature: ({ feature }: { feature: Feature<unknown> }) => ({
    value: mockedFeatures.has(feature)
      ? mockedFeatures.get(feature)
      : feature.defaultValue,
    isLoading: false,
  }),
}));

let client: QueryClient;
const logEvent = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
  mockedFeatures.clear();
  client = new QueryClient();
});

const defaultVisit: Visit = {
  sessionId: 'sample session id',
  visitId: 'sample visit id',
};

const mockReferralCampaign = (referredUsersCount: number) => {
  mockGraphQL({
    request: {
      query: REFERRAL_CAMPAIGN_QUERY,
      variables: { referralOrigin: 'generic' },
    },
    result: {
      data: {
        referralCampaign: {
          referredUsersCount,
          referralCountLimit: 5,
          referralToken: 'token',
          url: 'https://daily.dev/join?token=token',
        },
      },
    },
  });
};

const referredUser = (
  id: string,
  username: string,
  createdAt = '2026-05-04T10:00:00.000Z',
) => ({
  id,
  name: username,
  username,
  image: `https://daily.dev/${username}.jpg`,
  permalink: `https://app.daily.dev/${username}`,
  createdAt,
  reputation: 10,
});

const mockReferredUsers = (users: ReturnType<typeof referredUser>[] = []) => {
  mockGraphQL({
    request: { query: REFERRED_USERS_QUERY, variables: { after: '' } },
    result: {
      data: {
        referredUsers: {
          pageInfo: { endCursor: null, hasNextPage: false },
          edges: users.map((node) => ({ node })),
        },
      },
    },
  });
};

const renderComponent = (
  user: LoggedUser = loggedUser,
  users: ReturnType<typeof referredUser>[] = [],
): RenderResult => {
  mockReferredUsers(users);

  return render(
    <QueryClientProvider client={client}>
      <AuthContextProvider
        user={user}
        updateUser={jest.fn()}
        getRedirectUri={jest.fn()}
        visit={defaultVisit}
        tokenRefreshed
      >
        <LogContext.Provider
          value={{
            logEvent,
            logEventStart: jest.fn(),
            logEventEnd: jest.fn(),
            sendBeacon: jest.fn(),
          }}
        >
          <AccountInvitePage />
        </LogContext.Provider>
      </AuthContextProvider>
    </QueryClientProvider>,
  );
};

it('should render the 3-invites promo with the progress at zero', async () => {
  mockReferralCampaign(0);
  renderComponent();

  expect(
    await screen.findByText('Invite 3 friends, get 1 month of Plus'),
  ).toBeInTheDocument();
  expect(screen.getByText('0 of 3 friends joined')).toBeInTheDocument();
  expect(screen.getByText('Your invitation link')).toBeInTheDocument();
});

it('should reflect partial progress from the referral campaign', async () => {
  mockReferralCampaign(2);
  renderComponent();

  expect(await screen.findByText('2 of 3 friends joined')).toBeInTheDocument();
});

it('should show the unlocked state once three friends joined', async () => {
  mockReferralCampaign(3);
  renderComponent();

  expect(
    await screen.findByText('1 month of Plus unlocked'),
  ).toBeInTheDocument();
  expect(screen.getByText('All 3 friends joined')).toBeInTheDocument();
});

it('should keep the unlocked copy count-agnostic beyond the goal', async () => {
  mockReferralCampaign(12);
  renderComponent();

  expect(
    await screen.findByText('1 month of Plus unlocked'),
  ).toBeInTheDocument();
  expect(screen.getByText('All 3 friends joined')).toBeInTheDocument();
  expect(screen.queryByText(/12 of 3/)).not.toBeInTheDocument();
});

it('should run the free month from the join date of the third referral', async () => {
  mockReferralCampaign(3);
  renderComponent(loggedUser, [
    // Deliberately out of order — the period is derived from the third
    // developer to join, not the third row the query returns.
    referredUser('ref-3', 'wrenh', '2026-07-02T10:00:00.000Z'),
    referredUser('ref-1', 'idakern', '2026-05-04T10:00:00.000Z'),
    referredUser('ref-2', 'ravimenon', '2026-06-11T10:00:00.000Z'),
  ]);

  expect(await screen.findByText('2 Jul 2026')).toBeInTheDocument();
  expect(screen.getByText('2 Aug 2026')).toBeInTheDocument();
});

it('should fill the progress slots with the referred users avatars', async () => {
  mockReferralCampaign(2);
  renderComponent(loggedUser, [
    referredUser('ref-1', 'idakern'),
    referredUser('ref-2', 'ravimenon'),
  ]);

  await screen.findByText('2 of 3 friends joined');
  await waitFor(() => {
    expect(screen.getAllByAltText("idakern's profile")).not.toHaveLength(0);
  });
  expect(screen.getAllByAltText("ravimenon's profile")).not.toHaveLength(0);
});

it('should link to the giveback page and log the click when enabled', async () => {
  mockedFeatures.set(featureGiveback, true);
  mockReferralCampaign(0);
  renderComponent();

  expect(await screen.findByText('More ways to give back')).toBeInTheDocument();
  const cta = screen.getByRole('link', { name: 'Explore Giveback' });
  expect(cta).toHaveAttribute('href', `${webappUrl}giveback`);

  fireEvent.click(cta);
  expect(logEvent).toHaveBeenCalledWith(
    expect.objectContaining({ event_name: LogEvent.ClickGivebackGiftEntry }),
  );
});

it('should hide the giveback section when the feature is disabled', async () => {
  mockedFeatures.set(featureGiveback, false);
  mockReferralCampaign(0);
  renderComponent();

  await waitFor(() => {
    expect(
      screen.queryByText('More ways to give back'),
    ).not.toBeInTheDocument();
  });
});
