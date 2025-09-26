import type { FeedData } from '@dailydotdev/shared/src/graphql/posts';
import { MOST_DISCUSSED_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import nock from 'nock';
import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { mocked } from 'ts-jest/utils';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import ad from '@dailydotdev/shared/__tests__/fixture/ad';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import defaultFeedPage from '@dailydotdev/shared/__tests__/fixture/feed';
import type { MockedGraphQLResponse } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { mockGraphQL } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import type { CommentFeedData } from '@dailydotdev/shared/src/graphql/comments';
import { COMMENT_FEED_QUERY } from '@dailydotdev/shared/src/graphql/comments';
import Discussed from '../pages/discussed';
import { defaultCommentsPage } from './ProfileRepliesPage';

beforeEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  nock.cleanAll();
  mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/discussed',
        query: {},
        replace: jest.fn(),
        push: jest.fn(),
      } as unknown as NextRouter),
  );
});

const createFeedMock = (
  page = defaultFeedPage,
  query: string = MOST_DISCUSSED_FEED_QUERY,
  variables: unknown = {
    first: 7,
    after: '',
    loggedIn: true,
  },
): MockedGraphQLResponse<FeedData> => ({
  request: {
    query,
    variables,
  },
  result: {
    data: {
      page,
    },
  },
});

const createCommentFeedMock = (
  page = defaultCommentsPage,
  query: string = COMMENT_FEED_QUERY,
  variables: unknown = {
    first: 20,
    after: '',
  },
): MockedGraphQLResponse<CommentFeedData> => ({
  request: {
    query,
    variables,
  },
  result: {
    data: {
      page,
    },
  },
});

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createFeedMock()],
  user: LoggedUser = defaultUser,
): RenderResult => {
  const client = new QueryClient();

  mocks.forEach(mockGraphQL);
  nock('http://localhost:3000').get('/v1/a').reply(200, [ad]);
  return render(
    <TestBootProvider client={client} auth={{ user }}>
      {Discussed.getLayout(<Discussed />, {}, Discussed.layoutProps)}
    </TestBootProvider>,
  );
};

it('should request most discussed feed when logged-in', async () => {
  renderComponent([createCommentFeedMock()]);
  await waitFor(async () => {
    const elements = await screen.findAllByTestId('comment');
    expect(elements.length).toBeTruthy();
  });
});

it('should not request most discussed feed when not logged-in', async () => {
  renderComponent([createCommentFeedMock()], null);
  const elements = screen.queryAllByTestId('comment');
  expect(elements.length).toBeFalsy();
});
