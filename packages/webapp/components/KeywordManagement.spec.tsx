import React from 'react';
import nock from 'nock';
import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Keyword } from '@dailydotdev/shared/src/graphql/keywords';
import {
  ALLOW_KEYWORD_MUTATION,
  DENY_KEYWORD_MUTATION,
} from '@dailydotdev/shared/src/graphql/keywords';
import type { FeedData } from '@dailydotdev/shared/src/graphql/feed';
import { KEYWORD_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import type { Connection } from '@dailydotdev/shared/src/graphql/common';
import type { MockedGraphQLResponse } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { mockGraphQL } from '@dailydotdev/shared/__tests__/helpers/graphql';
import KeywordManagement from './KeywordManagement';

const onOperationCompleted = jest.fn();

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
});

const defaultKeyword: Keyword = {
  value: 'reactjs',
  occurrences: 10,
  status: 'pending',
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
          'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/22fc3ac5cc3fedf281b6e4b46e8c0ba2',
        commentsPermalink: 'https://localhost:5002/posts/9CuRpr5NiEY5',
      },
    },
  ],
};

const createFeedMock = (
  page = defaultFeedPage,
): MockedGraphQLResponse<FeedData> => ({
  request: {
    query: KEYWORD_FEED_QUERY,
    variables: {
      keyword: defaultKeyword.value,
      first: 4,
      after: '',
    },
  },
  result: {
    data: {
      page,
    },
  },
});

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createFeedMock()],
): RenderResult => {
  const client = new QueryClient();

  mocks.forEach(mockGraphQL);
  return render(
    <QueryClientProvider client={client}>
      <KeywordManagement
        keyword={defaultKeyword}
        subtitle="subtitle"
        onOperationCompleted={onOperationCompleted}
      />
    </QueryClientProvider>,
  );
};

it('should show the keyword', async () => {
  renderComponent();
  expect(await screen.findByText('reactjs')).toBeInTheDocument();
});

it('should show the number of occurrences', async () => {
  renderComponent();
  expect(await screen.findByText('Occurrences: 10')).toBeInTheDocument();
});

it('should send allowKeyword mutation', async () => {
  let mutationCalled = false;
  renderComponent([
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
  let mutationCalled = false;
  renderComponent([
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

it('should show the subtitle', async () => {
  renderComponent();
  expect(await screen.findByText('subtitle')).toBeInTheDocument();
});
