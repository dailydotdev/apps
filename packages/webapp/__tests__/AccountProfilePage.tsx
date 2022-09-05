import React from 'react';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { render, RenderResult, screen } from '@testing-library/preact';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from 'react-query';
import AccountProfilePage from '../pages/account/profile';

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
  ...loggedUser,
  title: 'Daily Developer',
  company: 'dailydev',
  twitter: 'dailydotdev',
  github: 'dailydotdev',
  hashnode: 'dailydotdev',
  portfolio: 'https://daily.dev/?key=vaue',
  acceptedMarketing: true,
};
const updateUser = jest.fn();

const renderComponent = (): RenderResult => {
  const client = new QueryClient();

  return render(
    <QueryClientProvider client={client}>
      <AuthContextProvider
        user={defaultLoggedUser}
        updateUser={updateUser}
        getRedirectUri={jest.fn()}
        tokenRefreshed
      >
        <AccountProfilePage />
      </AuthContextProvider>
    </QueryClientProvider>,
  );
};

it('should show profile image', async () => {
  renderComponent();
  const el = await screen.findByAltText('File upload preview');
  expect(el).toHaveAttribute('src', defaultLoggedUser.image);
});

it('should show account information', () => {
  renderComponent();
  const name = screen.getByPlaceholderText('Full Name');
  expect(name).toBeInTheDocument();
  expect(name).toHaveValue(defaultLoggedUser.name);
  const username = screen.getByPlaceholderText('Username');
  expect(username).toBeInTheDocument();
  expect(username).toHaveValue(defaultLoggedUser.username);
});

it('should show about section', () => {
  renderComponent();
  const bio = screen.getByPlaceholderText('Bio');
  expect(bio).toBeInTheDocument();
  expect(bio).toHaveValue(defaultLoggedUser.bio);
  const company = screen.getByPlaceholderText('Company');
  expect(company).toBeInTheDocument();
  expect(company).toHaveValue(defaultLoggedUser.company);
  const title = screen.getByPlaceholderText('Job Title');
  expect(title).toBeInTheDocument();
  expect(title).toHaveValue(defaultLoggedUser.title);
});

it('should show profile social links', () => {
  renderComponent();
  const twitter = screen.getByPlaceholderText('Twitter');
  expect(twitter).toBeInTheDocument();
  expect(twitter).toHaveValue(defaultLoggedUser.twitter);
  const github = screen.getByPlaceholderText('GitHub');
  expect(github).toBeInTheDocument();
  expect(github).toHaveValue(defaultLoggedUser.github);
  const hashnode = screen.getByPlaceholderText('Hashnode');
  expect(hashnode).toBeInTheDocument();
  expect(hashnode).toHaveValue(defaultLoggedUser.hashnode);
  const portfolio = screen.getByPlaceholderText('Your Website');
  expect(portfolio).toBeInTheDocument();
  expect(portfolio).toHaveValue(defaultLoggedUser.portfolio);
});
