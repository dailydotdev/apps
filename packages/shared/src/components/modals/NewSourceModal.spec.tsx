import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from 'react-query';
import React from 'react';
import nock from 'nock';
import NewSourceModal from './NewSourceModal';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import {
  REQUEST_SOURCE_MUTATION,
  SOURCE_BY_FEED_QUERY,
} from '../../graphql/newSource';
import { AuthContextProvider } from '../../contexts/AuthContext';
import { AnonymousUser, LoggedUser } from '../../lib/user';

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

const defaultAnonymousUser: AnonymousUser = {
  id: 'anonymous user',
  firstVisit: 'first visit',
  referrer: 'string',
};

const renderComponent = (
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
        <NewSourceModal isOpen onRequestClose={onRequestClose} />
      </AuthContextProvider>
    </QueryClientProvider>,
  );
};

it('should show a message that no rss found', async () => {
  renderComponent();
  nock('http://localhost:3000')
    .get('/scrape/source')
    .query({ url: 'https://daily.dev' })
    .reply(200, { type: 'website', rss: [] });
  const input = await screen.findByRole('textbox');
  userEvent.type(input, 'https://daily.dev');
  const btn = await screen.findByLabelText('Search feeds');
  btn.click();
  expect(
    await screen.findByText('Could not find RSS feed'),
  ).toBeInTheDocument();
});

it('should show a contact button on an unexpected error', async () => {
  renderComponent();
  nock('http://localhost:3000')
    .get('/scrape/source')
    .query({ url: 'https://daily.dev' })
    .reply(200, { type: 'unavailable' });
  const input = await screen.findByRole('textbox');
  userEvent.type(input, 'https://daily.dev');
  const btn = await screen.findByLabelText('Search feeds');
  btn.click();
  expect(await screen.findByText('Contact')).toBeInTheDocument();
});

it('should show login modal for anonymous users', async () => {
  renderComponent(defaultAnonymousUser);
  const input = await screen.findByRole('textbox');
  userEvent.type(input, 'https://daily.dev');
  const btn = await screen.findByLabelText('Search feeds');
  btn.click();
  expect(
    await screen.findByTestId('login state: submit new source'),
  ).toBeInTheDocument();
});

it('should show if the source already exists in the system', async () => {
  renderComponent();
  nock('http://localhost:3000')
    .get('/scrape/source')
    .query({ url: 'https://daily.dev' })
    .reply(200, {
      type: 'website',
      rss: [
        { url: 'https://daily.dev/blog/rss.xml', title: 'RSS' },
        { url: 'https://blog.shamun.dev/rss.xml', title: 'Ido RSS' },
      ],
    });
  const input = await screen.findByRole('textbox');
  userEvent.type(input, 'https://daily.dev');
  userEvent.click(await screen.findByLabelText('Search feeds'));
  expect(await screen.findByText('RSS')).toBeInTheDocument();
  expect(await screen.findByText('Ido RSS')).toBeInTheDocument();
  userEvent.click(await screen.findByText('RSS'));

  mockGraphQL({
    request: {
      query: SOURCE_BY_FEED_QUERY,
      variables: { feed: 'https://daily.dev/blog/rss.xml' },
    },
    result: {
      data: {
        source: {
          id: 'daily',
          name: 'daily.dev',
          image: 'https://daily.dev',
        },
      },
    },
  });

  userEvent.click(await screen.findByText('Send for review'));
  expect(await screen.findByText('Already exists')).toBeInTheDocument();
});

it('should send source request', async () => {
  renderComponent();
  nock('http://localhost:3000')
    .get('/scrape/source')
    .query({ url: 'https://daily.dev' })
    .reply(200, {
      type: 'website',
      rss: [
        { url: 'https://daily.dev/blog/rss.xml', title: 'RSS' },
        { url: 'https://blog.shamun.dev/rss.xml', title: 'Ido RSS' },
      ],
    });
  const input = await screen.findByRole('textbox');
  userEvent.type(input, 'https://daily.dev');
  userEvent.click(await screen.findByLabelText('Search feeds'));
  expect(await screen.findByText('RSS')).toBeInTheDocument();
  expect(await screen.findByText('Ido RSS')).toBeInTheDocument();
  userEvent.click(await screen.findByText('RSS'));

  mockGraphQL({
    request: {
      query: SOURCE_BY_FEED_QUERY,
      variables: { feed: 'https://daily.dev/blog/rss.xml' },
    },
    result: {
      data: {
        source: null,
      },
    },
  });

  mockGraphQL({
    request: {
      query: REQUEST_SOURCE_MUTATION,
      variables: { data: { sourceUrl: 'https://daily.dev/blog/rss.xml' } },
    },
    result: {
      data: {
        source: {
          id: 'daily',
        },
      },
    },
  });

  userEvent.click(await screen.findByText('Send for review'));
  await waitFor(() => expect(onRequestClose).toBeCalledTimes(1));
});
