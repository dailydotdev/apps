import { render, RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from 'react-query';
import React from 'react';
import nock from 'nock';
import { AuthContextProvider } from '../../contexts/AuthContext';
import { AnonymousUser, LoggedUser } from '../../lib/user';
import RecommendAnArticle from './RecommendAnArticle';

const onRequestClose = jest.fn();

beforeEach(async () => {
  nock.cleanAll();
  jest.clearAllMocks();
});

const defaultUser: LoggedUser = {
  id: 'u1',
  name: 'Ido Shamun',
  providers: ['github'],
  email: 'ido@acme.com',
  image: 'https://daily.dev/ido.png',
  infoConfirmed: true,
  premium: false,
  createdAt: '2020-07-26T13:04:35.000Z',
  username: 'test',
  permalink: 'sample',
};

const renderComponent = (
  isEnabled = false,
  user: LoggedUser | AnonymousUser = defaultUser,
): RenderResult => {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <AuthContextProvider
        user={user}
        updateUser={jest.fn()}
        tokenRefreshed
        getRedirectUri={jest.fn()}
        loadingUser={false}
        loadedUserFromCache
      >
        <RecommendAnArticle
          isEnabled={isEnabled}
          isOpen
          onRequestClose={onRequestClose}
        />
      </AuthContextProvider>
    </QueryClientProvider>,
  );
};

it('should show request access for certain users', async () => {
  renderComponent();
  expect(await screen.findByLabelText('Request access')).toBeInTheDocument();
});

it('should show a message no URL was set', async () => {
  renderComponent(true);
  const btn = await screen.findByLabelText('Submit article');
  btn.click();
  expect(
    await screen.findByText('Please submit a valid URL'),
  ).toBeInTheDocument();
});

it('should disable the button on invalid URL', async () => {
  renderComponent(true);
  const input = await screen.findByRole('textbox');
  userEvent.type(input, 'fakeURL');
  const btn = await screen.findByLabelText('Submit article');
  expect(btn).toBeDisabled();
});

it('should submit a valid URL', async () => {
  // TODO
});

it('should feedback existing article', async () => {
  // TODO
});

it('should feedback processing article', async () => {
  // TODO
});

it('should feedback rejected article', async () => {
  // TODO
});
