import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import nock from 'nock';
import { ReadHistoryData } from '@dailydotdev/shared/src/hooks/useInfiniteReadingHistory';
import { READING_HISTORY_QUERY } from '@dailydotdev/shared/src/graphql/users';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mocked } from 'ts-jest/utils';
import { NextRouter, useRouter } from 'next/router';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '@dailydotdev/shared/__tests__/helpers/graphql';
import { waitForNock } from '@dailydotdev/shared/__tests__/helpers/utilities';
import user from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import HistoryPage from '../pages/history';

const routerReplace = jest.fn();

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
  mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/history',
        query: {},
        replace: routerReplace,
        push: jest.fn(),
        isReady: true,
      } as unknown as NextRouter),
  );
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

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createReadingHistoryMock()],
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
          getRedirectUri: jest.fn(),
          closeLogin: jest.fn(),
        }}
      >
        <HistoryPage />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

describe('user reading history page', () => {
  it('should show appropriate loading attributes', async () => {
    renderComponent();
    const initialBusyState = (
      await screen.findByTestId('reading-history-container')
    ).getAttribute('aria-busy');
    expect(JSON.parse(initialBusyState)).toEqual(true);

    await waitForNock();

    await waitFor(async () => {
      const afterFetchingBusyState = (
        await screen.findByTestId('reading-history-container')
      ).getAttribute('aria-busy');

      return expect(JSON.parse(afterFetchingBusyState)).toEqual(false);
    });
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

  it('should show the search bar', async () => {
    renderComponent();
    await waitForNock();
    expect(await screen.findByTestId('searchField')).toBeInTheDocument();
  });

  it('should update query param on enter', async (done) => {
    renderComponent();
    await waitForNock();
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    input.value = 'daily';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    setTimeout(async () => {
      input.dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, keyCode: 13 }),
      );
      await waitFor(() =>
        expect(routerReplace).toBeCalledWith({
          pathname: '/history',
          query: { q: 'daily' },
        }),
      );
      done();
    }, 150);
  });
});
