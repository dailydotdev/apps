import React from 'react';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { mockSettingsFlow } from '@dailydotdev/shared/__tests__/fixture/auth';
import { render, RenderResult, screen } from '@testing-library/preact';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from 'react-query';
import { UPDATE_USER_PROFILE_MUTATION } from '@dailydotdev/shared/src/graphql/users';
import { mockGraphQL } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { act } from 'preact/test-utils';
import ProfileNotificationsPage from '../pages/account/notifications';

jest.mock('next/router', () => ({
  useRouter() {
    return {
      isFallback: false,
    };
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

const defaultLoggedUser: LoggedUser = {
  ...loggedUser,
  twitter: 'dailydotdev',
  github: 'dailydotdev',
  hashnode: 'dailydotdev',
  portfolio: 'https://daily.dev/?key=vaue',
  acceptedMarketing: true,
  pushNotification: true,
  newActivityEmail: true,
};

const updateUser = jest.fn();

const renderComponent = (): RenderResult => {
  const client = new QueryClient();
  mockSettingsFlow();

  return render(
    <QueryClientProvider client={client}>
      <AuthContextProvider
        user={defaultLoggedUser}
        updateUser={updateUser}
        getRedirectUri={jest.fn()}
        tokenRefreshed
      >
        <ProfileNotificationsPage />
      </AuthContextProvider>
    </QueryClientProvider>,
  );
};

it('should change user push notification', async () => {
  let mutationCalled = false;
  const pushNotification = false;
  mockGraphQL({
    request: {
      query: UPDATE_USER_PROFILE_MUTATION,
      variables: { data: { pushNotification } },
    },
    result: () => {
      mutationCalled = true;
      return { data: { id: '' } };
    },
  });
  renderComponent();
  const subscription = await screen.findByTestId('push_notification-switch');
  await subscription.click();
  await act(() => new Promise((resolve) => setTimeout(resolve, 100)));
  expect(mutationCalled).toBeTruthy();
});

it('should change user all email subscription', async () => {
  let mutationCalled = false;
  const data = { acceptedMarketing: false, newActivityEmail: false };
  mockGraphQL({
    request: {
      query: UPDATE_USER_PROFILE_MUTATION,
      variables: { data },
    },
    result: () => {
      mutationCalled = true;
      return { data: { id: '' } };
    },
  });
  renderComponent();
  const subscription = await screen.findByTestId('email_notification-switch');
  await subscription.click();
  await act(() => new Promise((resolve) => setTimeout(resolve, 100)));
  expect(mutationCalled).toBeTruthy();
});

it('should change user email marketing subscription', async () => {
  let mutationCalled = false;
  const acceptedMarketing = false;
  mockGraphQL({
    request: {
      query: UPDATE_USER_PROFILE_MUTATION,
      variables: { data: { acceptedMarketing } },
    },
    result: () => {
      mutationCalled = true;
      return { data: { id: '' } };
    },
  });
  renderComponent();
  const text = 'Marketing updates';
  const subscription = await screen.findByText(text);
  await subscription.click();
  await act(() => new Promise((resolve) => setTimeout(resolve, 100)));
  expect(mutationCalled).toBeTruthy();
});

it('should change user email subscription', async () => {
  let mutationCalled = false;
  const newActivityEmail = false;
  mockGraphQL({
    request: {
      query: UPDATE_USER_PROFILE_MUTATION,
      variables: { data: { newActivityEmail } },
    },
    result: () => {
      mutationCalled = true;
      return { data: { id: '' } };
    },
  });
  renderComponent();
  const text = 'New activity notifications (mentions, replies, etc.)';
  const subscription = await screen.findByText(text);
  await subscription.click();
  await act(() => new Promise((resolve) => setTimeout(resolve, 100)));
  expect(mutationCalled).toBeTruthy();
});
