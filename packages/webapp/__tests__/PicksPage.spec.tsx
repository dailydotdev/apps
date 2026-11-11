import React from 'react';
import nock from 'nock';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import { mockGraphQL } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { waitForNock } from '@dailydotdev/shared/__tests__/helpers/utilities';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import type { Picks } from '@dailydotdev/shared/src/graphql/picks';
import {
  PICKS_QUERY,
  PICKS_VIEW_COUNT_QUERY,
  TRACK_PICKS_VIEW_MUTATION,
} from '@dailydotdev/shared/src/graphql/picks';
import { LogEvent, Origin } from '@dailydotdev/shared/src/lib/log';
import { getCurrentWeekStart } from '@dailydotdev/shared/src/lib/picks';
import * as viewSize from '@dailydotdev/shared/src/hooks/useViewSize';
import PicksPage from '../pages/picks/[id]';

const mockPush = jest.fn();

const mockOpenShareSheet = jest.fn();

jest.mock('@dailydotdev/shared/src/hooks/picks/useSharePicks', () => ({
  useSharePicks: () => ({ openShareSheet: mockOpenShareSheet }),
}));

jest.mock('next/router', () => ({
  useRouter: () => ({
    isFallback: false,
    push: mockPush,
    query: {},
    asPath: '/',
  }),
}));

const makePost = (id: string, title: string, readTime = 9) => ({
  id,
  title,
  image: `https://daily.dev/${id}.jpg`,
  readTime,
  permalink: `https://app.daily.dev/r/${id}`,
  commentsPermalink: `https://app.daily.dev/posts/${id}`,
  type: 'article',
});

const picks: Picks = {
  id: 'picks-1',
  weekStart: '2026-11-02',
  author: {
    id: 'author-1',
    name: 'Ada Lovelace',
    username: 'ada',
    image: 'https://daily.dev/ada.jpg',
    permalink: 'https://app.daily.dev/ada',
  },
  items: [
    { position: 2, note: null, post: makePost('p2', 'Second pick') },
    {
      position: 1,
      note: 'Read this twice',
      post: makePost('p1', 'First pick'),
    },
  ],
};

const logEvent = jest.fn();

const trackView = jest.fn();
const readViewCount = jest.fn();

const mockViewCount = (id: string, viewCount: number | null) =>
  mockGraphQL({
    request: { query: PICKS_VIEW_COUNT_QUERY, variables: { id } },
    result: () => {
      readViewCount();
      return { data: { picks: { id, viewCount } } };
    },
  });

const renderPage = (data: Picks, auth: Record<string, unknown> = {}) => {
  mockGraphQL({
    request: { query: PICKS_QUERY, variables: { id: data.id } },
    result: { data: { picks: data } },
  });
  mockGraphQL({
    request: { query: TRACK_PICKS_VIEW_MUTATION, variables: { id: data.id } },
    result: () => {
      trackView();
      return { data: { trackPicksView: { _: true } } };
    },
  });
  const client = new QueryClient();

  return render(
    <TestBootProvider client={client} auth={auth} log={{ logEvent }}>
      <PicksPage picksId={data.id} seo={{}} dehydratedState={{} as never} />
    </TestBootProvider>,
  );
};

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
});

it('should render the author, subtitle and rows in position order', async () => {
  renderPage(picks, { user: undefined, isLoggedIn: false });
  await waitForNock();

  expect(await screen.findByText(/Ada Lovelace's picks/)).toHaveTextContent(
    "Ada Lovelace's picks · week 45",
  );
  expect(
    screen.getByText('2 posts worth your time, picked by Ada Lovelace'),
  ).toBeInTheDocument();

  const titles = screen
    .getAllByRole('link')
    .map((link) => link.textContent ?? '');
  expect(titles[0]).toContain('First pick');
  expect(titles[1]).toContain('Second pick');
  expect(screen.getByText('Read this twice')).toHaveClass('italic');
  expect(screen.getAllByText('9m read')).toHaveLength(2);
  expect(screen.getAllByRole('link')[0]).toHaveAttribute(
    'href',
    'https://app.daily.dev/posts/p1?userid=author-1&cid=share_picks',
  );
});

it('should log the view once with viewer context', async () => {
  renderPage(picks, { user: undefined, isLoggedIn: false });
  await screen.findByText(/Ada Lovelace's picks/);

  await waitFor(() =>
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.ViewPicksPage,
        extra: JSON.stringify({
          picks_id: 'picks-1',
          is_author: false,
          logged_in: false,
          is_new_user: false,
        }),
      }),
    ),
  );
  expect(
    logEvent.mock.calls.filter(
      ([event]) => event.event_name === LogEvent.ViewPicksPage,
    ),
  ).toHaveLength(1);
});

it('should log a pick click', async () => {
  renderPage(picks, { user: undefined, isLoggedIn: false });
  const link = (await screen.findByText('First pick')).closest('a');
  link?.addEventListener('click', (event) => event.preventDefault());
  await userEvent.click(link as HTMLElement);

  expect(logEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      event_name: LogEvent.ClickPickPost,
      extra: JSON.stringify({
        picks_id: 'picks-1',
        post_id: 'p1',
        position: 1,
      }),
    }),
  );
});

it('should show a message when no picks are available', async () => {
  renderPage({ ...picks, items: [] });

  expect(
    await screen.findByText('These picks are no longer available'),
  ).toBeInTheDocument();
  expect(screen.getByText('Make your picks')).toBeInTheDocument();
});

it('should send logged in viewers to the create flow with the page to fill from', async () => {
  renderPage(picks, { user: loggedUser, isLoggedIn: true });
  await userEvent.click(await screen.findByText('Make your picks'));

  expect(mockPush).toHaveBeenCalledWith(
    '/picks/new?origin=picks_page&from=picks-1',
  );
  expect(logEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      event_name: LogEvent.ClickMakeYourPicks,
      extra: JSON.stringify({ picks_id: 'picks-1', logged_in: true }),
    }),
  );
});

it('should send logged out viewers through auth and back to the create flow', async () => {
  renderPage(picks, { user: undefined, isLoggedIn: false });
  await userEvent.click(await screen.findByText('Make your picks'));

  expect(mockPush).toHaveBeenCalledWith(
    expect.stringContaining(
      `after_auth=${encodeURIComponent(
        '/picks/new?origin=picks_page&from=picks-1',
      )}`,
    ),
  );
});

it('should flag a viewer who signed up this week', async () => {
  renderPage(picks, {
    user: { ...loggedUser, createdAt: new Date().toISOString() },
    isLoggedIn: true,
  });
  await screen.findByText(/Ada Lovelace's picks/);

  await waitFor(() =>
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.ViewPicksPage,
        extra: JSON.stringify({
          picks_id: 'picks-1',
          is_author: false,
          logged_in: true,
          is_new_user: true,
        }),
      }),
    ),
  );
});

it('should send a viewer to the editor with a pick preselected', async () => {
  renderPage(picks, { user: loggedUser, isLoggedIn: true });
  await screen.findByText('First pick');
  const [addSecond] = screen.getAllByRole('button', {
    name: 'Add to my picks',
  });
  await userEvent.click(addSecond);

  expect(mockPush).toHaveBeenCalledWith(
    '/picks/new?origin=picks_page&from=picks-1&add=p1',
  );
  expect(logEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      event_name: LogEvent.ClickAddToPicks,
      extra: JSON.stringify({
        picks_id: 'picks-1',
        post_id: 'p1',
        logged_in: true,
      }),
    }),
  );
});

it('should keep the preselected pick through auth for logged out viewers', async () => {
  renderPage(picks, { user: undefined, isLoggedIn: false });
  await screen.findByText('First pick');
  await userEvent.click(
    screen.getAllByRole('button', { name: 'Add to my picks' })[1],
  );

  expect(mockPush).toHaveBeenCalledWith(
    expect.stringContaining(
      `after_auth=${encodeURIComponent(
        '/picks/new?origin=picks_page&from=picks-1&add=p2',
      )}`,
    ),
  );
});

it('should not offer the author to add their own picks', async () => {
  renderPage(picks, {
    user: { ...loggedUser, id: 'author-1' },
    isLoggedIn: true,
  });
  await screen.findByText('First pick');

  expect(
    screen.queryByRole('button', { name: 'Add to my picks' }),
  ).not.toBeInTheDocument();
});

it('should show the author a Share button that opens the share sheet', async () => {
  renderPage(picks, {
    user: { ...loggedUser, id: 'author-1' },
    isLoggedIn: true,
  });
  await userEvent.click(await screen.findByRole('button', { name: 'Share' }));

  expect(mockOpenShareSheet).toHaveBeenCalledWith(
    expect.objectContaining({ id: 'picks-1' }),
    Origin.PicksPage,
  );
});

it("should offer the author an edit of this week's picks", async () => {
  renderPage(
    { ...picks, weekStart: getCurrentWeekStart() },
    { user: { ...loggedUser, id: 'author-1' }, isLoggedIn: true },
  );
  await userEvent.click(await screen.findByText("Edit this week's picks"));

  expect(mockPush).toHaveBeenCalledWith('/picks/new?origin=picks_page');
  expect(screen.queryByText('Make your picks')).not.toBeInTheDocument();
});

it('should keep Make your picks for the author of a past week', async () => {
  renderPage(
    { ...picks, weekStart: '2020-01-06' },
    { user: { ...loggedUser, id: 'author-1' }, isLoggedIn: true },
  );

  expect(await screen.findByText('Make your picks')).toBeInTheDocument();
});

it('should not show a Share button to other viewers', async () => {
  renderPage(picks, { user: loggedUser, isLoggedIn: true });
  await screen.findByText(/Ada Lovelace's picks/);

  expect(
    screen.queryByRole('button', { name: 'Share' }),
  ).not.toBeInTheDocument();
});

it('should show the make picks CTA to every viewer', async () => {
  renderPage(picks, { user: loggedUser, isLoggedIn: true });

  expect(await screen.findByText('Make your picks')).toBeInTheDocument();
});

it('should count the open for a viewer', async () => {
  renderPage(picks, { user: loggedUser, isLoggedIn: true });
  await screen.findByText(/Ada Lovelace's picks/);

  await waitFor(() => expect(trackView).toHaveBeenCalledTimes(1));
  expect(screen.queryByText(/Opened by/)).not.toBeInTheDocument();
});

it('should count the open for a logged out viewer', async () => {
  renderPage(picks, { user: undefined, isLoggedIn: false });
  await screen.findByText(/Ada Lovelace's picks/);

  await waitFor(() => expect(trackView).toHaveBeenCalledTimes(1));
});

it('should not count the author and show them the opens, read fresh', async () => {
  mockViewCount('picks-1', 12);
  renderPage(picks, {
    user: { ...loggedUser, id: 'author-1' },
    isLoggedIn: true,
  });

  expect(await screen.findByText('Opened by 12')).toBeInTheDocument();
  expect(readViewCount).toHaveBeenCalledTimes(1);
  await waitFor(() =>
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({ event_name: LogEvent.ViewPicksPage }),
    ),
  );
  expect(trackView).not.toHaveBeenCalled();
});

it('should tell the author when nobody opened it yet', async () => {
  mockViewCount('picks-1', 0);
  renderPage(picks, {
    user: { ...loggedUser, id: 'author-1' },
    isLoggedIn: true,
  });

  expect(await screen.findByText('Not opened yet')).toBeInTheDocument();
});

it('should not read the count for other viewers', async () => {
  renderPage(picks, { user: loggedUser, isLoggedIn: true });
  await screen.findByText(/Ada Lovelace's picks/);
  await waitFor(() => expect(trackView).toHaveBeenCalledTimes(1));

  expect(readViewCount).not.toHaveBeenCalled();
});

describe('signup banner', () => {
  const headline = 'Ada Lovelace thought you may want to read these';
  const thisWeek = { ...picks, weekStart: getCurrentWeekStart() };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should invite a logged out viewer in the author's voice and log the impression", async () => {
    renderPage(thisWeek, { user: undefined, isLoggedIn: false });

    expect(await screen.findByText(headline)).toBeInTheDocument();
    expect(
      screen.getByText(
        '2 posts picked this week. Join daily.dev to save them and share your own picks.',
      ),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event_name: LogEvent.Impression,
          target_id: 'picks signup banner',
          extra: JSON.stringify({ picks_id: 'picks-1', placement: 'inline' }),
        }),
      ),
    );
  });

  it('should drop the time phrase for a past week', async () => {
    renderPage(picks, { user: undefined, isLoggedIn: false });

    expect(
      await screen.findByText(
        '2 posts picked. Join daily.dev to save them and share your own picks.',
      ),
    ).toBeInTheDocument();
  });

  it('should not invite anyone to an emptied list', async () => {
    renderPage({ ...picks, items: [] }, { user: undefined, isLoggedIn: false });
    await screen.findByText('These picks are no longer available');

    expect(screen.queryByText(headline)).not.toBeInTheDocument();
  });

  it('should send a joining viewer through onboarding and back to this list', async () => {
    renderPage(picks, { user: undefined, isLoggedIn: false });
    await userEvent.click(
      await screen.findByRole('button', { name: 'Join daily.dev' }),
    );

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('onboarding?after_auth=%2Fpicks%2Fpicks-1'),
    );
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.Click,
        target_id: 'picks signup banner',
        extra: JSON.stringify({ picks_id: 'picks-1', placement: 'inline' }),
      }),
    );
  });

  it('should pin the banner with inline signup on laptop', async () => {
    jest.spyOn(viewSize, 'useViewSize').mockReturnValue(true);
    renderPage(picks, { user: undefined, isLoggedIn: false });

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
    expect(
      screen.getByText('thought you may want to read these'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Join daily.dev' }),
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event_name: LogEvent.Impression,
          target_id: 'picks signup banner',
          extra: JSON.stringify({ picks_id: 'picks-1', placement: 'pinned' }),
        }),
      ),
    );
  });

  it('should not show the banner to members', async () => {
    renderPage(picks, { user: loggedUser, isLoggedIn: true });
    await screen.findByText(/Ada Lovelace's picks/);

    expect(screen.queryByText(headline)).not.toBeInTheDocument();
    expect(logEvent).not.toHaveBeenCalledWith(
      expect.objectContaining({ target_id: 'picks signup banner' }),
    );
  });
});
