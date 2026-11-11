import React from 'react';
import nock from 'nock';
import { QueryClient } from '@tanstack/react-query';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import { mockDesktop } from '../../../__tests__/helpers/media';
import type { UserLeaderboard } from '../../graphql/leaderboard';
import {
  HIGHEST_POST_VIEWS_QUERY,
  LEADERBOARD_LIST_LIMIT,
  LEADERBOARD_TOP_LIMIT,
  LeaderboardType,
} from '../../graphql/leaderboard';
import { LogEvent, TargetType } from '../../lib/log';
import { LeaderboardUserBoardTile } from './LeaderboardUserBoardTile';

const logEvent = jest.fn();

const makeItems = (count: number, prefix = 'Dev'): UserLeaderboard[] =>
  Array.from({ length: count }, (_, index) => ({
    score: 1000 - index,
    user: {
      id: `${prefix}-${index}`,
      username: `${prefix}-${index}`,
      name: `${prefix} ${index}`,
      image: '',
      permalink: `/${prefix}-${index}`,
      createdAt: new Date().toISOString(),
      bio: '',
      reputation: 10,
    },
  }));

const createClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

const renderTile = (items: UserLeaderboard[]) =>
  render(
    <TestBootProvider
      client={createClient()}
      auth={{ user: undefined }}
      log={{ logEvent }}
    >
      <LeaderboardUserBoardTile
        type={LeaderboardType.HighestPostViews}
        items={items}
      />
    </TestBootProvider>,
  );

beforeEach(() => {
  nock.cleanAll();
  mockDesktop();
  logEvent.mockClear();
});

describe('LeaderboardBoardTile', () => {
  it('should show the top rows and ask for the full list only once opened', async () => {
    const items = makeItems(LEADERBOARD_LIST_LIMIT);
    renderTile(items);

    expect(screen.getByText('Dev 0').closest('a')).toHaveAttribute(
      'href',
      '/Dev-0',
    );
    expect(screen.getByText('Dev 3')).toBeInTheDocument();
    expect(screen.queryByText('Dev 4')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    mockGraphQL({
      request: {
        query: HIGHEST_POST_VIEWS_QUERY,
        variables: { limit: LEADERBOARD_TOP_LIMIT },
      },
      result: { data: { highestPostViews: makeItems(20, 'Top') } },
    });

    const cue = screen.getByRole('link', {
      name: 'Highest post views, open top 50',
    });
    expect(cue).toHaveAttribute('href', '/users/highestPostViews');
    fireEvent.click(cue);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAccessibleName('Highest post views · Top 50');
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Click,
      target_type: TargetType.LeaderboardBoard,
      target_id: LeaderboardType.HighestPostViews,
      extra: JSON.stringify({ surface: 'popover' }),
    });
    await screen.findByText('Top 19');
    expect(nock.isDone()).toBe(true);
    expect(screen.getByText('Top 19').closest('a')).toHaveAttribute(
      'href',
      '/Top-19',
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('should fall back to the page rows with a retry when the list fails', async () => {
    renderTile(makeItems(LEADERBOARD_LIST_LIMIT));
    mockGraphQL({
      request: {
        query: HIGHEST_POST_VIEWS_QUERY,
        variables: { limit: LEADERBOARD_TOP_LIMIT },
      },
      result: { errors: [{ message: 'boom' } as never] },
    });

    fireEvent.click(
      screen.getByRole('link', { name: 'Highest post views, open top 50' }),
    );

    await screen.findByText('Couldn’t load the full list.');
    const dialog = screen.getByRole('dialog');
    expect(dialog).not.toHaveAttribute('aria-busy');
    expect(within(dialog).getByText('Dev 11')).toBeInTheDocument();
    expect(
      within(dialog).getByRole('button', { name: 'Retry' }),
    ).toBeInTheDocument();
  });

  it('should say how many a short board has and not open an empty one', () => {
    const { rerender } = renderTile(makeItems(5));

    expect(screen.getByText('All 5')).toBeInTheDocument();

    rerender(
      <TestBootProvider client={createClient()} auth={{ user: undefined }}>
        <LeaderboardUserBoardTile
          type={LeaderboardType.HighestPostViews}
          items={[]}
        />
      </TestBootProvider>,
    );

    expect(
      screen.getByText('Nothing here right now. Check back soon.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
