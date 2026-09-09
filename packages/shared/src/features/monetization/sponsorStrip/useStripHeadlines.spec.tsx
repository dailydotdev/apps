import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type {
  StatuslineFeedData,
  StatuslineItem,
} from '../../../graphql/statusline';
import { statuslineFeedQueryOptions } from '../../../graphql/statusline';
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

// The feed's own Happening Now card renders the curated headlines, off the
// same table, so carrying them here too would show one story twice on a screen.
it('should drop the curated half and keep only the popular posts', async () => {
  setItems([headline('h1'), post('p1'), headline('h2'), post('p2')]);
  const { result } = render();

  await waitFor(() =>
    expect(result.current.headlines.map(({ id }) => id)).toEqual(['p1', 'p2']),
  );
});

it('should leave the row empty when the mix is all headlines', async () => {
  setItems([headline('h1'), headline('h2')]);
  const { result } = render();

  await waitFor(() => expect(mockQueryOptions).toHaveBeenCalled());
  expect(result.current.headlines).toEqual([]);
});

// Which posts count as popular is the backend's call — a quiet day must still
// fill the ticker rather than silently dropping the dock to one row.
it('should carry posts the backend still serves however old they are', async () => {
  setItems([post('old'), post('older')]);
  const { result } = render();

  await waitFor(() =>
    expect(result.current.headlines.map(({ id }) => id)).toEqual([
      'old',
      'older',
    ]),
  );
});

it('should keep the order the API returned rather than resorting', async () => {
  setItems([post('first', 4), post('second', 900), post('third', 40)]);
  const { result } = render();

  await waitFor(() =>
    expect(result.current.headlines.map(({ id }) => id)).toEqual([
      'first',
      'second',
      'third',
    ]),
  );
});

it('should draw no more rows than the ticker shows', async () => {
  setItems(Array.from({ length: 20 }, (_, i) => post(`p${i}`)));
  const { result } = render();

  await waitFor(() => expect(result.current.headlines).toHaveLength(12));
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
