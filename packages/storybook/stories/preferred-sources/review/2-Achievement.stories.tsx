import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AchievementCard } from '@dailydotdev/shared/src/features/profile/components/achievements/AchievementCard';
import type { UserAchievement } from '@dailydotdev/shared/src/graphql/user/achievements';
import { AchievementType } from '@dailydotdev/shared/src/graphql/user/achievements';
import { ReviewProviders } from './_providers';

type Args = { state: 'locked' | 'unlocked' };

/**
 * The achievement route, using the real `AchievementCard`.
 *
 * Everything here is **backend-owned**: an `Achievement` row carries its own
 * id, name, description, image, type, points and rarity, and the API decides
 * when `unlockedAt` is stamped. The client renders whatever it is handed, so
 * there is no app code to write for this one — only a definition to create and
 * an image to host.
 *
 * The honest caveat, and the reason this is the weakest of the five: Google
 * exposes no read API, so "did they actually add us" is unknowable. The unlock
 * can only fire on our own click event, which a reader can trigger and then
 * cancel Google's dialog. Points for an unverifiable action.
 */
const achievement = {
  id: 'preferred-source-google',
  name: 'Preferred',
  description: 'Made daily.dev a preferred source on Google.',
  // Local copy so the mock-up renders. A real definition points at the hosted
  // asset — upload `packages/storybook/public/preferred-source-badge.png`.
  image: '/preferred-source-badge.png',
  type: AchievementType.Instant,
  points: 100,
  rarity: 12,
  unit: null,
};

const userAchievement = (unlocked: boolean): UserAchievement => ({
  achievement,
  progress: unlocked ? 1 : 0,
  unlockedAt: unlocked ? new Date('2026-09-07').toISOString() : null,
  createdAt: new Date('2026-09-01').toISOString(),
  updatedAt: new Date('2026-09-07').toISOString(),
});

const meta: Meta<Args> = {
  title: 'Preferred Sources/Review/2. Achievement',
  args: { state: 'unlocked' },
  argTypes: {
    state: { control: 'radio', options: ['locked', 'unlocked'] },
  },
  parameters: { layout: 'fullscreen' },
  render: ({ state }) => (
    <ReviewProviders loggedIn>
      <div className="min-h-screen bg-background-default p-8 text-text-primary">
        <div className="max-w-[22rem]">
          <AchievementCard
            userAchievement={userAchievement(state === 'unlocked')}
            isOwner
          />
        </div>
      </div>
    </ReviewProviders>
  ),
};

export default meta;

export const Unlocked: StoryObj<Args> = { args: { state: 'unlocked' } };
export const Locked: StoryObj<Args> = { args: { state: 'locked' } };
