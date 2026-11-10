import React from 'react';
import nock from 'nock';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createReadyGrowthBook,
  TestBootProvider,
} from '../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import type {
  Picks,
  PicksSuggestion,
  PicksWeekSignals,
} from '../../graphql/picks';
import type { LoggedUser } from '../../lib/user';
import {
  MY_CURRENT_PICKS_QUERY,
  PICKS_SUGGESTIONS_QUERY,
  PICKS_VIEW_COUNT_QUERY,
  PICKS_WEEK_SIGNALS_QUERY,
} from '../../graphql/picks';
import { GET_PERSONALIZED_DIGEST_SETTINGS } from '../../graphql/users';
import { LogEvent, Origin } from '../../lib/log';
import { useWeeklyPicksHero } from '../../hooks/picks/useWeeklyPicksHero';
import { WeeklyPicksHero } from './WeeklyPicksHero';

let mockIsNudgeDay = true;

jest.mock('../../lib/picks', () => ({
  ...jest.requireActual('../../lib/picks'),
  isPicksNudgeDay: () => mockIsNudgeDay,
}));

const mockOpenShareSheet = jest.fn();

jest.mock('../../hooks/picks/useSharePicks', () => ({
  useSharePicks: () => ({ openShareSheet: mockOpenShareSheet }),
}));

const mockCopy = jest.fn();

jest.mock('../../hooks/useCopy', () => ({
  useCopyLink: () => [false, mockCopy],
}));

jest.mock('next/router', () => ({
  useRouter: () => ({ push: jest.fn(), query: {}, asPath: '/', pathname: '/' }),
}));

const logEvent = jest.fn();

const picks: Picks = {
  id: 'picks-1',
  weekStart: '2026-11-02',
  author: {
    id: loggedUser.id,
    name: loggedUser.name,
    username: loggedUser.username,
    image: loggedUser.image,
    permalink: loggedUser.permalink,
  },
  items: [
    {
      position: 2,
      post: {
        id: 'p2',
        permalink: 'https://app.daily.dev/posts/p2',
        commentsPermalink: 'https://app.daily.dev/posts/p2',
        image: 'https://img/p2.jpg',
        type: 'article',
      },
    },
    {
      position: 1,
      post: {
        id: 'p1',
        permalink: 'https://app.daily.dev/posts/p1',
        commentsPermalink: 'https://app.daily.dev/posts/p1',
        image: 'https://img/p1.jpg',
        type: 'article',
      },
    },
  ],
};

const suggestion = (id: string, read = true): PicksSuggestion => ({
  reason: 'read',
  upvoted: false,
  bookmarked: false,
  read,
  post: {
    id,
    permalink: `https://app.daily.dev/posts/${id}`,
    commentsPermalink: `https://app.daily.dev/posts/${id}`,
    image: `https://img/${id}.jpg`,
    type: 'article',
  },
});

const mockSuggestions = (suggestions: PicksSuggestion[]) =>
  mockGraphQL({
    request: { query: PICKS_SUGGESTIONS_QUERY },
    result: { data: { picksSuggestions: suggestions } },
  });

const mockCurrentPicks = (current: Picks | null) =>
  mockGraphQL({
    request: { query: MY_CURRENT_PICKS_QUERY },
    result: { data: { myCurrentPicks: current } },
  });

const mockSignals = (signals: PicksWeekSignals) =>
  mockGraphQL({
    request: { query: PICKS_WEEK_SIGNALS_QUERY },
    result: { data: { myPicksWeekSignals: signals } },
  });

const mockViewCount = (viewCount: number) =>
  mockGraphQL({
    request: { query: PICKS_VIEW_COUNT_QUERY, variables: { id: picks.id } },
    result: { data: { picks: { id: picks.id, viewCount } } },
  });

// The layout owns the hook so it can hold the feed; this stands in for it.
const Harness = () => {
  const hero = useWeeklyPicksHero();

  return (
    <>
      <WeeklyPicksHero hero={hero} />
      {hero.isSettled && <span data-testid="settled" />}
    </>
  );
};

const renderHero = ({
  enabled = true,
  user = loggedUser,
}: { enabled?: boolean; user?: LoggedUser | null } = {}) => {
  const gb = createReadyGrowthBook();
  gb.setFeatures({ weekly_picks: { defaultValue: enabled } });
  if (user) {
    // The reading reminder's data, which the card waits for before landing
    mockGraphQL({
      request: { query: GET_PERSONALIZED_DIGEST_SETTINGS, variables: {} },
      result: { data: { personalizedDigest: [] } },
    });
  }

  return render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: user ?? undefined, isLoggedIn: !!user }}
      log={{ logEvent }}
      gb={gb}
    >
      <Harness />
    </TestBootProvider>,
  );
};

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
  mockIsNudgeDay = true;
});

it("should ask which of the week's posts were worth it", async () => {
  mockCurrentPicks(null);
  mockSignals({ upvotes: 4, bookmarks: 2, reads: 6 });
  mockSuggestions([
    suggestion('a'),
    suggestion('popular', false),
    suggestion('b'),
    suggestion('c'),
    suggestion('d'),
  ]);
  renderHero();

  const headline = await screen.findByText(
    (_, element) =>
      ['P', 'H3'].includes(element?.tagName ?? '') &&
      element.textContent === '12 posts this week. Which 3 were worth it?',
  );
  expect(headline).toBeInTheDocument();
  expect(screen.getByText('Your week · Closes Sunday')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Pick my top 3' })).toHaveAttribute(
    'href',
    '/picks/new?origin=home_hero',
  );
  // The reader's own posts, three of them, the popular one skipped
  await waitFor(() => expect(screen.getAllByText('?')).toHaveLength(3));
  expect(
    screen
      .getAllByRole('presentation', { hidden: true })
      .map((img) => (img as HTMLImageElement).src),
  ).toEqual(['https://img/a.jpg', 'https://img/b.jpg', 'https://img/c.jpg']);
  await waitFor(() =>
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.ImpressionPicksHero,
        origin: Origin.HomePage,
        extra: expect.stringContaining('"state":"nudge"'),
      }),
    ),
  );
});

it('should close for the week once the reader goes to pick', async () => {
  mockCurrentPicks(null);
  mockSignals({ upvotes: 3, bookmarks: 0, reads: 0 });
  mockSuggestions([]);
  renderHero();

  await userEvent.click(
    await screen.findByRole('link', { name: 'Pick my top 3' }),
  );

  expect(logEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      event_name: LogEvent.ClickPicksHero,
      extra: expect.stringContaining('"action":"pick"'),
    }),
  );
  await waitFor(() =>
    expect(
      screen.queryByRole('link', { name: 'Pick my top 3' }),
    ).not.toBeInTheDocument(),
  );
});

it('should stay quiet below the bar', async () => {
  mockCurrentPicks(null);
  mockSignals({ upvotes: 1, bookmarks: 0, reads: 1 });
  renderHero();

  await waitFor(() => expect(nock.isDone()).toBe(true));
  expect(screen.queryByText(/this week/)).not.toBeInTheDocument();
  expect(logEvent).not.toHaveBeenCalled();
});

it('should wait for Thursday before nudging', async () => {
  mockIsNudgeDay = false;
  mockCurrentPicks(null);
  renderHero();

  await waitFor(() => expect(nock.isDone()).toBe(true));
  expect(screen.queryByText('Pick my top 3')).not.toBeInTheDocument();
});

it('should lead with the opens and share again', async () => {
  mockCurrentPicks(picks);
  mockSignals({ upvotes: 4, bookmarks: 2, reads: 6 });
  mockViewCount(12);
  renderHero();

  expect(await screen.findByText('12')).toBeInTheDocument();
  expect(
    screen.getByText(
      (_, element) =>
        ['P', 'H3'].includes(element?.tagName ?? '') &&
        element.textContent === '12 people opened your picks',
    ),
  ).toBeInTheDocument();
  // The picks in their order, numbered
  expect(screen.getAllByText(/^(12|1|2)$/).map((el) => el.textContent)).toEqual(
    ['12', '1', '2'],
  );
  await userEvent.click(screen.getByRole('button', { name: 'Share again' }));

  expect(mockOpenShareSheet).toHaveBeenCalledWith(picks, Origin.HomePage);
  expect(logEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      event_name: LogEvent.ClickPicksHero,
      extra: expect.stringContaining('"action":"share"'),
    }),
  );
  expect(
    screen.getByRole('button', { name: 'Share again' }),
  ).toBeInTheDocument();
});

it('should lead with the link when nobody opened the picks yet', async () => {
  mockCurrentPicks(picks);
  mockSignals({ upvotes: 4, bookmarks: 2, reads: 6 });
  mockViewCount(0);
  renderHero();

  expect(
    await screen.findByText("Nobody's opened your picks yet"),
  ).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Copy link' }));

  expect(mockCopy).toHaveBeenCalledWith(
    expect.objectContaining({
      link: expect.stringMatching(/\/picks\/picks-1\?.*cid=share_picks/),
      shorten: true,
    }),
  );
  expect(logEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      event_name: LogEvent.SharePicks,
      extra: expect.stringContaining('"provider":"copy_link"'),
    }),
  );
});

it('should hold the live card until the opens count is in', async () => {
  mockCurrentPicks(picks);
  mockSignals({ upvotes: 4, bookmarks: 2, reads: 6 });
  nock('http://localhost:3000')
    .post('/graphql', {
      query: PICKS_VIEW_COUNT_QUERY,
      variables: { id: picks.id },
    })
    .delay(150)
    .reply(200, { data: { picks: { id: picks.id, viewCount: 12 } } });
  renderHero();

  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(screen.queryByTestId('settled')).not.toBeInTheDocument();
  expect(screen.queryByText('Copy link')).not.toBeInTheDocument();

  expect(await screen.findByText('12')).toBeInTheDocument();
  expect(screen.getByTestId('settled')).toBeInTheDocument();
});

it('should show nothing outside the rollout', async () => {
  renderHero({ enabled: false });

  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(screen.queryByText('Pick my top 3')).not.toBeInTheDocument();
  expect(screen.getByTestId('settled')).toBeInTheDocument();
  expect(nock.pendingMocks()).toEqual([]);
});

it('should hold its verdict until the week has been read', async () => {
  mockCurrentPicks(null);
  mockSignals({ upvotes: 1, bookmarks: 0, reads: 0 });
  renderHero();

  expect(screen.queryByTestId('settled')).not.toBeInTheDocument();
  await screen.findByTestId('settled');
  expect(screen.queryByText(/this week/)).not.toBeInTheDocument();
});

it('should settle at once for a visitor who is not signed in', async () => {
  renderHero({ user: null });

  expect(screen.getByTestId('settled')).toBeInTheDocument();
  expect(nock.pendingMocks()).toEqual([]);
});

it('should stay closed for the rest of the week once dismissed', async () => {
  mockCurrentPicks(null);
  mockSignals({ upvotes: 3, bookmarks: 0, reads: 0 });
  mockSuggestions([]);
  const { unmount } = renderHero();
  await screen.findByRole('link', { name: 'Pick my top 3' });

  await userEvent.click(screen.getByRole('button', { name: 'Close banner' }));

  await waitFor(() =>
    expect(
      screen.queryByRole('link', { name: 'Pick my top 3' }),
    ).not.toBeInTheDocument(),
  );
  expect(logEvent).toHaveBeenCalledWith(
    expect.objectContaining({ event_name: LogEvent.DismissPicksHero }),
  );

  unmount();
  mockCurrentPicks(null);
  mockSignals({ upvotes: 3, bookmarks: 0, reads: 0 });
  renderHero();
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(
    screen.queryByRole('link', { name: 'Pick my top 3' }),
  ).not.toBeInTheDocument();
});
