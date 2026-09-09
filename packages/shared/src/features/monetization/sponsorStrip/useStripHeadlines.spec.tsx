import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type {
  StatuslineFeedData,
  StatuslineItem,
} from '../../../graphql/statusline';
import { statuslineFeedQueryOptions } from '../../../graphql/statusline';
import { ONE_HOUR } from '../../../lib/time';
import { useStripHeadlines } from './useStripHeadlines';

jest.mock('../../../graphql/statusline', () => ({
  ...(jest.requireActual('../../../graphql/statusline') as Record<
    string,
    unknown
  >),
  statuslineFeedQueryOptions: jest.fn(),
}));

const mockQueryOptions = jest.mocked(statuslineFeedQueryOptions);

const headline = (id: string, ageMs = 0): StatuslineItem => ({
  id,
  kind: 'HEADLINE',
  postId: `post-${id}`,
  title: `Headline ${id}`,
  upvotes: 0,
  permalink: `https://daily.dev/posts/${id}`,
  highlightedAt: new Date(Date.now() - ageMs).toISOString(),
});

const post = (id: string, upvotes = 10): StatuslineItem => ({
  id,
  kind: 'POST',
  postId: id,
  title: `Post ${id}`,
  upvotes,
  permalink: `https://daily.dev/posts/${id}`,
  highlightedAt: null,
});

const setItems = (statuslineFeed: StatuslineItem[]) =>
  mockQueryOptions.mockReturnValue({
    queryKey: ['statusline-feed', statuslineFeed.length],
    queryFn: async () => ({ statuslineFeed } as StatuslineFeedData),
  } as ReturnType<typeof statuslineFeedQueryOptions>);

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

it('should carry the mix the API returned', async () => {
  setItems([headline('h1'), post('p1'), headline('h2')]);
  const { result } = render();

  await waitFor(() =>
    expect(result.current.headlines.map(({ id }) => id)).toEqual([
      'h1',
      'p1',
      'h2',
    ]),
  );
});

// Which headlines still count as major, and which posts count as popular, is
// the backend's call — a stale-only day must still fill the ticker rather than
// silently dropping the dock to one row.
it('should carry items the backend still serves however old they are', async () => {
  setItems([headline('old', 36 * ONE_HOUR), headline('older', 92 * ONE_HOUR)]);
  const { result } = render();

  await waitFor(() =>
    expect(result.current.headlines.map(({ id }) => id)).toEqual([
      'old',
      'older',
    ]),
  );
});

it('should keep the order the API returned rather than resorting', async () => {
  setItems([
    headline('newest'),
    post('popular', 400),
    headline('oldest', 90 * ONE_HOUR),
  ]);
  const { result } = render();

  await waitFor(() =>
    expect(result.current.headlines.map(({ id }) => id)).toEqual([
      'newest',
      'popular',
      'oldest',
    ]),
  );
});

it('should leave the row empty when the API has nothing at all', async () => {
  setItems([]);
  const { result } = render();

  await waitFor(() => expect(mockQueryOptions).toHaveBeenCalled());
  expect(result.current.headlines).toEqual([]);
});

it('should not query at all while the strip is off', async () => {
  setItems([headline('h1')]);
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
  setItems([headline('h1')]);
  const { result } = render();

  expect(result.current.isSettled).toBe(false);
  await waitFor(() => expect(result.current.isSettled).toBe(true));
});

it('should count as settled while the strip is off so the dock reserves nothing', () => {
  setItems([headline('h1')]);
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
