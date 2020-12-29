import React from 'react';
import nock from 'nock';
import { mocked } from 'ts-jest/utils';
import { NextRouter, useRouter } from 'next/router';
import { LoggedUser, Roles } from '../lib/user';
import { render, RenderResult, screen, waitFor } from '@testing-library/preact';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MockedGraphQLResponse, mockGraphQL } from './helpers/graphql';
import AuthContext from '../components/AuthContext';
import PendingKeywords from '../pages/backoffice/pendingKeywords';
import {
  ALLOW_KEYWORD_MUTATION,
  DENY_KEYWORD_MUTATION,
  Keyword,
  KeywordData,
  RANDOM_PENDING_KEYWORD_QUERY,
} from '../graphql/keywords';
import { FeedData, KEYWORD_FEED_QUERY, Post } from '../graphql/posts';
import { Connection } from '../graphql/common';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const routerReplace = jest.fn();

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
  mocked(useRouter).mockImplementation(
    () =>
      (({
        replace: routerReplace,
      } as unknown) as NextRouter),
  );
});

const defaultUser: LoggedUser = {
  id: 'u1',
  name: 'Ido Shamun',
  providers: ['github'],
  email: 'ido@acme.com',
  image: 'https://daily.dev/ido.png',
  infoConfirmed: true,
  premium: false,
  createdAt: '',
  roles: [Roles.Moderator],
};

const defaultKeyword: Keyword = {
  value: 'reactjs',
  occurrences: 10,
};

const defaultFeedPage: Connection<Post> = {
  pageInfo: {
    hasNextPage: true,
    endCursor: '',
  },
  edges: [
    {
      node: {
        id: '0e4005b2d3cf191f8c44c2718a457a1e',
        title: 'Learn SQL',
        image:
          'https://res.cloudinary.com/daily-now/image/upload/f_auto,q_auto/v1/posts/22fc3ac5cc3fedf281b6e4b46e8c0ba2',
        commentsPermalink: 'https://localhost:5002/posts/9CuRpr5NiEY5',
      },
    },
  ],
};

const createRandomKeywordMock = (
  keyword: Keyword | null = defaultKeyword,
): MockedGraphQLResponse<KeywordData> => ({
  request: {
    query: RANDOM_PENDING_KEYWORD_QUERY,
  },
  result: {
    data: { keyword },
  },
});

const createFeedMock = (
  page = defaultFeedPage,
): MockedGraphQLResponse<FeedData> => ({
  request: {
    query: KEYWORD_FEED_QUERY,
    variables: {
      keyword: defaultKeyword.value,
      first: 4,
    },
  },
  result: {
    data: {
      page,
    },
  },
});

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [
    createRandomKeywordMock(),
    createFeedMock(),
  ],
  user: LoggedUser = defaultUser,
): RenderResult => {
  const client = new QueryClient();

  mocks.forEach(mockGraphQL);
  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{
          user,
          shouldShowLogin: false,
          showLogin: jest.fn(),
          logout: jest.fn(),
          updateUser: jest.fn(),
          tokenRefreshed: true,
        }}
      >
        <PendingKeywords />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should redirect to home page if not moderator', async () => {
  renderComponent([], { ...defaultUser, roles: [] });
  await waitFor(() => expect(routerReplace).toBeCalledWith('/'));
});

it('should show empty screen when no keyword', async () => {
  renderComponent([createRandomKeywordMock(null)]);
  expect(await screen.findByTestId('empty')).toBeInTheDocument();
});

it('should show the keyword', async () => {
  renderComponent();
  expect(await screen.findByText('reactjs')).toBeInTheDocument();
});

it('should show the number of occurrences', async () => {
  renderComponent();
  expect(await screen.findByText('Occurrences: 10')).toBeInTheDocument();
});

it('should send allowKeyword mutation', async () => {
  let mutationCalled = true;
  renderComponent([
    createRandomKeywordMock(),
    createFeedMock(),
    {
      request: {
        query: ALLOW_KEYWORD_MUTATION,
        variables: { keyword: defaultKeyword.value },
      },
      result: () => {
        mutationCalled = true;
        return {
          data: {
            allowKeyword: {
              _: true,
            },
          },
        };
      },
    },
  ]);
  const el = await screen.findByText('Allow');
  el.click();
  await waitFor(() => mutationCalled);
});

it('should send denyKeyword mutation', async () => {
  let mutationCalled = true;
  renderComponent([
    createRandomKeywordMock(),
    createFeedMock(),
    {
      request: {
        query: DENY_KEYWORD_MUTATION,
        variables: { keyword: defaultKeyword.value },
      },
      result: () => {
        mutationCalled = true;
        return {
          data: {
            denyKeyword: {
              _: true,
            },
          },
        };
      },
    },
  ]);
  const el = await screen.findByText('Deny');
  el.click();
  await waitFor(() => mutationCalled);
});

it('should show empty screen when no posts', async () => {
  renderComponent([
    createRandomKeywordMock(),
    createFeedMock({
      pageInfo: {
        hasNextPage: true,
        endCursor: '',
      },
      edges: [],
    }),
  ]);
  const el = await screen.findByTestId('emptyPosts');
  expect(el).toBeInTheDocument();
});

it('should show keyword posts', async () => {
  renderComponent();
  const el = await screen.findByLabelText('Learn SQL');
  expect(el).toHaveAttribute(
    'href',
    'https://localhost:5002/posts/9CuRpr5NiEY5',
  );
});
