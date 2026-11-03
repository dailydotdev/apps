import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook';
import nock from 'nock';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import { mockGraphQL } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { waitForNock } from '@dailydotdev/shared/__tests__/helpers/utilities';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import {
  MY_CURRENT_PICKS_QUERY,
  PICKS_SUGGESTIONS_QUERY,
  UPSERT_PICKS_MUTATION,
} from '@dailydotdev/shared/src/graphql/picks';
import type { Picks } from '@dailydotdev/shared/src/graphql/picks';
import { LogEvent, Origin } from '@dailydotdev/shared/src/lib/log';
import NewPicksPage from '../pages/picks/new';

const mockOpenShareSheet = jest.fn();
jest.mock('@dailydotdev/shared/src/hooks/picks/useSharePicks', () => ({
  useSharePicks: () => ({ openShareSheet: mockOpenShareSheet }),
}));

const replace = jest.fn();
const logEvent = jest.fn();

const post = (n: number) => ({
  id: `p${n}`,
  title: `Post ${n}`,
  image: `https://img/${n}.png`,
  permalink: `https://dly.to/p${n}`,
  commentsPermalink: `https://app/posts/p${n}`,
  type: 'article',
});
const suggestion = (n: number) => ({
  post: post(n),
  reason: 'upvoted',
  upvoted: true,
  bookmarked: false,
  read: true,
});
const author = { id: 'u1', name: 'A', username: 'a', image: '', permalink: '' };

const mockData = (current: Picks | null, suggestions: unknown[]) => {
  mockGraphQL({
    request: { query: MY_CURRENT_PICKS_QUERY },
    result: { data: { myCurrentPicks: current } },
  });
  mockGraphQL({
    request: { query: PICKS_SUGGESTIONS_QUERY },
    result: { data: { picksSuggestions: suggestions } },
  });
};

const renderPage = (enabled = true) => {
  const gb = new GrowthBook({
    features: { weekly_picks: { defaultValue: enabled } },
  });
  return render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: loggedUser }}
      log={{ logEvent }}
      gb={gb}
    >
      <NewPicksPage />
    </TestBootProvider>,
  );
};

const title = (text: string) =>
  screen
    .getAllByText(text)
    .find((el) => el.classList.contains('line-clamp-2')) as HTMLElement;

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
  jest.mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/picks/new',
        query: { origin: 'bookmarks' },
        replace,
        push: jest.fn(),
        isReady: true,
      }) as unknown as NextRouter,
  );
});

it('should redirect to the feed when the flag is off', async () => {
  renderPage(false);
  await waitFor(() => expect(replace).toHaveBeenCalledWith('/'));
  expect(screen.queryByText('Weekly picks')).not.toBeInTheDocument();
});

it('should render suggestions and log the start with the origin', async () => {
  mockData(null, [suggestion(1), suggestion(2)]);
  renderPage();
  await waitForNock();
  await waitFor(() => expect(title('Post 1')).toBeTruthy());
  expect(screen.getByText('Weekly picks')).toBeInTheDocument();
  expect(screen.queryByText('View my picks')).not.toBeInTheDocument();
  await waitFor(() =>
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.StartPicks,
        extra: JSON.stringify({ origin: Origin.Bookmarks, is_edit: false }),
      }),
    ),
  );
});

it('should prefill the selection and keep picks missing from the suggestions', async () => {
  const current = {
    id: 'picks-1',
    weekStart: '2026-11-02',
    author,
    items: [
      { position: 0, note: 'old note', post: post(9) },
      { position: 1, note: null, post: post(2) },
    ],
  } as Picks;
  mockData(current, [suggestion(1), suggestion(2)]);
  renderPage();
  await waitForNock();
  await waitFor(() => expect(title('Post 9')).toBeTruthy());
  expect(screen.getByText('2 of 5 selected')).toBeInTheDocument();
  expect(screen.getByDisplayValue('old note')).toBeInTheDocument();
  expect(screen.getByText('View my picks').closest('a')).toHaveAttribute(
    'href',
    '/picks/picks-1',
  );
});

it('should show the empty state', async () => {
  mockData(null, []);
  renderPage();
  await waitForNock();
  expect(
    await screen.findByText('Nothing to pick yet this week'),
  ).toBeInTheDocument();
  expect(screen.getByText('Back to feed').closest('a')).toHaveAttribute(
    'href',
    '/',
  );
});

it('should publish and open the share sheet', async () => {
  const published = {
    id: 'picks-1',
    weekStart: '2026-11-02',
    author,
    items: [],
  } as Picks;
  mockData(null, [suggestion(1), suggestion(2)]);
  renderPage();
  await waitForNock();
  await waitFor(() => expect(title('Post 2')).toBeTruthy());
  fireEvent.click(title('Post 2'));
  fireEvent.click(title('Post 1'));
  mockGraphQL({
    request: {
      query: UPSERT_PICKS_MUTATION,
      variables: {
        items: [
          { postId: 'p2', note: null },
          { postId: 'p1', note: null },
        ],
      },
    },
    result: { data: { upsertPicks: { id: 'picks-1', url: 'https://x/1' } } },
  });
  mockGraphQL({
    request: { query: MY_CURRENT_PICKS_QUERY },
    result: { data: { myCurrentPicks: published } },
  });
  fireEvent.click(screen.getAllByText('Done, share my picks')[0]);
  await waitFor(() =>
    expect(mockOpenShareSheet).toHaveBeenCalledWith(
      published,
      Origin.Bookmarks,
    ),
  );
  await waitForNock();
});
