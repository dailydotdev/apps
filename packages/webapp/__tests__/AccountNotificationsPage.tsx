import React from 'react';
import nock from 'nock';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { render, RenderResult, screen } from '@testing-library/preact';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '@dailydotdev/shared/__tests__/helpers/graphql';
import { waitForNock } from '@dailydotdev/shared/__tests__/helpers/utilities';
import {
  DeviceNotificationPreference,
  DevicePreferenceData,
  DEVICE_PREFERENCE_QUERY,
  GeneralNotificationPreference,
  GeneralPreferenceData,
  GENERAL_PREFERENCE_QUERY,
  UPDATE_DEVICE_PREFERENCE_MUTATION,
  UPDATE_GENERAL_PREFERENCE_MUTATION,
} from '@dailydotdev/shared/src/graphql/notifications';
import { Visit } from '@dailydotdev/shared/src/lib/boot';
import ProfileNotificationsPage from '../pages/account/notifications';

jest.mock('next/router', () => ({
  useRouter() {
    return {
      isFallback: false,
    };
  },
}));

let client: QueryClient;

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
  nock.cleanAll();
  client = new QueryClient();
});

const defaultLoggedUser: LoggedUser = {
  ...loggedUser,
  twitter: 'dailydotdev',
  github: 'dailydotdev',
  hashnode: 'dailydotdev',
  portfolio: 'https://daily.dev/?key=vaue',
  acceptedMarketing: true,
};
const defaultVisit: Visit = {
  sessionId: 'sample session id',
  visitId: 'sample visit id',
};

const updateUser = jest.fn();

const defaultDeviceData: Pick<
  DeviceNotificationPreference,
  'pushNotification'
> = {
  pushNotification: false,
};
const createDevicePreferenceMock = (
  data: Pick<
    DeviceNotificationPreference,
    'pushNotification'
  > = defaultDeviceData,
  deviceId = defaultVisit.sessionId,
): MockedGraphQLResponse<DevicePreferenceData> => ({
  request: { query: DEVICE_PREFERENCE_QUERY, variables: { deviceId } },
  result: { data: { preference: data } },
});

const defaultGeneralData: GeneralNotificationPreference = {
  marketingEmail: false,
  notificationEmail: false,
};
const createGeneralPreferenceMock = (
  data: GeneralNotificationPreference = defaultGeneralData,
): MockedGraphQLResponse<GeneralPreferenceData> => ({
  request: { query: GENERAL_PREFERENCE_QUERY },
  result: { data: { preference: data } },
});

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [
    createDevicePreferenceMock(),
    createGeneralPreferenceMock(),
  ],
): RenderResult => {
  mocks.forEach(mockGraphQL);

  return render(
    <QueryClientProvider client={client}>
      <AuthContextProvider
        user={defaultLoggedUser}
        updateUser={updateUser}
        getRedirectUri={jest.fn()}
        visit={defaultVisit}
        tokenRefreshed
      >
        <ProfileNotificationsPage />
      </AuthContextProvider>
    </QueryClientProvider>,
  );
};

it('should accurately show device preference', async () => {
  renderComponent([
    createDevicePreferenceMock({ pushNotification: true }),
    createGeneralPreferenceMock(),
  ]);
  await waitForNock();
  const subscription = await screen.findByTestId('push_notification-switch');
  expect(subscription).toBeChecked();
});

it('should change user push notification', async () => {
  renderComponent();
  await waitForNock();
  let mutationCalled = false;
  const pushNotification = true;
  mockGraphQL({
    request: {
      query: UPDATE_DEVICE_PREFERENCE_MUTATION,
      variables: {
        data: { pushNotification },
        deviceId: defaultVisit.sessionId,
      },
    },
    result: () => {
      mutationCalled = true;
      return { data: { id: '' } };
    },
  });
  mockGraphQL(createDevicePreferenceMock({ pushNotification: true }));
  const subscription = await screen.findByTestId('push_notification-switch');
  expect(subscription).not.toBeChecked();
  await subscription.click();
  await waitForNock();
  const newSubscription = await screen.findByTestId('push_notification-switch');
  expect(newSubscription).toBeChecked();
  expect(mutationCalled).toBeTruthy();
});

it('should change user all email subscription', async () => {
  renderComponent([
    createDevicePreferenceMock(),
    createGeneralPreferenceMock({
      marketingEmail: false,
      notificationEmail: true,
    }),
  ]);
  await waitForNock();
  let mutationCalled = false;
  const data: GeneralNotificationPreference = {
    marketingEmail: true,
    notificationEmail: true,
  };
  mockGraphQL({
    request: {
      query: UPDATE_GENERAL_PREFERENCE_MUTATION,
      variables: { data },
    },
    result: () => {
      mutationCalled = true;
      return { data: { id: '' } };
    },
  });
  mockGraphQL(
    createGeneralPreferenceMock({
      marketingEmail: true,
      notificationEmail: true,
    }),
  );
  const subscription = await screen.findByTestId('email_notification-switch');
  expect(subscription).not.toBeChecked();
  await subscription.click();
  await waitForNock();
  const newSubscription = await screen.findByTestId(
    'email_notification-switch',
  );
  expect(newSubscription).toBeChecked();
  const marketingSubscription = await screen.findByTestId('marketing-switch');
  expect(marketingSubscription).toBeChecked();
  const notificationEmail = await screen.findByTestId('new_activity-switch');
  expect(notificationEmail).toBeChecked();
  expect(mutationCalled).toBeTruthy();
});

it('should change user email marketing subscription', async () => {
  renderComponent();
  await waitForNock();
  let mutationCalled = false;
  const marketingEmail = true;
  mockGraphQL({
    request: {
      query: UPDATE_GENERAL_PREFERENCE_MUTATION,
      variables: { data: { marketingEmail } },
    },
    result: () => {
      mutationCalled = true;
      return { data: { id: '' } };
    },
  });
  mockGraphQL(
    createGeneralPreferenceMock({
      marketingEmail,
      notificationEmail: true,
    }),
  );
  const subscription = await screen.findByTestId('marketing-switch');
  expect(subscription).not.toBeChecked();
  await subscription.click();
  await waitForNock();
  const newSubscription = await screen.findByTestId('marketing-switch');
  expect(newSubscription).toBeChecked();
  expect(mutationCalled).toBeTruthy();
});

it('should change user notification email subscription', async () => {
  renderComponent();
  await waitForNock();
  let mutationCalled = false;
  const notificationEmail = true;
  mockGraphQL({
    request: {
      query: UPDATE_GENERAL_PREFERENCE_MUTATION,
      variables: { data: { notificationEmail } },
    },
    result: () => {
      mutationCalled = true;
      return { data: { id: '' } };
    },
  });
  mockGraphQL(
    createGeneralPreferenceMock({
      marketingEmail: false,
      notificationEmail,
    }),
  );
  const subscription = await screen.findByTestId('new_activity-switch');
  expect(subscription).not.toBeChecked();
  await subscription.click();
  await waitForNock();
  const newSubscription = await screen.findByTestId('new_activity-switch');
  expect(newSubscription).toBeChecked();
  expect(mutationCalled).toBeTruthy();
});
