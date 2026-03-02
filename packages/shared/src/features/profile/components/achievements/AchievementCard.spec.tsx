import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { UserAchievement } from '../../../../graphql/user/achievements';
import { AchievementType } from '../../../../graphql/user/achievements';
import { AchievementCard } from './AchievementCard';

const createLockedAchievement = (
  overrides: Partial<UserAchievement> = {},
): UserAchievement => ({
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
  progress: 0,
  unlockedAt: null,
  createdAt: null,
  updatedAt: null,
  ...overrides,
});

const renderCard = (
  props: Partial<React.ComponentProps<typeof AchievementCard>> = {},
) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <AchievementCard
        userAchievement={createLockedAchievement()}
        isOwner
        onTrack={jest.fn()}
        onUntrack={jest.fn()}
        {...props}
      />
    </QueryClientProvider>,
  );
};

describe('AchievementCard — stop tracking', () => {
  it('renders "Track" button when the achievement is not tracked', () => {
    renderCard({ isTracked: false });
    expect(screen.getByRole('button', { name: /track/i })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /stop tracking/i }),
    ).not.toBeInTheDocument();
  });

  it('renders "Stop tracking" button when the achievement is tracked', () => {
    renderCard({ isTracked: true });
    expect(
      screen.getByRole('button', { name: /stop tracking/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^track$/i }),
    ).not.toBeInTheDocument();
  });

  it('calls onUntrack when "Stop tracking" is clicked', () => {
    const onUntrack = jest.fn().mockResolvedValue(undefined);
    renderCard({ isTracked: true, onUntrack });

    fireEvent.click(screen.getByRole('button', { name: /stop tracking/i }));

    expect(onUntrack).toHaveBeenCalledTimes(1);
  });

  it('calls onTrack with achievement id when "Track" is clicked', () => {
    const onTrack = jest.fn().mockResolvedValue(undefined);
    renderCard({ isTracked: false, onTrack });

    fireEvent.click(screen.getByRole('button', { name: /^track$/i }));

    expect(onTrack).toHaveBeenCalledWith('ach1');
  });

  it('disables "Stop tracking" button while untrack is pending', () => {
    renderCard({ isTracked: true, isUntrackPending: true });

    expect(
      screen.getByRole('button', { name: /stop tracking/i }),
    ).toBeDisabled();
  });

  it('disables "Track" button while track is pending', () => {
    renderCard({ isTracked: false, isTrackPending: true });

    expect(screen.getByRole('button', { name: /^track$/i })).toBeDisabled();
  });

  it('does not render tracking buttons when isOwner is false', () => {
    renderCard({ isOwner: false });

    expect(
      screen.queryByRole('button', { name: /track/i }),
    ).not.toBeInTheDocument();
  });

  it('does not render tracking buttons when onTrack is not provided', () => {
    renderCard({ onTrack: undefined });

    expect(
      screen.queryByRole('button', { name: /track/i }),
    ).not.toBeInTheDocument();
  });

  it('does not render tracking buttons for unlocked achievements', () => {
    const unlockedAchievement = createLockedAchievement({
      unlockedAt: new Date().toISOString(),
      progress: 1,
    });
    renderCard({ userAchievement: unlockedAchievement, isTracked: true });

    expect(
      screen.queryByRole('button', { name: /stop tracking/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^track$/i }),
    ).not.toBeInTheDocument();
  });
});
