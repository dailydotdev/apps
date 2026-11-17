import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import type { UserLeaderboard } from '../../graphql/leaderboard';
import {
  LEADERBOARD_LIST_LIMIT,
  LeaderboardType,
} from '../../graphql/leaderboard';
import { LogEvent, TargetType } from '../../lib/log';
import { LeaderboardUserBoardTile } from './LeaderboardUserBoardTile';

const logEvent = jest.fn();

const makeItems = (count: number): UserLeaderboard[] =>
  Array.from({ length: count }, (_, index) => ({
    score: 1000 - index,
    user: {
      id: `Dev-${index}`,
      username: `Dev-${index}`,
      name: `Dev ${index}`,
      image: '',
      permalink: `/Dev-${index}`,
      createdAt: new Date().toISOString(),
      bio: '',
      reputation: 10,
    },
  }));

const renderTile = (items: UserLeaderboard[]) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
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
  logEvent.mockClear();
});

describe('LeaderboardBoardTile', () => {
  it('should show the top rows and link to the full ranking page', () => {
    renderTile(makeItems(LEADERBOARD_LIST_LIMIT));

    expect(screen.getByText('Dev 0').closest('a')).toHaveAttribute(
      'href',
      '/Dev-0',
    );
    expect(screen.getByText('Dev 3')).toBeInTheDocument();
    expect(screen.queryByText('Dev 4')).not.toBeInTheDocument();

    const cue = screen.getByRole('link', {
      name: 'Highest post views, full ranking',
    });
    expect(cue).toHaveAttribute('href', '/users/highestPostViews');
    fireEvent.click(cue);
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Click,
      target_type: TargetType.LeaderboardBoard,
      target_id: LeaderboardType.HighestPostViews,
      extra: JSON.stringify({ surface: 'page' }),
    });
  });

  it('should not link an empty board', () => {
    renderTile([]);

    expect(
      screen.getByText('Nothing here right now. Check back soon.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
