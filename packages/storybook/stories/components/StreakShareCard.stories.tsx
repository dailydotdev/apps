import type { Meta, StoryObj } from '@storybook/react-vite';
import { StreakShareCard } from '@dailydotdev/shared/src/components/streak/StreakShareCard';

// What the screenshot service renders at
// `/image-generator/streak/[userId]` once the route is wired on the backend.
const meta: Meta<typeof StreakShareCard> = {
  title: 'Components/Share/StreakShareCard',
  component: StreakShareCard,
};

export default meta;

type Story = StoryObj<typeof StreakShareCard>;

export const ShortStreak: Story = {
  args: { streak: { current: 5, max: 9, total: 24 } },
};

export const LongStreak: Story = {
  args: { streak: { current: 45, max: 45, total: 210 } },
};

export const MilestoneStreak: Story = {
  args: { streak: { current: 180, max: 180, total: 640 } },
};
