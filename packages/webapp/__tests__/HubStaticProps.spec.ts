import type { UserLeaderboard } from '@dailydotdev/shared/src/components/cards/Leaderboard';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import {
  HIGHEST_REPUTATION_QUERY,
  MOST_QUESTS_COMPLETED_QUERY,
  QUEST_COMPLETION_STATS_QUERY,
  type QuestCompletionStats,
} from '@dailydotdev/shared/src/graphql/leaderboard';
import { getStaticProps as getHubStaticProps } from '../pages/hub/index';

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

const highestReputation = [
  {
    score: 1200,
    user: {
      id: 'user-1',
      username: 'user-1',
    },
  },
] as UserLeaderboard[];

const mostQuestsCompleted = [
  {
    score: 42,
    user: {
      id: 'user-2',
      username: 'user-2',
    },
  },
] as UserLeaderboard[];

const questCompletionStats: QuestCompletionStats = {
  totalCount: 987,
  allTimeLeader: {
    questId: 'quest-1',
    questName: 'Link Drop',
    questDescription: 'Create a shared link post',
    count: 321,
  },
  weeklyLeader: {
    questId: 'quest-2',
    questName: 'Hot Take Mic Check',
    questDescription: 'Vote on a hot take',
    count: 27,
  },
};

const createMissingSchemaError = (message: string) => ({
  response: {
    errors: [{ message }],
  },
});

describe('hub static props', () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it('should include quest completion stats when the schema supports them', async () => {
    mockRequest.mockImplementation((query: string) => {
      if (query === HIGHEST_REPUTATION_QUERY) {
        return Promise.resolve({ highestReputation });
      }

      if (query === MOST_QUESTS_COMPLETED_QUERY) {
        return Promise.resolve({ mostQuestsCompleted });
      }

      if (query === QUEST_COMPLETION_STATS_QUERY) {
        return Promise.resolve({ questCompletionStats });
      }

      return Promise.reject(new Error('Unexpected query'));
    });

    const result = await getHubStaticProps();

    expect(result).toMatchObject({
      props: {
        highestReputation,
        mostQuestsCompleted,
        questCompletionStats,
      },
    });
  });

  it('should keep leaderboards when quest completion stats are not yet in the schema', async () => {
    mockRequest.mockImplementation((query: string) => {
      if (query === HIGHEST_REPUTATION_QUERY) {
        return Promise.resolve({ highestReputation });
      }

      if (query === MOST_QUESTS_COMPLETED_QUERY) {
        return Promise.resolve({ mostQuestsCompleted });
      }

      if (query === QUEST_COMPLETION_STATS_QUERY) {
        return Promise.reject(
          createMissingSchemaError(
            'Cannot query field "questCompletionStats" on type "Query".',
          ),
        );
      }

      return Promise.reject(new Error('Unexpected query'));
    });

    const result = await getHubStaticProps();

    expect(result).toMatchObject({
      props: {
        highestReputation,
        mostQuestsCompleted,
        questCompletionStats: null,
      },
    });
  });
});
