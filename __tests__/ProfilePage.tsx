import React from 'react';
import { LoggedUser, PublicProfile } from '../lib/user';
import { render, RenderResult, screen } from '@testing-library/react';
import AuthContext from '../components/AuthContext';
import Page from '../pages/[userId]';

beforeEach(() => {
  jest.resetAllMocks();
});

const defaultLoggedUser: LoggedUser = {
  id: 'u1',
  name: 'Ido Shamun',
  providers: ['github'],
  email: 'ido@acme.com',
  image: 'https://daily.dev/ido.png',
  infoConfirmed: true,
  premium: false,
  createdAt: '2020-07-26T13:04:35.000Z',
};

const defaultProfile: PublicProfile = {
  id: 'u2',
  name: 'Daily Dev',
  username: 'dailydotdev',
  premium: false,
  reputation: 20,
  image: 'https://daily.dev/daily.png',
  bio: 'The best company!',
  createdAt: '2020-08-26T13:04:35.000Z',
  twitter: 'dailydotdev',
  github: 'dailydotdev',
  portfolio: 'https://daily.dev',
};

const renderComponent = (
  profile: Partial<PublicProfile> = {},
): RenderResult => {
  return render(
    <AuthContext.Provider
      value={{
        user: defaultLoggedUser,
        shouldShowLogin: false,
        showLogin: jest.fn(),
        showProfile: jest.fn(),
        logout: jest.fn(),
      }}
    >
      <Page profile={{ ...defaultProfile, ...profile }} />
    </AuthContext.Provider>,
  );
};

it('should show profile image', () => {
  renderComponent();
  const el = screen.getByAltText(`Daily Dev's profile image`);
  expect(el).toHaveAttribute('data-src', defaultProfile.image);
});

it('should show join date', () => {
  renderComponent();
  const el = screen.getByText('August 2020');
  expect(el).toBeInTheDocument();
});

it('should show twitter link', () => {
  renderComponent();
  const el = screen.getByTitle('Go to Twitter');
  expect(el).toHaveAttribute('href', 'https://twitter.com/dailydotdev');
});

it('should show github link', () => {
  renderComponent();
  const el = screen.getByTitle('Go to GitHub');
  expect(el).toHaveAttribute('href', 'https://github.com/dailydotdev');
});

it('should show portfolio link', () => {
  renderComponent();
  const el = screen.getByTitle('Go to portfolio website');
  expect(el).toHaveAttribute('href', 'https://daily.dev');
  expect(el).toHaveTextContent('daily.dev');
});
