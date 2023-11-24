import React from 'react';
import nock from 'nock';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Notification,
  NotificationsData,
  NOTIFICATIONS_QUERY,
  READ_NOTIFICATIONS_MUTATION,
} from '@dailydotdev/shared/src/graphql/notifications';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '@dailydotdev/shared/__tests__/helpers/graphql';
import { render, screen } from '@testing-library/react';
import { NotificationsContextProvider } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { waitForNock } from '@dailydotdev/shared/__tests__/helpers/utilities';
import {
  NotificationIconType,
  NotificationType,
} from '@dailydotdev/shared/src/components/notifications/utils';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { mocked } from 'ts-jest/utils';
import { NextRouter, useRouter } from 'next/router';
import NotificationsPage from '../pages/notifications';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
  mocked(useRouter).mockImplementation(
    () =>
      ({
        isFallback: false,
        query: {},
      } as unknown as NextRouter),
  );
});

const sampleNotification: Notification = {
  id: 'notification',
  userId: 'lee',
  createdAt: new Date(),
  readAt: new Date(),
  icon: NotificationIconType.Bell,
  title: 'Sample title',
  type: NotificationType.System,
  avatars: [],
  attachments: [],
  targetUrl: 'post url',
};

const sampleNotificationData = {
  notifications: {
    pageInfo: {},
    edges: [{ node: sampleNotification }],
  },
};

const fetchNotificationsMock = (
  data: NotificationsData = sampleNotificationData,
  variables = { first: 100, after: undefined },
): MockedGraphQLResponse<NotificationsData> => ({
  request: { query: NOTIFICATIONS_QUERY, variables },
  result: { data },
});

let client: QueryClient;

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [fetchNotificationsMock()],
  unreadCount = 0,
) => {
  client = new QueryClient();

  mocks.forEach(mockGraphQL);

  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{
          user: loggedUser,
          shouldShowLogin: false,
          showLogin: jest.fn(),
          logout: jest.fn(),
          updateUser: jest.fn(),
          tokenRefreshed: true,
          closeLogin: jest.fn(),
          getRedirectUri: jest.fn(),
        }}
      >
        <NotificationsContextProvider
          unreadCount={unreadCount}
          app={BootApp.Webapp}
        >
          <NotificationsPage />
        </NotificationsContextProvider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should show the welcome notification', async () => {
  renderComponent();
  await waitForNock();
  await screen.findByText('Welcome to your new notification center!');
});

it('should not show the welcome notification if we are not at the last page', async () => {
  const temp = globalThis.window.Notification;
  globalThis.window.Notification = {
    permission: 'default',
    requestPermission: jest.fn(),
  } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const data: NotificationsData = { ...sampleNotificationData };
  data.notifications.pageInfo.hasNextPage = true;
  data.notifications.pageInfo.startCursor = 'start';
  data.notifications.pageInfo.endCursor = 'end';
  renderComponent([fetchNotificationsMock(data)]);
  await waitForNock();
  const welcome = screen.queryByText(
    'Welcome to your new notification center!',
  );
  expect(welcome).not.toBeInTheDocument();
  globalThis.window.Notification = temp;
});

it('should get all notifications', async () => {
  renderComponent();
  await waitForNock();
  await screen.findByText(sampleNotification.title);
});

it('should get all notifications and send a mutation to read all unread notifications', async () => {
  let mutationCalled = false;
  const unreadCount = 2;
  const testData: NotificationsData = { ...sampleNotificationData };
  testData.notifications.edges[0].node.readAt = null;
  renderComponent(
    [
      fetchNotificationsMock(testData),
      {
        request: { query: READ_NOTIFICATIONS_MUTATION },
        result: () => {
          mutationCalled = true;
          return { data: { _: true } };
        },
      },
    ],
    unreadCount,
  );

  await screen.findByText(sampleNotification.title);
  await waitForNock();
  expect(mutationCalled).toBeTruthy();
});
