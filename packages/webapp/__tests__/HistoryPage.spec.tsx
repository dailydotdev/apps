import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import nock from 'nock';
import type { ReadHistoryData } from '@dailydotdev/shared/src/hooks/useInfiniteReadingHistory';
import { READING_HISTORY_QUERY } from '@dailydotdev/shared/src/graphql/users';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import type { MockedGraphQLResponse } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { mockGraphQL } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { waitForNock } from '@dailydotdev/shared/__tests__/helpers/utilities';
import user from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { SearchProvider } from '@dailydotdev/shared/src/contexts/search/SearchContext';
import * as viewSize from '@dailydotdev/shared/src/hooks/useViewSize';
import HistoryPage from '../pages/history';

jest.mock(
  '@dailydotdev/shared/src/components/history/ReadingHistoryPostPane',
  () => ({
    ReadingHistoryPostPane: ({
      item,
    }: {
      item?: { post: { title: string } };
    }) => <div data-testid="history-pane">{item?.post.title}</div>,
  }),
);

const routerReplace = jest.fn();

beforeEach(() => {
  nock.cleanAll();
  jest.restoreAllMocks();
  jest.clearAllMocks();
  jest.mocked(useRouter).mockImplementation(
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
} as ReadHistoryData['readHistory']['edges'][number];
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
  request: { query: READING_HISTORY_QUERY, variables: { after: '' } },
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
          isLoggedIn: true,
          shouldShowLogin: false,
          showLogin: jest.fn(),
          logout: jest.fn(),
          updateUser: jest.fn(),
          tokenRefreshed: true,
          isTokenValid: true,
          getRedirectUri: jest.fn(),
          closeLogin: jest.fn(),
          isAuthReady: true,
          isAuthReadyOrCached: true,
        }}
      >
        <SearchProvider>
          <HistoryPage />
        </SearchProvider>
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
    expect(JSON.parse(initialBusyState ?? 'false')).toEqual(true);

    await waitForNock();

    await waitFor(async () => {
      const afterFetchingBusyState = (
        await screen.findByTestId('reading-history-container')
      ).getAttribute('aria-busy');

      return expect(JSON.parse(afterFetchingBusyState ?? 'true')).toEqual(
        false,
      );
    });
  });

  it('should show display empty screen when no view history is found', async () => {
    const emptyHistory = getDefaultHistory([]);
    const mock = createReadingHistoryMock(emptyHistory);
    renderComponent([mock]);
    await waitForNock();
    await screen.findByText('Nothing read yet');
  });

  it('should show display the list of viewing history', async () => {
    renderComponent();
    await waitForNock();
    await screen.findByText('Most Recent Post');
  });

  it('should show the search bar', async () => {
    jest.spyOn(viewSize, 'useViewSize').mockReturnValue(false);
    jest.spyOn(viewSize, 'useIsPhone').mockReturnValue(false);
    renderComponent();
    await waitForNock();
    expect(await screen.findByTestId('searchField')).toBeInTheDocument();
  });

  it('should search as the reader types', async () => {
    jest.spyOn(viewSize, 'useViewSize').mockReturnValue(false);
    jest.spyOn(viewSize, 'useIsPhone').mockReturnValue(false);
    renderComponent();
    await waitForNock();
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    fireEvent.input(input, { target: { value: 'daily' } });
    await waitFor(() =>
      expect(routerReplace).toHaveBeenCalledWith(
        { pathname: '/history', query: { q: 'daily' } },
        undefined,
        { shallow: true, scroll: false },
      ),
    );
  });

  it('should group reads under their day', async () => {
    renderComponent([
      createReadingHistoryMock(
        getDefaultHistory([
          { node: { ...edge.node, timestamp: new Date() } },
        ] as ReadHistoryData['readHistory']['edges']),
      ),
    ]);
    await waitForNock();
    await screen.findByText('Today');
  });

  it('should select a read on laptop without leaving the page', async () => {
    jest.spyOn(viewSize, 'useViewSizeClient').mockReturnValue(true);
    const second = {
      node: {
        ...edge.node,
        post: { ...edge.node.post, id: 'p2', title: 'Older Post' },
      },
    } as ReadHistoryData['readHistory']['edges'][number];
    renderComponent([
      createReadingHistoryMock(getDefaultHistory([edge, second])),
    ]);
    await waitForNock();
    expect(await screen.findByTestId('history-pane')).toHaveTextContent(
      'Most Recent Post',
    );

    fireEvent.click(screen.getByTitle('Older Post'));

    expect(screen.getByTestId('history-pane')).toHaveTextContent('Older Post');
    expect(screen.getByTitle('Older Post')).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(routerReplace).toHaveBeenCalledWith(
      { pathname: '/history', query: { post: 'p2' } },
      undefined,
      { shallow: true, scroll: false },
    );
  });
});
