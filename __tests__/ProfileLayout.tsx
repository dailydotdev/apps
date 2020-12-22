import React from 'react';
import { LoggedUser, PublicProfile } from '../lib/user';
import { render, RenderResult, screen, waitFor } from '@testing-library/preact';
import AuthContext from '../components/AuthContext';
import Index from '../components/layouts/ProfileLayout';
import { QueryClient, QueryClientProvider } from 'react-query';
import { mockGraphQL } from './helpers/graphql';
import { USER_READING_RANK_QUERY } from '../graphql/users';
import nock from 'nock';

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
  hashnode: 'dailydotdev',
  portfolio: 'https://daily.dev/?key=vaue',
};

const renderComponent = (
  profile: Partial<PublicProfile> = {},
): RenderResult => {
  const client = new QueryClient();

  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{
          user: defaultLoggedUser,
          shouldShowLogin: false,
          showLogin: jest.fn(),
          logout: jest.fn(),
          updateUser: jest.fn(),
        }}
      >
        <Index profile={{ ...defaultProfile, ...profile }} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should show profile image', async () => {
  renderComponent();
  const el = await screen.findByAltText(`Daily Dev's profile image`);
  expect(el).toHaveAttribute('src', defaultProfile.image);
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

it('should show hashnode link', () => {
  renderComponent();
  const el = screen.getByTitle('Go to Hashnode');
  expect(el).toHaveAttribute('href', 'https://hashnode.com/@dailydotdev');
});

it('should show portfolio link', () => {
  renderComponent();
  const el = screen.getByTitle('Go to portfolio website');
  expect(el).toHaveAttribute('href', 'https://daily.dev/?key=vaue');
  expect(el).toHaveTextContent('daily.dev');
});

it('should not show rank when not loaded', () => {
  renderComponent();
  const el = screen.queryByTestId('rank');
  expect(el).not.toBeInTheDocument();
});

it('should show rank when loaded', async () => {
  mockGraphQL({
    request: {
      query: USER_READING_RANK_QUERY,
      variables: {
        id: defaultProfile.id,
      },
    },
    result: {
      data: {
        userReadingRank: {
          currentRank: 1,
        },
      },
    },
  });
  renderComponent();
  await waitFor(() => nock.isDone());
  const el = await screen.findByTestId('rank');
  expect(el).toBeInTheDocument();
});
