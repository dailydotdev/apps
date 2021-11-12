import React from 'react';
import { render, RenderResult, screen } from '@testing-library/preact';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import nock from 'nock';
import { ReadHistoryData } from '@dailydotdev/shared/src/hooks/useReadingHistory';
import { READING_HISTORY_QUERY } from '@dailydotdev/shared/src/graphql/users';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MockedGraphQLResponse, mockGraphQL } from './helpers/graphql';
import HistoryPage from '../pages/history';
import { waitForNock } from './helpers/utilities';

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
});

// const createdAtOld = new Date('2020-09-22T07:15:51.247Z');
// const createdAtOlder = new Date('2021-08-22T07:15:51.247Z');
// const createdAtNew = new Date('2021-09-22T07:15:51.247Z');
const createdAtNewer = new Date('2021-10-22T07:15:51.247Z');

const defaultReadingHistory: ReadHistoryData = {
  readHistory: {
    pageInfo: {
      hasNextPage: true,
      endCursor: '',
    },
    edges: [
      {
        node: {
          timestamp: createdAtNewer,
          post: {
            id: 'p1',
            title: 'Most Recent Post',
            url: 'most.recent.post.url',
            image: 'most.recent.post.image',
            source: {
              image: 'most.recent.post.source.image',
            },
          },
        },
      },
    ],
  },
};

const createReadingHistoryMock = (
  history = defaultReadingHistory,
): MockedGraphQLResponse<ReadHistoryData> => ({
  request: { query: READING_HISTORY_QUERY },
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

it('should show user reading history with post title, image, and has source image', async () => {
  renderComponent();

  await waitForNock();

  expect(await screen.findByRole('main')).not.toHaveAttribute('aria-busy');

  const el = await screen.findByText('Most Recent Post');
  expect(el).toBeInTheDocument();
});
