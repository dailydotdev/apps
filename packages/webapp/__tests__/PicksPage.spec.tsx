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
import { PICKS_QUERY } from '@dailydotdev/shared/src/graphql/picks';
import { LogEvent, Origin } from '@dailydotdev/shared/src/lib/log';
import { getCurrentWeekStart } from '@dailydotdev/shared/src/lib/picks';
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

const renderPage = (data: Picks, auth: Record<string, unknown> = {}) => {
  mockGraphQL({
    request: { query: PICKS_QUERY, variables: { id: data.id } },
    result: { data: { picks: data } },
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
