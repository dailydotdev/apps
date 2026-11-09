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
import type { Picks, PicksWeekSignals } from '../../graphql/picks';
import {
  MY_CURRENT_PICKS_QUERY,
  PICKS_VIEW_COUNT_QUERY,
  PICKS_WEEK_SIGNALS_QUERY,
} from '../../graphql/picks';
import { LogEvent, Origin } from '../../lib/log';
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
  items: [],
};

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

const renderHero = ({ enabled = true, user = loggedUser } = {}) => {
  const gb = createReadyGrowthBook();
  gb.setFeatures({ weekly_picks: { defaultValue: enabled } });

  return render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user, isLoggedIn: !!user }}
      log={{ logEvent }}
      gb={gb}
    >
      <WeeklyPicksHero />
    </TestBootProvider>,
  );
};

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
  mockIsNudgeDay = true;
});

it('should nudge a reader whose week clears the bar', async () => {
  mockCurrentPicks(null);
  mockSignals({ upvotes: 4, bookmarks: 2, reads: 6 });
  renderHero();

  expect(
    await screen.findByText(
      'You upvoted 4, bookmarked 2 and read 6 posts this week',
    ),
  ).toBeInTheDocument();
  expect(
    screen.getByText('Turn the best into picks for your team'),
  ).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Make your picks' })).toHaveAttribute(
    'href',
    '/picks/new?origin=home_hero',
  );
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
  expect(screen.queryByText('Make your picks')).not.toBeInTheDocument();
});

it('should show the live list with its opens and share it', async () => {
  mockCurrentPicks(picks);
  mockViewCount(12);
  renderHero();

  expect(
    await screen.findByText('Your picks are live · opened by 12'),
  ).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Share' }));

  expect(mockOpenShareSheet).toHaveBeenCalledWith(picks, Origin.HomePage);
  expect(logEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      event_name: LogEvent.ClickPicksHero,
      extra: expect.stringContaining('"state":"live"'),
    }),
  );
});

it('should show nothing outside the rollout', async () => {
  renderHero({ enabled: false });

  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(screen.queryByText('Make your picks')).not.toBeInTheDocument();
  expect(nock.pendingMocks()).toEqual([]);
});

it('should stay closed for the rest of the week once dismissed', async () => {
  mockCurrentPicks(null);
  mockSignals({ upvotes: 3, bookmarks: 0, reads: 0 });
  const { unmount } = renderHero();
  await screen.findByText('You upvoted 3 posts this week');

  await userEvent.click(screen.getByRole('button', { name: 'Close banner' }));

  await waitFor(() =>
    expect(
      screen.queryByText('You upvoted 3 posts this week'),
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
    screen.queryByText('You upvoted 3 posts this week'),
  ).not.toBeInTheDocument();
});
