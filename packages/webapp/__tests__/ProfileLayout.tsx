import React from 'react';
import { LoggedUser, PublicProfile } from '@dailydotdev/shared/src/lib/user';
import { render, RenderResult, screen } from '@testing-library/preact';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from 'react-query';
import { USER_READING_RANK_QUERY } from '@dailydotdev/shared/src/graphql/users';
import { mockGraphQL } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { waitForNock } from '@dailydotdev/shared/__tests__/helpers/utilities';
import ProfileLayout from '../components/layouts/ProfileLayout';

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
          tokenRefreshed: true,
        }}
      >
        <ProfileLayout profile={{ ...defaultProfile, ...profile }} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should show profile image', async () => {
  renderComponent();
  const el = await screen.findByAltText(`dailydotdev's profile`);
  expect(el).toHaveAttribute('data-src', defaultProfile.image);
});

it('should show join date', () => {
  renderComponent();
  const el = screen.getByText('August 2020');
  expect(el).toBeInTheDocument();
});

it('should show twitter link', () => {
  renderComponent();
  const el = screen.getByLabelText('Twitter');
  expect(el).toHaveAttribute('href', 'https://twitter.com/dailydotdev');
});

it('should show github link', () => {
  renderComponent();
  const el = screen.getByLabelText('GitHub');
  expect(el).toHaveAttribute('href', 'https://github.com/dailydotdev');
});

it('should show hashnode link', () => {
  renderComponent();
  const el = screen.getByLabelText('Hashnode');
  expect(el).toHaveAttribute('href', 'https://hashnode.com/@dailydotdev');
});

it('should show portfolio link', async () => {
  renderComponent();
  expect(await screen.findByLabelText('Portfolio')).toHaveAttribute(
    'href',
    'https://daily.dev/?key=vaue',
  );
  expect(await screen.findByText('daily.dev')).toBeInTheDocument();
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
        version: 2,
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
  await waitForNock();
  const el = await screen.findByTestId('rank');
  expect(el).toBeInTheDocument();
});
