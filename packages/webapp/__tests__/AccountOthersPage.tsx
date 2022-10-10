import React from 'react';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { mockSettingsFlow } from '@dailydotdev/shared/__tests__/fixture/auth';
import {
  fireEvent,
  render,
  RenderResult,
  screen,
} from '@testing-library/preact';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from 'react-query';
import { UPDATE_USER_PROFILE_MUTATION } from '@dailydotdev/shared/src/graphql/users';
import { mockGraphQL } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { getTimeZoneOptions } from '@dailydotdev/shared/src/lib/timezones';
import { act } from 'preact/test-utils';
import ProfileOthersPage from '../pages/account/others';

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
        <ProfileOthersPage />
      </AuthContextProvider>
    </QueryClientProvider>,
  );
};

it('should change user timezone', async () => {
  renderComponent();
  const { firstChild } = await screen.findByTestId('timezone_dropdown');
  fireEvent.click(firstChild);
  const [{ textContent }] = await screen.findAllByRole('menuitem');
  const tz = getTimeZoneOptions().find(({ label }) => label === textContent);
  const timezone = await screen.findByText(textContent);
  let mutationCalled = false;
  mockGraphQL({
    request: {
      query: UPDATE_USER_PROFILE_MUTATION,
      variables: { data: { timezone: tz.value } },
    },
    result: () => {
      mutationCalled = true;
      return { data: { id: '' } };
    },
  });
  fireEvent.click(timezone);
  await act(() => new Promise((resolve) => setTimeout(resolve, 100)));
  expect(mutationCalled).toBeTruthy();
});

it('should change user email subscription', async () => {
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
  const text = 'Subscribe to the Community Newsletter';
  const subscription = await screen.findByText(text);
  await subscription.click();
  await act(() => new Promise((resolve) => setTimeout(resolve, 100)));
  expect(mutationCalled).toBeTruthy();
});
