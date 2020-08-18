import React from 'react';
import { render, RenderResult, screen } from '@testing-library/react';
import MainLayout from '../components/MainLayout';
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
        showProfile: jest.fn(),
        logout: jest.fn(),
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

it('should show profile image when logged-in', async () => {
  const res = renderLayout({
    id: 'u1',
    image: 'https://daily.dev/ido.png',
    providers: ['github'],
  });
  const el = await res.findByAltText('Your profile image');
  expect(el).toHaveAttribute('data-src', 'https://daily.dev/ido.png');
});
