import React from 'react';
import { render, screen } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import type { UserLeaderboard } from '@dailydotdev/shared/src/components/cards/Leaderboard';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import type { QuestCompletionStats } from '@dailydotdev/shared/src/graphql/leaderboard';
import {
  HIGHEST_REPUTATION_QUERY,
  MOST_QUESTS_COMPLETED_QUERY,
  QUEST_COMPLETION_STATS_QUERY,
} from '@dailydotdev/shared/src/graphql/leaderboard';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useProfileAchievements } from '@dailydotdev/shared/src/hooks/profile/useProfileAchievements';
import { useTrackedAchievement } from '@dailydotdev/shared/src/hooks/profile/useTrackedAchievement';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { useHasAccessToCores } from '@dailydotdev/shared/src/hooks/useCoresFeature';
import { useQuestDashboard } from '@dailydotdev/shared/src/hooks/useQuestDashboard';
import GameCenterPage, {
  getStaticProps as getGameCenterStaticProps,
} from '../pages/game-center/index';

jest.mock('@dailydotdev/shared/src/graphql/common', () => {
  const actual = jest.requireActual('@dailydotdev/shared/src/graphql/common');

  return {
    ...actual,
    gqlClient: {
      request: jest.fn(),
    },
  };
});

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');

  return {
    ...actual,
    useQuery: jest.fn(),
  };
});

jest.mock('@dailydotdev/shared/src/contexts/AuthContext', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/contexts/AuthContext'),
  useAuthContext: jest.fn(),
}));

jest.mock(
  '@dailydotdev/shared/src/hooks/profile/useProfileAchievements',
  () => ({
    useProfileAchievements: jest.fn(),
  }),
);

jest.mock(
  '@dailydotdev/shared/src/hooks/profile/useTrackedAchievement',
  () => ({
    useTrackedAchievement: jest.fn(),
  }),
);

jest.mock('@dailydotdev/shared/src/hooks/useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/hooks/useCoresFeature', () => ({
  useHasAccessToCores: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/hooks/useQuestDashboard', () => ({
  useQuestDashboard: jest.fn(),
}));

jest.mock('../components/ProtectedPage', () => ({
  __esModule: true,
  default: ({
    children,
    fallback,
    shouldFallback,
  }: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    shouldFallback?: boolean;
  }) => (shouldFallback ? fallback : children),
}));

jest.mock('../pages/404', () => ({
  __esModule: true,
  default: () => '404 page',
}));

const mockRequest = gqlClient.request as jest.Mock;
const mockUseQuery = useQuery as jest.Mock;
const mockUseAuthContext = useAuthContext as jest.Mock;
const mockUseProfileAchievements = useProfileAchievements as jest.Mock;
const mockUseTrackedAchievement = useTrackedAchievement as jest.Mock;
const mockUseConditionalFeature = useConditionalFeature as jest.Mock;
const mockUseHasAccessToCores = useHasAccessToCores as jest.Mock;
const mockUseQuestDashboard = useQuestDashboard as jest.Mock;

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

describe('game center static props', () => {
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

    const result = await getGameCenterStaticProps();

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

    const result = await getGameCenterStaticProps();

    expect(result).toMatchObject({
      props: {
        highestReputation,
        mostQuestsCompleted,
        questCompletionStats: null,
      },
    });
  });
});

describe('game center client gating', () => {
  beforeEach(() => {
    mockUseAuthContext.mockReturnValue({
      user: {
        id: 'user-1',
        name: 'Test User',
        username: 'test-user',
      },
    });
    mockUseProfileAchievements.mockReturnValue({
      achievements: [],
      unlockedCount: 0,
      totalCount: 0,
      isPending: false,
    });
    mockUseTrackedAchievement.mockReturnValue({
      trackedAchievement: null,
      isPending: false,
      isTrackPending: false,
      isUntrackPending: false,
      trackAchievement: jest.fn(),
      untrackAchievement: jest.fn(),
    });
    mockUseHasAccessToCores.mockReturnValue(false);
    mockUseQuestDashboard.mockReturnValue({
      data: undefined,
      isPending: false,
    });
    mockUseQuery.mockReturnValue({
      data: [],
      isPending: false,
      error: null,
    });
  });

  it('should render the 404 page when the quest feature is disabled', () => {
    mockUseConditionalFeature
      .mockReturnValueOnce({
        value: false,
        isLoading: false,
      })
      .mockReturnValueOnce({
        value: false,
        isLoading: false,
      });

    render(
      React.createElement(GameCenterPage, {
        highestReputation: [],
        mostQuestsCompleted: [],
        questCompletionStats: null,
      }),
    );

    expect(screen.getByText('404 page')).toBeInTheDocument();
  });
});
