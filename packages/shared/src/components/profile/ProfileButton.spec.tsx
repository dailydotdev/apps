import React from 'react';
import { waitFor, render, RenderResult, screen } from '@testing-library/react';
import ProfileButton, { ProfileButtonProps } from './ProfileButton';
import AuthContext from '../../contexts/AuthContext';
import defaultUser from '../../../__tests__/fixture/loggedUser';

const onShowDndClick = jest.fn();
const logout = jest.fn();

const renderComponent = (props: ProfileButtonProps): RenderResult => {
  return render(
    <AuthContext.Provider
      value={{
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
      <ProfileButton {...props} />
    </AuthContext.Provider>,
  );
};

it('should click the account details and show the pop up', async () => {
  renderComponent({ onShowDndClick });

  const profileBtn = await screen.findByLabelText('Profile settings');
  profileBtn.click();

  const accountBtn = await screen.findByText('Account details');
  accountBtn.click();

  await waitFor(async () =>
    expect(await screen.findByRole('dialog')).toBeInTheDocument(),
  );
});

it('should click the logout button and logout', async () => {
  renderComponent({ onShowDndClick });

  const profileBtn = await screen.findByLabelText('Profile settings');
  profileBtn.click();

  const logoutBtn = await screen.findByText('Logout');
  logoutBtn.click();

  await waitFor(async () => expect(logout).toBeCalled());
});
