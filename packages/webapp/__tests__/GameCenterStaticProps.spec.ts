import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import type { UserLeaderboard } from '@dailydotdev/shared/src/components/cards/Leaderboard';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import type { QuestCompletionStats } from '@dailydotdev/shared/src/graphql/leaderboard';
import {
  HIGHEST_REPUTATION_QUERY,
  MOST_QUESTS_COMPLETED_QUERY,
  QUEST_COMPLETION_STATS_QUERY,
} from '@dailydotdev/shared/src/graphql/leaderboard';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { useProfileAchievements } from '@dailydotdev/shared/src/hooks/profile/useProfileAchievements';
import { useTrackedAchievement } from '@dailydotdev/shared/src/hooks/profile/useTrackedAchievement';
import { useClaimQuestReward } from '@dailydotdev/shared/src/hooks/useClaimQuestReward';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { useHasAccessToCores } from '@dailydotdev/shared/src/hooks/useCoresFeature';
import { useQuestDashboard } from '@dailydotdev/shared/src/hooks/useQuestDashboard';
import { questsFeature } from '@dailydotdev/shared/src/lib/featureManagement';
import { QuestStatus, QuestType } from '@dailydotdev/shared/src/graphql/quests';
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

jest.mock('@dailydotdev/shared/src/contexts/AuthContext', () => {
  const actual = jest.requireActual(
    '@dailydotdev/shared/src/contexts/AuthContext',
  );

  return {
    ...actual,
    useAuthContext: jest.fn(),
  };
});

jest.mock('@dailydotdev/shared/src/contexts/SettingsContext', () => {
  const actual = jest.requireActual(
    '@dailydotdev/shared/src/contexts/SettingsContext',
  );

  return {
    ...actual,
    useSettingsContext: jest.fn(),
  };
});

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

jest.mock('@dailydotdev/shared/src/hooks/useClaimQuestReward', () => ({
  useClaimQuestReward: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/hooks/useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/hooks/useCoresFeature', () => ({
  useHasAccessToCores: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/hooks/useQuestDashboard', () => ({
  useQuestDashboard: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
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
const mockUseSettingsContext = useSettingsContext as jest.Mock;
const mockUseProfileAchievements = useProfileAchievements as jest.Mock;
const mockUseTrackedAchievement = useTrackedAchievement as jest.Mock;
const mockUseClaimQuestReward = useClaimQuestReward as jest.Mock;
const mockUseConditionalFeature = useConditionalFeature as jest.Mock;
const mockUseHasAccessToCores = useHasAccessToCores as jest.Mock;
const mockUseQuestDashboard = useQuestDashboard as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;
const mockPush = jest.fn();

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
    mockPush.mockReset();
    mockUseConditionalFeature.mockReset();
    mockUseConditionalFeature.mockReturnValue({
      value: false,
      isLoading: false,
    });
    mockUseAuthContext.mockReturnValue({
      user: {
        id: 'user-1',
        name: 'Test User',
        username: 'test-user',
      },
    });
    mockUseSettingsContext.mockReturnValue({
      optOutLevelSystem: false,
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
    mockUseClaimQuestReward.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      variables: undefined,
    });
    mockUseHasAccessToCores.mockReturnValue(false);
    mockUseQuestDashboard.mockReturnValue({
      data: undefined,
      isPending: false,
    });
    mockUseRouter.mockReturnValue({
      push: mockPush,
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

  it('should render the milestone quests section even when there are no milestone quests yet', () => {
    mockUseConditionalFeature
      .mockReturnValueOnce({
        value: true,
        isLoading: false,
      })
      .mockReturnValueOnce({
        value: false,
        isLoading: false,
      });
    mockUseQuestDashboard.mockReturnValue({
      data: {
        level: {
          level: 5,
          totalXp: 400,
          xpInLevel: 100,
          xpToNextLevel: 100,
        },
        currentStreak: 2,
        longestStreak: 4,
        daily: {
          regular: [],
          plus: [],
        },
        weekly: {
          regular: [],
          plus: [],
        },
        milestone: [],
      },
      isPending: false,
    });

    render(
      React.createElement(GameCenterPage, {
        highestReputation: [],
        mostQuestsCompleted: [],
        questCompletionStats: null,
      }),
    );

    expect(screen.getByText('Milestone quests')).toBeInTheDocument();
    expect(screen.getByText('No milestone quests yet')).toBeInTheDocument();
  });

  it('should render milestone quest cards with claim actions on the game center page', async () => {
    const mutate = jest.fn();

    mockUseConditionalFeature
      .mockReturnValueOnce({
        value: true,
        isLoading: false,
      })
      .mockReturnValueOnce({
        value: false,
        isLoading: false,
      });
    mockUseQuestDashboard.mockReturnValue({
      data: {
        level: {
          level: 5,
          totalXp: 400,
          xpInLevel: 100,
          xpToNextLevel: 100,
        },
        currentStreak: 2,
        longestStreak: 4,
        daily: {
          regular: [],
          plus: [],
        },
        weekly: {
          regular: [],
          plus: [],
        },
        milestone: [
          {
            rotationId: 'milestone-quest-1',
            userQuestId: 'user-milestone-quest-1',
            progress: 8,
            status: QuestStatus.Completed,
            completedAt: null,
            claimedAt: null,
            locked: false,
            claimable: true,
            quest: {
              id: 'milestone-quest-1',
              name: 'Reader marathon',
              description: 'Read 8 posts',
              type: QuestType.Milestone,
              eventType: 'read_post',
              targetCount: 8,
            },
            rewards: [],
          },
        ],
      },
      isPending: false,
    });
    mockUseClaimQuestReward.mockReturnValue({
      mutate,
      isPending: false,
      variables: undefined,
    });

    render(
      React.createElement(GameCenterPage, {
        highestReputation: [],
        mostQuestsCompleted: [],
        questCompletionStats: null,
      }),
    );

    expect(screen.getByText('Milestone quests')).toBeInTheDocument();
    expect(screen.getAllByText('Reader marathon')).toHaveLength(2);

    await userEvent.click(screen.getByRole('button', { name: 'Claim' }));

    expect(mutate).toHaveBeenCalledWith({
      userQuestId: 'user-milestone-quest-1',
      questId: 'milestone-quest-1',
      questType: QuestType.Milestone,
    });
  });

  it('should highlight the most progressed milestone in the progress snapshot card', () => {
    mockUseConditionalFeature.mockImplementation(({ feature }) => ({
      value: feature === questsFeature,
      isLoading: false,
    }));
    mockUseQuestDashboard.mockReturnValue({
      data: {
        level: {
          level: 5,
          totalXp: 400,
          xpInLevel: 100,
          xpToNextLevel: 100,
        },
        currentStreak: 2,
        longestStreak: 4,
        daily: {
          regular: [
            {
              rotationId: 'daily-quest-1',
              userQuestId: 'user-daily-quest-1',
              progress: 4,
              status: QuestStatus.InProgress,
              completedAt: null,
              claimedAt: null,
              locked: false,
              claimable: false,
              quest: {
                id: 'daily-quest-1',
                name: 'Almost done daily',
                description: 'Complete the daily quest',
                type: QuestType.Daily,
                eventType: 'read_post',
                targetCount: 5,
              },
              rewards: [],
            },
          ],
          plus: [],
        },
        weekly: {
          regular: [],
          plus: [],
        },
        milestone: [
          {
            rotationId: 'milestone-quest-1',
            userQuestId: 'user-milestone-quest-1',
            progress: 6,
            status: QuestStatus.InProgress,
            completedAt: null,
            claimedAt: null,
            locked: false,
            claimable: false,
            quest: {
              id: 'milestone-quest-1',
              name: 'Milestone warmup',
              description: 'Read 10 posts',
              type: QuestType.Milestone,
              eventType: 'custom_milestone_event',
              targetCount: 10,
            },
            rewards: [],
          },
          {
            rotationId: 'milestone-quest-2',
            userQuestId: 'user-milestone-quest-2',
            progress: 7,
            status: QuestStatus.InProgress,
            completedAt: null,
            claimedAt: null,
            locked: false,
            claimable: false,
            quest: {
              id: 'milestone-quest-2',
              name: 'Almost there milestone',
              description: 'Read 8 posts',
              type: QuestType.Milestone,
              eventType: 'custom_milestone_event',
              targetCount: 8,
            },
            rewards: [],
          },
        ],
      },
      isPending: false,
    });

    render(
      React.createElement(GameCenterPage, {
        highestReputation: [],
        mostQuestsCompleted: [],
        questCompletionStats: null,
      }),
    );

    const upcomingMilestoneCard = screen
      .getByText('Upcoming milestone')
      .closest('div');

    expect(upcomingMilestoneCard).not.toBeNull();
    expect(
      within(upcomingMilestoneCard as HTMLElement).getByText(
        'Almost there milestone',
      ),
    ).toBeInTheDocument();
    expect(
      within(upcomingMilestoneCard as HTMLElement).getByText('7/8 progress'),
    ).toBeInTheDocument();
  });

  it('should render milestone quests in a two-column grid and reveal more than four on demand', async () => {
    mockUseConditionalFeature
      .mockReturnValueOnce({
        value: true,
        isLoading: false,
      })
      .mockReturnValueOnce({
        value: false,
        isLoading: false,
      });
    mockUseQuestDashboard.mockReturnValue({
      data: {
        level: {
          level: 5,
          totalXp: 400,
          xpInLevel: 100,
          xpToNextLevel: 100,
        },
        currentStreak: 2,
        longestStreak: 4,
        daily: {
          regular: [],
          plus: [],
        },
        weekly: {
          regular: [],
          plus: [],
        },
        milestone: Array.from({ length: 5 }, (_, index) => ({
          rotationId: `milestone-quest-${index + 1}`,
          userQuestId: `user-milestone-quest-${index + 1}`,
          progress: index + 1,
          status: QuestStatus.Completed,
          completedAt: null,
          claimedAt: null,
          locked: false,
          claimable: true,
          quest: {
            id: `milestone-quest-${index + 1}`,
            name: `Milestone quest ${index + 1}`,
            description: `Complete milestone quest ${index + 1}`,
            type: QuestType.Milestone,
            eventType: 'read_post',
            targetCount: index + 2,
          },
          rewards: [],
        })),
      },
      isPending: false,
    });

    render(
      React.createElement(GameCenterPage, {
        highestReputation: [],
        mostQuestsCompleted: [],
        questCompletionStats: null,
      }),
    );

    const milestoneGrid = screen.getByText('Milestones').nextElementSibling;

    expect(milestoneGrid).not.toBeNull();
    expect(screen.getByText('Milestone quest 4')).toBeInTheDocument();
    expect(
      within(milestoneGrid as HTMLElement).queryByText('Milestone quest 5'),
    ).not.toBeInTheDocument();

    expect(milestoneGrid).toHaveClass('grid', 'tablet:grid-cols-2');

    await userEvent.click(screen.getByRole('button', { name: 'Show more' }));

    expect(
      within(milestoneGrid as HTMLElement).getByText('Milestone quest 5'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Show less' }),
    ).toBeInTheDocument();
  });
});
