import React from 'react';
import nock from 'nock';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import {
  act,
  fireEvent,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '@dailydotdev/shared/__tests__/helpers/graphql';
import { waitForNock } from '@dailydotdev/shared/__tests__/helpers/utilities';
import { BootApp, Visit } from '@dailydotdev/shared/src/lib/boot';
import { NotificationsContextProvider } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import { UpdateProfileParameters } from '@dailydotdev/shared/src/hooks/useProfileForm';
import {
  GET_PERSONALIZED_DIGEST_SETTINGS,
  SUBSCRIBE_PERSONALIZED_DIGEST_MUTATION,
  UNSUBSCRIBE_PERSONALIZED_DIGEST_MUTATION,
  UPDATE_USER_PROFILE_MUTATION,
  UserPersonalizedDigestType,
} from '@dailydotdev/shared/src/graphql/users';
import { ApiError } from '@dailydotdev/shared/src/graphql/common';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import ProfileNotificationsPage from '../pages/account/notifications';

jest.mock('next/router', () => ({
  useRouter() {
    return {
      isFallback: false,
    };
  },
}));

let client: QueryClient;
let personalizedDigestMock: MockedGraphQLResponse;
const trackEvent = jest.fn();

beforeEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  nock.cleanAll();
  client = new QueryClient();

  globalThis.OneSignal = {
    getRegistrationId: jest.fn().mockResolvedValue('123'),
  };

  personalizedDigestMock = {
    request: { query: GET_PERSONALIZED_DIGEST_SETTINGS, variables: {} },
    result: {
      errors: [
        {
          message: 'Not subscribed to personalized digest',
          extensions: {
            code: ApiError.NotFound,
          },
        },
      ],
    },
  };
});

afterEach(() => {
  delete globalThis.OneSignal;
});

const defaultLoggedUser: LoggedUser = {
  ...loggedUser,
  twitter: 'dailydotdev',
  github: 'dailydotdev',
  hashnode: 'dailydotdev',
  portfolio: 'https://daily.dev/?key=vaue',
  acceptedMarketing: false,
  notificationEmail: false,
};
const defaultVisit: Visit = {
  sessionId: 'sample session id',
  visitId: 'sample visit id',
};

const updateUser = jest.fn();
const updateProfileMock = (
  data: UpdateProfileParameters,
): MockedGraphQLResponse => ({
  request: { query: UPDATE_USER_PROFILE_MUTATION, variables: { data } },
  result: { data: { id: '' } },
});

globalThis.Notification = {
  requestPermission: jest.fn(),
  permission: 'default',
} as unknown as jest.Mocked<typeof Notification>;

jest
  .spyOn(window.Notification, 'requestPermission')
  .mockResolvedValueOnce('granted');

const renderComponent = (user = defaultLoggedUser): RenderResult => {
  mockGraphQL(personalizedDigestMock);

  return render(
    <QueryClientProvider client={client}>
      <AuthContextProvider
        user={user}
        updateUser={updateUser}
        getRedirectUri={jest.fn()}
        visit={defaultVisit}
        tokenRefreshed
      >
        <AnalyticsContext.Provider
          value={{
            trackEvent,
            trackEventStart: jest.fn(),
            trackEventEnd: jest.fn(),
            sendBeacon: jest.fn(),
          }}
        >
          <NotificationsContextProvider app={BootApp.Webapp}>
            <ProfileNotificationsPage />
          </NotificationsContextProvider>
        </AnalyticsContext.Provider>
      </AuthContextProvider>
    </QueryClientProvider>,
  );
};

it('should change user all email subscription', async () => {
  renderComponent();
  const data: UpdateProfileParameters = {
    acceptedMarketing: true,
    notificationEmail: true,
  };
  mockGraphQL(updateProfileMock(data));
  let personalizedDigestMutationCalled = false;
  mockGraphQL({
    request: {
      query: SUBSCRIBE_PERSONALIZED_DIGEST_MUTATION,
      variables: {
        day: 3,
        hour: 8,
        type: UserPersonalizedDigestType.Digest,
      },
    },
    result: () => {
      personalizedDigestMutationCalled = true;

      return {
        data: {
          subscribePersonalizedDigest: {
            preferredDay: 1,
            preferredHour: 9,
            preferredTimezone: 'Etc/UTC',
          },
        },
      };
    },
  });
  const subscription = await screen.findByTestId('email_notification-switch');
  expect(subscription).not.toBeChecked();
  fireEvent.click(subscription);
  await waitFor(() => {
    expect(updateUser).toBeCalledWith({ ...defaultLoggedUser, ...data });
    expect(personalizedDigestMutationCalled).toBe(true);
  });
});

it('should change user email marketing subscription', async () => {
  renderComponent();
  const data = { acceptedMarketing: true };
  mockGraphQL(updateProfileMock(data));
  const subscription = await screen.findByTestId('marketing-switch');
  expect(subscription).not.toBeChecked();
  subscription.click();
  await act(() => new Promise((resolve) => setTimeout(resolve, 100)));
  await waitForNock();
  expect(updateUser).toBeCalledWith({ ...defaultLoggedUser, ...data });
});

it('should change user notification email subscription', async () => {
  renderComponent();
  const data = { notificationEmail: true };
  mockGraphQL(updateProfileMock(data));
  const subscription = await screen.findByTestId('new_activity-switch');
  expect(subscription).not.toBeChecked();
  subscription.click();
  await act(() => new Promise((resolve) => setTimeout(resolve, 100)));
  await waitForNock();
  expect(updateUser).toBeCalledWith({ ...defaultLoggedUser, ...data });
});

it('should subscribe to personalized digest subscription', async () => {
  renderComponent();

  mockGraphQL({
    request: {
      query: SUBSCRIBE_PERSONALIZED_DIGEST_MUTATION,
      variables: {
        day: 3,
        hour: 8,
        type: UserPersonalizedDigestType.Digest,
      },
    },
    result: {
      data: {
        subscribePersonalizedDigest: {
          preferredDay: 1,
          preferredHour: 9,
          preferredTimezone: 'Etc/UTC',
        },
      },
    },
  });

  const subscription = await screen.findByTestId('personalized-digest-switch');
  await waitFor(() => expect(subscription).toBeEnabled());

  expect(subscription).not.toBeChecked();

  fireEvent.click(subscription);
  await waitForNock();

  expect(subscription).toBeChecked();
});

it('should unsubscribe from personalized digest subscription', async () => {
  personalizedDigestMock = {
    request: { query: GET_PERSONALIZED_DIGEST_SETTINGS, variables: {} },
    result: {
      data: {
        personalizedDigest: {
          preferredDay: 1,
          preferredHour: 9,
          preferredTimezone: 'Etc/UTC',
        },
      },
    },
  };

  renderComponent();

  mockGraphQL({
    request: { query: UNSUBSCRIBE_PERSONALIZED_DIGEST_MUTATION, variables: {} },
    result: {
      data: {
        _: true,
      },
    },
  });

  const subscription = await screen.findByTestId('personalized-digest-switch');
  await waitFor(() => expect(subscription).toBeEnabled());

  expect(subscription).toBeChecked();

  fireEvent.click(subscription);
  await waitForNock();

  expect(subscription).not.toBeChecked();
  expect(trackEvent).toHaveBeenCalledTimes(1);
  expect(trackEvent).toHaveBeenCalledWith({
    event_name: 'disable notification',
    extra: JSON.stringify({ channel: 'email', category: 'digest' }),
  });
});
