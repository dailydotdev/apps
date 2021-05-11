import React from 'react';
import { render, RenderResult, screen } from '@testing-library/preact';
import MainLayout from '../components/layouts/MainLayout';
import AuthContext from '../contexts/AuthContext';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';

const showLogin = jest.fn();

beforeEach(() => {
  showLogin.mockReset();
});

const renderLayout = (user: LoggedUser = null): RenderResult => {
  return render(
    <AuthContext.Provider
      value={{
        user,
        shouldShowLogin: false,
        showLogin,
        logout: jest.fn(),
        updateUser: jest.fn(),
        tokenRefreshed: true,
      }}
    >
      <MainLayout />
    </AuthContext.Provider>,
  );
};

it('should show login button when not logged-in', async () => {
  renderLayout();
  await screen.findByText('Login');
});

it('should show login when clicking on the button', async () => {
  renderLayout();
  const el = await screen.findByText('Login');
  el.click();
  expect(showLogin).toBeCalledTimes(1);
});

it('should show profile image and reputation when logged-in', async () => {
  renderLayout({
    id: 'u1',
    name: 'Ido Shamun',
    providers: ['github'],
    email: 'ido@acme.com',
    image: 'https://daily.dev/ido.png',
    createdAt: '',
    reputation: 5,
  });
  const el = await screen.findByAltText('Your profile image');
  expect(el).toHaveAttribute('data-src', 'https://daily.dev/ido.png');
  const rep = await screen.findByText('5');
  expect(rep).toBeInTheDocument();
});
