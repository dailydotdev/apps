import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { LevelHud } from '@dailydotdev/shared/src/components/quest/LevelHud';

const meta: Meta<typeof LevelHud> = {
  title: 'Components/Quest/LevelHud',
  component: LevelHud,
  args: {
    level: 14,
    levelProgress: 70,
    totalXp: 3420,
    xpInLevel: 1400,
    xpToNextLevel: 600,
    currentStreak: 12,
    longestStreak: 28,
    achievements: { unlocked: 9, total: 24 },
    isPending: false,
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof LevelHud>;

export const Default: Story = {};

export const NewPlayer: Story = {
  args: {
    level: 1,
    levelProgress: 5,
    totalXp: 40,
    xpInLevel: 25,
    xpToNextLevel: 475,
    currentStreak: 0,
    longestStreak: 0,
    achievements: { unlocked: 0, total: 24 },
  },
};

export const MaxedOutStreak: Story = {
  args: {
    level: 42,
    levelProgress: 95,
    totalXp: 128400,
    xpInLevel: 11400,
    xpToNextLevel: 600,
    currentStreak: 365,
    longestStreak: 365,
    achievements: { unlocked: 24, total: 24 },
  },
};

export const WithoutAchievements: Story = {
  args: {
    achievements: undefined,
  },
};

export const Loading: Story = {
  args: {
    isPending: true,
  },
};
