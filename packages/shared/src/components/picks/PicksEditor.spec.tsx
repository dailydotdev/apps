import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import nock from 'nock';
import { PicksEditor } from './PicksEditor';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import { waitForNock } from '../../../__tests__/helpers/utilities';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import {
  MY_CURRENT_PICKS_QUERY,
  PICKS_QUERY,
  PICKS_SUGGESTIONS_QUERY,
  UPSERT_PICKS_MUTATION,
} from '../../graphql/picks';
import type { Picks, PicksSuggestion } from '../../graphql/picks';
import { LogEvent, Origin } from '../../lib/log';

const mockOpenShareSheet = jest.fn();
jest.mock('../../hooks/picks/useSharePicks', () => ({
  useSharePicks: () => ({ openShareSheet: mockOpenShareSheet }),
}));

const logEvent = jest.fn();

const makePost = (n: number, extra = {}) => ({
  id: `p${n}`,
  title: `Post ${n}`,
  image: `https://img/${n}.png`,
  permalink: `https://dly.to/p${n}`,
  commentsPermalink: `https://app/posts/p${n}`,
  type: 'article',
  ...extra,
});

const makeSuggestion = (n: number, extra = {}): PicksSuggestion => ({
  post: makePost(n),
  reason: 'upvoted',
  upvoted: true,
  bookmarked: false,
  read: true,
  ...extra,
});

const suggestions = [1, 2, 3, 4, 5, 6].map((n) => makeSuggestion(n));

const mockData = (current: Picks | null, list = suggestions) => {
  mockGraphQL({
    request: { query: MY_CURRENT_PICKS_QUERY },
    result: { data: { myCurrentPicks: current } },
  });
  mockGraphQL({
    request: { query: PICKS_SUGGESTIONS_QUERY },
    result: { data: { picksSuggestions: list } },
  });
};

const renderEditor = (origin?: Origin) => {
  const gb = new GrowthBook({
    features: { weekly_picks: { defaultValue: true } },
  });
  return render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: loggedUser }}
      log={{ logEvent }}
      gb={gb}
    >
      <PicksEditor origin={origin} />
    </TestBootProvider>,
  );
};

// Titles also render in the checkbox's screen-reader label, so target the row title
const title = (text: string) =>
  screen
    .getAllByText(text)
    .find((el) => el.classList.contains('line-clamp-2')) as HTMLElement;
const findTitle = (text: string) =>
  waitFor(() => expect(title(text)).toBeTruthy()).then(() => title(text));

const checkboxes = () => screen.getAllByTestId('checkbox-input');

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
});

it('should show the signal line for each suggestion', async () => {
  mockData(null, [
    makeSuggestion(1, { post: makePost(1, { readTime: 9 }) }),
    makeSuggestion(2, {
      reason: 'bookmarked',
      upvoted: false,
      bookmarked: true,
    }),
    makeSuggestion(3, { reason: 'read', upvoted: false }),
  ]);
  renderEditor();
  await waitForNock();
  expect(await screen.findByText('▲ upvoted · 9 min')).toBeInTheDocument();
  expect(screen.getByText('bookmarked')).toBeInTheDocument();
  expect(screen.getByText('read')).toBeInTheDocument();
  expect(screen.getByText('0 of 5 selected')).toBeInTheDocument();
  expect(
    screen.getAllByText('Done, share my picks')[0].closest('button'),
  ).toBeDisabled();
});

it('should select and deselect a row and log it', async () => {
  mockData(null);
  renderEditor();
  await waitForNock();
  fireEvent.click(await findTitle('Post 1'));
  expect(screen.getByText('1 of 5 selected')).toBeInTheDocument();
  expect(logEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      event_name: LogEvent.SelectPick,
      extra: JSON.stringify({ post_id: 'p1', reason: 'upvoted' }),
    }),
  );
  fireEvent.click(title('Post 1'));
  expect(screen.getByText('0 of 5 selected')).toBeInTheDocument();
  expect(logEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      event_name: LogEvent.DeselectPick,
      extra: JSON.stringify({ post_id: 'p1', reason: 'upvoted' }),
    }),
  );
});

it('should block the 6th pick with a hint', async () => {
  mockData(null);
  renderEditor();
  await waitForNock();
  await findTitle('Post 1');
  [1, 2, 3, 4, 5].forEach((n) => fireEvent.click(title(`Post ${n}`)));
  fireEvent.click(checkboxes()[5]);
  expect(screen.getByText('You can pick up to 5 posts')).toBeInTheDocument();
  expect(screen.getByText('5 of 5 selected')).toBeInTheDocument();
  expect(checkboxes()[5]).not.toBeChecked();
});

it('should count the note, cap its length and log once on blur', async () => {
  mockData(null);
  renderEditor();
  await waitForNock();
  fireEvent.click(await findTitle('Post 1'));
  const input = screen.getByRole('textbox');
  expect(input).toHaveAttribute('maxLength', '140');
  expect(screen.getByText('0/140')).toBeInTheDocument();
  fireEvent.input(input, { target: { value: 'great read' } });
  expect(screen.getByText('10/140')).toBeInTheDocument();
  expect(logEvent).not.toHaveBeenCalledWith(
    expect.objectContaining({ event_name: LogEvent.AddPickNote }),
  );
  fireEvent.blur(input);
  fireEvent.blur(input);
  const calls = logEvent.mock.calls.filter(
    ([e]) => e.event_name === LogEvent.AddPickNote,
  );
  expect(calls).toHaveLength(1);
  expect(calls[0][0].extra).toBe(JSON.stringify({ post_id: 'p1', length: 10 }));
});

it('should publish in selection order and open the share sheet', async () => {
  const published = {
    id: 'picks-1',
    weekStart: '2026-11-02',
    author: { id: 'u1', name: 'A', username: 'a', image: '', permalink: '' },
    items: [],
  } as Picks;
  mockData(null);
  renderEditor(Origin.Bookmarks);
  await waitForNock();
  fireEvent.click(await findTitle('Post 3'));
  fireEvent.click(title('Post 1'));
  fireEvent.input(screen.getAllByRole('textbox')[0], {
    target: { value: ' note ' },
  });
  mockGraphQL({
    request: {
      query: UPSERT_PICKS_MUTATION,
      variables: {
        items: [
          { postId: 'p3', note: null },
          { postId: 'p1', note: 'note' },
        ],
      },
    },
    result: {
      data: { upsertPicks: { id: 'picks-1', url: 'https://x/picks-1' } },
    },
  });
  mockGraphQL({
    request: { query: PICKS_QUERY, variables: { id: 'picks-1' } },
    result: { data: { picks: published } },
  });
  fireEvent.click(screen.getAllByText('Done, share my picks')[0]);
  await waitFor(() =>
    expect(mockOpenShareSheet).toHaveBeenCalledWith(
      published,
      Origin.Bookmarks,
    ),
  );
  await waitForNock();
  expect(logEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      event_name: LogEvent.PublishPicks,
      extra: JSON.stringify({ count: 2, notes_count: 1, is_edit: false }),
    }),
  );
});

it('should log a distinct reason for current picks missing from the suggestions', async () => {
  const current = {
    id: 'picks-1',
    weekStart: '2026-11-02',
    author: { id: 'u1', name: 'A', username: 'a', image: '', permalink: '' },
    items: [{ position: 0, note: null, post: makePost(9) }],
  } as Picks;
  mockData(current);
  renderEditor();
  await waitForNock();
  fireEvent.click(await findTitle('Post 9'));
  expect(logEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      event_name: LogEvent.DeselectPick,
      extra: JSON.stringify({ post_id: 'p9', reason: 'current' }),
    }),
  );
});
