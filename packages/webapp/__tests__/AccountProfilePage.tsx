import React from 'react';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
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
  id: 'u1',
  username: 'lee',
  name: 'Lee Solevilla',
  providers: ['github'],
  email: 'lee@acme.com',
  image: 'https://daily.dev/lee.png',
  infoConfirmed: true,
  premium: false,
  createdAt: '2020-07-26T13:04:35.000Z',
  bio: 'The best company!',
  twitter: 'dailydotdev',
  github: 'dailydotdev',
  hashnode: 'dailydotdev',
  portfolio: 'https://daily.dev/?key=vaue',
  permalink: '/sample',
  company: 'dailydev',
  title: 'Test',
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
  expect((name as HTMLInputElement).value).toEqual(defaultLoggedUser.name);
  const username = screen.getByPlaceholderText('Username');
  expect(username).toBeInTheDocument();
  expect((username as HTMLInputElement).value).toEqual(
    defaultLoggedUser.username,
  );
});

it('should show about section', () => {
  renderComponent();
  const bio = screen.getByPlaceholderText('Bio');
  expect(bio).toBeInTheDocument();
  expect((bio as HTMLInputElement).value).toEqual(defaultLoggedUser.bio);
  const company = screen.getByPlaceholderText('Company');
  expect(company).toBeInTheDocument();
  expect((company as HTMLInputElement).value).toEqual(
    defaultLoggedUser.company,
  );
  const title = screen.getByPlaceholderText('Job Title');
  expect(title).toBeInTheDocument();
  expect((title as HTMLInputElement).value).toEqual(defaultLoggedUser.title);
});

it('should show profile social links', () => {
  renderComponent();
  const twitter = screen.getByPlaceholderText('Twitter');
  expect(twitter).toBeInTheDocument();
  expect((twitter as HTMLInputElement).value).toEqual(
    defaultLoggedUser.twitter,
  );
  const github = screen.getByPlaceholderText('GitHub');
  expect(github).toBeInTheDocument();
  expect((github as HTMLInputElement).value).toEqual(defaultLoggedUser.github);
  const hashnode = screen.getByPlaceholderText('Hashnode');
  expect(hashnode).toBeInTheDocument();
  expect((hashnode as HTMLInputElement).value).toEqual(
    defaultLoggedUser.hashnode,
  );
  const portfolio = screen.getByPlaceholderText('Your Website');
  expect(portfolio).toBeInTheDocument();
  expect((portfolio as HTMLInputElement).value).toEqual(
    defaultLoggedUser.portfolio,
  );
});
