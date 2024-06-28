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
import LogContext from '@dailydotdev/shared/src/contexts/LogContext';
import { SendType } from '@dailydotdev/shared/src/hooks';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import { settingsContext } from '@dailydotdev/shared/__tests__/helpers/boot';
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
const logEvent = jest.fn();

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
        <LogContext.Provider
          value={{
            logEvent,
            logEventStart: jest.fn(),
            logEventEnd: jest.fn(),
            sendBeacon: jest.fn(),
          }}
        >
          <SettingsContext.Provider value={settingsContext}>
            <NotificationsContextProvider app={BootApp.Webapp}>
              <ProfileNotificationsPage />
            </NotificationsContextProvider>
          </SettingsContext.Provider>
        </LogContext.Provider>
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
        sendType: SendType.Weekly,
      },
    },
    result: () => {
      personalizedDigestMutationCalled = true;

      return {
        data: {
          subscribePersonalizedDigest: {
            preferredDay: 1,
            preferredHour: 9,
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

  expect(logEvent).toHaveBeenCalledTimes(1);
  expect(logEvent).toHaveBeenCalledWith({
    event_name: 'enable notification',
    extra: JSON.stringify({
      channel: 'email',
      category: ['product', 'marketing', 'digest'],
    }),
  });
});

it('should unsubscribe from all email campaigns', async () => {
  renderComponent({
    ...defaultLoggedUser,
    acceptedMarketing: true,
    notificationEmail: true,
  });

  const data: UpdateProfileParameters = {
    acceptedMarketing: false,
    notificationEmail: false,
  };
  mockGraphQL(updateProfileMock(data));

  const subscription = await screen.findByTestId('email_notification-switch');
  expect(subscription).toBeChecked();
  fireEvent.click(subscription);

  mockGraphQL({
    request: {
      query: UNSUBSCRIBE_PERSONALIZED_DIGEST_MUTATION,
      variables: { type: UserPersonalizedDigestType.Digest },
    },
    result: {
      data: {
        _: true,
      },
    },
  });

  await waitFor(() => {
    expect(updateUser).toBeCalledWith({ ...defaultLoggedUser, ...data });
  });

  expect(logEvent).toHaveBeenCalledTimes(1);
  expect(logEvent).toHaveBeenCalledWith({
    event_name: 'disable notification',
    extra: JSON.stringify({
      channel: 'email',
      category: ['product', 'marketing', 'digest'],
    }),
  });
});

it('should subscribe to user email marketing subscription', async () => {
  renderComponent();
  const data = { acceptedMarketing: true };
  mockGraphQL(updateProfileMock(data));
  const subscription = await screen.findByTestId('marketing-switch');
  expect(subscription).not.toBeChecked();
  subscription.click();
  await act(() => new Promise((resolve) => setTimeout(resolve, 100)));
  await waitForNock();
  expect(updateUser).toBeCalledWith({ ...defaultLoggedUser, ...data });

  expect(logEvent).toHaveBeenCalledTimes(1);
  expect(logEvent).toHaveBeenCalledWith({
    event_name: 'enable notification',
    extra: JSON.stringify({
      channel: 'email',
      category: 'marketing',
    }),
  });
});

it('should unsubscribe to user email marketing subscription', async () => {
  renderComponent({ ...defaultLoggedUser, acceptedMarketing: true });
  const data = { acceptedMarketing: false };
  mockGraphQL(updateProfileMock(data));
  const subscription = await screen.findByTestId('marketing-switch');
  expect(subscription).toBeChecked();
  subscription.click();
  await act(() => new Promise((resolve) => setTimeout(resolve, 100)));
  await waitForNock();
  expect(updateUser).toBeCalledWith({ ...defaultLoggedUser, ...data });

  expect(logEvent).toHaveBeenCalledTimes(1);
  expect(logEvent).toHaveBeenCalledWith({
    event_name: 'disable notification',
    extra: JSON.stringify({
      channel: 'email',
      category: 'marketing',
    }),
  });
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
        sendType: SendType.Weekly,
      },
    },
    result: {
      data: {
        subscribePersonalizedDigest: {
          preferredDay: 1,
          preferredHour: 9,
          type: UserPersonalizedDigestType.Digest,
          flags: {
            sendType: SendType.Weekly,
          },
        },
      },
    },
  });

  const subscription = await screen.findByLabelText('Weekly');
  expect(subscription).not.toBeChecked();

  fireEvent.click(subscription);
  await waitForNock();

  expect(subscription).toBeChecked();

  expect(logEvent).toHaveBeenCalledTimes(2);
  expect(logEvent).toHaveBeenCalledWith({
    event_name: 'enable notification',
    extra: JSON.stringify({
      channel: 'email',
      category: 'digest',
    }),
  });
  expect(logEvent).toHaveBeenCalledWith({
    event_name: 'schedule digest',
    extra: JSON.stringify({ hour: 8, frequency: 'weekly' }),
  });
});

it('should unsubscribe from personalized digest subscription', async () => {
  personalizedDigestMock = {
    request: { query: GET_PERSONALIZED_DIGEST_SETTINGS, variables: {} },
    result: {
      data: {
        personalizedDigest: [
          {
            preferredDay: 1,
            preferredHour: 9,
            type: UserPersonalizedDigestType.Digest,
            flags: {
              sendType: SendType.Weekly,
            },
          },
        ],
      },
    },
  };

  renderComponent();

  mockGraphQL({
    request: {
      query: UNSUBSCRIBE_PERSONALIZED_DIGEST_MUTATION,
      variables: { type: UserPersonalizedDigestType.Digest },
    },
    result: {
      data: {
        _: true,
      },
    },
  });

  const subscription = await screen.findByLabelText('Weekly');
  await waitFor(() => expect(subscription).toBeChecked());

  const unsubscribe = screen.getByText('Off');
  fireEvent.click(unsubscribe);
  await waitForNock();

  expect(subscription).not.toBeChecked();
  expect(logEvent).toHaveBeenCalledTimes(1);
  expect(logEvent).toHaveBeenCalledWith({
    event_name: 'disable notification',
    extra: JSON.stringify({ channel: 'email', category: 'digest' }),
  });
});

it('should change hour for personalized digest subscription', async () => {
  personalizedDigestMock = {
    request: { query: GET_PERSONALIZED_DIGEST_SETTINGS, variables: {} },
    result: {
      data: {
        personalizedDigest: [
          {
            preferredDay: 1,
            preferredHour: 9,
            type: UserPersonalizedDigestType.Digest,
            flags: {
              sendType: SendType.Weekly,
            },
          },
        ],
      },
    },
  };

  renderComponent();

  const subscription = await screen.findByLabelText('Weekly');
  await waitFor(() => expect(subscription).toBeChecked());

  mockGraphQL({
    request: {
      query: SUBSCRIBE_PERSONALIZED_DIGEST_MUTATION,
      variables: {
        day: 3,
        hour: 0,
        type: UserPersonalizedDigestType.Digest,
        sendType: SendType.Weekly,
      },
    },
    result: {
      data: {
        subscribePersonalizedDigest: {
          preferredDay: 1,
          preferredHour: 0,
          type: UserPersonalizedDigestType.Digest,
          flags: {
            sendType: SendType.Weekly,
          },
        },
      },
    },
  });

  const { firstChild } = await screen.findByTestId('hour-dropdown');
  fireEvent.click(firstChild);
  const selectedHour = await screen.findByText('00:00');
  fireEvent.click(selectedHour);

  expect(logEvent).toHaveBeenCalledTimes(1);
  expect(logEvent).toHaveBeenCalledWith({
    event_name: 'schedule digest',
    extra: JSON.stringify({ hour: 0, frequency: 'weekly' }),
  });
});
