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

jest.mock('../../../lib/constants', () => ({
  ...(jest.requireActual('../../../lib/constants') as Record<string, unknown>),
  isDevelopment: true,
}));

const mockQueryOptions = jest.mocked(majorHeadlinesQueryOptions);
const mockConstants = jest.requireMock('../../../lib/constants') as {
  isDevelopment: boolean;
};

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
  mockConstants.isDevelopment = true;
});

it('should carry the headlines the API returned', async () => {
  setHeadlines([headline('h1'), headline('h2')]);
  const { result } = render();

  await waitFor(() =>
    expect(result.current.map(({ id }) => id)).toEqual(['h1', 'h2']),
  );
});

it('should drop a headline older than the freshness window', async () => {
  setHeadlines([headline('fresh'), headline('stale', 25 * ONE_HOUR)]);
  const { result } = render();

  await waitFor(() =>
    expect(result.current.map(({ id }) => id)).toEqual(['fresh']),
  );
});

it('should fall back to the fixture in development so the row is never empty', async () => {
  setHeadlines([]);
  const { result } = render();

  await waitFor(() => expect(result.current.length).toBeGreaterThan(0));
  expect(result.current.every(({ id }) => id.startsWith('mock-'))).toBe(true);
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

  await waitFor(() => expect(result.current).toEqual([]));
});

it('should leave the row empty outside development', async () => {
  mockConstants.isDevelopment = false;
  setHeadlines([]);
  const { result } = render();

  await waitFor(() => expect(mockQueryOptions).toHaveBeenCalled());
  expect(result.current).toEqual([]);
});
