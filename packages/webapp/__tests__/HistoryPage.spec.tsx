import React from 'react';
import { render, RenderResult, screen } from '@testing-library/preact';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import nock from 'nock';
import { ReadHistoryData } from '@dailydotdev/shared/src/hooks/useInfiniteReadingHistory';
import { READING_HISTORY_QUERY } from '@dailydotdev/shared/src/graphql/users';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MockedGraphQLResponse, mockGraphQL } from './helpers/graphql';
import HistoryPage from '../pages/history';
import { waitForNock } from './helpers/utilities';

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
});

const timestamp = new Date('2021-10-22T07:15:51.247Z');
const edge = {
  node: {
    timestamp,
    post: {
      id: 'p1',
      title: 'Most Recent Post',
      commentsPermalink: 'most.recent.post.url',
      image: 'most.recent.post.image',
      source: {
        image: 'most.recent.post.source.image',
      },
    },
  },
};
const getDefaultHistory = (edges = [edge]): ReadHistoryData => ({
  readHistory: {
    pageInfo: {
      hasNextPage: true,
      endCursor: '',
    },
    edges,
  },
});

const createReadingHistoryMock = (
  history = getDefaultHistory(),
): MockedGraphQLResponse<ReadHistoryData> => ({
  request: { query: READING_HISTORY_QUERY, variables: { after: undefined } },
  result: { data: history },
});

const defaultUser: LoggedUser = {
  id: 'u1',
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
  permalink: '',
  email: 'me@daily.dev',
  providers: ['github'],
};

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createReadingHistoryMock()],
): RenderResult => {
  const client = new QueryClient();

  mocks.forEach(mockGraphQL);
  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{
          user: defaultUser,
          shouldShowLogin: false,
          showLogin: jest.fn(),
          logout: jest.fn(),
          updateUser: jest.fn(),
          tokenRefreshed: true,
          getRedirectUri: jest.fn(),
          closeLogin: jest.fn(),
        }}
      >
        <HistoryPage />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should show appropriate loading attributes', async () => {
  renderComponent();
  const initialBusyState = (await screen.findByRole('main')).getAttribute(
    'aria-busy',
  );
  expect(JSON.parse(initialBusyState)).toEqual(true);

  await waitForNock();

  const afterFetchingBusyState = (await screen.findByRole('main')).getAttribute(
    'aria-busy',
  );
  expect(JSON.parse(afterFetchingBusyState)).toEqual(false);
});

it('should show display empty screen when no view history is found', async () => {
  const emptyHistory = getDefaultHistory([]);
  const mock = createReadingHistoryMock(emptyHistory);
  renderComponent([mock]);
  await waitForNock();
  await screen.findByText('Your reading history is empty.');
});

it('should show display the list of viewing history', async () => {
  renderComponent();
  await waitForNock();
  await screen.findByText('Most Recent Post');
});
