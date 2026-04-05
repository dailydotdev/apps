import {
  ANONYMOUS_FEED_QUERY,
  FEED_V2_QUERY,
  RankingAlgorithm,
  type FeedData,
  type FeedV2Data,
} from '@dailydotdev/shared/src/graphql/feed';
import nock from 'nock';
import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import ad from '@dailydotdev/shared/__tests__/fixture/ad';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import defaultFeedPage from '@dailydotdev/shared/__tests__/fixture/feed';
import type { Alerts } from '@dailydotdev/shared/src/graphql/alerts';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import type { MockedGraphQLResponse } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { mockGraphQL } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { waitForNock } from '@dailydotdev/shared/__tests__/helpers/utilities';
import MyFeed from '../pages/my-feed';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

let defaultAlerts: Alerts = { filter: true };
const updateAlerts = jest.fn();
const originalScrollTo = window.scrollTo;

beforeAll(() => {
  window.scrollTo = jest.fn();
});

afterAll(() => {
  window.scrollTo = originalScrollTo;
});

beforeEach(() => {
  defaultAlerts = { filter: true };
  jest.restoreAllMocks();
  jest.clearAllMocks();
  nock.cleanAll();
  jest.mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/my-feed',
        query: {},
        replace: jest.fn(),
        push: jest.fn(),
      } as unknown as NextRouter),
  );
});

const createFeedMock = (
  page = defaultFeedPage,
  query: string = ANONYMOUS_FEED_QUERY,
  variables: Record<string, unknown> = {
    first: 7,
    after: '',
    loggedIn: true,
  },
): MockedGraphQLResponse<FeedData | FeedV2Data> => ({
  request: {
    query,
    variables,
  },
  result: {
    data:
      query === FEED_V2_QUERY
        ? ({
            page: {
              pageInfo: page.pageInfo,
              edges: page.edges.map((edge) => ({
                node: {
                  __typename: 'FeedPostItem',
                  post: edge.node,
                  feedMeta: edge.node.feedMeta ?? null,
                },
              })),
            },
          } as FeedV2Data)
        : ({ page } as FeedData),
  },
});
let client: QueryClient;

function renderComponent(
  mocks: MockedGraphQLResponse[] = [createFeedMock()],
  user?: LoggedUser,
): RenderResult {
  const resolvedUser = arguments.length < 2 ? defaultUser : user;
  client = new QueryClient();

  mocks.forEach(mockGraphQL);
  nock('http://localhost:3000').get('/v1/a?active=false').reply(200, [ad]);
  return render(
    <TestBootProvider
      client={client}
      auth={{ user: resolvedUser }}
      alerts={{ alerts: defaultAlerts, updateAlerts }}
    >
      {MyFeed.getLayout(<MyFeed />, {}, MyFeed.layoutProps)}
    </TestBootProvider>,
  );
}

it('should request user feed', async () => {
  const graphQLRequests: Array<{
    query: string;
    variables?: Record<string, unknown>;
  }> = [];

  nock('http://localhost:3000')
    .post('/graphql', (body) => {
      const request = body as (typeof graphQLRequests)[number];

      if (request.query !== FEED_V2_QUERY) {
        return false;
      }

      graphQLRequests.push(request);
      return true;
    })
    .reply(200, {
      data: {
        page: {
          pageInfo: defaultFeedPage.pageInfo,
          edges: defaultFeedPage.edges.map((edge) => ({
            node: {
              __typename: 'FeedPostItem',
              post: edge.node,
              feedMeta: edge.node.feedMeta ?? null,
            },
          })),
        },
      } satisfies FeedV2Data,
    });

  renderComponent([]);
  const elements = await screen.findAllByTestId('postItem');
  expect(elements.length).toBeTruthy();
  await waitFor(() => {
    expect(graphQLRequests).toHaveLength(1);
    expect(graphQLRequests[0].variables).toEqual(
      expect.objectContaining({
        first: 7,
        after: '',
        loggedIn: true,
        version: 15,
        ranking: RankingAlgorithm.Popularity,
      }),
    );
  });
});

it('should request anonymous my feed', async () => {
  renderComponent(
    [
      createFeedMock(defaultFeedPage, ANONYMOUS_FEED_QUERY, {
        first: 7,
        after: '',
        loggedIn: false,
        version: 15,
        ranking: RankingAlgorithm.Popularity,
      }),
    ],
    undefined,
  );
  await waitForNock();
  const elements = await screen.findAllByTestId('postItem');
  expect(elements.length).toBeTruthy();
});
