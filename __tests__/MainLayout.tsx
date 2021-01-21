import React from 'react';
import { render, RenderResult, screen } from '@testing-library/preact';
import MainLayout from '../components/layouts/MainLayout';
import AuthContext from '../components/AuthContext';
import { LoggedUser } from '../lib/user';

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
  const res = renderLayout();
  await res.findByText('Login');
});

it('should show login when clicking on the button', async () => {
  renderLayout();
  const el = await screen.findByText('Login');
  el.click();
  expect(showLogin).toBeCalledTimes(1);
});

it('should show profile image and reputation when logged-in', async () => {
  const res = renderLayout({
    id: 'u1',
    name: 'Ido Shamun',
    providers: ['github'],
    email: 'ido@acme.com',
    image: 'https://daily.dev/ido.png',
    createdAt: '',
    reputation: 5,
  });
  const el = await res.findByAltText('Your profile image');
  expect(el).toHaveAttribute('data-src', 'https://daily.dev/ido.png');
  const rep = await res.findByText('5');
  expect(rep).toBeInTheDocument();
});
