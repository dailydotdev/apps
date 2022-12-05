import React from 'react';
import nock from 'nock';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  Notification,
  NotificationType,
  NotificationsData,
  NOTIFICATIONS_QUERY,
  READ_NOTIFICATIONS_MUTATION,
} from '@dailydotdev/shared/src/graphql/notifications';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '@dailydotdev/shared/__tests__/helpers/graphql';
import { act } from 'preact/test-utils';
import { render, screen } from '@testing-library/preact';
import { NotificationsContextProvider } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { waitForNock } from '@dailydotdev/shared/__tests__/helpers/utilities';
import NotificationsPage from '../pages/notifications';

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
});
const sampleNotification: Notification = {
  id: 'notification',
  userId: 'lee',
  createdAt: new Date(),
  readAt: new Date(),
  icon: 'icon link',
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

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [fetchNotificationsMock()],
) => {
  const client = new QueryClient();

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
        <NotificationsContextProvider>
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
  const data: NotificationsData = { ...sampleNotificationData };
  data.notifications.pageInfo.hasNextPage = true;
  data.notifications.pageInfo.startCursor = 'start';
  data.notifications.pageInfo.endCursor = 'end';
  renderComponent([fetchNotificationsMock(data)]);
  await waitForNock();
  await act(() => new Promise((resolve) => setTimeout(resolve, 10)));
  const notif = screen.queryByText('Welcome to your new notification center!');
  expect(notif).not.toBeInTheDocument();
});

it('should get all notifications', async () => {
  renderComponent();
  await screen.findByText(sampleNotification.title);
});

it('should get all notifications and send a mutation to read all unread notifications', async () => {
  let mutationCalled = true;
  const data: NotificationsData = { ...sampleNotificationData };
  data.notifications.edges[0].node.readAt = null;
  renderComponent([
    fetchNotificationsMock(data),
    {
      request: { query: READ_NOTIFICATIONS_MUTATION },
      result: () => {
        mutationCalled = true;
        return null;
      },
    },
  ]);
  await screen.findByText(sampleNotification.title);
  expect(mutationCalled).toBeTruthy();
});
