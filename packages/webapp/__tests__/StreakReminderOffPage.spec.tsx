import React from 'react';
import nock from 'nock';
import type { RenderResult } from '@testing-library/react';
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import { mockGraphQL } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { waitForNock } from '@dailydotdev/shared/__tests__/helpers/utilities';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import {
  GET_NOTIFICATION_SETTINGS,
  GET_PERSONALIZED_DIGEST_SETTINGS,
  UNSUBSCRIBE_PERSONALIZED_DIGEST_MUTATION,
  UPDATE_NOTIFICATION_SETTINGS_MUTATION,
  UserPersonalizedDigestType,
} from '@dailydotdev/shared/src/graphql/users';
import { NotificationPreferenceStatus } from '@dailydotdev/shared/src/graphql/notifications';
import { NotificationType } from '@dailydotdev/shared/src/components/notifications/utils';
import { TOAST_NOTIF_KEY } from '@dailydotdev/shared/src/hooks/useToastNotification';
import type { ToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { LogEvent, TargetType } from '@dailydotdev/shared/src/lib/log';
import { AFTER_AUTH_PARAM } from '@dailydotdev/shared/src/components/auth/common';
import StreakReminderOffPage, {
  streakReminderOffToast,
  streakReminderSettingsPath,
} from '../pages/notifications/streak-reminder/off';

const LogContext = getLogContextStatic();
const path = '/notifications/streak-reminder/off';
const routerReplace = jest.fn();
const logEvent = jest.fn();
let client: QueryClient;

const notificationSettings = {
  [NotificationType.StreakReminder]: {
    email: NotificationPreferenceStatus.Muted,
    inApp: NotificationPreferenceStatus.Subscribed,
  },
  [NotificationType.StreakResetRestore]: {
    email: NotificationPreferenceStatus.Subscribed,
    inApp: NotificationPreferenceStatus.Subscribed,
  },
};

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
  client = new QueryClient();
  jest.mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: path,
        asPath: path,
        query: {},
        replace: routerReplace,
        push: jest.fn(),
        isReady: true,
      }) as unknown as NextRouter,
  );
});

const mockSettingsQueries = () => {
  mockGraphQL({
    request: { query: GET_PERSONALIZED_DIGEST_SETTINGS, variables: {} },
    result: {
      data: {
        personalizedDigest: [
          {
            preferredDay: 3,
            preferredHour: 20,
            type: UserPersonalizedDigestType.StreakReminder,
            flags: { sendType: 'workdays' },
            deliveryPaused: false,
          },
        ],
      },
    },
  });
  mockGraphQL({
    request: { query: GET_NOTIFICATION_SETTINGS },
    result: { data: { notificationSettings } },
  });
};

const renderPage = (user?: LoggedUser): RenderResult =>
  render(
    <QueryClientProvider client={client}>
      <AuthContextProvider
        user={user}
        updateUser={jest.fn()}
        getRedirectUri={jest.fn()}
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
          <StreakReminderOffPage />
        </LogContext.Provider>
      </AuthContextProvider>
    </QueryClientProvider>,
  );

it('should remove the reminder, mute the flag, toast and land on settings', async () => {
  mockSettingsQueries();
  mockGraphQL({
    request: {
      query: UPDATE_NOTIFICATION_SETTINGS_MUTATION,
      variables: {
        notificationFlags: {
          ...notificationSettings,
          [NotificationType.StreakReminder]: {
            email: NotificationPreferenceStatus.Muted,
            inApp: NotificationPreferenceStatus.Muted,
          },
        },
      },
    },
    result: { data: { updateNotificationSettings: { _: true } } },
  });
  mockGraphQL({
    request: {
      query: UNSUBSCRIBE_PERSONALIZED_DIGEST_MUTATION,
      variables: { type: UserPersonalizedDigestType.StreakReminder },
    },
    result: { data: { unsubscribePersonalizedDigest: { _: true } } },
  });

  renderPage(loggedUser);

  await waitForNock();
  await waitFor(() =>
    expect(routerReplace).toHaveBeenCalledWith(streakReminderSettingsPath),
  );
  expect(routerReplace).toHaveBeenCalledTimes(1);
  expect(client.getQueryData<ToastNotification>(TOAST_NOTIF_KEY)?.message).toBe(
    streakReminderOffToast,
  );
  expect(logEvent).toHaveBeenCalledWith({
    event_name: LogEvent.Click,
    target_type: TargetType.StreakReminderOptOut,
    extra: JSON.stringify({ origin: 'push' }),
  });
});

it('should send a signed-out reader to login and back to this link', async () => {
  renderPage();

  await waitFor(() => expect(routerReplace).toHaveBeenCalledTimes(1));
  const [redirect] = routerReplace.mock.calls[0];
  expect(redirect).toContain('onboarding?');
  expect(
    new URL(redirect, 'http://localhost').searchParams.get(AFTER_AUTH_PARAM),
  ).toBe(path);
  expect(logEvent).not.toHaveBeenCalled();
  expect(client.getQueryData(TOAST_NOTIF_KEY)).toBeFalsy();
});
