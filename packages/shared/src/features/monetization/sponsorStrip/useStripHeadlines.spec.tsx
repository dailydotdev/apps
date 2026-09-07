import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { MajorHeadlinesData } from '../../../graphql/highlights';
import { majorHeadlinesQueryOptions } from '../../../graphql/highlights';
import { ONE_HOUR } from '../../../lib/time';
import { useStripHeadlines } from './useStripHeadlines';

jest.mock('../../../graphql/highlights', () => ({
  ...(jest.requireActual('../../../graphql/highlights') as Record<
    string,
    unknown
  >),
  majorHeadlinesQueryOptions: jest.fn(),
}));

const mockQueryOptions = jest.mocked(majorHeadlinesQueryOptions);

const headline = (id: string, ageMs = 0) => ({
  node: {
    id,
    channel: 'agents',
    headline: `Headline ${id}`,
    highlightedAt: new Date(Date.now() - ageMs).toISOString(),
    post: { id: `post-${id}`, commentsPermalink: `https://daily.dev/p/${id}` },
  },
});

const setHeadlines = (edges: ReturnType<typeof headline>[]) =>
  mockQueryOptions.mockReturnValue({
    queryKey: ['major-headlines', edges.length],
    queryFn: async () =>
      ({
        majorHeadlines: {
          pageInfo: { hasNextPage: false, endCursor: '' },
          edges,
        },
      } as MajorHeadlinesData),
  } as ReturnType<typeof majorHeadlinesQueryOptions>);

const render = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return renderHook(() => useStripHeadlines(true), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
};

beforeEach(() => {
  jest.clearAllMocks();
});

it('should carry the headlines the API returned', async () => {
  setHeadlines([headline('h1'), headline('h2')]);
  const { result } = render();

  await waitFor(() =>
    expect(result.current.headlines.map(({ id }) => id)).toEqual(['h1', 'h2']),
  );
});

// The row stands in for the feed's Happening Now card, which applies no age
// filter of its own — a stale-only day must still fill the ticker rather than
// silently dropping the dock to one row.
it('should carry headlines the backend still serves however old they are', async () => {
  setHeadlines([
    headline('old', 36 * ONE_HOUR),
    headline('older', 92 * ONE_HOUR),
  ]);
  const { result } = render();

  await waitFor(() =>
    expect(result.current.headlines.map(({ id }) => id)).toEqual([
      'old',
      'older',
    ]),
  );
});

it('should keep the order the API returned rather than resorting', async () => {
  setHeadlines([
    headline('newest'),
    headline('middle', 40 * ONE_HOUR),
    headline('oldest', 90 * ONE_HOUR),
  ]);
  const { result } = render();

  await waitFor(() =>
    expect(result.current.headlines.map(({ id }) => id)).toEqual([
      'newest',
      'middle',
      'oldest',
    ]),
  );
});

it('should leave the row empty when the API has no headlines at all', async () => {
  setHeadlines([]);
  const { result } = render();

  await waitFor(() => expect(mockQueryOptions).toHaveBeenCalled());
  expect(result.current.headlines).toEqual([]);
});

it('should not query at all while the strip is off', async () => {
  setHeadlines([headline('h1')]);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const { result } = renderHook(() => useStripHeadlines(false), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });

  await waitFor(() => expect(result.current.headlines).toEqual([]));
});

it('should report settled only once the query has answered', async () => {
  setHeadlines([headline('h1')]);
  const { result } = render();

  expect(result.current.isSettled).toBe(false);
  await waitFor(() => expect(result.current.isSettled).toBe(true));
});

it('should count as settled while the strip is off so the feed keeps its card', () => {
  setHeadlines([headline('h1')]);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const { result } = renderHook(() => useStripHeadlines(false), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });

  expect(result.current.isSettled).toBe(true);
});
