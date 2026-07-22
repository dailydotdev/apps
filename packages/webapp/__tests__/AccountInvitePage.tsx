import React from 'react';
import nock from 'nock';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
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

const mockReferredUsers = () => {
  mockGraphQL({
    request: { query: REFERRED_USERS_QUERY, variables: { after: '' } },
    result: {
      data: {
        referredUsers: {
          pageInfo: { endCursor: null, hasNextPage: false },
          edges: [],
        },
      },
    },
  });
};

const renderComponent = (user: LoggedUser = loggedUser): RenderResult => {
  mockReferredUsers();

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

  expect(await screen.findByText('Invite 3 friends,')).toBeInTheDocument();
  expect(screen.getByText('get 1 month of Plus free')).toBeInTheDocument();
  expect(screen.getByText('Referral reward')).toBeInTheDocument();
  expect(screen.getByText('0 of 3 friends joined')).toBeInTheDocument();
});

it('should reflect partial progress from the referral campaign', async () => {
  mockReferralCampaign(2);
  renderComponent();

  expect(await screen.findByText('2 of 3 friends joined')).toBeInTheDocument();
  expect(screen.getByText('Referral reward')).toBeInTheDocument();
});

it('should show the unlocked state once three friends joined', async () => {
  mockReferralCampaign(3);
  renderComponent();

  expect(await screen.findByText('Reward unlocked')).toBeInTheDocument();
  expect(
    screen.getByText('3 of 3 friends joined — enjoy your free month'),
  ).toBeInTheDocument();
});

it('should link to the giveback page when the feature is enabled', async () => {
  mockedFeatures.set(featureGiveback, true);
  mockReferralCampaign(0);
  renderComponent();

  expect(await screen.findByText('More ways to give back')).toBeInTheDocument();
  const cta = screen.getByText('Explore Giveback →').closest('a');
  expect(cta).toHaveAttribute('href', expect.stringContaining('giveback'));
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
