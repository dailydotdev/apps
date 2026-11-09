import React from 'react';
import nock from 'nock';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import type { LoggedUser } from '../../lib/user';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import type { LeaderboardPosition } from '../../graphql/leaderboard';
import {
  LEADERBOARD_POSITION_QUERY,
  LeaderboardType,
} from '../../graphql/leaderboard';
import { LeaderboardRankCard } from './LeaderboardRankCard';

jest.mock('../snapshot/ProfileSnapshotButton', () => ({
  ProfileSnapshotButton: () => <button type="button">Snapshot</button>,
}));

const CAP = 100000;

const mockPositions = (
  positions: Partial<Record<LeaderboardType, LeaderboardPosition>>,
): void => {
  [
    LeaderboardType.HighestReputation,
    LeaderboardType.LongestStreak,
    LeaderboardType.MostReadingDays,
  ].forEach((type) =>
    mockGraphQL({
      request: { query: LEADERBOARD_POSITION_QUERY, variables: { type } },
      result: {
        data: {
          leaderboardPosition: positions[type] ?? {
            rank: null,
            score: 0,
            cappedAt: CAP,
          },
        },
      },
    }),
  );
};

const renderCard = (user: LoggedUser | undefined = loggedUser) =>
  render(
    <TestBootProvider client={new QueryClient()} auth={{ user }}>
      <LeaderboardRankCard getBoard={() => []} />
    </TestBootProvider>,
  );

beforeEach(() => {
  nock.cleanAll();
});

describe('LeaderboardRankCard', () => {
  it('should open on the board you rank best on', async () => {
    mockPositions({
      [LeaderboardType.HighestReputation]: {
        rank: 842,
        score: 3120,
        cappedAt: CAP,
      },
      [LeaderboardType.LongestStreak]: { rank: 317, score: 46, cappedAt: CAP },
      [LeaderboardType.MostReadingDays]: {
        rank: 529,
        score: 121,
        cappedAt: CAP,
      },
    });

    renderCard();

    await screen.findByText('You’re #317 on Longest streak');
    expect(screen.getByText('days in a row')).toBeInTheDocument();
    // One for phones, one from tablet up; the stylesheet hides the other.
    expect(screen.getAllByRole('button', { name: 'Snapshot' })).toHaveLength(2);
  });

  it('should say you are past the counted range when there is no rank', async () => {
    mockPositions({
      [LeaderboardType.HighestReputation]: {
        rank: null,
        score: 12,
        cappedAt: CAP,
      },
    });

    renderCard();

    await screen.findByText('You’re outside the top 100K');
  });

  it('should say how to earn a rank and hide the snapshot with no score', async () => {
    mockPositions({});

    renderCard();

    await screen.findByText('No rank yet on Highest reputation');
    expect(
      screen.getByText(
        'Earn reputation when people upvote your posts and comments.',
      ),
    ).toBeInTheDocument();
    await waitFor(() => expect(nock.isDone()).toBe(true));
    expect(screen.queryAllByRole('button', { name: 'Snapshot' })).toHaveLength(
      0,
    );
  });

  it('should render nothing signed out', () => {
    const { container } = render(
      <TestBootProvider client={new QueryClient()} auth={{ user: undefined }}>
        <LeaderboardRankCard getBoard={() => []} />
      </TestBootProvider>,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
