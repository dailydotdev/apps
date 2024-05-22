import React from 'react';
import {
  act,
  fireEvent,
  render,
  RenderResult,
  screen,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TimezoneDropdown } from './TimezoneDropdown';
import { LoggedUser } from '../../lib/user';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { AuthContextProvider } from '../../contexts/AuthContext';
import { getTimeZoneOptions } from '../../lib/timezones';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import { UPDATE_USER_PROFILE_MUTATION } from '../../graphql/users';

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

  return render(
    <QueryClientProvider client={client}>
      <AuthContextProvider
        user={defaultLoggedUser}
        updateUser={updateUser}
        getRedirectUri={jest.fn()}
        tokenRefreshed
      >
        <TimezoneDropdown
          userTimeZone="Europe/Amsterdam"
          setUserTimeZone={jest.fn()}
        />
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
