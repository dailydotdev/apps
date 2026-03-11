import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { PublicProfile } from '../../../../lib/user';
import { AchievementType } from '../../../../graphql/user/achievements';
import type { UserAchievement } from '../../../../graphql/user/achievements';
import { useProfileAchievements } from '../../../../hooks/profile/useProfileAchievements';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import { AchievementsWidget } from './AchievementsWidget';

jest.mock('../../../../hooks/profile/useProfileAchievements', () => ({
  useProfileAchievements: jest.fn(),
}));

const mockUseProfileAchievements = useProfileAchievements as jest.Mock;

const user = {
  id: 'user-1',
  name: 'Test User',
  username: 'test-user',
} as PublicProfile;

const createUserAchievement = ({
  id,
  name,
  rarity,
  points,
  unlockedAt = '2024-01-01T00:00:00.000Z',
}: {
  id: string;
  name: string;
  rarity: number | null;
  points: number;
  unlockedAt?: string | null;
}): UserAchievement => ({
  achievement: {
    id,
    name,
    description: `${name} description`,
    image: `https://daily.dev/${id}.png`,
    type: AchievementType.Instant,
    points,
    rarity,
    unit: null,
  },
  progress: 1,
  unlockedAt,
  createdAt: unlockedAt,
  updatedAt: unlockedAt,
});

const renderComponent = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <TestBootProvider client={client}>
      <AchievementsWidget user={user} />
    </TestBootProvider>,
  );
};

describe('AchievementsWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should sort unlocked achievements by rarity', () => {
    const expectedVisibleNames = [
      'Rare',
      'Rarity Tie High Points',
      'Uncommon',
      'Rarity Tie Low Points',
      'Common',
    ];

    const achievements: UserAchievement[] = [
      createUserAchievement({
        id: 'common',
        name: 'Common',
        rarity: 20,
        points: 10,
      }),
      createUserAchievement({
        id: 'rarity-tie-low-points',
        name: 'Rarity Tie Low Points',
        rarity: 5,
        points: 10,
      }),
      createUserAchievement({
        id: 'locked',
        name: 'Locked',
        rarity: 1,
        points: 100,
        unlockedAt: null,
      }),
      createUserAchievement({
        id: 'rare',
        name: 'Rare',
        rarity: 1,
        points: 30,
      }),
      createUserAchievement({
        id: 'unknown-rarity',
        name: 'Unknown Rarity',
        rarity: null,
        points: 100,
      }),
      createUserAchievement({
        id: 'rarity-tie-high-points',
        name: 'Rarity Tie High Points',
        rarity: 5,
        points: 50,
      }),
      createUserAchievement({
        id: 'uncommon',
        name: 'Uncommon',
        rarity: 5,
        points: 20,
      }),
    ];

    mockUseProfileAchievements.mockReturnValue({
      achievements,
      unlockedCount: 6,
      totalCount: achievements.length,
      totalPoints: 220,
      isPending: false,
      isError: false,
    });

    renderComponent();

    const renderedNames = screen
      .getAllByRole('img')
      .map((image) => image.getAttribute('alt'))
      .filter((alt): alt is string => expectedVisibleNames.includes(alt ?? ''));

    expect(renderedNames).toEqual(expectedVisibleNames);
  });
});
