import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fn } from 'storybook/test';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { FeaturesReadyContext } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import type { UserAchievement } from '@dailydotdev/shared/src/graphql/user/achievements';
import { AchievementType } from '@dailydotdev/shared/src/graphql/user/achievements';
import { AchievementCard } from '@dailydotdev/shared/src/features/profile/components/achievements/AchievementCard';
import { AchievementShareCard } from '@dailydotdev/shared/src/features/profile/components/achievements/AchievementShareCard';
import { AchievementShareActions } from '@dailydotdev/shared/src/features/profile/components/achievements/AchievementShareActions';
import { Origin } from '@dailydotdev/shared/src/lib/log';

const mockUser = {
  id: 'u1',
  name: 'Ada Lovelace',
  username: 'ada',
  image: 'https://daily-now-res.cloudinary.com/image/upload/placeholder.jpg',
} as unknown as LoggedUser;

const buildAchievement = (
  overrides: Partial<UserAchievement['achievement']> = {},
  unlocked = true,
): UserAchievement => ({
  achievement: {
    id: 'ach-1',
    name: 'Night owl',
    description: 'Read 100 posts between midnight and 5am',
    image: 'https://daily-now-res.cloudinary.com/image/upload/placeholder.jpg',
    type: AchievementType.Milestone,
    criteria: { targetCount: 100 },
    points: 250,
    rarity: 3,
    unit: null,
    ...overrides,
  },
  progress: unlocked ? 100 : 42,
  unlockedAt: unlocked ? '2026-05-04T10:00:00.000Z' : null,
  createdAt: null,
  updatedAt: null,
});

// The Storybook GrowthBook mock returns the string 'control' for any falsy
// default, so a flag whose default is `false` always resolves truthy. The only
// honest way to render the control experience is to hold FeaturesReadyContext
// as not-ready, which makes `useConditionalFeature` return the default.
const withProviders =
  (featuresReady: boolean) =>
  (Story: React.ComponentType): React.ReactElement => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    const LogContext = getLogContextStatic();

    return (
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider
          value={
            {
              user: mockUser,
              isLoggedIn: true,
              isAuthReady: true,
              showLogin: fn(),
              closeLogin: fn(),
              logout: fn(),
              updateUser: fn(),
              refetchBoot: fn(),
              squads: [],
            } as never
          }
        >
          <LogContext.Provider
            value={{
              logEvent: fn(),
              logEventStart: fn(),
              logEventEnd: fn(),
              sendBeacon: () => false,
            }}
          >
            <FeaturesReadyContext.Provider
              value={
                {
                  ready: featuresReady,
                  getFeatureValue: fn(),
                } as never
              }
            >
              <div className="max-w-[34rem] p-4">
                <Story />
              </div>
            </FeaturesReadyContext.Provider>
          </LogContext.Provider>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };

const meta: Meta = {
  title: 'Components/Share/AchievementShare',
};

export default meta;

type Story = StoryObj;

// Flag on: an unlocked achievement on the profile achievements tab gets a
// download + share pair next to its "Unlocked" meta line.
export const UnlockedCardWithShare: Story = {
  decorators: [withProviders(true)],
  render: () => (
    <AchievementCard
      userAchievement={buildAchievement()}
      isOwner
      shareUser={{ username: mockUser.username, name: mockUser.name }}
    />
  ),
};

// Control: identical to what ships on main today — no share, no download.
export const UnlockedCardFlagOff: Story = {
  decorators: [withProviders(false)],
  render: () => (
    <AchievementCard
      userAchievement={buildAchievement()}
      isOwner
      shareUser={{ username: mockUser.username, name: mockUser.name }}
    />
  ),
};

// Locked achievements have nothing to celebrate, so they never get the row.
export const LockedCard: Story = {
  decorators: [withProviders(true)],
  render: () => (
    <AchievementCard
      userAchievement={buildAchievement({}, false)}
      isOwner
      onTrack={fn()}
      shareUser={{ username: mockUser.username, name: mockUser.name }}
    />
  ),
};

// The labelled pair used at the peak of the unlock celebration modal.
export const CelebrationActions: Story = {
  decorators: [withProviders(true)],
  render: () => (
    <AchievementShareActions
      achievement={buildAchievement().achievement}
      username={mockUser.username}
      name={mockUser.name}
      isOwner
      withLabels
      origin={Origin.Achievements}
    />
  ),
};

// What the backend screenshot service renders at
// /image-generator/achievement/<userId>/<achievementId>.
export const ShareImageCard: Story = {
  decorators: [withProviders(true)],
  render: () => (
    <AchievementShareCard userAchievement={buildAchievement()} user={mockUser} />
  ),
};

// Rarest tier — the generated image picks up the emerald glow treatment.
export const ShareImageCardEmerald: Story = {
  decorators: [withProviders(true)],
  render: () => (
    <AchievementShareCard
      userAchievement={buildAchievement({ rarity: 0.4, name: 'Trailblazer' })}
      user={mockUser}
    />
  ),
};
