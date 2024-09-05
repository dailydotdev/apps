import { QueryClient } from '@tanstack/react-query';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import React from 'react';

import defaultUser from '../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import ProfileButton from './ProfileButton';

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

it('account details should link to account profile page', async () => {
  renderComponent();

  const profileBtn = await screen.findByLabelText('Profile settings');
  profileBtn.click();

  const accountBtn = await screen.findByText('Account details');
  expect(accountBtn).toHaveAttribute('href', '/account/profile');
});

it('should click the logout button and logout', async () => {
  renderComponent();

  const profileBtn = await screen.findByLabelText('Profile settings');
  profileBtn.click();

  const logoutBtn = await screen.findByText('Logout');
  logoutBtn.click();

  await waitFor(async () => expect(logout).toBeCalled());
});
