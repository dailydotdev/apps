import type { UserLeaderboard } from '@dailydotdev/shared/src/components/cards/Leaderboard';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import {
  HIGHEST_LEVEL_QUERY,
  LEADERBOARD_QUERY,
  LeaderboardType,
} from '@dailydotdev/shared/src/graphql/leaderboard';
import { getStaticProps as getUsersStaticProps } from '../pages/users';
import { getStaticProps as getLeaderboardDetailStaticProps } from '../pages/users/[id]';

jest.mock('@dailydotdev/shared/src/graphql/common', () => {
  const actual = jest.requireActual('@dailydotdev/shared/src/graphql/common');

  return {
    ...actual,
    gqlClient: {
      request: jest.fn(),
    },
  };
});

const mockRequest = gqlClient.request as jest.Mock;

const baseLeaderboardResponse = {
  highestReputation: [],
  longestStreak: [],
  highestPostViews: [],
  mostUpvoted: [],
  mostReferrals: [],
  mostReadingDays: [],
  mostAchievementPoints: [],
  mostVerifiedUsers: [],
  popularHotTakes: [],
};

const createMissingSchemaError = (message: string) => ({
  response: {
    errors: [{ message }],
  },
});

describe('leaderboard static props', () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it('should hide highest-level data when API schema does not support it', async () => {
    mockRequest.mockImplementation((query: string) => {
      if (query === LEADERBOARD_QUERY) {
        return Promise.resolve(baseLeaderboardResponse);
      }

      if (query === HIGHEST_LEVEL_QUERY) {
        return Promise.reject(
          createMissingSchemaError(
            'Cannot query field "highestLevel" on type "Query".',
          ),
        );
      }

      return Promise.reject(new Error('Unexpected query'));
    });

    const result = await getUsersStaticProps();

    expect(result).toMatchObject({
      props: {
        highestLevel: [],
        isHighestLevelSupported: false,
      },
    });
  });

  it('should include highest-level data when schema is supported', async () => {
    const highestLevel: UserLeaderboard[] = [
      {
        score: 1000,
        user: {
          id: 'user-1',
          username: 'user-1',
          name: 'User One',
          image: '',
          permalink: '/users/user-1',
          createdAt: new Date().toISOString(),
          providers: [],
          balance: { amount: 0 },
        },
        level: {
          level: 10,
          totalXp: 1000,
          xpInLevel: 100,
          xpToNextLevel: 50,
        },
      },
    ];

    mockRequest.mockImplementation((query: string) => {
      if (query === LEADERBOARD_QUERY) {
        return Promise.resolve(baseLeaderboardResponse);
      }

      if (query === HIGHEST_LEVEL_QUERY) {
        return Promise.resolve({ highestLevel });
      }

      return Promise.reject(new Error('Unexpected query'));
    });

    const result = await getUsersStaticProps();

    expect(result).toMatchObject({
      props: {
        highestLevel,
        isHighestLevelSupported: true,
      },
    });
  });

  it('should return notFound for highest-level detail when schema is missing', async () => {
    mockRequest.mockRejectedValue(
      createMissingSchemaError(
        'Cannot query field "level" on type "Leaderboard".',
      ),
    );

    const result = await getLeaderboardDetailStaticProps({
      params: { id: LeaderboardType.HighestLevel },
    } as never);

    expect(result).toMatchObject({
      notFound: true,
      revalidate: 60,
    });
  });
});
