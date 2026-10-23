import type { FeedData } from '@dailydotdev/shared/src/graphql/posts';
import {
  BookmarkSort,
  BookmarkStatus,
  BOOKMARKS_FEED_QUERY,
  baseFeedSupportedTypes,
} from '@dailydotdev/shared/src/graphql/feed';
import { BOOKMARK_FACETS_QUERY } from '@dailydotdev/shared/src/graphql/bookmarks';
import nock from 'nock';
import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import defaultFeedPage from '@dailydotdev/shared/__tests__/fixture/feed';
import type { MockedGraphQLResponse } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { mockGraphQL } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { waitForNock } from '@dailydotdev/shared/__tests__/helpers/utilities';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import * as viewSize from '@dailydotdev/shared/src/hooks/useViewSize';
import * as laptopLayout from '@dailydotdev/shared/src/hooks/layout/useLaptopLayout';
import BookmarksPage from '../pages/bookmarks';

jest.mock('@dailydotdev/shared/src/components/post/PostPane', () => ({
  PostPane: ({ postId }: { postId?: string }) => (
    <div data-testid="bookmarks-pane">{postId}</div>
  ),
}));

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

const feedVariables = {
  first: 20,
  after: '',
  loggedIn: true,
  sort: BookmarkSort.TimeDesc,
  supportedTypes: baseFeedSupportedTypes,
  columns: 1,
};

const createFeedMock = (
  page = defaultFeedPage,
  query: string = BOOKMARKS_FEED_QUERY,
  variables: Record<string, unknown> = feedVariables,
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

const createFacetsMock = (
  status = BookmarkStatus.All,
): MockedGraphQLResponse => ({
  request: {
    query: BOOKMARK_FACETS_QUERY,
    variables: { status },
  },
  result: {
    data: {
      bookmarkFacets: {
        tags: [{ tag: 'webdev', count: 2 }],
        sources: [{ id: 'a', name: 'A', image: null, count: 1 }],
        squads: [],
      },
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

const useTablet = () => {
  jest.spyOn(viewSize, 'useViewSize').mockReturnValue(false);
  jest.spyOn(viewSize, 'useIsPhone').mockReturnValue(false);
};

it('should request bookmarks feed', async () => {
  renderComponent();
  await waitForNock();
  await waitFor(async () => {
    const elements = await screen.findAllByTestId('bookmarkRow');
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
    const elements = screen.queryAllByTestId('bookmarkRow');
    expect(elements.length).toBeFalsy();
  });
});

it('should show the search bar', async () => {
  useTablet();
  renderComponent();
  await waitForNock();
  expect(await screen.findByTestId('searchField')).toBeInTheDocument();
});

it('should search as the reader types', async () => {
  useTablet();
  renderComponent();
  await waitForNock();
  const input = await screen.findByPlaceholderText('Search bookmarks');
  fireEvent.input(input, { target: { value: 'daily' } });
  await waitFor(() =>
    expect(routerReplace).toHaveBeenCalledWith(
      { pathname: '/bookmarks', query: { q: 'daily' } },
      undefined,
      { shallow: true, scroll: false },
    ),
  );
});

it('should search from the floating field on a phone', async () => {
  renderComponent();
  await waitForNock();
  const input = await screen.findByRole('searchbox', {
    name: 'Search bookmarks',
  });
  fireEvent.change(input, { target: { value: 'daily' } });
  await waitFor(() =>
    expect(routerReplace).toHaveBeenCalledWith(
      { pathname: '/bookmarks', query: { q: 'daily' } },
      undefined,
      { shallow: true, scroll: false },
    ),
  );
});

it('should request unread bookmarks when the status changes', async () => {
  renderComponent([createFeedMock(), createFacetsMock()]);
  await waitForNock();

  mockGraphQL(
    createFeedMock(defaultFeedPage, BOOKMARKS_FEED_QUERY, {
      ...feedVariables,
      status: BookmarkStatus.Unread,
    }),
  );
  mockGraphQL(createFacetsMock(BookmarkStatus.Unread));
  fireEvent.click(await screen.findByRole('button', { name: 'Unread' }));
  await waitForNock();

  expect(
    screen.getByRole('button', { name: 'Unread', pressed: true }),
  ).toBeInTheDocument();
});

it('should filter the feed by a tag from the filter menu', async () => {
  useTablet();
  renderComponent([createFeedMock(), createFacetsMock()]);
  await waitForNock();

  mockGraphQL(
    createFeedMock(defaultFeedPage, BOOKMARKS_FEED_QUERY, {
      ...feedVariables,
      tags: ['webdev'],
    }),
  );
  fireEvent.click(
    await screen.findByRole('button', { name: 'Filter bookmarks' }),
  );
  fireEvent.click(await screen.findByRole('button', { name: '#webdev 2' }));
  await waitForNock();

  expect(
    screen.getByRole('button', { name: 'Remove filter #webdev' }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Filter bookmarks, 1 selected' }),
  ).toBeInTheDocument();
});

it('should select a bookmark on laptop without leaving the page', async () => {
  useTablet();
  jest.spyOn(laptopLayout, 'useLaptopLayout').mockReturnValue(true);
  renderComponent();
  await waitForNock();
  const [first, second] = defaultFeedPage.edges.map(({ node }) => node);
  await screen.findByTitle(second.title);
  await waitFor(() =>
    expect(screen.getByTestId('bookmarks-pane')).toHaveTextContent(first.id),
  );

  fireEvent.click(screen.getByTitle(second.title));

  expect(screen.getByTestId('bookmarks-pane')).toHaveTextContent(second.id);
  expect(screen.getByTitle(second.title)).toHaveAttribute(
    'aria-current',
    'true',
  );
  expect(routerReplace).toHaveBeenCalledWith(
    { pathname: '/bookmarks', query: { post: second.id } },
    undefined,
    { shallow: true, scroll: false },
  );
});
