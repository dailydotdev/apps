import { FeedData } from '@dailydotdev/shared/src/graphql/posts';
import {
  ANONYMOUS_FEED_QUERY,
  FEED_QUERY,
  SEARCH_POSTS_QUERY,
} from '@dailydotdev/shared/src/graphql/feed';
import nock from 'nock';
import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/preact';
import { QueryClient } from 'react-query';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { mocked } from 'ts-jest/utils';
import { NextRouter, useRouter } from 'next/router';
import ad from '@dailydotdev/shared/__tests__/fixture/ad';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import defaultFeedPage from '@dailydotdev/shared/__tests__/fixture/feed';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '@dailydotdev/shared/__tests__/helpers/graphql';
import { waitForNock } from '@dailydotdev/shared/__tests__/helpers/utilities';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import SearchPage from '../pages/search';

const routerReplace = jest.fn();

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

beforeEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  nock.cleanAll();
  mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/search',
        query: {},
        replace: routerReplace,
        push: jest.fn(),
      } as unknown as NextRouter),
  );
});

const createFeedMock = (
  page = defaultFeedPage,
  query: string = ANONYMOUS_FEED_QUERY,
  variables: unknown = {
    first: 7,
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

let client: QueryClient;

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createFeedMock()],
  user: LoggedUser = defaultUser,
): RenderResult => {
  client = new QueryClient();

  mocks.forEach(mockGraphQL);
  nock('http://localhost:3000').get('/v1/a').reply(200, [ad]);

  return render(
    <TestBootProvider client={client} auth={{ user }}>
      {SearchPage.getLayout(<SearchPage />, {}, SearchPage.layoutProps)}
    </TestBootProvider>,
  );
};

it('should request user feed when query is empty and logged in', async () => {
  renderComponent([
    createFeedMock(defaultFeedPage, FEED_QUERY, {
      first: 7,
      loggedIn: true,
      version: 1,
    }),
  ]);
  await waitForNock();
  await waitFor(async () => {
    const elements = await screen.findAllByTestId('postItem');
    expect(elements.length).toBeTruthy();
  });
});

it('should request anonymous feed when query is empty and not logged in', async () => {
  renderComponent(
    [
      createFeedMock(defaultFeedPage, ANONYMOUS_FEED_QUERY, {
        first: 7,
        loggedIn: false,
        version: 1,
      }),
    ],
    null,
  );
  await waitForNock();
  await waitFor(async () => {
    const elements = await screen.findAllByTestId('postItem');
    expect(elements.length).toBeTruthy();
  });
});

it('should request search feed', async () => {
  const query = { q: 'daily' };
  mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/search',
        query,
      } as unknown as NextRouter),
  );
  renderComponent([
    createFeedMock(defaultFeedPage, SEARCH_POSTS_QUERY, {
      first: 7,
      loggedIn: true,
      query: 'daily',
    }),
  ]);
  await waitFor(async () => {
    const elements = await screen.findAllByTestId('postItem');
    expect(elements.length).toBeTruthy();
  });
});

it('should update query param on enter', async (done) => {
  renderComponent([
    createFeedMock(defaultFeedPage, FEED_QUERY, {
      first: 7,
      loggedIn: true,
    }),
  ]);
  const input = (await screen.findByRole('textbox')) as HTMLInputElement;
  input.value = 'daily';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  setTimeout(async () => {
    input.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, keyCode: 13 }),
    );
    await waitFor(() =>
      expect(routerReplace).toBeCalledWith({
        pathname: '/search',
        query: { q: 'daily' },
      }),
    );
    done();
  }, 150);
});

it('should show empty screen on no results', async () => {
  const query = { q: 'daily' };
  mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/search',
        query,
      } as unknown as NextRouter),
  );
  renderComponent([
    createFeedMock(
      {
        pageInfo: {
          hasNextPage: false,
          endCursor: null,
        },
        edges: [],
      },
      SEARCH_POSTS_QUERY,
      {
        first: 7,
        loggedIn: true,
        query: 'daily',
      },
    ),
  ]);
  await waitFor(async () => {
    expect(await screen.findByText('No results found')).toBeInTheDocument();
  });
});
