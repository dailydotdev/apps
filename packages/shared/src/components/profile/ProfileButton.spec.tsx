import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import type { RenderResult } from '@testing-library/react';
import { waitFor, render, screen, act } from '@testing-library/react';
import ProfileButton from './ProfileButton';
import defaultUser from '../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../__tests__/helpers/boot';

jest.mock('next/router', () => ({
  useRouter: () => ({
    events: {
      on: jest.fn(),
      off: jest.fn(),
    },
    pathname: '/',
    query: {},
  }),
}));

const logout = jest.fn();

const renderComponent = (): RenderResult => {
  const client = new QueryClient();

  return render(
    <TestBootProvider
      client={client}
      auth={{
        user: defaultUser,
        shouldShowLogin: false,
        showLogin: jest.fn(),
        logout,
        updateUser: jest.fn(),
        tokenRefreshed: true,
        getRedirectUri: jest.fn(),
        closeLogin: jest.fn(),
        trackingId: '21',
        loginState: null,
      }}
    >
      <ProfileButton />
    </TestBootProvider>,
  );
};

it('should show settings option that opens modal', async () => {
  renderComponent();

  const profileBtn = await screen.findByLabelText('Profile settings');
  await act(async () => {
    profileBtn.click();
  });

  const settingsButton = await screen.findByRole('link', {
    name: 'Settings',
  });
  expect(settingsButton).toBeInTheDocument();
});

it('should click the logout button and logout', async () => {
  renderComponent();

  const profileBtn = await screen.findByLabelText('Profile settings');
  await act(async () => {
    profileBtn.click();
  });

  const logoutBtn = await screen.findByText('Log out');
  logoutBtn.click();

  await waitFor(async () => expect(logout).toBeCalled());
});
