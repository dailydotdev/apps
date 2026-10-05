import type { FeedData } from '@dailydotdev/shared/src/graphql/posts';
import {
  BookmarkSort,
  BOOKMARKS_FEED_QUERY,
  baseFeedSupportedTypes,
} from '@dailydotdev/shared/src/graphql/feed';
import nock from 'nock';
import React, { act } from 'react';
import type { RenderResult } from '@testing-library/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import ad from '@dailydotdev/shared/__tests__/fixture/ad';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import defaultFeedPage from '@dailydotdev/shared/__tests__/fixture/feed';
import type { MockedGraphQLResponse } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { mockGraphQL } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { waitForNock } from '@dailydotdev/shared/__tests__/helpers/utilities';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import * as viewSize from '@dailydotdev/shared/src/hooks/useViewSize';
import BookmarksPage from '../pages/bookmarks';

const routerReplace = jest.fn();

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

beforeEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  nock.cleanAll();
  jest.mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/bookmarks',
        query: {},
        replace: routerReplace,
        push: jest.fn(),
      } as unknown as NextRouter),
  );
});

const createFeedMock = (
  page = defaultFeedPage,
  query: string = BOOKMARKS_FEED_QUERY,
  variables: Record<string, unknown> = {
    first: 7,
    after: '',
    loggedIn: true,
    sort: BookmarkSort.TimeDesc,
    supportedTypes: baseFeedSupportedTypes,
    columns: 1,
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

function renderComponent(
  mocks: MockedGraphQLResponse[] = [createFeedMock()],
  user?: LoggedUser,
): RenderResult {
  const resolvedUser = arguments.length < 2 ? defaultUser : user;
  client = new QueryClient();

  mocks.forEach(mockGraphQL);
  nock('http://localhost:3000')
    .get('/v1/a?active=false&gdpr=0')
    .reply(200, [ad]);

  return render(
    <TestBootProvider client={client} auth={{ user: resolvedUser }}>
      {BookmarksPage.getLayout(
        <BookmarksPage />,
        {},
        BookmarksPage.layoutProps,
      )}
    </TestBootProvider>,
  );
}
it('should request bookmarks feed', async () => {
  renderComponent();
  await waitForNock();
  await waitFor(async () => {
    const elements = await screen.findAllByTestId('postItem');
    expect(elements.length).toBeTruthy();
  });
});

it('should redirect to home page when logged-out', async () => {
  renderComponent([], undefined);
  await waitFor(() => expect(routerReplace).toBeCalledWith('/'));
});

it('should show empty screen when feed is empty', async () => {
  renderComponent([
    createFeedMock({
      pageInfo: {
        hasNextPage: false,
        endCursor: null,
      },
      edges: [],
    }),
  ]);
  await waitForNock();
  await screen.findByText('Your bookmark list is empty.');
  await waitFor(() => {
    const elements = screen.queryAllByTestId('postItem');
    expect(elements.length).toBeFalsy();
  });
});

it('should show the search bar', async () => {
  jest.spyOn(viewSize, 'useIsPhone').mockReturnValue(false);
  renderComponent();
  await waitForNock();
  expect(await screen.findByTestId('searchField')).toBeInTheDocument();
});

it('should search from the floating field on a phone', async () => {
  renderComponent();
  await waitForNock();
  const input = await screen.findByRole('searchbox', {
    name: 'Search bookmarks',
  });
  fireEvent.change(input, { target: { value: 'daily' } });
  fireEvent.submit(input);
  await waitFor(() =>
    expect(routerReplace).toBeCalledWith({
      pathname: '/bookmarks',
      query: { q: 'daily' },
    }),
  );
});

it('should update query param on enter', async () => {
  jest.spyOn(viewSize, 'useIsPhone').mockReturnValue(false);
  renderComponent();
  await waitForNock();
  const input = await screen.findByPlaceholderText('Search bookmarks');
  fireEvent.input(input, { target: { value: 'daily' } });
  await act(() => new Promise((resolve) => setTimeout(resolve, 100)));
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', keyCode: 13 });
  await waitFor(() =>
    expect(routerReplace).toBeCalledWith({
      pathname: '/bookmarks',
      query: { q: 'daily' },
    }),
  );
});
