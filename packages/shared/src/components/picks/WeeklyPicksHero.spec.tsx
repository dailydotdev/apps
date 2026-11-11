import React from 'react';
import nock from 'nock';
import { clear, get, set } from 'idb-keyval';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GrowthBook } from '@growthbook/growthbook-react';
import {
  createReadyGrowthBook,
  TestBootProvider,
} from '../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import type {
  Picks,
  PicksWeekPost,
  PicksWeekSignals,
} from '../../graphql/picks';
import type { LoggedUser } from '../../lib/user';
import {
  MY_CURRENT_PICKS_QUERY,
  PICKS_VIEW_COUNT_QUERY,
  PICKS_WEEK_SIGNALS_QUERY,
} from '../../graphql/picks';
import { GET_PERSONALIZED_DIGEST_SETTINGS } from '../../graphql/users';
import { LogEvent, Origin } from '../../lib/log';
import type { WeeklyPicksHeroSnapshot } from '../../hooks/picks/useWeeklyPicksHero';
import { useWeeklyPicksHero } from '../../hooks/picks/useWeeklyPicksHero';
import { PersistentContextKeys } from '../../hooks/usePersistentContext';
import { getCurrentWeekStart } from '../../lib/picks';
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

const weekPost = (id: string): PicksWeekPost => ({
  id,
  image: `https://img/${id}.jpg`,
});

const mockCurrentPicks = (current: Picks | null) =>
  mockGraphQL({
    request: { query: MY_CURRENT_PICKS_QUERY },
    result: { data: { myCurrentPicks: current } },
  });

const mockSignals = (
  signals: Omit<PicksWeekSignals, 'posts'> & { posts?: PicksWeekPost[] },
) =>
  mockGraphQL({
    request: { query: PICKS_WEEK_SIGNALS_QUERY },
    result: { data: { myPicksWeekSignals: { posts: [], ...signals } } },
  });

const mockViewCount = (viewCount: number) =>
  mockGraphQL({
    request: { query: PICKS_VIEW_COUNT_QUERY, variables: { id: picks.id } },
    result: { data: { picks: { id: picks.id, viewCount } } },
  });

// The layout owns the hook so it can hold the feed; this stands in for it.
const Harness = ({ waitMs }: { waitMs?: number }) => {
  const hero = useWeeklyPicksHero({ waitMs });

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
  waitMs,
}: { enabled?: boolean; user?: LoggedUser | null; waitMs?: number } = {}) => {
  const gb = createReadyGrowthBook();
  gb.setFeatures({ weekly_picks_v2: { defaultValue: enabled } });
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
      <Harness waitMs={waitMs} />
    </TestBootProvider>,
  );
};

const nudgeSignals: PicksWeekSignals = {
  upvotes: 4,
  bookmarks: 2,
  reads: 6,
  posts: [weekPost('a'), weekPost('b'), weekPost('c')],
};

// What an earlier visit saved: the card paints from it on this one.
const seedSnapshot = (
  snapshot: Pick<WeeklyPicksHeroSnapshot, 'state'> &
    Partial<WeeklyPicksHeroSnapshot>,
) =>
  set(PersistentContextKeys.WeeklyPicksHeroSnapshot, {
    userId: loggedUser.id,
    week: getCurrentWeekStart(),
    signals: null,
    picks: null,
    viewCount: null,
    ...snapshot,
  });

const getSnapshot = () =>
  get<WeeklyPicksHeroSnapshot | null>(
    PersistentContextKeys.WeeklyPicksHeroSnapshot,
  );

beforeEach(async () => {
  nock.cleanAll();
  jest.clearAllMocks();
  mockIsNudgeDay = true;
  await clear();
});

it("should ask which of the week's posts were worth it", async () => {
  await seedSnapshot({ state: 'nudge', signals: nudgeSignals });
  mockCurrentPicks(null);
  mockSignals(nudgeSignals);
  renderHero();

  const headline = await screen.findByText(
    (_, element) =>
      !!element &&
      ['P', 'H3'].includes(element.tagName) &&
      element.textContent === '12 posts this week. Which 3 were worth\u00a0it?',
  );
  expect(headline).toBeInTheDocument();
  expect(screen.getByText('Your week')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Pick my top 3' })).toHaveAttribute(
    'href',
    '/picks/new?origin=home_hero',
  );
  // The reader's own posts, three of them
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

it('should save the verdict on the first visit and show it on the next', async () => {
  mockCurrentPicks(null);
  mockSignals(nudgeSignals);
  const { unmount } = renderHero();

  await waitFor(async () =>
    expect(await getSnapshot()).toEqual(
      expect.objectContaining({
        userId: loggedUser.id,
        week: getCurrentWeekStart(),
        state: 'nudge',
      }),
    ),
  );
  expect(screen.queryByText('Pick my top 3')).not.toBeInTheDocument();
  expect(logEvent).not.toHaveBeenCalled();

  unmount();
  mockCurrentPicks(null);
  mockSignals(nudgeSignals);
  renderHero();
  expect(
    await screen.findByRole('link', { name: 'Pick my top 3' }),
  ).toBeInTheDocument();
});

it('should not hold the feed on the background checks', async () => {
  nock('http://localhost:3000')
    .post('/graphql', { query: MY_CURRENT_PICKS_QUERY })
    .delay(300)
    .reply(200, { data: { myCurrentPicks: null } });
  mockSignals(nudgeSignals);
  const startedAt = Date.now();
  renderHero();

  expect(await screen.findByTestId('settled')).toBeInTheDocument();
  expect(Date.now() - startedAt).toBeLessThan(300);
  // The late answer does not move what is already on screen
  await new Promise((resolve) => setTimeout(resolve, 350));
  expect(screen.queryByText('Pick my top 3')).not.toBeInTheDocument();
});

it('should close for the week once the reader goes to pick', async () => {
  await seedSnapshot({ state: 'nudge', signals: nudgeSignals });
  mockCurrentPicks(null);
  mockSignals(nudgeSignals);
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

it('should save nothing below the bar', async () => {
  mockCurrentPicks(null);
  mockSignals({ upvotes: 1, bookmarks: 0, reads: 1 });
  renderHero();

  await waitFor(() => expect(nock.isDone()).toBe(true));
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(await getSnapshot()).toBeFalsy();
  expect(screen.queryByText(/this week/)).not.toBeInTheDocument();
  expect(logEvent).not.toHaveBeenCalled();
});

it('should forget a saved nudge once the week drops below the bar', async () => {
  await seedSnapshot({ state: 'nudge', signals: nudgeSignals });
  mockCurrentPicks(null);
  mockSignals({ upvotes: 1, bookmarks: 0, reads: 1 });
  renderHero();

  await waitFor(async () => expect(await getSnapshot()).toBeNull());
});

it('should not nudge from a saved verdict outside the nudge days', async () => {
  mockIsNudgeDay = false;
  await seedSnapshot({ state: 'nudge', signals: nudgeSignals });
  mockCurrentPicks(null);
  renderHero();

  await screen.findByTestId('settled');
  await waitFor(() => expect(nock.isDone()).toBe(true));
  expect(screen.queryByText('Pick my top 3')).not.toBeInTheDocument();
});

it('should lead with the opens and share again', async () => {
  await seedSnapshot({ state: 'live', picks, viewCount: 12 });
  mockCurrentPicks(picks);
  mockViewCount(12);
  renderHero();

  expect(await screen.findByText('12')).toBeInTheDocument();
  expect(
    screen.getByText(
      (_, element) =>
        !!element &&
        ['P', 'H3'].includes(element.tagName) &&
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
  await seedSnapshot({ state: 'live', picks, viewCount: 0 });
  mockCurrentPicks(picks);
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

it('should paint the saved opens count and refresh it in place', async () => {
  await seedSnapshot({ state: 'live', picks, viewCount: 7 });
  mockCurrentPicks(picks);
  nock('http://localhost:3000')
    .post('/graphql', {
      query: PICKS_VIEW_COUNT_QUERY,
      variables: { id: picks.id },
    })
    .delay(150)
    .reply(200, { data: { picks: { id: picks.id, viewCount: 12 } } });
  renderHero();

  expect(await screen.findByText('7')).toBeInTheDocument();
  expect(screen.getByTestId('settled')).toBeInTheDocument();
  expect(await screen.findByText('12')).toBeInTheDocument();
});

it('should show no card when the picks query fails', async () => {
  nock('http://localhost:3000')
    .post('/graphql', { query: MY_CURRENT_PICKS_QUERY })
    .reply(500);
  mockSignals({ upvotes: 4, bookmarks: 2, reads: 6, posts: [weekPost('a')] });
  renderHero();

  expect(await screen.findByTestId('settled')).toBeInTheDocument();
  expect(screen.queryByText('Pick my top 3')).not.toBeInTheDocument();
});

it('should show nothing outside the rollout', async () => {
  await seedSnapshot({ state: 'nudge', signals: nudgeSignals });
  mockCurrentPicks(null);
  mockSignals(nudgeSignals);
  renderHero({ enabled: false });

  await screen.findByTestId('settled');
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(screen.queryByText('Pick my top 3')).not.toBeInTheDocument();
  expect(logEvent).not.toHaveBeenCalled();
});

describe('experiment exposure', () => {
  const mountWithExperiment = () => {
    const trackingCallback = jest.fn();
    const gb = new GrowthBook({
      attributes: { userId: loggedUser.id },
      trackingCallback,
    });
    gb.setFeatures({
      weekly_picks_v2: {
        defaultValue: false,
        rules: [
          {
            key: 'weekly_picks_v2',
            hashAttribute: 'userId',
            variations: [false, true],
            weights: [0, 1],
          },
        ],
      },
    });
    mockGraphQL({
      request: { query: GET_PERSONALIZED_DIGEST_SETTINGS, variables: {} },
      result: { data: { personalizedDigest: [] } },
    });
    const view = render(
      <TestBootProvider
        client={new QueryClient()}
        auth={{ user: loggedUser, isLoggedIn: true }}
        log={{ logEvent }}
        gb={gb}
      >
        <Harness />
      </TestBootProvider>,
    );

    return { trackingCallback, unmount: view.unmount };
  };

  it('should not enroll a reader on the visit that only works out the verdict', async () => {
    mockCurrentPicks(null);
    mockSignals(nudgeSignals);
    const { trackingCallback } = mountWithExperiment();

    await waitFor(async () => expect(await getSnapshot()).toBeTruthy());
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(trackingCallback).not.toHaveBeenCalled();
  });

  it('should enroll a reader when the card paints', async () => {
    await seedSnapshot({ state: 'nudge', signals: nudgeSignals });
    mockCurrentPicks(null);
    mockSignals(nudgeSignals);
    const { trackingCallback } = mountWithExperiment();

    await screen.findByRole('link', { name: 'Pick my top 3' });
    expect(trackingCallback).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'weekly_picks_v2' }),
      expect.anything(),
    );
  });

  it('should not enroll a reader whose saved nudge is stale', async () => {
    mockIsNudgeDay = false;
    await seedSnapshot({ state: 'nudge', signals: nudgeSignals });
    mockCurrentPicks(null);
    const { trackingCallback } = mountWithExperiment();

    await screen.findByTestId('settled');
    await waitFor(() => expect(nock.isDone()).toBe(true));
    expect(trackingCallback).not.toHaveBeenCalled();
  });
});

it('should settle at once for a visitor who is not signed in', async () => {
  renderHero({ user: null });

  expect(screen.getByTestId('settled')).toBeInTheDocument();
  expect(nock.pendingMocks()).toEqual([]);
});

it('should stay closed for the rest of the week once dismissed', async () => {
  await seedSnapshot({ state: 'nudge', signals: nudgeSignals });
  mockCurrentPicks(null);
  mockSignals(nudgeSignals);
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
  renderHero();
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(
    screen.queryByRole('link', { name: 'Pick my top 3' }),
  ).not.toBeInTheDocument();
});
