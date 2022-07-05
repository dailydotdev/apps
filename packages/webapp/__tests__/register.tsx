import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import SettingsContext, {
  SettingsContextData,
} from '@dailydotdev/shared/src/contexts/SettingsContext';
import { LoggedUser, updateProfile } from '@dailydotdev/shared/src/lib/user';
import { render, RenderResult, screen, waitFor } from '@testing-library/preact';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { mocked } from 'ts-jest/utils';
import { NextRouter, useRouter } from 'next/router';
import { getUserDefaultTimezone } from '@dailydotdev/shared/src/lib/timezones';
import user from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import Page from '../pages/register';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/lib/user', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/lib/user'),
  updateProfile: jest.fn(),
}));

const logout = jest.fn();
const userTimezone = getUserDefaultTimezone();

beforeEach(() => {
  jest.clearAllMocks();
  mocked(useRouter).mockImplementation(
    () =>
      ({
        isFallback: false,
        query: {},
        replace: jest.fn(),
      } as unknown as NextRouter),
  );
});

const renderComponent = (
  userUpdate: Partial<LoggedUser> = {},
): RenderResult => {
  const client = new QueryClient();
  const settingsContext: SettingsContextData = {
    spaciness: 'eco',
    showOnlyUnreadPosts: false,
    openNewTab: true,
    setTheme: jest.fn(),
    themeMode: 'dark',
    setSpaciness: jest.fn(),
    toggleOpenNewTab: jest.fn(),
    toggleShowOnlyUnreadPosts: jest.fn(),
    insaneMode: false,
    loadedSettings: true,
    toggleInsaneMode: jest.fn(),
    showTopSites: true,
    toggleShowTopSites: jest.fn(),
  };

  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{
          user: { ...user, ...userUpdate },
          shouldShowLogin: false,
          showLogin: jest.fn(),
          updateUser: jest.fn(),
          logout,
          tokenRefreshed: true,
        }}
      >
        <SettingsContext.Provider value={settingsContext}>
          <Page />
        </SettingsContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should show profile image', () => {
  renderComponent();
  const el = screen.getByAltText(`${user.username}'s profile`);
  expect(el).toHaveAttribute('data-src', user.image);
});

it('should submit information on button click', async () => {
  renderComponent({ username: 'idoshamun' });
  mocked(updateProfile).mockResolvedValue(user);
  screen.getByText('Finish').click();
  await waitFor(() => expect(updateProfile).toBeCalledTimes(1));
  expect(updateProfile).toBeCalledWith({
    name: 'Ido Shamun',
    email: 'ido@acme.com',
    username: 'idoshamun',
    company: null,
    title: null,
    acceptedMarketing: false,
    bio: 'Software Engineer in the most amazing company in the globe',
    github: null,
    portfolio: null,
    timezone: userTimezone,
    twitter: null,
    hashnode: null,
  });
});

it('should logout on button click', async () => {
  renderComponent();
  screen.getByText('Logout').click();
  await waitFor(() => expect(logout).toBeCalledTimes(1));
});

it('should enable submit when form is valid', () => {
  renderComponent({ username: 'idoshamun' });
  const el = screen.getByText('Finish');
  expect(el).toBeEnabled();
});

it('should set twitter to optional by default', async () => {
  renderComponent();
  const el = await screen.findByText('Twitter');
  expect(
    // eslint-disable-next-line testing-library/no-node-access
    el.parentElement.querySelector('input').getAttribute('required'),
  ).toBeFalsy();
});

it('should set twitter to required in author mode', async () => {
  mocked(useRouter).mockImplementation(
    () =>
      ({
        isFallback: false,
        query: { mode: 'author' },
      } as unknown as NextRouter),
  );
  renderComponent();
  const el = await screen.findByText('Twitter');
  // eslint-disable-next-line testing-library/no-node-access
  expect(el.parentElement.querySelector('input')).toBeRequired();
});
