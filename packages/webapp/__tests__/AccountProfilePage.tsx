import React from 'react';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { render, RenderResult, screen } from '@testing-library/react';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
  roadmap: 'dailydotdev',
  threads: 'dailydotdev',
  codepen: 'dailydotdev',
  reddit: 'dailydotdev',
  stackoverflow: '999999/dailydotdev',
  youtube: 'dailydotdev',
  linkedin: 'dailydotdev',
  mastodon: 'https://mastodon.social/@dailydotdev',
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
  const el = await screen.findByTestId('image_avatar_file');
  expect(el).toHaveAttribute('src', defaultLoggedUser.image);
});

it('should show account information', () => {
  renderComponent();
  const name = screen.getByPlaceholderText('Name');
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
  const twitter = screen.getByPlaceholderText('X');
  expect(twitter).toBeInTheDocument();
  expect(twitter).toHaveValue(defaultLoggedUser.twitter);
  const github = screen.getByPlaceholderText('GitHub');
  expect(github).toBeInTheDocument();
  expect(github).toHaveValue(defaultLoggedUser.github);
  const portfolio = screen.getByPlaceholderText('Your Website');
  expect(portfolio).toBeInTheDocument();
  expect(portfolio).toHaveValue(defaultLoggedUser.portfolio);
  const roadmap = screen.getByPlaceholderText('Roadmap.sh');
  expect(roadmap).toBeInTheDocument();
  expect(roadmap).toHaveValue(defaultLoggedUser.roadmap);
  const threads = screen.getByPlaceholderText('Threads');
  expect(threads).toBeInTheDocument();
  expect(threads).toHaveValue(defaultLoggedUser.threads);
  const codepen = screen.getByPlaceholderText('CodePen');
  expect(codepen).toBeInTheDocument();
  expect(codepen).toHaveValue(defaultLoggedUser.codepen);
  const reddit = screen.getByPlaceholderText('Reddit');
  expect(reddit).toBeInTheDocument();
  expect(reddit).toHaveValue(defaultLoggedUser.reddit);
  const stackoverflow = screen.getByPlaceholderText('Stack Overflow');
  expect(stackoverflow).toBeInTheDocument();
  expect(stackoverflow).toHaveValue(
    `stackoverflow.com/users/${defaultLoggedUser.stackoverflow}`,
  );
  const youtube = screen.getByPlaceholderText('YouTube');
  expect(youtube).toBeInTheDocument();
  expect(youtube).toHaveValue(defaultLoggedUser.youtube);
  const linkedin = screen.getByPlaceholderText('LinkedIn');
  expect(linkedin).toBeInTheDocument();
  expect(linkedin).toHaveValue(defaultLoggedUser.linkedin);
  const mastodon = screen.getByPlaceholderText('Mastodon');
  expect(mastodon).toBeInTheDocument();
  expect(mastodon).toHaveValue(defaultLoggedUser.mastodon);
});
