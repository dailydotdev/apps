import React from 'react';
import nock from 'nock';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import OnboardingContext from '../contexts/OnboardingContext';
import AuthContext from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import defaultUser from '../../__tests__/fixture/loggedUser';
import AlertContext, { AlertContextData } from '../contexts/AlertContext';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '../../__tests__/helpers/graphql';
import { FEED_SETTINGS_QUERY } from '../graphql/feedSettings';
import { getFeedSettingsQueryKey } from '../hooks/useMutateFilters';
import { LoggedUser } from '../lib/user';

let client: QueryClient;
const incrementOnboardingStep = jest.fn();
const disableAlertFilterMock = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
});

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [],
  onboardingStep = -1,
  user: LoggedUser = defaultUser,
  alertsData: AlertContextData = {
    alerts: { filter: true },
    setAlerts: jest.fn(),
    updateAlerts: disableAlertFilterMock,
  },
): RenderResult => {
  client = new QueryClient();
  mocks.forEach(mockGraphQL);
  return render(
    <QueryClientProvider client={client}>
      <AlertContext.Provider value={alertsData}>
        <AuthContext.Provider
          value={{
            user,
            shouldShowLogin: false,
            showLogin: jest.fn(),
            logout: jest.fn(),
            updateUser: jest.fn(),
            tokenRefreshed: true,
            getRedirectUri: jest.fn(),
          }}
        >
          <OnboardingContext.Provider
            value={{
              onboardingStep,
              onboardingReady: true,
              incrementOnboardingStep,
              trackEngagement: jest.fn(),
              closeReferral: jest.fn(),
              showReferral: false,
            }}
          >
            <Sidebar />
          </OnboardingContext.Provider>
        </AuthContext.Provider>
      </AlertContext.Provider>
      ,
    </QueryClientProvider>,
  );
};

it('should remove red dot for filter alert when there is a pre-configured feedSettings', async () => {
  renderComponent([
    {
      request: { query: FEED_SETTINGS_QUERY, variables: { loggedIn: true } },
      result: { data: { feedSettings: { blockedTags: ['javascript'] } } },
    },
  ]);
  await waitFor(async () => {
    const data = await client.getQueryData(
      getFeedSettingsQueryKey(defaultUser),
    );
    expect(data).toBeTruthy();
  });
  const trigger = await screen.findByLabelText('Open sidebar');
  trigger.click();
  expect(disableAlertFilterMock).toBeCalled();
  expect(incrementOnboardingStep).toBeCalledTimes(0);
});

it('should not increment onboarding step when it is done', async () => {
  renderComponent();
  const trigger = await screen.findByLabelText('Open sidebar');
  trigger.click();
  expect(incrementOnboardingStep).toBeCalledTimes(0);
});

it('should increment onboarding step on trigger click', async () => {
  renderComponent([], 2);
  const trigger = await screen.findByLabelText('Open sidebar');
  trigger.click();
  expect(incrementOnboardingStep).toBeCalledTimes(1);
});
