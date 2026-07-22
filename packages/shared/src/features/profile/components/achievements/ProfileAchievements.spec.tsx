import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { ProfileAchievements } from './ProfileAchievements';
import { AchievementType } from '../../../../graphql/user/achievements';
import type { UserAchievement } from '../../../../graphql/user/achievements';
import type { PublicProfile } from '../../../../lib/user';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import { useShareCelebrations } from '../../../../hooks/useShareCelebrations';
import { useProfileAchievements } from '../../../../hooks/profile/useProfileAchievements';

jest.mock('../../../../hooks/useShareCelebrations', () => ({
  __esModule: true,
  useShareCelebrations: jest.fn(),
}));

jest.mock('../../../../hooks/profile/useProfileAchievements', () => ({
  __esModule: true,
  useProfileAchievements: jest.fn(),
}));

// The list is exercised by its own specs; stubbing it keeps this spec focused
// on the page-level share control.
jest.mock('./AchievementsList', () => ({
  __esModule: true,
  AchievementsList: () => <div data-testid="achievements-list" />,
}));

const useShareCelebrationsMock = useShareCelebrations as jest.Mock;
const useProfileAchievementsMock = useProfileAchievements as jest.Mock;

const userAchievement: UserAchievement = {
  achievement: {
    id: 'ach1',
    name: 'First Post',
    description: 'Publish your first post',
    image: 'https://daily.dev/achievement.png',
    type: AchievementType.Milestone,
    criteria: { targetCount: 1 },
    points: 10,
    rarity: null,
    unit: null,
  },
  progress: 1,
  unlockedAt: '2026-05-04T10:00:00.000Z',
  createdAt: null,
  updatedAt: null,
};

const profile = {
  id: 'u1',
  name: 'Ada Lovelace',
  username: 'ada',
  createdAt: '2024-01-01T00:00:00.000Z',
} as PublicProfile;

beforeEach(() => {
  jest.clearAllMocks();
  useShareCelebrationsMock.mockReturnValue(false);
  useProfileAchievementsMock.mockReturnValue({
    achievements: [userAchievement],
    unlockedCount: 1,
    totalCount: 1,
    totalPoints: 10,
    isPending: false,
    isError: false,
  });
});

const renderPage = () =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <ProfileAchievements user={profile} />
    </TestBootProvider>,
  );

describe('ProfileAchievements — page share', () => {
  it('renders no share control when the flag is off', () => {
    renderPage();

    expect(
      screen.queryByLabelText('Share achievements'),
    ).not.toBeInTheDocument();
  });

  it('renders exactly one page-level share control when the flag is on', () => {
    useShareCelebrationsMock.mockReturnValue(true);
    renderPage();

    expect(screen.getAllByLabelText('Share achievements')).toHaveLength(1);
  });

  it('renders no share control while achievements are loading', () => {
    useShareCelebrationsMock.mockReturnValue(true);
    useProfileAchievementsMock.mockReturnValue({
      achievements: undefined,
      unlockedCount: 0,
      totalCount: 0,
      totalPoints: 0,
      isPending: true,
      isError: false,
    });
    renderPage();

    expect(
      screen.queryByLabelText('Share achievements'),
    ).not.toBeInTheDocument();
  });
});
